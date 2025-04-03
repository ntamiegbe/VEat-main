import { useState, useCallback } from 'react';

interface ToastState {
    message: string;
    isVisible: boolean;
    icon?: React.ReactNode;
}

export function useToast(duration = 3000) {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        isVisible: false,
        icon: undefined,
    });

    const showToast = useCallback((message: string, icon?: React.ReactNode) => {
        setToast({ message, isVisible: true, icon });

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
        hideToast,
    };
} 