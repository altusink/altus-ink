-- Add terms_accepted columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Optional: If we want to store IP/UserAgent for the check-to-agree action specifically (redundant if using consent_forms but good for strict audit)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS client_ip TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;
