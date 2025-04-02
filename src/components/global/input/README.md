# Custom Input Component

This custom input component provides a modern, floating label input field with robust validation and password strength indicators.

## Features

- **Floating Label Animation**: Label moves up and shrinks when the input is focused or contains text
- **Password Validation**: Visual indicators for password strength with strike-through text when criteria are met
- **Form Integration**: Works with React Hook Form for easy validation
- **Theme Support**: Supports light and dark themes
- **Accessible**: Focus and error states are clearly indicated

## Usage

### Basic Input

```jsx
import { FormProvider, useForm } from 'react-hook-form';
import Input from './components/global/input';

const MyForm = () => {
  const methods = useForm({
    defaultValues: {
      firstName: '',
      email: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <Input name="firstName" label="First name" rules={['required']} />

      <Input
        name="email"
        label="Email address"
        rules={['required', 'email']}
        keyboardType="email-address"
      />
    </FormProvider>
  );
};
```

### Password Input with Validation

```jsx
<Input name="password" label="Password" secureTextEntry rules={['password']} />
```

### Phone Number Input

```jsx
<Input
  name="phoneNumber"
  label="Phone number"
  keyboardType="phone-pad"
  rules={['phone']}
/>
```

## Props

| Prop              | Type                           | Description                                         |
| ----------------- | ------------------------------ | --------------------------------------------------- |
| `name`            | `string`                       | Field name (required for React Hook Form)           |
| `label`           | `string`                       | Floating label text                                 |
| `rules`           | `Array<keyof ValidationRules>` | Validation rules to apply                           |
| `secureTextEntry` | `boolean`                      | Whether to mask input (for passwords)               |
| `type`            | `string`                       | Input type (text, password, email, etc.)            |
| `keyboardType`    | `string`                       | Keyboard type for React Native                      |
| `placeholder`     | `string`                       | Placeholder text (only shows when input is focused) |
| `disabled`        | `boolean`                      | Whether the input is disabled                       |
| `isLoading`       | `boolean`                      | Shows loading indicator when true                   |

## Validation Rules

The component supports the following validation rules:

- `required`: Field cannot be empty
- `email`: Must be a valid email address
- `password`: Must meet password requirements (8+ chars, letter, number)
- `phone`: Must be exactly 11 digits
- `confirmPassword`: Must match the password field
- `noSpaces`: Cannot contain spaces

## Styling

The input uses a combination of React Native StyleSheet and Tailwind CSS (via the `cn` utility) for styling.
