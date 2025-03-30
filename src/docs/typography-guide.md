# VEat Typography Guide

This guide explains how to use the custom Banana Grotesk font family consistently across the VEat application.

## Font Setup

The application is set up with the Banana Grotesk font family, which includes several weights:

- BananaGrotesk-Thin
- BananaGrotesk-ExtraLight
- BananaGrotesk-Light
- BananaGrotesk-Regular
- BananaGrotesk-Medium
- BananaGrotesk-Bold
- BananaGrotesk-ExtraBold

Fonts are loaded at application startup through the `FontProvider` component.

## Using the Custom Text Component

For consistent typography, always use the custom `Text` component instead of the default React Native Text component:

```jsx
import Text from '@/components/ui/Text';

// Usage
<Text>Regular text</Text>
<Text weight="bold">Bold text</Text>
<Text weight="medium">Medium text</Text>
```

The `weight` prop accepts: 'thin', 'extralight', 'light', 'regular', 'medium', 'bold', or 'extrabold'.

## Typography Utility

For consistent styling, use the predefined typography styles from the typography utility:

```jsx
import { typography } from '@/utils/typography';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: '#008751',
  },
  content: {
    ...typography.bodyMedium,
    color: '#333',
  },
});
```

### Available Typography Styles

#### Headings

- `typography.h1` - 32px bold
- `typography.h2` - 28px bold
- `typography.h3` - 24px bold
- `typography.h4` - 20px bold
- `typography.h5` - 18px bold
- `typography.h6` - 16px bold

#### Body Text

- `typography.bodyLarge` - 18px regular
- `typography.bodyMedium` - 16px regular
- `typography.bodySmall` - 14px regular

#### Button Text

- `typography.buttonLarge` - 18px medium
- `typography.buttonMedium` - 16px medium
- `typography.buttonSmall` - 14px medium

#### Other

- `typography.caption` - 12px regular

#### Font Weights

- `typography.thin`
- `typography.extralight`
- `typography.light`
- `typography.regular`
- `typography.medium`
- `typography.bold`
- `typography.extrabold`

## TailwindCSS Usage

The font family is also configured in TailwindCSS. You can use these class names:

```jsx
<View className="font-sans">Regular text</View>
<View className="font-thin">Thin text</View>
<View className="font-extralight">Extra Light text</View>
<View className="font-light">Light text</View>
<View className="font-medium">Medium text</View>
<View className="font-bold">Bold text</View>
<View className="font-extrabold">Extra Bold text</View>
```

## Best Practices

1. Always use the custom Text component
2. Use typography utility styles for consistent sizing and spacing
3. Apply font weights based on hierarchy and importance
4. Maintain consistent line heights for readability
