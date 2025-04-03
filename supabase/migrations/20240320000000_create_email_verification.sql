-- Create email_verification table
CREATE TABLE IF NOT EXISTS email_verification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT email_verification_email_otp_key UNIQUE (email, otp)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_email_otp ON email_verification (email, otp);

-- Create index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_email_verification_expires_at ON email_verification (expires_at);

-- Add RLS policies
ALTER TABLE email_verification ENABLE ROW LEVEL SECURITY;

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON email_verification
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow select for authenticated users
CREATE POLICY "Allow select for authenticated users" ON email_verification
    FOR SELECT TO authenticated
    USING (true);

-- Allow delete for authenticated users
CREATE POLICY "Allow delete for authenticated users" ON email_verification
    FOR DELETE TO authenticated
    USING (true);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired OTPs every hour
SELECT cron.schedule(
    'cleanup-expired-otps',
    '0 * * * *', -- Run every hour
    $$
    SELECT cleanup_expired_otps();
    $$
); 