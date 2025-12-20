-- Create Clients Table (CRM Core)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    whatsapp_status TEXT DEFAULT 'untouched', -- 'untouched', 'contacted', 'lead', 'customer'
    tags TEXT[] DEFAULT '{}', -- ['vip', 'blackwork', 'bad-payer']
    notes TEXT,
    total_spent NUMERIC DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    last_visit TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Allow Admin (Service Role) full access
CREATE POLICY "Service Role Full Access" ON clients
    FOR ALL
    USING (auth.role() = 'service_role');

-- Allow Authenticated Users (Admins) to read/write
-- Assuming we want all authenticated staff to see clients
CREATE POLICY "Staff Read Access" ON clients
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Staff Write Access" ON clients
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff Update Access" ON clients
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_total_spent ON clients(total_spent DESC);
