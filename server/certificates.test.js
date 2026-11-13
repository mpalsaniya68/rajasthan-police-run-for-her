import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import http from "node:http";

const bootstrapUsername = "cert-test-admin";
const bootstrapPassword = "cert-test-password-2026";

let server;
let db;
let baseUrl;
let adminToken = "";

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.TURSO_DATABASE_URL = "file::memory:";
  process.env.APP_SECRET = "test-only-cert-app-secret";
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

  // Authenticate as Admin
  const loginRes = await fetch(`${baseUrl}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: bootstrapUsername, password: bootstrapPassword })
  });
  const loginData = await loginRes.json();
  adminToken = loginData.token;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
  await db?.close();
});

test("certificate verify correctly distinguishes Jaipur Flagship Timed vs District Awareness Run", async () => {
  // 1. Verify Jaipur Timed runner (RJ-21K-1005)
  const jaipurRes = await fetch(`${baseUrl}/certificates/verify?id=RJ-21K-1005`);
  const jaipurData = await jaipurRes.json();

  assert.equal(jaipurData.success, true);
  assert.equal(jaipurData.certificate.isIssued, true);
  assert.equal(jaipurData.certificate.certTemplateType, "JAIPUR_TIMED");
  assert.ok(jaipurData.certificate.finishTime);
  assert.ok(jaipurData.certificate.authority.includes("महानिदेशक"));

  // 2. Verify District Awareness runner (RJ-05K-3042)
  const distRes = await fetch(`${baseUrl}/certificates/verify?id=RJ-05K-3042`);
  const distData = await distRes.json();

  assert.equal(distData.success, true);
  assert.equal(distData.certificate.isIssued, true);
  assert.equal(distData.certificate.certTemplateType, "DISTRICT_AWARENESS");
  assert.equal(distData.certificate.finishTime, null); // No fake/empty timing grid!
  assert.ok(distData.certificate.authority.includes("पुलिस अधीक्षक"));
});

test("admin certificate stats and 1-click batch generation endpoint works seamlessly", async () => {
  // 1. Fetch certificate stats
  const statsRes = await fetch(`${baseUrl}/admin/certificates/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const statsData = await statsRes.json();
  assert.equal(statsData.success, true);
  assert.ok(typeof statsData.stats.totalRegistered === "number");
  assert.ok(typeof statsData.stats.certificatesIssued === "number");

  // 2. Batch generate certificates for all registered
  const genRes = await fetch(`${baseUrl}/admin/certificates/batch-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      districtId: "all",
      eligibilityMode: "ALL_REGISTERED"
    })
  });
  const genData = await genRes.json();
  assert.equal(genData.success, true);
  assert.ok(genData.count >= 1);
  assert.ok(genData.message.includes("सफलतापूर्वक जारी"));
});

test("single certificate SMS dispatch works reliably for all identifier variants and mock runners", async () => {
  // 1. Dispatch using legacy mock 2026 cert id
  const d1 = await fetch(`${baseUrl}/certificates/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ certificateId: "RPM-2026-RAJ-1048", bibNumber: "RJ-21K-1048" })
  });
  const data1 = await d1.json();
  assert.equal(data1.success, true);
  assert.ok(data1.message.includes("सफलतापूर्वक प्रेषित"));

  // 2. Dispatch using bib number alone
  const d2 = await fetch(`${baseUrl}/certificates/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bibNumber: "RJ-10K-3419" })
  });
  const data2 = await d2.json();
  assert.equal(data2.success, true);

  // 3. Dispatch for Ananya Sharma (mock runner)
  const d3 = await fetch(`${baseUrl}/certificates/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ certificateId: "RPM-2027-RAJ-8012" })
  });
  const data3 = await d3.json();
  assert.equal(data3.success, true);

  // 4. Dispatch for Col Ratan Rathore (mock runner)
  const d4 = await fetch(`${baseUrl}/certificates/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ certificateId: "RPM-2026-RAJ-9510" })
  });
  const data4 = await d4.json();
  assert.equal(data4.success, true);
});

test("admin participants endpoint safely ignores undefined or null district queries and returns all records", async () => {
  const res = await fetch(`${baseUrl}/admin/participants?district=undefined&limit=50`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.participants.length > 0, "Should return records even if district=undefined query is passed");
});

