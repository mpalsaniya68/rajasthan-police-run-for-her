/**
 * Rajasthan Police Marathon 2027 - Centralized Frontend API Service
 * Handles registration, live tracking, certificate verification, OTP, and admin portal.
 */

const API_BASE = "/api";

function getAdminAuthHeaders() {
  const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rajpol_admin_token") : null;
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiSendOtp(mobile) {
  try {
    const res = await fetch(`${API_BASE}/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile })
    });
    return await res.json();
  } catch (err) {
    console.error("apiSendOtp error:", err);
    return { success: false, error: "OTP सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiVerifyOtp(mobile, otp) {
  try {
    const res = await fetch(`${API_BASE}/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp })
    });
    return await res.json();
  } catch (err) {
    console.error("apiVerifyOtp error:", err);
    return { success: false, error: "OTP सत्यापन में त्रुटि हुई।" };
  }
}

export async function apiRegister(payload) {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("apiRegister error:", err);
    return { success: false, error: "सर्वर से कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।" };
  }
}

export async function apiBulkRegister(payload) {
  try {
    const res = await fetch(`${API_BASE}/bulk-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("apiBulkRegister error:", err);
    return { success: false, error: "बल्क रजिस्ट्रेशन में त्रुटि हुई।" };
  }
}

export async function apiTrackRunner(query) {
  try {
    const res = await fetch(`${API_BASE}/tracker?q=${encodeURIComponent(query)}`);
    return await res.json();
  } catch (err) {
    console.error("apiTrackRunner error:", err);
    return { success: false, error: "ट्रैकिंग डेटा लोड करने में असमर्थ।" };
  }
}

export async function apiSearchPass(query) {
  try {
    const res = await fetch(`${API_BASE}/pass/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    return await res.json();
  } catch (err) {
    console.error("apiSearchPass error:", err);
    return { success: false, error: "ई-पास सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiSendPassOtp(passId, query) {
  try {
    const res = await fetch(`${API_BASE}/pass/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passId, query })
    });
    return await res.json();
  } catch (err) {
    console.error("apiSendPassOtp error:", err);
    return { success: false, error: "OTP प्रेषित करने में त्रुटि हुई।" };
  }
}

export async function apiVerifyPassOtp(passId, query, otp) {
  try {
    const res = await fetch(`${API_BASE}/pass/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passId, query, otp })
    });
    return await res.json();
  } catch (err) {
    console.error("apiVerifyPassOtp error:", err);
    return { success: false, error: "OTP सत्यापन में त्रुटि हुई।" };
  }
}

export async function apiSimulateScan(scanData) {
  try {
    const res = await fetch(`${API_BASE}/tracking/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scanData)
    });
    return await res.json();
  } catch (err) {
    console.error("apiSimulateScan error:", err);
    return { success: false, error: "स्कैन रिकॉर्ड करने में त्रुटि।" };
  }
}

export async function apiVerifyCertificate(certId) {
  try {
    const res = await fetch(`${API_BASE}/certificates/verify?id=${encodeURIComponent(certId)}`);
    return await res.json();
  } catch (err) {
    console.error("apiVerifyCertificate error:", err);
    return { success: false, error: "प्रमाण पत्र सत्यापन विफल।" };
  }
}

export async function apiDispatchCertificate(payload) {
  try {
    const res = await fetch(`${API_BASE}/certificates/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("apiDispatchCertificate error:", err);
    return { success: false, error: "प्रमाण पत्र प्रेषण में त्रुटि।" };
  }
}

export async function apiAdminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("apiAdminLogin response was not JSON:", text);
      return { success: false, error: "सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें।" };
    }
  } catch (err) {
    console.error("apiAdminLogin network error:", err);
    return { success: false, error: "लॉगिन सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।" };
  }
}

export async function apiExpoLogin(operatorNameOrUser, counterIdOrPass, counterName, passcode) {
  let payload = {};
  if (typeof operatorNameOrUser === "object") {
    payload = operatorNameOrUser;
  } else if (!counterName && !passcode) {
    // Individual credential login: (username, password)
    payload = {
      username: operatorNameOrUser,
      password: counterIdOrPass
    };
  } else {
    // Counter/Gate selection mode: (operatorName, counterId, counterName, passcode)
    payload = {
      operatorName: operatorNameOrUser,
      counterId: counterIdOrPass,
      counterName: counterName,
      passcode: passcode
    };
  }

  try {
    const res = await fetch(`${API_BASE}/expo/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("apiExpoLogin response was not JSON:", text);
      return { success: false, error: "सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें।" };
    }
  } catch (err) {
    console.error("apiExpoLogin network error:", err);
    return { success: false, error: "लॉगिन सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।" };
  }
}

export async function apiAdminVerifyOtp(tempToken, otp) {
  try {
    const res = await fetch(`${API_BASE}/admin/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempToken, otp })
    });
    return await res.json();
  } catch (err) {
    console.error("apiAdminVerifyOtp network error:", err);
    return { success: false, error: "OTP सत्यापन सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiAdminResendOtp(tempToken) {
  try {
    const res = await fetch(`${API_BASE}/admin/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempToken })
    });
    return await res.json();
  } catch (err) {
    console.error("apiAdminResendOtp network error:", err);
    return { success: false, error: "OTP पुनः प्रेषण सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiGetAdminParticipants(filters = {}) {
  try {
    const cleanFilters = {};
    for (const [k, v] of Object.entries(filters || {})) {
      if (v !== undefined && v !== null && v !== "" && v !== "undefined" && v !== "null" && v !== "all" && v !== "ALL") {
        cleanFilters[k] = v;
      }
    }
    const params = new URLSearchParams(cleanFilters);
    const qs = params.toString();
    const url = qs ? `${API_BASE}/admin/participants?${qs}` : `${API_BASE}/admin/participants`;
    const res = await fetch(url, {
      headers: getAdminAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    console.error("apiGetAdminParticipants error:", err);
    return { success: false, participants: [], total: 0 };
  }
}

export function apiGetExportUrl(district = "") {
  const token = typeof sessionStorage !== "undefined" ? (sessionStorage.getItem("rajpol_admin_token") || "") : "";
  const tokenParam = token ? `token=${encodeURIComponent(token)}` : "";
  const cleanDist = district && district !== "all" && district !== "ALL" && district !== "undefined" && district !== "null"
    ? encodeURIComponent(district)
    : "";
  if (cleanDist) {
    return `${API_BASE}/admin/export?district=${cleanDist}${tokenParam ? `&${tokenParam}` : ""}`;
  }
  return tokenParam ? `${API_BASE}/admin/export?${tokenParam}` : `${API_BASE}/admin/export`;
}

export async function apiGetAdminStats(district = "") {
  try {
    const cleanDist = district && district !== "all" && district !== "ALL" && district !== "undefined" && district !== "null"
      ? encodeURIComponent(district)
      : "";
    const url = cleanDist
      ? `${API_BASE}/admin/stats?district=${cleanDist}`
      : `${API_BASE}/admin/stats`;
    const res = await fetch(url, {
      headers: getAdminAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    console.error("apiGetAdminStats error:", err);
    return { success: false, stats: null };
  }
}

export async function apiDistributeKit(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/kit-distribution`, {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("apiDistributeKit error:", err);
    return { success: false, error: "सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiGetLeaderboard(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/leaderboard?${params.toString()}`);
    return await res.json();
  } catch (err) {
    console.error("apiGetLeaderboard error:", err);
    return { success: false, leaderboard: [], count: 0 };
  }
}


export async function apiGetVolunteers() {
  try {
    const res = await fetch(`${API_BASE}/admin/volunteers`, {
      headers: getAdminAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    console.error("apiGetVolunteers error:", err);
    return { success: false, volunteers: [] };
  }
}

export async function apiCreateVolunteer(data) {
  try {
    const res = await fetch(`${API_BASE}/admin/volunteers`, {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error("apiCreateVolunteer error:", err);
    return { success: false, error: "सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiUpdateVolunteer(id, data) {
  try {
    const res = await fetch(`${API_BASE}/admin/volunteers/update`, {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ id, ...data })
    });
    return await res.json();
  } catch (err) {
    console.error("apiUpdateVolunteer error:", err);
    return { success: false, error: "सर्वर से कनेक्ट नहीं हो सका।" };
  }
}

export async function apiDeleteVolunteer(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/volunteers/delete`, {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ id })
    });
    return await res.json();
  } catch (err) {
    console.error("apiDeleteVolunteer error:", err);
    return { success: false, error: "सर्वर से कनेक्ट नहीं हो सका।" };
  }
}


export async function apiGetVolunteerScans(counterId = "") {
  try {
    const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rajpol_admin_token") : null;
    const url = counterId ? `${API_BASE}/expo/my-scans?counterId=${encodeURIComponent(counterId)}` : `${API_BASE}/expo/my-scans`;
    const res = await fetch(url, {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    return await res.json();
  } catch (err) {
    console.error("apiGetVolunteerScans error:", err);
    return { success: false, scans: [], stats: null };
  }
}

export async function apiGetCertificateStats(district = "") {
  try {
    const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rajpol_admin_token") : null;
    const cleanDist = district && district !== "all" && district !== "ALL" && district !== "undefined" && district !== "null"
      ? encodeURIComponent(district)
      : "";
    const url = cleanDist ? `${API_BASE}/admin/certificates/stats?district=${cleanDist}` : `${API_BASE}/admin/certificates/stats`;
    const res = await fetch(url, {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    return await res.json();
  } catch (err) {
    console.error("apiGetCertificateStats error:", err);
    return { success: false, error: "प्रमाण पत्र सांख्यिकी प्राप्त करने में त्रुटि।" };
  }
}

export async function apiBatchGenerateCertificates(payload = {}) {
  try {
    const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rajpol_admin_token") : null;
    const cleanPayload = { ...payload };
    if (!cleanPayload.districtId || cleanPayload.districtId === "undefined" || cleanPayload.districtId === "null") {
      cleanPayload.districtId = "all";
    }
    const res = await fetch(`${API_BASE}/admin/certificates/batch-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(cleanPayload)
    });
    return await res.json();
  } catch (err) {
    console.error("apiBatchGenerateCertificates error:", err);
    return { success: false, error: "प्रमाण पत्र जारी करने में त्रुटि।" };
  }
}

export async function apiGetAuditLogs(limit = 100) {
  try {
    const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rajpol_admin_token") : null;
    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    return await res.json();
  } catch (err) {
    console.error("apiGetAuditLogs error:", err);
    return { success: false, logs: [] };
  }
}

export async function apiSendBroadcast(payload) {
  try {
    const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rajpol_admin_token") : null;
    const res = await fetch(`${API_BASE}/admin/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("apiSendBroadcast error:", err);
    return { success: false, error: "सामूहिक प्रसारण भेजने में त्रुटि हुई।" };
  }
}

