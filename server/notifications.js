/**
 * Rajasthan Police Marathon 2027 - Official Notification Service
 * Native integration for:
 * 1. RajSMS (DOIT&C - Department of Information Technology & Communication, Govt. of Rajasthan)
 * 2. National Informatics Centre (NIC) SMS Gateway
 * 3. Commercial Gateways (MSG91 / Fast2SMS / Twilio)
 * 4. Automatic Zero-Cost Secure Local Dev Simulation
 */

const SMS_SENDER_ID = process.env.SMS_SENDER_ID || "RAJPOL";

/**
 * Unified SMS Gateway Dispatcher with Native RajSMS (DOIT&C Rajasthan) + Generic Support
 */
export async function dispatchGatewaySms({ mobile, message, templateId = "" }) {
  const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, error: "Invalid 10-digit mobile number", simulated: true };
  }

  const gatewayUrl = (process.env.SMS_GATEWAY_URL || "").trim();
  const provider = (process.env.SMS_PROVIDER || "").toLowerCase().trim();
  const isRajSms = provider === "rajsms" || gatewayUrl.toLowerCase().includes("rajsms");

  const apiKey = (process.env.SMS_API_KEY || "").trim();
  const username = (process.env.SMS_USERNAME || apiKey || "").trim();
  const password = (process.env.SMS_PASSWORD || apiKey || "").trim();
  const senderId = (process.env.SMS_SENDER_ID || SMS_SENDER_ID || "RAJPOL").trim();
  const dltTemplateId = (process.env.SMS_DLT_TEMPLATE_ID || templateId || "").trim();
  const dltEntityId = (process.env.SMS_DLT_ENTITY_ID || "").trim();

  // If live credentials provided, attempt real HTTP dispatch
  if (gatewayUrl && (apiKey || (username && password))) {
    try {
      let res;
      if (isRajSms) {
        // 🏛️ Official RajSMS Gateway (DOIT&C Government of Rajasthan)
        // Standard RajSMS postpush.do endpoint accepts form-urlencoded / query parameters
        const formParams = new URLSearchParams();
        formParams.append("username", username);
        formParams.append("password", password);
        formParams.append("senderId", senderId);
        formParams.append("sendTo", cleanMobile);
        formParams.append("message", message);
        if (dltTemplateId) formParams.append("templateId", dltTemplateId);
        if (dltEntityId) formParams.append("entityId", dltEntityId);

        if (gatewayUrl.endsWith(".do") || gatewayUrl.includes("postpush")) {
          res = await fetch(gatewayUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formParams.toString()
          });
        } else {
          // Newer RajSMS REST endpoint (JSON)
          res = await fetch(gatewayUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
            },
            body: JSON.stringify({
              username,
              password,
              senderId,
              sendTo: cleanMobile,
              mobile: cleanMobile,
              message,
              templateId: dltTemplateId,
              entityId: dltEntityId
            })
          });
        }
      } else {
        // Standard Generic / MSG91 / NIC JSON Gateway
        res = await fetch(gatewayUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
          },
          body: JSON.stringify({
            sender: senderId,
            senderId,
            numbers: cleanMobile,
            mobile: cleanMobile,
            message,
            templateId: dltTemplateId
          })
        });
      }

      const textResp = await res.text();
      let parsed = textResp;
      try { parsed = JSON.parse(textResp); } catch (e) {}

      console.log(`[SMS Gateway (${isRajSms ? 'RajSMS' : 'Live'})]: Sent to +91-${cleanMobile} | Status: ${res.status}`);
      return {
        success: res.ok,
        simulated: false,
        gatewayResponse: typeof parsed === "object" ? JSON.stringify(parsed) : parsed
      };
    } catch (err) {
      console.error(`[SMS Gateway Error]:`, err.message);
      return {
        success: false,
        simulated: false,
        gatewayResponse: `ERROR: ${err.message}`
      };
    }
  }

  // Fallback to local secure simulated mode (Zero cost / Dev mode)
  return {
    success: true,
    simulated: true,
    gatewayResponse: `SUCCESS_SIMULATED: Sent to +91-${cleanMobile}`
  };
}

/**
 * Dispatch Official Runner Registration SMS / WhatsApp
 */
export async function sendRegistrationNotification(participant) {
  const { fullName, mobile, bibNumber, categoryName, certificateId } = participant;

  const smsText = `राजस्थान पुलिस मैराथन 2027 'RUN FOR HER': प्रिय ${fullName}, आपका पंजीकरण सफल रहा! बिब नंबर: ${bibNumber}, श्रेणी: ${categoryName}। ई-पास: https://police.rajasthan.gov.in/epass/${certificateId} | सहायता: 112/1090`;

  const dispatchResult = await dispatchGatewaySms({
    mobile,
    message: smsText,
    templateId: process.env.SMS_DLT_REG_TEMPLATE_ID || ""
  });

  return {
    success: dispatchResult.success,
    simulated: dispatchResult.simulated,
    smsText,
    gatewayResponse: dispatchResult.gatewayResponse
  };
}

/**
 * Dispatch Finisher Certificate Announcement Notification (SMS & Email)
 * Distinct drafts for District Awareness Run (SP Level) vs Jaipur Flagship (PHQ / DGP Level)
 */
export async function sendCertificateNotification(runner) {
  const {
    fullName = "धावक",
    mobile = "",
    email = "",
    certificateId = "",
    finishTime = "",
    categoryName = "5 KM Community Run",
    districtName = "राजस्थान पुलिस",
    isJaipurTimed = false
  } = runner;

  let smsText = "";
  let emailSubject = "";
  let emailBody = "";

  if (isJaipurTimed && finishTime) {
    // PHQ / Jaipur Flagship Timed Half Marathon
    smsText = `राजस्थान पुलिस हाफ मैराथन 2027: प्रिय ${fullName}, आपने 'रन फॉर हर' (${categoryName}) आधिकारिक समय ${finishTime} में पूर्ण की है। पुलिस महानिदेशक (DGP), राजस्थान द्वारा अधिकृत डिजिटल प्रमाण पत्र डाउनलोड करें: https://police.rajasthan.gov.in/cert/${certificateId} — राजस्थान पुलिस`;
    emailSubject = `आधिकारिक फिनिशर प्रमाण पत्र | राजस्थान पुलिस हाफ मैराथन 2027 (${categoryName})`;
    emailBody = `प्रिय ${fullName},\n\nहार्दिक बधाई! राजस्थान पुलिस हाफ मैराथन 2027 'रन फॉर हर' में आपने ${categoryName} दौड़ आधिकारिक समय ${finishTime} में सफलतापूर्वक पूर्ण की है।\n\nपुलिस महानिदेशक (DGP) राजस्थान द्वारा अधिकृत आपका डिजिटल प्रमाण पत्र पोर्टल पर जारी कर दिया गया है।\nसर्टिफिकेट क्रमांक: ${certificateId}\nडाउनलोड लिंक: https://police.rajasthan.gov.in/cert/${certificateId}\n\nराजस्थान पुलिस परिवार आपकी खेल भावना और नारी सुरक्षा संकल्प को सलाम करता है।\n\nकार्यालय महानिदेशक पुलिस, राजस्थान, जयपुर।`;
  } else {
    // District / SP Level Awareness Run
    smsText = `राजस्थान पुलिस 'रन फॉर हर': प्रिय ${fullName}, ${districtName} में नारी सुरक्षा व सम्मान दौड़ में आपकी सहभागिता का आधिकारिक डिजिटल प्रमाण पत्र जारी हो चुका है। डाउनलोड: https://police.rajasthan.gov.in/cert/${certificateId} — पुलिस अधीक्षक कार्यालय`;
    emailSubject = `अधिकृत सहभागिता प्रमाण पत्र | रन फॉर हर - राजस्थान पुलिस (${districtName})`;
    emailBody = `प्रिय ${fullName},\n\n'रन फॉर हर' - महिला सुरक्षा, सम्मान एवं सशक्तिकरण के राज्यव्यापी जन-जागरूकता अभियान में ${districtName} से सक्रिय सहभागिता के लिए राजस्थान पुलिस आपका हार्दिक आभार व्यक्त करती है।\n\nजिला पुलिस अधीक्षक (SP) द्वारा अधिकृत आपका डिजिटल सहभागिता प्रमाण पत्र पोर्टल पर उपलब्ध है।\nसर्टिफिकेट क्रमांक: ${certificateId}\nडाउनलोड लिंक: https://police.rajasthan.gov.in/cert/${certificateId}\n\n"हर कदम उसकी सुरक्षा के लिए"\nकार्यालय जिला पुलिस अधीक्षक, ${districtName}।`;
  }

  const dispatchResult = await dispatchGatewaySms({
    mobile,
    message: smsText,
    templateId: process.env.SMS_DLT_CERT_TEMPLATE_ID || ""
  });

  return {
    success: dispatchResult.success,
    simulated: dispatchResult.simulated,
    smsText,
    emailSubject,
    emailBody,
    gatewayResponse: dispatchResult.gatewayResponse
  };
}

/**
 * Async Batch Queue Dispatcher for 1-Click Mass Certificate Release
 */
export async function batchDispatchCertificateNotifications(runners = []) {
  if (!runners.length) return { processed: 0 };
  
  // Non-blocking background worker execution
  setImmediate(async () => {
    try {
      for (let i = 0; i < runners.length; i += 25) {
        const chunk = runners.slice(i, i + 25);
        await Promise.all(chunk.map(r => sendCertificateNotification(r)));
      }
    } catch (err) {
      console.error("[Batch Notification Queue Error]:", err);
    }
  });

  return { processed: runners.length, queued: true };
}

/**
 * Dispatch Admin 2FA Login OTP via Live Gateway or Secure Simulation
 */
export async function sendAdminOtpNotification({ mobile, otp, username, role }) {
  const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
  const smsText = `राजस्थान पुलिस मैराथन 2027: आपका एडमिन लॉगिन OTP है ${otp}। यह 5 मिनट के लिए मान्य है। कृपया इसे किसी के साथ साझा न करें। - PHQ कंट्रोल रूम`;

  const dispatchResult = await dispatchGatewaySms({
    mobile: cleanMobile,
    message: smsText,
    templateId: process.env.SMS_DLT_OTP_TEMPLATE_ID || ""
  });

  if (dispatchResult.simulated) {
    console.log(`[ADMIN 2FA OTP] For ${username} (${role}): ${otp} to +91-${cleanMobile}`);
  }

  return {
    success: dispatchResult.success,
    simulated: dispatchResult.simulated,
    smsText,
    gatewayResponse: dispatchResult.gatewayResponse
  };
}
