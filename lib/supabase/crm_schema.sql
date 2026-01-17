-- Add crm_stage column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS crm_stage TEXT DEFAULT 'new';

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_crm_stage ON public.bookings(crm_stage);

-- Comment: 
-- Stages: 'new', 'contacted', 'proposal', 'won', 'lost'
