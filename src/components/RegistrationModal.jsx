import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Shield, Award, MapPin, User, Phone, Mail, Shirt, AlertCircle, Sparkles, Download, Share2, Send } from 'lucide-react';
import { RACE_CATEGORIES, RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';
import { PoliceEmblem, RunForHerBadge } from './Emblems';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { apiRegister } from '../services/api';

export function RegistrationModal({ isOpen, onClose, initialCategory = "21k", onRegisterSuccess }) {
  const [venueType, setVenueType] = useState("jaipur");
  const [selectedDistrict, setSelectedDistrict] = useState("JPR-COMM");
  const [category, setCategory] = useState(initialCategory);
  const [runnerType, setRunnerType] = useState("Citizen Runner");
  
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Female",
    age: "",
    mobile: "",
    email: "",
    tshirtSize: "M",
    emergencyContactName: "",
    emergencyContactPhone: "",
    acceptedPledge: true
  });

  const [allocatedBib, setAllocatedBib] = useState("");
  const [allocatedCertId, setAllocatedCertId] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [dispatchAlert, setDispatchAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const catCode = category.toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bib = `RJ-${catCode}-${randomNum}`;
    const certId = `RPM-2026-RAJ-${randomNum}`;
    setAllocatedBib(bib);
    setAllocatedCertId(certId);

    const qrPayload = JSON.stringify({
      event: "Rajasthan Police Marathon - Run for Her",
      bib: bib,
      certId: certId,
      name: formData.fullName || "RUNNER",
      category: category,
      district: venueType === "jaipur" ? "Jaipur Flagship" : selectedDistrict,
      status: "VERIFIED_REGISTRATION"
    });

    QRCode.toDataURL(qrPayload, { width: 140, margin: 1, color: { dark: '#0a1c3d', light: '#ffffff' } })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error("QR Code Error:", err));
  }, [category, venueType, selectedDistrict, formData.fullName]);

  if (!isOpen) return null;

  const currentCatObj = RACE_CATEGORIES.find(c => c.id === category) || RACE_CATEGORIES[0];
  const currentDistrictObj = RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === selectedDistrict) || RAJASTHAN_POLICE_DISTRICTS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim()) {
      alert("कृपया अपना पूरा नाम और मोबाइल नंबर दर्ज करें।");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    const cleanEmergency = (formData.emergencyContactPhone || formData.mobile).replace(/\D/g, "");

    const payload = {
      fullName: formData.fullName.trim(),
      gender: formData.gender ? formData.gender.toLowerCase() : "female",
      dob: formData.age ? `${2026 - (parseInt(formData.age) || 25)}-01-01` : "2000-01-01",
      mobile: cleanMobile,
      emergencyContact: cleanEmergency.length === 10 ? cleanEmergency : cleanMobile,
      emergencyRelation: formData.emergencyContactName?.trim() || "अभिभावक (Guardian)",
      bloodGroup: "B+",
      categoryId: category,
      districtId: venueType === "jaipur" ? "jaipur_comm" : (selectedDistrict || "jaipur_comm").toLowerCase().replace(/-/g, '_'),
      tshirtSize: formData.tshirtSize || "M",
      idType: "Aadhaar",
      idLast4: cleanMobile.slice(-4)
    };

    const res = await apiRegister(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "पंजीकरण में त्रुटि हुई।");
      alert(res.error || "पंजीकरण में त्रुटि हुई।");
      return;
    }

    const p = res.participant;
    setAllocatedBib(p.bibNumber);
    setAllocatedCertId(p.certificateId);

    const newRecord = {
      id: p.id,
      bibNumber: p.bibNumber,
      certificateId: p.certificateId,
      fullName: p.fullName,
      gender: p.gender,
      age: parseInt(formData.age) || 24,
      mobile: formData.mobile,
      email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      category: category,
      categoryName: p.categoryName || currentCatObj.name,
      venueType: venueType,
      districtName: p.districtName || (venueType === "jaipur" ? "Jaipur Police Commissionerate (Albert Hall)" : currentDistrictObj.name),
      runnerType: runnerType,
      tshirtSize: formData.tshirtSize,
      emergencyContact: `${formData.emergencyContactName || 'Family'} (${formData.emergencyContactPhone || formData.mobile})`,
      registeredAt: new Date().toLocaleString(),
      bibCollected: false,
      isCompleted: false,
      finishTime: null,
      pledgeTaken: true,
      deliveryStatus: { sms: "Delivered", whatsapp: "Sent", email: "Delivered" }
    };

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}

    onRegisterSuccess(newRecord);
    setIsSuccess(true);
    setDispatchAlert(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Modal Header */}
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
                पंजीकरण पोर्टल • RAJASTHAN POLICE MARATHON
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--police-gold-400)' }}>
                RUN FOR HER • Free Public Registration & e-Pass
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
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          {!isSuccess ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
              gap: '24px'
            }} className="responsive-reg-grid">
              {/* Form Side */}
              <div>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Venue Selection */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      1. स्थान चुनें (Select Event Venue)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setVenueType("jaipur")}
                        style={{
                          padding: '10px',
                          borderRadius: '6px',
                          background: venueType === "jaipur" ? 'var(--crimson-50)' : '#ffffff',
                          border: venueType === "jaipur" ? '2px solid var(--crimson-600)' : '1px solid var(--border-medium)',
                          color: venueType === "jaipur" ? 'var(--crimson-600)' : 'var(--text-body)',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>जयपुर फ्लैगशिप</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>अल्बर्ट हॉल म्यूजियम</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVenueType("district")}
                        style={{
                          padding: '10px',
                          borderRadius: '6px',
                          background: venueType === "district" ? 'var(--police-gold-100)' : '#ffffff',
                          border: venueType === "district" ? '2px solid var(--police-gold-600)' : '1px solid var(--border-medium)',
                          color: venueType === "district" ? 'var(--police-gold-700)' : 'var(--text-body)',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>मेरा पुलिस जिला</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>50 जिलों में से चुनें</div>
                      </button>
                    </div>

                    {venueType === "district" && (
                      <div style={{ marginTop: '8px' }}>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px',
                            background: '#ffffff',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text-body)',
                            borderRadius: '6px',
                            fontSize: '0.88rem'
                          }}
                        >
                          {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.zone} Zone)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Race Category */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      2. रेस कैटेगरी (Choose Race Category)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px' }}>
                      {RACE_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '6px',
                            background: category === cat.id ? 'var(--police-navy-800)' : '#ffffff',
                            border: category === cat.id ? '2px solid var(--police-navy-800)' : '1px solid var(--border-medium)',
                            color: category === cat.id ? '#ffffff' : 'var(--text-body)',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{cat.name.split(' ')[0]} {cat.name.split(' ')[1]}</div>
                          <div style={{ fontSize: '0.68rem', color: category === cat.id ? 'var(--police-gold-400)' : cat.color, fontWeight: 700 }}>{cat.badge}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Runner Identity */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      3. प्रतिभागी वर्ग (Profile)
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {["Citizen Runner", "Student / Youth", "Police Personnel", "CLG Member"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setRunnerType(type)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: runnerType === type ? 'var(--crimson-600)' : 'var(--police-navy-50)',
                            color: runnerType === type ? '#ffffff' : 'var(--text-body)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 4: Personal Details */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      4. व्यक्तिगत जानकारी (Personal & Contact)
                    </label>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="पूरा नाम (Full Name) *"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#ffffff',
                          border: '1px solid var(--border-strong)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem'
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="मोबाइल नंबर (Mobile) *"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#ffffff',
                          border: '1px solid var(--border-strong)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                      >
                        <option value="Female">महिला (Female)</option>
                        <option value="Male">पुरुष (Male)</option>
                        <option value="Other">अन्य (Other)</option>
                      </select>

                      <input
                        type="number"
                        placeholder="आयु (Age)"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                      />

                      <select
                        value={formData.tshirtSize}
                        onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                      >
                        <option value="XS">T-Shirt: XS</option>
                        <option value="S">T-Shirt: S</option>
                        <option value="M">T-Shirt: M</option>
                        <option value="L">T-Shirt: L</option>
                        <option value="XL">T-Shirt: XL</option>
                        <option value="XXL">T-Shirt: XXL</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      <input
                        type="email"
                        placeholder="ईमेल (Email for Certificate)"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                      />
                      <input
                        type="text"
                        placeholder="आपातकालीन संपर्क (Emergency Contact)"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Pledge Confirmation Checkbox */}
                  <div style={{
                    background: 'var(--crimson-50)',
                    border: '1px solid rgba(201, 24, 74, 0.25)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <input
                      type="checkbox"
                      id="pledge-agree"
                      checked={formData.acceptedPledge}
                      onChange={(e) => setFormData({ ...formData, acceptedPledge: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--crimson-600)', flexShrink: 0 }}
                    />
                    <label htmlFor="pledge-agree" style={{ fontSize: '0.8rem', color: 'var(--text-body)', cursor: 'pointer', lineHeight: 1.4 }}>
                      मैं <strong>महिला सुरक्षा संकल्प</strong> लेता/लेती हूँ और घोषणा करता/करती हूँ कि मैं स्वास्थ्य की दृष्टि से पूर्णतः स्वस्थ हूँ।
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-glass-primary btn-glass-register"
                    style={{ width: '100%', padding: '13px', fontSize: '1rem', justifyContent: 'center' }}
                  >
                    <CheckCircle size={18} /> पंजीकरण पूर्ण करें एवं बिब ई-पास प्राप्त करें
                  </button>
                </form>
              </div>

              {/* Live Digital Bib Preview (Responsive) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Live Official Bib Preview
                </div>

                {/* The Virtual Marathon Bib Card */}
                <div style={{
                  background: '#ffffff',
                  color: '#0a1c3d',
                  borderRadius: '12px',
                  padding: '14px',
                  width: '100%',
                  maxWidth: '300px',
                  boxShadow: 'var(--shadow-md)',
                  border: '3px solid var(--police-gold-500)',
                  position: 'relative'
                }}>
                  {/* Bib Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0a1c3d', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PoliceEmblem size={24} />
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0a1c3d', lineHeight: 1.1 }}>
                        RAJASTHAN POLICE<br />MARATHON 2026
                      </div>
                    </div>
                    <div style={{ background: 'var(--crimson-600)', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      RUN FOR HER
                    </div>
                  </div>

                  {/* Big Bold Allocated Bib Number */}
                  <div style={{ textAlign: 'center', padding: '14px 0 8px 0' }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.8rem, 4vw, 2.3rem)',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      color: 'var(--police-navy-900)',
                      lineHeight: 1
                    }}>
                      {allocatedBib}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '3px' }}>
                      RFID ELECTRONIC TIMED RUNNER
                    </div>
                  </div>

                  {/* Runner Name on Bib */}
                  <div style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    padding: '6px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '10px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {formData.fullName || "YOUR NAME"}
                  </div>

                  {/* Bib Footer with Category, District & QR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-medium)', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: currentCatObj.color }}>
                        {currentCatObj.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {venueType === "jaipur" ? "Jaipur Flagship" : currentDistrictObj.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 700 }}>
                        Size: {formData.tshirtSize} • {runnerType}
                      </div>
                    </div>

                    {qrCodeDataUrl && (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Security QR" 
                        style={{ width: '50px', height: '50px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }} 
                      />
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                  🛡️ एक्सपो में किट प्राप्ति हेतु डिजिटल पास मान्य है।
                </div>
              </div>
            </div>
          ) : (
            /* Confirmation & Success Screen */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <CheckCircle size={32} />
              </div>

              <h3 style={{ fontSize: '1.6rem', color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                पंजीकरण सफलतापूर्वक पूर्ण हुआ!
              </h3>
              <p style={{ color: 'var(--text-body)', maxWidth: '540px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
                बधाई हो, <strong style={{ color: 'var(--police-navy-900)' }}>{formData.fullName}</strong>! आपका <strong style={{ color: currentCatObj.color }}>{currentCatObj.name}</strong> में पंजीयन हो चुका है।
              </p>

              {/* Simulated Dispatch Alert */}
              {dispatchAlert && (
                <div style={{
                  background: 'var(--police-navy-50)',
                  border: '1px solid var(--police-navy-800)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  maxWidth: '560px',
                  margin: '0 auto 20px auto',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Send size={20} color="var(--police-navy-800)" />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--police-navy-800)', fontSize: '0.85rem' }}>
                      ई-पास एवं एसएमएस स्वतः प्रेषित किया गया!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      कन्फर्मेशन लिंक <strong>{formData.mobile}</strong> एवं <strong>{formData.email}</strong> पर भेजा जा चुका है।
                    </div>
                  </div>
                </div>
              )}

              {/* The Official Digital e-Pass Card (Light Surface) */}
              <div style={{
                maxWidth: '480px',
                margin: '0 auto 20px auto',
                padding: '20px',
                border: '2px solid var(--police-gold-500)',
                background: '#ffffff',
                boxShadow: 'var(--shadow-md)',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-medium)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PoliceEmblem size={32} />
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--police-navy-900)', fontSize: '0.9rem' }}>RAJASTHAN POLICE</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--crimson-600)', fontWeight: 700 }}>RUN FOR HER • OFFICIAL E-PASS</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{allocatedBib}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BIB NUMBER</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PARTICIPANT NAME</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '8px' }}>{formData.fullName}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CATEGORY</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: currentCatObj.color }}>{currentCatObj.name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>T-SHIRT SIZE</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--police-navy-900)' }}>Size: {formData.tshirtSize}</div>
                      </div>
                    </div>
                  </div>

                  {qrCodeDataUrl && (
                    <div style={{ background: '#f8fafc', padding: '4px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                      <img src={qrCodeDataUrl} alt="Security QR" style={{ width: '80px', height: '80px', display: 'block' }} />
                      <div style={{ fontSize: '0.58rem', color: 'var(--police-navy-900)', fontWeight: 800, marginTop: '2px' }}>EXPO SCAN</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-gold"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  <Download size={15} /> Print / Save E-Pass
                </button>
                <button
                  onClick={() => {
                    onClose();
                    const el = document.getElementById('certificates');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  <Award size={15} /> View Certificate Preview
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .responsive-reg-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
