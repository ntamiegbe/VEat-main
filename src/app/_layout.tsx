import React, { useEffect, useState } from "react";
import "../../global.css";
import { Slot, SplashScreen, Stack } from "expo-router";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { FontProvider } from "@/providers/FontProvider";

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

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Root() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Prepare the app and ensure all providers are ready
    async function prepare() {
      try {
        // Artificial delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Any other initialization can go here
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // When everything is ready, hide the splash screen and show the app
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Don't render anything until the app is ready
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <FontProvider>
          <Slot />
        </FontProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
