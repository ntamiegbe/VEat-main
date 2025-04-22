// Shared utility functions for edge functions

// Generate a random OTP code of specified length
export function generateOTP(length = 4): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get environment variables with validation
export function getEnv(name: string): string {
    const value = Deno.env.get(name);
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

// Calculate OTP expiration time (default: 5 minutes from now)
export function getOTPExpirationTime(minutes = 5): Date {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
}

// Validate rate limiting for authentication attempts
// Returns true if request should be allowed, false if it should be blocked
export async function checkRateLimit(
    client: any,
    identifier: string,
    actionType: 'login' | 'signup' | 'reset_password' | 'verify_email',
    maxAttempts = 5,
    windowMinutes = 15
): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60000);

    // Get attempts in time window
    const { data, error } = await client
        .from('auth_rate_limits')
        .select('created_at')
        .eq('identifier', identifier)
        .eq('action_type', actionType)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Rate limit check error:', error);
        // In case of error, allow the request but log the issue
        return true;
    }

    // If under the limit, record this attempt and allow
    if (!data || data.length < maxAttempts) {
        await client
            .from('auth_rate_limits')
            .insert({
                identifier,
                action_type: actionType,
                created_at: now.toISOString(),
            });
        return true;
    }

    // Over the limit, deny the request
    return false;
} 