import React, { useState, useEffect } from 'react';
import { 
  Send, MessageSquare, CheckCircle2, AlertCircle, RefreshCw, Check
} from 'lucide-react';
import { apiSendBroadcast, apiGetBroadcastHistory } from '../services/api';

export function getBroadcastCampaigns(isDistrictRole, districtName = "जयपुर") {
  if (isDistrictRole) {
    return [
      {
        id: "CONFIRMATION",
        badge: "रजिस्ट्रेशन पुष्टि",
        title: "पंजीकरण एवं ई-पास पुष्टि",
        desc: "नये पंजीकृत धावकों को ई-पास, पंजीकरण संख्या व स्वागत संदेश प्रेषण",
        icon: "🎫",
        defaultChannel: "BOTH",
        defaultAudience: "all",
        text: `🏛️ *राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'*

प्रिय *{name}*,
आपका पंजीकरण सफल रहा है! राजस्थान पुलिस परिवार इस ऐतिहासिक नारी सुरक्षा जन-आंदोलन में आपका हार्दिक स्वागत करता है।

🔢 *पंजीकरण संख्या:* {bib}
🏃 *दौड़ श्रेणी:* {category}
📍 *आयोजन स्थल:* {district}

📲 *अपना डिजिटल ई-पास व क्यूआर कोड तुरंत डाउनलोड करें:*
👉 https://police.rajasthan.gov.in/epass/{certId}

कृपया दौड़ दिवस पर अपना ई-पास व मूल फोटो पहचान पत्र साथ लाएं।
📞 24x7 हेल्पलाइन: 112 / 1090
- पुलिस अधीक्षक (SP) कार्यालय, ${districtName}`
      },
      {
        id: "PROMOTION",
        badge: "प्रमोशन व जागरूकता",
        title: "नारी सुरक्षा जन-आंदोलन एवं मैराथन आमंत्रण",
        desc: "महिला सुरक्षा, सम्मान एवं सशक्तिकरण संकल्प का जिला स्तरीय प्रचार",
        icon: "📣",
        defaultChannel: "WHATSAPP",
        defaultAudience: "all",
        text: `🌸 *राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'*

नमस्ते *{name}*,
*"हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के लिए"*

3 जनवरी 2027 को ${districtName} में आयोजित होने वाली ऐतिहासिक मैराथन का हिस्सा बनें।

स्वयं दौड़ें और अपने परिजनों, मित्रों व सहकर्मियों को भी नारी सुरक्षा के इस राज्यव्यापी संकल्प से जोड़ें।

👉 *ऑनलाइन पोर्टल:* https://police.rajasthan.gov.in/marathon
📞 महिला हेल्पलाइन (गरिमा): 1090 | आपातकाल: 112

- जिला पुलिस ${districtName} सदैव आपकी सेवा व सुरक्षा में तत्पर`
      },
      {
        id: "DISTRICT_EVENT_REMINDER",
        badge: "दौड़ स्थल सूचना",
        title: "दौड़ स्थल, समय एवं ई-पास सूचना",
        desc: "पंजीकृत धावकों को रिपोर्टिंग स्थल, समय एवं डिजिटल ई-पास साथ लाने की सूचना",
        icon: "📍",
        defaultChannel: "BOTH",
        defaultAudience: "all",
        text: `📍 *राजस्थान पुलिस मैराथन 2027 — ${districtName} दौड़ सूचना*

प्रिय धावक *{name}*,
राजस्थान पुलिस मैराथन 'RUN FOR HER' में भाग लेने हेतु आपकी पंजीकरण संख्या *{bib}* है।

📅 *दिनांक:* 3 जनवरी 2027
⏰ *रिपोर्टिंग समय:* प्रातः 06:30 AM
📍 *स्थल:* जिला पुलिस लाइन / कलेक्ट्रेट, ${districtName}

⚠️ *महत्वपूर्ण:* दौड़ स्थल पर प्रवेश हेतु अपना डिजिटल ई-पास (QR कोड) मोबाइल में अथवा प्रिंट साथ लाएं। (प्रवेश पर डिजिटल स्कैनर द्वारा सत्यापन किया जाएगा)।
- पुलिस अधीक्षक (SP) कार्यालय, ${districtName}`
      },
      {
        id: "RACE_REMINDER",
        badge: "रेस दिवस एडवाइजरी",
        title: "रेस दिवस समय एवं सुरक्षा/मार्ग एडवाइजरी",
        desc: "रेस दिवस रिपोर्टिंग, फ्लैग-ऑफ व रूट सुरक्षा सूचना",
        icon: "⚡",
        defaultChannel: "BOTH",
        defaultAudience: "all",
        text: `⚡ *राजस्थान पुलिस मैराथन 2027 — रेस दिवस एडवाइजरी*

प्रिय धावक *{name}*,
मैराथन दिवस में केवल कुछ घंटे शेष हैं! अपनी तैयारी पूर्ण रखें:

⏰ *रिपोर्टिंग समय:* प्रातः 06:30 AM (3 जनवरी 2027)
🏁 *फ्लैग-ऑफ:* प्रातः 07:00 AM (${districtName})
📍 *स्थान:* जिला पुलिस लाइन मैदान, ${districtName}

कृपया अपना डिजिटल ई-पास साथ रखें (पंजीकरण संख्या: *{bib}*)। मार्ग में सुरक्षा, प्राथमिक चिकित्सा व पेयजल व्यवस्था उपलब्ध रहेगी।
- जिला पुलिस नियंत्रण कक्ष, ${districtName}`
      },
      {
        id: "CUSTOM",
        badge: "कस्टम संदेश",
        title: "विशेष संदेश (Custom Broadcast)",
        desc: "अपनी आवश्यकतानुसार व्यक्तिगत टेक्स्ट व टैग्स के साथ सीधा संदेश भेजें",
        icon: "✍️",
        defaultChannel: "BOTH",
        defaultAudience: "all",
        text: `राजस्थान पुलिस मैराथन 2027: प्रिय {name}, आपकी पंजीकरण संख्या {bib} ({category}) है। राजस्थान पुलिस नारी सुरक्षा संकल्प में आपके उत्साह की सराहना करती है। - जिला पुलिस ${districtName}`
      }
    ];
  }

  // PHQ (Statewide / Flagship)
  return [
    {
      id: "CONFIRMATION",
      badge: "रजिस्ट्रेशन पुष्टि",
      title: "पंजीकरण एवं ई-पास पुष्टि",
      desc: "नये पंजीकृत धावकों को ई-पास, पंजीकरण संख्या व स्वागत संदेश प्रेषण",
      icon: "🎫",
      defaultChannel: "BOTH",
      defaultAudience: "all",
      text: `🏛️ *राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'*

प्रिय *{name}*,
आपका पंजीकरण सफल रहा है! राजस्थान पुलिस परिवार इस ऐतिहासिक नारी सुरक्षा जन-आंदोलन में आपका हार्दिक स्वागत करता है।

🔢 *पंजीकरण संख्या:* {bib}
🏃 *दौड़ श्रेणी:* {category}
📍 *आयोजन स्थल:* {district}
👕 *टी-शर्ट साइज़:* {tshirtSize}

📲 *अपना डिजिटल ई-पास व क्यूआर कोड तुरंत डाउनलोड करें:*
👉 https://police.rajasthan.gov.in/epass/{certId}

कृपया दौड़ दिवस पर अपना ई-पास व मूल फोटो पहचान पत्र साथ लाएं।
📞 24x7 हेल्पलाइन: 112 / 1090
- पुलिस महानिदेशक कार्यालय, राजस्थान पुलिस`
    },
    {
      id: "PROMOTION",
      badge: "प्रमोशन व जागरूकता",
      title: "नारी सुरक्षा जन-आंदोलन एवं मैराथन आमंत्रण",
      desc: "महिला सुरक्षा, सम्मान एवं सशक्तिकरण संकल्प का राज्यव्यापी प्रचार",
      icon: "📣",
      defaultChannel: "WHATSAPP",
      defaultAudience: "all",
      text: `🌸 *राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'*

नमस्ते *{name}*,
*"हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के लिए"*

3 जनवरी 2027 को जयपुर अल्बर्ट हॉल एवं प्रदेश के समस्त 50 पुलिस जिलों में आयोजित होने वाली ऐतिहासिक मैराथन का हिस्सा बनें।

स्वयं दौड़ें और अपने परिजनों, मित्रों व सहकर्मियों को भी नारी सुरक्षा के इस राज्यव्यापी संकल्प से जोड़ें।

👉 *ऑनलाइन पोर्टल:* https://police.rajasthan.gov.in/marathon
📞 महिला हेल्पलाइन (गरिमा): 1090 | आपातकाल: 112

- राजस्थान पुलिस सदैव आपकी सेवा व सुरक्षा में तत्पर`
    },
    {
      id: "EXPO_KIT_REMINDER",
      badge: "एक्सपो किट पिक-अप",
      title: "एक्सपो किट (टी-शर्ट एवं RFID) संग्रह रिमाइंडर",
      desc: "विशेषकर उन धावकों को रिमाइंडर जिनकी किट अभी तक पेंडिंग है (जयपुर)",
      icon: "👕",
      defaultChannel: "BOTH",
      defaultAudience: "kit_pending",
      text: `👕 *राजस्थान पुलिस मैराथन 2027 — किट वितरण सूचना*

आदरणीय *{name}*,
आपकी रनर किट (टी-शर्ट साइज़: *{tshirtSize}* एवं पंजीकरण संख्या *#{bib}*) एक्सपो काउंटर पर तैयार है।

📅 *वितरण तिथि:* 1 एवं 2 जनवरी 2027
⏰ *समय:* प्रातः 10:00 AM से सायं 07:00 PM
📍 *स्थान:* अल्बर्ट हॉल मैराथन एक्सपो, रामनिवास बाग, जेएलएन मार्ग, जयपुर

⚠️ *महत्वपूर्ण:* किट प्राप्त करने हेतु अपना ई-पास (QR कोड) अथवा यह एसएमएस काउंटर पर दिखाएं।
- एक्सपो प्रबंधन समिति, राजस्थान पुलिस`
    },
    {
      id: "RACE_REMINDER",
      badge: "रेस दिवस एडवाइजरी",
      title: "रेस दिवस फ्लैग-ऑफ समय एवं रूट/पार्किंग एडवाइजरी",
      desc: "रेस से 1-2 दिन पूर्व रिपोर्टिंग, फ्लैग-ऑफ, वेन्यू व पार्किंग सूचना",
      icon: "⚡",
      defaultChannel: "BOTH",
      defaultAudience: "all",
      text: `⚡ *राजस्थान पुलिस मैराथन 2027 — रेस दिवस एडवाइजरी*

प्रिय धावक *{name}*,
मैराथन दिवस में केवल कुछ घंटे शेष हैं! अपनी तैयारी पूर्ण रखें:

⏰ *रिपोर्टिंग समय:* प्रातः 05:00 AM (3 जनवरी 2027)
🏁 *फ्लैग-ऑफ:* प्रातः 06:00 AM शार्प (अल्बर्ट हॉल, जयपुर)
📍 *स्थान:* अल्बर्ट हॉल म्यूजियम gantry, रामनिवास बाग, जयपुर
🅿️ *निःशुल्क पार्किंग:* रामनिवास बाग अंडरपास एवं जेडीए बहुमंजिला पार्किंग (स्टेडियम कट)

कृपया पंजीकरण संख्या *#{bib}* व डिजिटल ई-पास साथ रखें। चिकित्सा व हाइड्रेशन बूथ प्रत्येक 500 मीटर पर उपलब्ध रहेंगे।
- कमांड कंट्रोल रूम, राजस्थान पुलिस मुख्यालय`
    },
    {
      id: "CUSTOM",
      badge: "कस्टम संदेश",
      title: "विशेष संदेश (Custom Broadcast)",
      desc: "अपनी आवश्यकतानुसार व्यक्तिगत टेक्स्ट व टैग्स के साथ सीधा संदेश भेजें",
      icon: "✍️",
      defaultChannel: "BOTH",
      defaultAudience: "all",
      text: `राजस्थान पुलिस मैराथन 2027: प्रिय {name}, आपकी पंजीकरण संख्या {bib} ({category}) है। राजस्थान पुलिस नारी सुरक्षा संकल्प में आपके उत्साह की सराहना करती है। - राजस्थान पुलिस मुख्यालय`
    }
  ];
}

const CAMPAIGNS = getBroadcastCampaigns(false, "जयपुर");

export function BroadcastCommandCenter({ adminUser, participants = [], onRefresh }) {
  const isDistrictRole = adminUser?.role === 'DISTRICT';
  const districtName = adminUser?.districtName || adminUser?.districtId || "अलवर";
  const defaultDist = isDistrictRole ? (adminUser.districtId || adminUser.districtName) : "all";
  const campaigns = getBroadcastCampaigns(isDistrictRole, districtName);

  // Configuration States
  const [selectedCampaignId, setSelectedCampaignId] = useState(isDistrictRole ? "CONFIRMATION" : "EXPO_KIT_REMINDER");
  const [channel, setChannel] = useState("BOTH"); // "WHATSAPP", "SMS", "BOTH"
  const [targetAudience, setTargetAudience] = useState(isDistrictRole ? "all" : "kit_pending"); // "all", "kit_pending", "kit_collected", "single"
  const [targetCategory, setTargetCategory] = useState("all"); // "all", "21k", "10k", "5k", "2k"
  const [targetDistrict, setTargetDistrict] = useState(defaultDist);
  const [singleSearchQuery, setSingleSearchQuery] = useState("");

  const initialCamp = campaigns.find(c => c.id === (isDistrictRole ? "CONFIRMATION" : "EXPO_KIT_REMINDER")) || campaigns[0];
  // Editor States
  const [title, setTitle] = useState(initialCamp.title);
  const [message, setMessage] = useState(initialCamp.text);
  const [previewDeviceMode, setPreviewDeviceMode] = useState("whatsapp"); // "whatsapp" or "sms"

  // Action States
  const [isSending, setIsSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Auto-switch campaign template
  const handleSelectCampaign = (camp) => {
    setSelectedCampaignId(camp.id);
    setTitle(camp.title);
    setMessage(camp.text);
    if (camp.defaultChannel) setChannel(camp.defaultChannel);
    if (camp.defaultAudience) setTargetAudience(camp.defaultAudience);
    setBroadcastResult(null);
  };

  // Insert Tag into Message
  const handleInsertTag = (tag) => {
    setMessage(prev => prev + ` ${tag}`);
  };

  // Load Broadcast History
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await apiGetBroadcastHistory();
      if (res && res.success) {
        setBroadcastLogs(res.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute Targeted Audience Count from current participants state
  const targetedRunners = participants.filter(r => {
    // District check
    if (isDistrictRole) {
      const d = (r.districtId || r.districtName || '').toLowerCase();
      const myD = (adminUser.districtName || adminUser.districtId || '').toLowerCase();
      if (!d.includes(myD)) return false;
    } else if (targetDistrict && targetDistrict !== "all") {
      const d = (r.districtId || r.districtName || '').toLowerCase();
      if (!d.includes(targetDistrict.toLowerCase())) return false;
    }

    // Category check
    if (targetCategory !== "all") {
      const cat = (r.category || r.categoryId || '').toLowerCase();
      if (cat !== targetCategory.toLowerCase()) return false;
    }

    // Audience state check
    if (targetAudience === "kit_pending") {
      if (r.bibCollected || r.kit_collected) return false;
    } else if (targetAudience === "kit_collected") {
      if (!r.bibCollected && !r.kit_collected) return false;
    } else if (targetAudience === "single") {
      if (!singleSearchQuery.trim()) return false;
      const q = singleSearchQuery.toLowerCase().trim();
      const bib = (r.bibNumber || '').toLowerCase();
      const physBib = (r.physicalBibNumber || '').toLowerCase();
      const mob = (r.mobile || '').toLowerCase();
      const name = (r.fullName || '').toLowerCase();
      return bib.includes(q) || physBib.includes(q) || mob.includes(q) || name.includes(q);
    }

    return true;
  });

  const recipientsCount = targetedRunners.length;

  // Resolved sample for live phone preview
  const sampleRunner = isDistrictRole
    ? (targetedRunners[0] && targetedRunners[0].categoryName?.includes("5") ? targetedRunners[0] : {
        fullName: "कविता मीणा (Kavita Meena)",
        bibNumber: "RJ-05K-3042",
        categoryName: "5 KM Community Run",
        districtName: `${districtName} पुलिस`,
        tshirtSize: "N/A",
        certificateId: "RJ-POL-2027-3042"
      })
    : (targetedRunners[0] || {
        fullName: "सुनीता चौधरी",
        bibNumber: "RJ-21K-1009",
        categoryName: "21 KM Half Marathon",
        districtName: "जयपुर",
        tshirtSize: "L (Large)",
        certificateId: "RPM-2027-CONF-8821"
      });

  const hasTshirt = sampleRunner.tshirtSize && 
    sampleRunner.tshirtSize !== "N/A" && 
    sampleRunner.tshirtSize !== "none" && 
    !sampleRunner.tshirtSize.toLowerCase().includes("n/a") &&
    !isDistrictRole;

  let previewText = message;
  // If runner does not get a T-shirt (e.g. District runner), remove the T-shirt line completely!
  if (!hasTshirt) {
    previewText = previewText
      .split('\n')
      .filter(line => !line.includes('{tshirtSize}') && !line.includes('टी-शर्ट') && !line.includes('T-Shirt'))
      .join('\n');
  }

  const resolvedPreview = previewText
    .replace(/\{name\}/g, sampleRunner.fullName)
    .replace(/\{bib\}/g, sampleRunner.bibNumber)
    .replace(/\{category\}/g, sampleRunner.categoryName || "5 KM Community Run")
    .replace(/\{district\}/g, sampleRunner.districtName || districtName)
    .replace(/\{certId\}/g, sampleRunner.certificateId)
    .replace(/\{tshirtSize\}/g, sampleRunner.tshirtSize || "")
    .replace(/बिब नंबर/g, "पंजीकरण संख्या")
    .replace(/बिब #/g, "पंजीकरण #");

  // Send Broadcast Handler
  const handleDispatch = async () => {
    if (!title.trim() || !message.trim()) {
      alert("कृपया शीर्षक एवं संदेश दोनों भरें।");
      return;
    }

    if (recipientsCount === 0) {
      if (!window.confirm("चयनित फ़िल्टर के अनुसार वर्तमान में 0 धावक मेल खाते हैं। क्या आप फिर भी परीक्षण हेतु सर्वर पर प्रसारण दर्ज करना चाहते हैं?")) {
        return;
      }
    } else {
      const confirmText = `⚠️ प्रसारण की पुष्टि:\n\n• अभियान: ${title}\n• डिलीवरी चैनल: ${channel === 'BOTH' ? 'WhatsApp + SMS': channel}\n• कुल लक्षित धावक: ${recipientsCount} धावक\n\nक्या आप यह संदेश तुरंत प्रेषित करना चाहते हैं?`;
      if (!window.confirm(confirmText)) return;
    }

    setIsSending(true);
    setBroadcastResult(null);

    try {
      const res = await apiSendBroadcast({
        title,
        message,
        templateType: selectedCampaignId,
        channel,
        targetAudience,
        targetCategory,
        targetDistrict,
        searchQuery: singleSearchQuery
      });

      if (res && res.success) {
        setBroadcastResult({
          type: "success",
          message: res.message || `संदेश सफलतापूर्वक ${res.recipientsCount || recipientsCount} धावकों को प्रेषित किया गया।`,
          channel: res.channel,
          count: res.recipientsCount || recipientsCount,
          time: new Date().toLocaleTimeString()
        });
        fetchLogs();
        if (onRefresh) onRefresh();
      } else {
        setBroadcastResult({
          type: "error",
          message: res?.error || "प्रसारण भेजने में सर्वर त्रुटि हुई।"
        });
      }
    } catch (err) {
      setBroadcastResult({
        type: "error",
        message: "सर्वर से कनेक्ट करने में त्रुटि।"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Compact & Clean Header Strip */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #059669',
        borderRadius: '10px',
        padding: '14px 20px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--police-navy-950)' }}>
            📢 WhatsApp एवं SMS प्रसारण
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '6px' }}>
              कुल: {participants.length}
            </span>
            {!isDistrictRole && (
              <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '6px' }}>
                किट शेष: {participants.filter(p => !p.bibCollected && !p.kit_collected).length}
              </span>
            )}
            <span style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              लक्षित: {recipientsCount}
            </span>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoadingLogs}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={13} className={isLoadingLogs ? "spin" : ""} />
          <span>रीफ्रेश करें</span>
        </button>
      </div>

      {/* Broadcast Result Toast */}
      {broadcastResult && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '10px',
          background: broadcastResult.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1.5px solid ${broadcastResult.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: broadcastResult.type === 'success' ? '#065f46' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {broadcastResult.type === 'success' ? <CheckCircle2 size={24} color="#059669" /> : <AlertCircle size={24} color="#dc2626" />}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                {broadcastResult.type === 'success' ? 'प्रसारण सफलतापूर्वक संपन्न!' : 'प्रसारण विफल'}
              </div>
              <div style={{ fontSize: '0.88rem' }}>{broadcastResult.message}</div>
            </div>
          </div>
          <button
            onClick={() => setBroadcastResult(null)}
            style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Main Two-Column Studio: Composer on Left, Phone Simulator on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)',
        gap: '24px',
        alignItems: 'start'
      }} className="broadcast-studio-grid">

        {/* LEFT COLUMN: Controls, Campaign Select & Text Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Step 1: Campaign Selector Cards */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                background: 'var(--police-navy-900)',
                color: '#ffffff',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 900
              }}>1</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>
                संदेश अभियान प्रकार चुनें (Select Message Campaign Type)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
              {campaigns.map(camp => {
                const isSelected = selectedCampaignId === camp.id;
                return (
                  <div
                    key={camp.id}
                    onClick={() => handleSelectCampaign(camp)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #059669' : '1px solid var(--border-medium)',
                      background: isSelected ? '#ecfdf5' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{camp.icon}</span>
                    <span style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: isSelected ? '#065f46' : 'var(--police-navy-900)',
                      paddingRight: isSelected ? '18px' : 0
                    }}>
                      {camp.badge}
                    </span>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        background: '#059669',
                        color: '#ffffff',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Channel & Audience Filters */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                background: 'var(--police-navy-900)',
                color: '#ffffff',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 900
              }}>2</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>
                डिलीवरी चैनल एवं लक्षित समूह (Channel & Audience Targeting)
              </h3>
            </div>

            {/* Delivery Channel Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                संदेश माध्यम (Delivery Channel):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setChannel("BOTH")}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: channel === 'BOTH' ? '2px solid #059669' : '1px solid var(--border-medium)',
                    background: channel === 'BOTH' ? '#ecfdf5' : '#ffffff',
                    color: channel === 'BOTH' ? '#065f46' : 'var(--text-body)',
                    fontWeight: channel === 'BOTH' ? 800 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📲 दोनों (WhatsApp + SMS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("WHATSAPP")}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: channel === 'WHATSAPP' ? '2px solid #22c55e' : '1px solid var(--border-medium)',
                    background: channel === 'WHATSAPP' ? '#f0fdf4' : '#ffffff',
                    color: channel === 'WHATSAPP' ? '#15803d' : 'var(--text-body)',
                    fontWeight: channel === 'WHATSAPP' ? 800 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🟢 केवल WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("SMS")}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: channel === 'SMS' ? '2px solid #2563eb' : '1px solid var(--border-medium)',
                    background: channel === 'SMS' ? '#eff6ff' : '#ffffff',
                    color: channel === 'SMS' ? '#1d4ed8' : 'var(--text-body)',
                    fontWeight: channel === 'SMS' ? 800 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📱 केवल टेक्स्ट SMS</span>
                </button>
              </div>
            </div>

            {/* Audience Filter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                  लक्षित प्राप्तकर्ता फ़िल्टर:
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                >
                  <option value="all">{isDistrictRole ? 'समस्त जिला धावक (All District Runners)' : 'समस्त पंजीकृत धावक (All Runners)'}</option>
                  {!isDistrictRole && <option value="kit_pending">किट शेष (Kit Pending Only)</option>}
                  {!isDistrictRole && <option value="kit_collected">किट प्राप्त (Kit Collected Only)</option>}
                  <option value="single">एकल धावक खोज (Single Runner Search)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                  दौड़ श्रेणी (Category):
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                >
                  <option value="all">सभी श्रेणियां (All Categories)</option>
                  <option value="21k">21 KM Half Marathon</option>
                  <option value="10k">10 KM Speed Run</option>
                  <option value="5k">5 KM Community Run</option>
                  <option value="2k">2 KM Family Run</option>
                </select>
              </div>
            </div>

            {/* Single Runner Search Box (if single selected) */}
            {targetAudience === 'single' && (
              <div style={{ marginTop: '14px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-medium)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                  धावक की पंजीकरण संख्या अथवा 10-अंकीय मोबाइल नंबर दर्ज करें:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder={isDistrictRole ? "उदा. RJ-05K-3042 या 9829012345" : "उदा. RJ-21K-1009 या 9829012345"}
                    value={singleSearchQuery}
                    onChange={(e) => setSingleSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.82rem', alignSelf: 'center', color: recipientsCount > 0 ? '#15803d' : '#991b1b', fontWeight: 700 }}>
                    {recipientsCount > 0 ? `✓ ${recipientsCount} धावक मिला` : 'कोई धावक नहीं मिला'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Message Editor & Tag Helper */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'var(--police-navy-900)',
                  color: '#ffffff',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 900
                }}>3</span>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>
                  संदेश सामग्री एवं स्मार्ट टैग्स (Message Composition & Dynamic Tags)
                </h3>
              </div>

              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                {message.length} अक्षर
              </span>
            </div>

            {/* Campaign Title Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '5px' }}>
                अभियान / संदेश शीर्षक (Broadcast Campaign Title):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.88rem', fontWeight: 700 }}
              />
            </div>

            {/* Dynamic Placeholder Tag Inserter Pills */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                क्लिक करके संदेश में डायनेमिक टैग जोड़ें (Dynamic Runner Tags):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { tag: "{name}", label: "👤 धावक का नाम" },
                  { tag: "{bib}", label: "🔢 पंजीकरण संख्या" },
                  { tag: "{category}", label: "🏃 दौड़ श्रेणी" },
                  { tag: "{district}", label: "📍 जिला / वेन्यू" },
                  ...(!isDistrictRole ? [{ tag: "{tshirtSize}", label: "👕 टी-शर्ट साइज़" }] : []),
                  { tag: "{certId}", label: "🔗 ई-पास लिंक" }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '4px 9px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--police-navy-900)',
                      cursor: 'pointer'
                    }}
                    title={`मैसेज में ${item.tag} जोड़ें`}
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <textarea
                rows={9}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '0.88rem',
                  lineHeight: 1.55,
                  fontFamily: 'monospace, system-ui',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Send CTA Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.86rem', color: '#475569' }}>
                🎯 प्राप्तकर्ता: <strong style={{ color: 'var(--police-navy-950)' }}>{recipientsCount} धावक</strong>
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                माध्यम: <strong style={{ color: '#047857' }}>{channel === 'BOTH' ? 'WhatsApp + SMS' : channel}</strong>
              </div>

              <button
                type="button"
                onClick={handleDispatch}
                disabled={isSending}
                style={{
                  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                  color: '#ffffff',
                  border: '1px solid #059669',
                  padding: '12px 28px',
                  borderRadius: '50px',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  cursor: isSending ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(6, 95, 70, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={16} />
                <span>{isSending ? 'प्रसारण प्रेषित हो रहा है...' : `अभी ${recipientsCount} धावकों को प्रसारण भेजें ➔`}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realistic Live Mobile Simulator Screen */}
        <div style={{
          position: 'sticky',
          top: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Simulator View Switcher */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-medium)',
            borderRadius: '50px',
            padding: '4px',
            display: 'inline-flex',
            gap: '4px',
            marginBottom: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}>
            <button
              type="button"
              onClick={() => setPreviewDeviceMode("whatsapp")}
              style={{
                padding: '6px 16px',
                borderRadius: '50px',
                border: 'none',
                background: previewDeviceMode === 'whatsapp' ? '#25d366' : 'transparent',
                color: previewDeviceMode === 'whatsapp' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🟢 WhatsApp View</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDeviceMode("sms")}
              style={{
                padding: '6px 16px',
                borderRadius: '50px',
                border: 'none',
                background: previewDeviceMode === 'sms' ? '#2563eb' : 'transparent',
                color: previewDeviceMode === 'sms' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>📱 SMS View</span>
            </button>
          </div>

          {/* Smartphone Frame Mockup */}
          <div style={{
            width: '100%',
            maxWidth: '350px',
            background: '#1e293b',
            borderRadius: '36px',
            padding: '12px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.35)',
            border: '4px solid #334155'
          }}>
            {/* Phone Screen Outer */}
            <div style={{
              background: previewDeviceMode === 'whatsapp' ? '#efeae2' : '#f8fafc',
              borderRadius: '26px',
              overflow: 'hidden',
              minHeight: '520px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Top Notch Status Bar */}
              <div style={{
                background: previewDeviceMode === 'whatsapp' ? '#075e54' : '#1e293b',
                color: '#ffffff',
                padding: '6px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                <span>09:41</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span>5G</span>
                  <span>📶</span>
                  <span>🔋 100%</span>
                </div>
              </div>

              {/* Chat / SMS App Header */}
              {previewDeviceMode === 'whatsapp' ? (
                <div style={{
                  background: '#075e54',
                  color: '#ffffff',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}>
                    🏛️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Rajasthan Police Marathon
                      </span>
                      <span style={{ color: '#25d366', fontSize: '0.8rem' }}>✓</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>
                      Official Verified Business Account
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.8rem'
                  }}>
                    RP
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      RAJPOL (DoIT&C Govt SMS)
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Official Gov Sender ID
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Message Scroll Area */}
              <div style={{
                flex: 1,
                padding: '16px 12px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ textAlign: 'center', margin: '4px 0' }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.08)',
                    color: '#64748b',
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    TODAY
                  </span>
                </div>

                {/* Message Bubble Preview */}
                <div style={{
                  alignSelf: 'flex-start',
                  maxWidth: '92%',
                  background: previewDeviceMode === 'whatsapp' ? '#ffffff' : '#ffffff',
                  borderRadius: previewDeviceMode === 'whatsapp' ? '0 12px 12px 12px' : '14px',
                  padding: '10px 12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  border: previewDeviceMode === 'whatsapp' ? 'none' : '1px solid #e2e8f0',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#0f172a',
                    lineHeight: 1.48,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {resolvedPreview}
                  </div>
                  <div style={{
                    fontSize: '0.62rem',
                    color: '#94a3b8',
                    textAlign: 'right',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <span>10:30 AM</span>
                    {previewDeviceMode === 'whatsapp' && <span style={{ color: '#38bdf8' }}>✓✓</span>}
                  </div>
                </div>
              </div>

              {/* Phone Footer Bar */}
              <div style={{
                padding: '8px 14px',
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{ width: '100px', height: '4px', background: '#cbd5e1', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
            ★ धावक के फोन पर संदेश का वास्तविक रीयल-टाइम प्रीव्यू
          </div>
        </div>
      </div>

      {/* 3. Broadcast Audit History Logs Table */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginTop: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>
              📜 संदेश प्रसारण इतिहास एवं ऑडिट लॉग्स (Broadcast History & Delivery Log)
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              पुलिस मुख्यालय कमान द्वारा पूर्व में भेजे गए संदेशों का संपूर्ण टाइमस्टैम्प्ड रिकॉर्ड
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
            ✓ {broadcastLogs.length} प्रसारण रिकॉर्ड सुरक्षित
          </span>
        </div>

        {broadcastLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
            <MessageSquare size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>अभी तक कोई ब्रॉडकास्ट लॉग उपलब्ध नहीं है।</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>पहला संदेश भेजने पर उसका विवरण यहां स्वतः दर्ज हो जाएगा।</div>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-950)' }}>दिनांक व समय</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-950)' }}>प्रसारक (Actor)</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-950)' }}>अभियान व विवरण</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-950)' }}>आईपी व सुरक्षा</th>
                </tr>
              </thead>
              <tbody>
                {broadcastLogs.map((log, idx) => (
                  <tr key={log.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 600, color: '#475569' }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {log.actor || 'COMMAND_ADMIN'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#0f172a', lineHeight: 1.45 }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                      {log.ip || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
