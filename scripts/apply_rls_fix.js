const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyFix() {
  await client.connect();
  try {
    // 1. Enable RLS
    await client.query(`ALTER TABLE "tour_segments" ENABLE ROW LEVEL SECURITY;`);
    
    // 2. Add Policy (Drop if exists to avoid error)
    await client.query(`
      DROP POLICY IF EXISTS "Enable read access for all users" ON "tour_segments";
      CREATE POLICY "Enable read access for all users"
      ON "tour_segments" FOR SELECT
      TO public
      USING (true);
    `);
    console.log('RLS Policy applied successfully.');
  } catch (err) {
    console.error('Error applying fix:', err);
  } finally {
    await client.end();
  }
}

applyFix();
