
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTour() {
  console.log('Checking tour_segments...');
  const { data, error } = await supabase.from('tour_segments').select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Count:', data.length);
  console.log('Segments:', JSON.stringify(data, null, 2));
}

checkTour();
