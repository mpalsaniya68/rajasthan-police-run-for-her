import React, { useState } from 'react';
import { MapPin, Droplets, HeartPulse, Timer, Music, Compass, Shield, Flag } from 'lucide-react';

export function InteractiveRoute() {
  const [activeLayer, setActiveLayer] = useState("all");

  const routeCheckpoints = [
    { km: "0 KM", name: "Albert Hall Museum (Ram Niwas Garden)", type: "start", notes: "फ्लैग-ऑफ गैन्ट्री, RFID टाइमिंग मैट, वॉर्म-अप ज़ोन", icon: "Flag" },
    { km: "2.5 KM", name: "Birla Mandir Crossing", type: "water", notes: "इलेक्ट्रोलाइट ड्रिंक्स, पानी, प्राथमिक चिकित्सा वैन", icon: "Droplets" },
    { km: "5 KM", name: "Rajasthan University Main Gate", type: "timing", notes: "5K टर्नअराउंड, 10K/21K टाइमिंग मैट, पुलिस पाइप बैंड", icon: "Timer" },
    { km: "7.5 KM", name: "Gandhinagar Railway Station Mod", type: "medical", notes: "पैरामेडिक टीम, स्पंज एवं रिफ्रेशमेंट पोस्ट", icon: "HeartPulse" },
    { km: "10 KM", name: "World Trade Park (WTP) / JLN Marg", type: "timing", notes: "10K टर्नअराउंड एवं टाइमिंग मैट, लाइव चीयर स्क्वाड", icon: "Timer" },
    { km: "15 KM", name: "Jawahar Circle / Patrika Gate", type: "cheer", notes: "सांस्कृतिक लोक नृत्य, एनर्जी फ्रूट स्टेशन", icon: "Music" },
    { km: "18 KM", name: "Amar Jawan Jyoti Loop", type: "medical", notes: "रैपिड-रिस्पॉन्स मेडिकल पोस्ट, हाइड्रेशन डेस्क", icon: "HeartPulse" },
    { km: "21.097 KM", name: "Albert Hall Grand Finish Line", type: "finish", notes: "फिनिशर मेडल वितरण, रिकवरी ब्रेकफास्ट, मेडिकल लाउंज", icon: "Flag" }
  ];

  const filteredCheckpoints = activeLayer === "all" 
    ? routeCheckpoints 
    : routeCheckpoints.filter(c => c.type === activeLayer || c.type === "start" || c.type === "finish");

  return (
    <section id="route" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Official Heritage Marathon Route</span>
          <h2>जयपुर फ्लैगशिप रूट एवं रूट-सुविधाएं (Interactive Route)</h2>
          <p>
            पिंक सिटी की ऐतिहासिक धरोहर अल्बर्ट हॉल से जेएलएन मार्ग तक का चौड़ा और समतल कोर्स। प्रत्येक 500 मीटर पर राजस्थान पुलिस सुरक्षा, हाइड्रेशन और मेडिकल व्यवस्था।
          </p>
        </div>

        {/* Layer Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { id: 'all', label: 'समस्त सुविधाएं (All)' },
            { id: 'water', label: '💧 जल एवं हाइड्रेशन (12 स्टेशंस)' },
            { id: 'medical', label: '🚑 मेडिकल एवं एम्बुलेंस (8 पोस्ट)' },
            { id: 'timing', label: '⏱️ RFID टाइमिंग मैट्स (6 चेकपॉइंट)' },
            { id: 'cheer', label: '🥁 पुलिस बैंड व चीयरिंग ज़ोन' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveLayer(btn.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: activeLayer === btn.id ? 'var(--police-navy-800)' : 'var(--police-navy-50)',
                color: activeLayer === btn.id ? '#ffffff' : 'var(--text-body)',
                border: activeLayer === btn.id ? '1px solid var(--police-navy-800)' : '1px solid var(--border-subtle)'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Visual Course Diagram / Map Interface */}
        <div className="gov-card" style={{ padding: '24px', border: '1px solid var(--border-medium)', background: '#ffffff' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--police-navy-800)" />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-900)' }}>
                कोर्स पथ: अल्बर्ट हॉल ⟷ जेएलएन मार्ग ⟷ डब्ल्यूटीपी ⟷ जवाहर सर्किल
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>समतल डामर मार्ग</span>
              <span>•</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>शून्य-ट्रैफिक संरक्षित कॉरिडोर</span>
            </div>
          </div>

          {/* Interactive Checkpoint Timeline Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
            {filteredCheckpoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--police-navy-50)',
                  border: pt.type === 'start' || pt.type === 'finish' ? '2px solid var(--crimson-600)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: 'var(--police-navy-900)',
                    background: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {pt.km}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    color: pt.type === 'water' ? '#0284c7' : pt.type === 'medical' ? '#dc2626' : pt.type === 'timing' ? 'var(--police-gold-700)' : 'var(--text-muted)',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {pt.type}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--police-navy-900)', marginBottom: '4px' }}>
                  {pt.name}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {pt.notes}
                </div>
              </div>
            ))}
          </div>

          {/* Nirbhaya Squad & Police Patrol Notice */}
          <div style={{
            marginTop: '20px',
            background: 'var(--crimson-50)',
            border: '1px solid rgba(201, 24, 74, 0.2)',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--crimson-600)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-body)' }}>
                रूट पर प्रत्येक 500 मीटर पर <strong>राजस्थान पुलिस मोबाइल पेट्रोलिंग एवं निर्भया स्क्वाड</strong> की महिला पुलिसकर्मी तैनात रहेंगी।
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--crimson-600)', fontWeight: 800 }}>
              हेल्पलाइन: 112 / 1090
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
