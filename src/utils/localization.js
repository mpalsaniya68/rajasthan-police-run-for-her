/**
 * Rajasthan Police Marathon 2027 - Data Localization Utility
 * Ensures 100% pure English when language is English, and 100% pure Hindi when language is Hindi.
 * Completely eliminates mixed bracketed text like "मदन पल्सानिया (Madan Palsaniya)" or "जयपुर (Jaipur)".
 */

// District Name Bilingual Map for all 41 Official Police Districts
export const DISTRICT_BILINGUAL_MAP = {
  ajmer: { hi: "अजमेर", en: "Ajmer" },
  "अजमेर": { hi: "अजमेर", en: "Ajmer" },
  alwar: { hi: "अलवर", en: "Alwar" },
  "अलवर": { hi: "अलवर", en: "Alwar" },
  balotra: { hi: "बालोतरा", en: "Balotra" },
  "बालोतरा": { hi: "बालोतरा", en: "Balotra" },
  banswara: { hi: "बांसवाड़ा", en: "Banswara" },
  "बांसवाड़ा": { hi: "बांसवाड़ा", en: "Banswara" },
  baran: { hi: "बारां", en: "Baran" },
  "बारां": { hi: "बारां", en: "Baran" },
  barmer: { hi: "बाड़मेर", en: "Barmer" },
  "बाड़मेर": { hi: "बाड़मेर", en: "Barmer" },
  beawar: { hi: "ब्यावर", en: "Beawar" },
  "ब्यावर": { hi: "ब्यावर", en: "Beawar" },
  bharatpur: { hi: "भरतपुर", en: "Bharatpur" },
  "भरतपुर": { hi: "भरतपुर", en: "Bharatpur" },
  bhilwara: { hi: "भीलवाड़ा", en: "Bhilwara" },
  "भीलवाड़ा": { hi: "भीलवाड़ा", en: "Bhilwara" },
  bikaner: { hi: "बीकानेर", en: "Bikaner" },
  "बीकानेर": { hi: "बीकानेर", en: "Bikaner" },
  bundi: { hi: "बूंदी", en: "Bundi" },
  "बूंदी": { hi: "बूंदी", en: "Bundi" },
  chittorgarh: { hi: "चित्तौड़गढ़", en: "Chittorgarh" },
  "चित्तौड़गढ़": { hi: "चित्तौड़गढ़", en: "Chittorgarh" },
  churu: { hi: "चूरू", en: "Churu" },
  "चूरू": { hi: "चूरू", en: "Churu" },
  dausa: { hi: "दौसा", en: "Dausa" },
  "दौसा": { hi: "दौसा", en: "Dausa" },
  deeg: { hi: "डीग", en: "Deeg" },
  "डीग": { hi: "डीग", en: "Deeg" },
  dholpur: { hi: "धौलपुर", en: "Dholpur" },
  "धौलपुर": { hi: "धौलपुर", en: "Dholpur" },
  didwana: { hi: "डीडवाना-कुचामन", en: "Didwana-Kuchaman" },
  "didwana-kuchaman": { hi: "डीडवाना-कुचामन", en: "Didwana-Kuchaman" },
  "डीडवाना": { hi: "डीडवाना-कुचामन", en: "Didwana-Kuchaman" },
  "डीडवाना-कुचामन": { hi: "डीडवाना-कुचामन", en: "Didwana-Kuchaman" },
  dungarpur: { hi: "डूंगरपुर", en: "Dungarpur" },
  "डूंगरपुर": { hi: "डूंगरपुर", en: "Dungarpur" },
  hanumangarh: { hi: "हनुमानगढ़", en: "Hanumangarh" },
  "हनुमानगढ़": { hi: "हनुमानगढ़", en: "Hanumangarh" },
  jaipur: { hi: "जयपुर", en: "Jaipur" },
  "जयपुर": { hi: "जयपुर", en: "Jaipur" },
  jaipur_comm: { hi: "जयपुर", en: "Jaipur" },
  "jpr-comm": { hi: "जयपुर", en: "Jaipur" },
  jaisalmer: { hi: "जैसलमेर", en: "Jaisalmer" },
  "जैसलमेर": { hi: "जैसलमेर", en: "Jaisalmer" },
  jalore: { hi: "जालौर", en: "Jalore" },
  "जालौर": { hi: "जालौर", en: "Jalore" },
  jhalawar: { hi: "झालावाड़", en: "Jhalawar" },
  "झालावाड़": { hi: "झालावाड़", en: "Jhalawar" },
  jhunjhunu: { hi: "झुंझुनूं", en: "Jhunjhunu" },
  "झुंझुनूं": { hi: "झुंझुनूं", en: "Jhunjhunu" },
  jodhpur: { hi: "जोधपुर", en: "Jodhpur" },
  "जोधपुर": { hi: "जोधपुर", en: "Jodhpur" },
  jodhpur_comm: { hi: "जोधपुर", en: "Jodhpur" },
  "jdh-comm": { hi: "जोधपुर", en: "Jodhpur" },
  karauli: { hi: "करौली", en: "Karauli" },
  "करौली": { hi: "करौली", en: "Karauli" },
  khairthal: { hi: "खैरथल-तिजारा", en: "Khairthal-Tijara" },
  "khairthal-tijara": { hi: "खैरथल-तिजारा", en: "Khairthal-Tijara" },
  "खैरथल": { hi: "खैरथल-तिजारा", en: "Khairthal-Tijara" },
  "खैरथल-तिजारा": { hi: "खैरथल-तिजारा", en: "Khairthal-Tijara" },
  kota: { hi: "कोटा", en: "Kota" },
  "कोटा": { hi: "कोटा", en: "Kota" },
  kota_city: { hi: "कोटा", en: "Kota" },
  "kta-city": { hi: "कोटा", en: "Kota" },
  kotputli: { hi: "कोटपूतली-बहरोड़", en: "Kotputli-Behror" },
  "kotputli-behror": { hi: "कोटपूतली-बहरोड़", en: "Kotputli-Behror" },
  "कोटपूतली": { hi: "कोटपूतली-बहरोड़", en: "Kotputli-Behror" },
  "कोटपूतली-बहरोड़": { hi: "कोटपूतली-बहरोड़", en: "Kotputli-Behror" },
  nagaur: { hi: "नागौर", en: "Nagaur" },
  "नागौर": { hi: "नागौर", en: "Nagaur" },
  pali: { hi: "पाली", en: "Pali" },
  "पाली": { hi: "पाली", en: "Pali" },
  phalodi: { hi: "फलोदी", en: "Phalodi" },
  "फलोदी": { hi: "फलोदी", en: "Phalodi" },
  pratapgarh: { hi: "प्रतापगढ़", en: "Pratapgarh" },
  "प्रतापगढ़": { hi: "प्रतापगढ़", en: "Pratapgarh" },
  rajsamand: { hi: "राजसमंद", en: "Rajsamand" },
  "राजसमंद": { hi: "राजसमंद", en: "Rajsamand" },
  salumbar: { hi: "सलूंबर", en: "Salumbar" },
  "सलूंबर": { hi: "सलूंबर", en: "Salumbar" },
  sawai_madhopur: { hi: "सवाई माधोपुर", en: "Sawai Madhopur" },
  "सवाई माधोपुर": { hi: "सवाई माधोपुर", en: "Sawai Madhopur" },
  sikar: { hi: "सीकर", en: "Sikar" },
  "सीकर": { hi: "सीकर", en: "Sikar" },
  sirohi: { hi: "सिरोही", en: "Sirohi" },
  "सिरोही": { hi: "सिरोही", en: "Sirohi" },
  sri_ganganagar: { hi: "श्रीगंगानगर", en: "Sri Ganganagar" },
  "श्रीगंगानगर": { hi: "श्रीगंगानगर", en: "Sri Ganganagar" },
  tonk: { hi: "टोंक", en: "Tonk" },
  "टोंक": { hi: "टोंक", en: "Tonk" },
  udaipur: { hi: "उदयपुर", en: "Udaipur" },
  "उदयपुर": { hi: "उदयपुर", en: "Udaipur" }
};

// Known demo & participant names map
export const KNOWN_NAME_MAP = {
  "मदन पल्सानिया": { hi: "मदन पल्सानिया", en: "Madan Palsaniya" },
  "madan palsaniya": { hi: "मदन पल्सानिया", en: "Madan Palsaniya" },
  "विक्रम सिंह": { hi: "विक्रम सिंह", en: "Vikram Singh" },
  "vikram singh": { hi: "विक्रम सिंह", en: "Vikram Singh" },
  "विक्रम सिंह शेखावत": { hi: "विक्रम सिंह शेखावत", en: "Vikram Singh Shekhawat" },
  "vikram singh shekhawat": { hi: "विक्रम सिंह शेखावत", en: "Vikram Singh Shekhawat" },
  "कविता मीणा": { hi: "कविता मीणा", en: "Kavita Meena" },
  "kavita meena": { hi: "कविता मीणा", en: "Kavita Meena" },
  "सुनीता राठौड़": { hi: "सुनीता राठौड़", en: "Sunita Rathore" },
  "sunita rathore": { hi: "सुनीता राठौड़", en: "Sunita Rathore" },
  "कविराज गुर्जर": { hi: "कविराज गुर्जर", en: "Kaviraj Gurjar" },
  "kaviraj gurjar": { hi: "कविराज गुर्जर", en: "Kaviraj Gurjar" },
  "पूजा शेखावत": { hi: "पूजा शेखावत", en: "Pooja Shekhawat" },
  "pooja shekhawat": { hi: "पूजा शेखावत", en: "Pooja Shekhawat" },
  "विक्रम सिंह यादव": { hi: "विक्रम सिंह यादव", en: "Vikram Singh Yadav" },
  "vikram singh yadav": { hi: "विक्रम सिंह यादव", en: "Vikram Singh Yadav" },
  "सुनीता शर्मा": { hi: "सुनीता शर्मा", en: "Sunita Sharma" },
  "sunita sharma": { hi: "सुनीता शर्मा", en: "Sunita Sharma" },
  "सुनीता चौधरी": { hi: "सुनीता चौधरी", en: "Sunita Choudhary" },
  "sunita choudhary": { hi: "सुनीता चौधरी", en: "Sunita Choudhary" },
  "सीमा शेखावत": { hi: "सीमा शेखावत", en: "Seema Shekhawat" },
  "seema shekhawat": { hi: "सीमा शेखावत", en: "Seema Shekhawat" },
  "राहुल कुमार": { hi: "राहुल कुमार", en: "Rahul Kumar" },
  "rahul kumar": { hi: "राहुल कुमार", en: "Rahul Kumar" },
  "कांस्टेबल राहुल कुमार": { hi: "कांस्टेबल राहुल कुमार", en: "Constable Rahul Kumar" },
  "राज्य पुलिस मुख्यालय कमान अधिकारी": { hi: "राज्य पुलिस मुख्यालय कमान अधिकारी", en: "State Police HQ Command Officer" }
};

/**
 * Extracts pure Hindi or pure English from strings with brackets e.g. "मदन पल्सानिया (Madan Palsaniya)"
 */
export function formatLocalizedName(name = "", isHindi = true) {
  if (!name) return "";
  const str = String(name).trim();

  // 1. Direct dictionary match
  const lower = str.toLowerCase();
  if (KNOWN_NAME_MAP[lower]) {
    return isHindi ? KNOWN_NAME_MAP[lower].hi : KNOWN_NAME_MAP[lower].en;
  }

  // 2. Pattern: "Part1 (Part2)"
  const match = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const p1 = match[1].trim();
    const p2 = match[2].trim();
    const p1HasDev = /[\u0900-\u097F]/.test(p1);
    const p2HasDev = /[\u0900-\u097F]/.test(p2);

    if (isHindi) {
      if (p1HasDev) return p1;
      if (p2HasDev) return p2;
      return p1 || p2;
    } else {
      // English mode: choose the non-Devanagari part
      if (!p1HasDev && p1) return p1;
      if (!p2HasDev && p2) return p2;
      return p2 || p1;
    }
  }

  // 3. If English requested but text is purely Devanagari, check known map partials
  if (!isHindi && /[\u0900-\u097F]/.test(str)) {
    for (const [key, val] of Object.entries(KNOWN_NAME_MAP)) {
      if (str.includes(key) || key.includes(str)) {
        return val.en;
      }
    }
  }

  return str;
}

/**
 * Localizes district name cleanly (strips police suffixes in English, removes bilingual brackets)
 */
export function formatLocalizedDistrict(district = "", isHindi = true) {
  if (!district) return "";
  const raw = String(district).trim();

  // Check state-level terms first
  if (raw.includes("समस्त राजस्थान") || raw.includes("संपूर्ण राजस्थान") || raw.toLowerCase().includes("all rajasthan") || raw.toLowerCase().includes("statewide")) {
    return isHindi ? "समस्त राजस्थान" : "All Rajasthan";
  }

  // Check lookup table with both Hindi and English matches
  const cleanKey = raw.toLowerCase().replace(/[-_ ]+/g, "_").replace(/पुलिस|आयुक्तालय|जिला/g, "").trim();
  for (const [key, val] of Object.entries(DISTRICT_BILINGUAL_MAP)) {
    if (raw.includes(val.hi) || raw.toLowerCase().includes(val.en.toLowerCase()) || cleanKey.includes(key) || key.includes(cleanKey)) {
      return isHindi ? val.hi : val.en;
    }
  }

  // Bracket extraction fallback
  const extracted = formatLocalizedName(raw, isHindi);
  if (!isHindi) {
    return extracted
      .replace(/पुलिस आयुक्तालय|पुलिस जिला|पुलिस लाइन|पुलिस|कलेक्ट्रेट/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  return extracted;
}

/**
 * Localizes category name cleanly
 */
export function formatLocalizedCategory(category = "", isHindi = true) {
  if (!category) return "";
  const lower = String(category).toLowerCase();
  if (lower.includes("21")) {
    return isHindi ? "21 किमी हाफ मैराथन" : "21 KM Half Marathon";
  }
  if (lower.includes("10")) {
    return isHindi ? "10 किमी स्पीड रन" : "10 KM Speed Run";
  }
  if (lower.includes("5")) {
    return isHindi ? "5 किमी कम्युनिटी रन" : "5 KM Community Run";
  }
  if (lower.includes("2")) {
    return isHindi ? "2 किमी फैमिली रन" : "2 KM Family Run";
  }
  return formatLocalizedName(category, isHindi);
}

/**
 * Localizes gender cleanly
 */
export function formatLocalizedGender(gender = "", isHindi = true) {
  if (!gender) return "";
  const lower = String(gender).toLowerCase();
  if (lower.startsWith("f") || lower.includes("महिला") || lower.includes("female")) {
    return isHindi ? "महिला" : "Female";
  }
  if (lower.startsWith("m") || lower.includes("पुरुष") || lower.includes("male")) {
    return isHindi ? "पुरुष" : "Male";
  }
  return isHindi ? "अन्य" : "Other";
}

/**
 * Localizes emergency contact relation cleanly
 */
export function formatLocalizedRelation(relation = "", isHindi = true) {
  if (!relation) return "";
  const cleaned = formatLocalizedName(relation, isHindi);
  const lower = cleaned.toLowerCase();
  if (lower.includes("father") || lower.includes("पिता")) return isHindi ? "पिता" : "Father";
  if (lower.includes("mother") || lower.includes("माता")) return isHindi ? "माता" : "Mother";
  if (lower.includes("brother") || lower.includes("भाई")) return isHindi ? "भाई" : "Brother";
  if (lower.includes("sister") || lower.includes("बहन")) return isHindi ? "बहन" : "Sister";
  if (lower.includes("spouse") || lower.includes("husband") || lower.includes("wife") || lower.includes("पति") || lower.includes("पत्नी")) {
    return isHindi ? "पति/पत्नी" : "Spouse";
  }
  if (lower.includes("guardian") || lower.includes("अभिभावक")) return isHindi ? "अभिभावक" : "Guardian";
  return cleaned;
}

/**
 * Localizes kit status badge text
 */
export function formatLocalizedKitStatus(isCollected, isHindi = true) {
  return isCollected
    ? (isHindi ? "✓ किट प्राप्त" : "✓ Kit Collected")
    : (isHindi ? "⏳ किट पेंडिंग" : "⏳ Kit Pending");
}
