-- Create consent_forms table
CREATE TABLE IF NOT EXISTS consent_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    document_id TEXT NOT NULL,
    health_declaration JSONB DEFAULT '{}'::jsonb,
    signature_base64 TEXT NOT NULL,
    client_ip TEXT,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by booking_id
CREATE INDEX IF NOT EXISTS idx_consent_forms_booking_id ON consent_forms(booking_id);

-- RLS Policies
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admins can do everything on consent_forms"
    ON consent_forms
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('admin', 'ceo', 'manager')
        )
    );

-- Policy: Public can insert (via Server Action with Service Role, but let's allow anon insert if we wanted to do it client side, though we are doing server action.
-- Actually, for the signature page which is public, we might need anon insert if we were using client sdk, but we will use Server Action with Service Role or strict RLS. 
-- Since the user isn't logged in when signing, we'll likely use a Server Action with the Service Role (bypass RLS) or allow anon insert for specific booking IDs? 
-- The safest is to use the Server Action with `createClient` (server component) or `supabaseAdmin`. 
-- Let's stick to the Admin policy for reading.
-- We will rely on the Server Action to Insert, so we don't need a public INSERT policy if we use the Service Role key in the action.
-- But wait, standard server actions use the user's session. The client signing is unauthenticated.
-- So we MUST use the Service Role in the Server Action to insert the consent form.

-- We do need a policy to READ the consent form if we want the Admin to see it on the dashboard.
