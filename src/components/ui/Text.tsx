import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

type FontWeight = 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'bold' | 'extrabold';

interface CustomTextProps extends TextProps {
    weight?: FontWeight;
}

/**
 * Custom Text component that automatically applies the Banana Grotesk font family.
 * Use this component instead of the default React Native Text component for consistent typography.
 */
export const Text = ({ weight = 'regular', style, children, ...props }: CustomTextProps) => {
    const fontFamily = {
        thin: 'BananaGrotesk-Thin',
        extralight: 'BananaGrotesk-ExtraLight',
        light: 'BananaGrotesk-Light',
        regular: 'BananaGrotesk-Regular',
        medium: 'BananaGrotesk-Medium',
        bold: 'BananaGrotesk-Bold',
        extrabold: 'BananaGrotesk-ExtraBold',
    }[weight];

    return (
        <RNText style={[{ fontFamily }, style]} {...props}>
            {children}
        </RNText>
    );
};

export default Text; 