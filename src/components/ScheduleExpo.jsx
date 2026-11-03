import React, { useState } from 'react';
import { RACE_DAY_TIMELINE, PROHIBITED_ITEMS } from '../data/mockData';
import { Clock, Package, AlertCircle, ShieldAlert, Download, FileText, CheckCircle2, Shield, Luggage } from 'lucide-react';

export function ScheduleExpo() {
  const [downloadMsg, setDownloadMsg] = useState(null);

  const handleSimulateDownload = (docName) => {
    setDownloadMsg(`${docName} डाउनलोड प्रारंभ हो गया है...`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  return (
    <section id="schedule" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gov" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            Official Event Program • 03 Jan 2027
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '12px 0 8px 0' }}>
            कार्यक्रम समय-सारणी, बिब एक्सपो एवं रेस नियम (Schedule, Expo & Rules)
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', maxWidth: '820px', margin: '0 auto' }}>
            राजस्थान पुलिस मुख्यालय द्वारा अनुमोदित आधिकारिक कार्यक्रम — 3 जनवरी 2027, सुबह 5:00 बजे रिपोर्टिंग से लेकर सायं पुरस्कार वितरण तक।
          </p>
        </div>

        {/* TOP ROW: Timeline + Bib Expo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '28px', alignItems: 'start', marginBottom: '36px' }} className="sched-responsive-grid">
          
          {/* Race Day Morning Program Timeline */}
          <div className="gov-card" style={{ padding: '28px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <Clock size={24} color="var(--police-navy-900)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                रेस दिवस कार्यक्रम — 3 जनवरी 2027 (जयपुर फ्लैगशिप)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                bottom: '10px',
                left: '7px',
                width: '2px',
                background: 'var(--police-navy-800)'
              }}></div>

              {RACE_DAY_TIMELINE.map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '5px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--police-navy-900)',
                    border: '2.5px solid #ffffff',
                    boxShadow: '0 0 0 2px var(--police-navy-800)'
                  }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--police-navy-950)',
                      background: 'var(--police-navy-50)',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-medium)'
                    }}>
                      {item.time}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                      {item.title}
                    </h4>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.55, margin: '4px 0 0 0', fontWeight: 500 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bib Expo & Kit Collection Guide */}
          <div className="gov-card" style={{ padding: '28px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <Package size={24} color="var(--police-navy-900)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                बिब एक्सपो एवं किट वितरण
              </h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--police-navy-900)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '4px' }}>
                एक्सपो स्थल
              </div>
              <div style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--police-navy-950)', marginBottom: '4px' }}>
                पुलिस मेमोरियल ग्राउंड / एसएमएस इंडोर कॉम्प्लेक्स
              </div>
              <div style={{ fontSize: '0.96rem', color: '#334155', lineHeight: 1.5, marginBottom: '6px' }}>
                जेएलएन मार्ग, जयपुर (1-2 जनवरी 2027, सुबह 10:00 से सायं 07:00 बजे तक)
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                * जिलों में संबंधित जिला पुलिस अधीक्षक (SP) कार्यालय प्रांगण में एक्सपो आयोजित होगा।
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--police-navy-900)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '8px' }}>
                किट में मिलने वाली सामग्री:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
                {[
                  "आधिकारिक इवेंट ड्राई-फिट रनिंग टी-शर्ट",
                  "RFID टाइमिंग चिप युक्त आधिकारिक रेस बिब",
                  "प्रतिभागी बैज एवं महिला सुरक्षा रिबन",
                  "रूट मैप एवं पोस्ट-रन अल्पाहार कूपन",
                  "महिला सुरक्षा हेल्पलाइन ब्रोशर"
                ].map((perk, i) => (
                  <li key={i} style={{ fontSize: '0.96rem', color: 'var(--police-navy-950)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crucial ID Notice */}
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              gap: '12px'
            }}>
              <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.92rem', color: '#78350f', lineHeight: 1.55 }}>
                <strong style={{ fontWeight: 800 }}>अनिवार्य नियम:</strong> किट प्राप्त करने हेतु डिजिटल ई-पास एवं एक मान्य सरकारी फोटो पहचान पत्र (आधार / वोटर आईडी / कॉलेज आईडी) साथ लाएं। <em>दौड़ वाले दिन सुबह 3 जनवरी को कोई बिब वितरण नहीं होगा।</em>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Baggage Policy + Prohibited Items + Official Downloads */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          
          {/* Baggage Counter Policy */}
          <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--police-navy-950)', fontWeight: 800 }}>
              <Luggage size={22} color="var(--police-navy-900)" />
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>बैगेज ड्रॉप काउंटर व्यवस्था</h4>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.65, fontWeight: 500 }}>
              • <strong>स्थान:</strong> अल्बर्ट हॉल गेट 3 (गेट 2 एवं 4 से प्रवेश के उपरांत)<br />
              • <strong>समय:</strong> सुबह 04:45 AM से 06:15 AM तक सामान जमा होगा।<br />
              • <strong>सुरक्षा थैला:</strong> केवल राजस्थान पुलिस द्वारा दिए गए टोकन युक्त पारदर्शी बैग में ही कपड़े व जूते जमा किए जाएंगे।<br />
              • <strong>सख्त निर्देश:</strong> कोई भी कीमती वस्तु (लैपटॉप, नकद धनराशि, आभूषण, मोबाइल) जमा न करें।
            </div>
          </div>

          {/* Prohibited Items on Course */}
          <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--police-navy-950)', fontWeight: 800 }}>
              <ShieldAlert size={22} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>दौड़ मार्ग पर प्रतिबंधित वस्तुएं</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PROHIBITED_ITEMS.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.55 }}>
                  <strong style={{ color: '#991b1b', fontWeight: 800 }}>✕ {item.item}:</strong> {item.reason}
                </div>
              ))}
            </div>
          </div>

          {/* Official Documents Downloads */}
          <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: 'var(--police-navy-50)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--police-navy-950)', fontWeight: 800 }}>
              <FileText size={22} color="var(--police-navy-900)" />
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>आधिकारिक दस्तावेज</h4>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
              रेस दिवस से पूर्व नियम पुस्तिका व अभिभावक सहमति प्रपत्र डाउनलोड करें:
            </p>

            {downloadMsg && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem', color: '#166534', marginBottom: '12px', fontWeight: 700 }}>
                ✓ {downloadMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handleSimulateDownload("Athlete-Handbook-2027.pdf")}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--police-navy-800)',
                  color: 'var(--police-navy-950)',
                  padding: '11px 16px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <span>📖 धावक मार्गदर्शिका (Handbook PDF)</span>
                <Download size={16} />
              </button>

              <button
                onClick={() => handleSimulateDownload("Minor-Parental-Consent-Form.pdf")}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--police-navy-800)',
                  color: 'var(--police-navy-950)',
                  padding: '11px 16px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <span>📝 अभिभावक सहमति पत्र (Consent Form)</span>
                <Download size={16} />
              </button>

              <button
                onClick={() => handleSimulateDownload("Jaipur-Marathon-Route-Clearance.pdf")}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--border-medium)',
                  color: 'var(--police-navy-950)',
                  padding: '11px 16px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span>🗺️ आधिकारिक रूट जीपीएक्स / ट्रैफिक गजट</span>
                <Download size={16} />
              </button>
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
