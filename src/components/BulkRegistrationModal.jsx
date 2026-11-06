import React, { useState, useRef } from 'react';
import { X, Building2, Download, Upload, Plus, Trash2, CheckCircle2, Shield, Users, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import { RAJASTHAN_POLICE_DISTRICTS, RACE_CATEGORIES } from '../data/mockData';
import confetti from 'canvas-confetti';
import { apiBulkRegister } from '../services/api';

export const isJaipurDistrict = (districtId) => {
  if (!districtId) return false;
  const d = String(districtId).toLowerCase().replace(/[^a-z0-9]/g, '');
  return d.includes('jaipur') || d.includes('jprcomm') || d === 'jaipurcomm';
};

export function BulkRegistrationModal({ isOpen, onClose, onBulkRegisterSuccess }) {
  const [instType, setInstType] = useState("police_unit"); // police_unit, college_school, ncc_nss, ngo_corp
  const [instName, setInstName] = useState("");
  const [nodalOfficer, setNodalOfficer] = useState("");
  const [nodalPhone, setNodalPhone] = useState("");
  const [nodalEmail, setNodalEmail] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("JPR-COMM");
  const fileInputRef = useRef(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const isJaipur = isJaipurDistrict(selectedDistrict);

  // Multi-row runner entry
  const [runners, setRunners] = useState([
    { id: 1, name: "Cadet Aarti Meena", gender: "Female", age: 22, category: "10k", size: "M" },
    { id: 2, name: "Constable Sunita Yadav", gender: "Female", age: 27, category: "21k", size: "S" },
    { id: 3, name: "Cadet Rajesh Gurjar", gender: "Male", age: 21, category: "5k", size: "L" },
    { id: 4, name: "Trainee Priyanka Shekhawat", gender: "Female", age: 24, category: "10k", size: "M" },
    { id: 5, name: "Sub-Inspector Manoj Verma", gender: "Male", age: 30, category: "21k", size: "XL" }
  ]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [generatedBibs, setGeneratedBibs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const addRunnerRow = () => {
    setRunners(prev => [
      ...prev,
      { id: Date.now(), name: "", gender: "Female", age: 22, category: "5k", size: isJaipur ? "M" : "N/A" }
    ]);
  };

  const removeRunnerRow = (id) => {
    if (runners.length <= 1) {
      alert("कम से कम एक प्रतिभागी होना आवश्यक है।");
      return;
    }
    setRunners(prev => prev.filter(r => r.id !== id));
  };

  const updateRunnerField = (id, field, value) => {
    setRunners(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Real CSV File Upload & Parsing
  const handleRealCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setUploadFeedback({ type: 'error', text: 'CSV फ़ाइल खाली है या उसमें डेटा पंक्तियाँ नहीं हैं।' });
          return;
        }

        const parsedRunners = [];
        const headerLine = lines[0].toLowerCase();
        const startIndex = (headerLine.includes("name") || headerLine.includes("gender")) ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 1 && parts[0]) {
            const rawName = parts[0];
            const rawGender = (parts[1] || "Female").toLowerCase();
            const gender = rawGender.startsWith("m") ? "Male" : (rawGender.startsWith("o") ? "Other" : "Female");
            const age = parseInt(parts[2]) || 22;

            let rawCategory = (parts[3] || "5k").toLowerCase().replace(/[^0-9k]/g, '');
            if (!["21k", "10k", "5k", "2k"].includes(rawCategory)) {
              rawCategory = "5k";
            }

            let rawSize = isJaipur ? (parts[4] || "M").toUpperCase().trim() : "N/A";
            if (isJaipur && !["XS", "S", "M", "L", "XL", "XXL"].includes(rawSize)) {
              rawSize = "M";
            }

            parsedRunners.push({
              id: Date.now() + i,
              name: rawName,
              gender,
              age,
              category: rawCategory,
              size: rawSize
            });
          }
        }

        if (parsedRunners.length === 0) {
          setUploadFeedback({ type: 'error', text: 'फ़ाइल से कोई वैध धावक रिकॉर्ड नहीं मिला। कृपया टेम्पलेट प्रारूप का उपयोग करें।' });
          return;
        }

        setRunners(parsedRunners);
        setUploadFeedback({ type: 'success', text: `✅ सफलतापूर्वक ${parsedRunners.length} धावकों की सूची फ़ाइल से लोड की गई!` });
      } catch (err) {
        setUploadFeedback({ type: 'error', text: 'फ़ाइल पढ़ने में त्रुटि। कृपया मानक CSV फ़ॉर्मेट उपयोग करें।' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    let csvContent = "";
    if (isJaipur) {
      csvContent = "data:text/csv;charset=utf-8," + 
        "Full Name,Gender,Age,Category (21k/10k/5k/2k),T-Shirt Size (XS/S/M/L/XL/XXL)\n" +
        "Kavita Sharma,Female,22,10k,M\n" +
        "Rahul Meena,Male,24,21k,L\n" +
        "Sunita Devi,Female,26,5k,S\n" +
        "Amit Kumar,Male,20,5k,XL\n";
    } else {
      csvContent = "data:text/csv;charset=utf-8," + 
        "Full Name,Gender,Age,Category (10k/5k/2k)\n" +
        "Kavita Sharma,Female,22,10k\n" +
        "Rahul Meena,Male,24,10k\n" +
        "Sunita Devi,Female,26,5k\n" +
        "Amit Kumar,Male,20,5k\n";
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", isJaipur ? "Rajasthan_Police_Marathon_Bulk_Upload_Template_Jaipur.csv" : "Rajasthan_Police_Marathon_Bulk_Upload_Template_District.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate CSV Upload Parser
  const handleSimulatedCSVUpload = () => {
    alert("सैंपल एक्सेल शीट पार्स की गई! 15 कैडेट्स की सूची स्वतः फॉर्म में लोड हो गई।");
    const simulatedBatch = [
      { id: Date.now() + 1, name: "Cadet Neha Rathore", gender: "Female", age: 21, category: "10k", size: isJaipur ? "S" : "N/A" },
      { id: Date.now() + 2, name: "Constable Pooja Soni", gender: "Female", age: 25, category: "21k", size: isJaipur ? "M" : "N/A" },
      { id: Date.now() + 3, name: "Cadet Deepak Bairwa", gender: "Male", age: 22, category: "10k", size: isJaipur ? "L" : "N/A" },
      { id: Date.now() + 4, name: "Cadet Simran Bano", gender: "Female", age: 20, category: "5k", size: isJaipur ? "M" : "N/A" },
      { id: Date.now() + 5, name: "Trainee Suman Kanwar", gender: "Female", age: 23, category: "21k", size: isJaipur ? "M" : "N/A" },
      { id: Date.now() + 6, name: "Constable Rakesh Dhaka", gender: "Male", age: 28, category: "21k", size: isJaipur ? "XL" : "N/A" },
      { id: Date.now() + 7, name: "Cadet Anjali Choudhary", gender: "Female", age: 21, category: "5k", size: isJaipur ? "S" : "N/A" },
      { id: Date.now() + 8, name: "Cadet Jyoti Meena", gender: "Female", age: 22, category: "10k", size: isJaipur ? "M" : "N/A" }
    ];
    setRunners(simulatedBatch);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!instName.trim() || !nodalPhone.trim()) {
      alert("कृपया संस्थान का नाम और नोडल अधिकारी का मोबाइल नंबर दर्ज करें।");
      return;
    }

    const invalidRow = runners.find(r => !r.name.trim());
    if (invalidRow) {
      alert("कृपया सभी धावकों के नाम भरें।");
      return;
    }

    const cleanNodalPhone = nodalPhone.replace(/\D/g, "");
    if (cleanNodalPhone.length !== 10) {
      alert("कृपया नोडल अधिकारी का वैध 10-अंकीय मोबाइल नंबर दर्ज करें।");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      institution: instName.trim(),
      districtId: (selectedDistrict || "jaipur_comm").toLowerCase().replace(/-/g, '_'),
      contactPerson: nodalOfficer.trim() || "Nodal Incharge",
      contactMobile: cleanNodalPhone,
      runners: runners.map(r => ({
        fullName: r.name.trim(),
        gender: (r.gender || "Female").toLowerCase(),
        dob: `${2027 - (parseInt(r.age) || 22)}-01-01`,
        mobile: cleanNodalPhone,
        emergencyContact: cleanNodalPhone,
        emergencyRelation: "संस्थान नोडल अधिकारी (Nodal)",
        bloodGroup: "B+",
        categoryId: r.category,
        districtId: (selectedDistrict || "jaipur_comm").toLowerCase().replace(/-/g, '_'),
        tshirtSize: isJaipur ? (r.size && r.size !== "N/A" ? r.size : "M") : "N/A",
        idType: "Institutional ID",
        idLast4: cleanNodalPhone.slice(-4)
      }))
    };

    const res = await apiBulkRegister(payload);
    setIsSubmitting(false);

    if (!res.success) {
      alert(res.error || "बल्क पंजीकरण में त्रुटि हुई।");
      return;
    }

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (err) {}

    const newBatchId = res.batchId || `BATCH-RP-${Date.now().toString().slice(-5)}`;
    setBatchId(newBatchId);

    const generated = (res.runners || []).map((r, i) => ({
      id: `REG-BLK-${i}`,
      bibNumber: r.bibNumber,
      fullName: r.fullName,
      categoryName: r.categoryName,
      institutionName: instName,
      registeredAt: new Date().toLocaleString(),
      status: "CONFIRMED"
    }));

    setGeneratedBibs(generated);
    if (onBulkRegisterSuccess) {
      onBulkRegisterSuccess(generated);
    }
    setIsSubmitted(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '980px', width: '96%' }}>
        {/* Header */}
        <div style={{
          background: 'var(--police-navy-900)',
          padding: '16px 20px',
          borderBottom: '3px solid var(--police-gold-500)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PoliceEmblem size={38} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', letterSpacing: '0.02em' }}>
                संस्थागत एवं ग्रुप बल्क रजिस्ट्रेशन (Institutional Bulk Portal)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--police-gold-400)' }}>
                RPA, RAC बटालियन, कॉलेज, विश्वविद्यालय, NCC/NSS एवं कॉर्पोरेट ग्रुप्स के लिए
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '6px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          {!isSubmitted ? (
            <form onSubmit={handleBulkSubmit}>
              {/* Institution Details */}
              <div style={{ background: 'var(--police-navy-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color="var(--police-navy-800)" /> 1. संस्थान एवं नोडल अधिकारी विवरण
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>संस्थान प्रकार</label>
                    <select
                      value={instType}
                      onChange={(e) => setInstType(e.target.value)}
                      style={{ width: '100%', padding: '9px', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      <option value="police_unit">पुलिस अकादमी / RAC / पुलिस यूनिट</option>
                      <option value="college_school">विश्वविद्यालय / महाविद्यालय / स्कूल</option>
                      <option value="ncc_nss">NCC / NSS / स्काउट्स कैडेट्स</option>
                      <option value="ngo_corp">महिला संगठन / NGO / कॉर्पोरेट</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>संस्थान का नाम *</label>
                    <input
                      type="text"
                      placeholder="उदा. राजस्थान पुलिस अकादमी (RPA) / RU जयपुर"
                      required
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>नोडल अधिकारी नाम</label>
                    <input
                      type="text"
                      placeholder="नोडल प्रभारी का नाम"
                      value={nodalOfficer}
                      onChange={(e) => setNodalOfficer(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>नोडल मोबाइल नंबर *</label>
                    <input
                      type="tel"
                      placeholder="एसएमएस एवं ई-पास हेतु"
                      required
                      value={nodalPhone}
                      onChange={(e) => setNodalPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* District Venue Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>पार्टिसिपेशन जिला</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setSelectedDistrict(newDist);
                        const nowJaipur = isJaipurDistrict(newDist);
                        if (!nowJaipur) {
                          setRunners(prev => prev.map(r => ({ ...r, size: "N/A" })));
                        } else {
                          setRunners(prev => prev.map(r => ({ ...r, size: r.size === "N/A" ? "M" : r.size })));
                        }
                      }}
                      style={{ width: '100%', padding: '9px', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>संस्थान ईमेल</label>
                    <input
                      type="email"
                      placeholder="नोडल ईमेल (बैच सर्टिफिकेट्स हेतु)"
                      value={nodalEmail}
                      onChange={(e) => setNodalEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Excel Template & Upload Action Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '14px',
                padding: '10px 14px',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} color="#059669" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                    2. धावकों की सूची ({runners.length} प्रतिभागी जोड़े गए)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <Download size={13} /> एक्सेल टेम्पलेट डाउनलोड करें
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv, text/csv, .txt"
                    onChange={handleRealCsvUpload}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1.5px solid #10b981',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={13} /> CSV / एक्सेल फ़ाइल अपलोड करें
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatedCSVUpload}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                    title="त्वरित परीक्षण हेतु 8 कैडेट्स का सैंपल लोड करें"
                  >
                    सैंपल डेटा लोड करें
                  </button>

                  <button
                    type="button"
                    onClick={addRunnerRow}
                    className="btn-navy"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <Plus size={13} /> नया धावक जोड़ें
                  </button>
                </div>
              </div>

              {uploadFeedback && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: uploadFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: uploadFeedback.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1.5px solid ${uploadFeedback.type === 'success' ? '#10b981' : '#f87171'}`,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{uploadFeedback.text}</span>
                  <button type="button" onClick={() => setUploadFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'inherit' }}>✕</button>
                </div>
              )}

              {/* Runners Table (Responsive with touch scroll) */}
              <div style={{ overflowX: 'auto', maxHeight: '280px', borderRadius: '6px', border: '1px solid var(--border-medium)', marginBottom: '18px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead style={{ background: 'var(--police-navy-900)', color: '#fff', position: 'sticky', top: 0, zIndex: 2 }}>
                    <tr>
                      <th style={{ padding: '8px 10px' }}>#</th>
                      <th style={{ padding: '8px 10px', minWidth: '180px' }}>धावक का नाम *</th>
                      <th style={{ padding: '8px 10px' }}>जेंडर</th>
                      <th style={{ padding: '8px 10px', width: '70px' }}>आयु</th>
                      <th style={{ padding: '8px 10px', minWidth: '130px' }}>रेस कैटेगरी</th>
                      {isJaipur && (
                        <th style={{ padding: '8px 10px', width: '100px' }}>टी-शर्ट</th>
                      )}
                      <th style={{ padding: '8px 10px', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {runners.map((r, idx) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: '#ffffff' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <input
                            type="text"
                            placeholder="पूरा नाम दर्ज करें"
                            value={r.name}
                            onChange={(e) => updateRunnerField(r.id, 'name', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <select
                            value={r.gender}
                            onChange={(e) => updateRunnerField(r.id, 'gender', e.target.value)}
                            style={{ padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.82rem' }}
                          >
                            <option value="Female">महिला</option>
                            <option value="Male">पुरुष</option>
                            <option value="Other">अन्य</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <input
                            type="number"
                            value={r.age}
                            onChange={(e) => updateRunnerField(r.id, 'age', e.target.value)}
                            style={{ width: '60px', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <select
                            value={r.category}
                            onChange={(e) => updateRunnerField(r.id, 'category', e.target.value)}
                            style={{ padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.82rem' }}
                          >
                            <option value="21k">21 KM Half Marathon</option>
                            <option value="10k">10 KM Speed Run</option>
                            <option value="5k">5 KM Community</option>
                            <option value="2k">2 KM Family Walk</option>
                          </select>
                        </td>
                        {isJaipur && (
                          <td style={{ padding: '8px 10px' }}>
                            <select
                              value={r.size}
                              onChange={(e) => updateRunnerField(r.id, 'size', e.target.value)}
                              style={{ padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.82rem' }}
                            >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </select>
                          </td>
                        )}
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeRunnerRow(r.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                            title="हटाएं"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '1rem', justifyContent: 'center' }}
              >
                <CheckCircle2 size={18} /> बैच रजिस्ट्रेशन पूरा करें ({runners.length} बिब तुरंत अलॉट करें)
              </button>
            </form>
          ) : (
            /* Bulk Confirmation Screen */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <CheckCircle2 size={34} />
              </div>

              <h3 style={{ fontSize: '1.5rem', color: 'var(--police-navy-900)', marginBottom: '4px' }}>
                संस्थागत बैच रजिस्ट्रेशन सफलतापूर्वक संपन्न!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                बैच कोड: <strong style={{ color: 'var(--police-navy-900)' }}>{batchId}</strong> • संस्थान: <strong>{instName}</strong>
              </p>

              {/* Summary Table of Generated Bibs */}
              <div style={{
                background: 'var(--police-navy-50)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                maxHeight: '260px',
                overflowY: 'auto',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--police-navy-900)', marginBottom: '10px' }}>
                  अलॉटेड बिब नंबर्स एवं डिजिटल ई-पास सारांश:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {generatedBibs.map((g, i) => (
                    <div key={i} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--crimson-600)', fontFamily: 'monospace' }}>{g.bibNumber}</div>
                      <div style={{ fontWeight: 700, color: 'var(--police-navy-900)' }}>{g.fullName}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{g.categoryName} {g.tshirtSize && g.tshirtSize !== 'N/A' ? `• Size: ${g.tshirtSize}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-gold"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  <Download size={15} /> मास्टर बैच रिपोर्ट प्रिंट करें
                </button>
                <button
                  onClick={onClose}
                  className="btn-navy"
                  style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                >
                  पोर्टल पर वापस जाएं (Done)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
