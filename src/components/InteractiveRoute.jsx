import React, { useState } from 'react';
import { MapPin, Droplets, HeartPulse, Timer, Music, Shield } from 'lucide-react';

export function InteractiveRoute() {
  const [activeLayer, setActiveLayer] = useState("all");

  const routeCheckpoints = [
    { km: "0 KM", name: "Albert Hall Museum (Ram Niwas Garden)", type: "start", typeLabel: "प्रारंभ बिंदु (Start)", notes: "फ्लैग-ऑफ गैन्ट्री, RFID टाइमिंग मैट, वॉर्म-अप ज़ोन" },
    { km: "2.5 KM", name: "Birla Mandir Crossing", type: "water", typeLabel: "जल सेवा (Water)", notes: "इलेक्ट्रोलाइट ड्रिंक्स, पानी, प्राथमिक चिकित्सा वैन" },
    { km: "5 KM", name: "Rajasthan University Main Gate", type: "timing", typeLabel: "टाइमिंग मैट (Timing)", notes: "5K टर्नअराउंड, 10K/21K टाइमिंग मैट, पुलिस पाइप बैंड" },
    { km: "7.5 KM", name: "Gandhinagar Railway Station Mod", type: "medical", typeLabel: "चिकित्सा केंद्र (Medical)", notes: "पैरामेडिक टीम, स्पंज एवं रिफ्रेशमेंट पोस्ट" },
    { km: "10 KM", name: "World Trade Park (WTP) / JLN Marg", type: "timing", typeLabel: "टाइमिंग मैट (Timing)", notes: "10K टर्नअराउंड एवं टाइमिंग मैट, लाइव चीयर स्क्वाड" },
    { km: "15 KM", name: "Jawahar Circle / Patrika Gate", type: "cheer", typeLabel: "उत्साहवर्धन (Cheer Zone)", notes: "सांस्कृतिक लोक नृत्य, एनर्जी फ्रूट स्टेशन" },
    { km: "18 KM", name: "Amar Jawan Jyoti Loop", type: "medical", typeLabel: "चिकित्सा केंद्र (Medical)", notes: "रैपिड-रिस्पॉन्स मेडिकल पोस्ट, हाइड्रेशन डेस्क" },
    { km: "21.097 KM", name: "Albert Hall Grand Finish Line", type: "finish", typeLabel: "समापन रेखा (Finish)", notes: "फिनिशर मेडल वितरण, रिकवरी ब्रेकफास्ट, मेडिकल लाउंज" }
  ];

  const filteredCheckpoints = activeLayer === "all" 
    ? routeCheckpoints 
    : routeCheckpoints.filter(c => c.type === activeLayer || c.type === "start" || c.type === "finish");

  return (
    <section id="route" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            Official Heritage Marathon Route
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '12px 0 8px 0' }}>
            जयपुर फ्लैगशिप रूट एवं रूट-सुविधाएं (Interactive Route)
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', maxWidth: '820px', margin: '0 auto' }}>
            पिंक सिटी की ऐतिहासिक धरोहर अल्बर्ट हॉल से जेएलएन मार्ग तक का चौड़ा और समतल कोर्स। प्रत्येक 500 मीटर पर राजस्थान पुलिस सुरक्षा, हाइड्रेशन और मेडिकल व्यवस्था।
          </p>
        </div>

        {/* Layer Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[
            { id: 'all', label: 'समस्त सुविधाएं (All)', icon: MapPin },
            { id: 'water', label: 'जल एवं हाइड्रेशन (12 स्टेशंस)', icon: Droplets },
            { id: 'medical', label: 'मेडिकल एवं एम्बुलेंस (8 पोस्ट)', icon: HeartPulse },
            { id: 'timing', label: 'RFID टाइमिंग मैट्स (6 चेकपॉइंट)', icon: Timer },
            { id: 'cheer', label: 'पुलिस बैंड व चीयरिंग ज़ोन', icon: Music }
          ].map(btn => {
            const Icon = btn.icon;
            const isSelected = activeLayer === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveLayer(btn.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isSelected ? 'var(--police-navy-900)' : '#f8fafc',
                  color: isSelected ? '#ffffff' : 'var(--police-navy-900)',
                  border: isSelected ? '1.5px solid var(--police-navy-900)' : '1.5px solid var(--border-medium)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(10, 28, 61, 0.2)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Icon size={16} color={isSelected ? 'var(--police-gold-400)' : 'var(--police-navy-800)'} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Visual Course Diagram / Map Interface */}
        <div className="gov-card" style={{ padding: '28px', border: '1.5px solid var(--border-medium)', background: '#ffffff', borderRadius: '12px' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={24} color="var(--police-navy-900)" />
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--police-navy-950)' }}>
                कोर्स पथ: अल्बर्ट हॉल ⟷ जेएलएन मार्ग ⟷ डब्ल्यूटीपी ⟷ जवाहर सर्किल
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>
              <span>समतल डामर मार्ग</span>
              <span>•</span>
              <span style={{ color: '#047857', fontWeight: 800 }}>शून्य-ट्रैफिक संरक्षित कॉरिडोर</span>
            </div>
          </div>

          {/* Interactive Checkpoint Timeline Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {filteredCheckpoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    color: 'var(--police-navy-950)',
                    background: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)'
                  }}>
                    {pt.km}
                  </span>
                  <span style={{
                    fontSize: '0.82rem',
                    color: 'var(--police-navy-900)',
                    background: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 800
                  }}>
                    {pt.typeLabel}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.08rem', color: 'var(--police-navy-950)', marginBottom: '8px' }}>
                  {pt.name}
                </div>

                <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.55, fontWeight: 500 }}>
                  {pt.notes}
                </div>
              </div>
            ))}
          </div>

          {/* Nirbhaya Squad & Police Patrol Notice */}
          <div style={{
            marginTop: '24px',
            background: 'var(--police-navy-50)',
            border: '1.5px solid var(--police-navy-200)',
            borderLeft: '5px solid var(--police-navy-900)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={22} color="var(--police-navy-900)" />
              <span style={{ fontSize: '0.96rem', color: 'var(--police-navy-950)', lineHeight: '1.6' }}>
                रूट पर प्रत्येक 500 मीटर पर <strong>राजस्थान पुलिस मोबाइल पेट्रोलिंग एवं निर्भया स्क्वाड</strong> की महिला पुलिसकर्मी तैनात रहेंगी।
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--police-navy-900)', fontWeight: 800 }}>
              हेल्पलाइन: 112 / 1090
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
