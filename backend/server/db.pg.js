import pkg from "pg";
const { Pool } = pkg;

// Pool configuration dengan timeout dan retry
const poolConfig = {
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 2,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Railway PostgreSQL butuh SSL tapi kadang tidak support
// Coba dulu dengan SSL, kalau gagal tanpa SSL
let pool;

if (process.env.DATABASE_URL) {
  // Gunakan DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...poolConfig,
    // SSL optional - Railway sometimes doesn't require it
    ssl: process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });
} else {
  // Fallback ke individual env vars
  pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    ...poolConfig,
    ssl: false, // Local development biasanya tanpa SSL
  });
}

// Error handler global
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL Pool Error:", err);
  console.error("   Code:", err.code);
  console.error("   Message:", err.message);
});

// Lebih detail test connection
export async function testConnection() {
  let client;
  try {
    console.log("🔗 Connecting to PostgreSQL...");
    console.log("   Host:", process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "unknown");

    client = await pool.connect();

    // Test query sederhana
    const result = await client.query("SELECT NOW() as time, current_database() as db");

    console.log("✅ PostgreSQL Connected Successfully!");
    console.log("   Database:", result.rows[0].db);
    console.log("   Server Time:", result.rows[0].time);

    return true;
  } catch (err) {
    console.error("\n❌ PostgreSQL Connection FAILED!");
    console.error("   Error Code:", err.code);
    console.error("   Message:", err.message);
    console.error("   Detail:", err.detail || "No additional details");

    // Debugging hints
    if (err.code === "ENOTFOUND") {
      console.error("\n💡 Hint: Database host tidak ditemukan. Cek DATABASE_URL");
    } else if (err.code === "ECONNREFUSED") {
      console.error("\n💡 Hint: Koneksi ditolak. Railway database mungkin sedang sleep");
    } else if (err.code === "28P01") {
      console.error("\n💡 Hint: Password salah");
    } else if (err.code === "3D000") {
      console.error("\n💡 Hint: Database tidak ada");
    }

    return false;
  } finally {
    if (client) client.release();
  }
}

// Health check function untuk endpoint
export async function healthCheck() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return { status: "healthy", connected: true };
  } catch (err) {
    return {
      status: "unhealthy",
      connected: false,
      error: err.message,
    };
  }
}

export default pool;
