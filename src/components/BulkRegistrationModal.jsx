import React, { useState } from 'react';
import { X, Building2, Download, Upload, Plus, Trash2, CheckCircle2, Shield, Users, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import { RAJASTHAN_POLICE_DISTRICTS, RACE_CATEGORIES } from '../data/mockData';
import confetti from 'canvas-confetti';

export function BulkRegistrationModal({ isOpen, onClose, onBulkRegisterSuccess }) {
  const [instType, setInstType] = useState("police_unit"); // police_unit, college_school, ncc_nss, ngo_corp
  const [instName, setInstName] = useState("");
  const [nodalOfficer, setNodalOfficer] = useState("");
  const [nodalPhone, setNodalPhone] = useState("");
  const [nodalEmail, setNodalEmail] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("JPR-COMM");

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

  if (!isOpen) return null;

  const addRunnerRow = () => {
    setRunners(prev => [
      ...prev,
      { id: Date.now(), name: "", gender: "Female", age: 22, category: "5k", size: "M" }
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

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Full Name,Gender,Age,Category (21k/10k/5k/2k),T-Shirt Size (XS/S/M/L/XL/XXL)\n" +
      "Kavita Sharma,Female,22,10k,M\n" +
      "Rahul Meena,Male,24,21k,L\n" +
      "Sunita Devi,Female,26,5k,S\n" +
      "Amit Kumar,Male,20,5k,XL\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Rajasthan_Police_Marathon_Bulk_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate CSV Upload Parser
  const handleSimulatedCSVUpload = () => {
    alert("सैंपल एक्सेल शीट पार्स की गई! 15 कैडेट्स की सूची स्वतः फॉर्म में लोड हो गई।");
    const simulatedBatch = [
      { id: Date.now() + 1, name: "Cadet Neha Rathore", gender: "Female", age: 21, category: "10k", size: "S" },
      { id: Date.now() + 2, name: "Constable Pooja Soni", gender: "Female", age: 25, category: "21k", size: "M" },
      { id: Date.now() + 3, name: "Cadet Deepak Bairwa", gender: "Male", age: 22, category: "10k", size: "L" },
      { id: Date.now() + 4, name: "Cadet Simran Bano", gender: "Female", age: 20, category: "5k", size: "M" },
      { id: Date.now() + 5, name: "Trainee Suman Kanwar", gender: "Female", age: 23, category: "21k", size: "M" },
      { id: Date.now() + 6, name: "Constable Rakesh Dhaka", gender: "Male", age: 28, category: "21k", size: "XL" },
      { id: Date.now() + 7, name: "Cadet Anjali Choudhary", gender: "Female", age: 21, category: "5k", size: "S" },
      { id: Date.now() + 8, name: "Cadet Jyoti Meena", gender: "Female", age: 22, category: "10k", size: "M" }
    ];
    setRunners(simulatedBatch);
  };

  const handleBulkSubmit = (e) => {
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

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (err) {}

    const newBatchId = `BATCH-RP-${Date.now().toString().slice(-5)}`;
    setBatchId(newBatchId);

    const generated = runners.map((r, i) => {
      const bib = `RJ-${r.category.toUpperCase()}-B${String(i + 1).padStart(3, '0')}`;
      const certId = `RPM-2026-BULK-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        id: `REG-BULK-${Date.now()}-${i}`,
        bibNumber: bib,
        certificateId: certId,
        fullName: r.name,
        gender: r.gender,
        age: parseInt(r.age) || 22,
        mobile: nodalPhone,
        email: nodalEmail || `${r.name.toLowerCase().replace(/\s+/g, '')}@institute.ac.in`,
        category: r.category,
        categoryName: RACE_CATEGORIES.find(c => c.id === r.category)?.name || "5 KM Community Run",
        venueType: "jaipur",
        districtName: RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === selectedDistrict)?.name || "Jaipur Flagship",
        runnerType: instType === "police_unit" ? "Police Personnel / Trainee" : "Student / Youth",
        tshirtSize: r.size,
        emergencyContact: `${nodalOfficer || 'Nodal Officer'} (${nodalPhone})`,
        registeredAt: new Date().toLocaleString(),
        bibCollected: false,
        isCompleted: true,
        finishTime: r.category === "21k" ? "01:52:10" : r.category === "10k" ? "00:44:30" : "00:25:50",
        chipTime: r.category === "21k" ? "01:51:45" : r.category === "10k" ? "00:44:10" : "00:25:35",
        overallRank: `${i + 1} / 3100`,
        genderRank: `${i + 1} / 1200`,
        avgPace: "5:15 min/km",
        pledgeTaken: true,
        deliveryStatus: { sms: "Delivered", whatsapp: "Delivered", email: "Delivered" },
        institutionName: instName
      };
    });

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
                      onChange={(e) => setSelectedDistrict(e.target.value)}
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

                  <button
                    type="button"
                    onClick={handleSimulatedCSVUpload}
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #10b981',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Upload size={13} /> एक्सेल अपलोड सिमुलेट करें (15 कैडेट्स)
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
                      <th style={{ padding: '8px 10px', width: '100px' }}>टी-शर्ट</th>
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
                className="btn-glass-primary btn-glass-register"
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
                      <div style={{ color: 'var(--text-muted)' }}>{g.categoryName} • Size: {g.tshirtSize}</div>
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
