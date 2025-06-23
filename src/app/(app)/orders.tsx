import React, { useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '@/components/ui/Text';
import { OrderTabs } from '@/components/orders/OrderTabs';
import { EmptyState } from '@/components/orders/EmptyState';
import { useCartStore } from '@/store/cartStore';
import { RestaurantCartGroup } from '@/components/orders/RestaurantCartGroup';
import Button from '@/components/global/button';
import { Database } from '@/database.types';
import { useGetCompletedOrders, useGetInProgressOrders } from '@/services/orders';

type TabType = 'cart' | 'in-progress' | 'completed';
type Order = Database['public']['Tables']['orders']['Row'];

interface OrderWithRestaurant extends Order {
  restaurants: {
    id: string;
    name: string;
    address: string;
    logo_url: string | null;
    banner_url: string | null;
    owner_id: string;
    phone_number: string;
    email: string | null;
    description: string | null;
    cuisine_types: string[] | null;
    opening_hours: any;
    is_active: boolean | null;
    is_featured: boolean | null;
    can_deliver: boolean | null;
    delivery_radius: number | null;
    minimum_order_amount: number | null;
    average_rating: number | null;
    total_orders: number | null;
    average_preparation_time: number | null;
    location_id: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;
}

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('cart');
  const { items, getRestaurantGroups, clearCart } = useCartStore();
  const restaurantGroups = getRestaurantGroups();
  const { tab } = useLocalSearchParams<{ tab: TabType }>();

  // Handle tab param to show correct tab
  useEffect(() => {
    if (tab && (tab === 'in-progress' || tab === 'completed' || tab === 'cart')) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Fetch orders using the new service functions with enabled flag
  const {
    data: inProgressOrders,
    isLoading: isLoadingInProgress
  } = useGetInProgressOrders({
    enabled: activeTab === 'in-progress'
  });

  const {
    data: completedOrders,
    isLoading: isLoadingCompleted
  } = useGetCompletedOrders({
    enabled: activeTab === 'completed'
  });

  const renderCartContent = () => {
    if (items.length === 0) {
      return <EmptyState type="cart" />;
    }

    return (
      <View className="px-4">
        <View className="border border-secondary-divider rounded-lg my-4">
          {Object.entries(restaurantGroups).map(([restaurantId, items]) => (
            <RestaurantCartGroup
              key={restaurantId}
              restaurantId={restaurantId}
              restaurantName={items[0].restaurantName}
              items={items}
              restaurantLogo={items[0].restaurantLogo}
            />
          ))}

          {/* Bottom Actions */}
          <View className="px-4 py-3">
            <Button onPress={() => router.push('/checkout')}>
              Checkout
            </Button>
            <TouchableOpacity
              onPress={clearCart}
              className="mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-accent-error text-center">Clear selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderCard = (order: OrderWithRestaurant) => (
    <View className="border border-secondary-divider rounded-lg p-4 mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text weight="medium" className="text-lg">
          Order #{order.id.split('-')[0]}
        </Text>
        <Text className="text-secondary-text capitalize">
          {order.order_status}
        </Text>
      </View>

      <View className="mb-2">
        <Text weight="medium">{order.restaurants?.name}</Text>
        <Text className="text-secondary-text">
          {order.items.length} items • ${order.total_amount}
        </Text>
      </View>

      {order.delivery_address && (
        <View>
          <Text weight="medium">Delivery Address</Text>
          <Text className="text-secondary-text">
            {order.delivery_address.address}
          </Text>
        </View>
      )}
    </View>
  );

  const renderInProgressContent = () => {
    if (isLoadingInProgress) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Loading orders...</Text>
        </View>
      );
    }

    if (!inProgressOrders || inProgressOrders.length === 0) {
      return <EmptyState type="in-progress" />;
    }

    return (
      <FlatList
        data={inProgressOrders as OrderWithRestaurant[]}
        renderItem={({ item }) => renderOrderCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4"
      />
    );
  };

  const renderCompletedContent = () => {
    if (isLoadingCompleted) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Loading orders...</Text>
        </View>
      );
    }

    if (!completedOrders || completedOrders.length === 0) {
      return <EmptyState type="completed" />;
    }

    return (
      <FlatList
        data={completedOrders as OrderWithRestaurant[]}
        renderItem={({ item }) => renderOrderCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4"
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cart':
        return renderCartContent();
      case 'in-progress':
        return renderInProgressContent();
      case 'completed':
        return renderCompletedContent();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4">
        <Text weight="bold" className="text-2xl">
          Orders
        </Text>
      </View>

      {/* Tab Navigation */}
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <View className="border-t-2 border-secondary-divider" />

      {/* Content Area */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;