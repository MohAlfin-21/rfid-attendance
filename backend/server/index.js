import cors from "cors";
import express from "express";
import pool, { testConnection, healthCheck } from "./db.pg.js";
import { isDemoMode, toggleDemoMode, getDemoStatus, initDemoModeFromDB } from "./demoMode.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - lebih spesifik
app.use(
  cors({
    origin: ["https://rfid-attendance-sage.vercel.app", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbHealth = await healthCheck();
  res.status(dbHealth.connected ? 200 : 503).json({
    status: dbHealth.status,
    database: dbHealth.connected,
    timestamp: new Date().toISOString(),
    error: dbHealth.error || null,
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "API RFID Attendance (PostgreSQL) OK",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/attendance", "/api/demoMode", "/health"],
  });
});

/* DEMO MODE */
app.put("/api/demoMode", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const mode = toggleDemoMode();
    await client.query("UPDATE system_settings SET value = $1 WHERE key = 'demo_mode'", [mode.toString()]);
    res.json({ demoMode: mode });
  } catch (error) {
    console.error("❌ Error toggling demo mode:", error);
    res.status(500).json({
      error: "Failed to toggle demo mode",
      details: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

/* ATTENDANCE - POST */
app.post("/api/attendance", async (req, res) => {
  let client;
  try {
    const { uid, timestamp, deviceCode = "GATE-01" } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID wajib diisi" });
    }

    client = await pool.connect();
    const scannedAt = timestamp ? new Date(timestamp) : new Date();

    // Cek student
    const student = await client.query("SELECT id, name FROM students WHERE uid_rfid = $1", [uid]);

    if (!student.rows.length) {
      return res.status(404).json({
        error: "UID tidak terdaftar",
        uid: uid,
      });
    }

    // Cek device
    const device = await client.query("SELECT id FROM devices WHERE code = $1", [deviceCode]);

    const status = isDemoMode() ? getDemoStatus() : "on_time";

    // Insert attendance
    await client.query(
      `INSERT INTO attendance (student_id, device_id, scanned_at, status)
       VALUES ($1, $2, $3, $4)`,
      [student.rows[0].id, device.rows[0]?.id || null, scannedAt, status]
    );

    console.log(`✅ Attendance recorded: ${student.rows[0].name} - ${status}`);

    res.json({
      success: true,
      name: student.rows[0].name,
      status,
      timestamp: scannedAt,
    });
  } catch (error) {
    console.error("❌ Error recording attendance:", error);
    res.status(500).json({
      error: "Failed to record attendance",
      details: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

/* ATTENDANCE - GET with FILTER */
app.get("/api/attendance", async (req, res) => {
  let client;
  try {
    const range = req.query.range || "all";
    console.log(`📊 Fetching attendance data (range: ${range})...`);

    let where = "";
    const params = [];

    if (range === "today") {
      where = `
        WHERE a.scanned_at >= 
        ((NOW() AT TIME ZONE 'Asia/Jakarta')::date AT TIME ZONE 'Asia/Jakarta')
      `;
    } else if (range === "week") {
      where = `
        WHERE a.scanned_at >= 
        (NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '7 days'
      `;
    }

    client = await pool.connect();

    const result = await client.query(`
      SELECT 
        a.id, 
        s.name, 
        s.uid_rfid,
        a.scanned_at AS timestamp, 
        a.status,
        COALESCE(d.code, 'GATE-01') AS "deviceId"
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      LEFT JOIN devices d ON d.id = a.device_id
      ${where}
      ORDER BY a.scanned_at DESC
      LIMIT 100
    `);

    console.log(`✅ Found ${result.rows.length} attendance records`);

    // Set header untuk prevent caching
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    console.error("   Query range:", req.query.range);
    console.error("   Error details:", error.message);

    res.status(500).json({
      error: "Failed to fetch attendance",
      details: error.message,
      range: req.query.range,
    });
  } finally {
    if (client) client.release();
  }
});

/* SYSTEM SETTINGS INITIALIZATION */
async function initSystemSettings() {
  let client;
  try {
    client = await pool.connect();

    // Cek apakah table system_settings ada
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.warn("⚠️  Table 'system_settings' tidak ditemukan!");
      console.warn("   Skipping demo mode initialization");
      return;
    }

    const res = await client.query("SELECT value FROM system_settings WHERE key = 'demo_mode'");

    const demoValue = res.rows[0]?.value ?? "false";
    initDemoModeFromDB(demoValue);

    console.log(`✅ Demo mode initialized: ${demoValue}`);
  } catch (error) {
    console.error("❌ Error initializing system settings:", error.message);
    // Don't throw - let server start anyway
  } finally {
    if (client) client.release();
  }
}

/* SERVER STARTUP */
async function start() {
  try {
    console.log("\n🚀 Starting RFID Attendance API...\n");

    // 1. Test database connection
    console.log("🔍 Step 1: Testing PostgreSQL connection...");
    const connected = await testConnection();

    if (!connected) {
      console.error("\n⛔ STARTUP FAILED - Cannot connect to database!");
      console.error("\n📋 Troubleshooting checklist:");
      console.error("   ✓ Railway database sudah running?");
      console.error("   ✓ DATABASE_URL di .env benar?");
      console.error("   ✓ SSL certificate issue?");
      console.error("   ✓ Network firewall blocking connection?");
      process.exit(1);
    }

    // 2. Initialize system settings
    console.log("\n🔍 Step 2: Initializing system settings...");
    await initSystemSettings();

    // 3. Start Express server
    console.log("\n🔍 Step 3: Starting Express server...");
    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n✅ SERVER READY!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔗 Database: Connected to Railway PostgreSQL`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    });
  } catch (error) {
    console.error("\n❌ FATAL ERROR during startup:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n👋 SIGTERM received, closing database pool...");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n👋 SIGINT received, closing database pool...");
  await pool.end();
  process.exit(0);
});

start();
