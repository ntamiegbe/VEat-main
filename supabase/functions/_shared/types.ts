// Type definitions for auth-related functions

// Request types for the verify-email function
export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}

// Request types for the reset-password function
export interface ResetPasswordRequest {
    email: string;
}

export interface UpdatePasswordRequest {
    token: string;
    password: string;
}

// User profile data interface
export interface UserProfileData {
    id: string;
    email?: string;
    full_name?: string;
    phone_number?: string;
    profile_image_url?: string;
    birthday?: string;
    default_delivery_location_id?: string;
    user_type?: string;
}

// Response types
export interface SuccessResponse {
    success: true;
    message: string;
    data?: Record<string, any>;
}

export interface ErrorResponse {
    success: false;
    message: string;
    code?: string;
    status?: number;
}

export type APIResponse = SuccessResponse | ErrorResponse;

// Error codes
export enum ErrorCode {
    INVALID_INPUT = 'INVALID_INPUT',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    RATE_LIMITED = 'RATE_LIMITED',
    SERVER_ERROR = 'SERVER_ERROR',
    ALREADY_EXISTS = 'ALREADY_EXISTS',
    EXPIRED = 'EXPIRED',
} 