import net from "net";

export async function sendLiveConfirmationEmail({
  recipient = "rajpolicemarathon@rajpolice.gov.in",
  sender = "rajpolicemarathon@rajpolice.gov.in",
  runnerName = "विक्रम सिंह राठौड़ (नमूना धावक)",
  bibNumber = "RJ-21K-1008",
  category = "21 KM हाफ मैराथन (Jaipur Flagship)",
  eventDate = "रविवार, 3 जनवरी 2027 (प्रातः 05:30 AM)",
  venue = "अल्बर्ट हॉल, रामनिवास बाग, जयपुर",
  epassUrl = "https://police.rajasthan.gov.in/epass/RJ-POL-2027-1F1381"
} = {}) {
  const subject = `पंजीकरण पुष्टि | राजस्थान पुलिस मैराथन 2027 (बिब: ${bibNumber})`;

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
                  आदरणीय <strong>${runnerName}</strong>, राजस्थान पुलिस के राज्यव्यापी जन-अभियान में आपकी सहभागिता दर्ज हो चुकी है।
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
                        <td width="60%" style="color:#0f172a;font-size:14px;font-weight:800;">${runnerName}</td>
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
                        <td style="color:#0f172a;font-size:13px;font-weight:700;">${venue}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call to Action: Download E-Pass -->
          <tr>
            <td style="padding:14px 28px 24px 28px;text-align:center;">
              <a href="${epassUrl}" style="display:inline-block;background-color:#0a1c3d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 30px;border-radius:8px;box-shadow:0 4px 12px rgba(10,28,61,0.2);border:2px solid #f59e0b;">
                📲 डिजिटल ई-पास डाउनलोड करें (View E-Pass) →
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
                  • <strong>स्थल:</strong> अल्बर्ट हॉल परिसर, रामनिवास बाग, जयपुर<br>
                  • <strong>आवश्यक दस्तावेज:</strong> ई-पास (मोबाइल में) एवं कोई भी सरकारी फोटो पहचान पत्र (आधार/वोटर ID)।
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
• स्थल: ${venue}

डिजिटल ई-पास डाउनलोड लिंक:
${epassUrl}

बिब एक्सपो एवं किट वितरण:
1 व 2 जनवरी 2027 (प्रातः 10:00 AM से सायं 06:00 PM)
स्थान: अल्बर्ट हॉल परिसर, जयपुर

हेल्पलाइन: 112 / 1090
राजस्थान पुलिस मुख्यालय, जयपुर`;

  const boundary = `----=_Part_${Date.now()}`;
  const messageId = `<${Date.now()}.rajpol.${Math.random().toString(36).substring(2)}@police.rajasthan.gov.in>`;
  const rawDate = new Date().toUTCString();

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
    `Content-Transfer-Encoding: 8bit`,
    "",
    plainText,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    "",
    htmlBody,
    "",
    `--${boundary}--`,
    ""
  ].join("\r\n");

  return new Promise((resolve, reject) => {
    console.log(`[SMTP] Connecting to Rajasthan Gov Mail Server ex-cipp.rajasthan.gov.in:25 ...`);
    const client = net.createConnection({ host: "ex-cipp.rajasthan.gov.in", port: 25, timeout: 15000 }, () => {
      console.log(`[SMTP] ✓ Connected to ex-cipp.rajasthan.gov.in:25`);
    });

    let currentStep = 0;

    function sendCmd(cmd) {
      client.write(cmd + "\r\n");
    }

    client.on("data", (data) => {
      const resp = data.toString().trim();
      console.log(`[SMTP Server]: ${resp}`);

      if (currentStep === 0 && resp.startsWith("220")) {
        currentStep = 1;
        sendCmd("HELO police.rajasthan.gov.in");
      } else if (currentStep === 1 && resp.startsWith("250")) {
        currentStep = 2;
        sendCmd(`MAIL FROM:<${sender}>`);
      } else if (currentStep === 2 && resp.startsWith("250")) {
        currentStep = 3;
        sendCmd(`RCPT TO:<${recipient}>`);
      } else if (currentStep === 3 && resp.startsWith("250")) {
        currentStep = 4;
        sendCmd("DATA");
      } else if (currentStep === 4 && resp.startsWith("354")) {
        currentStep = 5;
        client.write(mimeMessage + "\r\n.\r\n");
      } else if (currentStep === 5 && resp.startsWith("250")) {
        console.log(`[SMTP] ✓ Delivery confirmed by state mail exchanger: ${resp}`);
        sendCmd("QUIT");
        client.end();
        resolve({ success: true, messageId, response: resp, htmlBody, plainText });
      } else if (resp.startsWith("221")) {
        // Normal SMTP QUIT acknowledgment
        client.end();
      } else if (!resp.startsWith("250") && !resp.startsWith("220") && !resp.startsWith("354")) {
        console.error(`[SMTP Error]: ${resp}`);
        client.end("QUIT\r\n");
        reject(new Error(`SMTP Rejected: ${resp}`));
      }
    });

    client.on("timeout", () => {
      client.destroy();
      reject(new Error("SMTP connection timed out"));
    });

    client.on("error", (err) => {
      reject(err);
    });
  });
}

// If run directly via CLI
if (process.argv[1]?.endsWith("sendSampleEmail.js")) {
  sendLiveConfirmationEmail()
    .then((res) => {
      console.log("\n========================================================");
      console.log("✅ EMAIL DISPATCHED SUCCESSFULLY TO:");
      console.log("   rajpolicemarathon@rajpolice.gov.in");
      console.log("========================================================");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ DISPATCH FAILED:", err);
      process.exit(1);
    });
}
