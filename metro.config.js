const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
    wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolution for Firebase subpath exports
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
};

// Export with both NativeWind and Reanimated configurations
module.exports = wrapWithReanimatedMetroConfig(
    withNativeWind(config, { input: "./global.css" })
);