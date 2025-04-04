import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

interface ToastState {
    message: string;
    isVisible: boolean;
    icon?: React.ReactNode;
    type?: ToastType;
}

export function useToast(duration = 3000) {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        isVisible: false,
        icon: undefined,
        type: 'success',
    });

    const showToast = useCallback((
        message: string,
        options?: {
            icon?: React.ReactNode;
            type?: ToastType;
        }
    ) => {
        setToast({
            message,
            isVisible: true,
            icon: options?.icon,
            type: options?.type || 'success'
        });

        // Auto hide after duration
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, duration);
    }, [duration]);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    // Convenience methods for different toast types
    const showSuccess = useCallback((message: string, icon?: React.ReactNode) => {
        showToast(message, { type: 'success', icon });
    }, [showToast]);

    const showWarning = useCallback((message: string, icon?: React.ReactNode) => {
        showToast(message, { type: 'warning', icon });
    }, [showToast]);

    const showError = useCallback((message: string, icon?: React.ReactNode) => {
        showToast(message, { type: 'error', icon });
    }, [showToast]);

    return {
        ...toast,
        showToast,
        hideToast,
        showSuccess,
        showWarning,
        showError
    };
} 