import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Remove the ! to allow for better error handling
const PAYSTACK_PUBLIC_KEY = 'pk_test_e0a46400aa6beb20e033cc374d3e176db31ac80d';



export function useInitiatePayment() {
    return useMutation({
        mutationFn: async ({ amount, email }: { amount: number; email: string }) => {
            try {
                // Generate a unique reference
                const reference = `veat_${Date.now()}_${Math.random().toString(36).substring(2)}`;

                // Create the payment URL with inline parameters
                const url = `https://checkout.paystack.com/` +
                    `?key=${PAYSTACK_PUBLIC_KEY}` +
                    `&email=${encodeURIComponent(email)}` +
                    `&amount=${amount * 100}` + // Convert to kobo
                    `&ref=${reference}` +
                    `&callback_url=${encodeURIComponent(`${Constants.expoConfig?.scheme}://payment/callback`)}`;

                // Open payment URL in browser
                const result = await WebBrowser.openAuthSessionAsync(
                    url,
                    `${Constants.expoConfig?.scheme}://payment/callback`
                );

                if (result.type === 'success') {
                    // Extract status and reference from URL
                    const callbackUrl = new URL(result.url);
                    const status = callbackUrl.searchParams.get('status');
                    const trxref = callbackUrl.searchParams.get('trxref');

                    if (!trxref) {
                        throw new Error('No reference found in callback URL');
                    }

                    return {
                        reference: trxref,
                        status: status || 'failed'
                    };
                }

                throw new Error('Payment was cancelled or failed');
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            if (data.status === 'success') {
                // Redirect to in-progress orders
                router.replace({
                    pathname: '/(app)/orders'
                });
            } else {
                // Payment failed, stay on checkout
                router.replace({
                    pathname: '/(app)/checkout'
                });
            }
        },
    });
} 