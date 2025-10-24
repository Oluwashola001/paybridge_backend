// db.js
import pg from "pg";
import dotenv from "dotenv";

// ✅ Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { Pool } = pg;

// Use individual variables OR DATABASE_URL from Render/environment
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provides this, it's generally preferred
  // Or fallback to individual variables if DATABASE_URL isn't set (less common for Render)
  // user: process.env.PGUSER,
  // host: process.env.PGHOST,
  // database: process.env.PGDATABASE,
  // password: process.env.PGPASSWORD,
  // port: process.env.PGPORT,
});


// Test connection (This will now run correctly using Render's DATABASE_URL)
pool
  .connect()
  .then(() => console.log("✅ Attempted DB connection (check logs above for success/failure)")) // Changed log slightly
  .catch((err) => console.error("❌ DB connection attempt failed:", err)); // Changed log slightly