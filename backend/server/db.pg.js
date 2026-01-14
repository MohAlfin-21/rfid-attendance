import pkg from "pg";
const { Pool } = pkg;

// Pool tunggal, pakai DATABASE_URL dari Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Optional: listener error global
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL error:", err);
});

// Test koneksi (dipanggil saat startup)
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected!");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:");
    console.error("   Message:", err.message);
    return false;
  }
}

export default pool;
