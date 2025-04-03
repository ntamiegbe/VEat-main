import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import Text from '@/components/ui/Text';
import Input from '@/components/global/input';
import DatePicker from '@/components/global/date-picker';
import CalendarIcon from '@assets/icons/CalendarIcon.svg';

interface ProfileFormProps {
    form: UseFormReturn<any>;
    isGoogleUser: boolean;
    birthdate: Date | null;
    showDatePicker: boolean;
    onDateSelect: (date: Date) => void;
    onOpenDatePicker: () => void;
    onCloseDatePicker: () => void;
    formatDate: (date: Date | null) => string;
    birthdateError: string | null;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
    form,
    isGoogleUser,
    birthdate,
    showDatePicker,
    onDateSelect,
    onOpenDatePicker,
    onCloseDatePicker,
    formatDate,
    birthdateError
}) => {
    return (
        <>
            <Text className="text-tc-primary text-[22px] font-medium mb-6">You're almost done!</Text>
            <Text weight="regular" className="text-secondary-subtext text-sm mb-6">Let's get to meet you</Text>

            {/* Full Name */}
            <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                    <Input
                        name="firstName"
                        label="First name"
                        rules={['required']}
                        editable={!isGoogleUser}
                    />
                </View>

                <View className="flex-1">
                    <Input
                        name="lastName"
                        label="Last name"
                        editable={!isGoogleUser}
                    />
                </View>
            </View>

            {/* Phone Number */}
            <View className="mb-6">
                <Input
                    name="phoneNumber"
                    label="Phone number"
                    rules={['required', 'phone']}
                    keyboardType="phone-pad"
                />
            </View>

            {/* Date of Birth */}
            <View className="mb-6">
                <TouchableOpacity
                    className="h-14 border border-gray-200 rounded-lg px-4 flex-row items-center justify-between bg-white"
                    onPress={onOpenDatePicker}
                    activeOpacity={0.7}
                >
                    <Text className={birthdate ? 'text-gray-900' : 'text-gray-400'}>
                        {birthdate ? formatDate(birthdate) : 'Birthday'}
                    </Text>
                    <CalendarIcon />
                </TouchableOpacity>
                {birthdateError && (
                    <Text className="text-red-500 text-xs mt-1">{birthdateError}</Text>
                )}
            </View>

            {/* Password - Required for all users */}
            <View className="mb-6">
                <Input
                    name="password"
                    label={isGoogleUser ? "Password (Required for Google users)" : "Password"}
                    rules={['required', 'password']}
                    secureTextEntry
                />
            </View>

            {/* Date Picker */}
            <DatePicker
                value={birthdate}
                onChange={onDateSelect}
                onClose={onCloseDatePicker}
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
                visible={showDatePicker}
            />
        </>
    );
}; 