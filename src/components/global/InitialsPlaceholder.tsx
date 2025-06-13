import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { getBrandOrPastelColor, getInitials } from '@/utils/displayHelpers';

type InitialsPlaceholderProps = {
    name: string;
    id?: string;
    size?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
    borderRadius?: number;
};

/**
 * A component to display a placeholder with initials on a colored background
 * when images are not available or still loading
 */
export const InitialsPlaceholder: React.FC<InitialsPlaceholderProps> = ({
    name,
    id = '',
    size = 70,
    style,
    textStyle,
    borderRadius,
}) => {
    // Get background color and initials
    const backgroundColor = getBrandOrPastelColor(name, id);
    const initials = getInitials(name);

    // Calculate font size (40% of container size)
    const fontSize = Math.floor(size * 0.4);

    // Use explicit border radius or default to circular (half of size)
    const radius = borderRadius !== undefined ? borderRadius : size / 2;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor,
                    width: size,
                    height: size,
                    borderRadius: radius,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { fontSize },
                    textStyle,
                ]}
            >
                {initials}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    },
}); 