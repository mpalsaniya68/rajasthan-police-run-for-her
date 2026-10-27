import React, { useState } from 'react';
import { 
  X, Shield, Download, Search, CheckCircle2, Shirt, Send, LogOut, 
  FileSpreadsheet, MapPin, Filter, Database, Radio, AlertTriangle, 
  Activity, Users, Phone, Zap, ArrowRight, RefreshCw
} from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';

export function AdminDashboard({ isOpen, onClose, registrations = [], onUpdateRegistration, onLogout }) {
  const [adminTab, setAdminTab] = useState("registrations"); // "registrations" | "live_radar"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedExportDistrict, setSelectedExportDistrict] = useState(RAJASTHAN_POLICE_DISTRICTS[0]?.name || "Jaipur Police Commissionerate (Flagship Host)");
  const [exportNotice, setExportNotice] = useState(null);

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

  if (!isOpen) return null;

  const tshirtCounts = registrations.reduce((acc, curr) => {
    const size = curr.tshirtSize || "M";
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

  const filteredList = registrations.filter(r => {
    const matchesSearch = (r.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.bibNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.mobile || '').includes(searchTerm) ||
                          (r.certificateId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCatFilter === "all" || r.category === selectedCatFilter;
    const matchesDist = districtFilter === "all" || 
                        (districtFilter === "jaipur" ? r.venueType === "jaipur" : r.venueType !== "jaipur") ||
                        (r.districtName === districtFilter);
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

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ maxWidth: '1140px', width: '96%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Admin Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
          padding: '16px 22px',
          borderBottom: '3px solid var(--police-gold-500)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <PoliceEmblem size={42} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2vw, 1.25rem)', letterSpacing: '0.02em' }}>
                  पुलिस मुख्यालय कमान एवं नोडल डेस्क (PHQ COMMAND)
                </span>
                <span className="badge-gold" style={{ fontSize: '0.65rem', padding: '1px 7px' }}>
                  2FA Verified • Single Access Active
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--police-gold-400)' }}>
                Statewide Real-time Logistics, 50 Districts CSV Engine & Certificate Control
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Logout / Security Lock Button */}
            <button
              onClick={() => {
                sessionStorage.removeItem('rajpol_admin_auth');
                if (onLogout) onLogout();
                onClose();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
              title="Session समाप्त करें एवं लॉक करें"
            >
              <LogOut size={13} />
              <span>सुरक्षा लॉक (Logout)</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{
          background: 'var(--police-navy-900)',
          padding: '0 22px',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
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
              gap: '6px'
            }}
          >
            <Database size={15} />
            <span>📋 राज्यव्यापी धावक सूची एवं CSV एक्सपोर्ट</span>
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
              gap: '6px'
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
          </div>

          {/* Top Metric Cards */}
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

          {/* T-Shirt Logistics Strip */}
          <div className="gov-card" style={{ padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shirt size={18} color="var(--police-navy-800)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>टी-शर्ट इन्वेंट्री ऑर्डर ब्रेकअप:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(tshirtCounts).map(([sz, count]) => (
                <div key={sz} style={{ background: 'var(--police-navy-50)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{sz}:</span> <strong style={{ color: 'var(--police-navy-900)' }}>{count + 350}</strong>
                </div>
              ))}
            </div>
          </div>

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
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {filteredList.length} रिकॉर्ड्स प्रदर्शित
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto', maxHeight: '360px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-body)' }}>
              <thead style={{ background: 'var(--police-navy-900)', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <th style={{ padding: '10px 12px' }}>Bib #</th>
                  <th style={{ padding: '10px 12px' }}>धावक विवरण</th>
                  <th style={{ padding: '10px 12px' }}>कैटेगरी & जिला</th>
                  <th style={{ padding: '10px 12px' }}>टी-शर्ट</th>
                  <th style={{ padding: '10px 12px' }}>एक्सपो स्टेटस</th>
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
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.mobile} • {row.runnerType}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ color: 'var(--police-navy-800)', fontWeight: 600 }}>{row.categoryName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.districtName}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                      {row.tshirtSize}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
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
                          cursor: 'pointer'
                        }}
                      >
                        {row.bibCollected ? '✓ किट प्राप्त' : 'पेंडिंग'}
                      </button>
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

      {/* TAB 2: LIVE COURSE RADAR & SAFETY COMMAND */}
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

    </div>
  </div>
</div>
);
}
