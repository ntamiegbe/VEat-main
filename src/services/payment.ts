import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Database } from '@/database.types';

type OrderStatus = Database['public']['Enums']['order_status_type'];

interface PaystackInitResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

interface InitiatePaymentInput {
    amount: number;
    email: string;
    orderId: string;
}

export function useInitiatePayment() {
    return useMutation({
        mutationFn: async ({ amount, email, orderId }: InitiatePaymentInput) => {
            try {
                // Generate a unique reference
                const reference = `veat_${Date.now()}_${Math.random().toString(36).substring(2)}`;

                // Update order status to payment_pending
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({
                        order_status: 'payment_pending' as OrderStatus,
                        payment_reference: reference
                    })
                    .eq('id', orderId);

                if (updateError) {
                    throw new Error('Failed to update order status: ' + updateError.message);
                }

                // Initialize payment through our Edge Function
                const { data: initData, error: initError } = await supabase.functions.invoke<PaystackInitResponse>(
                    'initialize-payment',
                    {
                        body: {
                            email,
                            amount,
                            reference,
                            orderId, // Pass orderId to track in webhook
                        },
                    }
                );

                if (initError || !initData) {
                    // If payment initialization fails, revert order status
                    await supabase
                        .from('orders')
                        .update({
                            order_status: 'pending' as OrderStatus,
                            payment_reference: null
                        })
                        .eq('id', orderId);

                    throw new Error(initError?.message || 'Failed to initialize payment');
                }

                // Navigate to payment screen with WebView
                router.push({
                    pathname: '/(app)/payment',
                    params: {
                        paymentUrl: encodeURIComponent(initData.data.authorization_url),
                        reference,
                        orderId
                    }
                });

                return {
                    reference,
                    status: 'pending'
                };
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        }
    });
} 