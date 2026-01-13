// src/utils/dummyGenerator.js

const STUDENTS = [
  "Ahmad Fauzi",
  "Budi Santoso",
  "Citra Kirana",
  "Dewi Lestari",
  "Eko Prasetyo",
  "Fajar Nugraha",
  "Gita Gutawa",
  "Hendra Wijaya",
  "Indah Permatasari",
  "Joko Anwar",
  "Kartika Putri",
  "Lukman Sardi",
  "Maudy Ayunda",
  "Nicholas Saputra",
  "Oki Setiana",
  "Putri Titian",
  "Qory Sandioriva",
  "Reza Rahadian",
  "Sherina Munaf",
  "Tulus Rusydi",
];

const DEVICE_IDS = ["GATE-01", "GATE-02", "LIB-01"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function generateSemesterData(monthsBack = 4) {
  const data = [];
  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - monthsBack);

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    STUDENTS.forEach((name, index) => {
      // 10% chance student is absent
      if (Math.random() > 0.9) return;

      // Generate tap time between 06:30 - 07:30
      const hour = 6;
      let minute = getRandomInt(30, 90);

      const tapTime = new Date(d);
      tapTime.setHours(hour, 0, 0);
      tapTime.setMinutes(minute);
      tapTime.setSeconds(getRandomInt(0, 59));

      // Determine status - FIXED: use underscore format
      const isLate = tapTime.getHours() >= 7 && tapTime.getMinutes() > 0;
      const status = isLate ? "late" : "on_time"; // ✅ FIXED: lowercase with underscore

      data.push({
        id: `rfid-${d.getTime()}-${index}`,
        name: name,
        timestamp: formatDate(tapTime),
        status: status, // ✅ Now: "late" or "on_time"
        deviceId: DEVICE_IDS[getRandomInt(0, 2)],
      });
    });
  }

  // Sort descending (newest first)
  return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
