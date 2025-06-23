import React from 'react'
import { TouchableOpacity } from 'react-native'
import { router } from 'expo-router';
import BackIcon from '@assets/icons/BackIcon.svg';

interface BackButtonProps {
    onPress?: () => void;
}

const BackButton = ({ onPress }: BackButtonProps) => {
    return (
        <TouchableOpacity
            className="bg-background-input size-12 rounded-full items-center justify-center"
            onPress={onPress || (() => router.back())}
        >
            <BackIcon />
        </TouchableOpacity>
    )
}

export default BackButton