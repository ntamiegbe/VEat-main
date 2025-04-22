// Password reset edge function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';
import { corsHeaders, handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { isValidEmail, generateOTP, getOTPExpirationTime, checkRateLimit } from '../_shared/config.ts';
import {
    ResetPasswordRequest,
    UpdatePasswordRequest,
    ErrorCode,
    APIResponse
} from '../_shared/types.ts';

interface PasswordResetOtpRequest {
    email: string;
}

interface VerifyPasswordOtpRequest {
    email: string;
    otp: string;
}

interface UpdatePasswordWithOtpRequest {
    email: string;
    otp: string;
    password: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            throw new Error('Missing environment variables');
        }

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request
        const { pathname } = new URL(req.url);

        if (req.method === 'POST') {
            const requestData = await req.json();

            // Request password reset via OTP
            if (pathname === '/reset-password/request-otp') {
                return await handleOtpRequest(req, requestData, supabaseClient);
            }

            // Verify OTP
            if (pathname === '/reset-password/verify-otp') {
                return await handleOtpVerification(req, requestData, supabaseClient);
            }

            // Update password with verified OTP
            if (pathname === '/reset-password/update-with-otp') {
                return await handlePasswordUpdateWithOtp(req, requestData, supabaseClient);
            }

            // Request password reset via email link (legacy)
            if (pathname === '/reset-password/request') {
                return await handleResetRequest(req, requestData, supabaseClient);
            }

            // Update password with token (legacy)
            if (pathname === '/reset-password/update') {
                return await handlePasswordUpdate(req, requestData, supabaseClient);
            }
        }

        // Return 404 for unknown routes
        const notFoundResponse: APIResponse = {
            success: false,
            message: 'Not found',
            code: ErrorCode.NOT_FOUND,
            status: 404
        };

        return addCorsHeaders(new Response(
            JSON.stringify(notFoundResponse),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        ));

    } catch (error) {
        // Handle errors
        console.error('Error:', error.message);

        const errorResponse: APIResponse = {
            success: false,
            message: 'Internal server error',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
    }
});

// Handler for OTP password reset request
async function handleOtpRequest(
    req: Request,
    data: PasswordResetOtpRequest,
    supabaseClient: any
): Promise<Response> {
    const { email } = data;

    // Validate email
    if (!email || !isValidEmail(email)) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Invalid email address',
            code: ErrorCode.INVALID_INPUT,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Check rate limits
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateCheckEmail = await checkRateLimit(
        supabaseClient,
        email,
        'reset_password',
        3, // max 3 attempts
        60  // within 60 minutes
    );

    const rateCheckIP = await checkRateLimit(
        supabaseClient,
        ip,
        'reset_password',
        5, // max 5 attempts per IP
        60  // within 60 minutes
    );

    if (!rateCheckEmail || !rateCheckIP) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Too many password reset attempts. Please try again later.',
            code: ErrorCode.RATE_LIMITED,
            status: 429
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseClient.auth.admin
        .listUsers({
            filter: {
                email: email
            },
            limit: 1
        });

    if (userError || !userData || userData.users.length === 0) {
        // For security reasons, don't reveal whether the email exists
        // Just show a generic success message
        const successResponse: APIResponse = {
            success: true,
            message: 'If your email is registered, you will receive a verification code shortly'
        };

        return addCorsHeaders(new Response(
            JSON.stringify(successResponse),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Generate OTP
    const otp = generateOTP(4); // 4-digit OTP
    const expiresAt = getOTPExpirationTime(10); // 10 minutes expiration

    // Store OTP in database
    const { error: insertError } = await supabaseClient
        .from('password_reset_otps')
        .insert({
            email,
            otp,
            expires_at: expiresAt.toISOString(),
            is_used: false
        });

    if (insertError) {
        console.error('Error storing OTP:', insertError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'Failed to generate password reset code',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // In a real application, send an email with the OTP
    // For demo purposes, we'll just log it
    console.log(`Password reset OTP for ${email}: ${otp}`);

    // Return success response
    const successResponse: APIResponse = {
        success: true,
        message: 'Verification code sent to your email',
        data: {
            email,
            expiresAt: expiresAt.toISOString()
        }
    };

    return addCorsHeaders(new Response(
        JSON.stringify(successResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
}

// Handler for verifying OTP
async function handleOtpVerification(
    req: Request,
    data: VerifyPasswordOtpRequest,
    supabaseClient: any
): Promise<Response> {
    const { email, otp } = data;

    // Validate input
    if (!email || !isValidEmail(email) || !otp) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Invalid email or verification code',
            code: ErrorCode.INVALID_INPUT,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Get the latest OTP for this email
    const { data: otpData, error: otpError } = await supabaseClient
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (otpError || !otpData) {
        console.error('Error retrieving OTP:', otpError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'No valid verification code found',
            code: ErrorCode.NOT_FOUND,
            status: 404
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);

    if (now > expiresAt) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Verification code has expired',
            code: ErrorCode.EXPIRED,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Verify OTP
    if (otpData.otp !== otp) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Invalid verification code',
            code: ErrorCode.UNAUTHORIZED,
            status: 401
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // OTP is valid, but don't mark as used yet
    // We'll do that when the password is actually updated

    // Return success
    const successResponse: APIResponse = {
        success: true,
        message: 'Verification code validated successfully',
        data: { email }
    };

    return addCorsHeaders(new Response(
        JSON.stringify(successResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
}

// Handler for updating password with OTP
async function handlePasswordUpdateWithOtp(
    req: Request,
    data: UpdatePasswordWithOtpRequest,
    supabaseClient: any
): Promise<Response> {
    const { email, otp, password } = data;

    // Validate input
    if (!email || !isValidEmail(email) || !otp || !password) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Missing required fields',
            code: ErrorCode.INVALID_INPUT,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    if (password.length < 8) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Password must be at least 8 characters long',
            code: ErrorCode.INVALID_INPUT,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Get the latest OTP for this email
    const { data: otpData, error: otpError } = await supabaseClient
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (otpError || !otpData) {
        console.error('Error retrieving OTP:', otpError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'No valid verification code found',
            code: ErrorCode.NOT_FOUND,
            status: 404
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);

    if (now > expiresAt) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Verification code has expired',
            code: ErrorCode.EXPIRED,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Verify OTP
    if (otpData.otp !== otp) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Invalid verification code',
            code: ErrorCode.UNAUTHORIZED,
            status: 401
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Get user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin
        .listUsers({
            filter: {
                email: email
            },
            limit: 1
        });

    if (userError || !userData || userData.users.length === 0) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'User not found',
            code: ErrorCode.NOT_FOUND,
            status: 404
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    const userId = userData.users[0].id;

    // Update user password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { password }
    );

    if (updateError) {
        console.error('Error updating password:', updateError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'Failed to update password',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Mark OTP as used
    await supabaseClient
        .from('password_reset_otps')
        .update({ is_used: true })
        .eq('id', otpData.id);

    // Return success
    const successResponse: APIResponse = {
        success: true,
        message: 'Password updated successfully'
    };

    return addCorsHeaders(new Response(
        JSON.stringify(successResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
}

// Original handler for password reset request (keep for backward compatibility)
async function handleResetRequest(
    req: Request,
    data: ResetPasswordRequest,
    supabaseClient: any
): Promise<Response> {
    const { email } = data;

    // Validate email
    if (!email || !isValidEmail(email)) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Invalid email address',
            code: ErrorCode.INVALID_INPUT,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Check rate limits for reset password attempts
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateCheckEmail = await checkRateLimit(
        supabaseClient,
        email,
        'reset_password',
        3, // max 3 attempts
        60  // within 60 minutes
    );

    const rateCheckIP = await checkRateLimit(
        supabaseClient,
        ip,
        'reset_password',
        5, // max 5 attempts per IP
        60  // within 60 minutes
    );

    if (!rateCheckEmail || !rateCheckIP) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Too many password reset attempts. Please try again later.',
            code: ErrorCode.RATE_LIMITED,
            status: 429
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseClient.auth.admin
        .listUsers({
            filter: {
                email: email
            },
            limit: 1
        });

    if (userError || !userData || userData.users.length === 0) {
        // For security reasons, don't reveal whether the email exists
        // Just show a generic success message
        const successResponse: APIResponse = {
            success: true,
            message: 'If your email is registered, you will receive a password reset link shortly'
        };

        return addCorsHeaders(new Response(
            JSON.stringify(successResponse),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // User exists, send a password reset link
    const { error: resetError } = await supabaseClient.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
            redirectTo: 'veat://auth/reset-password'
        }
    });

    if (resetError) {
        console.error('Error generating password reset link:', resetError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'Failed to generate password reset link',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Return success
    const successResponse: APIResponse = {
        success: true,
        message: 'Password reset link sent to your email'
    };

    return addCorsHeaders(new Response(
        JSON.stringify(successResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
}

// Handler for updating password with token
async function handlePasswordUpdate(
    req: Request,
    data: UpdatePasswordRequest,
    supabaseClient: any
): Promise<Response> {
    const { token, password } = data;

    // Validate input
    if (!token || !password || password.length < 8) {
        const errorResponse: APIResponse = {
            success: false,
            message: password.length < 8
                ? 'Password must be at least 8 characters long'
                : 'Invalid token or password',
            code: ErrorCode.INVALID_INPUT,
            status: 400
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Update password using token
    const { error: updateError } = await supabaseClient.auth.updateUser({
        password: password
    }, {
        token_hash: token
    });

    if (updateError) {
        console.error('Error updating password:', updateError);

        // Handle specific errors
        if (updateError.message.includes('token is invalid or has expired')) {
            const errorResponse: APIResponse = {
                success: false,
                message: 'Password reset token is invalid or has expired',
                code: ErrorCode.EXPIRED,
                status: 400
            };

            return addCorsHeaders(new Response(
                JSON.stringify(errorResponse),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            ));
        }

        const errorResponse: APIResponse = {
            success: false,
            message: 'Failed to update password',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Return success
    const successResponse: APIResponse = {
        success: true,
        message: 'Password updated successfully'
    };

    return addCorsHeaders(new Response(
        JSON.stringify(successResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
} 