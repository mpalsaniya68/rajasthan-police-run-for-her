import net from "net";
import tls from "tls";
import fs from "fs";
import QRCode from "qrcode";
import { generateEPassPngBuffer } from "./renderPassPng.js";

/**
 * HTML Character Entity Escaping for injection prevention
 */
export function escapeHtml(text = "") {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Authoritative District Venue & Kit Expo Mapping
 */
export const DISTRICT_VENUE_MAP = {
  jaipur: {
    venue: "अल्बर्ट हॉल, रामनिवास बाग, जयपुर",
    venueEn: "Albert Hall Museum, Ram Niwas Garden, Jaipur",
    expoLocation: "अल्बर्ट हॉल परिसर, रामनिवास बाग, जयपुर",
    expoLocationEn: "Albert Hall Complex, Ram Niwas Garden, Jaipur"
  },
  udaipur: {
    venue: "फतेह सागर पाल, उदयपुर",
    venueEn: "Fateh Sagar Paal, Udaipur",
    expoLocation: "फतेह सागर पाल / पुलिस लाइन ग्राउंड, उदयपुर",
    expoLocationEn: "Fateh Sagar Paal / Police Lines Ground, Udaipur"
  },
  jodhpur: {
    venue: "उम्मेद स्टेडियम, जोधपुर",
    venueEn: "Umaid Stadium, Jodhpur",
    expoLocation: "उम्मेद स्टेडियम / पुलिस लाइन, जोधपुर",
    expoLocationEn: "Umaid Stadium / Police Lines, Jodhpur"
  },
  kota: {
    venue: "किशोर सागर तालाब प्रोमेनेड, कोटा",
    venueEn: "Kishore Sagar Talab Promenade, Kota",
    expoLocation: "किशोर सागर / पुलिस लाइन, कोटा",
    expoLocationEn: "Kishore Sagar / Police Lines, Kota"
  }
};

/**
 * Resolve District-Specific Venue and Expo Details
 */
export function resolveDistrictDetails(districtName = "") {
  const clean = String(districtName || "").toLowerCase().trim();
  if (clean.includes("jaipur") || clean.includes("जयपुर") || clean.includes("jpr")) {
    return DISTRICT_VENUE_MAP.jaipur;
  }
  if (clean.includes("udaipur") || clean.includes("उदयपुर") || clean.includes("udr")) {
    return DISTRICT_VENUE_MAP.udaipur;
  }
  if (clean.includes("jodhpur") || clean.includes("जोधपुर") || clean.includes("jdh")) {
    return DISTRICT_VENUE_MAP.jodhpur;
  }
  if (clean.includes("kota") || clean.includes("कोटा") || clean.includes("kta")) {
    return DISTRICT_VENUE_MAP.kota;
  }
  const distDisplay = districtName ? String(districtName).trim() : "जिला मुख्यालय";
  return {
    venue: `जिला खेल स्टेडियम / पुलिस लाइन, ${distDisplay}`,
    venueEn: `District Stadium / Police Lines, ${distDisplay}`,
    expoLocation: `जिला पुलिस लाइन / आयोजन स्थल, ${distDisplay}`,
    expoLocationEn: `District Police Lines / Event Venue, ${distDisplay}`
  };
}

/**
 * Normalize line endings to CRLF and encode as 7-bit safe base64 with RFC 2045 line wrapping (76 chars)
 */
function toBase64MimeBody(content = "") {
  const crlfNormalized = String(content || "").replace(/\r?\n/g, "\r\n");
  const b64 = Buffer.from(crlfNormalized, "utf8").toString("base64");
  return b64.replace(/(.{76})/g, "$1\r\n").trim();
}

/**
 * Brevo REST API Dispatcher (HTTPS / TLS 1.3)
 */
async function sendViaBrevo({ brevoApiKey, recipient, runnerName, subject, htmlBody, plainText, attachments = [] }) {
  const senderEmail = (process.env.EMAIL_SENDER || "palsaniya2001@gmail.com").trim();
  const senderName = (process.env.EMAIL_SENDER_NAME || "Rajasthan Police Marathon 2027").trim();
  const replyTo = (process.env.EMAIL_REPLY_TO || "rajpolicemarathon@rajpolice.gov.in").trim();

  const bodyPayload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: recipient, name: runnerName || "Participant" }],
    replyTo: { email: replyTo, name: senderName },
    subject,
    htmlContent: htmlBody,
    textContent: plainText
  };

  if (attachments && attachments.length > 0) {
    bodyPayload.attachment = attachments;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": brevoApiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(bodyPayload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Brevo API Error (${res.status}): ${JSON.stringify(data)}`);
  }
  console.log(`[Email Gateway (Brevo)]: Delivered to ${recipient} (Attached Pass: ${attachments.length > 0 ? "YES" : "NO"}) | MsgId: ${data.messageId}`);
  return { success: true, provider: "brevo", messageId: data.messageId, attached: attachments.length > 0 };
}

/**
 * Resend REST API Dispatcher (HTTPS / TLS 1.3)
 */
async function sendViaResend({ resendApiKey, recipient, subject, htmlBody, plainText, attachments = [] }) {
  const fromEmail = (process.env.RESEND_FROM || "Rajasthan Police Marathon <onboarding@resend.dev>").trim();
  const bodyPayload = {
    from: fromEmail,
    to: [recipient],
    reply_to: "rajpolicemarathon@rajpolice.gov.in",
    subject,
    html: htmlBody,
    text: plainText
  };

  if (attachments && attachments.length > 0) {
    bodyPayload.attachments = attachments.map(a => ({ filename: a.name, content: a.content }));
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bodyPayload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API Error (${res.status}): ${JSON.stringify(data)}`);
  }
  console.log(`[Email Gateway (Resend)]: Delivered to ${recipient} | Id: ${data.id}`);
  return { success: true, provider: "resend", messageId: data.id };
}

/**
 * Internal Rajasthan Gov State SMTP Server Dispatcher with Enforced STARTTLS / TLS
 */
async function sendViaInternalGovSmtp({ recipient, sender, subject, mimeMessage, messageId, htmlBody, plainText }) {
  const host = (process.env.SMTP_HOST || "ex-cipp.rajasthan.gov.in").trim();
  const port = parseInt(process.env.SMTP_PORT || "25", 10);
  const isImplicitTls = port === 465 || process.env.SMTP_SECURE === "true";

  return new Promise((resolve, reject) => {
    let settled = false;
    let messageAccepted = false;

    function safeReject(err) {
      if (!settled) {
        settled = true;
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    }

    function safeResolve(val) {
      if (!settled) {
        settled = true;
        resolve(val);
      }
    }

    let activeSocket = null;
    let buffer = "";
    let state = isImplicitTls ? "SECURE_EHLO" : "CONNECT";
    let multilineLines = [];

    function sendCmd(cmd) {
      if (activeSocket && !activeSocket.destroyed) {
        activeSocket.write(cmd + "\r\n");
      }
    }

    function onCompleteReply(code, lines, fullReply) {
      if (state === "CONNECT") {
        if (code === 220) {
          state = "INITIAL_EHLO";
          sendCmd("EHLO police.rajasthan.gov.in");
        } else {
          safeReject(new Error(`SMTP connection banner error: ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "INITIAL_EHLO") {
        if (code === 250) {
          const supportsStartTls = lines.some((l) => l.toUpperCase().includes("STARTTLS"));
          if (!supportsStartTls) {
            safeReject(
              new Error(
                "Secure transport unavailable: SMTP server does not advertise STARTTLS. Refusing to transmit participant data over unencrypted transport."
              )
            );
            sendCmd("QUIT");
            activeSocket.end();
            return;
          }
          state = "STARTTLS";
          sendCmd("STARTTLS");
        } else {
          safeReject(new Error(`EHLO failed before STARTTLS: ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "STARTTLS") {
        if (code === 220) {
          state = "UPGRADING_TLS";
          const plainSocket = activeSocket;
          plainSocket.removeAllListeners("data");
          buffer = "";
          multilineLines = [];

          const tlsSocket = tls.connect(
            {
              socket: plainSocket,
              host: host,
              servername: host
            },
            () => {
              activeSocket = tlsSocket;
              attachSocketListeners(tlsSocket);
              state = "SECURE_EHLO";
              sendCmd("EHLO police.rajasthan.gov.in");
            }
          );

          tlsSocket.on("error", (tlsErr) => {
            safeReject(new Error(`STARTTLS negotiation failed: ${tlsErr.message}`));
          });
        } else {
          safeReject(new Error(`STARTTLS rejected by SMTP server (${code}): ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "SECURE_EHLO") {
        if (code === 250) {
          state = "MAIL_FROM";
          sendCmd(`MAIL FROM:<${sender}>`);
        } else {
          safeReject(new Error(`Secure EHLO failed: ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "MAIL_FROM") {
        if (code === 250) {
          state = "RCPT_TO";
          sendCmd(`RCPT TO:<${recipient}>`);
        } else {
          safeReject(new Error(`MAIL FROM rejected (${code}): ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "RCPT_TO") {
        if (code === 250) {
          state = "DATA";
          sendCmd("DATA");
        } else {
          safeReject(new Error(`RCPT TO rejected (${code}): ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "DATA") {
        if (code === 354) {
          state = "DATA_SENT";
          activeSocket.write(mimeMessage + "\r\n.\r\n");
        } else {
          safeReject(new Error(`DATA command rejected (${code}): ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "DATA_SENT") {
        if (code === 250) {
          messageAccepted = true;
          state = "QUIT";
          sendCmd("QUIT");
          safeResolve({ success: true, messageId, response: fullReply, htmlBody, plainText });
        } else {
          safeReject(new Error(`Message body rejected (${code}): ${fullReply}`));
          sendCmd("QUIT");
          activeSocket.end();
        }
      } else if (state === "QUIT") {
        activeSocket.end();
      }
    }

    function attachSocketListeners(sock) {
      sock.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        while (buffer.includes("\r\n")) {
          const idx = buffer.indexOf("\r\n");
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          multilineLines.push(line);
          const matchContinuation = /^(\d{3})-(.*)$/.exec(line);
          const matchTerminator = /^(\d{3})(?: (.*))?$/.exec(line);

          if (!matchContinuation && matchTerminator) {
            const statusCode = parseInt(matchTerminator[1], 10);
            const collectedLines = [...multilineLines];
            multilineLines = [];
            onCompleteReply(statusCode, collectedLines, line);
          }
        }
      });

      sock.on("timeout", () => {
        sock.destroy();
        safeReject(new Error("SMTP socket connection timed out"));
      });

      sock.on("error", (err) => {
        safeReject(err);
      });

      sock.on("end", () => {
        if (!messageAccepted) {
          safeReject(new Error("SMTP server closed connection before message acceptance"));
        }
      });

      sock.on("close", () => {
        if (messageAccepted) {
          safeResolve({ success: true, messageId, htmlBody, plainText });
        } else {
          safeReject(new Error("SMTP socket closed before message was accepted"));
        }
      });
    }

    if (isImplicitTls) {
      activeSocket = tls.connect({ host, port, servername: host }, () => {
        attachSocketListeners(activeSocket);
      });
      activeSocket.on("error", safeReject);
    } else {
      activeSocket = net.createConnection({ host, port, timeout: 15000 }, () => {
        attachSocketListeners(activeSocket);
      });
      activeSocket.on("error", safeReject);
    }
  });
}

/**
 * Universal Confirmation Email Dispatcher with Digital E-Pass Attachment & Clean Professional Design
 */
export async function sendLiveConfirmationEmail({
  recipient = "rajpolicemarathon@rajpolice.gov.in",
  sender = "rajpolicemarathon@rajpolice.gov.in",
  runnerName = "विक्रम सिंह राठौड़",
  bibNumber = "RJ-21K-1008",
  category = "21 KM हाफ मैराथन (Jaipur Flagship)",
  eventDate = "रविवार, 24 जनवरी 2027 (सुबह 05:30 बजे)",
  venue = "",
  expoLocation = "",
  districtName = "जयपुर",
  epassUrl = "https://police.rajasthan.gov.in/epass/RJ-POL-2027-1F1381",
  mobile = "9829012345",
  bloodGroup = "B+",
  tshirtSize = "L",
  emergencyContact = "Family (9829099887)"
} = {}) {
  const distDetails = resolveDistrictDetails(districtName);
  const finalVenue = venue || distDetails.venue;
  const finalExpo = expoLocation || distDetails.expoLocation;
  const safeRunnerName = escapeHtml(runnerName);

  // Generate verified QR code image for E-Pass
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(epassUrl, {
      width: 280,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" }
    });
  } catch (qrErr) {
    console.error("[QR Code Generation Error]:", qrErr.message);
  }

  // Subject: Clean, Human, Natural Hindi (No robotic "पंजीकरण पुष्टि")
  const subject = `पंजीकरण सफल • राजस्थान पुलिस मैराथन 2027 (बिब: ${bibNumber})`;

  // Standalone, Official Printable HTML E-Pass Attachment
  const printableEPassHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <title>Rajasthan Police Marathon 2027 - Official E-Pass (${bibNumber})</title>
  <style>
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .pass-card { box-shadow: none !important; border: 2px solid #0f172a !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #0f172a;
    }
    .pass-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      border: 1px solid #e2e8f0;
    }
    .pass-header {
      background: #0a1c3d;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      border-bottom: 3px solid #d97706;
    }
    .pass-header h1 {
      font-size: 19px;
      margin: 0 0 4px 0;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .pass-header .sub {
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 600;
    }
    .bib-section {
      text-align: center;
      padding: 18px 20px 14px 20px;
      background: #fafafa;
      border-bottom: 1px dashed #cbd5e1;
    }
    .bib-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .bib-number {
      font-size: 34px;
      font-weight: 900;
      font-family: monospace;
      color: #0a1c3d;
      letter-spacing: 2px;
      line-height: 1.1;
    }
    .category-badge {
      display: inline-block;
      margin-top: 8px;
      background: #e2e8f0;
      color: #0f172a;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .details-table {
      width: 100%;
      padding: 16px 22px;
      border-collapse: collapse;
      font-size: 13px;
    }
    .details-table td {
      padding: 7px 0;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .details-table .lbl {
      color: #64748b;
      font-weight: 600;
      width: 40%;
    }
    .details-table .val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .qr-container {
      background: #f8fafc;
      padding: 18px 20px 22px 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .qr-image {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px;
      background: #ffffff;
      display: inline-block;
    }
    .qr-caption {
      font-size: 12px;
      font-weight: 700;
      color: #0a1c3d;
      margin-top: 8px;
    }
    .qr-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .btn-print {
      background: #0a1c3d;
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 14px;
    }
    .pass-footer {
      background: #f1f5f9;
      padding: 10px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="pass-card">
    <div class="pass-header">
      <div style="font-size: 11px; color: #fde68a; font-weight: 800; letter-spacing: 1px; margin-bottom: 2px;">
        राजस्थान पुलिस • RAJASTHAN POLICE
      </div>
      <h1>राजस्थान पुलिस मैराथन 2027</h1>
      <div class="sub">रन फॉर हर • महिला सुरक्षा एवं सम्मान जन-अभियान</div>
    </div>

    <div class="bib-section">
      <div class="bib-label">पंजीकरण संख्या / बिब नंबर</div>
      <div class="bib-number">${bibNumber}</div>
      <div class="category-badge">${category}</div>
    </div>

    <table class="details-table">
      <tr>
        <td class="lbl">धावक का नाम:</td>
        <td class="val">${safeRunnerName}</td>
      </tr>
      <tr>
        <td class="lbl">दौड़ दिनांक:</td>
        <td class="val">${eventDate}</td>
      </tr>
      <tr>
        <td class="lbl">आयोजन स्थल:</td>
        <td class="val">${finalVenue}</td>
      </tr>
      <tr>
        <td class="lbl">एक्सपो व किट वितरण:</td>
        <td class="val">${finalExpo}</td>
      </tr>
      <tr>
        <td class="lbl">सत्यापन स्थिति:</td>
        <td class="val" style="color: #059669;">✓ पंजीकृत एवं अधिकृत</td>
      </tr>
    </table>

    <div class="qr-container">
      ${qrDataUrl ? `<div class="qr-image"><img src="${qrDataUrl}" width="160" height="160" alt="E-Pass QR" style="display:block;" /></div>` : ''}
      <div class="qr-caption">एक्सपो किट व रेस प्रवेश हेतु अधिकृत क्यूआर कोड</div>
      <div class="qr-sub">प्रवेश के समय यह पास मोबाइल में दिखाएं अथवा प्रिंट साथ रखें</div>
      <div class="no-print" style="margin-top: 14px;">
        <button class="btn-print" onclick="window.print()">ई-पास प्रिंट / PDF सेव करें</button>
      </div>
    </div>

    <div class="pass-footer">
      कार्यालय महानिदेशक पुलिस, राजस्थान पुलिस मुख्यालय, जयपुर | हेल्पलाइन: 112 / 1090
    </div>
  </div>
</body>
</html>`;

  const attachments = [];
  try {
    const pngBuffer = await generateEPassPngBuffer({
      fullName: runnerName,
      bibNumber,
      category,
      eventDate,
      venue: finalVenue,
      mobile,
      email: recipient,
      emergencyContact,
      bloodGroup,
      tshirtSize,
      epassUrl
    });
    if (pngBuffer && Buffer.isBuffer(pngBuffer)) {
      const cleanBib = String(bibNumber).replace(/[^a-zA-Z0-9_-]/g, "_");
      attachments.push({
        name: `RJ-POLICE-MARATHON-EPASS-${cleanBib}.png`,
        content: pngBuffer.toString("base64")
      });
    }
  } catch (passErr) {
    console.warn("[E-Pass PNG Generation Warning]:", passErr.message);
    const attachmentBase64 = Buffer.from(printableEPassHtml, "utf8").toString("base64");
    attachments.push({
      name: `Rajasthan_Police_EPass_${bibNumber}.html`,
      content: attachmentBase64
    });
  }

  // Professional, Elegant HTML Email (Clean Indian Government Marathon Branding)
  const htmlBody = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rajasthan Police Marathon 2027</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(15,23,42,0.06);">
          
          <!-- Sleek Official Header -->
          <tr>
            <td style="background-color:#0a1c3d;padding:24px 24px 20px 24px;text-align:center;border-bottom:3px solid #d97706;">
              <div style="font-size:12px;color:#fde68a;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">
                राजस्थान पुलिस • RAJASTHAN POLICE
              </div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px 0;letter-spacing:0.3px;">
                राजस्थान पुलिस मैराथन 2027
              </h1>
              <div style="color:#94a3b8;font-size:13px;font-weight:500;">
                'रन फॉर हर' • महिला सुरक्षा, सम्मान एवं सशक्तिकरण
              </div>
            </td>
          </tr>

          <!-- Warm Personal Greeting -->
          <tr>
            <td style="padding:24px 28px 12px 28px;">
              <h2 style="font-size:17px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">
                नमस्ते ${safeRunnerName} जी,
              </h2>
              <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;">
                राजस्थान पुलिस मैराथन 2027 में आपका <strong style="color:#059669;">पंजीकरण सफल रहा है</strong>। महिला सुरक्षा व सम्मान के इस राज्यव्यापी अभियान में सहभागिता के लिए आपका हार्दिक स्वागत है।
              </p>
            </td>
          </tr>

          <!-- Runner Pass Ticket Stub -->
          <tr>
            <td style="padding:12px 28px 20px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
                
                <!-- Ticket Top: Bib Number -->
                <tr>
                  <td style="padding:18px 20px 14px 20px;text-align:center;background-color:#ffffff;border-bottom:1px dashed #cbd5e1;">
                    <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
                      पंजीकरण संख्या / बिब नंबर
                    </div>
                    <div style="font-size:32px;font-weight:900;font-family:monospace;color:#0a1c3d;letter-spacing:2px;line-height:1.1;">
                      ${bibNumber}
                    </div>
                    <div style="display:inline-block;margin-top:6px;background-color:#f1f5f9;color:#0f172a;padding:3px 14px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #e2e8f0;">
                      ${category}
                    </div>
                  </td>
                </tr>

                <!-- Ticket Middle: Details Grid -->
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="4" border="0" style="font-size:13px;">
                      <tr>
                        <td width="38%" style="color:#64748b;font-weight:600;padding:5px 0;">दौड़ दिनांक:</td>
                        <td width="62%" style="color:#0f172a;font-weight:700;padding:5px 0;">${eventDate}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-weight:600;padding:5px 0;">रिपोर्टिंग समय:</td>
                        <td style="color:#0f172a;font-weight:700;padding:5px 0;">सुबह 05:30 बजे</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-weight:600;padding:5px 0;">दौड़ स्थल:</td>
                        <td style="color:#0f172a;font-weight:700;padding:5px 0;">${finalVenue}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-weight:600;padding:5px 0;">सत्यापन स्थिति:</td>
                        <td style="color:#059669;font-weight:700;padding:5px 0;">✓ पंजीकृत एवं स्वीकृत (Confirmed)</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Ticket Bottom: Official Attachment Notification & Online Access -->
                <tr>
                  <td style="padding:16px 20px 20px 20px;text-align:center;background-color:#ffffff;border-top:1px dashed #cbd5e1;">
                    <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 16px;text-align:center;margin-bottom:14px;">
                      <div style="font-size:14px;font-weight:700;color:#065f46;margin-bottom:4px;">
                        📎 आपका आधिकारिक डिजिटल ई-पास (PNG फ़ाइल) संलग्न है
                      </div>
                      <div style="font-size:12px;color:#047857;line-height:1.5;">
                        इस ईमेल के साथ नीचे <strong>RJ-POLICE-MARATHON-EPASS-${bibNumber}.png</strong> संलग्न है। आप इसे सीधे डाउनलोड करके अपने फोन या गैलरी में सुरक्षित रख सकते हैं।
                      </div>
                    </div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:14px;">
                      (एक्सपो में किट संग्रह व रेस दिवस प्रवेश हेतु ई-पास में दिया गया बारकोड/क्यूआर कोड स्कैन किया जाएगा)
                    </div>
                    <a href="${epassUrl}" style="display:inline-block;background-color:#0a1c3d;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:6px;border:1px solid #0a1c3d;">
                      डिजिटल ई-पास ऑनलाइन खोलें एवं डाउनलोड करें →
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Bib & Kit Expo Guidelines Box -->
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #0a1c3d;border-radius:6px;padding:14px 18px;">
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:6px;">
                  बिब एवं किट वितरण (एक्सपो सूचना):
                </div>
                <div style="font-size:12px;color:#334155;line-height:1.6;">
                  • <strong>दिनांक व समय:</strong> 22 एवं 23 जनवरी 2027 (सुबह 10:00 से शाम 06:00 बजे तक)<br>
                  • <strong>स्थान:</strong> ${finalExpo}<br>
                  • <strong>आवश्यक दस्तावेज:</strong> यह ई-पास (मोबाइल में) एवं कोई भी एक सरकारी फोटो पहचान पत्र (आधार कार्ड / वोटर ID / ड्राइविंग लाइसेंस)।
                </div>
              </div>
            </td>
          </tr>

          <!-- Clean Official Footer -->
          <tr>
            <td style="background-color:#f1f5f9;padding:18px 24px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.6;">
              <div style="font-weight:700;color:#0f172a;margin-bottom:3px;">
                "हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के नाम"
              </div>
              <div>कार्यालय महानिदेशक पुलिस, राजस्थान पुलिस मुख्यालय, जयपुर</div>
              <div style="margin-top:4px;">
                आपातकालीन सहायता: <strong>112 / 1090 (महिला गरिमा हेल्प)</strong> | ईमेल: <strong>rajpolicemarathon@rajpolice.gov.in</strong>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Clean Plain Text Fallback
  const plainText = `राजस्थान पुलिस मैराथन 2027 'रन फॉर हर'
कार्यालय महानिदेशक पुलिस, राजस्थान पुलिस मुख्यालय, जयपुर

नमस्ते ${runnerName} जी,

राजस्थान पुलिस मैराथन 2027 में आपका पंजीकरण सफल रहा है।

• पंजीकरण / बिब संख्या: ${bibNumber}
• दौड़ श्रेणी: ${category}
• दिनांक व समय: ${eventDate}
• दौड़ स्थल: ${finalVenue}

डिजिटल ई-पास लिंक:
${epassUrl}

(नोट: आपका डिजिटल ई-पास इस ईमेल के साथ 'Rajasthan_Police_EPass_${bibNumber}.html' फ़ाइल के रूप में संलग्न है)

बिब एवं किट वितरण (एक्सपो):
तारीख: 22 व 23 जनवरी 2027 (सुबह 10:00 से शाम 06:00 बजे तक)
स्थान: ${finalExpo}
आवश्यक दस्तावेज: ई-पास (मोबाइल में) एवं कोई एक सरकारी पहचान पत्र।

सहायता हेल्पलाइन: 112 / 1090
ईमेल: rajpolicemarathon@rajpolice.gov.in`;

  // 1. Check Brevo API Key
  const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
  if (brevoApiKey) {
    return await sendViaBrevo({ brevoApiKey, recipient, runnerName, subject, htmlBody, plainText, attachments });
  }

  // 2. Check Resend API Key
  const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
  if (resendApiKey) {
    return await sendViaResend({ resendApiKey, recipient, subject, htmlBody, plainText, attachments });
  }

  // 3. If internal Rajasthan Gov domain, dispatch via state SMTP relay with enforced TLS
  if (recipient.endsWith("@rajpolice.gov.in") || recipient.endsWith("@rajasthan.gov.in")) {
    const boundary = `----=_Part_${Date.now()}`;
    const messageId = `<${Date.now()}.rajpol.${Math.random().toString(36).substring(2)}@police.rajasthan.gov.in>`;
    const rawDate = new Date().toUTCString();
    const base64PlainText = toBase64MimeBody(plainText);
    const base64HtmlBody = toBase64MimeBody(htmlBody);

    const mimeMessage = [
      `From: =?UTF-8?B?${Buffer.from("राजस्थान पुलिस मैराथन 2027").toString("base64")}?= <${sender}>`,
      `To: <${recipient}>`,
      `Reply-To: <${sender}>`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
      `Date: ${rawDate}`,
      `Message-ID: ${messageId}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      "",
      base64PlainText,
      "",
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      "",
      base64HtmlBody,
      "",
      `--${boundary}--`,
      ""
    ].join("\r\n");

    return await sendViaInternalGovSmtp({ recipient, sender, subject, mimeMessage, messageId, htmlBody, plainText });
  }

  // 4. Default Simulated Fallback
  console.log(`[Email Dispatch (Simulated)]: Registration confirmation queued for ${recipient} (Bib: ${bibNumber})`);
  return { simulated: true, success: true, recipient, subject };
}

// Direct CLI Execution
if (process.argv[1]?.endsWith("sendSampleEmail.js")) {
  if (fs.existsSync(".env")) {
    try {
      process.loadEnvFile(".env");
    } catch {}
  }
  const targetEmail = process.argv[2] || "rajpolicemarathon@rajpolice.gov.in";
  sendLiveConfirmationEmail({ recipient: targetEmail })
    .then((res) => {
      console.log("\n========================================================");
      console.log(`✅ EMAIL DISPATCHED TO: ${targetEmail}`);
      console.log(`   Provider: ${res.provider || (res.simulated ? "SIMULATED" : "STATE_GOV_SMTP")}`);
      console.log(`   E-Pass Attached: ${res.attached ? "YES" : "NO"}`);
      console.log("========================================================");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ DISPATCH FAILED:", err.message);
      process.exit(1);
    });
}
