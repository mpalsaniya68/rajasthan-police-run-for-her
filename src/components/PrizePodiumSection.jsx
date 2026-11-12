import React from 'react';
import { Trophy, Medal, Gift, Award, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export function PrizePodiumSection({ onOpenRegister, onNavigate }) {
  return (
    <section 
      id="prizes-showcase" 
      style={{ 
        position: 'relative', 
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', 
        padding: '50px 0 60px 0',
        borderBottom: '1px solid var(--border-medium)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-gold" style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={15} color="#ca8a04" />
              आधिकारिक नकद पुरस्कार राशि (Official Cash Prize Money)
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '8px 0 10px 0', fontWeight: 900 }}>
            जयपुर मुख्य फ्लैगशिप — नकद पुरस्कार एवं सम्मान पोडियम
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: '1.6', maxWidth: '840px', margin: '0 auto', fontWeight: 500 }}>
            अल्बर्ट हॉल, जयपुर मुख्य फ्लैगशिप मैराथन में भाग लेने वाले शीर्ष धावकों के लिए विशेष नकद पुरस्कार एवं सभी श्रेणियों में मेडल, ड्राई-फिट टी-शर्ट व रिफ्रेशमेंट्स किट।
          </p>
        </div>

        {/* 3-Column Prize Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          {/* CARD 1: 21 KM Half Marathon */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #fde047',
            borderTop: '5px solid #ca8a04',
            boxShadow: '0 8px 24px rgba(202, 138, 4, 0.12)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #fde68a'
                }}>
                  21.097 KM • COMPETITIVE TIMED
                </span>
                <span style={{
                  background: '#ca8a04',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  कुल ₹37,100
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)', margin: '0 0 6px 0' }}>
                21 KM हाफ मैराथन
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
                अनुभवी एथलीट्स, पुलिस बल एवं मैराथन धावकों हेतु शीर्ष ओपन पोडियम
              </p>

              {/* Podium Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #fef9c3 0%, #ffffff 100%)',
                  border: '1.5px solid #facc15'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#854d0e', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥇</span>
                    <span>1st Prize (प्रथम विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#854d0e' }}>₹21,000</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)',
                  border: '1.5px solid #cbd5e1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#334155', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥈</span>
                    <span>2nd Prize (द्वितीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#1e293b' }}>₹11,000</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #ffedd5 0%, #ffffff 100%)',
                  border: '1.5px solid #fed7aa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#9a3412', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥉</span>
                    <span>3rd Prize (तृतीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#9a3412' }}>₹5,100</span>
                </div>
              </div>

              {/* Included Perks */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                ✔ RFID टाइमिंग चिप बिब • ✔ आधिकारिक फिनिशर मेडल • ✔ ड्राई-फिट टी-शर्ट • ✔ DGP सर्टिफिकेट • ✔ ब्रेकफास्ट
              </div>
            </div>
          </div>

          {/* CARD 2: 10 KM Speed Run */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #fed7aa',
            borderTop: '5px solid #ea580c',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.1)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{
                  background: '#ffedd5',
                  color: '#9a3412',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #fed7aa'
                }}>
                  10.0 KM • SPEED CHALLENGE
                </span>
                <span style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  कुल ₹18,200
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)', margin: '0 0 6px 0' }}>
                10 KM स्पीड रन
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
                युवा धावकों, कॉलेज एथलीट्स एवं फिटनेस उत्साही लोगों के लिए टाइमड रन
              </p>

              {/* Podium Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #fef9c3 0%, #ffffff 100%)',
                  border: '1.5px solid #facc15'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#854d0e', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥇</span>
                    <span>1st Prize (प्रथम विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#854d0e' }}>₹11,000</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)',
                  border: '1.5px solid #cbd5e1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#334155', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥈</span>
                    <span>2nd Prize (द्वितीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#1e293b' }}>₹5,100</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #ffedd5 0%, #ffffff 100%)',
                  border: '1.5px solid #fed7aa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#9a3412', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥉</span>
                    <span>3rd Prize (तृतीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#9a3412' }}>₹2,100</span>
                </div>
              </div>

              {/* Included Perks */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                ✔ RFID टाइमिंग चिप बिब • ✔ आधिकारिक फिनिशर मेडल • ✔ ड्राई-फिट टी-शर्ट • ✔ ई-सर्टिफिकेट • ✔ हाइड्रेशन
              </div>
            </div>
          </div>

          {/* CARD 3: 5KM, 2KM & Adapted Course (Inclusive) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #bbf7d0',
            borderTop: '5px solid #16a34a',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{
                  background: '#dcfce7',
                  color: '#166534',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0'
                }}>
                  5K • 2K • ADAPTED COURSE
                </span>
                <span style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  प्रतिभागी किट
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)', margin: '0 0 6px 0' }}>
                5K / 2K व Adapted Course
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
                कम्युनिटी, परिवार, महिलाएं एवं दिव्यांग चैंपियंस (Inclusive Run)
              </p>

              {/* Perks Highlights Box */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>🥇</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#14532d', fontSize: '0.96rem' }}>आधिकारिक फिनिशर मेडल (Medal)</div>
                    <div style={{ fontSize: '0.76rem', color: '#166534' }}>प्रत्येक फिनिशर को समापन पर गौरव पदक</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>👕</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#14532d', fontSize: '0.96rem' }}>ड्राई-फिट टी-शर्ट (Official T-Shirt)</div>
                    <div style={{ fontSize: '0.76rem', color: '#166534' }}>जयपुर फ्लैगशिप एक्सपो से आधिकारिक टी-शर्ट</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>🥪</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#14532d', fontSize: '0.96rem' }}>पोस्ट-रन रिफ्रेशमेंट्स (Refreshments)</div>
                    <div style={{ fontSize: '0.76rem', color: '#166534' }}>एनर्जी ब्रेकफास्ट, हाइड्रेशन एवं मेडिकल सपोर्ट</div>
                  </div>
                </div>
              </div>

              {/* Special Note for Adapted Course */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.8rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#16a34a" />
                <span>Adapted Course: दिव्यांग धावकों हेतु विशेष वालंटियर एस्कॉर्ट व सुरक्षित ट्रैक</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Banner Note & CTA */}
        <div style={{
          background: '#0a1c3d',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color="#fde047" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fde047' }}>
                ★ आधिकारिक नियम: नकद पुरस्कार केवल जयपुर मुख्य फ्लैगशिप (अल्बर्ट हॉल) ओपन पोडियम हेतु मान्य
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                पुरस्कार राशि महिला व पुरुष दोनों वर्गों के संयुक्त ओपन परिणाम पर DGP राजस्थान द्वारा पोडियम पर वितरित की जाएगी।
              </div>
            </div>
          </div>
          <button
            onClick={onOpenRegister}
            className="btn-gold"
            style={{
              padding: '10px 22px',
              fontSize: '0.92rem',
              borderRadius: '50px',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>जयपुर फ्लैगशिप रन में रजिस्टर करें</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
