-- Create tour_locations table
CREATE TABLE IF NOT EXISTS tour_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name TEXT NOT NULL UNIQUE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    maps_link TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tour_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read (needed for Confirmation Page)
CREATE POLICY "Public Read Locations"
ON tour_locations FOR SELECT
TO public
USING (true);

-- Policy: Admin Full Access (Authenticated users)
CREATE POLICY "Admin Full Access Locations"
ON tour_locations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
