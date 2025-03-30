import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';

type FontContextType = {
    fontsLoaded: boolean;
};

const FontContext = createContext<FontContextType>({ fontsLoaded: false });

export const useFonts = () => useContext(FontContext);

export const FontProvider = ({ children }: { children: React.ReactNode }) => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const loadFonts = async () => {
            try {
                await Font.loadAsync({
                    'BananaGrotesk-Thin': require('../../assets/fonts/banana-grotesk-thin.otf'),
                    'BananaGrotesk-ExtraLight': require('../../assets/fonts/banana-grotesk-extralight.otf'),
                    'BananaGrotesk-Light': require('../../assets/fonts/banana-grotesk-light.otf'),
                    'BananaGrotesk-Regular': require('../../assets/fonts/banana-grotesk-regular.otf'),
                    'BananaGrotesk-Medium': require('../../assets/fonts/banana-grotesk-medium.otf'),
                    'BananaGrotesk-Bold': require('../../assets/fonts/banana-grotesk-bold.otf'),
                    'BananaGrotesk-ExtraBold': require('../../assets/fonts/banana-grotesk-extrabold.otf'),
                });
                setFontsLoaded(true);
            } catch (error) {
                console.error('Error loading fonts:', error);
            }
        };

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#008751" />
                <Text style={{ marginTop: 10 }}>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <FontContext.Provider value={{ fontsLoaded }}>
            {children}
        </FontContext.Provider>
    );
}; 