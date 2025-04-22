import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    message: string;
    isVisible: boolean;
    type?: ToastType;
    icon?: React.ReactNode;
}

export function useToast(duration = 3000) {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        isVisible: false,
        type: 'info',
        icon: undefined,
    });

    const showToast = useCallback((message: string, icon?: React.ReactNode) => {
        setToast({ message, isVisible: true, type: 'info', icon });

        // Auto hide after duration
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, duration);
    }, [duration]);

    const showSuccess = useCallback((message: string) => {
        setToast({
            message,
            isVisible: true,
            type: 'success',
            icon: undefined
        });

        // Auto hide after duration
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, duration);
    }, [duration]);

    const showError = useCallback((message: string) => {
        setToast({
            message,
            isVisible: true,
            type: 'error',
            icon: undefined
        });

        // Auto hide after duration
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, duration);
    }, [duration]);

    const showInfo = useCallback((message: string) => {
        setToast({
            message,
            isVisible: true,
            type: 'info',
            icon: undefined
        });

        // Auto hide after duration
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, duration);
    }, [duration]);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        ...toast,
        showToast,
        showSuccess,
        showError,
        showInfo,
        hideToast,
    };
} 