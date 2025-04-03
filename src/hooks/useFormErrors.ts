import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormError {
    field: string;
    message: string;
}

interface UseFormErrorsProps {
    form: UseFormReturn<any>;
}

export const useFormErrors = ({ form }: UseFormErrorsProps) => {
    const [errors, setErrors] = useState<FormError[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    const clearErrors = useCallback(() => {
        setErrors([]);
        setIsVisible(false);
    }, []);

    const setFieldError = useCallback((field: string, message: string) => {
        setErrors(prev => [...prev, { field, message }]);
        setIsVisible(true);
        form.setError(field, { type: 'manual', message });
    }, [form]);

    const validateForm = useCallback(async () => {
        const isValid = await form.trigger();
        if (!isValid) {
            const formErrors = Object.entries(form.formState.errors).map(([field, error]: [string, any]) => ({
                field,
                message: error.message || `${field} is required`
            }));
            setErrors(formErrors);
            setIsVisible(true);
        } else {
            clearErrors();
        }
        return isValid;
    }, [form, clearErrors]);

    return {
        errors,
        isVisible,
        clearErrors,
        setFieldError,
        validateForm,
        setIsVisible
    };
}; 