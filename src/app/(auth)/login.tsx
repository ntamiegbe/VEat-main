import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MotiView } from 'moti'
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type FormData = {
  phone: string;
};

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      phone: ''
    }
  })

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User is already logged in, redirect to home
        router.replace('/(app)')
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
    }
  }

  const handleSendOTP = async (data: FormData) => {
    try {
      setLoading(true)

      // Format phone number to ensure it includes Nigeria country code
      const formattedPhone = formatPhoneNumber(data.phone)

      // Request OTP from Supabase
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        // options: {
        //   // Set session duration to 24 hours (in seconds)
        //   expiresIn: 60 * 60 * 24
        // }
      })

      if (error) throw error

      // If successful
      setOtpSent(true)
      Alert.alert(
        "OTP Sent",
        `We've sent a verification code to ${formattedPhone}. Please enter it below.`
      )
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send verification code")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    try {
      setLoading(true)

      // Verify OTP
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatPhoneNumber(control._formValues.phone),
        token: otpValue,
        type: 'sms'
      })

      if (error) throw error

      // If successful, user is now logged in
      console.log('User logged in:', data)
      Alert.alert(
        "Success",
        "You've successfully logged in!",
        [
          {
            text: "Continue",
            onPress: () => router.replace('/(app)')
          }
        ]
      )

    } catch (error: any) {
      Alert.alert("Verification Failed", error.message || "Invalid verification code")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to ensure phone number is properly formatted with Nigerian country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '')

    // Handle Nigerian numbers
    if (digits.startsWith('0') && digits.length === 11) {
      // Convert format like 0803... to +2348...
      return `+234${digits.substring(1)}`
    }

    // If they entered without leading 0 (e.g. 803...)
    if (!digits.startsWith('0') && !digits.startsWith('234') && digits.length === 10) {
      return `+234${digits}`
    }

    // If they entered 234... without +
    if (digits.startsWith('234') && !phone.startsWith('+')) {
      return `+${digits}`
    }

    // Already in international format with +
    if (phone.startsWith('+')) {
      return phone
    }

    // Default case - prepend +234 if not already included
    if (!digits.startsWith('234')) {
      return `+234${digits}`
    }

    return phone
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }} // Replace with your app logo
            style={styles.logo}
          />

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: 'timing' }}
            style={styles.formContainer}
          >
            <Text style={styles.headerText}>Welcome!</Text>
            <Text style={styles.subHeaderText}>
              {otpSent
                ? "Enter the verification code sent to your phone"
                : "Sign in with your Nigerian mobile number"
              }
            </Text>

            {!otpSent ? (
              <>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+234</Text>
                  </View>
                  <Controller
                    control={control}
                    rules={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10,11}$/,
                        message: "Please enter a valid Nigerian phone number"
                      }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.phoneInput}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          // Remove the country code if user pastes a full number
                          if (text.startsWith('+234')) {
                            onChange(text.substring(4))
                          } else if (text.startsWith('234')) {
                            onChange(text.substring(3))
                          } else if (text.startsWith('0')) {
                            onChange(text.substring(1))
                          } else {
                            onChange(text)
                          }
                        }}
                        value={value}
                        placeholder="8012345678"
                        keyboardType="phone-pad"
                        placeholderTextColor="#888"
                        maxLength={11}
                      />
                    )}
                    name="phone"
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit(handleSendOTP)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.infoText}>
                  We'll send a one-time password to verify your phone number
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.otpInfoText}>
                  Enter the 6-digit code sent to your phone
                </Text>

                <View style={styles.otpContainer}>
                  <TextInput
                    style={styles.otpInput}
                    onChangeText={setOtpValue}
                    value={otpValue}
                    placeholder="------"
                    keyboardType="number-pad"
                    placeholderTextColor="#888"
                    maxLength={6}
                    textAlign="center"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    otpValue.length !== 6 && styles.disabledButton
                  ]}
                  onPress={handleVerifyOTP}
                  disabled={loading || otpValue.length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleSubmit(handleSendOTP)}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>
                    Didn't receive code? Resend
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 30,
    borderRadius: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  countryCode: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  otpContainer: {
    marginVertical: 16,
  },
  otpInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    backgroundColor: '#fafafa',
  },
  otpInfoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    height: 56,
    backgroundColor: '#008751', // Nigerian green color
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#a8d5c2', // Lighter green for disabled state
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#008751', // Nigerian green
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  linkText: {
    color: '#008751', // Nigerian green
    fontWeight: '500',
  }
})

export default Login