-- Create a table to track authentication rate limits
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- Email or IP address to track
  action_type TEXT NOT NULL, -- Type of action: login, signup, reset_password, verify_email
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Create an index for faster querying by identifier and action_type
  CONSTRAINT auth_rate_limits_identifier_action_type_idx UNIQUE (identifier, action_type, created_at)
);

-- Add RLS policies
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view
CREATE POLICY "Allow admins to view" ON public.auth_rate_limits
  FOR SELECT 
  TO authenticated
  USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ? 'is_admin'
  );

-- Add table comments
COMMENT ON TABLE public.auth_rate_limits IS 'Tracks authentication attempts for rate limiting';
COMMENT ON COLUMN public.auth_rate_limits.identifier IS 'Email or IP address being tracked';
COMMENT ON COLUMN public.auth_rate_limits.action_type IS 'Type of authentication action (login, signup, reset_password, verify_email)'; 