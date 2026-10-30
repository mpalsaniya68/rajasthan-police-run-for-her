import fs from "fs";
import path from "path";
import { db, initDatabase } from "./db.js";

async function runBackup() {
  await initDatabase();

  const backupDir = path.resolve("./data/backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const filename = `backup_rajpol_${timestamp}.json`;
  const filePath = path.join(backupDir, filename);

  console.log(`[Backup] Starting Rajasthan Police Marathon Database Backup...`);

  // Fetch all tables
  const participants = await db.execute("SELECT * FROM participants ORDER BY created_at ASC;");
  const timingScans = await db.execute("SELECT * FROM timing_scans ORDER BY id ASC;");
  const auditLogs = await db.execute("SELECT * FROM audit_logs ORDER BY id ASC;");
  const adminUsers = await db.execute("SELECT id, username, role, full_name, created_at FROM admin_users;");

  const backupPayload = {
    metadata: {
      organization: "Rajasthan Police Headquarters, Jaipur",
      event: "Rajasthan Police Marathon 2026 - RUN FOR HER",
      generatedAt: now.toISOString(),
      counts: {
        participants: participants.rows.length,
        timingScans: timingScans.rows.length,
        auditLogs: auditLogs.rows.length,
        adminUsers: adminUsers.rows.length
      }
    },
    participants: participants.rows,
    timingScans: timingScans.rows,
    auditLogs: auditLogs.rows,
    adminUsers: adminUsers.rows
  };

  fs.writeFileSync(filePath, JSON.stringify(backupPayload, null, 2), "utf-8");

  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║  ✅ RAJASTHAN POLICE DATABASE BACKUP COMPLETED                          ║
╚════════════════════════════════════════════════════════════════════════╝
  ► Backup File:       data/backups/${filename}
  ► Total Runners:     ${participants.rows.length}
  ► Timing Scans:      ${timingScans.rows.length}
  ► Audit Logs:        ${auditLogs.rows.length}
  ► Timestamp:         ${now.toLocaleString("en-IN")}
──────────────────────────────────────────────────────────────────────────
`);
}

runBackup().catch((err) => {
  console.error("[Backup Error]:", err);
  process.exit(1);
});
