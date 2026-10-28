/**
 * Rajasthan Police Marathon 2026 - Centralized Frontend API Service
 * Handles registration, live tracking, certificate verification, and admin portal.
 */

const API_BASE = "/api";

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

export async function apiAdminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch (err) {
    console.error("apiAdminLogin error:", err);
    return { success: false, error: "एडमिन लॉगिन विफल।" };
  }
}

export async function apiGetAdminParticipants(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/admin/participants?${params.toString()}`);
    return await res.json();
  } catch (err) {
    console.error("apiGetAdminParticipants error:", err);
    return { success: false, participants: [], total: 0 };
  }
}

export function apiGetExportUrl(district = "") {
  return district && district !== "all" && district !== "ALL"
    ? `${API_BASE}/admin/export?district=${encodeURIComponent(district)}`
    : `${API_BASE}/admin/export`;
}

export async function apiGetAdminStats(district = "") {
  try {
    const url = district && district !== "all" && district !== "ALL"
      ? `${API_BASE}/admin/stats?district=${encodeURIComponent(district)}`
      : `${API_BASE}/admin/stats`;
    const res = await fetch(url);
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
      headers: { "Content-Type": "application/json" },
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
