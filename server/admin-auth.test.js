import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import http from "node:http";

const bootstrapUsername = "security-test-admin";
const bootstrapPassword = "test-only-admin-password-2026";
const expoPasscode = "test-only-expo-passcode-2026";

let server;
let db;
let baseUrl;
let requestNumber = 0;

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.TURSO_DATABASE_URL = "file::memory:";
  process.env.APP_SECRET = "test-only-app-secret";
  process.env.ADMIN_BOOTSTRAP_USERNAME = bootstrapUsername;
  process.env.ADMIN_BOOTSTRAP_PASSWORD = bootstrapPassword;
  process.env.EXPO_PASSCODE = expoPasscode;

  const [{ db: testDb, initDatabase }, { handleApiRequest }] = await Promise.all([
    import("./db.js"),
    import("./apiRouter.js")
  ]);
  db = testDb;
  await initDatabase();

  server = http.createServer((req, res) => handleApiRequest(req, res));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
  await db?.close();
});

async function post(path, body) {
  requestNumber += 1;
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

test("admin bootstrap uses configured credentials and does not create the public default account", async () => {
  const bootstrapLogin = await post("/admin/login", {
    username: bootstrapUsername,
    password: bootstrapPassword
  });
  const legacyLogin = await post("/admin/login", {
    username: "rajpolice",
    password: "RajPol#2026"
  });
  const users = await db.execute("SELECT username FROM admin_users");

  assert.equal(bootstrapLogin.status, 200);
  assert.equal(bootstrapLogin.body.success, true);
  assert.equal(legacyLogin.status, 401);
  assert.deepEqual(users.rows.map(user => user.username), [bootstrapUsername]);
});

test("admin login rejects built-in PHQ credential aliases", async () => {
  const result = await post("/admin/login", {
    username: "phq_admin",
    password: "RajPol@PHQ#2027"
  });

  assert.equal(result.status, 401);
});

test("expo login accepts only its configured passcode", async () => {
  const legacyLogin = await post("/expo/login", {
    operatorName: "Test Operator",
    counterId: "counter_01",
    passcode: "expo123"
  });
  const configuredLogin = await post("/expo/login", {
    operatorName: "Test Operator",
    counterId: "counter_01",
    passcode: expoPasscode
  });

  assert.equal(legacyLogin.status, 401);
  assert.equal(configuredLogin.status, 200);
  assert.equal(configuredLogin.body.success, true);
});

test("database initialization preserves rotated passwords and removes seeded demo accounts", async () => {
  const { hashPassword } = await import("./security.js");
  const rotatedPassword = "rotated-test-admin-password-2026";
  await db.execute({
    sql: "UPDATE admin_users SET password_hash = ? WHERE username = ?",
    args: [hashPassword(rotatedPassword), bootstrapUsername]
  });
  await db.execute({
    sql: `INSERT INTO admin_users (
      id, username, password_hash, role, full_name, plain_passcode, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "admin-01",
      "rajpolice",
      hashPassword("RajPol#2026"),
      "SUPER_ADMIN",
      "Legacy default admin",
      "",
      new Date().toISOString()
    ]
  });
  await db.execute({
    sql: `INSERT INTO admin_users (
      id, username, password_hash, role, full_name, plain_passcode, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "vol-rahul-01",
      "vol_rahul",
      hashPassword("Vol#2027"),
      "EXPO_VOLUNTEER",
      "Legacy demo volunteer",
      "Vol#2027",
      new Date().toISOString()
    ]
  });

  await (await import("./db.js")).initDatabase();

  const rotatedLogin = await post("/admin/login", {
    username: bootstrapUsername,
    password: rotatedPassword
  });
  const resetLogin = await post("/admin/login", {
    username: bootstrapUsername,
    password: bootstrapPassword
  });
  const legacyAdminLogin = await post("/admin/login", {
    username: "rajpolice",
    password: "RajPol#2026"
  });
  const legacyVolunteerLogin = await post("/admin/login", {
    username: "vol_rahul",
    password: "Vol#2027"
  });
  const legacyUsers = await db.execute(
    "SELECT username, plain_passcode FROM admin_users WHERE username IN (?, ?)",
    ["rajpolice", "vol_rahul"]
  );

  assert.equal(rotatedLogin.status, 200);
  assert.equal(resetLogin.status, 401);
  assert.equal(legacyAdminLogin.status, 401);
  assert.equal(legacyVolunteerLogin.status, 401);
  assert.deepEqual(legacyUsers.rows, []);
});

test("admin audit logs and broadcast endpoints work with valid authorization", async () => {
  const loginRes = await post("/admin/login", {
    username: bootstrapUsername,
    password: "rotated-test-admin-password-2026"
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.requireOtp, true);

  // 1. Rejection of invalid OTP
  const badOtpRes = await post("/admin/verify-otp", {
    tempToken: loginRes.body.tempToken,
    otp: "000000"
  });
  assert.equal(badOtpRes.status, 400);

  // 2. Acceptance of valid 2FA OTP
  const verifyRes = await post("/admin/verify-otp", {
    tempToken: loginRes.body.tempToken,
    otp: loginRes.body.simulatedOtp
  });
  assert.equal(verifyRes.status, 200);
  const token = verifyRes.body.token;

  // 1. Audit Logs Endpoint
  requestNumber += 1;
  const logsRes = await fetch(`${baseUrl}/admin/audit-logs?limit=10`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    }
  });
  assert.equal(logsRes.status, 200);
  const logsData = await logsRes.json();
  assert.equal(logsData.success, true);
  assert.ok(Array.isArray(logsData.logs));

  // 2. Broadcast Announcement Endpoint
  requestNumber += 1;
  const broadcastRes = await fetch(`${baseUrl}/admin/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({
      title: "रेस किट संग्रहण सूचना",
      message: "सभी धावक 1 व 2 जनवरी को अल्बर्ट हॉल से अपनी किट प्राप्त करें।",
      targetCategory: "all",
      channel: "SMS"
    })
  });
  assert.equal(broadcastRes.status, 200);
  const broadcastData = await broadcastRes.json();
  assert.equal(broadcastData.success, true);
  assert.equal(broadcastData.channel, "SMS");
});

test("PHQ can provision a District Admin with registered mobile, who logs in via 2FA OTP", async () => {
  // 1. Log in as PHQ Admin
  const phqLogin = await post("/admin/login", {
    username: bootstrapUsername,
    password: "rotated-test-admin-password-2026"
  });
  const phq2fa = await post("/admin/verify-otp", {
    tempToken: phqLogin.body.tempToken,
    otp: phqLogin.body.simulatedOtp
  });
  const phqToken = phq2fa.body.token;

  // 2. Create District Admin for Alwar with authorized mobile
  requestNumber += 1;
  const createDistRes = await fetch(`${baseUrl}/admin/volunteers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${phqToken}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({
      fullName: "आनंद शर्मा (IPS)",
      designation: "पुलिस अधीक्षक (SP Alwar)",
      mobile: "9829012345",
      username: "sp_alwar_official",
      password: "AlwarPol#2027Secure",
      stationType: "district",
      districtId: "alwar",
      districtName: "अलवर पुलिस"
    })
  });
  assert.equal(createDistRes.status, 200);
  const createDistData = await createDistRes.json();
  assert.equal(createDistData.success, true);
  assert.equal(createDistData.volunteer.role, "DISTRICT");
  assert.equal(createDistData.volunteer.mobile, "9829012345");

  // 3. District Admin logs in with credentials -> triggers 2FA OTP
  const distLogin = await post("/admin/login", {
    username: "sp_alwar_official",
    password: "AlwarPol#2027Secure"
  });
  assert.equal(distLogin.status, 200);
  assert.equal(distLogin.body.requireOtp, true);
  assert.equal(distLogin.body.maskedMobile, "XXXXXX2345");

  // 4. District Admin verifies 2FA OTP -> receives token scoped to Alwar
  const dist2fa = await post("/admin/verify-otp", {
    tempToken: distLogin.body.tempToken,
    otp: distLogin.body.simulatedOtp
  });
  assert.equal(dist2fa.status, 200);
  assert.equal(dist2fa.body.success, true);
  assert.equal(dist2fa.body.user.role, "DISTRICT");
  assert.equal(dist2fa.body.user.districtId, "alwar");
});

