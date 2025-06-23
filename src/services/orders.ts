import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/store/cartStore';
import { Database } from '@/database.types';
import { useQueryClient } from '@tanstack/react-query';

type OrderStatus = Database['public']['Enums']['order_status_type'];

interface CreateOrderInput {
    items: MenuItem[];
    totalAmount: number;
    deliveryFee: number;
    deliveryAddress: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
}

interface UpdateOrderStatusInput {
    orderId: string;
    status: OrderStatus;
    paymentReference?: string;
}

export function useCreateOrder() {
    return useMutation({
        mutationFn: async (input: CreateOrderInput) => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw new Error('Authentication error: ' + userError.message);
            if (!user) throw new Error('User not found');

            // Get the restaurant ID from the first item
            // Assuming all items are from the same restaurant
            const restaurantId = input.items[0]?.restaurantId;
            if (!restaurantId) throw new Error('Restaurant ID not found');

            // Format items for JSONB storage
            const formattedItems = input.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                restaurantId: item.restaurantId
            }));

            // Start a transaction
            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    restaurant_id: restaurantId,
                    items: formattedItems,
                    total_amount: input.totalAmount,
                    delivery_fee: input.deliveryFee,
                    delivery_address: input.deliveryAddress,
                    order_status: 'pending' as OrderStatus
                })
                .select()
                .single();

            if (error) {
                console.error('Order creation error:', error);
                throw new Error('Failed to create order: ' + error.message);
            }

            return data;
        }
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status, paymentReference }: UpdateOrderStatusInput) => {
            // Validate status transition
            const { data: currentOrder, error: fetchError } = await supabase
                .from('orders')
                .select('order_status, delivery_status')
                .eq('id', orderId)
                .single();

            if (fetchError) {
                throw new Error('Failed to fetch order: ' + fetchError.message);
            }

            // Validate status transition
            if (!isValidStatusTransition(currentOrder.order_status as OrderStatus, status)) {
                throw new Error(`Invalid status transition from ${currentOrder.order_status} to ${status}`);
            }

            const updateData: Record<string, any> = {
                order_status: status,
                // Reset delivery status when order is cancelled
                delivery_status: status === 'cancelled' ? null : currentOrder.delivery_status
            };

            if (paymentReference) {
                updateData.payment_reference = paymentReference;
            }

            // Create user streak if it doesn't exist
            if (status === 'confirmed') {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: existingStreak } = await supabase
                        .from('user_streaks')
                        .select('id')
                        .eq('user_id', user.id)
                        .single();

                    if (!existingStreak) {
                        await supabase
                            .from('user_streaks')
                            .insert({
                                user_id: user.id,
                                current_streak: 1,
                                highest_streak: 1,
                                last_order_date: new Date().toISOString().split('T')[0],
                                rewards_earned: 0
                            });
                    }
                }
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) {
                throw new Error('Failed to update order status: ' + error.message);
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate relevant queries based on the new status
            if (variables.status === 'confirmed') {
                queryClient.invalidateQueries({ queryKey: ['orders', 'in-progress'] });
            } else if (variables.status === 'completed') {
                queryClient.invalidateQueries({ queryKey: ['orders', 'completed'] });
                queryClient.invalidateQueries({ queryKey: ['orders', 'in-progress'] });
            } else if (variables.status === 'cancelled') {
                queryClient.invalidateQueries({ queryKey: ['orders', 'in-progress'] });
            }
        }
    });
}

export function useGetOrderByPaymentReference() {
    return useMutation({
        mutationFn: async (paymentReference: string) => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('payment_reference', paymentReference)
                .single();

            if (error) {
                throw new Error('Failed to fetch order: ' + error.message);
            }

            return data;
        }
    });
}

export function useGetInProgressOrders(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['orders', 'in-progress'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { data, error } = await supabase
                .from('orders')
                .select('*, restaurants(*)')
                .eq('user_id', user.id)
                .in('order_status', ['confirmed', 'preparing', 'ready'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: options?.enabled
    });
}

export function useGetCompletedOrders(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['orders', 'completed'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { data, error } = await supabase
                .from('orders')
                .select('*, restaurants(*)')
                .eq('user_id', user.id)
                .eq('order_status', 'completed')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: options?.enabled
    });
}

// Helper function to validate order status transitions
function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        'pending': ['confirmed', 'cancelled', 'payment_pending'],
        'payment_pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
}
