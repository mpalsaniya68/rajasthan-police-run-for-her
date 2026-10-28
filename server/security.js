import crypto from "crypto";
import { z } from "zod";

const APP_SECRET = process.env.APP_SECRET || "rajpol_marathon_2026_super_secure_salt_jaipur";

/**
 * 1. Zod Validation Schemas
 */
export const registrationSchema = z.object({
  fullName: z.string().min(2, "नाम कम से कम 2 अक्षर का होना चाहिए").max(100).trim(),
  gender: z.string().transform(v => v.toLowerCase()).pipe(z.enum(["female", "male", "other"])),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "अमान्य जन्म तिथि प्रारूप (YYYY-MM-DD)"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होना आवश्यक है)"),
  email: z.string().email("वैध ईमेल पता दर्ज करें (उदा. runner@example.com)").trim(),
  emergencyContact: z.string().regex(/^[6-9]\d{9}$/, "वैध 10-अंकीय आपातकालीन मोबाइल नंबर दर्ज करें"),
  emergencyRelation: z.string().min(2).max(50).trim(),
  bloodGroup: z.string().min(1).max(5),
  hasMedicalIssue: z.boolean().optional().default(false),
  medicalCondition: z.string().max(200).optional().default(""),
  medicalNotes: z.string().max(300).optional().default(""),
  categoryId: z.enum(["21k", "10k", "5k", "3k", "2k"]),
  districtId: z.string().min(2).max(50),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
  idType: z.enum(["Aadhaar", "PAN", "Voter ID"]).default("Aadhaar"),
  idNumber: z.string().min(5, "पहचान पत्र संख्या आवश्यक है").max(30).trim(),
  idLast4: z.string().optional()
});

export const bulkRegistrationSchema = z.object({
  institution: z.string().min(3).max(150),
  districtId: z.string().min(2),
  contactPerson: z.string().min(2),
  contactMobile: z.string().regex(/^[6-9]\d{9}$/),
  runners: z.array(registrationSchema).min(1).max(5000)
});

/**
 * 2. Sensitive PII Masking: Mobile & Govt Photo IDs
 * Keeps privacy by default: only last 4 chars visible
 */
export function maskMobile(mobile) {
  if (!mobile || typeof mobile !== "string") return "XXXXXXXXXX";
  const clean = mobile.replace(/\D/g, "");
  if (clean.length < 4) return "XXXXXXXXXX";
  return "XXXXXX" + clean.slice(-4);
}

export function maskIdNumber(idType, idNumber) {
  if (!idNumber || typeof idNumber !== "string") return "XXXX-XXXX";
  const clean = idNumber.replace(/\s+/g, "").toUpperCase();
  if (idType === "Aadhaar") {
    const digits = clean.replace(/\D/g, "");
    if (digits.length >= 4) {
      return `XXXX-XXXX-${digits.slice(-4)}`;
    }
    return "XXXX-XXXX-XXXX";
  } else if (idType === "PAN") {
    if (clean.length >= 4) {
      return `XXXXXX${clean.slice(-4)}`;
    }
    return "XXXXXXXXXX";
  } else {
    // Voter ID / EPIC
    if (clean.length >= 4) {
      return `XXXXXX${clean.slice(-4)}`;
    }
    return "XXXXXXXXXX";
  }
}

/**
 * 3. Secure Bib Generation
 * Generates official high-authority Bib numbers based on category
 */
export function generateBibNumber(categoryId, counter) {
  const pad = String(counter).padStart(4, "0");
  switch (categoryId) {
    case "21k":
      return `RJ-21K-${pad}`;
    case "10k":
      return `RJ-10K-${pad}`;
    case "5k":
      return `RJ-05K-${pad}`;
    case "3k":
      return `RJ-03K-${pad}`;
    case "2k":
      return `RJ-02K-${pad}`;
    default:
      return `RJ-GEN-${pad}`;
  }
}

/**
 * 4. Generate Certificate ID & Cryptographic QR Verification Token
 */
export function generateCertificateId() {
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RJ-POL-2026-${hex}`;
}

export function generateSecureQrToken(bibNumber, certId) {
  return crypto
    .createHmac("sha256", APP_SECRET)
    .update(`${bibNumber}:${certId}`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();
}

/**
 * 5. Password Hashing with SHA-256 + Salt
 */
export function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(`${password}:${APP_SECRET}`)
    .digest("hex");
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const computed = hashPassword(password);
  if (computed.length !== storedHash.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch (e) {
    return false;
  }
}

/**
 * 6. In-Memory Leaky Bucket Rate Limiter
 * Limits requests per IP (Default: 30 requests per minute)
 */
class SlidingRateLimiter {
  constructor(limit = 30, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.hits = new Map();
  }

  isRateLimited(ip) {
    const now = Date.now();
    const timestamps = this.hits.get(ip) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);

    if (validTimestamps.length >= this.limit) {
      return true;
    }

    validTimestamps.push(now);
    this.hits.set(ip, validTimestamps);
    return false;
  }
}

export const registrationLimiter = new SlidingRateLimiter(20, 60000); // 20 regs/min per IP
export const adminLoginLimiter = new SlidingRateLimiter(5, 60000); // 5 login attempts/min per IP

/**
 * 7. CSV Injection Prevention
 * Protects Excel from Formula Injection by prefixing '=, +, -, @' with a single quote
 */
export function sanitizeCsvCell(cell) {
  if (cell == null) return "";
  let str = String(cell).replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}
