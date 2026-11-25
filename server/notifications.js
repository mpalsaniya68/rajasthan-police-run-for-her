/**
 * Rajasthan Police Marathon 2027 - Official Notification Service
 * Native integration for:
 * 1. RajSMS (DOIT&C - Department of Information Technology & Communication, Govt. of Rajasthan)
 * 2. National Informatics Centre (NIC) SMS Gateway
 * 3. Commercial Gateways (MSG91 / Fast2SMS / Twilio)
 * 4. Automatic Zero-Cost Secure Local Dev Simulation
 */

import { sendLiveConfirmationEmail } from "./sendSampleEmail.js";

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
  if (isLiveSmsConfigured()) {
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
      try { parsed = JSON.parse(textResp); } catch { }

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
        simulated: true,
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
  const {
    fullName,
    mobile,
    email,
    bibNumber,
    categoryName,
    certificateId,
    districtName,
    bloodGroup,
    tshirtSize,
    emergencyContact
  } = participant;

  const smsText = `राजस्थान पुलिस मैराथन 2027 'RUN FOR HER': प्रिय ${fullName}, आपका पंजीकरण सफल रहा! पंजीकरण संख्या: ${bibNumber}, श्रेणी: ${categoryName}। ई-पास: https://police.rajasthan.gov.in/epass/${certificateId} | सहायता: 112/1090`;

  const dispatchResult = await dispatchGatewaySms({
    mobile,
    message: smsText,
    templateId: process.env.SMS_DLT_REG_TEMPLATE_ID || ""
  });

  let emailResult = { simulated: true, sent: false };
  if (email && email.trim()) {
    try {
      const epassUrl = `https://police.rajasthan.gov.in/epass/${certificateId}`;
      emailResult = await sendLiveConfirmationEmail({
        recipient: email.trim(),
        runnerName: fullName,
        bibNumber,
        category: categoryName,
        districtName,
        epassUrl,
        mobile,
        bloodGroup,
        tshirtSize,
        emergencyContact
      });
    } catch (eErr) {
      console.error("[Email Dispatch Error]:", eErr.message);
      emailResult = { success: false, error: eErr.message, simulated: true };
    }
  }

  return {
    success: dispatchResult.success,
    simulated: dispatchResult.simulated,
    smsText,
    emailResult,
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
    _email = "",
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
    smsText = `राजस्थान पुलिस हाफ मैराथन 2027: प्रिय ${fullName}, आपने 'रन फॉर हर' (${categoryName}) समय ${finishTime} में पूर्ण की है। पुलिस महानिदेशक (DGP), राजस्थान द्वारा जारी डिजिटल प्रमाण पत्र डाउनलोड करें: https://police.rajasthan.gov.in/cert/${certificateId} — राजस्थान पुलिस`;
    emailSubject = `फिनिशर प्रमाण पत्र | राजस्थान पुलिस हाफ मैराथन 2027 (${categoryName})`;
    emailBody = `प्रिय ${fullName},\n\nहार्दिक बधाई! राजस्थान पुलिस हाफ मैराथन 2027 'रन फॉर हर' में आपने ${categoryName} दौड़ समय ${finishTime} में सफलतापूर्वक पूर्ण की है।\n\nपुलिस महानिदेशक (DGP) राजस्थान द्वारा जारी आपका डिजिटल प्रमाण पत्र पोर्टल पर जारी कर दिया गया है।\nसर्टिफिकेट क्रमांक: ${certificateId}\nडाउनलोड लिंक: https://police.rajasthan.gov.in/cert/${certificateId}\n\nराजस्थान पुलिस परिवार आपकी खेल भावना और नारी सुरक्षा संकल्प को सलाम करता है।\n\nकार्यालय महानिदेशक पुलिस, राजस्थान, जयपुर।`;
  } else {
    // Community Run / General Participation
    const rawDistrict = (runner.eventDistrict || runner.districtName || runner.district_name || runner.district || "").trim();
    const isJaipur = /jaipur/i.test(rawDistrict) || rawDistrict.includes("जयपुर") || /jpr/i.test(runner.districtId || runner.district_id || "");
    const hasDistrict = rawDistrict && rawDistrict !== "राजस्थान पुलिस";
    const eventDistrict = isJaipur ? "जयपुर" : (hasDistrict ? rawDistrict : "");

    const smsLocation = eventDistrict ? `${eventDistrict} में ` : "";
    const emailLocation = eventDistrict ? `${eventDistrict} से ` : "";

    smsText = `राजस्थान पुलिस 'रन फॉर हर': प्रिय ${fullName}, ${smsLocation}नारी सुरक्षा व सम्मान दौड़ में आपकी सहभागिता का डिजिटल प्रमाण पत्र जारी हो चुका है। डाउनलोड: https://police.rajasthan.gov.in/cert/${certificateId} — राजस्थान पुलिस`;
    emailSubject = `डिजिटल सहभागिता प्रमाण पत्र | रन फॉर हर - राजस्थान पुलिस`;
    emailBody = `प्रिय ${fullName},\n\n'रन फॉर हर' - महिला सुरक्षा, सम्मान एवं सशक्तिकरण के राज्यव्यापी जन-जागरूकता अभियान में ${emailLocation}सक्रिय सहभागिता के लिए राजस्थान पुलिस आपका हार्दिक आभार व्यक्त करती है।\n\nपुलिस महानिदेशक (DGP) राजस्थान द्वारा जारी डिजिटल सहभागिता प्रमाण पत्र पोर्टल पर उपलब्ध है।\nसर्टिफिकेट क्रमांक: ${certificateId}\nडाउनलोड लिंक: https://police.rajasthan.gov.in/cert/${certificateId}\n\n"हर कदम उसकी सुरक्षा के लिए"\nकार्यालय महानिदेशक पुलिस, राजस्थान, जयपुर।`;
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

/**
 * Check if a live, valid external SMS Gateway is configured with real non-placeholder credentials
 */
export function isLiveSmsConfigured() {
  const gatewayUrl = (process.env.SMS_GATEWAY_URL || "").trim();
  const apiKey = (process.env.SMS_API_KEY || "").trim();
  const username = (process.env.SMS_USERNAME || "").trim();
  const password = (process.env.SMS_PASSWORD || "").trim();

  if (!gatewayUrl) return false;
  if (!apiKey && (!username || !password)) return false;

  const isPlaceholder = (val) => {
    if (!val) return false;
    const lower = val.toLowerCase();
    return lower.includes("your_") || lower.includes("xxxx") || lower.includes("example") || lower.includes("sample");
  };

  if (isPlaceholder(apiKey) || isPlaceholder(password) || isPlaceholder(username)) {
    return false;
  }
  return true;
}

/**
 * Dispatch Citizen Registration Verification OTP via Live Gateway or Secure Simulation
 */
export async function sendRegistrationOtpNotification({ mobile, otp }) {
  const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
  const smsText = `राजस्थान पुलिस मैराथन 2027: आपका पंजीकरण सत्यापन OTP है ${otp}। यह 5 मिनट के लिए मान्य है। कृपया इसे किसी के साथ साझा न करें। - राजस्थान पुलिस`;

  const dispatchResult = await dispatchGatewaySms({
    mobile: cleanMobile,
    message: smsText,
    templateId: process.env.SMS_DLT_OTP_TEMPLATE_ID || ""
  });

  if (dispatchResult.simulated) {
    console.log(`[REGISTRATION OTP SIMULATION] For +91-${cleanMobile}: ${otp}`);
  }

  return dispatchResult;
}

/**
 * Dispatch E-Pass Unlock OTP via Live Gateway or Secure Simulation
 */
export async function sendPassOtpNotification({ mobile, otp, fullName = "धावक" }) {
  const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
  const smsText = `राजस्थान पुलिस मैराथन 2027: नमस्ते ${fullName}, आपका ई-पास डाउनलोड सुरक्षा OTP है ${otp}। यह 5 मिनट के लिए मान्य है। - राजस्थान पुलिस`;

  const dispatchResult = await dispatchGatewaySms({
    mobile: cleanMobile,
    message: smsText,
    templateId: process.env.SMS_DLT_OTP_TEMPLATE_ID || ""
  });

  if (dispatchResult.simulated) {
    console.log(`[PASS OTP SIMULATION] For ${fullName} (+91-${cleanMobile}): ${otp}`);
  }

  return dispatchResult;
}

/**
 * Check if a live, valid external WhatsApp Gateway is configured
 */
export function isLiveWhatsAppConfigured() {
  const waUrl = (process.env.WHATSAPP_API_URL || "").trim();
  const waToken = (process.env.WHATSAPP_API_TOKEN || "").trim();
  if (!waUrl || !waToken) return false;
  const isPlaceholder = (val) => {
    const lower = val.toLowerCase();
    return lower.includes("your_") || lower.includes("xxxx") || lower.includes("example");
  };
  return !isPlaceholder(waToken);
}

/**
 * Unified WhatsApp Gateway Dispatcher with Meta Cloud API & Commercial Gateway Support
 */
export async function dispatchGatewayWhatsApp({ mobile, message, templateName: _templateName = "" }) {
  const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, error: "Invalid 10-digit mobile number", simulated: true };
  }

  const waUrl = (process.env.WHATSAPP_API_URL || "").trim();
  const waToken = (process.env.WHATSAPP_API_TOKEN || "").trim();

  if (isLiveWhatsAppConfigured()) {
    try {
      const res = await fetch(waUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${waToken}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${cleanMobile}`,
          type: "text",
          text: { body: message }
        })
      });
      const data = await res.json().catch(() => ({}));
      console.log(`[WHATSAPP Gateway (Live)]: Sent to +91-${cleanMobile} | Status: ${res.status}`);
      return {
        success: res.ok,
        simulated: false,
        gatewayResponse: typeof data === "object" ? JSON.stringify(data) : String(data)
      };
    } catch (err) {
      console.error(`[WHATSAPP Gateway Error]:`, err.message);
      return {
        success: false,
        simulated: true,
        gatewayResponse: `ERROR: ${err.message}`
      };
    }
  }

  // Secure Simulation Mode
  console.log(`[WHATSAPP SIMULATION] To +91-${cleanMobile}: ${message.slice(0, 75).replace(/\n/g, ' ')}...`);
  return {
    success: true,
    simulated: true,
    gatewayResponse: `SUCCESS_SIMULATED: WhatsApp to +91-${cleanMobile}`
  };
}

/**
 * Standard Government Campaign Templates
 */
export const BROADCAST_TEMPLATES = {
  CONFIRMATION: {
    id: "CONFIRMATION",
    title: "पंजीकरण एवं ई-पास पुष्टि",
    defaultChannel: "BOTH",
    text: `🏛️ राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'\n\nप्रिय {name},\nआपका पंजीकरण सफल रहा है!\n\n🔢 पंजीकरण संख्या: {bib}\n🏃 दौड़ श्रेणी: {category}\n📍 स्थान: {district}\n👕 टी-शर्ट साइज़: {tshirtSize}\n\n📲 अपना डिजिटल ई-पास व क्यूआर कोड तुरंत डाउनलोड करें:\n👉 https://police.rajasthan.gov.in/epass/{certId}\n\nहेल्पलाइन: 112 / 1090\n- राजस्थान पुलिस मुख्यालय`
  },
  PROMOTION: {
    id: "PROMOTION",
    title: "नारी सुरक्षा जन-आंदोलन एवं मैराथन आमंत्रण",
    defaultChannel: "WHATSAPP",
    text: `🌸 राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'\n\nनमस्ते {name},\n"हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के लिए"\n\n24 जनवरी 2027 को जयपुर एवं प्रदेश के समस्त 41 जिलों में आयोजित होने वाली ऐतिहासिक मैराथन में भाग लें। अपने परिजनों एवं मित्रों को भी इस राज्यव्यापी अभियान से जोड़ें।\n\nपंजीकरण पोर्टल:\n👉 https://police.rajasthan.gov.in/marathon\n\n- पुलिस महानिदेशक कार्यालय, राजस्थान पुलिस`
  },
  EXPO_KIT_REMINDER: {
    id: "EXPO_KIT_REMINDER",
    title: "एक्सपो किट (टी-शर्ट एवं RFID) संग्रह रिमाइंडर",
    defaultChannel: "BOTH",
    text: `👕 राजस्थान पुलिस मैराथन 2027 — किट सूचना\n\nआदरणीय {name},\nआपकी प्रतिभागी किट (साइज: {tshirtSize} एवं पंजीकरण संख्या #{bib}) तैयार है।\n\n📅 किट वितरण: 22 एवं 23 जनवरी 2027\n⏰ समय: प्रातः 10:00 AM से सायं 07:00 PM\n📍 स्थान: अल्बर्ट हॉल मैराथन एक्सपो काउंटर, जेएलएन मार्ग, जयपुर\n\nकृपया अपना ई-पास अथवा एसएमएस दिखाकर किट अवश्य प्राप्त करें।\n- राजस्थान पुलिस एक्सपो समिति`
  },
  RACE_REMINDER: {
    id: "RACE_REMINDER",
    title: "रेस दिवस फ्लैग-ऑफ समय एवं एडवाइजरी",
    defaultChannel: "BOTH",
    text: `⚡ राजस्थान पुलिस मैराथन 2027 — रेस दिवस एडवाइजरी\n\nप्रिय धावक {name},\nमैराथन दिवस में केवल कुछ घंटे शेष हैं!\n\n⏰ रिपोर्टिंग समय: प्रातः 05:00 AM (24 जनवरी)\n🏁 फ्लैग-ऑफ: प्रातः 06:00 AM\n📍 वेन्यू: {district}\n\nकृपया अपना ई-पास व पंजीकरण संख्या #{bib} साथ रखें।\n- कंट्रोल रूम, राजस्थान पुलिस`
  },
  CUSTOM: {
    id: "CUSTOM",
    title: "विशेष संदेश (Custom Broadcast)",
    defaultChannel: "BOTH",
    text: `राजस्थान पुलिस मैराथन 2027: प्रिय {name}, आपकी पंजीकरण संख्या {bib} ({category}) है। राजस्थान पुलिस नारी सुरक्षा संकल्प में आपके उत्साह की सराहना करती है। - राजस्थान पुलिस`
  }
};

/**
 * Helper to substitute dynamic runner fields into templates
 */
export function resolveMessagePlaceholders(templateText, runner = {}) {
  if (!templateText) return "";
  const name = runner.fullName || runner.full_name || "धावक";
  const bib = runner.bibNumber || runner.bib_number || "RJ-21K-XXXX";
  const cat = runner.categoryName || runner.category_name || "21 KM Half Marathon";
  const dist = runner.districtName || runner.district_name || "जयपुर";
  const cert = runner.certificateId || runner.certificate_id || "CERT-XXXX";
  const rawSize = runner.tshirtSize || runner.tshirt_size || "";
  const hasTshirt = rawSize && 
    rawSize !== "N/A" && 
    rawSize !== "none" && 
    !rawSize.toLowerCase().includes("n/a");

  let text = templateText;

  // If runner does not get a T-shirt (e.g. District non-timed event or N/A), omit the T-shirt line completely!
  if (!hasTshirt) {
    text = text
      .split('\n')
      .filter(line => !line.includes('{tshirtSize}') && !line.includes('टी-शर्ट') && !line.includes('T-Shirt') && !line.includes('tshirt'))
      .join('\n');
  }

  return text
    .replace(/\{name\}/g, name)
    .replace(/\{bib\}/g, bib)
    .replace(/\{category\}/g, cat)
    .replace(/\{district\}/g, dist)
    .replace(/\{certId\}/g, cert)
    .replace(/\{tshirtSize\}/g, rawSize || "")
    .replace(/बिब नंबर/g, "पंजीकरण संख्या");
}


