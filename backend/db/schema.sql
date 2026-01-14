-- Create Tables
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  uid_rfid VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  device_id INTEGER REFERENCES devices(id),
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'on_time'
);

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Data
INSERT INTO devices (code, name) VALUES
  ('GATE-01', 'Main Gate Entrance'),
  ('GATE-02', 'Back Gate Entrance'),
  ('LIB-01', 'Library Entrance')
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_settings (key, value) VALUES
  ('demo_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Insert Sample Students
INSERT INTO students (name, uid_rfid) VALUES
  ('Ahmad Fauzi', 'A1B2C3D4'),
  ('Budi Santoso', 'E5F6G7H8'),
  ('Citra Kirana', 'I9J0K1L2'),
  ('Dewi Lestari', 'M3N4O5P6'),
  ('Eko Prasetyo', 'Q7R8S9T0')
ON CONFLICT (uid_rfid) DO NOTHING;

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned ON attendance(scanned_at);
CREATE INDEX IF NOT EXISTS idx_students_uid ON students(uid_rfid);
```

**B. Import via pgAdmin:**
```
1. Di pgAdmin → Klik database "railway"
2. Tools → Query Tool
3. Copy-paste seluruh isi schema.sql
4. Klik Execute (⚡ icon)
5. Done! ✅