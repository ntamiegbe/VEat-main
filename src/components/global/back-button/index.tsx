import React from 'react'
import { TouchableOpacity } from 'react-native'
import { router } from 'expo-router';
import BackIcon from '@assets/icons/BackIcon.svg';

const BackButton = () => {
    return (
        <TouchableOpacity
            className="bg-background-input size-12 rounded-full items-center justify-center"
            onPress={() => router.back()}
        >
            <BackIcon />
        </TouchableOpacity>
    )
}

export default BackButton