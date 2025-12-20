-- Seed Bookings Data (Mock)

-- First, get the Artist ID for 'Danilo Santos' (should have been seeded already)
-- If not found, we fallback to NULL or create one (but we assume verify_and_seed.js ran)

WITH artist_ref AS (
  SELECT id FROM public.artists WHERE stage_name = 'Danilo Santos' LIMIT 1
)

INSERT INTO public.bookings (
  artist_id,
  client_name,
  client_email,
  client_phone,
  booking_date,
  booking_time,
  duration_hours,
  tattoo_type,
  tattoo_description,
  body_location,
  estimated_price,
  deposit_amount,
  status,
  created_at
) 
SELECT 
  id as artist_id,
  'Maria Silva',
  'maria.silva@example.com',
  '+5511988887777',
  CURRENT_DATE + 2, -- 2 days from now
  '14:00',
  4.0,
  'Realism',
  'Portrait of a lion with geometric elements',
  'Forearm',
  1200.00,
  200.00,
  'CONFIRMED',
  NOW() - INTERVAL '2 days'
FROM artist_ref

UNION ALL

SELECT 
  id as artist_id,
  'João Souza',
  'joao.souza@example.com',
  '+5511977776666',
  CURRENT_DATE + 5,
  '10:00',
  6.0,
  'Blackwork',
  'Full sleeve floral composition',
  'Arm',
  2500.00,
  500.00,
  'PENDING',
  NOW() - INTERVAL '1 day'
FROM artist_ref

UNION ALL

SELECT 
  id as artist_id,
  'Ana Costa',
  'ana.costa@example.com',
  '+5511966665555',
  CURRENT_DATE - 1, -- Yesterday
  '18:00',
  2.0,
  'Fineline',
  'Small butterfly',
  'Wrist',
  400.00,
  100.00,
  'COMPLETED',
  NOW() - INTERVAL '5 days'
FROM artist_ref;
