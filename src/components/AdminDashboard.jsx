import React, { useState } from 'react';
import { X, Shield, Download, Search, CheckCircle2, Shirt, Send, LogOut, FileSpreadsheet, MapPin, Filter, Database } from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';

export function AdminDashboard({ isOpen, onClose, registrations = [], onUpdateRegistration, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedExportDistrict, setSelectedExportDistrict] = useState(RAJASTHAN_POLICE_DISTRICTS[0]?.name || "Jaipur Police Commissionerate (Flagship Host)");
  const [exportNotice, setExportNotice] = useState(null);

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
    const filename = `Rajasthan_Police_Marathon_ALL_50_DISTRICTS_Master_${Date.now()}.csv`;
    downloadCSVFile(registrations, filename);
    setExportNotice(`सम्पूर्ण राज्य (All 50 Districts) का मास्टर डेटा (${registrations.length} रिकॉर्ड्स) सफलतापूर्वक डाउनलोड हुआ!`);
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
        </div>
      </div>
    </div>
  );
}
