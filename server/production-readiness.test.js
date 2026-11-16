import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import http from "node:http";

const bootstrapUsername = "prod-test-admin";
const bootstrapPassword = "Prod@Admin#Secure2027";
const expoPasscode = "Expo@RajPol#2027";

let server;
let db;
let baseUrl;

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.TURSO_DATABASE_URL = "file::memory:";
  process.env.APP_SECRET = "production-readiness-test-app-secret-2027";
  process.env.ADMIN_BOOTSTRAP_USERNAME = bootstrapUsername;
  process.env.ADMIN_BOOTSTRAP_PASSWORD = bootstrapPassword;
  process.env.EXPO_PASSCODE = expoPasscode;
  process.env.ENABLE_OTP_SIMULATION = "true";

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

test("FULL PRODUCTION LIFECYCLE AUDIT: Registration -> E-Pass -> Expo Handover -> Admin Verification", async () => {
  const testMobile = "9829999999";
  const testAadhaar = "998877665544";

  // 1. Health Endpoint check
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.equal(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.equal(healthData.status, "HEALTHY");

  // 2. Mobile OTP Send
  const otpSendRes = await fetch(`${baseUrl}/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: testMobile })
  });
  assert.equal(otpSendRes.status, 200);
  const otpSendData = await otpSendRes.json();
  assert.equal(otpSendData.success, true);
  const sentOtp = otpSendData.simulatedOtp;
  assert.ok(sentOtp, "OTP must be generated");

  // 3. Mobile OTP Verify
  const otpVerifyRes = await fetch(`${baseUrl}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: testMobile, otp: sentOtp })
  });
  assert.equal(otpVerifyRes.status, 200);
  const otpVerifyData = await otpVerifyRes.json();
  assert.equal(otpVerifyData.success, true);
  const verificationToken = otpVerifyData.verificationToken;
  assert.ok(verificationToken, "Verification token must be issued");

  // 4. Registration without token must fail (Penetration check)
  const bypassRes = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Bypass Attempt",
      gender: "male",
      dob: "1995-05-15",
      mobile: "9829888888",
      email: "bypass@test.com",
      emergencyContact: "9829888880",
      emergencyRelation: "Friend",
      bloodGroup: "O+",
      categoryId: "21k",
      districtId: "jaipur_comm",
      idType: "Aadhaar",
      idNumber: "112233445566"
    })
  });
  // Must be rejected with 403 Forbidden
  assert.equal(bypassRes.status, 403);

  // 5. Valid Registration with verification token
  const regRes = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Vikram Singh Rathore",
      gender: "male",
      dob: "1996-08-20",
      mobile: testMobile,
      email: "vikram.rathore@rajasthan.gov.in",
      emergencyContact: "9829000000",
      emergencyRelation: "माता (Mother)",
      bloodGroup: "B+",
      categoryId: "21k",
      districtId: "jaipur_comm",
      tshirtSize: "L",
      idType: "Aadhaar",
      idNumber: testAadhaar,
      otpVerificationToken: verificationToken
    })
  });
  assert.ok(regRes.status === 200 || regRes.status === 201, `Expected 200 or 201, got ${regRes.status}`);
  const regData = await regRes.json();
  assert.equal(regData.success, true);
  assert.ok(regData.participant.bibNumber.startsWith("RJ-21K-"));
  const runnerBib = regData.participant.bibNumber;
  const certId = regData.participant.certificateId;

  // 6. Duplicate Registration Prevention
  const dupRes = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Vikram Singh Rathore Duplicate",
      gender: "male",
      dob: "1996-08-20",
      mobile: testMobile,
      email: "vikram.dup@test.com",
      emergencyContact: "9829000000",
      emergencyRelation: "माता (Mother)",
      bloodGroup: "B+",
      categoryId: "21k",
      districtId: "jaipur_comm",
      idType: "Aadhaar",
      idNumber: testAadhaar,
      otpVerificationToken: verificationToken
    })
  });
  assert.equal(dupRes.status, 409);

  // 7. E-Pass Search (Privacy Masked)
  const passSearchRes = await fetch(`${baseUrl}/pass/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: testMobile })
  });
  assert.equal(passSearchRes.status, 200);
  const passSearchData = await passSearchRes.json();
  assert.equal(passSearchData.success, true);
  assert.ok(passSearchData.runners.length > 0);
  assert.ok(passSearchData.runners[0].maskedName.includes("*"));
  assert.ok(passSearchData.runners[0].maskedMobile.startsWith("XXXXXX"));

  // 8. Certificate Verification (Public Authenticity Check)
  const certRes = await fetch(`${baseUrl}/certificates/verify?id=${encodeURIComponent(certId)}`);
  assert.equal(certRes.status, 200);
  const certData = await certRes.json();
  assert.equal(certData.success, true);
  assert.equal(certData.certificate.bibNumber, runnerBib);

  // 9. Expo Volunteer Login (2FA verification)
  const expoLoginRes = await fetch(`${baseUrl}/expo/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operatorName: "Constable Mahendra",
      counterId: "counter_01",
      passcode: expoPasscode
    })
  });
  assert.equal(expoLoginRes.status, 200);
  const expoLoginData = await expoLoginRes.json();
  assert.equal(expoLoginData.requireOtp, true);

  const expoOtpVerifyRes = await fetch(`${baseUrl}/admin/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tempToken: expoLoginData.tempToken,
      otp: expoLoginData.simulatedOtp
    })
  });
  assert.equal(expoOtpVerifyRes.status, 200);
  const expoVerifyData = await expoOtpVerifyRes.json();
  assert.ok(expoVerifyData.token);
  const expoToken = expoVerifyData.token;

  // 10. Expo Runner Query
  const runnerQueryRes = await fetch(`${baseUrl}/expo/runner?q=${encodeURIComponent(runnerBib)}`, {
    headers: { "Authorization": `Bearer ${expoToken}` }
  });
  assert.equal(runnerQueryRes.status, 200);
  const runnerQueryData = await runnerQueryRes.json();
  assert.equal(runnerQueryData.runner.bibNumber, runnerBib);
  assert.equal(runnerQueryData.runner.kitCollected, false);

  // 11. Expo Kit Handover Confirmation
  const handoverRes = await fetch(`${baseUrl}/expo/handover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${expoToken}`
    },
    body: JSON.stringify({
      bibNumber: runnerBib,
      counterId: "counter_01",
      counterName: "काउंटर-01 (21KM हाफ मैराथन - पुरुष)",
      operatorName: "Constable Mahendra",
      rfidTagId: `RFID-${runnerBib}`
    })
  });
  assert.equal(handoverRes.status, 200);
  const handoverData = await handoverRes.json();
  assert.equal(handoverData.success, true);
  assert.equal(handoverData.runner.kitCollected, true);

  // 12. Duplicate Handover Rejection (409 Conflict)
  const dupHandoverRes = await fetch(`${baseUrl}/expo/handover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${expoToken}`
    },
    body: JSON.stringify({
      bibNumber: runnerBib,
      counterId: "counter_02",
      counterName: "काउंटर-02",
      operatorName: "Constable Suresh",
      rfidTagId: `RFID-${runnerBib}`
    })
  });
  assert.equal(dupHandoverRes.status, 409);
  const dupHandoverData = await dupHandoverRes.json();
  assert.equal(dupHandoverData.alreadyCollected, true);

  // 13. Admin Login (PHQ Command)
  const adminLoginRes = await fetch(`${baseUrl}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: bootstrapUsername,
      password: bootstrapPassword
    })
  });
  assert.equal(adminLoginRes.status, 200);
  const adminLoginData = await adminLoginRes.json();
  assert.equal(adminLoginData.requireOtp, true);

  const adminOtpVerifyRes = await fetch(`${baseUrl}/admin/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tempToken: adminLoginData.tempToken,
      otp: adminLoginData.simulatedOtp
    })
  });
  assert.equal(adminOtpVerifyRes.status, 200);
  const adminVerifyData = await adminOtpVerifyRes.json();
  assert.ok(adminVerifyData.token);
  const adminToken = adminVerifyData.token;

  // 14. Admin Participants Verification
  const adminPartsRes = await fetch(`${baseUrl}/admin/participants?q=${encodeURIComponent(runnerBib)}`, {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  assert.equal(adminPartsRes.status, 200);
  const adminPartsData = await adminPartsRes.json();
  assert.equal(adminPartsData.total, 1);
  assert.equal(adminPartsData.participants[0].bib_number, runnerBib);
  assert.equal(adminPartsData.participants[0].kit_collected, 1);

  // 15. Admin Stats Verification
  const adminStatsRes = await fetch(`${baseUrl}/admin/stats`, {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  assert.equal(adminStatsRes.status, 200);
  const adminStatsData = await adminStatsRes.json();
  assert.equal(adminStatsData.success, true);
  assert.ok(adminStatsData.stats.total >= 1);
  assert.ok(adminStatsData.stats.kitsDistributed >= 1);
});
