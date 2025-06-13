import React from 'react';
import { SafeAreaView, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import { OrderTabs } from '@/components/orders/OrderTabs';
import { EmptyState } from '@/components/orders/EmptyState';
import { useCartStore } from '@/store/cartStore';
import { RestaurantCartGroup } from '@/components/orders/RestaurantCartGroup';
import Button from '@/components/global/button';

type TabType = 'cart' | 'in-progress' | 'completed';

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('cart');
  const { items, getRestaurantGroups, clearCart } = useCartStore();
  const restaurantGroups = getRestaurantGroups();

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

  const renderInProgressContent = () => {
    return <EmptyState type="in-progress" />;
  };

  const renderCompletedContent = () => {
    return <EmptyState type="completed" />;
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