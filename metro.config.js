const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
    wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Block the problematic ws package
config.resolver.blockList = [
    /\/node_modules\/ws\/.*/
];

const { transformer, resolver } = config;

config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
};
config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
};


// Export with both NativeWind and Reanimated configurations
module.exports = wrapWithReanimatedMetroConfig(
    withNativeWind(config, { input: "./global.css" })
);