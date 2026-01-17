require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function analyze() {
  console.log('🔍 Analyzing Database Schema...');
  
  // Query to get all table names in public schema. 
  // We can't query information_schema directly with supabase-js easily unless we use rpc or if we have permissions.
  // Actually, we can use a raw query if we had a pg client, but here we are using supabase-js.
  // We will assume standard tables and try to list them or use a known tricky way?
  // Since I can't run raw SQL easily without a function, I will try to infer or I will try to connect via PG again?
  // Wait, I established that REST is working but Direct DB (PG) is fickle/broken for the user or me.
  
  // Let's try to query a standard list of known potential legacy tables to check existence.
  // Known modern tables: 
  // - users, bookings, artists, tours, tour_locations, tour_segments, availability, 
  // - admin_settings, integrations, ai_audit_logs, 
  // - portfolio_images, reviews
  
  // Potential junk from previous versions:
  // - system_settings (replaced by admin_settings)
  // - artist_availability (maybe replaced by availability?)
  // - locations (maybe replaced by tour_locations?)
  
  const tablesToCheck = [
      'users', 'bookings', 'artists', 'tours', 'tour_locations', 'tour_segments', 
      'availability', 'admin_settings', 'integrations', 'ai_audit_logs',
      'portfolio_images', 'reviews', 'system_settings', 'artist_availability', 'locations', 'crm_customers', 'leads'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of tablesToCheck) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (!error) {
          existingTables.push(table);
      } else {
         // console.log(`Table ${table}: ${error.message}`);
         missingTables.push(table);
      }
  }

  console.log('\n✅ Existing Tables:', existingTables.join(', '));
  console.log('❌ Missing/Checked Tables:', missingTables.join(', '));
}

analyze();
