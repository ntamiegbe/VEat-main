import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { Restaurant } from '@/types';
import { useRestaurants } from '@/services/resturants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, index }) => {

  return (
    <AnimatedTouchableOpacity
      entering={FadeInUp.delay(index * 100).springify()}
      exiting={FadeOut}
      style={styles.card}
      onPress={() => {}}
    >
      {restaurant.banner_url && (
        <Image
          source={{ uri: restaurant.banner_url }}
          style={styles.banner}
          resizeMode="cover"
        />
      )}
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          {restaurant.logo_url && (
            <Image
              source={{ uri: restaurant.logo_url }}
              style={styles.logo}
              resizeMode="cover"
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.name}>{restaurant.name}</Text>
            {restaurant.description && (
              <Text style={styles.description} numberOfLines={2}>
                {restaurant.description}
              </Text>
            )}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Rating</Text>
                <Text style={styles.statValue}>
                  {restaurant.average_rating?.toFixed(1) || 'New'}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Prep Time</Text>
                <Text style={styles.statValue}>
                  {restaurant.average_preparation_time}min
                </Text>
              </View>
              {restaurant.minimum_order_amount != null && restaurant.minimum_order_amount > 0 && (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Min Order</Text>
                  <Text style={styles.statValue}>
                    ₦{restaurant.minimum_order_amount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {restaurant.is_featured && (
          <View style={styles.featuredTag}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>
    </AnimatedTouchableOpacity>
  );
};

const RestaurantsScreen: React.FC = () => {
  const { data: restaurants, isLoading, error, refetch } = useRestaurants();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={restaurants}
      renderItem={({ item, index }) => (
        <RestaurantCard restaurant={item} index={index} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default RestaurantsScreen

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  infoContainer: {
    flexDirection: 'row',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  stat: {
    marginRight: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
});