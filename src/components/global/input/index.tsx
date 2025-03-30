/* eslint-disable max-lines-per-function */
import { Danger, Eye, EyeSlash } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextInputProps } from 'react-native-paper';
import { ProgressBar, TextInput } from 'react-native-paper';

import { useThemeConfig } from '@/core/use-theme-config';
import { colors } from '@/ui';

import { cn, numberWithCommas } from '../../../core/utils';
import Icons from '../icons';

export type InputProps = {
  label?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  rules?: Array<keyof ValidationRules>;
  placeholder?: string;
  name: string;
  pattern?: string;
  min?: number;
  outlineColor?: string;
  activeOutlineColor?: string;
  variant?: 'outlined' | 'flat';
  mode?: 'outlined' | 'flat';
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
  altPhone: (value: string, label?: string) => ValidationResult;
  password: (value: string, label?: string) => ValidationResult;
  otp: (value: string, label?: string) => ValidationResult;
  bvn: (value: string, label?: string) => ValidationResult;
  confirmPassword: (value: string, label?: string) => ValidationResult;
  noSpaces: (value: string, label?: string) => ValidationResult;
};

const Input = ({
  label,
  name,
  rules = [],
  max,
  min,
  pattern,
  left,
  leftIcon,
  right,
  rightIcon,
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
  const theme = useThemeConfig();

  const [inputIsFocused, setInputIsFocused] = useState(false);

  const [isPassword, setIsPassword] = useState(secureTextEntry);

  const [passwordCheck, setPasswordCheck] = useState({
    uppercase: {
      checked: false,
      message: '1 uppercase',
    },
    lowercase: {
      checked: false,
      message: '1 lowercase',
    },
    number: {
      checked: false,
      message: 'a number',
    },
    special: {
      checked: false,
      message: 'a special character',
    },
    length: {
      checked: false,
      message: 'atleast 8 characters',
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

  const togglePasswordVisibility = () => {
    setIsPassword(!isPassword);
  };

  const watchPassword =
    methods.watch('password') || methods.watch('newPassword') || '';

  useEffect(() => {
    setPasswordCheck({
      ...passwordCheck,
      uppercase: {
        ...passwordCheck.uppercase,
        checked: /[A-Z]/g.test(watchPassword),
      },
      lowercase: {
        ...passwordCheck.lowercase,
        checked: /[a-z]/g.test(watchPassword),
      },
      number: {
        ...passwordCheck.number,
        checked: /[0-9]/g.test(watchPassword),
      },
      special: {
        ...passwordCheck.special,
        // eslint-disable-next-line no-useless-escape
        checked: /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g.test(
          watchPassword
        ),
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

      if (!/[A-Z]/g.test(value)) {
        messages.push('an uppercase letter');
      }
      if (!/[a-z]/g.test(value)) {
        messages.push('a lowercase letter');
      }
      if (!/[0-9]/g.test(value)) {
        messages.push('a number');
      }
      // eslint-disable-next-line no-useless-escape
      if (!/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g.test(value)) {
        messages.push('a special character');
      }
      if (value.length < 8) {
        messages.push('at least 8 digits');
      }

      const message =
        messages.length > 1
          ? `${messages.slice(0, -1).join(', ')} and ${messages.slice(-1)}`
          : `${messages.join(', ')}`;
      return messages.length > 0
        ? `The ${label} field must have ${message}`
        : true;
    },
    otp: (value) => {
      return value.length === 6
        ? true
        : `The ${label} field must be of length 6`;
    },
    bvn: (value) => {
      return value?.length === 11
        ? true
        : `The ${label} field must be of length 11`;
    },
    phone: (value) => {
      return value.length === 11
        ? true
        : `The ${label} field must be equal to 11 digits`;
    },
    altPhone: (value) => {
      return value.length <= 12
        ? true
        : `The ${label} field must be less than or equal to 12 digits`;
    },
    confirmPassword: (value) => {
      return value === watch('password') || value === watch('newPassword')
        ? true
        : `The ${label} field must be equal to the Password field`;
    },
    noSpaces: (value) => {
      return !value.includes(' ')
        ? true
        : `The ${label} field is not allowed to contain spaces`;
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
          message: `The ${
            label || name
          } field doesn't satisfy the regex ${pattern}`,
        }
      : undefined,
    min: min
      ? {
          value: min,
          message: `The ${
            label || name
          } field must be greater than or equal to ${numberWithCommas(min)}`,
        }
      : undefined,
    max: max
      ? {
          value: max,
          message: `The ${
            label || name
          } field must be less than or equal to ${numberWithCommas(max)}`,
        }
      : undefined,
  });

  return (
    <View className={cn(className)}>
      {label && (
        <Text className="mb-2 font-Lato text-sm font-normal dark:text-shades-white-0">
          {label}
        </Text>
      )}
      <View className="relative">
        <View className="absolute top-1/2 z-50 -translate-y-1/2">{left}</View>
        <TextInput
          {...register}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          value={field.value}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          secureTextEntry={isPassword}
          className={cn('px-4')}
          style={[
            styles.input,
            theme.dark
              ? styles.inputDarkBackgroundColor
              : styles.inputBackgroundColor,
          ]}
          outlineColor={
            theme.dark ? 'transparent' : colors.neutrals.gray['600']
          }
          placeholderTextColor={theme.dark ? '#B5B5B580' : '#97979780'}
          inputMode={inputMode}
          mode="outlined"
          textColor={
            theme.dark ? colors.shades.white['0'] : colors.shades.black['100']
          }
          outlineStyle={
            inputIsFocused ? styles.outlineStyle : styles.outlineStyleNotFocused
          }
          activeOutlineColor={
            error?.message
              ? theme.dark
                ? colors.error['400']
                : colors.error['700']
              : theme.dark
              ? colors.accent.yellow['600']
              : '#D97706'
          }
          onChangeText={(text) => {
            const computedText =
              type === 'amount'
                ? numberWithCommas(text?.replace(/[^0-9.]/g, ''))
                : text;
            field.onChange(computedText);
            onChange && onChange(computedText);
          }}
          onFocus={() => {
            handleOnFocus && handleOnFocus;
            setInputIsFocused(true);
          }}
          onBlur={() => {
            handleOnBlur && handleOnBlur;
            setInputIsFocused(false);
          }}
          left={leftIcon}
          right={secureTextEntry ? <></> : rightIcon}
          multiline={multiline}
        />
        <View className="absolute right-0 top-1/2 z-50 -translate-y-1/2">
          {right}
        </View>
        {type === 'amount' && (
          <View className="absolute right-4 top-1/2 -translate-y-1/2 rounded-[40px] border border-accent-orange-600 px-3.5 py-1 dark:border-accent-yellow-600">
            <Text className="font-Lato text-xs font-bold text-neutrals-gray-900 dark:text-neutrals-gray-500">
              NGN
            </Text>
          </View>
        )}
        <Pressable
          android_ripple={{
            color: 'rgba(200, 200, 200, 0.5)',
            borderless: true,
            radius: 20,
          }}
          onPress={togglePasswordVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <>
            {secureTextEntry && (
              <>
                {!isPassword ? (
                  <EyeSlash
                    color={
                      theme.dark
                        ? colors.neutrals.gray['500']
                        : colors.neutrals.gray['800']
                    }
                  />
                ) : (
                  <Eye
                    color={
                      theme.dark
                        ? colors.neutrals.gray['500']
                        : colors.neutrals.gray['800']
                    }
                  />
                )}
              </>
            )}
          </>
        </Pressable>
        {isLoading && (
          <ProgressBar className="absolute -top-0.5" indeterminate />
        )}
      </View>
      {!rules.includes('password') && error?.message && (
        <View className="mt-2 flex-row items-center gap-x-1">
          <Danger
            size={16}
            color={theme.dark ? colors.error['400'] : colors.error['700']}
            variant="Bold"
          />
          <Text className="flex-1 text-left font-Lato text-xs text-error-700 dark:text-error-400">
            {error?.message as string}
          </Text>
        </View>
      )}
      {rules.includes('password') && (
        <>
          <View className="mt-3 w-full flex-row flex-wrap gap-3">
            {Object.entries(passwordCheck)
              .slice(0, 3)
              .map(([key, value]) => {
                return (
                  <View
                    key={key}
                    className={cn(
                      'flex-row justify-between flex-1 items-center gap-x-1 rounded-lg border border-secondary-blue-400 px-2 py-1.5',
                      {
                        'bg-secondary-blue-500 dark:bg-secondary-blue-950 border-transparent':
                          value.checked,
                      }
                    )}
                  >
                    <Text className="font-Lato text-xs font-normal capitalize text-shades-black-100 dark:text-neutrals-gray-200">
                      {value.message}
                    </Text>
                    {value.checked && (
                      <Icons.TickIcon className="fill-shades-black-100 dark:fill-neutrals-gray-200" />
                    )}
                  </View>
                );
              })}
          </View>
          <View className="mt-3 w-full flex-row flex-wrap gap-3">
            {Object.entries(passwordCheck)
              .slice(3, 5)
              .map(([key, value]) => {
                return (
                  <View
                    key={key}
                    className={cn(
                      'flex-row flex-1 transition-all justify-between items-center gap-x-1 rounded-lg border border-secondary-blue-400 px-2 py-1.5',
                      {
                        'bg-secondary-blue-500 dark:bg-secondary-blue-950 border-transparent':
                          value.checked,
                      }
                    )}
                  >
                    <Text className="font-Lato text-xs font-normal capitalize text-shades-black-100 dark:text-neutrals-gray-200">
                      {value.message}
                    </Text>
                    {value.checked && (
                      <Icons.TickIcon className="fill-shades-black-100 dark:fill-neutrals-gray-200" />
                    )}
                  </View>
                );
              })}
          </View>
        </>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  paddingHorizontal: { paddingHorizontal: 0 },
  input: {
    fontSize: 14,
    height: 48,
  },
  inputBackgroundColor: {
    backgroundColor: colors.neutrals.gray['50'],
  },
  inputDarkBackgroundColor: {
    backgroundColor: colors.primary.teal['800'],
  },
  outlineStyle: {
    borderRadius: 4,
    borderWidth: 1,
  },
  outlineStyleNotFocused: {
    borderRadius: 4,
    borderWidth: 0.4,
  },
});
