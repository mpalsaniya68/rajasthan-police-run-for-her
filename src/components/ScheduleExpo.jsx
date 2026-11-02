import React, { useState } from 'react';
import { RACE_DAY_TIMELINE, PROHIBITED_ITEMS } from '../data/mockData';
import { Clock, Package, AlertCircle, Timer, ShieldAlert, Download, FileText, CheckCircle2, Shield, Luggage } from 'lucide-react';

export function ScheduleExpo() {
  const [downloadMsg, setDownloadMsg] = useState(null);

  const handleSimulateDownload = (docName) => {
    setDownloadMsg(`${docName} डाउनलोड प्रारंभ हो गया है...`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  const cutOffSchedule = [
    { cat: "21.097 KM Half Marathon", flag: "06:00 AM", cutoff: "09:30 AM", limit: "3 घंटे 30 मिनट", sweep: "09:35 AM" },
    { cat: "10 KM Speed Run", flag: "06:15 AM", cutoff: "08:00 AM", limit: "1 घंटा 45 मिनट", sweep: "08:05 AM" },
    { cat: "5 KM Community Run", flag: "06:45 AM", cutoff: "07:45 AM", limit: "1 घंटा 00 मिनट", sweep: "07:50 AM" },
    { cat: "2 KM Family & Youth Run", flag: "07:15 AM", cutoff: "08:00 AM", limit: "45 मिनट", sweep: "08:05 AM" }
  ];

  return (
    <section id="schedule" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gov">Official Event Program • 03 Jan 2027</span>
          <h2>कार्यक्रम समय-सारणी, बिब एक्सपो एवं रेस नियम (Schedule, Expo & Rules)</h2>
          <p>
            राजस्थान पुलिस मुख्यालय द्वारा अनुमोदित आधिकारिक कार्यक्रम — 3 जनवरी 2027, सुबह 5:00 बजे रिपोर्टिंग से लेकर सायं पुरस्कार वितरण तक।
          </p>
        </div>

        {/* TOP ROW: Timeline + Bib Expo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '24px', alignItems: 'start', marginBottom: '32px' }} className="sched-responsive-grid">
          
          {/* Race Day Morning Program Timeline */}
          <div className="gov-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <Clock size={20} color="var(--police-navy-800)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--police-navy-900)' }}>रेस दिवस कार्यक्रम — 3 जनवरी 2027 (जयपुर फ्लैगशिप)</h3>
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
          <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <Package size={20} color="var(--police-gold-700)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--police-navy-900)' }}>बिब एक्सपो एवं किट वितरण</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>एक्सपो स्थल</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>पुलिस मेमोरियल ग्राउंड / एसएमएस इंडोर कॉम्प्लेक्स</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>जेएलएन मार्ग, जयपुर (1-2 जनवरी 2027, सुबह 10:00 से सायं 07:00 बजे तक)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--police-navy-700)', marginTop: '4px', fontWeight: 600 }}>* जिलों में संबंधित जिला पुलिस अधीक्षक (SP) कार्यालय प्रांगण में एक्सपो आयोजित होगा।</div>
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
              border: '1.5px solid #fca5a5',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: '#991b1b', lineHeight: 1.45 }}>
                <strong>अनिवार्य नियम:</strong> किट प्राप्त करने हेतु डिजिटल ई-पास एवं एक मान्य सरकारी फोटो पहचान पत्र (आधार / वोटर आईडी / कॉलेज आईडी) साथ लाएं। <em>दौड़ वाले दिन सुबह 3 जनवरी को कोई बिब वितरण नहीं होगा।</em>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Official Race Cut-Off Schedule Table */}
        <div className="gov-card" style={{ padding: '24px', marginBottom: '32px', border: '1.5px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Timer size={22} color="var(--crimson-600)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)' }}>
                  आधिकारिक रेस कट-ऑफ समय एवं यातायात पुनर्बहाली (Cut-Off Schedule)
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  राजस्थान पुलिस यातायात शाखा एवं धावक सुरक्षा प्रोटोकॉल
                </span>
              </div>
            </div>
            <span className="badge-gold">समय-सीमा के बाद यातायात बहाल</span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--police-navy-50)', borderBottom: '2px solid var(--border-medium)', color: 'var(--police-navy-900)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 800 }}>दौड़ श्रेणी (Category)</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800 }}>फ्लैग-ऑफ समय</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800 }}>अधिकतम समय-सीमा</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800 }}>कट-ऑफ समय (Cut-Off)</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800 }}>स्वीपर बस प्रस्थान</th>
                </tr>
              </thead>
              <tbody>
                {cutOffSchedule.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#ffffff' : 'var(--bg-surface-soft)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--police-navy-900)' }}>{row.cat}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-body)' }}>{row.flag}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#047857' }}>{row.limit}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--crimson-700)' }}>{row.cutoff}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{row.sweep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--police-navy-50)', padding: '12px 16px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--police-navy-900)', lineHeight: 1.5, borderLeft: '4px solid var(--police-navy-700)' }}>
            <strong>प्रशासनिक दिशा-निर्देश:</strong> JLN मार्ग एवं संबंधित जिला मार्गों पर निर्धारित कट-ऑफ समय के तुरंत बाद सामान्य यातायात बहाल कर दिया जाएगा। सुरक्षा कारणों से कट-ऑफ के बाद किसी भी धावक को सड़क पर पैदल या दौड़ने की अनुमति नहीं होगी। पुलिस स्वीपर बस शेष धावकों को सम्मानपूर्वक फिनिश लाउंज में पहुँचाएगी।
          </div>
        </div>

        {/* ROW 3: Baggage Policy + Prohibited Items + Official Downloads */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          
          {/* Baggage Counter Policy */}
          <div className="gov-card" style={{ padding: '22px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--police-navy-900)', fontWeight: 800 }}>
              <Luggage size={18} color="var(--police-navy-800)" />
              <h4 style={{ margin: 0, fontSize: '1rem' }}>बैगेज ड्रॉप काउंटर व्यवस्था (Baggage Counter)</h4>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.55 }}>
              • <strong>स्थान:</strong> अल्बर्ट हॉल गेट 3 (गेट 2 एवं 4 से प्रवेश के उपरांत)<br />
              • <strong>समय:</strong> सुबह 04:45 AM से 06:15 AM तक सामान जमा होगा।<br />
              • <strong>सुरक्षा थैला:</strong> केवल राजस्थान पुलिस द्वारा दिए गए टोकन युक्त पारदर्शी बैग में ही कपड़े व जूते जमा किए जाएंगे।<br />
              • <strong>सख्त निर्देश:</strong> कोई भी कीमती वस्तु (लैपटॉप, नकद धनराशि, आभूषण, मोबाइल) जमा न करें। पुलिस प्रशासन किसी भी क्षति हेतु उत्तरदायी नहीं होगा।
            </div>
          </div>

          {/* Prohibited Items on Course */}
          <div className="gov-card" style={{ padding: '22px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#991b1b', fontWeight: 800 }}>
              <ShieldAlert size={18} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '1rem' }}>दौड़ मार्ग पर प्रतिबंधित वस्तुएं (Prohibited Items)</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PROHIBITED_ITEMS.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.79rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#991b1b' }}>✕ {item.item}:</strong> {item.reason}
                </div>
              ))}
            </div>
          </div>

          {/* Official Documents Downloads */}
          <div className="gov-card" style={{ padding: '22px', border: '1px solid var(--border-medium)', background: 'var(--police-navy-50)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--police-navy-900)', fontWeight: 800 }}>
              <FileText size={18} color="var(--police-gold-700)" />
              <h4 style={{ margin: 0, fontSize: '1rem' }}>आधिकारिक दस्तावेज एवं सहमति पत्र</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              रेस दिवस से पूर्व नियम पुस्तिका व अभिभावक सहमति प्रपत्र डाउनलोड करें:
            </p>

            {downloadMsg && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', color: '#166534', marginBottom: '10px' }}>
                ✓ {downloadMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleSimulateDownload("Athlete-Handbook-2027.pdf")}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--police-navy-800)',
                  color: 'var(--police-navy-900)',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <span>📖 धावक मार्गदर्शिका (Athlete Handbook PDF)</span>
                <Download size={15} />
              </button>

              <button
                onClick={() => handleSimulateDownload("Minor-Parental-Consent-Form.pdf")}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--crimson-600)',
                  color: 'var(--crimson-700)',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <span>📝 नाबालिग अभिभावक सहमति पत्र (Consent Form)</span>
                <Download size={15} />
              </button>

              <button
                onClick={() => handleSimulateDownload("Jaipur-Marathon-Route-Clearance.pdf")}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-body)',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span>🗺️ आधिकारिक रूट जीपीएक्स / ट्रैफिक गजट</span>
                <Download size={15} />
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
