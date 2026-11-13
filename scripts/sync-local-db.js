import { createClient } from "@libsql/client";

const localDb = createClient({ url: "file:data/rajasthan_police_marathon.db" });

async function migrate() {
  const alterCols = [
    "ALTER TABLE participants ADD COLUMN medical_condition TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN medical_notes TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN kit_collected INTEGER DEFAULT 0",
    "ALTER TABLE participants ADD COLUMN kit_collected_at TEXT",
    "ALTER TABLE participants ADD COLUMN rfid_tag_id TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN collected_by TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN email TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN id_masked TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN id_raw TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN fee_amount INTEGER DEFAULT 0",
    "ALTER TABLE participants ADD COLUMN payment_status TEXT DEFAULT 'PAID'",
    "ALTER TABLE participants ADD COLUMN order_id TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN transaction_id TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN payment_method TEXT DEFAULT 'UPI'",
    "ALTER TABLE participants ADD COLUMN paid_at TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN id_hash TEXT DEFAULT ''",
    "ALTER TABLE participants ADD COLUMN gate_entered INTEGER DEFAULT 0",
    "ALTER TABLE participants ADD COLUMN gate_entry_time TEXT",
    "ALTER TABLE participants ADD COLUMN certificate_issued INTEGER DEFAULT 0",
    "ALTER TABLE participants ADD COLUMN certificate_issued_at TEXT",
    "ALTER TABLE participants ADD COLUMN cert_template_type TEXT DEFAULT 'DISTRICT'"
  ];

  for (const sql of alterCols) {
    try {
      await localDb.execute(sql);
    } catch (e) {
      // Column may already exist
    }
  }

  // Insert or update Madan Palsaniya
  await localDb.execute({
    sql: `INSERT OR REPLACE INTO participants (
      id, bib_number, full_name, gender, dob, mobile, masked_mobile, emergency_contact, emergency_relation, blood_group,
      category_id, category_name, district_id, district_name, tshirt_size, certificate_id, qr_token, status,
      certificate_issued, overall_rank, gender_rank, finish_time, email, kit_collected, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'P-2fdfdd3a', 'RJ-21K-1009', 'Madan Palsaniya', 'male', '2000-01-01', '7023233248', 'XXXXXX3248',
      '7627002063', 'अभिभावक (Guardian)', 'B+', '21k', '21 KM Half Marathon', 'jaipur_comm',
      'जयपुर पुलिस कमिश्नरेट (Jaipur)', 'L', 'RJ-POL-2027-03ABE3', 'F90E5128EED1B2AD', 'CERT_ISSUED',
      1, 5, 4, '01:34:20', 'manvi8648@gmail.com', 1, '2026-11-11T03:03:57.686Z'
    ]
  });

  const check = await localDb.execute({
    sql: "SELECT id, bib_number, full_name, mobile, status, certificate_issued FROM participants WHERE mobile = ?",
    args: ["7023233248"]
  });
  console.log("Local SQLite Migration Done. Madan record:", check.rows);
}

migrate().catch(console.error);
