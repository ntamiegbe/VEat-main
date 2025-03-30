import "../../global.css";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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

export default function Root() {
  return (
    <QueryProvider>
      <AuthProvider>
        <FontProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {/* 
            GestureHandlerRootView is required for:
            - Drawer navigation gestures
            - Swipe gestures
            - Other gesture-based interactions
            Must wrap the entire app to function properly
          */}
            {/* 
            Slot renders child routes dynamically
            This includes both (app) and (auth) group routes
          */}
            <Slot />
          </GestureHandlerRootView>
        </FontProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
