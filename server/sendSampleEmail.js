import net from "net";
import tls from "tls";
import fs from "fs";
import QRCode from "qrcode";

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
 * Universal Confirmation Email Dispatcher with Digital E-Pass Attachment & Inline QR
 */
export async function sendLiveConfirmationEmail({
  recipient = "rajpolicemarathon@rajpolice.gov.in",
  sender = "rajpolicemarathon@rajpolice.gov.in",
  runnerName = "विक्रम सिंह राठौड़ (नमूना धावक)",
  bibNumber = "RJ-21K-1008",
  category = "21 KM हाफ मैराथन (Jaipur Flagship)",
  eventDate = "रविवार, 3 जनवरी 2027 (प्रातः 05:30 AM)",
  venue = "",
  expoLocation = "",
  districtName = "जयपुर",
  epassUrl = "https://police.rajasthan.gov.in/epass/RJ-POL-2027-1F1381"
} = {}) {
  const distDetails = resolveDistrictDetails(districtName);
  const finalVenue = venue || distDetails.venue;
  const finalExpo = expoLocation || distDetails.expoLocation;
  const safeRunnerName = escapeHtml(runnerName);

  // Generate verified QR code image for E-Pass
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(epassUrl, {
      width: 260,
      margin: 1,
      color: { dark: "#071739", light: "#ffffff" }
    });
  } catch (qrErr) {
    console.error("[QR Code Generation Error]:", qrErr.message);
  }

  // Standalone, Offline-Ready Printable HTML E-Pass Document
  const printableEPassHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rajasthan Police Marathon 2027 - Official E-Pass (${bibNumber})</title>
  <style>
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .epass-card { box-shadow: none !important; border: 2px solid #071739 !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #0b192c; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .epass-card { background: #ffffff; width: 100%; max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 3px solid #f59e0b; }
    .header { background: linear-gradient(135deg, #071739 0%, #0a1c3d 100%); color: #ffffff; padding: 22px 20px; text-align: center; border-bottom: 4px solid #f59e0b; }
    .bib-box { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 10px; margin: 16px 20px 8px 20px; padding: 12px; text-align: center; }
    .bib-num { font-size: 30px; font-weight: 900; color: #b45309; letter-spacing: 2px; font-family: monospace; }
    .details-table { width: 100%; padding: 10px 20px; border-collapse: collapse; font-size: 14px; }
    .details-table td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; }
    .label { color: #64748b; font-weight: 700; width: 42%; }
    .val { color: #0f172a; font-weight: 800; }
    .qr-section { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; }
    .btn-print { background: #f59e0b; color: #071739; font-weight: 800; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 15px; margin-top: 16px; box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
  </style>
</head>
<body>
  <div class="epass-card">
    <div class="header">
      <div style="color:#fde68a;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">★ RAJASTHAN POLICE OFFICIAL DIGITAL E-PASS ★</div>
      <h2 style="margin:6px 0;font-size:22px;">राजस्थान पुलिस मैराथन 2027</h2>
      <div style="color:#93c5fd;font-size:13px;font-weight:700;">'रन फॉर हर' • Run for Her (नारी सुरक्षा व सम्मान)</div>
    </div>
    
    <div class="bib-box">
      <div style="font-size:11px;font-weight:800;color:#92400e;letter-spacing:1px;text-transform:uppercase;">OFFICIAL BIB / REGISTRATION NUMBER</div>
      <div class="bib-num">${bibNumber}</div>
      <div style="font-size:12px;color:#78350f;font-weight:700;">${category}</div>
    </div>

    <table class="details-table">
      <tr><td class="label">धावक का नाम:</td><td class="val">${safeRunnerName}</td></tr>
      <tr><td class="label">आयोजन दिनांक:</td><td class="val">${eventDate}</td></tr>
      <tr><td class="label">दौड़ स्थल:</td><td class="val">${finalVenue}</td></tr>
      <tr><td class="label">एक्सपो / किट स्थल:</td><td class="val">${finalExpo}</td></tr>
      <tr><td class="label">सत्यापन स्थिति:</td><td class="val" style="color:#059669;">✓ अधिकृत पंजीकृत ई-पास (CONFIRMED)</td></tr>
    </table>

    <div class="qr-section">
      ${qrDataUrl ? `<img src="${qrDataUrl}" width="170" height="170" style="border:3px solid #071739;border-radius:10px;padding:4px;background:#ffffff;" alt="Verification QR Code" />` : ''}
      <div style="font-size:12px;font-weight:700;color:#071739;margin-top:8px;">एक्सपो किट व रेस प्रवेश हेतु स्कैन करें</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">(Scan this QR code at Expo counter for instant verification)</div>
      <div style="margin-top:14px;" class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ ई-पास प्रिंट / PDF सेव करें (Print E-Pass)</button>
      </div>
    </div>
  </div>
</body>
</html>`;

  const attachmentBase64 = Buffer.from(printableEPassHtml, "utf8").toString("base64");
  const attachments = [
    {
      name: `Rajasthan_Police_EPass_${bibNumber}.html`,
      content: attachmentBase64
    }
  ];

  const subject = `पंजीकरण पुष्टि + डिजिटल ई-पास | राजस्थान पुलिस मैराथन 2027 (बिब: ${bibNumber})`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rajasthan Police Marathon 2027</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(10,28,61,0.1);border:1px solid #cbd5e1;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #071739 0%, #0a1c3d 100%);padding:26px 20px;text-align:center;border-bottom:4px solid #f59e0b;">
              <div style="color:#fde68a;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
                ★ राजस्थान पुलिस मुख्यालय, जयपुर ★
              </div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 6px 0;">
                राजस्थान पुलिस मैराथन 2027
              </h1>
              <div style="color:#93c5fd;font-size:14px;font-weight:700;">
                'रन फॉर हर' • Run for Her (नारी सुरक्षा व सम्मान)
              </div>
            </td>
          </tr>

          <!-- Confirmation Hero Alert -->
          <tr>
            <td style="padding:24px 28px 10px 28px;">
              <div style="background-color:#ecfdf5;border-left:4px solid #10b981;border-radius:6px;padding:14px 16px;">
                <div style="color:#065f46;font-size:16px;font-weight:800;">
                  ✓ पंजीकरण सफलतापूर्वक स्वीकृत! (Registration Confirmed)
                </div>
                <div style="color:#047857;font-size:13px;margin-top:4px;">
                  आदरणीय <strong>${safeRunnerName}</strong>, राजस्थान पुलिस के राज्यव्यापी जन-अभियान में आपकी सहभागिता दर्ज हो चुकी है।
                </div>
              </div>
            </td>
          </tr>

          <!-- Participant & Race Details Box -->
          <tr>
            <td style="padding:12px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0">
                      <tr>
                        <td width="40%" style="color:#64748b;font-size:13px;font-weight:700;">प्रतिभागी का नाम:</td>
                        <td width="60%" style="color:#0f172a;font-size:14px;font-weight:800;">${safeRunnerName}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-size:13px;font-weight:700;">पंजीकरण / बिब संख्या:</td>
                        <td style="color:#b45309;font-size:16px;font-weight:900;font-family:monospace;">${bibNumber}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-size:13px;font-weight:700;">दौड़ श्रेणी:</td>
                        <td style="color:#0f172a;font-size:13px;font-weight:800;">${category}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-size:13px;font-weight:700;">दौड़ दिनांक व समय:</td>
                        <td style="color:#0f172a;font-size:13px;font-weight:700;">${eventDate}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;font-size:13px;font-weight:700;">आयोजन स्थल:</td>
                        <td style="color:#0f172a;font-size:13px;font-weight:700;">${finalVenue}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Inline Scannable QR E-Pass Card -->
          ${qrDataUrl ? `
          <tr>
            <td style="padding:4px 28px 16px 28px;">
              <div style="text-align:center;padding:16px;background-color:#ffffff;border:2px dashed #f59e0b;border-radius:10px;box-shadow:0 2px 8px rgba(10,28,61,0.06);">
                <div style="font-size:12px;font-weight:800;color:#b45309;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
                  🎫 डिजिटल ई-पास व सत्यापन क्यूआर कोड (DIGITAL E-PASS)
                </div>
                <img src="${qrDataUrl}" width="160" height="160" style="border:2px solid #071739;border-radius:8px;padding:4px;background:#ffffff;display:inline-block;" alt="E-Pass QR Code" />
                <div style="font-size:11px;color:#64748b;margin-top:6px;">
                  एक्सपो किट काउंटर एवं रेस प्रवेश द्वार पर यह क्यूआर कोड स्कैन कराएं
                </div>
                <div style="font-size:12px;color:#059669;font-weight:800;margin-top:8px;">
                  📎 इस ईमेल के साथ आपका डिजिटल ई-पास (Rajasthan_Police_EPass_${bibNumber}.html) भी अटैच किया गया है।
                </div>
              </div>
            </td>
          </tr>` : ''}

          <!-- Call to Action: Download / View Online -->
          <tr>
            <td style="padding:10px 28px 24px 28px;text-align:center;">
              <a href="${epassUrl}" style="display:inline-block;background-color:#0a1c3d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 30px;border-radius:8px;box-shadow:0 4px 12px rgba(10,28,61,0.2);border:2px solid #f59e0b;">
                📲 ऑनलाइन ई-पास पोर्टल पर खोलें (Open Pass) →
              </a>
              <div style="color:#64748b;font-size:12px;margin-top:10px;">
                (आयोजन स्थल एवं बिब एक्सपो पर प्रवेश हेतु ई-पास का डिजिटल अथवा प्रिंटेड रूप मान्य होगा)
              </div>
            </td>
          </tr>

          <!-- Expo Bib Kit Instructions -->
          <tr>
            <td style="padding:0 28px 20px 28px;">
              <div style="background-color:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:14px 16px;">
                <div style="color:#92400e;font-size:13px;font-weight:800;margin-bottom:4px;">
                  👕 बिब एक्सपो व टी-शर्ट वितरण सूचना:
                </div>
                <div style="color:#78350f;font-size:12px;line-height:1.5;">
                  • <strong>एक्सपो दिनांक:</strong> 1 एवं 2 जनवरी 2027 (प्रातः 10:00 AM से सायं 06:00 PM)<br>
                  • <strong>स्थल:</strong> ${finalExpo}<br>
                  • <strong>आवश्यक दस्तावेज:</strong> ई-पास (संलग्न फ़ाइल अथवा मोबाइल में) एवं कोई भी सरकारी फोटो पहचान पत्र।
                </div>
              </div>
            </td>
          </tr>

          <!-- Helpline & Security Footer -->
          <tr>
            <td style="background-color:#071739;padding:18px 24px;text-align:center;color:#94a3b8;font-size:12px;">
              <div style="color:#fde68a;font-weight:700;margin-bottom:6px;">
                "हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के नाम"
              </div>
              <div>राजस्थान पुलिस हेल्पलाइन: <strong>112 / 1090 (महिला गरिमा हेल्प)</strong></div>
              <div style="margin-top:8px;font-size:11px;color:#64748b;">
                यह राजस्थान पुलिस मैराथन पोर्टल से स्वतः जनरेटेड आधिकारिक ईमेल है।<br>
                कार्यालय महानिदेशक पुलिस, राजस्थान पुलिस मुख्यालय, लाल कोठी, जयपुर - 302015
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plainText = `राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'
कार्यालय महानिदेशक पुलिस, राजस्थान, जयपुर

पंजीकरण पुष्टि (Registration Confirmed)
----------------------------------------
आदरणीय ${runnerName},

राजस्थान पुलिस मैराथन 2027 में आपका पंजीकरण सफलतापूर्वक स्वीकार कर लिया गया है।

• पंजीकरण / बिब संख्या: ${bibNumber}
• श्रेणी: ${category}
• दिनांक व समय: ${eventDate}
• स्थल: ${finalVenue}

डिजिटल ई-पास डाउनलोड लिंक:
${epassUrl}

(इस ईमेल के साथ आपका डिजिटल ई-पास 'Rajasthan_Police_EPass_${bibNumber}.html' अटैच किया गया है)

बिब एक्सपो एवं किट वितरण:
1 व 2 जनवरी 2027 (प्रातः 10:00 AM से सायं 06:00 PM)
स्थान: ${finalExpo}

हेल्पलाइन: 112 / 1090
राजस्थान पुलिस मुख्यालय, जयपुर`;

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
