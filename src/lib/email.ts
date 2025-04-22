// Constants for environment variables
const {
    NODE_ENV = 'development',
    ZEPTOMAIL_API_KEY,
    ZEPTOMAIL_SENDER_EMAIL,
    ZEPTOMAIL_TEMPLATE_ID
} = process.env;

import { supabase } from '@/lib/supabase';

// Constants for rate limiting
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_REQUESTS_PER_MINUTE = 1;

// Development mode settings
const DEV_MODE = NODE_ENV === 'development';
const DEV_EMAIL_DOMAIN = '@zeptomail.dev';

// In-memory storage for development OTPs
const devOTPs = new Map<string, { otp: string; expiresAt: Date }>();

// Cleanup expired OTPs every minute
setInterval(() => {
    const now = new Date();
    for (const [email, data] of devOTPs.entries()) {
        if (data.expiresAt < now) {
            devOTPs.delete(email);
        }
    }
}, 60000);

// Check rate limits
const checkRateLimit = async (email: string) => {
    if (DEV_MODE) return; // Skip rate limiting in development

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Check hourly limit
    const { count: hourlyCount } = await supabase
        .from('email_verification')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneHourAgo.toISOString());

    if (hourlyCount && hourlyCount >= MAX_REQUESTS_PER_HOUR) {
        throw new Error('Too many OTP requests. Please try again in an hour.');
    }

    // Check minute limit
    const { count: minuteCount } = await supabase
        .from('email_verification')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneMinuteAgo.toISOString());

    if (minuteCount && minuteCount >= MAX_REQUESTS_PER_MINUTE) {
        throw new Error('Please wait a minute before requesting another OTP.');
    }
};

// Generate a 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email: string) => {
    try {
        await checkRateLimit(email);

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        if (DEV_MODE) {
            // Store OTP in memory for development
            devOTPs.set(email, { otp, expiresAt });
            return true;
        }

        // Store OTP in Supabase
        const { error: dbError } = await supabase
            .from('email_verification')
            .upsert({
                email,
                otp,
                created_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString()
            });

        if (dbError) throw dbError;

        // Send email using Zeptomail
        const response = await fetch('https://api.zeptomail.com/v1.1/email/template', {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${ZEPTOMAIL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template_key: ZEPTOMAIL_TEMPLATE_ID,
                from_email: ZEPTOMAIL_SENDER_EMAIL,
                to_email: email,
                merge_info: {
                    otp,
                    expiry_minutes: 5
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send OTP email');
        }

        return true;
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

// Verify OTP
export const verifyOTP = async (email: string, otp: string) => {
    try {
        if (DEV_MODE) {
            const storedData = devOTPs.get(email);
            if (!storedData) {
                throw new Error('OTP not found');
            }
            if (storedData.expiresAt < new Date()) {
                throw new Error('OTP has expired');
            }
            if (storedData.otp !== otp) {
                throw new Error('Invalid OTP');
            }
            devOTPs.delete(email);
            return true;
        }

        const { data, error } = await supabase
            .from('email_verification')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Invalid OTP');
        if (new Date(data.expires_at) < new Date()) {
            throw new Error('OTP has expired');
        }

        // Delete the used OTP
        await supabase
            .from('email_verification')
            .delete()
            .eq('email', email)
            .eq('otp', otp);

        return true;
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
}; 