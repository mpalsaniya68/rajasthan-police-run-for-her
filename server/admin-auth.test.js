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
