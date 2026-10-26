import React, { useState } from 'react';
import { PhoneCall, Shield, Radio, CheckCircle2, AlertCircle, ArrowRight, MapPin, Users } from 'lucide-react';

export function SafetySimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateAlert = () => {
    setIsSimulating(true);
    setActiveStep(1);
    setTimeout(() => setActiveStep(2), 1200);
    setTimeout(() => setActiveStep(3), 2400);
    setTimeout(() => {
      setActiveStep(4);
      setIsSimulating(false);
    }, 3600);
  };

  const resetSimulator = () => {
    setActiveStep(0);
    setIsSimulating(false);
  };

  return (
    <section className="section-padding" style={{ background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-pink">Emergency Response Mechanism</span>
          <h2>राजस्थान पुलिस त्वरित सुरक्षा एवं सहायता तंत्र (Interactive Safety Matrix)</h2>
          <p>
            दौड़ में भाग लेने वाली प्रत्येक महिला, बालिका और नागरिक को पुलिस सहायता एवं रिपोर्टिंग तंत्र से परिचित कराना इस मैराथन का मुख्य उद्देश्य है। नीचे दिए गए लाइव सिम्युलेटर से समझें कि 1090 / 112 कैसे काम करता है।
          </p>
        </div>

        <div className="gov-card" style={{ maxWidth: '860px', margin: '0 auto', padding: '28px', border: '2px solid var(--border-medium)', background: '#ffffff' }}>
          {/* Header of Simulator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--crimson-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneCall size={20} color="var(--crimson-600)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--police-navy-900)' }}>
                  महिला गरिमा हेल्पलाइन 1090 एवं डायल 112 लाइव सिमुलेशन
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  State Command & Control Center (अभय कमांड सेंटर, जयपुर)
                </div>
              </div>
            </div>

            {activeStep === 0 ? (
              <button onClick={simulateAlert} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                <Radio size={15} /> टेस्ट कॉल सिमुलेट करें (Test SOS)
              </button>
            ) : (
              <button onClick={resetSimulator} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                रीसेट करें (Reset)
              </button>
            )}
          </div>

          {/* Interactive Steps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              {
                num: "01",
                title: "संकट कॉल / SOS",
                desc: "डायल 1090/112 अथवा RajCop ऐप का पैनिक बटन दबाया गया।",
                active: activeStep >= 1
              },
              {
                num: "02",
                title: "अभय कमांड सेंटर",
                desc: "जीपीएस लोकेशन तत्काल ऑटो-डिटेक्ट होकर महिला डेस्क पर पहुंची।",
                active: activeStep >= 2
              },
              {
                num: "03",
                title: "निर्भया स्क्वाड डिस्पैच",
                desc: "निकटतम पीसीआर वैन एवं महिला पेट्रोलिंग बाइक को अलर्ट जारी।",
                active: activeStep >= 3
              },
              {
                num: "04",
                title: "त्वरित सहायता संपन्न",
                desc: "7 से 9 मिनट के भीतर पुलिस सहायता मौके पर उपलब्ध।",
                active: activeStep >= 4
              }
            ].map((step, idx) => (
              <div 
                key={idx}
                style={{
                  background: step.active ? 'var(--police-navy-50)' : '#f8fafc',
                  border: step.active ? '2px solid var(--police-navy-800)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: step.active ? 'var(--police-navy-900)' : 'var(--text-muted)' }}>
                    चरण {step.num}
                  </span>
                  {step.active && <CheckCircle2 size={16} color="#059669" />}
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: step.active ? 'var(--police-navy-900)' : 'var(--text-muted)', marginBottom: '4px' }}>
                  {step.title}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Status Banner */}
          <div style={{
            background: activeStep === 4 ? '#ecfdf5' : 'var(--police-navy-50)',
            border: `1px solid ${activeStep === 4 ? '#10b981' : 'var(--border-subtle)'}`,
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color={activeStep === 4 ? '#059669' : 'var(--police-navy-800)'} />
              <span style={{ fontSize: '0.82rem', color: activeStep === 4 ? '#065f46' : 'var(--police-navy-900)', fontWeight: 700 }}>
                {activeStep === 0 && "सिमुलेशन प्रारंभ करने हेतु 'टेस्ट कॉल सिमुलेट करें' बटन दबाएं।"}
                {activeStep === 1 && "डायल 1090 कॉल कनेक्ट हो रहा है... GPS लोकेशन ट्रैकिंग सक्रिय।"}
                {activeStep === 2 && "कमांड सेंटर द्वारा निकटतम पेट्रोलिंग यूनिट चिन्हित की जा रही है..."}
                {activeStep === 3 && "निर्भया स्क्वाड को तत्काल रूट निर्देश दिए गए..."}
                {activeStep === 4 && "✓ महिला सुरक्षा टीम मौके पर तैनात - नागरिक सुरक्षित।"}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              24 घंटे निःशुल्क सेवा • पहचान पूर्णतः गोपनीय
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
