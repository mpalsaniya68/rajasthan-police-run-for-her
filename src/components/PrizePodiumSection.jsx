import React from 'react';
import { Trophy, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export function PrizePodiumSection({ onOpenRegister }) {
  return (
    <section 
      id="prizes-showcase" 
      style={{ 
        position: 'relative', 
        background: '#ffffff', 
        padding: '50px 0 60px 0',
        borderBottom: '1px solid var(--border-medium)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '0.84rem',
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '6px',
              fontWeight: 800
            }}>
              <Trophy size={15} color="#fde047" />
              आधिकारिक नकद पुरस्कार राशि (Official Cash Prize Money)
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: '#0f172a', margin: '8px 0 10px 0', fontWeight: 900 }}>
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
            border: '2px solid #0f172a',
            borderTop: '5px solid #0f172a',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  21.097 KM • COMPETITIVE TIMED
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                21 KM हाफ मैराथन
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
                अनुभवी एथलीट्स, पुलिस बल एवं मैराथन धावकों हेतु शीर्ष ओपन पोडियम
              </p>

              {/* Podium Breakdown (Dark Black Theme) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1.5px solid #0f172a',
                  color: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥇</span>
                    <span>1st Prize (प्रथम विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#fde047' }}>₹21,000</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥈</span>
                    <span>2nd Prize (द्वितीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>₹11,000</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥉</span>
                    <span>3rd Prize (तृतीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>₹5,100</span>
                </div>
              </div>

              {/* Included Perks */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                ✔ RFID टाइमिंग चिप बिब • ✔ आधिकारिक फिनिशर मेडल • ✔ ड्राई-फिट टी-शर्ट • ✔ DGP सर्टिफिकेट • ✔ ब्रेकफास्ट
              </div>
            </div>
          </div>

          {/* CARD 2: 10 KM Speed Run */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #0f172a',
            borderTop: '5px solid #0f172a',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  10.0 KM • SPEED CHALLENGE
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                10 KM स्पीड रन
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
                युवा धावकों, कॉलेज एथलीट्स एवं फिटनेस उत्साही लोगों के लिए टाइमड रन
              </p>

              {/* Podium Breakdown (Dark Black Theme) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1.5px solid #0f172a',
                  color: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥇</span>
                    <span>1st Prize (प्रथम विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#fde047' }}>₹11,000</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥈</span>
                    <span>2nd Prize (द्वितीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>₹5,100</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥉</span>
                    <span>3rd Prize (तृतीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>₹2,100</span>
                </div>
              </div>

              {/* Included Perks */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                ✔ RFID टाइमिंग चिप बिब • ✔ आधिकारिक फिनिशर मेडल • ✔ ड्राई-फिट टी-शर्ट • ✔ ई-सर्टिफिकेट • ✔ हाइड्रेशन
              </div>
            </div>
          </div>

          {/* CARD 3: 5KM, 2KM & Adapted Course (Inclusive) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #0f172a',
            borderTop: '5px solid #0f172a',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  5K • 2K • ADAPTED COURSE
                </span>
                <span style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1'
                }}>
                  प्रतिभागी किट
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                5K / 2K व Adapted Course
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
                कम्युनिटी, परिवार, महिलाएं एवं दिव्यांग चैंपियंस (Inclusive Run)
              </p>

              {/* Perks Highlights Box (Dark Black Theme) */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #0f172a',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>🥇</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.96rem' }}>आधिकारिक फिनिशर मेडल (Medal)</div>
                    <div style={{ fontSize: '0.76rem', color: '#475569' }}>प्रत्येक फिनिशर को समापन पर गौरव पदक</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>👕</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.96rem' }}>ड्राई-फिट टी-शर्ट (Official T-Shirt)</div>
                    <div style={{ fontSize: '0.76rem', color: '#475569' }}>जयपुर फ्लैगशिप एक्सपो से आधिकारिक टी-शर्ट</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>🥪</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.96rem' }}>पोस्ट-रन रिफ्रेशमेंट्स (Refreshments)</div>
                    <div style={{ fontSize: '0.76rem', color: '#475569' }}>एनर्जी ब्रेकफास्ट, हाइड्रेशन एवं मेडिकल सपोर्ट</div>
                  </div>
                </div>
              </div>

              {/* Special Note for Adapted Course */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#0f172a" />
                <span>Adapted Course: दिव्यांग धावकों हेतु विशेष वालंटियर एस्कॉर्ट व सुरक्षित ट्रैक</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Banner Note & CTA */}
        <div style={{
          background: '#0f172a',
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
