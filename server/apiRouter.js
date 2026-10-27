import crypto from "crypto";
import { db } from "./db.js";
import {
  registrationSchema,
  bulkRegistrationSchema,
  maskMobile,
  generateBibNumber,
  generateCertificateId,
  generateSecureQrToken,
  verifyPassword,
  registrationLimiter,
  adminLoginLimiter,
  sanitizeCsvCell
} from "./security.js";

const CATEGORY_NAMES = {
  "21k": "21 KM Half Marathon",
  "10k": "10 KM Speed Challenge",
  "5k": "5 KM Community Run",
  "2k": "2 KM Family & Senior Run"
};

const DISTRICT_NAMES = {
  "jaipur_comm": "जयपुर पुलिस कमिश्नरेट (Jaipur)",
  "jodhpur_comm": "जोधपुर पुलिस कमिश्नरेट (Jodhpur)",
  "kota_city": "कोटा शहर पुलिस (Kota)",
  "bikaner": "बीकानेर पुलिस (Bikaner)",
  "ajmer": "अजमेर पुलिस (Ajmer)",
  "udaipur": "उदयपुर पुलिस (Udaipur)",
  "alwar": "अलवर पुलिस (Alwar)",
  "bharatpur": "भरतपुर पुलिस (Bharatpur)",
  "sikar": "सीकर पुलिस (Sikar)"
};

/**
 * Main Centralized API Router
 * Dispatches requests from both Vite Dev Server and Vercel Serverless Function
 */
export async function handleApiRequest(req, res) {
  // Extract URL and path
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname.replace(/^\/api/, "") || "/";
  const method = req.method.toUpperCase();
  const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";

  // Helper response functions
  const json = (data, status = 200) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end(JSON.stringify(data));
  };

  const error = (message, status = 400) => json({ success: false, error: message }, status);

  // Handle CORS Pre-flight OPTIONS
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    return res.end();
  }

  try {
    // 1. Health & Status Check
    if (pathname === "/health" || pathname === "/" && method === "GET") {
      const countRes = await db.execute("SELECT count(*) as count FROM participants;");
      return json({
        status: "ok",
        service: "Rajasthan Police Marathon Official Backend",
        totalRegistered: countRes.rows[0].count,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Individual Runner Registration
    if (pathname === "/register" && method === "POST") {
      if (registrationLimiter.isRateLimited(clientIp)) {
        return error("अत्यधिक प्रयास। कृपया 1 मिनट बाद पुनः प्रयास करें (Rate limit exceeded).", 429);
      }

      const body = await parseJsonBody(req);
      const parsed = registrationSchema.safeParse(body);
      if (!parsed.success) {
        return error(parsed.error.errors[0]?.message || "अमान्य डेटा", 422);
      }

      const data = parsed.data;

      // Check if mobile already registered in this category
      const existing = await db.execute({
        sql: "SELECT id, bib_number FROM participants WHERE mobile = ? AND category_id = ?",
        args: [data.mobile, data.categoryId]
      });

      if (existing.rows.length > 0) {
        return error(`यह मोबाइल नंबर पहले से ${CATEGORY_NAMES[data.categoryId]} में पंजीकृत है (Bib: ${existing.rows[0].bib_number})`, 409);
      }

      // Generate Bib
      const countRes = await db.execute({
        sql: "SELECT count(*) as count FROM participants WHERE category_id = ?",
        args: [data.categoryId]
      });
      const counter = (Number(countRes.rows[0].count) || 0) + 1001;
      const bibNumber = generateBibNumber(data.categoryId, counter);
      const certificateId = generateCertificateId();
      const qrToken = generateSecureQrToken(bibNumber, certificateId);
      const participantId = `P-${crypto.randomBytes(4).toString("hex")}`;
      const now = new Date().toISOString();
      const catName = CATEGORY_NAMES[data.categoryId] || data.categoryId.toUpperCase();
      const distName = DISTRICT_NAMES[data.districtId] || data.districtId;

      await db.execute({
        sql: `INSERT INTO participants (
          id, bib_number, full_name, gender, dob, mobile, masked_mobile, emergency_contact, emergency_relation, blood_group,
          category_id, category_name, district_id, district_name, tshirt_size, id_type, id_last4, certificate_id, qr_token,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
        args: [
          participantId,
          bibNumber,
          data.fullName,
          data.gender,
          data.dob,
          data.mobile,
          maskMobile(data.mobile),
          data.emergencyContact,
          data.emergencyRelation,
          data.bloodGroup,
          data.categoryId,
          catName,
          data.districtId,
          distName,
          data.tshirtSize,
          data.idType || "Aadhaar",
          data.idLast4 || "XXXX",
          certificateId,
          qrToken,
          now
        ]
      });

      // Log Audit Trail
      await db.execute({
        sql: "INSERT INTO audit_logs (actor, action, details, ip, created_at) VALUES (?, ?, ?, ?, ?)",
        args: ["SYSTEM", "REGISTER_RUNNER", `Bib: ${bibNumber}, Name: ${data.fullName}`, clientIp, now]
      });

      return json({
        success: true,
        message: "पंजीकरण सफलतापूर्वक पूर्ण हुआ।",
        participant: {
          id: participantId,
          bibNumber,
          fullName: data.fullName,
          gender: data.gender,
          mobile: maskMobile(data.mobile),
          categoryName: catName,
          districtName: distName,
          certificateId,
          qrToken,
          status: "CONFIRMED",
          createdAt: now
        }
      }, 201);
    }

    // 3. Bulk / Institutional Registration
    if (pathname === "/bulk-register" && method === "POST") {
      const body = await parseJsonBody(req);
      const parsed = bulkRegistrationSchema.safeParse(body);
      if (!parsed.success) {
        return error(parsed.error.errors[0]?.message || "अमान्य बल्क डेटा", 422);
      }

      const { institution, districtId, runners } = parsed.data;
      const distName = DISTRICT_NAMES[districtId] || districtId;
      const batchId = `BATCH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const now = new Date().toISOString();
      const registeredRunners = [];

      for (let i = 0; i < runners.length; i++) {
        const r = runners[i];
        const countRes = await db.execute({
          sql: "SELECT count(*) as count FROM participants WHERE category_id = ?",
          args: [r.categoryId]
        });
        const counter = (Number(countRes.rows[0].count) || 0) + 1001;
        const bibNumber = generateBibNumber(r.categoryId, counter);
        const certId = generateCertificateId();
        const pId = `P-BLK-${crypto.randomBytes(4).toString("hex")}`;
        const catName = CATEGORY_NAMES[r.categoryId] || r.categoryId;

        await db.execute({
          sql: `INSERT INTO participants (
            id, bib_number, full_name, gender, dob, mobile, masked_mobile, emergency_contact, emergency_relation, blood_group,
            category_id, category_name, district_id, district_name, tshirt_size, institution, batch_id, certificate_id, qr_token, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
          args: [
            pId, bibNumber, r.fullName, r.gender, r.dob, r.mobile, maskMobile(r.mobile),
            r.emergencyContact, r.emergencyRelation, r.bloodGroup, r.categoryId, catName,
            districtId, distName, r.tshirtSize, institution, batchId, certId, `QR-${bibNumber}`, now
          ]
        });

        registeredRunners.push({ bibNumber, fullName: r.fullName, categoryName: catName });
      }

      await db.execute({
        sql: "INSERT INTO audit_logs (actor, action, details, ip, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [institution, "BULK_REGISTER", `Batch: ${batchId}, Count: ${runners.length}`, clientIp, now]
      });

      return json({
        success: true,
        batchId,
        institution,
        count: registeredRunners.length,
        runners: registeredRunners
      });
    }

    // 4. Live Runner Tracker Query
    if (pathname === "/tracker" && method === "GET") {
      const q = parsedUrl.searchParams.get("bib") || parsedUrl.searchParams.get("q") || "";
      if (!q.trim()) {
        return error("कृपया वैध बिब नंबर या मोबाइल नंबर प्रदान करें", 400);
      }

      const cleanQ = q.trim();
      const resRunner = await db.execute({
        sql: "SELECT * FROM participants WHERE bib_number = ? OR mobile = ? OR full_name LIKE ? LIMIT 1",
        args: [cleanQ, cleanQ, `%${cleanQ}%`]
      });

      if (resRunner.rows.length === 0) {
        return error("कोई धावक रिकॉर्ड नहीं मिला", 404);
      }

      const r = resRunner.rows[0];

      // Fetch checkpoint timing scans
      const scansRes = await db.execute({
        sql: "SELECT * FROM timing_scans WHERE bib_number = ? ORDER BY km ASC",
        args: [r.bib_number]
      });

      return json({
        success: true,
        runner: {
          bibNumber: r.bib_number,
          fullName: r.full_name,
          gender: r.gender,
          mobile: r.masked_mobile, // PII protected
          categoryName: r.category_name,
          districtName: r.district_name,
          status: r.status,
          finishTime: r.finish_time,
          overallRank: r.overall_rank,
          genderRank: r.gender_rank,
          certificateId: r.certificate_id,
          splits: scansRes.rows.map(s => ({
            checkpointId: s.checkpoint_id,
            checkpointName: s.checkpoint_name,
            km: s.km,
            scanTime: s.scan_time,
            elapsedSeconds: s.elapsed_seconds,
            pace: s.pace,
            speedKmh: s.speed_kmh
          }))
        }
      });
    }

    // 5. Checkpoint Scan Event (Simulated / Timing Mat Hardware API)
    if (pathname === "/tracking/scan" && method === "POST") {
      const body = await parseJsonBody(req);
      const { bibNumber, checkpointId, checkpointName, km, scanTime, elapsedSeconds, pace, speedKmh } = body;

      if (!bibNumber || !checkpointId) {
        return error("bibNumber and checkpointId required", 400);
      }

      const now = new Date().toISOString();
      await db.execute({
        sql: `INSERT INTO timing_scans (bib_number, checkpoint_id, checkpoint_name, km, scan_time, elapsed_seconds, pace, speed_kmh, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [bibNumber, checkpointId, checkpointName || checkpointId, km || 0, scanTime || "06:30:00 AM", elapsedSeconds || 1800, pace || "5:00 min/km", speedKmh || 12.0, now]
      });

      // Update status if finish
      if (checkpointId === "finish") {
        await db.execute({
          sql: "UPDATE participants SET status = 'FINISHED', finish_time = ? WHERE bib_number = ?",
          args: [scanTime || "00:50:00", bibNumber]
        });
      } else {
        await db.execute({
          sql: "UPDATE participants SET status = 'ON_TRACK' WHERE bib_number = ? AND status != 'FINISHED'",
          args: [bibNumber]
        });
      }

      return json({ success: true, message: `Scan recorded at ${checkpointName || checkpointId}` });
    }

    // 6. Certificate Verification
    if (pathname === "/certificates/verify" && method === "GET") {
      const certId = parsedUrl.searchParams.get("id") || parsedUrl.searchParams.get("certId");
      if (!certId) {
        return error("Certificate ID is required", 400);
      }

      const resCert = await db.execute({
        sql: "SELECT full_name, bib_number, category_name, finish_time, certificate_id, status, created_at FROM participants WHERE certificate_id = ? OR bib_number = ? LIMIT 1",
        args: [certId.trim(), certId.trim()]
      });

      if (resCert.rows.length === 0) {
        return error("प्रमाण पत्र सत्यापन विफल: यह प्रमाण पत्र राजस्थान पुलिस आधिकारिक रिकॉर्ड में नहीं मिला।", 404);
      }

      const r = resCert.rows[0];
      return json({
        success: true,
        verified: true,
        certificate: {
          fullName: r.full_name,
          bibNumber: r.bib_number,
          categoryName: r.category_name,
          finishTime: r.finish_time || "00:48:32 (Official Time)",
          certificateId: r.certificate_id,
          issueDate: "20 December 2026",
          authority: "महानिदेशक पुलिस, राजस्थान (DGP) एवं नोडल समिति"
        }
      });
    }

    // 7. Police Admin Login
    if (pathname === "/admin/login" && method === "POST") {
      if (adminLoginLimiter.isRateLimited(clientIp)) {
        return error("लॉगिन के अत्यधिक प्रयास। 1 मिनट बाद पुनः प्रयास करें।", 429);
      }

      const body = await parseJsonBody(req);
      const { username, password } = body;

      if (!username || !password) {
        return error("उपयोगकर्ता नाम और पासवर्ड आवश्यक हैं", 400);
      }

      const userRes = await db.execute({
        sql: "SELECT * FROM admin_users WHERE username = ?",
        args: [username.trim()]
      });

      if (userRes.rows.length === 0 || !verifyPassword(password, userRes.rows[0].password_hash)) {
        return error("अमान्य क्रेडेंशियल्स (Invalid Police Admin Credentials)", 401);
      }

      const user = userRes.rows[0];
      const token = `RAJPOL_JWT_${crypto.randomBytes(24).toString("hex")}`;

      await db.execute({
        sql: "INSERT INTO audit_logs (actor, action, details, ip, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [user.username, "ADMIN_LOGIN", `Role: ${user.role}`, clientIp, new Date().toISOString()]
      });

      return json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.full_name
        }
      });
    }

    // 8. Admin Participants Query (Paginated & Filterable)
    if (pathname === "/admin/participants" && method === "GET") {
      const q = parsedUrl.searchParams.get("q") || "";
      const category = parsedUrl.searchParams.get("category") || "";
      const district = parsedUrl.searchParams.get("district") || "";
      const limit = Math.min(Number(parsedUrl.searchParams.get("limit")) || 50, 500);
      const offset = Number(parsedUrl.searchParams.get("offset")) || 0;

      let whereClause = "WHERE 1=1";
      const args = [];

      if (q) {
        whereClause += " AND (bib_number LIKE ? OR full_name LIKE ? OR mobile LIKE ?)";
        args.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }
      if (category && category !== "all") {
        whereClause += " AND category_id = ?";
        args.push(category);
      }
      if (district && district !== "all") {
        whereClause += " AND district_id = ?";
        args.push(district);
      }

      const countSql = `SELECT count(*) as total FROM participants ${whereClause};`;
      const countRes = await db.execute({ sql: countSql, args });

      const dataSql = `SELECT * FROM participants ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?;`;
      const dataRes = await db.execute({ sql: dataSql, args: [...args, limit, offset] });

      return json({
        success: true,
        total: countRes.rows[0].total,
        limit,
        offset,
        participants: dataRes.rows
      });
    }

    // 9. Admin CSV Export (Safe from Excel Formula Injection)
    if (pathname === "/admin/export" && method === "GET") {
      const rowsRes = await db.execute("SELECT * FROM participants ORDER BY created_at DESC LIMIT 50000;");
      const headers = [
        "Bib Number", "Full Name", "Gender", "DOB", "Mobile", "Blood Group",
        "Category", "District", "T-Shirt", "Certificate ID", "Status", "Finish Time", "Created At"
      ];

      const csvLines = [headers.join(",")];
      for (const r of rowsRes.rows) {
        csvLines.push([
          sanitizeCsvCell(r.bib_number),
          sanitizeCsvCell(r.full_name),
          sanitizeCsvCell(r.gender),
          sanitizeCsvCell(r.dob),
          sanitizeCsvCell(r.mobile),
          sanitizeCsvCell(r.blood_group),
          sanitizeCsvCell(r.category_name),
          sanitizeCsvCell(r.district_name),
          sanitizeCsvCell(r.tshirt_size),
          sanitizeCsvCell(r.certificate_id),
          sanitizeCsvCell(r.status),
          sanitizeCsvCell(r.finish_time || "N/A"),
          sanitizeCsvCell(r.created_at)
        ].join(","));
      }

      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Rajasthan_Police_Marathon_2026_Participants.csv"'
      });
      return res.end(csvLines.join("\r\n"));
    }

    // Fallback 404
    return error(`Endpoint not found: ${pathname}`, 404);
  } catch (err) {
    console.error("[API Router Error]:", err);
    return error("आंतरिक सर्वर त्रुटि (Internal Server Error): " + err.message, 500);
  }
}

/**
 * Helper to parse JSON body from incoming request stream
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      // Protect from body overflow attacks (Max 5MB)
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}
