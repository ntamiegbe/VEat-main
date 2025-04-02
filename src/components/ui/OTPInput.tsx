import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Keyboard} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

interface OTPInputProps {
    length: number;
    value: string[];
    onChange: (otp: string[]) => void;
    onComplete?: (otp: string) => void;
    autoFocus?: boolean;
    isError?: boolean;
    isLoading?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
    length = 4,
    value,
    onChange,
    onComplete,
    autoFocus = false,
    isError = false,
    isLoading = false,
}) => {
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Auto focus on the first input if autoFocus is true
        if (autoFocus && inputRefs.current[0]) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [autoFocus]);

    const handleChange = (text: string, index: number) => {
        // Only allow digits
        if (!/^\d*$/.test(text)) return;

        const newOtp = [...value];
        newOtp[index] = text.slice(-1); // Only take the last character if multiple are pasted
        onChange(newOtp);

        // Auto-advance to next input if a digit was entered
        if (text && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
            setCurrentIndex(index + 1);
        }

        // If all digits are filled, call onComplete
        if (index === length - 1 && text) {
            const otpString = [...newOtp.slice(0, length - 1), text].join('');
            onComplete?.(otpString);
            Keyboard.dismiss();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            setCurrentIndex(index - 1);
        }
    };

    const handleBoxPress = (index: number) => {
        inputRefs.current[index]?.focus();
        setCurrentIndex(index);
    };

    return (
        <View className="flex-row justify-start items-center w-full" style={{ gap: 16 }}>
            {Array(length)
                .fill(0)
                .map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => handleBoxPress(index)}
                        style={{ width: 52, height: 52 }}
                    >
                        <TextInput
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={{ width: 52, height: 52 }}
                            className={`border rounded-lg text-center text-2xl text-tc-primary
                                ${currentIndex === index ? 'border-[#050505] border-[1px]' : 'border-secondary-stroke'}
                                ${isError ? 'border-red-500' : ''}
                                ${value[index] ? 'border-secondary-stroke' : ''}`}
                            value={value[index]}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            caretHidden
                        />
                    </TouchableOpacity>
                ))}
            {isLoading && (
                <ActivityIndicator size="small" color="#34AA87" />
            )}
        </View>
    );
};

export default OTPInput; 