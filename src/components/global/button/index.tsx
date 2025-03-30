/* eslint-disable max-lines-per-function */
import React, { useEffect } from 'react';
import { LogBox, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import { cn } from '@/core/utils';
// import LoadingModal from '../LoadingModal';

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
        return 'bg-[#D97706] dark:bg-accent-yellow-600';
      case 'secondary':
        return 'bg-secondary-orange';
      case 'outline':
        return 'bg-transparent border border-[#D97706] dark:border-accent-yellow-600';
      case 'plain':
        return 'bg-transparent';
      default:
        return 'bg-white';
    }
  };

  const getButtonTextStyle = (): string => {
    switch (variant) {
      case 'primary':
        return 'text-shades-black-100';
      case 'secondary':
        return 'dark:text-accent-yellow-600';
      case 'outline':
        return 'text-[#D97706] dark:text-accent-yellow-600';
      case 'plain':
        return 'text-black';
      default:
        return 'text-black';
    }
  };

  const getButtonSize = (): string => {
    switch (size) {
      case 'sm':
        return 'py-2 px-2 rounded h-10 rounded';
      case 'md':
        return 'py-4 px-5 h-12 rounded';
      case 'lg':
        return 'py-6 px-6 rounded';
      default:
        return 'py-4 px-5 rounded';
    }
  };

  useEffect(() => {
    LogBox.ignoreAllLogs();
  }, []);

  return (
    <>
      <TouchableRipple
        onPress={onPress}
        rippleColor="rgba(0, 0, 0, .22)"
        className={cn(
          'w-full transition-all mx-auto flex flex-row items-center justify-center',
          getButtonSize(),
          getButtonStyle(),
          className,
          {
            'opacity-50': disabled,
          }
        )}
        disabled={isLoading || disabled}
      >
        <View className="flex flex-row items-center justify-center gap-x-2">
          {icon && icon}
          <Text
            className={cn(
              'text-center text-base leading-4 font-Lato font-bold',
              getButtonTextStyle(),
              ButtonTextStyle
            )}
          >
            {children}
          </Text>
          {iconLeft && iconLeft}
        </View>
      </TouchableRipple>
      {/* <LoadingModal isVisible={isLoading} /> */}
    </>
  );
};

export default Button;
