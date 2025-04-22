import { supabase } from './supabase';
import { UserProfileData } from '../../supabase/functions/_shared/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

// Response type for edge functions
export interface EdgeFunctionResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    code?: string;
    status?: number;
}

// Base function to call edge functions
async function callEdgeFunction<T = any>(
    functionName: string,
    options?: {
        path?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: Record<string, any>;
    }
): Promise<EdgeFunctionResponse<T>> {
    try {
        const {
            path = '',
            method = 'POST',
            body = undefined,
        } = options || {};

        const { data, error } = await supabase.functions.invoke(
            `${functionName}${path ? `/${path}` : ''}`,
            {
                method,
                body: body || {},
            }
        );

        if (error) {
            console.error(`Error calling ${functionName}:`, error);
            return {
                success: false,
                message: error.message || `Failed to call ${functionName}`,
                error,
                status: 500
            };
        }

        return data as EdgeFunctionResponse<T>;
    } catch (error: any) {
        console.error(`Exception calling ${functionName}:`, error);
        return {
            success: false,
            message: error.message || `Exception in ${functionName}`,
            error,
            status: 500
        };
    }
}

/**
 * Helper to call Supabase Edge Functions with more control
 */
export async function callEdgeFunctionLegacy(
    functionName: string,
    options?: {
        path?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: Record<string, any>;
        headers?: Record<string, string>;
        token?: string;
    }
): Promise<EdgeFunctionResponse> {
    try {
        const {
            path = '',
            method = 'POST',
            body = undefined,
            headers = {},
        } = options || {};

        // For anonymous functions like OTP verification, don't require auth
        const response = await supabase.functions.invoke(
            `${functionName}${path ? `/${path}` : ''}`,
            {
                method,
                body: body || {},
                headers: headers || {},
            }
        );

        // Check if there's an error from the invocation itself (network error, etc.)
        if (response.error) {
            console.error(`Error calling ${functionName}:`, response.error);
            return {
                success: false,
                message: response.error.message || `Failed to call ${functionName}`,
                error: response.error,
                status: response.error.status || 500,
                code: response.error.code
            };
        }

        // Return the data from the function (which might include a success=false)
        return response.data as EdgeFunctionResponse;
    } catch (error: any) {
        console.error(`Exception calling ${functionName}:`, error);

        // Try to extract structured error data if available
        if (error.message && error.message.includes('Edge Function returned a non-2xx status code')) {
            try {
                // The error might contain the response data in a structured format
                if (error.data) {
                    return error.data as EdgeFunctionResponse;
                }
            } catch (parseError) {
                // If we can't parse the error data, continue with the generic error
            }
        }

        return {
            success: false,
            message: error.message || `Exception in ${functionName}`,
            error,
            status: error.status || 500,
            code: error.code
        };
    }
}

// User profile functions
export async function getUserProfile(): Promise<EdgeFunctionResponse<UserProfileData>> {
    return callEdgeFunction<UserProfileData>('sync-user-profile', {
        method: 'GET',
    });
}

export async function updateUserProfile(profileData: Partial<UserProfileData>): Promise<EdgeFunctionResponse> {
    return callEdgeFunction('sync-user-profile', {
        method: 'POST',
        body: profileData,
    });
}

// Password reset functions
export interface ResetPasswordPayload {
    token: string;
    password: string;
}

export interface RequestPasswordResetOTPPayload {
    email: string;
}

export interface VerifyPasswordResetOTPPayload {
    email: string;
    otp: string;
}

export interface UpdatePasswordWithOTPPayload {
    email: string;
    otp: string;
    password: string;
}

export async function requestPasswordResetOTP(email: string): Promise<EdgeFunctionResponse> {
    return callEdgeFunctionLegacy('reset-password', {
        path: 'request-otp',
        method: 'POST',
        body: { email },
    });
}

export async function verifyPasswordResetOTP(email: string, otp: string): Promise<EdgeFunctionResponse> {
    return callEdgeFunctionLegacy('reset-password', {
        path: 'verify-otp',
        method: 'POST',
        body: { email, otp },
    });
}

export async function updatePasswordWithOTP(email: string, otp: string, password: string): Promise<EdgeFunctionResponse> {
    return callEdgeFunctionLegacy('reset-password', {
        path: 'update-with-otp',
        method: 'POST',
        body: { email, otp, password },
    });
}

export async function requestPasswordReset(email: string): Promise<EdgeFunctionResponse> {
    return callEdgeFunction('reset-password', {
        path: 'request',
        method: 'POST',
        body: { email },
    });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<EdgeFunctionResponse> {
    return callEdgeFunction('reset-password', {
        path: 'update',
        method: 'POST',
        body: payload,
    });
}

export async function updatePasswordWithToken(token: string, password: string): Promise<EdgeFunctionResponse> {
    return callEdgeFunction('reset-password', {
        path: 'update',
        method: 'POST',
        body: { token, password },
    });
}

// Email verification functions
export interface VerifyEmailPayload {
    token: string;
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<EdgeFunctionResponse> {
    return callEdgeFunction('verify-email', {
        method: 'POST',
        body: payload
    });
}

export async function sendVerificationEmail(email: string): Promise<EdgeFunctionResponse> {
    try {
        // Get the Supabase anon key from the environment
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

        // Direct implementation
        const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-email/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        return {
            success: data.success || false,
            message: data.message || 'Unknown response',
            code: data.code,
            status: response.status,
            data: data.data
        };
    } catch (error: any) {
        console.error(`Error sending verification email:`, error);
        return {
            success: false,
            message: error.message || 'Failed to send verification email',
            error,
            status: 0,
            code: 'NETWORK_ERROR'
        };
    }
}

export async function verifyEmailOTP(email: string, otp: string): Promise<EdgeFunctionResponse> {
    try {
        // Get the Supabase anon key from the environment
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

        // Direct call implementation
        const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-email/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        return {
            success: response.status === 200 && (data.success || false),
            message: data.message || (response.status === 200 ? 'Email verified successfully' : 'Verification failed'),
            code: data.code,
            status: response.status,
            data: data.data
        };
    } catch (error: any) {
        console.error('Error verifying email OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to verify email',
            error,
            status: 0,
            code: 'NETWORK_ERROR'
        };
    }
} 