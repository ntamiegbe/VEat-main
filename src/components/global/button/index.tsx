/* eslint-disable max-lines-per-function */
import React, { useEffect } from 'react';
import { LogBox, Text, View, ActivityIndicator } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { cn } from '@/core/utils';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'plain';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  icon?: JSX.Element;
  iconLeft?: JSX.Element;
  isLoading?: boolean;
  children: string | string[];
  ButtonTextStyle?: string;
};

const Button = ({
  isLoading = false,
  variant = 'primary',
  className,
  ButtonTextStyle,
  size = 'md',
  onPress,
  disabled = false,
  icon,
  iconLeft,
  children,
}: ButtonProps) => {
  const getButtonStyle = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-main disabled:bg-background-disabled';
      case 'secondary':
        return 'bg-secondary-orange';
      case 'outline':
        return 'bg-transparent border border-secondary-stroke';
      case 'plain':
        return 'bg-transparent';
      default:
        return 'bg-white';
    }
  };

  const getButtonTextStyle = (): string => {
    if (disabled) {
      return 'text-secondary-caption';
    }

    switch (variant) {
      case 'primary':
        return 'text-white text-base font-bold';
      case 'secondary':
        return 'dark:text-accent-yellow-600';
      case 'outline':
        return 'text-tc-primary font-';
      case 'plain':
        return 'text-black';
      default:
        return 'text-black';
    }
  };

  const getButtonSize = (): string => {
    switch (size) {
      case 'sm':
        return 'py-2 px-2 rounded h-10 rounded-full';
      case 'md':
        return 'py-[16px] px-[12px] rounded-full';
      case 'lg':
        return 'py-6 px-6 h-14 rounded-full';
      default:
        return 'py-[16px] px-[12px] rounded-full';
    }
  };

  const getSpinnerColor = (): string => {
    // Always show white spinner for primary variant when loading
    if (isLoading && variant === 'primary') {
      return '#FFFFFF';
    }

    if (disabled) {
      return '#9CA3AF'; // secondary-caption color
    }

    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return '#D97706';
      case 'outline':
        return '#D97706';
      case 'plain':
        return '#000000';
      default:
        return '#FFFFFF';
    }
  };

  useEffect(() => {
    LogBox.ignoreAllLogs();
  }, []);

  return (
    <>
      <TouchableRipple
        onPress={onPress}
        className={cn(
          'w-full transition-all mx-auto flex flex-row items-center justify-center',
          getButtonSize(),
          getButtonStyle(),
          className,
        )}
        disabled={disabled}
      >
        <View className="flex flex-row items-center justify-center gap-x-2">
          {icon && !isLoading && icon}
          {isLoading ? (
            <View style={{ width: 19, height: 19 }}>
              <ActivityIndicator
                size="small"
                color={getSpinnerColor()}
              />
            </View>
          ) : (
            <Text
              className={cn(
                'text-center font-bold text-base',
                getButtonTextStyle(),
                ButtonTextStyle
              )}
            >
              {children}
            </Text>
          )}
          {iconLeft && !isLoading && iconLeft}
        </View>
      </TouchableRipple>
    </>
  );
};

export default Button;
