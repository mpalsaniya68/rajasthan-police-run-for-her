import React from 'react';
import { RACE_DAY_TIMELINE } from '../data/mockData';
import { Clock, Package, AlertCircle } from 'lucide-react';

export function ScheduleExpo() {
  return (
    <section id="schedule" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gov">Official Event Program • 20 Dec 2026</span>
          <h2>कार्यक्रम समय-सारणी एवं बिब एक्सपो (Schedule & Expo)</h2>
          <p>
            पुलिस मुख्यालय द्वारा अनुमोदित आधिकारिक कार्यक्रम — 20 दिसंबर 2026, सुबह 5:00 बजे रिपोर्टिंग से लेकर सायं माननीय मुख्यमंत्री महोदय द्वारा पदक वितरण तक।
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '24px', alignItems: 'start' }} className="sched-responsive-grid">
          {/* Race Day Morning Program Timeline */}
          <div className="gov-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <Clock size={20} color="var(--police-navy-800)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--police-navy-900)' }}>रेस दिवस कार्यक्रम — 20 दिसंबर 2026 (जयपुर फ्लैगशिप)</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
              <div style={{
                position: 'absolute',
                top: '8px',
                bottom: '8px',
                left: '6px',
                width: '2px',
                background: 'var(--police-navy-700)'
              }}></div>

              {RACE_DAY_TIMELINE.map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: idx === 2 ? 'var(--crimson-600)' : 'var(--police-navy-800)',
                    border: '2px solid #ffffff'
                  }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: idx === 2 ? 'var(--crimson-600)' : 'var(--police-navy-800)',
                      background: 'var(--police-navy-50)',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {item.time}
                    </span>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--police-navy-900)' }}>
                      {item.title}
                    </h4>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bib Expo & Kit Collection Guide */}
          <div className="gov-card" style={{ padding: '24px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <Package size={20} color="var(--police-gold-700)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--police-navy-900)' }}>बिब एक्सपो एवं किट वितरण</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>एक्सपो स्थल</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>पुलिस मेमोरियल ग्राउंड / एसएमएस इंडोर कॉम्प्लेक्स</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>जेएलएन मार्ग, जयपुर (दौड़ से पूर्व: 18-19 दिसंबर 2026, सुबह 10:00 से सायं 07:00 बजे तक)</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--police-navy-800)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>
                किट में मिलने वाली सामग्री:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  "आधिकारिक इवेंट ड्राई-फिट रनिंग टी-शर्ट",
                  "RFID टाइमिंग चिप युक्त आधिकारिक रेस बिब",
                  "प्रतिभागी बैज एवं महिला सुरक्षा रिबन",
                  "रूट मैप एवं पोस्ट-रन अल्पाहार कूपन",
                  "महिला सुरक्षा हेल्पलाइन ब्रोशर"
                ].map((perk, i) => (
                  <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crucial ID Notice */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              gap: '8px'
            }}>
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#991b1b', lineHeight: 1.4 }}>
                <strong>अनिवार्य नियम:</strong> किट प्राप्त करने हेतु डिजिटल ई-पास एवं एक मान्य सरकारी फोटो पहचान पत्र (आधार / वोटर आईडी / कॉलेज आईडी) साथ लाएं। <em>दौड़ वाले दिन सुबह कोई बिब वितरण नहीं होगा।</em>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .sched-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
