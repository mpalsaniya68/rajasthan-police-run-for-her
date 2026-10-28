import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, HeartPulse, ArrowLeft, Share2, 
  Check, Printer
} from 'lucide-react';
import { RACE_CATEGORIES, RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';
import { PoliceEmblem, StateEmblemOfIndia } from './Emblems';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { apiRegister } from '../services/api';

export function RegistrationPage({ initialCategory = "21k", initialDistrict = "JPR-COMM", onNavigate, onRegisterSuccess }) {
  const [venueType, setVenueType] = useState(() => (initialDistrict && initialDistrict !== "JPR-COMM" && initialDistrict !== "jaipur_comm") ? "district" : "jaipur");
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict || "JPR-COMM");
  const [category, setCategory] = useState(initialCategory);
  const [runnerType, setRunnerType] = useState("Citizen Runner");

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Female",
    age: "24",
    dob: "2002-05-15",
    mobile: "",
    email: "",
    idType: "Aadhaar",
    idNumber: "",
    bloodGroup: "B+",
    hasMedicalIssue: false,
    medicalConditions: [],
    medicalNotes: "",
    tshirtSize: "M",
    emergencyContactName: "",
    emergencyRelation: "पिता (Father)",
    emergencyContactPhone: "",
    acceptedPledge: true,
    acceptedFitness: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredParticipant, setRegisteredParticipant] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const medicalConditionOptions = [
    { id: "asthma", label: "दमा / श्वास रोग (Asthma / Respiratory)" },
    { id: "bp", label: "उच्च / निम्न रक्तचाप (High / Low BP)" },
    { id: "diabetes", label: "मधुमेह (Diabetes)" },
    { id: "cardiac", label: "हृदय संबंधी समस्या (Cardiovascular)" },
    { id: "ortho", label: "हड्डी / जोड़ों / रीढ़ की समस्या (Orthopaedic)" },
    { id: "other", label: "अन्य स्वास्थ्य स्थिति (Other Condition)" }
  ];

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Generate QR code on success
  useEffect(() => {
    if (isSuccess && registeredParticipant) {
      const qrPayload = JSON.stringify({
        org: "Rajasthan Police Marathon 2026",
        motto: "Run for Her - Women Safety",
        bib: registeredParticipant.bibNumber,
        certId: registeredParticipant.certificateId,
        name: registeredParticipant.fullName,
        category: registeredParticipant.categoryName,
        district: registeredParticipant.districtName,
        bloodGroup: registeredParticipant.bloodGroup,
        medicalAlert: registeredParticipant.medicalCondition || "None",
        status: "OFFICIAL_POLICE_EPASS_CONFIRMED"
      });

      QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: { dark: '#0a1c3d', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error("QR Code Error:", err));
    }
  }, [isSuccess, registeredParticipant]);

  const currentCatObj = RACE_CATEGORIES.find(c => c.id === category) || RACE_CATEGORIES[0];
  const currentDistrictObj = RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === selectedDistrict) || RAJASTHAN_POLICE_DISTRICTS[0];

  const handleConditionToggle = (label) => {
    setFormData(prev => {
      const exists = prev.medicalConditions.includes(label);
      const updated = exists 
        ? prev.medicalConditions.filter(item => item !== label)
        : [...prev.medicalConditions, label];
      return { ...prev, medicalConditions: updated };
    });
  };

  const getMaskedId = (type, val) => {
    if (!val) return "XXXX-XXXX";
    const clean = val.replace(/\s+/g, "").toUpperCase();
    if (type === "Aadhaar") {
      const d = clean.replace(/\D/g, "");
      return d.length >= 4 ? `XXXX-XXXX-${d.slice(-4)}` : "XXXX-XXXX-XXXX";
    }
    return clean.length >= 4 ? `XXXXXX${clean.slice(-4)}` : "XXXXXXXXXX";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("कृपया अपना पूरा नाम दर्ज करें।");
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      alert("कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (नंबर 6, 7, 8 या 9 से शुरू होना आवश्यक है)।");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      alert("कृपया वैध ईमेल पता दर्ज करें (सर्टिफिकेट एवं आधिकारिक ई-पास सीधे इसी ईमेल पर प्रेषित होंगे)।");
      return;
    }

    const cleanId = formData.idNumber.replace(/\s+/g, "").toUpperCase();
    if (!cleanId) {
      alert("कृपया अपने पहचान पत्र (Govt ID) की संख्या दर्ज करें।");
      return;
    }
    if (formData.idType === "Aadhaar") {
      const digits = cleanId.replace(/\D/g, "");
      if (digits.length !== 12) {
        alert("कृपया वैध 12-अंकीय आधार कार्ड संख्या दर्ज करें।");
        return;
      }
    } else if (formData.idType === "PAN") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanId)) {
        alert("कृपया वैध 10-अक्षरीय पैन कार्ड संख्या दर्ज करें (उदा. ABCDE1234F)।");
        return;
      }
    } else if (formData.idType === "Voter ID") {
      if (cleanId.length < 8 || cleanId.length > 16) {
        alert("कृपया वैध मतदाता पहचान पत्र (Voter ID) संख्या दर्ज करें।");
        return;
      }
    }

    const cleanEmergency = (formData.emergencyContactPhone || formData.mobile).replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanEmergency)) {
      alert("कृपया वैध 10-अंकीय आपातकालीन मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)।");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const calculatedDob = formData.dob || `${2026 - (parseInt(formData.age) || 25)}-01-01`;
    const selectedDistId = venueType === "jaipur" ? "jaipur_comm" : (selectedDistrict || "jaipur_comm").toLowerCase().replace(/-/g, '_');
    const medicalCondSummary = formData.hasMedicalIssue ? formData.medicalConditions.join(", ") : "None / Fully Fit";

    const payload = {
      fullName: formData.fullName.trim(),
      gender: formData.gender ? formData.gender.toLowerCase() : "female",
      dob: calculatedDob,
      mobile: cleanMobile,
      email: formData.email.trim(),
      emergencyContact: cleanEmergency,
      emergencyRelation: formData.emergencyRelation?.trim() || "अभिभावक (Guardian)",
      bloodGroup: formData.bloodGroup || "B+",
      hasMedicalIssue: formData.hasMedicalIssue,
      medicalCondition: medicalCondSummary,
      medicalNotes: formData.medicalNotes?.trim() || "",
      categoryId: category,
      districtId: selectedDistId,
      tshirtSize: formData.tshirtSize || "M",
      idType: formData.idType,
      idNumber: cleanId,
      idLast4: cleanId.slice(-4)
    };

    const res = await apiRegister(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "पंजीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।");
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    const p = res.participant;
    const maskedIdVal = p.idMasked || getMaskedId(formData.idType, cleanId);
    const fullRecord = {
      id: p.id,
      bibNumber: p.bibNumber,
      certificateId: p.certificateId,
      fullName: p.fullName,
      gender: p.gender,
      age: parseInt(formData.age) || 24,
      mobile: formData.mobile,
      email: formData.email.trim(),
      idType: formData.idType,
      idMasked: maskedIdVal,
      idRaw: cleanId,
      bloodGroup: p.bloodGroup || formData.bloodGroup,
      medicalCondition: p.medicalCondition,
      medicalNotes: p.medicalNotes,
      category: category,
      categoryName: p.categoryName || currentCatObj.name,
      venueType: venueType,
      districtName: p.districtName || (venueType === "jaipur" ? "जयपुर पुलिस कमिश्नरेट (Albert Hall Flagship)" : currentDistrictObj.name),
      runnerType: runnerType,
      tshirtSize: formData.tshirtSize,
      emergencyContact: `${formData.emergencyContactName || 'Family'} (${formData.emergencyRelation || 'Kin'}: ${cleanEmergency})`,
      registeredAt: new Date().toLocaleString(),
      bibCollected: false,
      isCompleted: false,
      pledgeTaken: true
    };

    try {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 } });
    } catch (err) {}

    setRegisteredParticipant(fullRecord);
    if (onRegisterSuccess) {
      onRegisterSuccess(fullRecord);
    }
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareWhatsApp = () => {
    if (!registeredParticipant) return;
    const text = encodeURIComponent(
      `🏃‍♀️ मैंने राजस्थान पुलिस मैराथन 2026 'RUN FOR HER' में आधिकारिक पंजीकरण कर लिया है!\n\n` +
      `🏅 धावक: ${registeredParticipant.fullName}\n` +
      `🎽 बिब नंबर: ${registeredParticipant.bibNumber}\n` +
      `🎯 श्रेणी: ${registeredParticipant.categoryName}\n` +
      `📍 स्थान: ${registeredParticipant.districtName}\n` +
      `📅 तिथि: 20 दिसंबर 2026, प्रातः 06:00 बजे\n\n` +
      `हर कदम नारी सुरक्षा और सम्मान के लिए! आप भी निःशुल्क रजिस्टर करें:\nhttps://police.rajasthan.gov.in/marathon2026`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* 1. Official Government Header Breadcrumb */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--police-navy-800)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
            >
              <ArrowLeft size={16} /> मुख्य पृष्ठ
            </button>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>
              आधिकारिक ऑनलाइन धावक पंजीकरण (Run for Her 2026)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-gold">
              ★ 100% निःशुल्क सार्वजनिक पंजीकरण ★
            </span>
            <span className="badge-gov d-tablet-inline">
              🔒 SSL 256-Bit एनक्रिप्टेड
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '960px', marginTop: '28px' }}>
        
        {/* SUCCESS STATE: OFFICIAL DIGITAL E-PASS & BIB CARD */}
        {isSuccess && registeredParticipant ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid var(--police-gold-500)',
            boxShadow: '0 20px 40px rgba(10, 28, 61, 0.12)',
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Success Top Banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
              color: '#ffffff',
              padding: '28px 24px',
              textAlign: 'center',
              borderBottom: '4px solid var(--police-gold-500)',
              position: 'relative'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid #22c55e',
                color: '#4ade80',
                marginBottom: '12px'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', margin: '0 0 6px 0', color: '#fef08a', fontWeight: 900 }}>
                पंजीकरण सफलतापूर्वक पूर्ण हुआ!
              </h2>
              <div style={{ fontSize: '0.94rem', color: '#e2e8f0' }}>
                राजस्थान पुलिस मैराथन 2026 • <strong>Run for Her</strong> में आपका आधिकारिक ई-पास जारी किया गया है।
              </div>
            </div>

            <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
              
              {/* Printable Official Police Runner Bib Card */}
              <div className="print-pass-card" style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)',
                border: '3px solid var(--police-navy-900)',
                borderRadius: '14px',
                padding: '24px',
                position: 'relative',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '28px'
              }}>
                {/* Bib Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--police-gold-500)', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PoliceEmblem size={48} />
                    <div>
                      <div style={{ fontWeight: 900, color: 'var(--police-navy-900)', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                        RAJASTHAN POLICE MARATHON 2026
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--crimson-600)', fontWeight: 800 }}>
                        ★ RUN FOR HER • OFFICIAL ENTRY PASS ★
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StateEmblemOfIndia size={40} />
                  </div>
                </div>

                {/* Bib Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Left: Huge Bib Number & Category */}
                  <div style={{ textAlign: 'center', background: 'var(--police-navy-50)', padding: '20px', borderRadius: '12px', border: '1.5px dashed var(--police-navy-800)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                      आधिकारिक छाती बिब संख्या (Bib Number)
                    </div>
                    <div style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--police-navy-950)', letterSpacing: '2px', margin: '6px 0' }}>
                      {registeredParticipant.bibNumber}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--police-navy-900)',
                      color: 'var(--police-gold-400)',
                      padding: '4px 14px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.86rem'
                    }}>
                      {registeredParticipant.categoryName}
                    </div>
                  </div>

                  {/* Middle: Runner Identity & Medical Badge */}
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>धावक का नाम (Full Name)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{registeredParticipant.fullName}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>रक्त समूह (Blood Group)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--crimson-600)' }}>
                          🩸 {registeredParticipant.bloodGroup || 'B+'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>टी-शर्ट साइज़</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                          Size {registeredParticipant.tshirtSize}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>आयोजन स्थल (Reporting Venue)</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--police-navy-800)' }}>
                        📍 {registeredParticipant.districtName}
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', background: 'var(--police-navy-50)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.76rem', color: 'var(--police-navy-900)', border: '1px solid var(--border-subtle)' }}>
                      <div><strong>पहचान पत्र (Govt ID):</strong> {registeredParticipant.idType || 'Aadhaar'} ({registeredParticipant.idMasked || 'XXXX-XXXX-1234'})</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}><strong>आधिकारिक ईमेल:</strong> {registeredParticipant.email}</div>
                    </div>

                    {registeredParticipant.medicalCondition && registeredParticipant.medicalCondition !== "None / Fully Fit" && (
                      <div style={{
                        marginTop: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: '#991b1b',
                        fontWeight: 700
                      }}>
                        ⚠️ मेडिकल अलर्ट: {registeredParticipant.medicalCondition}
                      </div>
                    )}
                  </div>

                  {/* Right: Security QR Code for Gate Scanner */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px',
                      background: '#ffffff',
                      border: '2px solid var(--police-gold-500)',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="Security Entry QR Token" style={{ width: '130px', height: '130px', display: 'block' }} />
                      ) : (
                        <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                          QR कोड लोड हो रहा है...
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '6px' }}>
                      गेट नंबर 2 पर स्कैन हेतु
                    </div>
                  </div>
                </div>

                {/* Bib Footer Callout */}
                <div style={{
                  marginTop: '18px',
                  paddingTop: '12px',
                  borderTop: '1px dashed var(--border-medium)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)'
                }}>
                  <div>
                    <strong>प्रमाण पत्र आईडी:</strong> {registeredParticipant.certificateId}
                  </div>
                  <div>
                    <strong>रिपोर्टिंग समय:</strong> 20 दिसंबर 2026, प्रातः 05:00 बजे
                  </div>
                  <div style={{ color: 'var(--police-gold-700)', fontWeight: 800 }}>
                    ★ सेवार्थ कटिबद्धता ★
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-glass-primary"
                  style={{ padding: '12px 24px', fontSize: '0.94rem' }}
                >
                  <Printer size={18} /> ई-पास प्रिंट / डाउनलोड करें
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Share2 size={18} /> व्हाट्सएप पर शेयर करें
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('live-tracker')}
                  className="btn-glass-navy"
                  style={{ padding: '12px 24px', fontSize: '0.94rem' }}
                >
                  लाइव कोर्स ट्रैकर देखें &rarr;
                </button>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setRegisteredParticipant(null);
                    setFormData(prev => ({
                      ...prev,
                      fullName: "",
                      mobile: "",
                      email: "",
                      hasMedicalIssue: false,
                      medicalConditions: [],
                      medicalNotes: ""
                    }));
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-body)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + अन्य व्यक्ति का नया पंजीकरण करें
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* REGISTRATION FORM (NORMAL FULL PAGE) */
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            
            {/* Form Top Branding Banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
              color: '#ffffff',
              padding: '28px 24px',
              borderBottom: '3px solid var(--police-gold-500)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <PoliceEmblem size={52} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--police-gold-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    राजस्थान पुलिस स्थापना दिवस विशेष महा-आयोजन • 20 दिसंबर 2026
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.35rem, 2.6vw, 1.85rem)', margin: '4px 0', color: '#ffffff', fontWeight: 900 }}>
                    ऑनलाइन धावक पंजीकरण पोर्टल (Run for Her)
                  </h1>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                    हर कदम नारी सुरक्षा, सम्मान व सशक्तिकरण के लिए • निःशुल्क ई-पास एवं आरएफआईडी बिब
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }} className="d-tablet-block">
                <span className="badge-gold">
                  ★ निःशुल्क सहभागिता ★
                </span>
                <div style={{ fontSize: '0.72rem', color: '#fef08a', marginTop: '4px', fontWeight: 700 }}>
                  10,000+ नागरिक धावक जयपुर में
                </div>
              </div>
            </div>

            {/* Error Callout if any */}
            {errorMessage && (
              <div style={{
                background: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                padding: '14px 20px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.92rem',
                fontWeight: 700
              }}>
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ padding: 'clamp(20px, 3.5vw, 36px)' }}>
              
              {/* SECTION 1: दौड़ श्रेणी एवं स्थान चयन (CATEGORY & VENUE) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid var(--police-navy-50)', paddingBottom: '8px' }}>
                  <span style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>1</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                    दौड़ श्रेणी एवं आयोजन स्थल चुनें (Race Category & Venue)
                  </h3>
                </div>

                {/* Venue Toggle */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                    आप कहाँ दौड़ना चाहते हैं? (Select Participation Location):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    <div 
                      onClick={() => setVenueType("jaipur")}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: venueType === "jaipur" ? '2px solid var(--police-gold-500)' : '1px solid var(--border-subtle)',
                        background: venueType === "jaipur" ? 'var(--police-navy-50)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="venueType" 
                        checked={venueType === "jaipur"} 
                        onChange={() => setVenueType("jaipur")} 
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--police-navy-900)', fontSize: '0.94rem' }}>
                          🏛️ जयपुर मुख्य फ्लैगशिप रन (Albert Hall)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          अल्बर्ट हॉल से जेएलएन मार्ग • डीजीपी राजस्थान द्वारा फ्लैग-ऑफ
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setVenueType("district")}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: venueType === "district" ? '2px solid var(--police-gold-500)' : '1px solid var(--border-subtle)',
                        background: venueType === "district" ? 'var(--police-navy-50)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="venueType" 
                        checked={venueType === "district"} 
                        onChange={() => setVenueType("district")} 
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--police-navy-900)', fontSize: '0.94rem' }}>
                          🚩 अन्य जिला पुलिस लाइन ({RAJASTHAN_POLICE_DISTRICTS.length} जिले)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          अपने स्थानीय ज़िला मुख्यालय / पुलिस लाइन में एक साथ रन
                        </div>
                      </div>
                    </div>
                  </div>

                  {venueType === "district" && (
                    <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                        अपना जिला / पुलिस यूनिट चुनें:
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="form-control"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                      >
                        {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} • {d.zone} ज़ोन ({d.flagOffVenue})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Race Category Cards Grid */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                    दौड़ श्रेणी चुनें (Select Race Distance):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {RACE_CATEGORIES.map(cat => {
                      const isSelected = category === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: isSelected ? `2.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(10, 28, 61, 0.03)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                            position: 'relative',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: cat.color,
                              color: '#ffffff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: cat.color, textTransform: 'uppercase' }}>
                              {cat.distance}
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.02rem', color: 'var(--police-navy-950)', margin: '4px 0' }}>
                              {cat.name}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                              {cat.desc}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: cat.timingChip ? '#ecfdf5' : '#f1f5f9',
                            color: cat.timingChip ? '#065f46' : 'var(--text-muted)',
                            display: 'inline-block'
                          }}>
                            {cat.timingChip ? '⏱️ RFID टाइमिंग चिप युक्त' : '🎗️ कम्युनिटी रन'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: व्यक्तिगत विवरण (PERSONAL DETAILS) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid var(--police-navy-50)', paddingBottom: '8px' }}>
                  <span style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>2</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                    धावक का व्यक्तिगत विवरण (Runner Personal Information)
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      पूरा नाम (Full Name) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. सुनीता चौधरी (Sunita Choudhary)"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      लिंग (Gender) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="Female">महिला (Female) - Run for Her Lead</option>
                      <option value="Male">पुरुष (Male) - He for She Ally</option>
                      <option value="Other">अन्य (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      10-अंकीय मोबाइल नंबर (6, 7, 8 या 9 से शुरू) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="उदा. 9829012345"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: formData.mobile && !/^[6-9]/.test(formData.mobile) ? '1.5px solid #dc2626' : '1px solid var(--border-medium)',
                        fontSize: '0.92rem'
                      }}
                    />
                    {formData.mobile && !/^[6-9]/.test(formData.mobile) ? (
                      <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 700 }}>
                        ⚠️ भारतीय मोबाइल नंबर केवल 6, 7, 8 या 9 से शुरू होना चाहिए।
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        ई-पास और टाइमिंग एसएमएस सीधे इसी नंबर व व्हाट्सएप पर भेजे जाएंगे।
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आयु (वर्ष) / जन्म तिथि:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        min={8}
                        max={85}
                        placeholder="आयु (उदा. 24)"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                      />
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आधिकारिक ईमेल पता (Email Address) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="उदा. runner@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      आधिकारिक ई-प्रमाण पत्र एवं ई-पास सीधे इसी ईमेल पर प्रेषित किए जाएंगे।
                    </div>
                  </div>

                  {/* Photo ID Proof Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      पहचान पत्र प्रकार (Govt Photo ID Proof) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <select
                      value={formData.idType}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value, idNumber: "" })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="Aadhaar">आधार कार्ड (Aadhaar Card - 12 अंकीय)</option>
                      <option value="PAN">पैन कार्ड (PAN Card - 10 अंकीय)</option>
                      <option value="Voter ID">मतदाता पहचान पत्र (Voter ID / EPIC)</option>
                    </select>
                  </div>

                  {/* Photo ID Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      {formData.idType === "Aadhaar" ? "12-अंकीय आधार कार्ड संख्या" : formData.idType === "PAN" ? "10-अक्षरीय पैन संख्या (उदा. ABCDE1234F)" : "मतदाता पहचान पत्र संख्या"} <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={formData.idType === "Aadhaar" ? 14 : 16}
                      placeholder={formData.idType === "Aadhaar" ? "उदा. 4920 1928 1048" : formData.idType === "PAN" ? "उदा. ABCDE1234F" : "उदा. RJ01234567"}
                      value={formData.idNumber}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (formData.idType === "Aadhaar") {
                          val = val.replace(/\D/g, '').slice(0, 12);
                        } else {
                          val = val.toUpperCase().trim();
                        }
                        setFormData({ ...formData, idNumber: val });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem', fontFamily: 'monospace' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🔒</span>
                      <span>संवेदनशील डेटा सुरक्षा: डेटाबेस में केवल मास्क प्रारूप ({formData.idType === 'Aadhaar' ? 'XXXX-XXXX-1234' : 'XXXXXX1234'}) सुरक्षित रहेगा।</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      धावक वर्गीकरण (Runner Classification):
                    </label>
                    <select
                      value={runnerType}
                      onChange={(e) => setRunnerType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="Citizen Runner">सामान्य नागरिक धावक (Citizen)</option>
                      <option value="Police Officer / Personnel">राजस्थान पुलिस कर्मी / अधिकारी (Police Personnel)</option>
                      <option value="College / School Student">छात्र / युवा धावक (Student)</option>
                      <option value="NCC / NSS / Scouts Cadet">NCC / NSS / स्काउट्स कैडेट</option>
                      <option value="Corporate / NGO Runner">संस्थागत / कॉर्पोरेट धावक</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      टी-शर्ट साइज़ (Official Dry-Fit Tee) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <select
                      value={formData.tshirtSize}
                      onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="XS">XS (Chest 34")</option>
                      <option value="S">S (Chest 36")</option>
                      <option value="M">M (Chest 38" - Standard)</option>
                      <option value="L">L (Chest 40")</option>
                      <option value="XL">XL (Chest 42")</option>
                      <option value="XXL">XXL (Chest 44")</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: स्वास्थ्य, रक्त समूह एवं पूर्व बीमारी विवरण (HEALTH & MEDICAL DECLARATION - USER REQUEST) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid var(--police-navy-50)', paddingBottom: '8px' }}>
                  <span style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>3</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                      स्वास्थ्य, रक्त समूह एवं आपातकालीन विवरण (Medical & Emergency Safety)
                    </h3>
                    <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      चिकित्सा सुरक्षा अनिवार्य
                    </span>
                  </div>
                </div>

                {/* Blood Group Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                    रक्त समूह (Blood Group) <span style={{ color: '#ef4444' }}>*</span>:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {bloodGroupOptions.map(bg => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: formData.bloodGroup === bg ? '2px solid #dc2626' : '1px solid var(--border-medium)',
                          background: formData.bloodGroup === bg ? '#fef2f2' : '#ffffff',
                          color: formData.bloodGroup === bg ? '#991b1b' : 'var(--text-body)',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ color: '#dc2626' }}>🩸</span> {bg}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    * यह जानकारी आपातकालीन स्थिति में 108 एम्बुलेंस और ऑन-ट्रैक मेडिकल टीम के लिए अनिवार्य है।
                  </div>
                </div>

                {/* Pre-existing Medical Condition / Illness Toggle */}
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HeartPulse size={18} color="var(--crimson-600)" />
                    <label style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                      क्या आपको पूर्व से कोई स्वास्थ्य संबंधी समस्या या बीमारी है? (Pre-existing Health Condition):
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: '#16a34a' }}>
                      <input
                        type="radio"
                        name="hasMedicalIssue"
                        checked={!formData.hasMedicalIssue}
                        onChange={() => setFormData({ ...formData, hasMedicalIssue: false, medicalConditions: [], medicalNotes: "" })}
                      />
                      नहीं, मैं पूर्णतः स्वस्थ एवं फिट हूँ (No Condition / Fully Fit)
                    </label>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: '#dc2626' }}>
                      <input
                        type="radio"
                        name="hasMedicalIssue"
                        checked={formData.hasMedicalIssue}
                        onChange={() => setFormData({ ...formData, hasMedicalIssue: true })}
                      />
                      हाँ, मुझे पूर्व स्वास्थ्य स्थिति है (Yes, I have a condition)
                    </label>
                  </div>

                  {formData.hasMedicalIssue && (
                    <div style={{
                      marginTop: '12px',
                      padding: '16px',
                      background: '#ffffff',
                      border: '1.5px solid #fecaca',
                      borderRadius: '8px',
                      animation: 'fadeIn 0.2s ease-in'
                    }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#991b1b', marginBottom: '10px' }}>
                        लागू होने वाली स्वास्थ्य स्थितियों पर टिक करें (Select all that apply):
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                        {medicalConditionOptions.map(opt => {
                          const isChecked = formData.medicalConditions.includes(opt.label);
                          return (
                            <label
                              key={opt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: isChecked ? '1.5px solid #dc2626' : '1px solid var(--border-medium)',
                                background: isChecked ? '#fef2f2' : '#ffffff',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: isChecked ? 800 : 600,
                                color: isChecked ? '#991b1b' : 'var(--text-body)'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleConditionToggle(opt.label)}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                          विशेष चिकित्सकीय निर्देश / दवा विवरण (Medical Notes / Allergies / Inhaler Details):
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. दमा हेतु इनहेलर हमेशा साथ रहता है / पेनिसिलिन से एलर्जी"
                          value={formData.medicalNotes}
                          onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Kin Contact Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आपातकालीन संपर्क व्यक्ति का नाम (Kin Name) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. रमेश चौधरी (पिता)"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      संबंध (Relationship):
                    </label>
                    <select
                      value={formData.emergencyRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="पिता (Father)">पिता (Father)</option>
                      <option value="माता (Mother)">माता (Mother)</option>
                      <option value="पति/पत्नी (Spouse)">पति / पत्नी (Spouse)</option>
                      <option value="भाई/बहन (Sibling)">भाई / बहन (Sibling)</option>
                      <option value="अभिभावक/मित्र (Guardian/Friend)">अभिभावक / मित्र (Guardian / Friend)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आपातकालीन 10-अंकीय मोबाइल नंबर <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="उदा. 9829099887"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '') })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: महिला सुरक्षा महा-संकल्प (WOMEN SAFETY PLEDGE) */}
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                border: '1.5px solid #fdba74',
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="pledge-check"
                    checked={formData.acceptedPledge}
                    onChange={(e) => setFormData({ ...formData, acceptedPledge: e.target.checked })}
                    style={{ marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <label htmlFor="pledge-check" style={{ fontSize: '0.88rem', color: '#7c2d12', lineHeight: 1.6, cursor: 'pointer' }}>
                    <strong>महिला सुरक्षा व सम्मान महा-संकल्प:</strong> मैं राजस्थान पुलिस के 'Run for Her' अभियान से जुड़कर यह संकल्प लेता/लेती हूँ कि मैं समाज में प्रत्येक महिला, बेटी और बहन के सम्मान, गरिमा एवं भयमुक्त वातावरण के निर्माण के लिए सदैव तत्पर रहूँगा/रहूँगी।
                  </label>
                </div>
              </div>

              {/* Submit CTA Bar */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glass-primary"
                  style={{
                    padding: '16px 36px',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    width: '100%',
                    maxWidth: '480px',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  {isSubmitting ? (
                    <span>पंजीकरण दर्ज हो रहा है... कृपया प्रतीक्षा करें</span>
                  ) : (
                    <span>🚀 निःशुल्क पंजीकरण पूर्ण करें एवं ई-पास प्राप्त करें &rarr;</span>
                  )}
                </button>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  क्लिक करते ही राजस्थान पुलिस सर्वर द्वारा आपको अद्वितीय बिब नंबर और डिजिटल ई-पास आवंटित किया जाएगा।
                </div>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
