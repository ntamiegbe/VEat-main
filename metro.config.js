const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
    wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolution for Firebase subpath exports
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    // Add Node.js core module polyfills
    stream: require.resolve('stream-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    zlib: require.resolve('browserify-zlib'),
    util: require.resolve('util/'),
    crypto: require.resolve('crypto-browserify'),
    // Map ws to our shim
    ws: path.resolve(__dirname, 'websocket-shim.js')
};

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