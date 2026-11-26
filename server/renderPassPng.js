import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

function getBrowserExecutablePath() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

export async function generateEPassPngBuffer({
  fullName = "विक्रम सिंह राठौड़",
  bibNumber = "RJ-21K-1008",
  category = "21 KM Half Marathon",
  eventDate = "24 Jan 2027, 05:00 AM",
  venue = "Albert Hall, Ram Niwas Garden, Jaipur",
  mobile = "9829012345",
  email = "runner@example.com",
  emergencyContact = "Family (9829099887)",
  bloodGroup = "B+",
  tshirtSize = "L",
  epassUrl = "https://police.rajasthan.gov.in/epass/RJ-POL-2027-1F1381"
} = {}) {
  const executablePath = getBrowserExecutablePath();
  if (!executablePath) {
    throw new Error("No Chrome/Edge browser found for E-Pass PNG generation");
  }

  // Generate high-resolution QR code
  const passPayload = JSON.stringify({
    org: "Rajasthan Police Marathon 2027",
    motto: "Run for Her - Women Safety",
    bib: bibNumber,
    name: fullName,
    category: category,
    venue: venue,
    url: epassUrl,
    status: "OFFICIAL_POLICE_EPASS_CONFIRMED"
  });

  const qrDataUrl = await QRCode.toDataURL(passPayload, {
    width: 240,
    margin: 1,
    color: { dark: "#0a1c3d", light: "#ffffff" }
  });

  // Base64 encode logo from public directory
  let logoBase64 = "";
  try {
    const logoPath = path.resolve(process.cwd(), "public", "rajasthan-police-logo.png");
    if (fs.existsSync(logoPath)) {
      logoBase64 = "data:image/png;base64," + fs.readFileSync(logoPath).toString("base64");
    }
  } catch {}

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    width: 1200px;
    height: 660px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .card {
    width: 1200px;
    height: 660px;
    border: 10px solid #0a1c3d;
    outline: 3px solid #d4af37;
    outline-offset: -13px;
    position: relative;
    background: #ffffff;
  }
  .header {
    background: #ffffff;
    height: 120px;
    border-bottom: 2.5px solid #d4af37;
    padding: 0 40px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .logo {
    width: 90px;
    height: 90px;
    object-fit: contain;
  }
  .header-text h1 {
    color: #0a1c3d;
    font-size: 32px;
    margin: 0 0 6px 0;
    font-weight: 900;
    letter-spacing: 0.5px;
  }
  .header-text .sub {
    color: #e11d48;
    font-size: 19px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .content {
    display: flex;
    padding: 24px 35px;
    gap: 30px;
    height: 470px;
  }
  .bib-box {
    width: 320px;
    background: #f8fafc;
    border: 2.5px solid #0a1c3d;
    border-radius: 12px;
    padding: 22px 18px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .bib-box .title {
    color: #64748b;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .bib-inner {
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 12px 6px;
    margin: 8px 0;
  }
  .bib-no {
    font-size: 34px;
    font-weight: 900;
    color: #0a1c3d;
    font-family: monospace;
    letter-spacing: 2px;
  }
  .cat-pill {
    background: #b91c1c;
    color: #ffffff;
    font-weight: 800;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 8px;
  }
  .meta-text {
    font-size: 14px;
    font-weight: 700;
    color: #0a1c3d;
  }
  .details-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 0 10px 0;
  }
  .field {
    margin-bottom: 10px;
  }
  .field .lbl {
    font-size: 13px;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .field .val {
    font-size: 22px;
    font-weight: 800;
    color: #0a1c3d;
  }
  .qr-box {
    width: 250px;
    background: #f8fafc;
    border: 2px solid #d4af37;
    border-radius: 12px;
    padding: 20px 14px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .qr-img {
    width: 200px;
    height: 200px;
    background: #ffffff;
    border-radius: 8px;
    padding: 6px;
    border: 1px solid #cbd5e1;
  }
  .qr-lbl {
    font-size: 15px;
    font-weight: 800;
    color: #0a1c3d;
    margin-top: 10px;
  }
  .qr-sub {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 1.5px solid #e2e8f0;
    height: 65px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 13px;
  }
  .footer .tag {
    color: #0a1c3d;
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ''}
      <div class="header-text">
        <h1>RAJASTHAN POLICE MARATHON 2027</h1>
        <div class="sub">★ RUN FOR HER • DIGITAL ENTRY PASS ★</div>
      </div>
    </div>
    <div class="content">
      <div class="bib-box">
        <div class="title">REGISTRATION NO.</div>
        <div class="bib-inner">
          <div class="bib-no">${bibNumber}</div>
        </div>
        <div class="cat-pill">${category}</div>
        <div class="meta-text">Blood Group: ${bloodGroup} ${tshirtSize !== 'N/A' ? ` | Size: ${tshirtSize}` : ''}</div>
        <div style="height: 1px; background: #e2e8f0; margin: 6px 0;"></div>
        <div class="meta-text" style="font-size: 13px;">Reporting: ${eventDate}</div>
        <div style="font-size: 12px; color: #64748b; font-weight: 700;">Gate No. 2 • Albert Hall, Jaipur</div>
      </div>
      <div class="details-box">
        <div class="field">
          <div class="lbl">RUNNER FULL NAME:</div>
          <div class="val" style="font-size: 26px;">${fullName}</div>
        </div>
        <div class="field">
          <div class="lbl">REPORTING VENUE:</div>
          <div class="val" style="font-size: 19px;">📍 ${venue}</div>
        </div>
        <div class="field">
          <div class="lbl">REGISTERED MOBILE & EMAIL:</div>
          <div class="val" style="font-size: 17px;">📞 +91 ${mobile}  •  ✉️ ${email}</div>
        </div>
        <div class="field">
          <div class="lbl">EMERGENCY CONTACT:</div>
          <div class="val" style="color: #991b1b; font-size: 16px;">${emergencyContact}</div>
        </div>
      </div>
      <div class="qr-box">
        <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
        <div class="qr-lbl">Security Entry Scan</div>
        <div class="qr-sub">RFID Enabled Verification Token</div>
      </div>
    </div>
    <div class="footer">
      <div class="tag">★ Committed to Serve • Rajasthan Police ★</div>
      <div>24×7 Women Helpline: 1090 | Emergency: 112 | Portal: police.rajasthan.gov.in</div>
    </div>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 660, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const buffer = await page.screenshot({ type: "png" });
    return buffer;
  } finally {
    await browser.close().catch(() => {});
  }
}
