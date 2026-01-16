// backend/populate-db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

console.log("\n🚀 Populating Database with Sample Data...\n");

async function populateDatabase() {
  const client = await pool.connect();

  try {
    // 1. Insert Students
    console.log("📝 Step 1: Inserting students...");
    await client.query(`
      INSERT INTO students (name, uid_rfid) VALUES
        ('Ahmad Fauzi', 'A1B2C3D4'),
        ('Budi Santoso', 'E5F6G7H8'),
        ('Citra Kirana', 'I9J0K1L2'),
        ('Dewi Lestari', 'M3N4O5P6'),
        ('Eko Prasetyo', 'Q7R8S9T0'),
        ('Fajar Nugraha', 'U1V2W3X4'),
        ('Gita Gutawa', 'Y5Z6A7B8'),
        ('Hendra Wijaya', 'C9D0E1F2'),
        ('Indah Permata', 'G3H4I5J6'),
        ('Joko Anwar', 'K7L8M9N0')
      ON CONFLICT (uid_rfid) DO NOTHING
    `);
    console.log("✅ Students inserted!");

    // 2. Check devices exist
    console.log("\n📝 Step 2: Ensuring devices exist...");
    await client.query(`
      INSERT INTO devices (code, name) VALUES
        ('GATE-01', 'Main Gate Entrance'),
        ('GATE-02', 'Back Gate Entrance'),
        ('LIB-01', 'Library Entrance')
      ON CONFLICT (code) DO NOTHING
    `);
    console.log("✅ Devices ready!");

    // 3. Generate attendance records for today
    console.log("\n📝 Step 3: Generating attendance records...");
    
    const students = await client.query("SELECT id, name FROM students");
    const devices = await client.query("SELECT id FROM devices");
    
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(6, 30, 0, 0);

    let count = 0;
    
    for (const student of students.rows) {
      // Random time between 06:30 - 07:30
      const randomMinutes = Math.floor(Math.random() * 60);
      const scanTime = new Date(startOfDay);
      scanTime.setMinutes(scanTime.getMinutes() + randomMinutes);

      // Determine status
      const status = scanTime.getHours() === 7 && scanTime.getMinutes() > 0 ? "late" : "on_time";

      // Random device
      const deviceId = devices.rows[Math.floor(Math.random() * devices.rows.length)].id;

      await client.query(`
        INSERT INTO attendance (student_id, device_id, scanned_at, status)
        VALUES ($1, $2, $3, $4)
      `, [student.id, deviceId, scanTime, status]);

      count++;
      process.stdout.write(`\r   Inserting: ${count}/${students.rows.length}`);
    }

    console.log("\n✅ Attendance records created!");

    // 4. Summary
    console.log("\n📊 Database Summary:");
    const studentCount = await client.query("SELECT COUNT(*) FROM students");
    const attendanceCount = await client.query("SELECT COUNT(*) FROM attendance");
    const onTimeCount = await client.query("SELECT COUNT(*) FROM attendance WHERE status = 'on_time'");
    const lateCount = await client.query("SELECT COUNT(*) FROM attendance WHERE status = 'late'");

    console.log(`   👥 Students: ${studentCount.rows[0].count}`);
    console.log(`   📋 Total Attendance: ${attendanceCount.rows[0].count}`);
    console.log(`   ✅ On Time: ${onTimeCount.rows[0].count}`);
    console.log(`   ⚠️  Late: ${lateCount.rows[0].count}`);

    console.log("\n✅ DATABASE POPULATED SUCCESSFULLY! 🎉\n");

  } catch (error) {
    console.error("\n❌ Error populating database:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run
populateDatabase().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});