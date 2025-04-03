-- Drop existing policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON email_verification;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON email_verification;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON email_verification;

-- Allow anyone to insert (needed for signup flow)
CREATE POLICY "Allow insert for all users" ON email_verification
    FOR INSERT
    WITH CHECK (true);

-- Allow users to select their own email verification records
CREATE POLICY "Allow select own records" ON email_verification
    FOR SELECT
    USING (auth.uid() IS NULL OR email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ));

-- Allow users to delete their own email verification records
CREATE POLICY "Allow delete own records" ON email_verification
    FOR DELETE
    USING (auth.uid() IS NULL OR email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )); 