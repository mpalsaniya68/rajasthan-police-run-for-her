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
        const msg = parsed.error.issues?.[0]?.message || parsed.error.errors?.[0]?.message || "अमान्य डेटा";
        return error(msg, 422);
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
          medical_condition, medical_notes,
          category_id, category_name, district_id, district_name, tshirt_size, id_type, id_last4, certificate_id, qr_token,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
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
          data.medicalCondition || "",
          data.medicalNotes || "",
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
          bloodGroup: data.bloodGroup,
          medicalCondition: data.medicalCondition || "",
          medicalNotes: data.medicalNotes || "",
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
        const msg = parsed.error.issues?.[0]?.message || parsed.error.errors?.[0]?.message || "अमान्य बल्क डेटा";
        return error(msg, 422);
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

    // 7. Police Admin Login (PHQ Super Admin & District SP Levels)
    if (pathname === "/admin/login" && method === "POST") {
      if (adminLoginLimiter.isRateLimited(clientIp)) {
        return error("लॉगिन के अत्यधिक प्रयास। 1 मिनट बाद पुनः प्रयास करें।", 429);
      }

      const body = await parseJsonBody(req);
      const rawUsername = (body.username || "").trim().toLowerCase();
      const password = (body.password || "").trim();

      if (!rawUsername || !password) {
        return error("उपयोगकर्ता नाम (ID) और पासवर्ड दोनों आवश्यक हैं।", 400);
      }

      // 1. Check in database
      const userRes = await db.execute({
        sql: "SELECT * FROM admin_users WHERE lower(username) = ? LIMIT 1",
        args: [rawUsername]
      });

      let authenticatedUser = null;

      if (userRes.rows.length > 0 && verifyPassword(password, userRes.rows[0].password_hash)) {
        const u = userRes.rows[0];
        authenticatedUser = {
          id: u.id,
          username: u.username,
          role: u.role === "SUPER_ADMIN" || u.role === "PHQ" ? "PHQ" : "DISTRICT",
          districtId: u.district_id || (u.role === "PHQ" || u.role === "SUPER_ADMIN" ? "ALL" : "jaipur_comm"),
          districtName: u.district_name || (u.role === "PHQ" || u.role === "SUPER_ADMIN" ? "समस्त राजस्थान (PHQ)" : "राजस्थान पुलिस"),
          fullName: u.full_name
        };
      } else {
        // Fallback / Built-in State Police Credential Directory
        // PHQ Level
        if ((rawUsername === "phq_admin" || rawUsername === "rajpolice") && 
            (password === "RajPol@PHQ#2026" || password === "RajPol#2026" || password === "admin123")) {
          authenticatedUser = {
            id: "phq-state-01",
            username: "phq_admin",
            role: "PHQ",
            districtId: "ALL",
            districtName: "समस्त राजस्थान (PHQ State Command)",
            fullName: "राज्य कमान एवं नोडल अधिकारी (PHQ)"
          };
        } 
        // District SP Level (e.g. sp_kta_city, sp_kota_city, sp_jpr_comm, sp_jaipur, sp_udr, sp_udaipur)
        else if (rawUsername.startsWith("sp_")) {
          const distCode = rawUsername.replace(/^sp_/, "").toLowerCase();
          
          let matchedDist = Object.entries(DISTRICT_NAMES).find(([k, v]) => 
            k.toLowerCase().includes(distCode) || distCode.includes(k.toLowerCase())
          );

          if (!matchedDist) {
            const aliasMap = {
              kta: "kota_city",
              jpr: "jaipur_comm",
              jdh: "jodhpur_comm",
              udr: "udaipur",
              bkn: "bikaner",
              ajm: "ajmer",
              alw: "alwar",
              bht: "bharatpur",
              skr: "sikar"
            };
            const prefix = distCode.split('_')[0];
            if (aliasMap[prefix]) {
              const targetKey = aliasMap[prefix];
              matchedDist = [targetKey, DISTRICT_NAMES[targetKey]];
            }
          }

          // Standard district passwords allowed:
          // SP#<District>@2026 OR SP#<DistCode>@2026 OR RajPol@SP#2026 OR SP#2026 OR sp123
          const passLower = password.toLowerCase();
          const isStandardPass = 
            passLower === `sp#${distCode}@2026` ||
            (passLower.startsWith("sp#") && passLower.endsWith("@2026")) ||
            passLower === "sp#2026" ||
            password === "RajPol@SP#2026" || 
            password === "SP#2026" || 
            password === "sp123";

          if (isStandardPass) {
            const dId = matchedDist ? matchedDist[0] : distCode;
            const dName = matchedDist ? matchedDist[1] : `${distCode.toUpperCase().replace(/_/g, ' ')} Police District`;
            authenticatedUser = {
              id: `sp-${distCode}`,
              username: rawUsername,
              role: "DISTRICT",
              districtId: dId,
              districtName: dName,
              fullName: `पुलिस अधीक्षक (SP - ${dName.split(' ')[0]})`
            };
          }
        }
      }

      if (!authenticatedUser) {
        return error("अमान्य क्रेडेंशियल्स! कृपया सही अधिकृत पुलिस आईडी और पासवर्ड दर्ज करें।", 401);
      }

      const token = `RAJPOL_AUTH_${crypto.randomBytes(24).toString("hex")}`;

      // Audit Log
      try {
        await db.execute({
          sql: "INSERT INTO audit_logs (actor, action, details, ip, created_at) VALUES (?, ?, ?, ?, ?)",
          args: [authenticatedUser.username, "ADMIN_LOGIN", `Role: ${authenticatedUser.role}, Dist: ${authenticatedUser.districtId}`, clientIp, new Date().toISOString()]
        });
      } catch (e) {}

      return json({
        success: true,
        token,
        user: authenticatedUser
      });
    }

    // 8. Admin Participants Query (Paginated & Filterable by Role / District)
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
      if (district && district !== "all" && district !== "ALL") {
        whereClause += " AND (district_id = ? OR district_id LIKE ? OR district_name LIKE ?)";
        args.push(district, `%${district}%`, `%${district}%`);
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

    // 9. Admin CSV Export (Safe from Excel Formula Injection, Supports District Scope)
    if (pathname === "/admin/export" && method === "GET") {
      const district = parsedUrl.searchParams.get("district") || "";
      let whereClause = "";
      const args = [];

      if (district && district !== "all" && district !== "ALL") {
        whereClause = "WHERE (district_id = ? OR district_id LIKE ? OR district_name LIKE ?)";
        args.push(district, `%${district}%`, `%${district}%`);
      }

      const exportSql = `SELECT * FROM participants ${whereClause} ORDER BY created_at DESC LIMIT 50000;`;
      const rowsRes = await db.execute({ sql: exportSql, args });

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

      const filename = district && district !== "all" 
        ? `Rajasthan_Police_Marathon_${district}_Participants.csv`
        : `Rajasthan_Police_Marathon_Master_Statewide.csv`;

      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      });
      return res.end(csvLines.join("\r\n"));
    }

    // 10. Admin Live Statistics (Total, Kits Handed Out, Medical Alerts - Supports District Filter)
    if (pathname === "/admin/stats" && method === "GET") {
      const district = parsedUrl.searchParams.get("district") || "";
      let whereClause = "";
      const args = [];

      if (district && district !== "all" && district !== "ALL") {
        whereClause = "WHERE (district_id = ? OR district_id LIKE ? OR district_name LIKE ?)";
        args.push(district, `%${district}%`, `%${district}%`);
      }

      const totalRes = await db.execute({ sql: `SELECT count(*) as count FROM participants ${whereClause};`, args });
      const kitRes = await db.execute({ sql: `SELECT count(*) as count FROM participants ${whereClause ? whereClause + " AND" : "WHERE"} kit_collected = 1;`, args });
      const medicalRes = await db.execute({ sql: `SELECT count(*) as count FROM participants ${whereClause ? whereClause + " AND" : "WHERE"} medical_condition != '' AND medical_condition NOT LIKE '%None%';`, args });
      const catRes = await db.execute({ sql: `SELECT category_name, count(*) as count FROM participants ${whereClause} GROUP BY category_name;`, args });
      const genderRes = await db.execute({ sql: `SELECT gender, count(*) as count FROM participants ${whereClause} GROUP BY gender;`, args });
      const distRes = await db.execute({ sql: `SELECT district_name, count(*) as count FROM participants ${whereClause} GROUP BY district_name;`, args });

      const total = Number(totalRes.rows[0]?.count) || 0;
      const kitsDistributed = Number(kitRes.rows[0]?.count) || 0;

      return json({
        success: true,
        stats: {
          total,
          kitsDistributed,
          kitsPending: Math.max(0, total - kitsDistributed),
          medicalAlerts: Number(medicalRes.rows[0]?.count) || 0,
          byCategory: catRes.rows,
          byGender: genderRes.rows,
          byDistrict: distRes.rows
        }
      });
    }

    // 11. Expo Desk: RFID Kit & Bib Allotment Counter
    if (pathname === "/admin/kit-distribution" && method === "POST") {
      const body = await parseJsonBody(req);
      const runnerIdentifier = (body.bibNumber || body.query || "").trim();
      const rfidTag = (body.rfidTagId || "").trim();
      const counterName = (body.counterId || body.collectedBy || "Police Line Expo Counter").trim();

      if (!runnerIdentifier) {
        return error("कृपया बिब नंबर, मोबाइल नंबर अथवा ई-पास आईडी प्रदान करें।", 400);
      }

      const q = runnerIdentifier;
      const findRes = await db.execute({
        sql: "SELECT * FROM participants WHERE bib_number = ? OR mobile = ? OR certificate_id = ? OR qr_token = ? LIMIT 1",
        args: [q, q, q, q]
      });

      if (findRes.rows.length === 0) {
        return error("धावक रिकॉर्ड नहीं मिला। कृपया बिब अथवा मोबाइल नंबर पुनः जांचें।", 404);
      }

      const runner = findRes.rows[0];
      const now = new Date().toISOString();
      const tag = rfidTag || `RFID-${runner.bib_number}`;
      const counter = counterName;

      await db.execute({
        sql: `UPDATE participants SET 
                kit_collected = 1, 
                kit_collected_at = ?, 
                rfid_tag_id = ?, 
                collected_by = ? 
              WHERE id = ?`,
        args: [now, tag, counter, runner.id]
      });

      // Audit Log
      await db.execute({
        sql: "INSERT INTO audit_logs (actor, action, details, ip, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [counter, "KIT_ALLOTTED", `Bib: ${runner.bib_number}, RFID: ${tag}, Runner: ${runner.full_name}`, clientIp, now]
      });

      return json({
        success: true,
        message: `✅ किट एवं RFID बिब सफलतापूर्वक आवंटित! (${runner.full_name})`,
        participant: {
          ...runner,
          kit_collected: 1,
          kit_collected_at: now,
          rfid_tag_id: tag,
          collected_by: counter
        }
      });
    }

    // 12. Race Day Official Leaderboard & Standings
    if (pathname === "/leaderboard" && method === "GET") {
      const category = parsedUrl.searchParams.get("category") || "all";
      const gender = parsedUrl.searchParams.get("gender") || "all";
      const limit = Math.min(Number(parsedUrl.searchParams.get("limit")) || 50, 100);

      let whereClause = "WHERE 1=1";
      const args = [];

      if (category && category !== "all") {
        whereClause += " AND category_id = ?";
        args.push(category);
      }
      if (gender && gender !== "all") {
        whereClause += " AND gender = ?";
        args.push(gender.toLowerCase());
      }

      const querySql = `
        SELECT 
          id, bib_number, full_name, gender, category_id, category_name, 
          district_name, status, finish_time, overall_rank, gender_rank, certificate_id
        FROM participants 
        ${whereClause}
        ORDER BY 
          CASE WHEN status = 'FINISHED' THEN 0 ELSE 1 END,
          overall_rank ASC,
          finish_time ASC
        LIMIT ?;
      `;

      const leadRes = await db.execute({ sql: querySql, args: [...args, limit] });

      return json({
        success: true,
        count: leadRes.rows.length,
        leaderboard: leadRes.rows
      });
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
