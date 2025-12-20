-- Add feedback_email_sent to bookings table for cron job tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS feedback_email_sent BOOLEAN DEFAULT FALSE;

-- Index for faster cron queries
CREATE INDEX IF NOT EXISTS idx_bookings_feedback_sent ON bookings (feedback_email_sent) WHERE status = 'CONFIRMED';
