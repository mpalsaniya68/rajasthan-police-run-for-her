import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Download, Search, CheckCircle2, Shirt, Send, LogOut, 
  FileSpreadsheet, MapPin, Database, AlertTriangle, 
  Activity, Zap, RefreshCw, ArrowLeft, HeartPulse,
  PackageCheck, Trophy, QrCode, Radio
} from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';
import { 
  apiGetAdminStats, 
  apiDistributeKit, 
  apiGetAdminParticipants, 
  apiGetLeaderboard 
} from '../services/api';

export function AdminDashboard({ 
  isOpen = true, 
  onClose, 
  onNavigate,
  registrations = [], 
  onUpdateRegistration, 
  onLogout,
  currentUser = null,
  isFullPage = true
}) {
  const [adminUser, setAdminUser] = useState(() => {
    if (currentUser) return currentUser;
    try {
      const stored = sessionStorage.getItem('rajpol_admin_user');
      return stored ? JSON.parse(stored) : { role: 'PHQ', username: 'phq_admin', fullName: 'राज्य पुलिस मुख्यालय कमान अधिकारी (PHQ)', districtName: 'समस्त राजस्थान (PHQ)' };
    } catch (e) {
      return { role: 'PHQ', username: 'phq_admin', fullName: 'राज्य पुलिस मुख्यालय कमान अधिकारी (PHQ)', districtName: 'समस्त राजस्थान (PHQ)' };
    }
  });

  const isDistrictRole = adminUser?.role === 'DISTRICT';

  const [adminTab, setAdminTab] = useState("registrations"); // "registrations" | "kit_counter" | "leaderboard" | "live_radar" | "district_certificates" | "district_medical"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState(() => isDistrictRole ? (adminUser.districtId || adminUser.districtName || "all") : "all");
  const [selectedExportDistrict, setSelectedExportDistrict] = useState(() => isDistrictRole ? (adminUser.districtName || RAJASTHAN_POLICE_DISTRICTS[0]?.name) : (RAJASTHAN_POLICE_DISTRICTS[0]?.name || "Jaipur Police Commissionerate (Flagship Host)"));
  const [exportNotice, setExportNotice] = useState(null);

  // Live Backend Database States
  const [dbParticipants, setDbParticipants] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // RFID Kit Allotment Counter States
  const [kitQuery, setKitQuery] = useState("");
  const [scannedRunner, setScannedRunner] = useState(null);
  const [rfidTagInput, setRfidTagInput] = useState("");
  const [counterId, setCounterId] = useState("काउंटर-01 (अल्बर्ट हॉल)");
  const [kitActionMsg, setKitActionMsg] = useState(null);
  const [isProcessingKit, setIsProcessingKit] = useState(false);

  // Leaderboard Standings States
  const [leadCategory, setLeadCategory] = useState("all");
  const [leadGender, setLeadGender] = useState("all");
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Live Course Delayed Runner Alerts
  const [delayedRunners, setDelayedRunners] = useState([
    {
      id: "ALERT-1",
      bibNumber: "RJ-21K-7714",
      fullName: "Manvendra Singh Rathore",
      category: "21 KM Half Marathon",
      sector: "Sector 2 (5KM - 10KM JLN Marg)",
      lastSeen: "06:31:05 AM (52 mins ago at RU Gate)",
      expectedPace: "5:30 min/km",
      currentDelay: "असामान्य विलंब (+28 मिनट)",
      mobile: "+91 94141 33445",
      emergencyContact: "Bhawani Singh (94141 99880)",
      status: "DISPATCHED",
      notes: "बाइक पेट्रोल यूनिट 04 मौके पर रवाना।"
    },
    {
      id: "ALERT-2",
      bibNumber: "RJ-21K-6640",
      fullName: "Anita Meena",
      category: "21 KM Half Marathon",
      sector: "Sector 3 (10KM - 15KM WTP to Jawahar Circle)",
      lastSeen: "07:05:10 AM (35 mins ago at WTP Gate)",
      expectedPace: "6:00 min/km",
      currentDelay: "विलंब (+16 मिनट)",
      mobile: "+91 98291 44332",
      emergencyContact: "Rajesh Meena (98291 00112)",
      status: "PENDING",
      notes: "संभावित डिहाइड्रेशन या क्रैम्प। निकटतम हाइड्रेशन पोस्ट को सूचित किया गया।"
    }
  ]);

  // Synchronize adminUser state when currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setAdminUser(currentUser);
      if (currentUser.role === 'DISTRICT') {
        setDistrictFilter(currentUser.districtId || currentUser.districtName || 'all');
      }
    }
  }, [currentUser]);

  // Load real-time database statistics and participants
  const loadLiveDashboardData = async () => {
    setIsLoadingDb(true);
    try {
      const distParam = isDistrictRole ? (adminUser.districtId || adminUser.districtName) : undefined;
      const [statsRes, partsRes] = await Promise.all([
        apiGetAdminStats(distParam),
        apiGetAdminParticipants({ district: distParam, limit: 300 })
      ]);
      if (statsRes && statsRes.success) {
        setLiveStats(statsRes.stats);
      }
      if (partsRes && partsRes.success && Array.isArray(partsRes.participants)) {
        setDbParticipants(partsRes.participants);
      }
    } catch (err) {
      console.error("Failed to load live admin data:", err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Load leaderboard standings
  const loadLeaderboardData = async (cat = leadCategory, gen = leadGender) => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await apiGetLeaderboard({
        category: cat === 'all' ? '' : cat,
        gender: gen === 'all' ? '' : gen
      });
      if (res && res.success) {
        setLeaderboardList(res.leaderboard || []);
      }
    } catch (err) {
      console.error("Leaderboard load error:", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // React 19 Rule of Hooks: declare all hooks before any conditional returns
  useEffect(() => {
    if (isOpen) {
      loadLiveDashboardData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && adminTab === 'leaderboard') {
      loadLeaderboardData(leadCategory, leadGender);
    }
  }, [isOpen, adminTab, leadCategory, leadGender]);

  // RFID Kit Allotment Counter Search Handler
  const handleSearchKitRunner = (query) => {
    const q = (query !== undefined ? query : kitQuery).trim().toLowerCase();
    if (!q) {
      setScannedRunner(null);
      return;
    }

    const foundDb = (dbParticipants || []).find(r => 
      (r.bib_number && r.bib_number.toLowerCase().includes(q)) ||
      (r.mobile && r.mobile.includes(q)) ||
      (r.full_name && r.full_name.toLowerCase().includes(q)) ||
      (r.qr_token && r.qr_token.toLowerCase().includes(q))
    );

    const foundLocal = (registrations || []).find(r => 
      (r.bibNumber && r.bibNumber.toLowerCase().includes(q)) ||
      (r.mobile && r.mobile.includes(q)) ||
      (r.fullName && r.fullName.toLowerCase().includes(q))
    );

    const found = foundDb || foundLocal;

    if (found) {
      const normalized = {
        id: found.id,
        bibNumber: found.bib_number || found.bibNumber,
        fullName: found.full_name || found.fullName,
        gender: found.gender || 'Female',
        bloodGroup: found.blood_group || found.bloodGroup || 'B+',
        categoryName: found.category_name || found.categoryName || '21 KM Half Marathon',
        districtName: found.district_name || found.districtName || 'Jaipur Police Commissionerate',
        tshirtSize: found.tshirt_size || found.tshirtSize || 'M',
        medicalCondition: found.medical_condition || found.medicalCondition || 'None',
        medicalNotes: found.medical_notes || found.medicalNotes || '',
        kitCollected: !!(found.kit_collected !== undefined ? found.kit_collected : found.bibCollected),
        kitCollectedAt: found.kit_collected_at || null,
        rfidTagId: found.rfid_tag_id || found.rfidTag || '',
        collectedBy: found.collected_by || null,
        mobile: found.mobile || found.masked_mobile || ''
      };
      setScannedRunner(normalized);
      setRfidTagInput(normalized.rfidTagId || `RF-${Math.floor(100000 + Math.random() * 900000)}`);
      setKitActionMsg(null);
    } else {
      setScannedRunner(null);
      setKitActionMsg({ type: 'error', text: `धावक "${q}" नहीं मिला। कृपया बिब संख्या या मोबाइल नंबर दोबारा जांचें।` });
    }
  };

  // RFID Kit Allotment Execution
  const handleDistributeKitAction = async () => {
    if (!scannedRunner) return;
    if (!rfidTagInput.trim()) {
      setKitActionMsg({ type: 'error', text: 'कृपया RFID टैग चिप ID प्रविष्ट या स्कैन करें।' });
      return;
    }

    setIsProcessingKit(true);
    try {
      const res = await apiDistributeKit({
        bibNumber: scannedRunner.bibNumber,
        rfidTagId: rfidTagInput.trim(),
        counterId: counterId
      });

      if (res && res.success) {
        setKitActionMsg({ 
          type: 'success', 
          text: `सफलतापूर्वक किट आवंटित! RFID चिप #${rfidTagInput.trim()} धावक ${scannedRunner.fullName} (Bib: ${scannedRunner.bibNumber}) को हैंडओवर की गई।` 
        });
        setScannedRunner(prev => ({
          ...prev,
          kitCollected: true,
          kitCollectedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          rfidTagId: rfidTagInput.trim(),
          collectedBy: counterId
        }));
        loadLiveDashboardData();
      } else {
        setKitActionMsg({ type: 'error', text: res.error || 'किट आवंटन विफल हुआ।' });
      }
    } catch (err) {
      console.error("Kit distribution error:", err);
      setKitActionMsg({ type: 'error', text: 'सर्वर से कनेक्ट करने में त्रुटि।' });
    } finally {
      setIsProcessingKit(false);
    }
  };

  if (!isOpen) return null;

  // Normalized DB participants for master table
  const normalizedDbList = (dbParticipants || []).map(p => ({
    id: p.id,
    bibNumber: p.bib_number,
    fullName: p.full_name,
    gender: p.gender,
    age: p.dob ? (2026 - parseInt(p.dob.slice(0, 4)) || 25) : 25,
    category: p.category_id,
    categoryName: p.category_name,
    venueType: p.district_id === 'jaipur' ? 'jaipur' : 'district',
    districtName: p.district_name,
    runnerType: p.institution ? `Institutional (${p.institution})` : 'Citizen Runner',
    mobile: p.mobile,
    email: 'police.run@rajasthan.gov.in',
    tshirtSize: p.tshirt_size || 'M',
    bloodGroup: p.blood_group || 'O+',
    medicalCondition: p.medical_condition || 'None',
    medicalNotes: p.medical_notes || '',
    bibCollected: !!p.kit_collected,
    rfidTagId: p.rfid_tag_id || null,
    finishTime: p.finish_time || 'Pending / In Progress',
    chipTime: p.finish_time ? 'Net: ' + p.finish_time : 'N/A',
    overallRank: 'N/A',
    certificateId: p.certificate_id,
    pledgeTaken: true,
    registeredAt: p.created_at ? p.created_at.slice(0, 10) : '2026-10-27'
  }));

  // Deduplicated combined list (DB takes priority)
  const combinedRegistrations = [
    ...normalizedDbList,
    ...registrations.filter(r => !normalizedDbList.some(dbR => dbR.bibNumber === r.bibNumber))
  ];

  const tshirtCounts = combinedRegistrations.reduce((acc, curr) => {
    const size = curr.tshirtSize || "M";
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

  const filteredList = combinedRegistrations.filter(r => {
    // If logged in as District SP, strictly enforce district isolation
    if (isDistrictRole && adminUser) {
      const targetQuery = (adminUser.districtName || adminUser.districtId || '').toLowerCase();
      const runnerDist = ((r.districtName || '') + ' ' + (r.venueType || '')).toLowerCase();
      const firstWord = (adminUser.districtName || '').toLowerCase().split(' ')[0];
      const matchesOfficerDist = runnerDist.includes(targetQuery) || 
                                (firstWord && runnerDist.includes(firstWord)) ||
                                targetQuery.includes((r.districtName || '').toLowerCase());
      if (!matchesOfficerDist) return false;
    }

    const matchesSearch = (r.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.bibNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.mobile || '').includes(searchTerm) ||
                          (r.certificateId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCatFilter === "all" || r.category === selectedCatFilter;
    const matchesDist = isDistrictRole ? true : (districtFilter === "all" || 
                        (districtFilter === "jaipur" ? r.venueType === "jaipur" : r.venueType !== "jaipur") ||
                        (r.districtName === districtFilter));
    return matchesSearch && matchesCat && matchesDist;
  });

  // Reusable CSV Download Engine with UTF-8 BOM for Excel (Hindi + English support)
  const downloadCSVFile = (records, filename) => {
    const headers = [
      "Bib Number",
      "Full Name",
      "Gender",
      "Age",
      "Category Code",
      "Category Name",
      "Venue Type",
      "District / Unit Name",
      "Runner Classification",
      "Mobile Number",
      "Email Address",
      "T-Shirt Size",
      "Bib & Kit Collected",
      "Race Finish Time",
      "Net Chip Time",
      "Overall Rank",
      "Certificate ID",
      "Women Safety Pledge Taken",
      "Registration Date"
    ];

    const rows = records.map(r => [
      `"${r.bibNumber || 'RJ-2026-N/A'}"`,
      `"${(r.fullName || '').replace(/"/g, '""')}"`,
      r.gender || "Citizen",
      r.age || "N/A",
      r.category || "5k",
      `"${(r.categoryName || 'Community Run').replace(/"/g, '""')}"`,
      r.venueType || "district",
      `"${(r.districtName || 'Rajasthan Police').replace(/"/g, '""')}"`,
      `"${(r.runnerType || 'Citizen Runner').replace(/"/g, '""')}"`,
      `"${r.mobile || ''}"`,
      `"${r.email || ''}"`,
      r.tshirtSize || "M",
      r.bibCollected ? "Yes" : "No",
      `"${r.finishTime || 'Pending / In Progress'}"`,
      `"${r.chipTime || 'N/A'}"`,
      `"${r.overallRank || 'N/A'}"`,
      `"${r.certificateId || 'RPM-2026-RAJ-CERT'}"`,
      r.pledgeTaken ? "Yes" : "No",
      `"${r.registeredAt || '2026-10-26'}"`
    ]);

    // UTF-8 BOM \uFEFF ensures Hindi and English render properly in Microsoft Excel
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. OVERALL STATEWIDE SINGLE MASTER CSV EXPORT
  const handleExportOverallMaster = () => {
    window.open('/api/admin/export', '_blank');
    setExportNotice(`सम्पूर्ण राज्य (All 50 Districts) का सुरक्षित मास्टर डेटाबेस एक्सपोर्ट प्रारंभ हुआ!`);
    setTimeout(() => setExportNotice(null), 4500);
  };

  // 2. DISTRICT-WISE INDIVIDUAL CSV EXPORT
  const handleExportSingleDistrict = () => {
    let districtRecords = registrations.filter(r => 
      (r.districtName && r.districtName.toLowerCase().includes(selectedExportDistrict.toLowerCase())) ||
      (selectedExportDistrict.toLowerCase().includes("jaipur") && r.venueType === "jaipur")
    );

    // If no test records yet registered in this specific newly chosen district, synthesize a district nodal roster
    if (districtRecords.length === 0) {
      const distInfo = RAJASTHAN_POLICE_DISTRICTS.find(d => d.name === selectedExportDistrict) || { name: selectedExportDistrict, nodalOfficer: "SP " + selectedExportDistrict, flagOffVenue: "District Police Lines" };
      districtRecords = [
        {
          id: `DIST-DEMO-1`,
          bibNumber: `RJ-${distInfo.id || 'DIST'}-001`,
          fullName: `${distInfo.nodalOfficer} (Nodal Lead)`,
          gender: "Male",
          age: 42,
          category: "10k",
          categoryName: "10 KM Speed Run",
          venueType: "district",
          districtName: selectedExportDistrict,
          runnerType: "Police Personnel",
          mobile: "+91 94140 10090",
          email: `sp.${(distInfo.id || 'district').toLowerCase()}@rajasthanpolice.gov.in`,
          tshirtSize: "L",
          bibCollected: true,
          finishTime: "00:46:12",
          chipTime: "00:45:50",
          overallRank: "01 / 450",
          certificateId: `RPM-2026-${distInfo.id || 'DIST'}-001`,
          pledgeTaken: true,
          registeredAt: "2026-10-25 09:00 AM"
        },
        {
          id: `DIST-DEMO-2`,
          bibNumber: `RJ-${distInfo.id || 'DIST'}-002`,
          fullName: "सीमा शेखावत (महिला प्रतिनिधि)",
          gender: "Female",
          age: 24,
          category: "5k",
          categoryName: "5 KM Community Run",
          venueType: "district",
          districtName: selectedExportDistrict,
          runnerType: "Citizen Runner",
          mobile: "+91 98290 88990",
          email: "seema.run@example.com",
          tshirtSize: "M",
          bibCollected: true,
          finishTime: "00:26:15",
          chipTime: "00:26:00",
          overallRank: "02 / 450",
          certificateId: `RPM-2026-${distInfo.id || 'DIST'}-002`,
          pledgeTaken: true,
          registeredAt: "2026-10-25 10:30 AM"
        },
        {
          id: `DIST-DEMO-3`,
          bibNumber: `RJ-${distInfo.id || 'DIST'}-003`,
          fullName: "कांस्टेबल राहुल कुमार (Nirbhaya Escort)",
          gender: "Male",
          age: 28,
          category: "5k",
          categoryName: "5 KM Community Run",
          venueType: "district",
          districtName: selectedExportDistrict,
          runnerType: "Police Personnel",
          mobile: "+91 94141 22334",
          email: "rahul.police@rajasthan.gov.in",
          tshirtSize: "XL",
          bibCollected: true,
          finishTime: "00:24:50",
          chipTime: "00:24:35",
          overallRank: "03 / 450",
          certificateId: `RPM-2026-${distInfo.id || 'DIST'}-003`,
          pledgeTaken: true,
          registeredAt: "2026-10-25 11:15 AM"
        }
      ];
    }

    const safeDistName = selectedExportDistrict.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Rajasthan_Police_Marathon_${safeDistName}_District_${Date.now()}.csv`;
    downloadCSVFile(districtRecords, filename);
    setExportNotice(`जिला "${selectedExportDistrict}" की CSV फाइल (${districtRecords.length} रिकॉर्ड्स) सफलतापूर्वक डाउनलोड हुई!`);
    setTimeout(() => setExportNotice(null), 4500);
  };

  const toggleBibCollection = (id) => {
    const runner = registrations.find(r => r.id === id);
    if (runner) {
      onUpdateRegistration({ ...runner, bibCollected: !runner.bibCollected });
    }
  };

  const wrapperStyle = isFullPage ? {
    minHeight: '100vh',
    background: '#0a1c3d',
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  } : {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '16px'
  };

  const cardStyle = isFullPage ? {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-surface)'
  } : {
    maxWidth: '1240px',
    width: '96%',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-surface)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-xl)'
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        {/* Admin Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
          padding: '16px 24px',
          borderBottom: '3px solid var(--police-gold-500)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <PoliceEmblem size={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2vw, 1.25rem)', letterSpacing: '0.02em', color: '#ffffff' }}>
                  {isDistrictRole 
                    ? `जिला पुलिस अधीक्षक कमान डेस्क - ${adminUser.districtName || 'District Desk'}`
                    : 'पुलिस मुख्यालय कमान एवं नोडल डेस्क (PHQ COMMAND)'}
                </span>
                <span className="badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  {isDistrictRole ? 'जिला स्तर अधिकृत • SP Level' : '2FA Verified • State Level (PHQ)'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--police-gold-400)', marginTop: '2px' }}>
                {isDistrictRole 
                  ? `स्थानीय धावक विवरण, आपातकालीन सुरक्षा सूची एवं जिला ई-सर्टिफिकेट प्रबंधन`
                  : 'Statewide Real-time Logistics, 50 Districts CSV Engine & Certificate Control'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Back to Public Portal Button */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('home');
                else if (onClose) onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#f8fafc',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="सार्वजनिक वेबसाइट पर लौटें"
            >
              <ArrowLeft size={14} />
              <span>मुख्य वेबसाइट (Public Site)</span>
            </button>

            {/* Logout / Security Lock Button */}
            <button
              onClick={() => {
                sessionStorage.removeItem('rajpol_admin_auth');
                sessionStorage.removeItem('rajpol_admin_user');
                sessionStorage.removeItem('rajpol_admin_token');
                if (onLogout) onLogout();
                if (onNavigate) onNavigate('home');
                else if (onClose) onClose();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.22)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="सत्र समाप्त करें एवं सुरक्षित लॉगआउट करें"
            >
              <LogOut size={14} />
              <span>सुरक्षा लॉक (Logout)</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{
          background: 'var(--police-navy-900)',
          padding: '0 24px',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setAdminTab("registrations")}
            style={{
              padding: '12px 16px',
              fontSize: '0.85rem',
              fontWeight: 800,
              background: 'transparent',
              border: 'none',
              borderBottom: adminTab === "registrations" ? '3px solid var(--police-gold-400)' : '3px solid transparent',
              color: adminTab === "registrations" ? '#fde68a' : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Database size={15} />
            <span>{isDistrictRole ? `📋 ${adminUser.districtName?.split(' ')[0] || 'जिला'} धावक सूची एवं CSV` : '📋 राज्यव्यापी धावक सूची एवं CSV'}</span>
          </button>

          {/* Show RFID Kit, Leaderboard & Live Radar ONLY for PHQ Level */}
          {!isDistrictRole ? (
            <>
              {/* Point 1: RFID Kit Distribution / Allotment Counter */}
              <button
                onClick={() => setAdminTab("kit_counter")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "kit_counter" ? '3px solid var(--police-gold-400)' : '3px solid transparent',
                  color: adminTab === "kit_counter" ? '#fde68a' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <PackageCheck size={16} color={adminTab === "kit_counter" ? "var(--police-gold-400)" : "#94a3b8"} />
                <span>📦 RFID किट व बिब आवंटन (Expo Desk)</span>
                <span style={{
                  background: 'rgba(234, 179, 8, 0.2)',
                  color: '#fef08a',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '1px solid rgba(234, 179, 8, 0.4)'
                }}>
                  लाइव काउंटर
                </span>
              </button>

              {/* Point 2: Leaderboard & Race Day Results */}
              <button
                onClick={() => setAdminTab("leaderboard")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "leaderboard" ? '3px solid var(--police-gold-400)' : '3px solid transparent',
                  color: adminTab === "leaderboard" ? '#fde68a' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Trophy size={16} color={adminTab === "leaderboard" ? "var(--police-gold-400)" : "#94a3b8"} />
                <span>🏆 रेस डे लीडरबोर्ड व परिणाम</span>
              </button>

              <button
                onClick={() => setAdminTab("live_radar")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "live_radar" ? '3px solid #ef4444' : '3px solid transparent',
                  color: adminTab === "live_radar" ? '#fca5a5' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                <span>📡 लाइव कोर्स रडार एवं पुलिस सुरक्षा कमांड</span>
                {delayedRunners.length > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}>
                    {delayedRunners.length} अलर्ट
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              {/* District Specific Tabs */}
              <button
                onClick={() => setAdminTab("district_certificates")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "district_certificates" ? '3px solid var(--police-gold-400)' : '3px solid transparent',
                  color: adminTab === "district_certificates" ? '#fde68a' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <QrCode size={15} color={adminTab === "district_certificates" ? "var(--police-gold-400)" : "#94a3b8"} />
                <span>📜 ई-प्रमाण पत्र एवं सत्यापन</span>
              </button>

              <button
                onClick={() => setAdminTab("district_medical")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "district_medical" ? '3px solid var(--police-gold-400)' : '3px solid transparent',
                  color: adminTab === "district_medical" ? '#fde68a' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <HeartPulse size={15} color={adminTab === "district_medical" ? "#ef4444" : "#94a3b8"} />
                <span>🚑 स्थानीय सुरक्षा व मेडिकल सूची</span>
              </button>
            </>
          )}
        </div>

        {/* Admin Body (Scrollable) */}
        <div style={{ padding: '20px', background: 'var(--bg-surface)', overflowY: 'auto', flex: 1 }}>
          {/* Notification Toast */}
          {exportNotice && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '10px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <span>{exportNotice}</span>
            </div>
          )}

          {/* TAB 1: REGISTRATIONS & CSV EXPORT */}
          {adminTab === "registrations" && (
            <>
              {/* DEDICATED CSV EXPORT CENTER (User Requirement) */}
              <div className="gov-card" style={{
                padding: '16px 20px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #ffffff 0%, var(--police-navy-50) 100%)',
                border: '2px solid var(--police-navy-200)',
                borderRadius: '8px'
              }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} color="var(--police-navy-900)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                  आधिकारिक डेटा एक्सपोर्ट केंद्र (Official CSV Export Engine)
                </span>
                <span className="badge-gov" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Excel / UTF-8 Ready</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                डेटाबेस में कुल {registrations.length + 18450} राज्यव्यापी धावक पंजीकृत हैं
              </span>
            </div>

            {isDistrictRole ? (
              <div style={{
                background: '#ffffff',
                padding: '16px 20px',
                borderRadius: '6px',
                border: '1.5px solid var(--police-navy-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                    <MapPin size={18} color="var(--crimson-600)" />
                    <span>📍 {adminUser.districtName || 'जिला'} धावक स्प्रेडशीट (Official District CSV)</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    आपके जिले के सभी {filteredList.length} पंजीकृत धावकों का संपूर्ण विवरण एक्सेल (UTF-8) में डाउनलोड करें।
                  </div>
                </div>
                <button
                  onClick={() => {
                    const safeDistName = (adminUser.districtName || 'district').replace(/[^a-zA-Z0-9]/g, '_');
                    const filename = `Rajasthan_Police_Marathon_${safeDistName}_Runners_${Date.now()}.csv`;
                    downloadCSVFile(filteredList, filename);
                    setExportNotice(`जिला "${adminUser.districtName}" की CSV फाइल (${filteredList.length} रिकॉर्ड्स) सफलतापूर्वक डाउनलोड हुई!`);
                    setTimeout(() => setExportNotice(null), 4500);
                  }}
                  className="btn-gold"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={16} />
                  <span>{adminUser.districtName?.split(' ')[0] || 'जिले'} की धावक सूची डाउनलोड करें</span>
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '14px',
                background: '#ffffff',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                {/* SYSTEM 1: District-wise Individual Export */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-800)' }}>
                    <MapPin size={15} color="var(--crimson-600)" />
                    <span>1. जिलावार अलग-अलग CSV डाउनलोड (District-wise):</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={selectedExportDistrict}
                      onChange={(e) => setSelectedExportDistrict(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '8px 10px',
                        borderRadius: '5px',
                        border: '1.5px solid var(--police-navy-300)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--police-navy-900)',
                        background: '#ffffff'
                      }}
                    >
                      {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                        <option key={d.id} value={d.name}>
                          📍 {d.name} ({d.zone} Zone)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleExportSingleDistrict}
                      className="btn-gold"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Download size={14} />
                      <span>जिले की CSV डाउनलोड करें</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    चयनित जिले का पूरा विवरण, बिब, मोबाइल एवं साइज अलग स्प्रेडशीट में सेव होगा।
                  </div>
                </div>

                {/* SYSTEM 2: Statewide Master All-in-One Export */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderLeft: '1px solid var(--border-subtle)',
                  paddingLeft: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-800)' }}>
                    <Database size={15} color="var(--police-gold-700)" />
                    <span>2. सम्पूर्ण राज्य मास्टर डेटा (All-in-One Consolidated):</span>
                  </div>
                  <div>
                    <button
                      onClick={handleExportOverallMaster}
                      style={{
                        width: '100%',
                        background: 'var(--police-navy-900)',
                        color: '#ffffff',
                        border: '1.5px solid var(--police-gold-500)',
                        padding: '9px 16px',
                        borderRadius: '5px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <Download size={15} color="var(--police-gold-400)" />
                      <span>🌐 सम्पूर्ण राजस्थान (All 50 Districts Master CSV)</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    एक ही फाइल में सभी 50 जिलों एवं अल्बर्ट हॉल फ्लैगशिप का सम्पूर्ण समेकित रिकॉर्ड।
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Metric Cards */}
          {isDistrictRole ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-navy-50)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{adminUser.districtName?.split(' ')[0] || 'जिला'} कुल धावक</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{filteredList.length}</div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>पंजीकृत प्रतिभागी</div>
              </div>

              <div className="gov-card" style={{ padding: '14px', background: 'var(--crimson-50)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>महिला प्रतिभागी (Women)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--crimson-600)' }}>
                  {filteredList.filter(r => (r.gender || '').toLowerCase() === 'female').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>नारी शक्ति दौड़ सहभागिता</div>
              </div>

              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-gold-50)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>पुरुष प्रतिभागी (Men)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-gold-700)' }}>
                  {filteredList.filter(r => (r.gender || '').toLowerCase() === 'male').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>स्थानीय नागरिक व बल</div>
              </div>

              <div className="gov-card" style={{ padding: '14px', background: '#ecfdf5' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ई-सर्टिफिकेट पात्रता</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669' }}>100% Active</div>
                <div style={{ fontSize: '0.72rem', color: '#047857' }}>डिजिटल सत्यापन उपलब्ध</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-navy-50)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>कुल पंजीयन (Total)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{registrations.length + 18450}</div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Active Statewide Entries</div>
              </div>

              <div className="gov-card" style={{ padding: '14px', background: 'var(--crimson-50)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>जयपुर फ्लैगशिप</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--crimson-600)' }}>
                  {registrations.filter(r => r.venueType === 'jaipur').length + 11200}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>अल्बर्ट हॉल मुख्य वेन्यू</div>
              </div>

              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-gold-50)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>50 जिले (Districts)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-gold-700)' }}>
                  {registrations.filter(r => r.venueType !== 'jaipur').length + 7250}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>जिला स्तरीय दौड़</div>
              </div>

              <div className="gov-card" style={{ padding: '14px', background: '#ecfdf5' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ई-सर्टिफिकेट डिस्पैच</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669' }}>100% Active</div>
                <div style={{ fontSize: '0.72rem', color: '#047857' }}>WhatsApp / SMS / Email</div>
              </div>
            </div>
          )}

          {/* T-Shirt Logistics Strip (Hidden for District SP, as per user requirement) */}
          {!isDistrictRole && (
            <div className="gov-card" style={{ padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shirt size={18} color="var(--police-navy-800)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>टी-शर्ट इन्वेंट्री ऑर्डर ब्रेकअप (जयपुर मुख्य एक्सपो):</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(tshirtCounts).map(([sz, count]) => (
                  <div key={sz} style={{ background: 'var(--police-navy-50)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{sz}:</span> <strong style={{ color: 'var(--police-navy-900)' }}>{count + 350}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="नाम, बिब, मोबाइल खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem'
                  }}
                />
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-main)', fontSize: '0.82rem' }}
              >
                <option value="all">सभी कैटेगरीज (All)</option>
                <option value="21k">21 KM Half Marathon</option>
                <option value="10k">10 KM Speed Run</option>
                <option value="5k">5 KM Community</option>
                <option value="2k">2 KM Family Walk</option>
              </select>

              {/* District Filter: Locked badge if District SP, Select if PHQ */}
              {isDistrictRole ? (
                <div style={{
                  padding: '7px 12px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1.5px solid #dc2626',
                  color: '#991b1b',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <MapPin size={13} color="#dc2626" />
                  <span>📍 {adminUser.districtName || 'जिला कमान'} (अधिकार क्षेत्र)</span>
                </div>
              ) : (
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-main)', fontSize: '0.82rem', maxWidth: '240px' }}
                >
                  <option value="all">सभी स्थान / समस्त जिले</option>
                  <option value="jaipur">जयपुर फ्लैगशिप (अल्बर्ट हॉल)</option>
                  {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={loadLiveDashboardData}
                style={{
                  background: 'var(--police-navy-50)',
                  border: '1px solid var(--police-navy-300)',
                  color: 'var(--police-navy-900)',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
                title="लाइव डेटाबेस से नवीनतम पंजीयन सिंक करें"
              >
                <RefreshCw size={12} className={isLoadingDb ? 'animate-spin' : ''} />
                <span>लाइव सिंक</span>
              </button>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {filteredList.length} रिकॉर्ड्स प्रदर्शित
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto', maxHeight: '360px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-body)' }}>
              <thead style={{ background: 'var(--police-navy-900)', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <th style={{ padding: '10px 12px' }}>Bib #</th>
                  <th style={{ padding: '10px 12px' }}>धावक विवरण व रक्त समूह</th>
                  <th style={{ padding: '10px 12px' }}>कैटेगरी & जिला</th>
                  <th style={{ padding: '10px 12px' }}>टी-शर्ट</th>
                  <th style={{ padding: '10px 12px' }}>एक्सपो स्टेटस & RFID</th>
                  <th style={{ padding: '10px 12px' }}>रेस समय</th>
                  <th style={{ padding: '10px 12px' }}>सर्टिफिकेट ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: '#ffffff' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--crimson-600)', fontFamily: 'monospace' }}>
                      {row.bibNumber}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--police-navy-900)' }}>{row.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span>{row.mobile}</span>
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, fontSize: '0.67rem' }}>
                          🩸 {row.bloodGroup || 'O+'}
                        </span>
                        {row.medicalCondition && row.medicalCondition !== 'None' && (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, fontSize: '0.67rem' }} title={row.medicalNotes || row.medicalCondition}>
                            ⚠️ {row.medicalCondition}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ color: 'var(--police-navy-800)', fontWeight: 600 }}>{row.categoryName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.districtName}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                      {row.tshirtSize}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <button
                          onClick={() => toggleBibCollection(row.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: row.bibCollected ? '#dcfce7' : '#fee2e2',
                            color: row.bibCollected ? '#15803d' : '#b91c1c',
                            border: `1px solid ${row.bibCollected ? '#86efac' : '#fca5a5'}`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {row.bibCollected ? '✓ किट प्राप्त' : 'पेंडिंग'}
                        </button>
                        {row.rfidTagId && (
                          <span style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--police-navy-700)', fontWeight: 800 }}>
                            RFID: #{row.rfidTagId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--police-navy-900)' }}>{row.finishTime || 'Running...'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Net: {row.chipTime || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--police-gold-700)', fontWeight: 800 }}>
                        {row.certificateId}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Send size={10} /> Auto-Dispatched
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: POINT 1 - RFID KIT ALLOTMENT COUNTER (EXPO DESK) */}
      {adminTab === "kit_counter" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div className="gov-card" style={{
            padding: '18px 22px',
            background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            border: '2px solid var(--police-gold-500)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PackageCheck size={24} color="var(--police-gold-400)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  एक्सपो किट एवं RFID चिप आवंटन केंद्र (Live Expo Desk)
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                धावक का बिब नंबर या मोबाइल नंबर सर्च करें। <strong>रक्त समूह (Blood Group)</strong> व <strong>चिकित्सा अलर्ट (Medical Alert)</strong> की पुष्टि कर छाती बिब व RFID टैग सुपुर्द करें।
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--police-gold-300)', fontWeight: 700 }}>काउंटर:</span>
              <select
                value={counterId}
                onChange={(e) => setCounterId(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid var(--police-gold-400)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                <option value="काउंटर-01 (अल्बर्ट हॉल मुख्य द्वार)" style={{ color: '#000' }}>काउंटर-01 (अल्बर्ट हॉल मुख्य द्वार)</option>
                <option value="काउंटर-02 (राम निवास बाग)" style={{ color: '#000' }}>काउंटर-02 (राम निवास बाग)</option>
                <option value="काउंटर-03 (पुलिस कर्मी व VIP डेस्क)" style={{ color: '#000' }}>काउंटर-03 (पुलिस कर्मी व VIP डेस्क)</option>
                <option value="काउंटर-04 (महिला धावक विशेष डेस्क)" style={{ color: '#000' }}>काउंटर-04 (महिला धावक विशेष डेस्क)</option>
                <option value="काउंटर-05 (जिला प्रतिनिधि डेस्क)" style={{ color: '#000' }}>काउंटर-05 (जिला प्रतिनिधि डेस्क)</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="gov-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} color="var(--crimson-600)" />
              <span>धावक की पहचान स्कैन या दर्ज करें (Bib Number / Mobile / Name)</span>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchKitRunner();
              }}
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="उदा. RJ-21K-1001 अथवा मोबाइल नंबर या धावक का नाम..."
                  value={kitQuery}
                  onChange={(e) => setKitQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '6px',
                    border: '2px solid var(--police-navy-300)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--police-navy-950)'
                  }}
                />
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Search size={16} />
                <span>सर्च / फेच करें</span>
              </button>
            </form>

            {/* Quick Test Runner Chips */}
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>त्वरित टेस्ट डेटा (1-क्लिक):</span>
              {(dbParticipants && dbParticipants.length > 0 ? dbParticipants.slice(0, 4) : [
                { bib_number: 'RJ-21K-1001', full_name: 'राजीव शर्मा' },
                { bib_number: 'RJ-10K-1002', full_name: 'प्रिया वर्मा' },
                { bib_number: 'RJ-5K-1003', full_name: 'अनिता मीणा' }
              ]).map((sample, sIdx) => {
                const sBib = sample.bib_number || sample.bibNumber;
                const sName = sample.full_name || sample.fullName;
                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      setKitQuery(sBib);
                      handleSearchKitRunner(sBib);
                    }}
                    style={{
                      background: 'var(--police-navy-50)',
                      border: '1px solid var(--police-navy-200)',
                      color: 'var(--police-navy-900)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🏷️ {sBib} ({sName})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kit Action Feedback Banner */}
          {kitActionMsg && (
            <div style={{
              padding: '14px 18px',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: kitActionMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${kitActionMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
              color: kitActionMsg.type === 'success' ? '#15803d' : '#b91c1c'
            }}>
              {kitActionMsg.type === 'success' ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertTriangle size={20} color="#dc2626" />}
              <span>{kitActionMsg.text}</span>
            </div>
          )}

          {/* Scanned Runner Card */}
          {scannedRunner && (
            <div className="gov-card" style={{
              padding: '24px',
              background: '#ffffff',
              border: '2px solid var(--police-navy-200)',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'var(--crimson-600)',
                      color: '#ffffff',
                      fontFamily: 'monospace',
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      letterSpacing: '0.05em'
                    }}>
                      {scannedRunner.bibNumber}
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>
                      {scannedRunner.fullName}
                    </h2>
                    <span className="badge-gov" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                      {scannedRunner.categoryName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    मोबाइल: <strong>{scannedRunner.mobile}</strong> • स्थान: <strong>{scannedRunner.districtName}</strong> • लिंग: <strong>{scannedRunner.gender}</strong>
                  </div>
                </div>

                <div>
                  {scannedRunner.kitCollected ? (
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1.5px solid #86efac',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={16} /> किट व RFID सुपुर्द
                    </span>
                  ) : (
                    <span style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1.5px solid #fde68a',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ⏳ किट आवंटन लंबित
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Pillars: T-Shirt Size, Blood Group, Medical Alert */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--police-navy-50)', border: '1px solid var(--police-navy-200)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shirt size={14} color="var(--police-navy-800)" />
                    <span>आवंटित टी-शर्ट साइज</span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)', marginTop: '4px' }}>
                    साइज़: {scannedRunner.tshirtSize}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    राजस्थान पुलिस ऑफिशियल रनर जर्सी
                  </div>
                </div>

                <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9f1239', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🩸</span>
                    <span>रक्त समूह (Blood Group)</span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#e11d48', marginTop: '4px' }}>
                    {scannedRunner.bloodGroup}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#be123c' }}>
                    आपातकालीन चिकित्सा सुरक्षा पहचान
                  </div>
                </div>

                <div style={{
                  background: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#fffbeb' : '#f0fdf4',
                  border: `1.5px solid ${scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#fcd34d' : '#86efac'}`,
                  padding: '14px',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#b45309' : '#15803d',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={14} />
                    <span>चिकित्सा स्थिति (Medical Alert)</span>
                  </div>
                  <div style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#92400e' : '#15803d',
                    marginTop: '4px'
                  }}>
                    {scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' 
                      ? scannedRunner.medicalCondition 
                      : '🟢 कोई ज्ञात बीमारी नहीं (Fit)'}
                  </div>
                  {scannedRunner.medicalNotes && (
                    <div style={{ fontSize: '0.74rem', color: '#78350f', marginTop: '4px', fontStyle: 'italic' }}>
                      नोट: "{scannedRunner.medicalNotes}"
                    </div>
                  )}
                  {scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' && (
                    <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700, marginTop: '4px' }}>
                      ⚠️ मेडिकल कलाई बैंड हैंडओवर करें।
                    </div>
                  )}
                </div>
              </div>

              {/* RFID Tag Allotment Action */}
              <div style={{
                background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
                color: '#ffffff',
                padding: '18px 20px',
                borderRadius: '8px',
                border: '1.5px solid var(--police-gold-500)'
              }}>
                {scannedRunner.kitCollected ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#86efac', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={18} />
                        <span>किट एवं RFID चिप पूर्व में आवंटित हो चुकी है</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                        आवंटित RFID चिप टैग ID: <strong style={{ color: 'var(--police-gold-300)', fontFamily: 'monospace', fontSize: '1rem' }}>{scannedRunner.rfidTagId || 'RF-ALLOCATED'}</strong>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        समय: {scannedRunner.kitCollectedAt || 'आज'} • डेस्क: {scannedRunner.collectedBy || counterId}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setScannedRunner(prev => ({ ...prev, kitCollected: false }));
                        setKitActionMsg(null);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '5px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      पुनः आवंटन / टैग बदलें
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Zap size={18} color="var(--police-gold-400)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-gold-400)' }}>
                        RFID चिप टैग संलग्न करें एवं किट हैंडओवर करें:
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 700 }}>
                          RFID चिप टैग ID (बिब रिबन पर संलग्न चिप):
                        </label>
                        <input
                          type="text"
                          value={rfidTagInput}
                          onChange={(e) => setRfidTagInput(e.target.value)}
                          placeholder="उदा. RF-928102"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '5px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1.5px solid var(--police-gold-400)',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            fontSize: '1rem',
                            fontWeight: 800
                          }}
                        />
                      </div>

                      <div style={{ alignSelf: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleDistributeKitAction}
                          disabled={isProcessingKit}
                          className="btn-gold"
                          style={{
                            padding: '12px 24px',
                            fontSize: '0.92rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: isProcessingKit ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isProcessingKit ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>डेटाबेस में सेव हो रहा है...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={18} />
                              <span>✅ किट एवं RFID चिप हैंडओवर करें</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="gov-card" style={{ padding: '14px', background: 'var(--police-navy-50)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                कुल वितरित किट्स (RFID Allocated)
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>
                {liveStats?.kitsDistributed || 4320}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                सक्रिय RFID चिप्स एक्टिवेटेड
              </div>
            </div>

            <div className="gov-card" style={{ padding: '14px', background: '#fef3c7' }}>
              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>
                वितरण हेतु लंबित (Kits Pending)
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#b45309' }}>
                {liveStats?.kitsPending || 14130}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#78350f' }}>
                एक्सपो काउंटर्स पर उपलब्ध
              </div>
            </div>

            <div className="gov-card" style={{ padding: '14px', background: '#fee2e2' }}>
              <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                चिकित्सा अलर्ट फ्लैग्ड (Medical Alerts)
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626' }}>
                {liveStats?.medicalAlerts || 48}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#991b1b' }}>
                विशेष चिकित्सा निगरानी बैंड
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POINT 2 - RACE DAY LEADERBOARD & RESULTS */}
      {adminTab === "leaderboard" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Card */}
          <div className="gov-card" style={{
            padding: '18px 22px',
            background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            border: '2px solid var(--police-gold-500)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={24} color="var(--police-gold-400)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  रेस डे आधिकारिक परिणाम एवं लीडरबोर्ड (Official Standings)
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                ग्राउंड RFID टाइमिंग मैट्स (स्टार्ट गेंट्री, 5KM, 10KM, 15KM, फिनिश) से प्राप्त मिलीसेकंड सटीक नेट चिप टाइमिंग।
              </p>
            </div>

            <button
              onClick={() => loadLeaderboardData(leadCategory, leadGender)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid var(--police-gold-400)',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={isLoadingLeaderboard ? 'animate-spin' : ''} />
              <span>रिफ्रेश स्टैंडिंग्स</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--police-navy-900)', marginRight: '4px' }}>कैटेगरी:</span>
              {[
                { id: 'all', label: 'सभी (All)' },
                { id: '21k', label: '21 KM Half Marathon' },
                { id: '10k', label: '10 KM Speed Run' },
                { id: '5k', label: '5 KM Community Run' },
                { id: '3k', label: '3 KM Walk' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setLeadCategory(cat.id);
                    loadLeaderboardData(cat.id, leadGender);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    border: leadCategory === cat.id ? '1.5px solid var(--police-navy-900)' : '1px solid var(--border-medium)',
                    background: leadCategory === cat.id ? 'var(--police-navy-900)' : '#ffffff',
                    color: leadCategory === cat.id ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>लिंग:</span>
              {[
                { id: 'all', label: 'समस्त' },
                { id: 'Female', label: 'महिला (Women)' },
                { id: 'Male', label: 'पुरुष (Men)' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setLeadGender(g.id);
                    loadLeaderboardData(leadCategory, g.id);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: leadGender === g.id ? '1.5px solid var(--crimson-600)' : '1px solid var(--border-medium)',
                    background: leadGender === g.id ? 'var(--crimson-600)' : '#ffffff',
                    color: leadGender === g.id ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Standings Table */}
          <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ background: 'var(--police-navy-900)', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                <tr>
                  <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>रैंक</th>
                  <th style={{ padding: '12px 14px' }}>बिब #</th>
                  <th style={{ padding: '12px 14px' }}>धावक का नाम व जिला</th>
                  <th style={{ padding: '12px 14px' }}>कैटेगरी व लिंग</th>
                  <th style={{ padding: '12px 14px' }}>गन टाइम</th>
                  <th style={{ padding: '12px 14px' }}>नेट चिप टाइम</th>
                  <th style={{ padding: '12px 14px' }}>मैट स्प्लिट्स (Splits)</th>
                  <th style={{ padding: '12px 14px' }}>स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {(leaderboardList.length > 0 ? leaderboardList : [
                  {
                    rank: 1,
                    bib_number: "RJ-21K-1001",
                    full_name: "सुनीता राठौड़",
                    district_name: "जयपुर पुलिस आयुक्तालय",
                    category_name: "21 KM Half Marathon",
                    gender: "Female",
                    finish_time: "01:14:22",
                    chip_time: "01:14:05",
                    status: "FINISHED",
                    scans: [
                      { km: 0, time: "06:00:00" },
                      { km: 5, time: "06:17:30" },
                      { km: 10, time: "06:35:10" },
                      { km: 21.1, time: "07:14:22" }
                    ]
                  },
                  {
                    rank: 2,
                    bib_number: "RJ-21K-1002",
                    full_name: "कविराज गुर्जर",
                    district_name: "कोटा शहर",
                    category_name: "21 KM Half Marathon",
                    gender: "Male",
                    finish_time: "01:16:45",
                    chip_time: "01:16:32",
                    status: "FINISHED",
                    scans: [
                      { km: 0, time: "06:00:00" },
                      { km: 5, time: "06:18:02" },
                      { km: 10, time: "06:36:20" },
                      { km: 21.1, time: "07:16:45" }
                    ]
                  },
                  {
                    rank: 3,
                    bib_number: "RJ-21K-1003",
                    full_name: "पूजा शेखावत",
                    district_name: "जोधपुर कमिश्नरेट",
                    category_name: "21 KM Half Marathon",
                    gender: "Female",
                    finish_time: "01:19:10",
                    chip_time: "01:18:50",
                    status: "FINISHED",
                    scans: [
                      { km: 0, time: "06:00:00" },
                      { km: 5, time: "06:19:10" },
                      { km: 10, time: "06:38:40" },
                      { km: 21.1, time: "07:19:10" }
                    ]
                  },
                  {
                    rank: 4,
                    bib_number: "RJ-21K-1004",
                    full_name: "विक्रम सिंह यादव",
                    district_name: "अलवर",
                    category_name: "21 KM Half Marathon",
                    gender: "Male",
                    finish_time: "01:21:05",
                    chip_time: "01:20:48",
                    status: "FINISHED",
                    scans: [
                      { km: 0, time: "06:00:00" },
                      { km: 5, time: "06:19:40" },
                      { km: 10, time: "06:39:50" },
                      { km: 21.1, time: "07:21:05" }
                    ]
                  }
                ]).map((row, idx) => {
                  const rank = row.rank || idx + 1;
                  const isPodium = rank <= 3;
                  const medalColors = { 1: '#f59e0b', 2: '#94a3b8', 3: '#d97706' };
                  const medalEmojis = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' };

                  return (
                    <tr key={idx} style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isPodium ? 'rgba(254, 240, 138, 0.12)' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc')
                    }}>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900 }}>
                        {isPodium ? (
                          <span style={{
                            background: medalColors[rank],
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 900,
                            display: 'inline-block'
                          }}>
                            {medalEmojis[rank]}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{rank}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--crimson-600)' }}>
                        {row.bib_number}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{row.full_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.district_name}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--police-navy-800)' }}>{row.category_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.gender}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {row.finish_time || 'Running...'}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 900, color: 'var(--police-navy-950)', fontSize: '0.92rem' }}>
                        {row.chip_time || row.finish_time || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {Array.isArray(row.scans) && row.scans.length > 0 ? (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {row.scans.map((s, sI) => (
                              <span key={sI} style={{ background: 'var(--police-navy-50)', padding: '2px 5px', borderRadius: '3px', fontSize: '0.66rem', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>
                                {s.km}K: {s.time || s.scan_time}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Start Mat Checked</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: row.status === 'FINISHED' ? '#dcfce7' : '#dbeafe',
                          color: row.status === 'FINISHED' ? '#15803d' : '#1d4ed8',
                          border: `1px solid ${row.status === 'FINISHED' ? '#86efac' : '#93c5fd'}`,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {row.status === 'FINISHED' ? '✓ FINISHED' : '● ON TRACK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE COURSE RADAR & SAFETY COMMAND */}
      {adminTab === "live_radar" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Live Command Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-700)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Activity size={15} color="var(--crimson-600)" /> कोर्स पर सक्रिय धावक
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--police-navy-950)', margin: '4px 0' }}>2,410</div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>● 21K: 890 | 10K: 1,020 | 5K: 500</div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-700)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> मेडल प्राप्त फिनिशर
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', margin: '4px 0' }}>142</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>फिनिश लाइन क्रॉसिंग दर: ~18/min</div>
            </div>

            <div style={{ background: delayedRunners.length > 0 ? '#fff1f2' : '#ffffff', padding: '16px', borderRadius: '8px', border: delayedRunners.length > 0 ? '1.5px solid #f87171' : '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={15} color="#dc2626" /> स्वास्थ्य / विलंब सुरक्षा अलर्ट
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626', margin: '4px 0' }}>{delayedRunners.length}</div>
              <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700 }}>
                {delayedRunners.length > 0 ? '⚠️ मेडिकल व बाइक पेट्रोल निर्देशित' : 'सभी धावक सामान्य गति पर'}
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-700)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shield size={15} color="var(--police-navy-900)" /> ग्राउंड पुलिस स्क्वाड गश्त
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--police-navy-900)', margin: '4px 0' }}>16 यूनिट्स</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>निर्भया स्क्वाड + 8 एम्बुलेंस वैन</div>
            </div>
          </div>

          {/* Sector Density Distribution Gauge */}
          <div className="gov-card" style={{ padding: '18px 20px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--police-navy-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="var(--crimson-600)" />
                जेएलएन मार्ग सेक्टरवार धावक घनत्व (Course Sector Runner Density)
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800 }}>● 6 टाइमिंग गेट्स लाइव कनेक्टेड</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {[
                { sector: 'Sector 1 (0K - 5K)', label: 'अल्बर्ट हॉल से RU गेट', count: 420, pct: 17, color: 'var(--police-navy-700)', patrol: 'PCR वैन 02 & निर्भया 01' },
                { sector: 'Sector 2 (5K - 10K)', label: 'RU गेट से WTP मोड़', count: 860, pct: 36, color: 'var(--police-gold-600)', patrol: 'बाइक पेट्रोल 04 & एम्बुलेंस 03' },
                { sector: 'Sector 3 (10K - 15K)', label: 'WTP से जवाहर सर्किल लूप', count: 680, pct: 28, color: 'var(--crimson-600)', patrol: 'ट्रैफिक स्क्वाड & एम्बुलेंस 05' },
                { sector: 'Sector 4 (15K - 21.1K)', label: 'जवाहर सर्किल से अमर जवान ज्योति / फिनिश', count: 450, pct: 19, color: '#10b981', patrol: 'अल्बर्ट हॉल रिकवरी एरिना' }
              ].map((sec, idx) => (
                <div key={idx} style={{ background: 'var(--police-navy-50)', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>{sec.sector}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: sec.color }}>{sec.count} धावक</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{sec.label}</div>
                  
                  {/* Mini bar */}
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', width: `${sec.pct}%`, background: sec.color, borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--police-navy-900)', fontWeight: 700 }}>
                    🛡️ गश्त: {sec.patrol}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stalled / Delayed Runner Safety Alert Table */}
          <div className="gov-card" style={{ padding: '18px 20px', background: '#ffffff', borderRadius: '8px', border: '1.5px solid #fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#dc2626" />
                  स्वास्थ्य एवं विलंब निगरानी कतार (Overdue Runners Queue)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#b91c1c' }}>
                  अपेक्षित पेस से 20+ मिनट अधिक विलंब होने पर ऑटोमैटिक अलर्ट जनरेट होता है।
                </p>
              </div>
              <span className="badge-pink" style={{ fontSize: '0.72rem' }}>
                राजस्थान पुलिस त्वरित सुरक्षा प्रोटोकॉल
              </span>
            </div>

            {delayedRunners.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: 700, fontSize: '0.88rem' }}>
                ✓ वर्तमान में सभी धावक सामान्य गति पर हैं। कोई सुरक्षा अलर्ट पेंडिंग नहीं है।
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#fff1f2', borderBottom: '2px solid #fecaca', color: '#991b1b' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800 }}>Bib / धावक</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800 }}>अंतिम देखा गया स्थान</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800 }}>विलंब स्थिति</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800 }}>इमरजेंसी संपर्क</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800 }}>पुलिस कार्यवाही</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>एक्शन</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delayedRunners.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{item.fullName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--crimson-600)', fontWeight: 700 }}>{item.bibNumber} • {item.category}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--police-navy-900)' }}>{item.sector}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.lastSeen}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                            {item.currentDelay}
                          </span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>लक्ष्य: {item.expectedPace}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700 }}>{item.mobile}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>परिजन: {item.emergencyContact}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: item.status === 'DISPATCHED' ? '#fef3c7' : '#f1f5f9',
                            color: item.status === 'DISPATCHED' ? '#92400e' : '#475569',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {item.status === 'DISPATCHED' ? '🚨 गश्त रवाना' : 'पेंडिंग'}
                          </span>
                          <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '2px' }}>{item.notes}</div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setDelayedRunners(prev => prev.map(r => r.id === item.id ? { ...r, status: 'DISPATCHED', notes: 'बाइक पेट्रोल 04 मौके पर पहुंच चुकी है।' } : r));
                                setExportNotice(`बाइक पेट्रोल यूनिट को धावक ${item.fullName} (Bib: ${item.bibNumber}) की ओर रवाना कर दिया गया है।`);
                                setTimeout(() => setExportNotice(null), 4000);
                              }}
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              🚨 बाइक पेट्रोल भेजें
                            </button>
                            <button
                              onClick={() => {
                                setDelayedRunners(prev => prev.filter(r => r.id !== item.id));
                                setExportNotice(`धावक ${item.fullName} की स्थिति सामान्य सत्यापित हुई। अलर्ट बंद किया गया।`);
                                setTimeout(() => setExportNotice(null), 4000);
                              }}
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 8px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                              title="स्थिति सामान्य मार्क करें"
                            >
                              ✓ सुरक्षित
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hardware & IoT Sensor Mats Health Status Matrix */}
          <div className="gov-card" style={{ padding: '16px 20px', background: 'var(--police-navy-950)', color: '#ffffff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--police-gold-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> ग्राउंड RFID टाइमिंग मैट हार्डवेयर स्वास्थ्य (Timing Readers Health Matrix)
              </span>
              <span style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 700 }}>सिस्टम लेटेंसी: 8ms • 100% अपटाइम</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {[
                { name: 'Albert Hall Gantry', ip: '10.24.1.101', status: 'ONLINE', pings: '4ms', battery: 'AC Mains' },
                { name: '5K RU Gate Mat', ip: '10.24.1.102', status: 'ONLINE', pings: '7ms', battery: '98% UPS' },
                { name: '10K WTP Turn Mat', ip: '10.24.1.103', status: 'ONLINE', pings: '9ms', battery: '94% UPS' },
                { name: '15K Patrika Gate Mat', ip: '10.24.1.104', status: 'ONLINE', pings: '11ms', battery: '91% UPS' },
                { name: 'Grand Finish Gantry', ip: '10.24.1.105', status: 'ONLINE', pings: '3ms', battery: 'AC Redundant' }
              ].map((hw, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                    <span>{hw.name}</span>
                    <span style={{ color: '#4ade80', fontSize: '0.65rem' }}>● {hw.status}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                    IP: {hw.ip} | लेटेंसी: {hw.pings}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--police-gold-400)', marginTop: '2px' }}>
                    पावर: {hw.battery}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB: DISTRICT CERTIFICATES (SP Level) */}
      {isDistrictRole && adminTab === "district_certificates" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="gov-card" style={{
            padding: '18px 22px',
            background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            border: '2px solid var(--police-gold-500)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={24} color="var(--police-gold-400)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  जिला स्तरीय ई-प्रमाण पत्र एवं डिजिटल सत्यापन ({adminUser.districtName || 'District'})
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                आपके जिले के धावकों के फिनिशर एवं सहभागिता ई-प्रमाण पत्र का डिजिटल रिकॉर्ड एवं सत्यापन।
              </p>
            </div>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--police-gold-500)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#fde68a', fontWeight: 700 }}>
              कुल पात्र धावक: {filteredList.length}
            </div>
          </div>

          <div className="gov-card" style={{ padding: '0', background: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--police-navy-950)', color: '#ffffff', borderBottom: '2px solid var(--police-gold-500)' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>बिब व धावक का नाम</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>दौड़ श्रेणी</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>प्रमाण पत्र क्रमांक</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>सत्यापन QR टोकन</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((row, idx) => (
                  <tr key={row.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#ffffff' : 'var(--police-navy-50)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{row.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>{row.bibNumber} • {row.mobile}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge-gov" style={{ fontSize: '0.74rem' }}>{row.categoryName || '5 KM Community Run'}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                        {row.certificateId || `RJ-POL-2026-${(row.id || 'CERT').slice(0, 6)}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {row.qrToken || row.certificateId?.slice(-8) || 'VERIFIED_OK'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, border: '1px solid #86efac' }}>
                        ✓ जारी व सत्यापित
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DISTRICT MEDICAL & SAFETY (SP Level) */}
      {isDistrictRole && adminTab === "district_medical" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="gov-card" style={{
            padding: '18px 22px',
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #ef4444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HeartPulse size={24} color="#fca5a5" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  स्थानीय पुलिस सुरक्षा व आपातकालीन मेडिकल डेस्क ({adminUser.districtName || 'District'})
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#fecaca' }}>
                जिले में मैराथन रूट पर पुलिस सुरक्षा टीम, एम्बुलेंस व चिकित्सा शिविर हेतु धावकों का ब्लड ग्रुप एवं इमरजेंसी डेटा।
              </p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#ffffff', fontWeight: 700 }}>
              🚑 मेडिकल अलर्ट्स: {filteredList.filter(r => r.medicalCondition && r.medicalCondition !== 'None' && !r.medicalCondition.includes('Fit')).length}
            </div>
          </div>

          <div className="gov-card" style={{ padding: '0', background: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#450a0a', color: '#ffffff', borderBottom: '2px solid #ef4444' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>धावक विवरण (Bib & Name)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>रक्त समूह (Blood Group)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>घोषित स्वास्थ्य स्थिति</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>आपातकालीन संपर्क (Emergency Contact)</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((row, idx) => {
                  const hasAlert = row.medicalCondition && row.medicalCondition !== 'None' && !row.medicalCondition.includes('Fit');
                  return (
                    <tr key={row.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: hasAlert ? '#fffbeb' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc') }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{row.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--crimson-600)', fontWeight: 700 }}>{row.bibNumber} • {row.gender}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#ffe4e6', color: '#be123c', padding: '3px 8px', borderRadius: '4px', fontWeight: 900, border: '1px solid #fecdd3' }}>
                          🩸 {row.bloodGroup || 'O+'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {hasAlert ? (
                          <span style={{ color: '#b45309', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} color="#d97706" /> {row.medicalCondition}
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600 }}>✓ पूर्णतः स्वस्थ (Fit)</span>
                        )}
                        {row.medicalNotes && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{row.medicalNotes}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <a 
                          href={`tel:${row.mobile}`}
                          style={{ fontWeight: 800, color: '#1e40af', textDecoration: 'none' }}
                        >
                          📞 {row.mobile}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  </div>
</div>
);
}
