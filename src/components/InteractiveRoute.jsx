import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Droplets, 
  HeartPulse, 
  Timer, 
  Music, 
  Shield, 
  Navigation, 
  ExternalLink, 
  Flag, 
  Clock, 
  Award,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { 
  JAIPUR_ROUTE_CONFIGS, 
  HorizontalRouteMapCard, 
  ALBERT_HALL_MAPS_URL 
} from '../utils/jaipurRouteMap';
import QRCode from 'qrcode';

export function InteractiveRoute() {
  // Category Selector: Default to '21k' as requested by the user
  const [selectedCategory, setSelectedCategory] = useState('21k');
  const [activeFacilityFilter, setActiveFacilityFilter] = useState('all');
  const [locationQrUrl, setLocationQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(ALBERT_HALL_MAPS_URL, {
      width: 140,
      margin: 1,
      color: { dark: '#0a1c3d', light: '#ffffff' }
    })
      .then(url => setLocationQrUrl(url))
      .catch(() => {});
  }, []);

  const routeConfig = JAIPUR_ROUTE_CONFIGS[selectedCategory] || JAIPUR_ROUTE_CONFIGS['21k'];

  // Checkpoints for each category
  const CHECKPOINTS_DATA = {
    '21k': [
      { km: "0 KM", name: "Albert Hall Museum (Ram Niwas Garden)", type: "start", typeLabel: "प्रारंभ बिंदु (Start)", notes: "फ्लैग-ऑफ गैन्ट्री, RFID टाइमिंग मैट, वॉर्म-अप एरिना" },
      { km: "1.5 KM", name: "Trimurti Circle", type: "water", typeLabel: "जल सेवा (Water)", notes: "इलेक्ट्रोलाइट ड्रिंक्स, पानी, त्वरित प्राथमिक चिकित्सा वैन" },
      { km: "3.5 KM", name: "Birla Mandir / Rajasthan University", type: "water", typeLabel: "जल सेवा (Water)", notes: "हाइड्रेशन स्टेशन, पुलिस पेट्रोलिंग पोस्ट" },
      { km: "5.5 KM", name: "Gandhi Circle Crossing", type: "timing", typeLabel: "टाइमिंग मैट (Timing)", notes: "5K टर्नअराउंड कट, 21K टाइमिंग मैट, लाइव पुलिस पाइप बैंड" },
      { km: "8.5 KM", name: "MNIT & Apex Circle", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "ऊर्जावर्धक फल, संगीत एवं राजस्थानी लोक कलाकार" },
      { km: "10.5 KM", name: "Jawahar Circle / Patrika Gate", type: "timing", typeLabel: "U-TURN (टर्नअराउंड)", notes: "21K U-टर्न टाइमिंग मैट, मुख्य मेडिकल बेस एवं रिफ्रेशमेंट" },
      { km: "12.0 KM", name: "World Trade Park (WTP) Inbound", type: "water", typeLabel: "जल सेवा (Water)", notes: "हाई-स्पीड हाइड्रेशन एवं आइस स्पंजिंग स्टेशन" },
      { km: "15.5 KM", name: "KV School Loop", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "युवा धावक प्रोत्साहन स्क्वाड, एनर्जी ग्लूकोज डेस्क" },
      { km: "17.5 KM", name: "Jawahar Kala Kendra (JKK)", type: "medical", typeLabel: "चिकित्सा केंद्र (Medical)", notes: "आईसीयू एम्बुलेंस, फिजियोथेरेपी व क्रैम्प रिलीफ डेस्क" },
      { km: "19.5 KM", name: "JDA / Soni Hospital Mod", type: "water", typeLabel: "जल सेवा (Water)", notes: "अंतिम 1.5 KM स्पीड बूस्ट हाइड्रेशन पोस्ट" },
      { km: "21.097 KM", name: "Albert Hall Grand Finish Line", type: "finish", typeLabel: "समापन रेखा (Finish)", notes: "फिनिशर मेडल वितरण, रिकवरी ब्रेकफास्ट, मेडिकल लाउंज" }
    ],
    '10k': [
      { km: "0 KM", name: "Albert Hall Museum (Flag-Off)", type: "start", typeLabel: "प्रारंभ बिंदु (Start)", notes: "फ्लैग-ऑफ गैन्ट्री, RFID टाइमिंग मैट, वॉर्म-अप ज़ोन" },
      { km: "1.2 KM", name: "Trimurti Circle", type: "water", typeLabel: "जल सेवा (Water)", notes: "पीने का ठंडा पानी एवं प्राथमिक चिकित्सा पोस्ट" },
      { km: "2.2 KM", name: "Birla Mandir", type: "water", typeLabel: "जल सेवा (Water)", notes: "इलेक्ट्रोलाइट ड्रिंक्स डेस्क, महिला पुलिस सहायता केंद्र" },
      { km: "3.2 KM", name: "Rajasthan University Gate", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "छात्र-छात्रा प्रोत्साहन बैंड, हाइड्रेशन पॉइंट" },
      { km: "4.2 KM", name: "Gandhi Circle", type: "medical", typeLabel: "चिकित्सा केंद्र (Medical)", notes: "पैरामेडिक टीम, एम्बुलेंस स्टैंडबाय" },
      { km: "5.0 KM", name: "DB Crossing / MNIT Cut", type: "timing", typeLabel: "U-TURN (टर्नअराउंड)", notes: "10K U-टर्न टाइमिंग मैट, एनर्जी ड्रिंक्स" },
      { km: "6.0 KM", name: "Commerce College", type: "water", typeLabel: "जल सेवा (Water)", notes: "वापसी मार्ग जल सेवा एवं ग्लूकोज" },
      { km: "7.2 KM", name: "Jawahar Kala Kendra", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "पुलिस बैंड वादन एवं सांस्कृतिक स्वागत" },
      { km: "8.2 KM", name: "Kanoria College Crossing", type: "water", typeLabel: "जल सेवा (Water)", notes: "शीतलता स्पंज एवं एनर्जी जल डेस्क" },
      { km: "9.0 KM", name: "JDA Circle", type: "medical", typeLabel: "चिकित्सा केंद्र (Medical)", notes: "रैपिड रिस्पॉन्स प्राथमिक उपचार" },
      { km: "10.0 KM", name: "Albert Hall Grand Finish Line", type: "finish", typeLabel: "समापन रेखा (Finish)", notes: "10K फिनिशर मेडल, टाइमिंग स्लिप व रिफ्रेशमेंट्स" }
    ],
    '5k': [
      { km: "0 KM", name: "Albert Hall Museum (Flag-Off)", type: "start", typeLabel: "प्रारंभ बिंदु (Start)", notes: "सामूहिक महिला सुरक्षा शपथ एवं फ्लैग-ऑफ" },
      { km: "1.0 KM", name: "Trimurti Circle", type: "water", typeLabel: "जल सेवा (Water)", notes: "स्वच्छ पेयजल एवं प्राथमिक चिकित्सा" },
      { km: "1.8 KM", name: "Birla Mandir Crossing", type: "water", typeLabel: "जल सेवा (Water)", notes: "हाइड्रेशन डेस्क, निर्भया स्क्वाड सुरक्षा पेट्रोल" },
      { km: "2.2 KM", name: "Rajasthan University Main Gate", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "पुलिस पाइप बैंड एवं महिला सुरक्षा प्रदर्शनी" },
      { km: "2.5 KM", name: "Gandhi Circle", type: "timing", typeLabel: "U-TURN (टर्नअराउंड)", notes: "5K कम्युनिटी रन U-टर्न, हाइड्रेशन एवं एनर्जी पॉइंट" },
      { km: "3.0 KM", name: "Kanoria College", type: "water", typeLabel: "जल सेवा (Water)", notes: "वापसी मार्ग जल वितरण केंद्र" },
      { km: "3.8 KM", name: "JDA Circle", type: "medical", typeLabel: "चिकित्सा केंद्र (Medical)", notes: "डॉक्टर्स टीम एवं मेडिकल सहायता बूथ" },
      { km: "4.4 KM", name: "Soni Hospital Crossing", type: "water", typeLabel: "जल सेवा (Water)", notes: "अंतिम जल सेवा पोस्ट" },
      { km: "5.0 KM", name: "Albert Hall Museum", type: "finish", typeLabel: "समापन रेखा (Finish)", notes: "सहभागिता मेडल, ब्रेकफास्ट एवं नारी सुरक्षा प्रमाण पत्र" }
    ],
    '2k': [
      { km: "0 KM", name: "Albert Hall Museum (Flag-Off)", type: "start", typeLabel: "प्रारंभ बिंदु (Start)", notes: "फैमिली वॉक एवं रन फॉर हर सामूहिक मार्च" },
      { km: "0.4 KM", name: "Ram Niwas Garden North Gate", type: "water", typeLabel: "जल सेवा (Water)", notes: "पेयजल एवं प्राथमिक सहायता बूथ" },
      { km: "0.8 KM", name: "JLN Marg Green Corridor", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "महिला सुरक्षा बैनर्स, सेल्फी पॉइंट एवं पुलिस बैंड" },
      { km: "1.0 KM", name: "Trimurti Circle", type: "timing", typeLabel: "U-TURN (टर्नअराउंड)", notes: "2K वॉक U-टर्न, रिफ्रेशमेंट डेस्क" },
      { km: "1.4 KM", name: "JLN Marg Return Corridor", type: "water", typeLabel: "जल सेवा (Water)", notes: "पेयजल एवं एनर्जी ड्रिंक्स" },
      { km: "1.8 KM", name: "Albert Hall Approach Gate", type: "cheer", typeLabel: "चीयरिंग ज़ोन (Cheer)", notes: "स्वागत उद्घोषणा एवं फोटोग्राफी पॉइंट" },
      { km: "2.0 KM", name: "Albert Hall Museum Finish", type: "finish", typeLabel: "समापन रेखा (Finish)", notes: "मेडल, रिफ्रेशमेंट्स व बच्चों हेतु विशेष कैप्स" }
    ]
  };

  const currentCheckpoints = CHECKPOINTS_DATA[selectedCategory] || CHECKPOINTS_DATA['21k'];

  const filteredCheckpoints = activeFacilityFilter === 'all'
    ? currentCheckpoints
    : currentCheckpoints.filter(c => c.type === activeFacilityFilter || c.type === 'start' || c.type === 'finish');

  const CATEGORY_TABS = [
    {
      id: '21k',
      badge: '21 KM',
      label: '21 KM हाफ मैराथन',
      sub: 'Jawahar Circle U-Turn',
      accent: '#dc2626',
      badgeBg: 'bg-red-600',
      timing: 'Reporting: 05:00 AM | Flag-Off: 06:00 AM'
    },
    {
      id: '10k',
      badge: '10 KM',
      label: '10 KM स्पीड रन',
      sub: 'MNIT Crossing U-Turn',
      accent: '#1d4ed8',
      badgeBg: 'bg-blue-600',
      timing: 'Reporting: 05:15 AM | Flag-Off: 06:15 AM'
    },
    {
      id: '5k',
      badge: '5 KM',
      label: '5 KM कम्युनिटी रन',
      sub: 'Gandhi Circle U-Turn',
      accent: '#0f172a',
      badgeBg: 'bg-slate-800',
      timing: 'Reporting: 05:30 AM | Flag-Off: 06:45 AM'
    },
    {
      id: '2k',
      badge: '2 KM',
      label: '2 KM फैमिली वॉक',
      sub: 'Trimurti Circle U-Turn',
      accent: '#0284c7',
      badgeBg: 'bg-sky-600',
      timing: 'Reporting: 06:00 AM | Flag-Off: 07:15 AM'
    }
  ];

  return (
    <section id="route" className="section-padding" style={{ position: 'relative', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <span className="badge-gold" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            Official Heritage Marathon Route • Albert Hall, Jaipur
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '12px 0 8px 0', fontWeight: 800 }}>
            जयपुर फ्लैगशिप रेस रूट एवं सुविधा मानचित्र (Course & Facilities)
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', maxWidth: '840px', margin: '0 auto' }}>
            अपनी पंजीकृत रेस श्रेणी चुनें — केवल उसी श्रेणी का रूट मैप, मुख्य चेकपॉइंट्स व यू-टर्न प्रदर्शित होगा। समतल जेएलएन मार्ग कॉरिडोर पर 100% ट्रैफिक-मुक्त सुरक्षा व्यवस्था।
          </p>
        </div>

        {/* 1. INTERACTIVE CATEGORY TABS (USER SELECTS ONE, DEFAULT: 21K) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  background: isSelected ? '#ffffff' : '#f1f5f9',
                  border: isSelected ? `2.5px solid ${tab.accent}` : '1.5px solid var(--border-medium)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 6px 20px ${tab.accent}25` : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Active Top Accent Strip */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: tab.accent
                  }}></div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    background: tab.accent,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.04em'
                  }}>
                    {tab.badge}
                  </span>
                  {isSelected && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800, color: tab.accent }}>
                      <CheckCircle2 size={14} /> सक्रिय मैप
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? 'var(--police-navy-950)' : '#334155' }}>
                  {tab.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. CATEGORY SUMMARY BANNER */}
        <div style={{
          background: 'linear-gradient(90deg, #051126 0%, #0a1c3d 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: routeConfig.accent,
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 900,
              padding: '4px 12px',
              borderRadius: '999px'
            }}>
              {routeConfig.shortBadge}
            </span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fef08a' }}>
                {routeConfig.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                {routeConfig.timing} • प्रारंभ व समापन: अल्बर्ट हॉल (Albert Hall)
              </div>
            </div>
          </div>

          <a
            href={ALBERT_HALL_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#ffffff',
              color: 'var(--police-navy-950)',
              fontSize: '0.85rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <Navigation size={15} color="#dc2626" />
            <span>गूगल मैप्स नेविगेशन (अल्बर्ट हॉल)</span>
            <ExternalLink size={13} color="#64748b" />
          </a>
        </div>

        {/* 3. DEDICATED HORIZONTAL VISUAL ROUTE MAP CARD FOR SELECTED CATEGORY */}
        <div style={{ marginBottom: '28px' }}>
          <HorizontalRouteMapCard 
            route={routeConfig} 
            locationQrUrl={locationQrUrl} 
          />
        </div>

        {/* 4. FACILITY LAYER FILTER TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
          {[
            { id: 'all', label: 'समस्त सुविधाएं (All)', icon: MapPin },
            { id: 'water', label: 'जल एवं हाइड्रेशन', icon: Droplets },
            { id: 'medical', label: 'चिकित्सा एवं एम्बुलेंस', icon: HeartPulse },
            { id: 'timing', label: 'RFID टाइमिंग व U-Turn', icon: Timer },
            { id: 'cheer', label: 'चीयरिंग व पुलिस बैंड', icon: Music }
          ].map(btn => {
            const Icon = btn.icon;
            const isSelected = activeFacilityFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveFacilityFilter(btn.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '50px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: isSelected ? 'var(--police-navy-900)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--police-navy-900)',
                  border: isSelected ? '1.5px solid var(--police-navy-900)' : '1.5px solid var(--border-medium)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(10, 28, 61, 0.2)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Icon size={15} color={isSelected ? 'var(--police-gold-400)' : 'var(--police-navy-800)'} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. INTERACTIVE CHECKPOINTS TIMELINE GRID */}
        <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', background: '#ffffff', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={22} color={routeConfig.accent} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--police-navy-950)' }}>
                {routeConfig.shortBadge} रूट चेकपॉइंट्स एवं सुविधाएं
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 800, background: '#ecfdf5', padding: '4px 12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              ✓ सुरक्षित कॉरिडोर • प्रत्येक 500 मी. पर पुलिस पेट्रोल
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {filteredCheckpoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  background: pt.type === 'timing' ? '#fef2f2' : (pt.type === 'start' || pt.type === 'finish' ? '#eff6ff' : '#f8fafc'),
                  border: pt.type === 'timing' ? '1.5px solid #fecaca' : (pt.type === 'start' || pt.type === 'finish' ? '1.5px solid #bfdbfe' : '1.5px solid var(--border-medium)'),
                  borderRadius: '10px',
                  padding: '16px 18px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    color: routeConfig.accent,
                    background: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)'
                  }}>
                    {pt.km}
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    color: pt.type === 'timing' ? '#b91c1c' : 'var(--police-navy-900)',
                    background: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 800
                  }}>
                    {pt.typeLabel}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--police-navy-950)', marginBottom: '6px' }}>
                  {pt.name}
                </div>

                <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                  {pt.notes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. NIRBHAYA SQUAD & POLICE PATROL CITIZEN NOTICE */}
        <div style={{
          background: 'var(--police-navy-50)',
          border: '1.5px solid var(--police-navy-200)',
          borderLeft: '5px solid var(--police-navy-900)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="var(--police-navy-900)" />
            <span style={{ fontSize: '0.94rem', color: 'var(--police-navy-950)', lineHeight: '1.6' }}>
              रूट पर प्रत्येक 500 मीटर पर <strong>राजस्थान पुलिस मोबाइल पेट्रोलिंग एवं निर्भया स्क्वाड</strong> की महिला पुलिसकर्मी तैनात रहेंगी।
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--police-navy-900)', fontWeight: 800 }}>
            आपातकालीन सेवा: 112 • महिला गरिमा: 1090
          </div>
        </div>

      </div>
    </section>
  );
}
