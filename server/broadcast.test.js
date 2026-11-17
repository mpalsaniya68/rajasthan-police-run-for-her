import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import http from "node:http";
import { 
  dispatchGatewayWhatsApp, 
  dispatchGatewaySms, 
  resolveMessagePlaceholders, 
  BROADCAST_TEMPLATES 
} from "./notifications.js";

const bootstrapUsername = "broadcast-test-admin";
const bootstrapPassword = "broadcast-test-pass-2026";
let server;
let db;
let baseUrl;
let adminToken;
let requestNumber = 0;

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.TURSO_DATABASE_URL = "file::memory:";
  process.env.APP_SECRET = "broadcast-test-secret";
  process.env.ADMIN_BOOTSTRAP_USERNAME = bootstrapUsername;
  process.env.ADMIN_BOOTSTRAP_PASSWORD = bootstrapPassword;

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

  // Login as admin to get token
  requestNumber += 1;
  const loginRes = await fetch(`${baseUrl}/admin/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({ username: bootstrapUsername, password: bootstrapPassword })
  });
  const loginData = await loginRes.json();
  assert.equal(loginData.success, true);
  assert.equal(loginData.requireOtp, true);

  requestNumber += 1;
  const verifyRes = await fetch(`${baseUrl}/admin/verify-otp`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({
      tempToken: loginData.tempToken,
      otp: loginData.simulatedOtp
    })
  });
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.success, true);
  adminToken = verifyData.token;
  assert.ok(adminToken);
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
  await db?.close();
});

test("Unit Test: resolveMessagePlaceholders replaces tags correctly", () => {
  const template = "नमस्ते {name}, आपका बिब #{bib} ({category}) {district} में है। टी-शर्ट: {tshirtSize}";
  const runner = {
    fullName: "राजेश वर्मा",
    bibNumber: "RJ-21K-2005",
    categoryName: "21 KM Half Marathon",
    districtName: "जयपुर",
    tshirtSize: "XL"
  };
  const resolved = resolveMessagePlaceholders(template, runner);
  assert.equal(resolved, "नमस्ते राजेश वर्मा, आपका बिब #RJ-21K-2005 (21 KM Half Marathon) जयपुर में है। टी-शर्ट: XL");
});

test("Unit Test: dispatchGatewayWhatsApp and dispatchGatewaySms simulate successfully", async () => {
  const waRes = await dispatchGatewayWhatsApp({ mobile: "9829012345", message: "Test WhatsApp Broadcast" });
  assert.equal(waRes.success, true);
  assert.equal(waRes.simulated, true);

  const smsRes = await dispatchGatewaySms({ mobile: "9829012345", message: "Test SMS Broadcast" });
  assert.equal(smsRes.success, true);
  assert.equal(smsRes.simulated, true);
});

test("Integration Test: POST /admin/broadcast dispatches EXPO_KIT_REMINDER to kit_pending runners", async () => {
  requestNumber += 1;
  const res = await fetch(`${baseUrl}/admin/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({
      templateType: "EXPO_KIT_REMINDER",
      channel: "BOTH",
      targetAudience: "kit_pending",
      targetCategory: "all"
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.channel, "BOTH");
  assert.equal(data.templateType, "EXPO_KIT_REMINDER");
  assert.ok(data.recipientsCount >= 0);
  assert.ok(data.samplePreview.includes("एक्सपो"));
});

test("Integration Test: POST /admin/broadcast dispatches RACE_REMINDER with custom category filter", async () => {
  requestNumber += 1;
  const res = await fetch(`${baseUrl}/admin/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({
      templateType: "RACE_REMINDER",
      channel: "WHATSAPP",
      targetAudience: "all",
      targetCategory: "21k"
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.channel, "WHATSAPP");
  assert.equal(data.templateType, "RACE_REMINDER");
});

test("Integration Test: POST /admin/broadcast supports CUSTOM free-text message with dynamic tags", async () => {
  requestNumber += 1;
  const res = await fetch(`${baseUrl}/admin/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    },
    body: JSON.stringify({
      templateType: "CUSTOM",
      title: "मौसम एवं वार्मअप सूचना",
      message: "प्रिय {name}, प्रातः 5:00 AM पर अल्बर्ट हॉल में सामूहिक ज़ुम्बा वार्मअप सत्र होगा। बिब: {bib}",
      channel: "SMS",
      targetAudience: "all"
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.channel, "SMS");
  assert.ok(data.samplePreview.includes("सामूहिक ज़ुम्बा"));
});

test("Integration Test: GET /admin/broadcast-history returns audit logs of sent broadcasts", async () => {
  requestNumber += 1;
  const res = await fetch(`${baseUrl}/admin/broadcast-history`, {
    headers: {
      "Authorization": `Bearer ${adminToken}`,
      "x-forwarded-for": `198.51.100.${requestNumber}`
    }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.logs));
  assert.ok(data.logs.length >= 3);
  assert.ok(data.logs.some(l => l.action === "MASS_BROADCAST_SENT"));
});

test("Security Test: POST /admin/broadcast rejects unauthenticated requests with 401", async () => {
  const res = await fetch(`${baseUrl}/admin/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauth", message: "Fail" })
  });
  assert.equal(res.status, 401);
});
