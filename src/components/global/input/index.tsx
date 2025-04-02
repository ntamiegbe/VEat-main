/* eslint-disable max-lines-per-function */
import React, { useEffect, useState, useRef } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Pressable, Text, View, Animated } from 'react-native';
import type { TextInputProps } from 'react-native-paper';
import { ProgressBar, TextInput } from 'react-native-paper';

import { cn, numberWithCommas } from '@/core/utils';

export type InputProps = {
  label?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  rules?: Array<keyof ValidationRules>;
  placeholder?: string;
  name: string;
  pattern?: string;
  min?: number;
  max?: number;
  isLoading?: boolean;
  type?:
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'date'
  | 'time'
  | 'search'
  | 'quantity'
  | 'amount';
  onChange?: (text: string) => void;
  handleOnFocus?: () => void;
  handleOnBlur?: () => void;
} & Pick<
  TextInputProps,
  | 'textContentType'
  | 'secureTextEntry'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'style'
  | 'editable'
  | 'multiline'
  | 'keyboardType'
  | 'focusable'
  | 'onFocus'
  | 'onPressIn'
  | 'inputMode'
  | 'pointerEvents'
>;

type ValidationResult = boolean | string;

export type ValidationRules = {
  email: (value: string, label?: string) => ValidationResult;
  required: (value: string, label?: string) => ValidationResult;
  phone: (value: string, label?: string) => ValidationResult;
  password: (value: string, label?: string) => ValidationResult;
  confirmPassword: (value: string, label?: string) => ValidationResult;
};

const Input = ({
  label,
  name,
  rules = [],
  max,
  min,
  pattern,
  left,
  right,
  keyboardType,
  autoCapitalize = 'none',
  className,
  isLoading = false,
  placeholder,
  secureTextEntry = false,
  disabled = false,
  readOnly = false,
  type = 'text',
  onChange,
  handleOnFocus,
  handleOnBlur,
  inputMode,
  multiline,
}: InputProps) => {
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const [isPassword, setIsPassword] = useState(secureTextEntry);
  const [labelSize, setLabelSize] = useState(14);

  // Animation for floating label
  const floatingLabelPos = useRef(new Animated.Value(0)).current;

  const [passwordCheck, setPasswordCheck] = useState({
    lowercase: {
      checked: false,
      message: 'a letter',
    },
    number: {
      checked: false,
      message: 'a number',
    },
    length: {
      checked: false,
      message: '8 characters',
    },
  });

  const { field } = useController({
    name,
  });

  const methods = useFormContext();

  const {
    watch,
    formState: { errors },
  } = methods;

  const error = errors[name];

  // Handle label animation based on focus and content
  useEffect(() => {
    if (inputIsFocused || field.value) {
      Animated.timing(floatingLabelPos, {
        toValue: -12,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setLabelSize(10);
    } else {
      Animated.timing(floatingLabelPos, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setLabelSize(14);
    }
  }, [inputIsFocused, field.value, floatingLabelPos]);

  const togglePasswordVisibility = () => {
    setIsPassword(!isPassword);
  };

  const watchPassword =
    methods.watch('password') || methods.watch('newPassword') || '';

  useEffect(() => {
    setPasswordCheck({
      ...passwordCheck,
      lowercase: {
        ...passwordCheck.lowercase,
        checked: /[a-z]/g.test(watchPassword),
      },
      number: {
        ...passwordCheck.number,
        checked: /[0-9]/g.test(watchPassword),
      },
      length: {
        ...passwordCheck.length,
        checked: watchPassword?.length >= 8,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchPassword]);

  const validationRules: ValidationRules = {
    required: (value) => {
      if (value !== null && value !== undefined && value !== '') {
        return true;
      } else {
        return `The ${label} field is required`;
      }
    },
    email: (value) => {
      const match = value
        .toString()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      return match ? true : `The ${label} field has to be a valid email`;
    },
    password: (value) => {
      const messages: string[] = [];

      if (!/[a-z]/g.test(value)) {
        messages.push('a letter');
      }
      if (!/[0-9]/g.test(value)) {
        messages.push('a number');
      }
      if (value.length < 8) {
        messages.push('at least 8 characters');
      }

      const message =
        messages.length > 1
          ? `${messages.slice(0, -1).join(', ')} and ${messages.slice(-1)}`
          : `${messages.join(', ')}`;
      return messages.length > 0
        ? `The ${label} field must have ${message}`
        : true;
    },
    phone: (value) => {
      return value.length === 11
        ? true
        : `The ${label} field must be equal to 11 digits`;
    },
    confirmPassword: (value) => {
      return value === watch('password') || value === watch('newPassword')
        ? true
        : `The ${label} field must be equal to the Password field`;
    },
  };

  const computedRules = rules.reduce<{
    [index: string]: (param: string) => ValidationResult;
  }>((map, key) => {
    map[key] = (value) => validationRules[key](value, label || name);
    return map;
  }, {});

  const register = methods.register(name, {
    validate: computedRules,
    pattern: pattern
      ? {
        value: new RegExp(pattern),
        message: `The ${label || name
          } field doesn't satisfy the regex ${pattern}`,
      }
      : undefined,
    min: min
      ? {
        value: min,
        message: `The ${label || name
          } field must be greater than or equal to ${numberWithCommas(min)}`,
      }
      : undefined,
    max: max
      ? {
        value: max,
        message: `The ${label || name
          } field must be less than or equal to ${numberWithCommas(max)}`,
      }
      : undefined,
  });

  return (
    <View className={cn(className)}>
      <View className="relative">
        <View className="absolute top-1/2 z-50 -translate-y-1/2">
          {left}
        </View>

        {/* Floating Label */}
        {label && (
          <Animated.Text
            className={cn(
              "absolute left-4 z-10",
              inputIsFocused || field.value ? "text-secondary-subtext" : "text-secondary-subtext"
            )}
            style={{
              top: 20,
              transform: [{ translateY: floatingLabelPos }],
              fontSize: labelSize,
            }}
          >
            {label}
          </Animated.Text>
        )}

        <TextInput
          {...register}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          value={field.value}
          placeholder={inputIsFocused ? placeholder : ""}
          disabled={disabled || readOnly}
          secureTextEntry={isPassword}
          className="px-4 mt-1"
          style={{ height: 54, backgroundColor: "#FFFFFF" }}
          outlineColor="#D0D2D5"
          placeholderTextColor="#5E5E5E"
          inputMode={inputMode}
          mode="outlined"
          textColor="#000000"
          outlineStyle={{
            borderRadius: 8,
            borderWidth: inputIsFocused ? 1 : 0.4,
          }}
          activeOutlineColor={error?.message ? "#EF4444" : "#444444"}
          onChangeText={(text) => {
            const computedText =
              type === 'amount'
                ? numberWithCommas(text?.replace(/[^0-9.]/g, ''))
                : text;
            field.onChange(computedText);
            onChange && onChange(computedText);
          }}
          onFocus={() => {
            handleOnFocus && handleOnFocus();
            setInputIsFocused(true);
          }}
          onBlur={() => {
            handleOnBlur && handleOnBlur();
            setInputIsFocused(false);
          }}
          multiline={multiline}
        />

        <View className="absolute right-0 top-1/2 z-50 -translate-y-1/2">
          {right}
        </View>

        {type === 'amount' && (
          <View className="absolute right-4 top-1/2 -translate-y-1/2 rounded-[40px] border border-orange-600 px-3.5 py-1 dark:border-yellow-600">
            <Text className="font-medium text-xs text-secondary-subtext">
              NGN
            </Text>
          </View>
        )}

        {secureTextEntry && (
          <Pressable
            android_ripple={{
              color: 'rgba(200, 200, 200, 0.5)',
              borderless: true,
              radius: 20,
            }}
            onPress={togglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Text className="text-[14px] font-medium text-secondary-subtext">
              {!isPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}

        {isLoading && (
          <ProgressBar className="absolute -top-0.5" indeterminate />
        )}
      </View>

      {!rules.includes('password') && error?.message && (
        <View className="mt-2 flex-row items-center gap-x-1">
          <Text className="flex-1 text-left text-xs text-red-700">
            {error?.message as string}
          </Text>
        </View>
      )}

      {rules.includes('password') && (
        <View className="mt-2">
          <Text className="text-xs text-secondary-subtext">
            At least{' '}
            <Text
              className={cn(
                "font-bold",
                { "line-through": passwordCheck.length.checked }
              )}
            >
              8 characters
            </Text>
            , containing{' '}
            <Text
              className={cn(
                "font-bold",
                { "line-through": passwordCheck.lowercase.checked }
              )}
            >
              a letter
            </Text>
            {' '}and{' '}
            <Text
              className={cn(
                "font-bold",
                { "line-through": passwordCheck.number.checked }
              )}
            >
              a number
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
};

export default Input;
