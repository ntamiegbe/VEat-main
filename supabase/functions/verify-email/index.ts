// Email verification edge function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';
import { corsHeaders, handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { generateOTP, isValidEmail, getOTPExpirationTime, checkRateLimit } from '../_shared/config.ts';
import {
    VerifyEmailRequest,
    VerifyOTPRequest,
    ErrorCode,
    APIResponse
} from '../_shared/types.ts';

serve(async (req) => {
    // Always return OPTIONS requests immediately with cors headers
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Handle CORS preflight requests
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            throw new Error('Missing environment variables. Check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.');
        }

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request
        const { pathname } = new URL(req.url);

        if (req.method === 'POST') {
            // Handle POST request for sending OTP
            if (pathname === '/verify-email/send') {
                // Don't check for auth token here - anonymous access allowed
                const requestData = await req.json();
                return await handleSendOTP(req, requestData, supabaseClient);
            }

            // Handle POST request for verifying OTP
            if (pathname === '/verify-email/verify') {
                // Don't check for auth token here - anonymous access allowed
                const requestData = await req.json();
                return await handleVerifyOTP(req, requestData, supabaseClient);
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

// Handler for sending OTP
async function handleSendOTP(
    req: Request,
    data: VerifyEmailRequest,
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
        'verify_email',
        5, // max 5 attempts
        15  // within 15 minutes
    );

    const rateCheckIP = await checkRateLimit(
        supabaseClient,
        ip,
        'verify_email',
        10, // max 10 attempts per IP
        15  // within 15 minutes
    );

    if (!rateCheckEmail || !rateCheckIP) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Too many attempts. Please try again later.',
            code: ErrorCode.RATE_LIMITED,
            status: 429
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Generate OTP
    const otp = generateOTP(4);
    const expiresAt = getOTPExpirationTime(5); // 5 minutes

    // Store OTP in the database
    const { error: insertError } = await supabaseClient
        .from('email_verification')
        .insert({
            email,
            otp,
            expires_at: expiresAt.toISOString()
        });

    if (insertError) {
        console.error('Error storing OTP:', insertError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'Failed to send verification code',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };

        return addCorsHeaders(new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    // Send email with OTP
    // In a real-world scenario, you would integrate with an email sending service
    // For this demo, we're just storing the OTP in the database
    console.log(`OTP for ${email}: ${otp}`);

    const successResponse: APIResponse = {
        success: true,
        message: 'Verification code sent successfully',
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
async function handleVerifyOTP(
    req: Request,
    data: VerifyOTPRequest,
    supabaseClient: any
): Promise<Response> {
    const { email, otp } = data;

    // Validate input
    if (!email || !isValidEmail(email) || !otp) {
        const errorResponse: APIResponse = {
            success: false,
            message: 'Invalid email or OTP',
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
        .from('email_verification')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (otpError || !otpData) {
        console.error('Error retrieving OTP:', otpError);
        const errorResponse: APIResponse = {
            success: false,
            message: 'No verification code found',
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

    // Mark the OTP as used
    await supabaseClient
        .from('email_verification')
        .update({ is_used: true })
        .eq('id', otpData.id);

    // Return success
    const successResponse: APIResponse = {
        success: true,
        message: 'Email verified successfully',
        data: { email }
    };

    return addCorsHeaders(new Response(
        JSON.stringify(successResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
}

export async function verifyEmailOTP(email: string, otp: string): Promise<APIResponse> {
    console.log(`Verifying OTP for ${email}: ${otp}`);

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const url = `${supabaseUrl}/functions/v1/verify-email/verify`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json() as APIResponse;
        console.log('Verification response:', data);
        return data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to verify OTP',
            code: ErrorCode.SERVER_ERROR,
            status: 500
        };
    }
} 