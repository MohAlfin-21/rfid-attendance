CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  uid_rfid TEXT UNIQUE
);

CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  uid_rfid TEXT,
  timestamp TEXT,
  status TEXT
)

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO system_settings (key, value)
VALUES ('demo_mode', 'false');

