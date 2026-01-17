const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  try {
    const sqlPath = path.join(__dirname, '../supabase/migrations/20251219220000_create_tour_locations.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log('Migration tour_locations applied successfully.');
  } catch (err) {
    console.error('Error applying migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
