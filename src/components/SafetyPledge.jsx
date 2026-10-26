import React, { useState } from 'react';
import { Heart, CheckCircle2, Share2, Download, Shield } from 'lucide-react';
import { PoliceEmblem, RunForHerBadge } from './Emblems';
import confetti from 'canvas-confetti';

export function SafetyPledge() {
  const [pledgeName, setPledgeName] = useState("");
  const [pledged, setPledged] = useState(false);
  const [pledgeCount, setPledgeCount] = useState(26540);

  const handleTakePledge = (e) => {
    e.preventDefault();
    if (!pledgeName.trim()) {
      alert("कृपया शपथ हस्ताक्षर हेतु अपना नाम दर्ज करें।");
      return;
    }
    setPledged(true);
    setPledgeCount(prev => prev + 1);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}
  };

  const sharePledge = () => {
    const text = `🌟 मैंने राजस्थान पुलिस मैराथन - "RUN FOR HER" के तहत महिला सुरक्षा, गरिमा और समानता की शपथ ली है। आप भी राजस्थान पुलिस के साथ जुड़ें और शपथ लें: ${window.location.origin}#pledge 👮‍♂️🤝👩 #RunForHer #RajasthanPolice`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="pledge" className="section-padding" style={{ position: 'relative', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-pink">The Soul of the Movement</span>
          <h2>नारी सुरक्षा सामूहिक शपथ (Women's Safety Pledge)</h2>
          <p>
            महिला सुरक्षा सिर्फ पुलिस की नहीं, बल्कि समाज के प्रत्येक नागरिक की साझा जिम्मेदारी है। आज ही इस ऐतिहासिक जन-आंदोलन का हिस्सा बनकर शपथ लें।
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '24px',
          alignItems: 'center'
        }} className="pledge-responsive-grid">
          {/* Left Column: Official Pledge Card */}
          <div className="gov-card" style={{ padding: '28px', border: '2px solid var(--border-medium)', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--crimson-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={22} color="var(--crimson-600)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--police-navy-900)' }}>आधिकारिक महिला सुरक्षा संकल्प</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--crimson-600)', fontWeight: 700 }}>
                  {pledgeCount.toLocaleString()} नागरिकों ने अब तक शपथ ली
                </div>
              </div>
            </div>

            {/* Official Pledge Text */}
            <div style={{
              background: 'var(--police-navy-50)',
              padding: '16px 18px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '10px', fontStyle: 'italic' }}>
                "मैं यह सत्यनिष्ठा से संकल्प लेता/लेती हूँ कि मैं सार्वजनिक स्थलों, कार्यस्थलों एवं समाज में महिलाओं और बालिकाओं की गरिमा, सुरक्षा और समानता के लिए सदैव तत्पर रहूँगा/रहूँगी। मैं उत्पीड़न का सक्रिय विरोध करूँगा/करूँगी और राजस्थान पुलिस के साथ मिलकर एक सुरक्षित राजस्थान का निर्माण करूँगा/करूँगी।"
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--police-gold-700)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontWeight: 600 }}>
                Every Step for Her Safety • हर कदम नारी सुरक्षा के लिए
              </div>
            </div>

            {/* Form */}
            {!pledged ? (
              <form onSubmit={handleTakePledge} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="शपथ पत्र पर अपना नाम दर्ज करें..."
                  value={pledgeName}
                  onChange={(e) => setPledgeName(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  <Heart size={15} /> शपथ लें & बैज पाएं
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#dcfce7', border: '1px solid #86efac', padding: '12px 16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#15803d" />
                  <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                    धन्यवाद {pledgeName}! आपका संकल्प पंजीकृत हो चुका है।
                  </span>
                </div>
                <button onClick={sharePledge} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                  <Share2 size={13} /> शेयर करें
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Virtual Shareable Badge Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: '#ffffff',
              border: '2px solid var(--crimson-600)',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '340px',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Badge Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '14px' }}>
                <PoliceEmblem size={32} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>OFFICIAL SUPPORTER</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--crimson-600)', fontWeight: 700 }}>RUN FOR HER 2026</div>
                </div>
              </div>

              {/* Heart Badge */}
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--crimson-50)', border: '2px solid var(--crimson-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Heart size={28} color="var(--crimson-600)" fill="var(--crimson-600)" />
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                I TOOK THE PLEDGE
              </div>

              <div style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: 'var(--police-navy-900)',
                fontFamily: 'var(--font-heading)',
                margin: '6px 0',
                textTransform: 'uppercase'
              }}>
                {pledgeName || "YOUR NAME"}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                "Standing strong for Women's Safety, Dignity & Equality across Rajasthan."
              </div>

              <div style={{
                background: 'var(--police-navy-50)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                color: 'var(--police-navy-800)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                <Shield size={13} color="var(--police-gold-700)" /> RAJASTHAN POLICE CITIZEN ALLY
              </div>
            </div>

            <button onClick={sharePledge} className="btn-secondary" style={{ marginTop: '14px', padding: '7px 16px', fontSize: '0.82rem' }}>
              <Share2 size={14} color="#25D366" /> WhatsApp स्टेटस पर लगाएं
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .pledge-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
