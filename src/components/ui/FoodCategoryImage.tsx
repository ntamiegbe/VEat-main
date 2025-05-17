import React, { useState } from 'react';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface FoodCategoryImageProps {
    imageUrl: string;
    name: string;
    size?: number;
}

const FoodCategoryImage: React.FC<FoodCategoryImageProps> = ({
    imageUrl,
    name,
    size = 80
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const isSvg = imageUrl?.toLowerCase?.()?.endsWith('.svg');

    const renderPlaceholder = () => (
        <View className={`bg-gray-100 rounded-full justify-center items-center border border-gray-200`} style={{ width: size, height: size }}>
            <Text className="text-2xl font-bold text-gray-400">
                {name.charAt(0).toUpperCase()}
            </Text>
        </View>
    );

    if (!imageUrl || hasError) {
        return renderPlaceholder();
    }

    if (isSvg) {
        return (
            <View className={`bg-white rounded-full overflow-hiddenjustify-center items-center`} style={{ width: size, height: size }}>
                {isLoading && <ActivityIndicator className="absolute" color="#008751" />}
                <SvgUri
                    width={size}
                    height={size}
                    uri={imageUrl}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                />
            </View>
        );
    }

    return (
        <View className={`bg-white rounded-full overflow-hiddenjustify-center items-center`} style={{ width: size, height: size }}>
            {isLoading && <ActivityIndicator className="absolute" color="#008751" />}
            <Image
                source={{ uri: imageUrl }}
                style={{ width: size, height: size }}
                resizeMode="contain"
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
            />
        </View>
    );
};

export default FoodCategoryImage; 