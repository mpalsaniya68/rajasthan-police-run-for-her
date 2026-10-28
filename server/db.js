import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { hashPassword } from "./security.js";

// Ensure data directory exists for local development
const dataDir = path.resolve("./data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Auto-load .env or .env.local file if present
try {
  if (typeof process.loadEnvFile === "function") {
    if (fs.existsSync(".env")) {
      process.loadEnvFile(".env");
    } else if (fs.existsSync(".env.local")) {
      process.loadEnvFile(".env.local");
    }
  }
} catch (e) {
  // Ignore if not present
}

// Check for Turso Database URL; fallback to local persistent SQLite
const isProductionTurso = Boolean(process.env.TURSO_DATABASE_URL);
const dbUrl = process.env.TURSO_DATABASE_URL || "file:data/rajasthan_police_marathon.db";
const dbAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken
});

console.log(`[DB] Connected to: ${isProductionTurso ? "Turso Cloud Edge DB" : "Local SQLite (data/rajasthan_police_marathon.db)"}`);

/**
 * Initialize Database Schema with Indexes for high concurrency (400,000+ records)
 */
export async function initDatabase() {
  try {
    // 1. Participants Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        bib_number TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        gender TEXT NOT NULL,
        dob TEXT NOT NULL,
        mobile TEXT NOT NULL,
        masked_mobile TEXT NOT NULL,
        emergency_contact TEXT NOT NULL,
        emergency_relation TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        category_id TEXT NOT NULL,
        category_name TEXT NOT NULL,
        district_id TEXT NOT NULL,
        district_name TEXT NOT NULL,
        tshirt_size TEXT NOT NULL,
        id_type TEXT,
        id_last4 TEXT,
        institution TEXT,
        batch_id TEXT,
        certificate_id TEXT UNIQUE NOT NULL,
        qr_token TEXT NOT NULL,
        medical_condition TEXT DEFAULT '',
        medical_notes TEXT DEFAULT '',
        kit_collected INTEGER DEFAULT 0,
        kit_collected_at TEXT,
        rfid_tag_id TEXT DEFAULT '',
        collected_by TEXT DEFAULT '',
        status TEXT DEFAULT 'CONFIRMED',
        finish_time TEXT,
        overall_rank INTEGER,
        gender_rank INTEGER,
        created_at TEXT NOT NULL
      );
    `);

    // Migration helper for existing databases
    try {
      await db.execute("ALTER TABLE participants ADD COLUMN medical_condition TEXT DEFAULT '';");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE participants ADD COLUMN medical_notes TEXT DEFAULT '';");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE participants ADD COLUMN kit_collected INTEGER DEFAULT 0;");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE participants ADD COLUMN kit_collected_at TEXT;");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE participants ADD COLUMN rfid_tag_id TEXT DEFAULT '';");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE participants ADD COLUMN collected_by TEXT DEFAULT '';");
    } catch (e) {}

    // High-performance B-tree indexes for fast lookups
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_participants_bib ON participants(bib_number);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_participants_mobile ON participants(mobile);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_participants_cert ON participants(certificate_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_participants_cat ON participants(category_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_participants_dist ON participants(district_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);`);

    // 2. Timing Scans Table (RFID checkpoints)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS timing_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bib_number TEXT NOT NULL,
        checkpoint_id TEXT NOT NULL,
        checkpoint_name TEXT NOT NULL,
        km REAL NOT NULL,
        scan_time TEXT NOT NULL,
        elapsed_seconds INTEGER NOT NULL,
        pace TEXT,
        speed_kmh REAL,
        created_at TEXT NOT NULL
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_timing_bib ON timing_scans(bib_number);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_timing_checkpoint ON timing_scans(checkpoint_id);`);

    // 3. Admin Users Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 4. Audit Logs Table (Government Compliance)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // Seed default admin if missing (default admin: rajpolice / RajPol#2026)
    const adminHash = hashPassword('RajPol#2026');
    const adminCheck = await db.execute(`SELECT count(*) as count FROM admin_users;`);
    if (adminCheck.rows[0].count === 0) {
      await db.execute({
        sql: `INSERT INTO admin_users (id, username, password_hash, role, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          'admin-01',
          'rajpolice',
          adminHash,
          'SUPER_ADMIN',
          'Police State Nodal Officer',
          new Date().toISOString()
        ]
      });
      console.log(`[DB] Seeded default secure police admin account.`);
    } else {
      // Ensure password hash matches
      await db.execute({
        sql: `UPDATE admin_users SET password_hash = ? WHERE username = 'rajpolice'`,
        args: [adminHash]
      });
    }

    // Seed initial realistic participants if empty so dashboard and tracker immediately work
    const countRes = await db.execute(`SELECT count(*) as count FROM participants;`);
    if (countRes.rows[0].count === 0) {
      await seedInitialParticipants();
    }

    console.log(`[DB] Schema & Indexes initialized successfully.`);
  } catch (err) {
    console.error("[DB Init Error]:", err);
  }
}

async function seedInitialParticipants() {
  const samples = [
    {
      id: "P-1048",
      bib: "RJ-21K-1048",
      name: "पूजा चौधरी (Pooja Choudhary)",
      gender: "female",
      dob: "1997-04-12",
      mobile: "9829012345",
      masked: "XXXXXX2345",
      emergency: "9829099887",
      relation: "पिता (Father)",
      blood: "B+",
      catId: "21k",
      catName: "21 KM Half Marathon",
      distId: "jaipur_comm",
      distName: "जयपुर पुलिस कमिश्नरेट (Jaipur)",
      tshirt: "M",
      certId: "RJ-POL-2026-9482",
      status: "ON_TRACK",
      overallRank: 14,
      genderRank: 3,
      finishTime: null
    },
    {
      id: "P-3419",
      bib: "RJ-10K-3419",
      name: "विक्रम सिंह शेखावत (Vikram Singh)",
      gender: "male",
      dob: "1994-08-20",
      mobile: "9414012345",
      masked: "XXXXXX2345",
      emergency: "9414099887",
      relation: "भाई (Brother)",
      blood: "O+",
      catId: "10k",
      catName: "10 KM Speed Challenge",
      distId: "jodhpur_comm",
      distName: "जोधपुर पुलिस कमिश्नरेट",
      tshirt: "L",
      certId: "RJ-POL-2026-5120",
      status: "FINISHED",
      overallRank: 8,
      genderRank: 6,
      finishTime: "00:46:12"
    },
    {
      id: "P-9120",
      bib: "RJ-21K-9120",
      name: "आरती शर्मा (Aarti Sharma)",
      gender: "female",
      dob: "2000-01-15",
      mobile: "9166012345",
      masked: "XXXXXX2345",
      emergency: "9166099887",
      relation: "माता (Mother)",
      blood: "A+",
      catId: "21k",
      catName: "21 KM Half Marathon",
      distId: "kota_city",
      distName: "कोटा शहर पुलिस",
      tshirt: "S",
      certId: "RJ-POL-2026-8814",
      status: "ON_TRACK",
      overallRank: 32,
      genderRank: 9,
      finishTime: null
    },
    {
      id: "P-7714",
      bib: "RJ-05K-7714",
      name: "दीपक कुमार मीणा (Deepak Meena)",
      gender: "male",
      dob: "1999-11-05",
      mobile: "9928012345",
      masked: "XXXXXX2345",
      emergency: "9928099887",
      relation: "मित्र (Friend)",
      blood: "AB+",
      catId: "5k",
      catName: "5 KM Community Run",
      distId: "udaipur",
      distName: "उदयपुर पुलिस",
      tshirt: "XL",
      certId: "RJ-POL-2026-7714",
      status: "FINISHED",
      overallRank: 24,
      genderRank: 19,
      finishTime: "00:23:45"
    }
  ];

  for (const s of samples) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO participants (
        id, bib_number, full_name, gender, dob, mobile, masked_mobile, emergency_contact, emergency_relation, blood_group,
        category_id, category_name, district_id, district_name, tshirt_size, certificate_id, qr_token, status,
        overall_rank, gender_rank, finish_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        s.id, s.bib, s.name, s.gender, s.dob, s.mobile, s.masked, s.emergency, s.relation, s.blood,
        s.catId, s.catName, s.distId, s.distName, s.tshirt, s.certId, `SEC-TOKEN-${s.bib}`, s.status,
        s.overallRank, s.genderRank, s.finishTime, new Date().toISOString()
      ]
    });
  }

  // Also seed initial timing scans for live tracker
  const scans = [
    { bib: "RJ-21K-1048", cp: "start", name: "Albert Hall Start Gantry", km: 0.0, time: "06:00:00 AM", el: 0, pace: "0:00", speed: 0 },
    { bib: "RJ-21K-1048", cp: "birla_mandir", name: "Birla Mandir", km: 2.5, time: "06:12:45 AM", el: 765, pace: "5:06 min/km", speed: 11.8 },
    { bib: "RJ-21K-1048", cp: "ru_gate", name: "Rajasthan University Gate", km: 5.0, time: "06:25:30 AM", el: 1530, pace: "5:06 min/km", speed: 11.8 },
    { bib: "RJ-21K-1048", cp: "wtp", name: "World Trade Park (WTP)", km: 10.0, time: "06:51:10 AM", el: 3070, pace: "5:07 min/km", speed: 11.7 },
    { bib: "RJ-10K-3419", cp: "start", name: "Albert Hall Start Gantry", km: 0.0, time: "06:15:00 AM", el: 0, pace: "0:00", speed: 0 },
    { bib: "RJ-10K-3419", cp: "ru_gate", name: "Rajasthan University Gate", km: 5.0, time: "06:37:30 AM", el: 1350, pace: "4:30 min/km", speed: 13.3 },
    { bib: "RJ-10K-3419", cp: "finish", name: "Albert Hall Grand Finish Line", km: 10.0, time: "07:01:12 AM", el: 2772, pace: "4:37 min/km", speed: 13.0 }
  ];

  for (const sc of scans) {
    await db.execute({
      sql: `INSERT INTO timing_scans (bib_number, checkpoint_id, checkpoint_name, km, scan_time, elapsed_seconds, pace, speed_kmh, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [sc.bib, sc.cp, sc.name, sc.km, sc.time, sc.el, sc.pace, sc.speed, new Date().toISOString()]
    });
  }

  console.log(`[DB] Seeded initial participant & timing records.`);
}
