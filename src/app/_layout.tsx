import React, { useEffect } from "react";
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
  useEffect(() => {
    // Hide the splash screen after a short delay
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 1000);
  }, []);

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
