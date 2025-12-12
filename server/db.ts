import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Validate DATABASE_URL with better error messages for debugging
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("[db] ERROR: DATABASE_URL environment variable is not set!");
  console.error("[db] Available environment variables:", Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASSWORD')).join(', '));
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database or link it to the service?",
  );
}

// Log connection info (masked for security)
const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`[db] Connecting to database: ${maskedUrl.substring(0, 50)}...`);

// Create pool with connection error handling
export const pool = new Pool({
  connectionString: databaseUrl,
  // Add connection timeout for Railway
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

pool.on('connect', () => {
  console.log('[db] New client connected to database');
});

export const db = drizzle(pool, { schema });

console.log('[db] Drizzle ORM initialized successfully');

