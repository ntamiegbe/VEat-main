-- Create a table to store password reset OTPs
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Create an index for faster querying
  CONSTRAINT password_reset_otps_email_idx UNIQUE (email, created_at)
);

-- Add RLS policies
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access this table (for security)
CREATE POLICY "Allow service role for all operations" ON public.password_reset_otps
  USING (true)
  WITH CHECK (true);

-- Add table comments
COMMENT ON TABLE public.password_reset_otps IS 'Stores one-time password codes for password reset';
COMMENT ON COLUMN public.password_reset_otps.email IS 'User email address';
COMMENT ON COLUMN public.password_reset_otps.otp IS 'One-time password code for verification';
COMMENT ON COLUMN public.password_reset_otps.expires_at IS 'Timestamp when the OTP expires';
COMMENT ON COLUMN public.password_reset_otps.is_used IS 'Whether the OTP has been used for password reset'; 