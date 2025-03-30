import "../../global.css";
import { Slot, SplashScreen, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { FontProvider } from "@/providers/FontProvider";
import { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";

/**
 * Root Layout is the highest-level layout in the app, wrapping all other layouts and screens.
 * It provides:
 * 1. Gesture handling support for the entire app
 * 2. Global styles and configurations
 * 3. Font loading for consistent typography
 *
 * This layout affects every screen in the app, including both authenticated
 * and unauthenticated routes.
 */

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function Root() {
  const [initialized, setInitialized] = useState(false);

  // Prepare the app
  const onLayoutRootView = useCallback(async () => {
    if (initialized) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [initialized]);

  // Initialize the app
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        // Artificial delay to ensure navigation is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setInitialized(true);
      }
    }

    prepare();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <FontProvider>
          <GestureHandlerRootView
            style={{ flex: 1 }}
            onLayout={onLayoutRootView}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
          </GestureHandlerRootView>
        </FontProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
