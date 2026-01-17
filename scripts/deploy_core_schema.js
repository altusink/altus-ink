require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL // Vercel/Supabase Standard
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to DB. Applying Admin OS Core Migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251220180000_admin_os_core.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Run it
    await client.query(sql);
    
    console.log('✅ Admin OS Core Schema Applied Successfully!');
  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
