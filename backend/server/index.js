import express from "express";
import cors from "cors";
import { pool, testConnection } from "./db.pg.js";
import { isDemoMode, toggleDemoMode, getDemoStatus, initDemoModeFromDB } from "./demoMode.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API RFID Attendance (PostgreSQL) OK");
});

/* DEMO MODE */
app.put("/api/demoMode", async (req, res) => {
  try {
    const mode = toggleDemoMode();
    await pool.query("UPDATE system_settings SET value = $1 WHERE key = 'demo_mode'", [mode.toString()]);
    res.json({ demoMode: mode });
  } catch (error) {
    console.error('Error toggling demo mode:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ATTENDANCE */
app.post("/api/attendance", async (req, res) => {
  try {
    const { uid, timestamp, deviceCode = "GATE-01" } = req.body;
    if (!uid) return res.status(400).json({ error: "UID wajib" });

    const scannedAt = timestamp ? new Date(timestamp) : new Date();

    const student = await pool.query("SELECT id, name FROM students WHERE uid_rfid = $1", [uid]);
    if (!student.rows.length) return res.status(404).json({ error: "UID tidak terdaftar" });

    const device = await pool.query("SELECT id FROM devices WHERE code = $1", [deviceCode]);

    const status = isDemoMode() ? getDemoStatus() : "on_time";

    await pool.query(
      `INSERT INTO attendance (student_id, device_id, scanned_at, status)
       VALUES ($1,$2,$3,$4)`,
      [student.rows[0].id, device.rows[0]?.id || null, scannedAt, status]
    );

    res.json({ success: true, name: student.rows[0].name, status });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

/* FILTER */
app.get("/api/attendance", async (req, res) => {
  try {
    const range = req.query.range || "all";

    let where = "";
    if (range === "today") {
      where = `
        WHERE a.scanned_at >=
        ((NOW() AT TIME ZONE 'Asia/Jakarta')::date AT TIME ZONE 'Asia/Jakarta')
      `;
    }
    if (range === "week") {
      where = `
        WHERE a.scanned_at >=
        (NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '7 days'
      `;
    }

    const result = await pool.query(`
      SELECT a.id, s.name, a.scanned_at AS timestamp, a.status,
             COALESCE(d.code,'GATE-01') AS deviceId
      FROM attendance a
      JOIN students s ON s.id=a.student_id
      LEFT JOIN devices d ON d.id=a.device_id
      ${where}
      ORDER BY a.scanned_at DESC
      LIMIT 50
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

/* INIT */
async function initSystemSettings() {
  try {
    const res = await pool.query("SELECT value FROM system_settings WHERE key='demo_mode'");
    initDemoModeFromDB(res.rows[0]?.value ?? "false");
    console.log("✅ Demo mode initialized");
  } catch (error) {
    console.error('❌ Error initializing system settings:', error.message);
    throw error;
  }
}

async function start() {
  try {
    // Test koneksi database dulu
    console.log('🔍 Testing PostgreSQL connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('\n⚠️  GAGAL KONEKSI KE DATABASE!');
      console.error('Pastikan:');
      console.error('1. PostgreSQL sudah running');
      console.error('2. Database "rfid_attendance" sudah dibuat');
      console.error('3. User dan password di .env sudah benar');
      console.error('4. Tabel sudah di-create (jalankan SQL schema)');
      process.exit(1);
    }

    // Initialize system settings
    await initSystemSettings();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 API PostgreSQL running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();