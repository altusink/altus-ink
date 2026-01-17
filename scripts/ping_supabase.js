require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing URL or Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey || supabaseKey);

async function check() {
  console.log(`📡 Pinging Supabase Project: ${supabaseUrl}`);
  
  // Try to read 'integrations' table to confirm the migration worked
  const { data, error } = await supabase.from('integrations').select('name').limit(1);

  if (error) {
    if (error.code === '42P01') {
        console.error('❌ Table "integrations" NOT FOUND. Migration failed.');
    } else {
        console.error('⚠️  Connected but error reading integrations:', error.message);
    }
  } else {
    console.log(`✅ Table "integrations" found! (${data.length} rows)`);
  }

  // Also check Auth
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
      console.log('⚠️ Auth Error:', authError.message);
  } else {
      console.log('✅ Auth Service is reachable.');
  }
}

check();
