import pkg from "pg";
import "dotenv/config";
const { Pool } = pkg;

// HARDCODE SEMENTARA - UNTUK TESTING
// Setelah jalan, baru pindah ke .env
const config = {
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
};

export const pool = new Pool(config);

pool.on("error", (err, client) => {
  console.error("❌ Unexpected error on idle client", err);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected!");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:");
    console.error("   Message:", err.message);
    console.error("   Config:", config);
    return false;
  }
}
