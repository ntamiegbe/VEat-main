import { StyleSheet } from 'react-native';

/**
 * Typography styles for consistent font usage across the application
 * Use these styles with the StyleSheet.compose() method to extend them
 */
export const typography = StyleSheet.create({
    // Headings
    h1: {
        fontFamily: 'BananaGrotesk-Bold',
        fontSize: 32,
        lineHeight: 38,
    },
    h2: {
        fontFamily: 'BananaGrotesk-Bold',
        fontSize: 28,
        lineHeight: 34,
    },
    h3: {
        fontFamily: 'BananaGrotesk-Bold',
        fontSize: 24,
        lineHeight: 30,
    },
    h4: {
        fontFamily: 'BananaGrotesk-Bold',
        fontSize: 20,
        lineHeight: 26,
    },
    h5: {
        fontFamily: 'BananaGrotesk-Bold',
        fontSize: 18,
        lineHeight: 24,
    },
    h6: {
        fontFamily: 'BananaGrotesk-Bold',
        fontSize: 16,
        lineHeight: 22,
    },

    // Body text
    bodyLarge: {
        fontFamily: 'BananaGrotesk-Regular',
        fontSize: 18,
        lineHeight: 26,
    },
    bodyMedium: {
        fontFamily: 'BananaGrotesk-Regular',
        fontSize: 16,
        lineHeight: 24,
    },
    bodySmall: {
        fontFamily: 'BananaGrotesk-Regular',
        fontSize: 14,
        lineHeight: 20,
    },

    // Button text
    buttonLarge: {
        fontFamily: 'BananaGrotesk-Medium',
        fontSize: 18,
        lineHeight: 26,
    },
    buttonMedium: {
        fontFamily: 'BananaGrotesk-Medium',
        fontSize: 16,
        lineHeight: 24,
    },
    buttonSmall: {
        fontFamily: 'BananaGrotesk-Medium',
        fontSize: 14,
        lineHeight: 20,
    },

    // Caption text
    caption: {
        fontFamily: 'BananaGrotesk-Regular',
        fontSize: 12,
        lineHeight: 16,
    },

    // Font weights
    thin: {
        fontFamily: 'BananaGrotesk-Thin',
    },
    extralight: {
        fontFamily: 'BananaGrotesk-ExtraLight',
    },
    light: {
        fontFamily: 'BananaGrotesk-Light',
    },
    regular: {
        fontFamily: 'BananaGrotesk-Regular',
    },
    medium: {
        fontFamily: 'BananaGrotesk-Medium',
    },
    bold: {
        fontFamily: 'BananaGrotesk-Bold',
    },
    extrabold: {
        fontFamily: 'BananaGrotesk-ExtraBold',
    },
}); 