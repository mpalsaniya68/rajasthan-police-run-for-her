import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, KeyRound, 
  Copy, Printer, Share2, Trash2, RefreshCw, 
  Search, Filter, MapPin, Building2, Check, AlertTriangle, 
  ExternalLink, QrCode, Phone, Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { PoliceEmblem } from './Emblems';
import { EXPO_COUNTERS } from './AdminLoginPage';
import { 
  apiGetVolunteers, 
  apiCreateVolunteer, 
  apiUpdateVolunteer, 
  apiDeleteVolunteer 
} from '../services/api';

const DESIGNATION_PRESETS = [
  "कांस्टेबल (Constable)",
  "हेड कांस्टेबल (Head Constable)",
  "सहायक उप निरीक्षक (ASI)",
  "महिला सुरक्षा दल (Nirbhaya Squad)",
  "आरएसी बटालियन (RAC Staff)",
  "एनसीसी कैडेट (NCC Senior Cadet)",
  "होमगार्ड स्वयंसेवक (Home Guard)",
  "सिविल डिफेंस वॉलंटियर (Civil Defense)",
  "नागरिक स्वयंसेवक (Citizen Volunteer)",
  "आईटी व तकनीकी सपोर्ट (IT Desk)"
];

export function VolunteerRosterManager() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "counter" | "gate" | "active"
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Add Volunteer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [newVol, setNewVol] = useState({
    fullName: "",
    designation: DESIGNATION_PRESETS[0],
    customDesignation: "",
    mobile: "",
    stationType: "counter",
    counterId: "counter_01",
    username: "",
    password: ""
  });

  // Duty Pass Modal
  const [selectedSlipVol, setSelectedSlipVol] = useState(null);
  const [slipQrUrl, setSlipQrUrl] = useState("");

  // Load volunteers on mount
  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetVolunteers();
      if (res && res.success) {
        setVolunteers(res.volunteers || []);
      }
    } catch (err) {
      console.error("Failed to load volunteers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate username when name or mobile changes in form
  const handleNameChange = (name) => {
    setNewVol(prev => {
      const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
      const suffix = prev.mobile ? prev.mobile.slice(-4) : Math.floor(100 + Math.random() * 900);
      const autoUser = clean ? `vol_${clean}_${suffix}` : prev.username;
      return {
        ...prev,
        fullName: name,
        username: prev.username && !prev.username.startsWith("vol_") ? prev.username : autoUser
      };
    });
  };

  const handleMobileChange = (mobile) => {
    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(0, 10);
    setNewVol(prev => {
      const clean = prev.fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
      const suffix = cleanMobile ? cleanMobile.slice(-4) : Math.floor(100 + Math.random() * 900);
      const autoUser = clean ? `vol_${clean}_${suffix}` : (cleanMobile ? `vol_${cleanMobile}` : prev.username);
      return {
        ...prev,
        mobile: cleanMobile,
        username: prev.username && !prev.username.startsWith("vol_") ? prev.username : autoUser
      };
    });
  };

  // Station type change
  const handleStationTypeChange = (type) => {
    const defaultCounter = type === "gate" 
      ? (EXPO_COUNTERS.find(c => c.id.startsWith("gate_"))?.id || "gate_01")
      : (EXPO_COUNTERS.find(c => c.id.startsWith("counter_"))?.id || "counter_01");
    
    setNewVol(prev => ({
      ...prev,
      stationType: type,
      counterId: defaultCounter
    }));
  };

  // Submit registration form
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newVol.fullName.trim()) {
      setFormError("कृपया वॉलंटियर / पुलिस स्टाफ का पूरा नाम दर्ज करें।");
      return;
    }
    if (!newVol.password.trim() || newVol.password.trim().length < 12) {
      setFormError("कृपया कम से कम 12 अक्षरों का मजबूत सुरक्षा पासवर्ड सेट करें।");
      return;
    }

    const counterObj = EXPO_COUNTERS.find(c => c.id === newVol.counterId) || EXPO_COUNTERS[0];
    const finalDesignation = newVol.designation === "अन्य (Custom)" 
      ? (newVol.customDesignation.trim() || "वॉलंटियर") 
      : newVol.designation;

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: newVol.fullName.trim(),
        designation: finalDesignation,
        mobile: newVol.mobile.trim(),
        username: newVol.username.trim() || `vol_${Date.now().toString(36)}`,
        password: newVol.password.trim(),
        stationType: newVol.stationType,
        counterId: newVol.counterId,
        counterName: counterObj.name
      };

      const res = await apiCreateVolunteer(payload);
      setIsSubmitting(false);

      if (res && res.success) {
        setIsAddModalOpen(false);
        setStatusMessage({
          type: "success",
          text: `✅ ${newVol.fullName} सफलतापूर्वक पंजीकृत! ड्यूटी स्टेशन: ${counterObj.name} (लॉगिन आईडी: ${payload.username})। पासवर्ड सुरक्षित रूप से अलग से साझा करें।`
        });
        
        // Reset form
        setNewVol({
          fullName: "",
          designation: DESIGNATION_PRESETS[0],
          customDesignation: "",
          mobile: "",
          stationType: "counter",
          counterId: "counter_01",
          username: "",
          password: ""
        });

        // Refresh list
        loadVolunteers();

        // Prompt to view and print duty pass
        if (res.volunteer) {
          handleOpenDutySlip(res.volunteer);
        }
      } else {
        setFormError(res?.error || "वॉलंटियर पंजीकृत करने में त्रुटि।");
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error("Create volunteer error:", err);
      setFormError("सर्वर से कनेक्ट नहीं हो सका।");
    }
  };

  // Toggle active/inactive
  const handleToggleStatus = async (vol) => {
    setActionLoadingId(vol.id);
    const targetStatus = vol.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await apiUpdateVolunteer(vol.id, { status: targetStatus });
      if (res && res.success) {
        setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, status: targetStatus } : v));
        setStatusMessage({
          type: "success",
          text: `वॉलंटियर "${vol.fullName}" की स्थिति अब "${targetStatus === 'ACTIVE' ? 'सक्रिय (Active)' : 'निष्क्रिय (Deactivated)'}" कर दी गई है।`
        });
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete volunteer
  const handleDeleteVolunteer = async (vol) => {
    const confirmDelete = window.confirm(`क्या आप वाकई वॉलंटियर "${vol.fullName}" (${vol.username}) को ड्यूटी रोस्टर से हटाना चाहते हैं?`);
    if (!confirmDelete) return;

    setActionLoadingId(vol.id);
    try {
      const res = await apiDeleteVolunteer(vol.id);
      if (res && res.success) {
        setVolunteers(prev => prev.filter(v => v.id !== vol.id));
        setStatusMessage({
          type: "success",
          text: `वॉलंटियर "${vol.fullName}" को रोस्टर से सफलतापूर्वक हटा दिया गया।`
        });
      }
    } catch (err) {
      console.error("Delete volunteer error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Duty Slip Modal and Generate QR
  const handleOpenDutySlip = (vol) => {
    setSelectedSlipVol(vol);
    const qrPayload = JSON.stringify({
      portal: "RAJASTHAN_POLICE_MARATHON_2027",
      type: "DUTY_PASS",
      username: vol.username,
      name: vol.fullName,
      stationId: vol.counterId,
      stationName: vol.counterName,
      role: vol.role
    });

    QRCode.toDataURL(qrPayload, {
      width: 200,
      margin: 1,
      color: { dark: '#0a1c3d', light: '#ffffff' }
    }).then(url => {
      setSlipQrUrl(url);
    }).catch(err => {
      console.error("Slip QR error:", err);
    });
  };

  // Trigger Print
  const handlePrintSlip = () => {
    window.print();
  };

  // Share duty details without sending passwords through messaging URLs.
  const handleShareWhatsApp = (vol) => {
    const text = `*राजस्थान पुलिस मैराथन 2027 - आधिकारिक ड्यूटी आदेश* 👮‍♂️\n\n` +
      `श्री/सुश्री: *${vol.fullName}* (${vol.designation || 'स्टाफ'})\n` +
      `आवंटित ड्यूटी स्टेशन: *${vol.counterName}*\n\n` +
      `• लॉगिन पोर्टल: https://police.rajasthan.gov.in/marathon\n` +
      `• वॉलंटियर यूजर आईडी: *${vol.username}*\n` +
      `• सुरक्षा पासवर्ड अलग सुरक्षित माध्यम से साझा किया जाएगा।\n\n` +
      `कृपया समय पर ड्यूटी स्टेशन पर रिपोर्ट करें।\n` +
      `_राज्य पुलिस मुख्यालय (PHQ), जयपुर_`;

    const encoded = encodeURIComponent(text);
    const phone = vol.mobile ? `91${vol.mobile.replace(/[^0-9]/g, "")}` : "";
    const waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered List
  const filteredVolunteers = volunteers.filter(v => {
    // Station Type Filter
    if (filterType === "counter" && v.role !== "EXPO_VOLUNTEER") return false;
    if (filterType === "gate" && v.role !== "GATE_MARSHAL") return false;
    if (filterType === "active" && v.status !== "ACTIVE") return false;

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = (v.fullName || "").toLowerCase().includes(q);
      const matchUser = (v.username || "").toLowerCase().includes(q);
      const matchMobile = (v.mobile || "").includes(q);
      const matchStation = (v.counterName || "").toLowerCase().includes(q);
      const matchDesig = (v.designation || "").toLowerCase().includes(q);
      return matchName || matchUser || matchMobile || matchStation || matchDesig;
    }
    return true;
  });

  // Summary Metrics
  const totalCount = volunteers.length;
  const activeCount = volunteers.filter(v => v.status === "ACTIVE").length;
  const counterCount = volunteers.filter(v => v.role === "EXPO_VOLUNTEER" && v.status === "ACTIVE").length;
  const gateCount = volunteers.filter(v => v.role === "GATE_MARSHAL" && v.status === "ACTIVE").length;
  const totalKitsDistributed = volunteers.reduce((acc, v) => acc + (Number(v.kitsDistributed) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header & KPI Metrics Bar */}
      <div className="gov-card" style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #0a1c3d 0%, #0f2b61 100%)',
        color: '#ffffff',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1.5px solid #d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  ड्यूटी रोस्टर एवं वॉलंटियर कमान केंद्र (Volunteer Duty Command)
                </h2>
                <span style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  letterSpacing: '0.5px'
                }}>
                  PHQ AUTHORIZED
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                एक्सपो किट वितरण काउंटरों एवं रेस डे प्रवेश द्वारों पर तैनात पुलिसकर्मियों व वॉलंटियर्स का व्यक्तिगत आईडी/पासवर्ड प्रबंधन
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={loadVolunteers}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>रिफ्रेश</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)'
              }}
            >
              <UserPlus size={16} />
              <span>➕ नया वॉलंटियर जोड़ें व ड्यूटी अलॉट करें</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>कुल पंजीकृत ड्यूटी स्टाफ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{totalCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '2px' }}>🟢 {activeCount} सक्रिय ऑन-ड्यूटी</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>📦 एक्सपो किट काउंटर्स स्टाफ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{counterCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>10 अधिकृत किट वितरण डेस्क</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>🚪 रेस डे गेट मार्शल</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{gateCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>3 मुख्य स्टेडियम प्रवेश द्वार</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>🎁 कुल वितरित किट व सत्यापन</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80', marginTop: '2px' }}>{totalKitsDistributed}</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>स्टाफ द्वारा वेरीफाईड</div>
          </div>
        </div>
      </div>

      {/* 2. Status Alert Notification */}
      {statusMessage && (
        <div style={{
          background: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1.5px solid ${statusMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="gov-card" style={{
        padding: '16px 20px',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '450px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाम, मोबाइल, यूजरनेम या काउंटर से खोजें..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1.5px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.86rem',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> फ़िल्टर:
          </span>
          {[
            { id: 'all', label: `सभी (${volunteers.length})` },
            { id: 'counter', label: `📦 एक्सपो काउंटर (${volunteers.filter(v => v.role === 'EXPO_VOLUNTEER').length})` },
            { id: 'gate', label: `🚪 गेट मार्शल (${volunteers.filter(v => v.role === 'GATE_MARSHAL').length})` },
            { id: 'active', label: `🟢 सक्रिय (${volunteers.filter(v => v.status === 'ACTIVE').length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: filterType === f.id ? 800 : 600,
                borderRadius: '6px',
                border: filterType === f.id ? '1px solid #0a1c3d' : '1px solid #cbd5e1',
                background: filterType === f.id ? '#0a1c3d' : '#f8fafc',
                color: filterType === f.id ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Volunteer Roster Table */}
      <div className="gov-card" style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
            तैनात वॉलंटियर सूची ({filteredVolunteers.length} रिकॉर्ड मिले)
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            * पासवर्ड केवल PHQ एडमिन को ड्यूटी स्लिप जारी करने हेतु दृश्यमान है।
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <div>वॉलंटियर रोस्टर लोड किया जा रहा है...</div>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>कोई वॉलंटियर रिकॉर्ड नहीं मिला</div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              फ़िल्टर बदलें या "नया वॉलंटियर जोड़ें" बटन दबाकर नई तैनाती करें।
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#334155', width: '22%' }}>नाम एवं पद / विंग</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#334155', width: '25%' }}>आवंटित ड्यूटी स्टेशन</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#334155', width: '16%' }}>लॉगिन आईडी व मोबाइल</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#334155', textAlign: 'center', width: '8%' }}>स्थिति</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#334155', textAlign: 'right', width: '14%' }}>आधिकारिक एक्शन</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map(v => {
                  const isGate = v.role === 'GATE_MARSHAL';

                  return (
                    <tr 
                      key={v.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: v.status === 'INACTIVE' ? '#fafafa' : '#ffffff',
                        opacity: v.status === 'INACTIVE' ? 0.75 : 1
                      }}
                    >
                      {/* Name & Post */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                          {v.fullName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}>
                            {v.designation || 'वॉलंटियर'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {v.districtName?.split(' ')[0] || 'जयपुर'}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Station */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: isGate ? '#fef3c7' : '#ecfdf5',
                            color: isGate ? '#92400e' : '#065f46',
                            border: `1px solid ${isGate ? '#fde68a' : '#a7f3d0'}`
                          }}>
                            {isGate ? '🚪 गेट' : '📦 काउंटर'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {v.counterName || v.counterId}
                          </span>
                        </div>
                        {Number(v.kitsDistributed) > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '3px' }}>
                            ✓ {v.kitsDistributed} किट सफलतापूर्वक वितरित
                          </div>
                        )}
                      </td>

                      {/* Login Username & Mobile */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <code style={{
                            background: '#f1f5f9',
                            color: '#0f172a',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.82rem'
                          }}>
                            {v.username}
                          </code>
                          <button
                            onClick={() => handleCopy(v.username, `u-${v.id}`)}
                            title="यूजरनेम कॉपी करें"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                          >
                            {copiedId === `u-${v.id}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                          </button>
                        </div>
                        {v.mobile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#475569', marginTop: '3px' }}>
                            <Phone size={11} color="#64748b" />
                            <span>{v.mobile}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleStatus(v)}
                          disabled={actionLoadingId === v.id}
                          title={v.status === 'ACTIVE' ? "निष्क्रिय करने हेतु क्लिक करें" : "सक्रिय करने हेतु क्लिक करें"}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: v.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                            color: v.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                            transition: 'all 0.2s'
                          }}
                        >
                          {actionLoadingId === v.id ? '...' : (v.status === 'ACTIVE' ? '🟢 सक्रिय' : '🔴 निष्क्रिय')}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenDutySlip(v)}
                            title="ड्यूटी पास व क्रेडेंशियल प्रिंट करें"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={13} />
                            <span>ड्यूटी पास</span>
                          </button>

                          <button
                            onClick={() => handleShareWhatsApp(v)}
                            title="व्हाट्सएप पर क्रेडेंशियल्स भेजें"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '5px',
                              background: '#f0fdf4',
                              border: '1px solid #86efac',
                              color: '#16a34a',
                              cursor: 'pointer'
                            }}
                          >
                            <Share2 size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteVolunteer(v)}
                            disabled={actionLoadingId === v.id}
                            title="ड्यूटी रोस्टर से हटाएं"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '5px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add Volunteer Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 28, 61, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0a1c3d 0%, #0f2b61 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="#f59e0b" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    नया वॉलंटियर पंजीकृत करें एवं ड्यूटी अलॉट करें
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Rajasthan Police Marathon 2027 • Official Duty Deployment
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '24px', overflowY: 'auto' }}>
              {formError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <AlertTriangle size={16} color="#dc2626" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Full Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  वॉलंटियर / पुलिस अधिकारी का पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कांस्टेबल राहुल मीणा अथवा सुश्री प्रिया शेखावत"
                  value={newVol.fullName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 2. Designation & Mobile in 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    पद / विंग (Designation / Rank)
                  </label>
                  <select
                    value={newVol.designation}
                    onChange={(e) => setNewVol(prev => ({ ...prev, designation: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    {DESIGNATION_PRESETS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value="अन्य (Custom)">अन्य (कस्टम दर्ज करें)...</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    मोबाइल नंबर (10 अंक) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98290XXXXX"
                    value={newVol.mobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {newVol.designation === "अन्य (Custom)" && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    कस्टम पद / दायित्व का नाम दर्ज करें:
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. स्काउट गाइड कैप्टन / विशेष सुरक्षा दस्ता"
                    value={newVol.customDesignation}
                    onChange={(e) => setNewVol(prev => ({ ...prev, customDesignation: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* 3. Duty Station Type (Radio Cards) */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  ड्यूटी तैनाती का प्रकार चुनें:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    onClick={() => handleStationTypeChange("counter")}
                    style={{
                      border: `2px solid ${newVol.stationType === 'counter' ? '#16a34a' : '#e2e8f0'}`,
                      background: newVol.stationType === 'counter' ? '#f0fdf4' : '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>📦</span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534' }}>
                        एक्सपो किट वितरण काउंटर
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        बिब व RFID किट हैंडओवर
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleStationTypeChange("gate")}
                    style={{
                      border: `2px solid ${newVol.stationType === 'gate' ? '#d97706' : '#e2e8f0'}`,
                      background: newVol.stationType === 'gate' ? '#fffbeb' : '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🚪</span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e' }}>
                        रेस डे प्रवेश द्वार (Gate)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        प्रवेश पास व सुरक्षा जांच
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Select Specific Station */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  विशिष्ट काउंटर / गेट स्टेशन का आवंटन:
                </label>
                <select
                  value={newVol.counterId}
                  onChange={(e) => setNewVol(prev => ({ ...prev, counterId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #2563eb',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: '#eff6ff'
                  }}
                >
                  {EXPO_COUNTERS
                    .filter(c => newVol.stationType === 'gate' ? c.id.startsWith('gate_') : c.id.startsWith('counter_'))
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 5. Individual Credentials Box */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <KeyRound size={16} color="#d97706" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    वॉलंटियर व्यक्तिगत लॉगिन क्रेडेंशियल्स (Auto-Generated Credentials)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      लॉगिन यूजरनेम (ID):
                    </label>
                    <input
                      type="text"
                      required
                      value={newVol.username}
                      onChange={(e) => setNewVol(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                      placeholder="vol_name_1234"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      सुरक्षा पासवर्ड / पिन:
                    </label>
                    <input
                    type="password"
                      required
                    minLength={12}
                    autoComplete="new-password"
                    value={newVol.password}
                    onChange={(e) => setNewVol(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="कम से कम 12 अक्षर"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#b45309',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '8px' }}>
                  * वॉलंटियर इस यूजरनेम या मोबाइल नंबर और दिए गए पासवर्ड से सीधे टर्मिनल पर लॉगिन कर सकेंगे।
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#475569',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  रद्द करें
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'सत्यापित किया जा रहा है...' : 'ड्यूटी अलॉट करें एवं क्रेडेंशियल बनाएं'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Official Duty Pass & Credential Slip Modal (Print Ready) */}
      {selectedSlipVol && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 28, 61, 0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Controls (Not printed) */}
            <div className="no-print" style={{
              background: '#0a1c3d',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={15} color="#f59e0b" />
                <span>आधिकारिक ड्यूटी पास पूर्वावलोकन</span>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrintSlip}
                  style={{
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Printer size={13} />
                  <span>प्रिंट (Print)</span>
                </button>
                <button
                  onClick={() => handleShareWhatsApp(selectedSlipVol)}
                  style={{
                    background: '#25d366',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Share2 size={13} />
                  <span>व्हाट्सएप</span>
                </button>
                <button
                  onClick={() => setSelectedSlipVol(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    padding: '5px 10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Duty Slip Card Printable Area */}
            <div id="duty-pass-print-area" style={{
              padding: '24px',
              background: '#ffffff',
              border: '2px solid #0a1c3d',
              margin: '12px',
              borderRadius: '8px',
              position: 'relative'
            }}>
              {/* Card Header with Police Branding */}
              <div style={{
                textAlign: 'center',
                borderBottom: '2px solid #d97706',
                paddingBottom: '12px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
                  <PoliceEmblem size={44} />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', color: '#b91c1c' }}>
                      राजस्थान पुलिस • राज्य पुलिस मुख्यालय (PHQ)
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a1c3d' }}>
                      राजस्थान पुलिस मैराथन 2027
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'inline-block',
                  background: '#0a1c3d',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  padding: '2px 14px',
                  borderRadius: '12px',
                  letterSpacing: '0.5px'
                }}>
                  आधिकारिक ड्यूटी आदेश एवं ऑपरेटर पास (DUTY PASS)
                </div>
              </div>

              {/* Volunteer Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>वॉलंटियर / ऑपरेटर का नाम:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    {selectedSlipVol.fullName}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e3a8a', marginTop: '2px' }}>
                    {selectedSlipVol.designation || 'वॉलंटियर स्टाफ'} • जयपुर आयुक्तालय
                  </div>
                  {selectedSlipVol.mobile && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                      मोबाइल: +91 {selectedSlipVol.mobile}
                    </div>
                  )}
                </div>

                {/* QR Code */}
                {slipQrUrl && (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={slipQrUrl} 
                      alt="Duty QR" 
                      style={{ width: '84px', height: '84px', border: '1px solid #cbd5e1', padding: '2px', borderRadius: '4px' }} 
                    />
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0a1c3d', marginTop: '2px' }}>
                      स्कैन सत्यापन
                    </div>
                  </div>
                )}
              </div>

              {/* Station Deployment Banner */}
              <div style={{
                background: selectedSlipVol.role === 'GATE_MARSHAL' ? '#fef3c7' : '#ecfdf5',
                border: `1.5px solid ${selectedSlipVol.role === 'GATE_MARSHAL' ? '#f59e0b' : '#10b981'}`,
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: selectedSlipVol.role === 'GATE_MARSHAL' ? '#92400e' : '#065f46' }}>
                  आवंटित ड्यूटी दायित्व एवं स्टेशन (ASSIGNED POSTING):
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                  {selectedSlipVol.counterName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                  {selectedSlipVol.role === 'GATE_MARSHAL' ? 'गेट चेकिंग, सुरक्षा एवं ई-पास सत्यापन डेस्क' : 'आरएफआईडी किट, बिब एवं टी-शर्ट वितरण काउंटर'}
                </div>
              </div>

              {/* Login information only; passwords are never printed or sent in messages. */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0a1c3d', marginBottom: '6px' }}>
                  🔒 ऑपरेटर टर्मिनल लॉगिन:
                </div>
                <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>यूजरनेम (ID):</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>
                    {selectedSlipVol.username}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                  लॉगिन पासवर्ड प्रिंट या संदेश में शामिल नहीं है। पासवर्ड अलग सुरक्षित माध्यम से साझा करें। लॉगिन पोर्टल: <strong>police.rajasthan.gov.in/marathon</strong>
                </div>
              </div>

              {/* Seal & Signatory Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', maxWidth: '240px' }}>
                  * यह पास मैराथन 2027 ड्यूटी हेतु अनिवार्य है। ड्यूटी समाप्ति पर काउंटर सुपरवाइजर को रिपोर्ट करें।
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0a1c3d' }}>
                    राज्य नोडल अधिकारी
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    राजस्थान पुलिस मुख्यालय, जयपुर
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
