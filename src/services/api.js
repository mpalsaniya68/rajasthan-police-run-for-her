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
    return await res.json();
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
    return await res.json();
  } catch (err) {
    console.error("apiExpoLogin network error:", err);
    return { success: false, error: "लॉगिन सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।" };
  }
}

export async function apiGetAdminParticipants(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/admin/participants?${params.toString()}`, {
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
  if (district && district !== "all" && district !== "ALL") {
    return `${API_BASE}/admin/export?district=${encodeURIComponent(district)}${tokenParam ? `&${tokenParam}` : ""}`;
  }
  return tokenParam ? `${API_BASE}/admin/export?${tokenParam}` : `${API_BASE}/admin/export`;
}

export async function apiGetAdminStats(district = "") {
  try {
    const url = district && district !== "all" && district !== "ALL"
      ? `${API_BASE}/admin/stats?district=${encodeURIComponent(district)}`
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
