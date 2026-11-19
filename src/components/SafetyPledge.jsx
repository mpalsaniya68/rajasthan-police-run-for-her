import React, { useState } from 'react';
import { Heart, CheckCircle2, Share2, Shield } from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

export function SafetyPledge() {
  const { t, isHindi } = useLanguage();
  const [pledgeName, setPledgeName] = useState("");
  const [pledged, setPledged] = useState(false);

  const handleTakePledge = (e) => {
    e.preventDefault();
    if (!pledgeName.trim()) {
      alert(isHindi ? "कृपया शपथ हस्ताक्षर हेतु अपना नाम दर्ज करें।" : "Please enter your full name to sign the pledge.");
      return;
    }
    setPledged(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}
  };

  const sharePledge = () => {
    const text = isHindi
      ? `🌟 मैंने राजस्थान पुलिस मैराथन - "RUN FOR HER" के तहत महिला सुरक्षा, गरिमा और समानता की शपथ ली है। आप भी राजस्थान पुलिस के साथ जुड़ें और शपथ लें: ${window.location.origin}#pledge 👮‍♂️🤝👩 #RunForHer #RajasthanPolice`
      : `🌟 I have taken the Women's Safety Pledge with Rajasthan Police Marathon - "RUN FOR HER". Join Rajasthan Police and take the pledge: ${window.location.origin}#pledge 👮‍♂️🤝👩 #RunForHer #RajasthanPolice`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="pledge" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        {/* Header - Only Middle Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', color: 'var(--police-navy-950)', margin: 0, fontWeight: 900 }}>
            {t('pledgeHeading')}
          </h2>
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
                <h3 style={{ fontSize: '1.25rem', color: 'var(--police-navy-900)', margin: 0 }}>
                  {isHindi ? 'महिला सुरक्षा संकल्प' : "Women's Safety Oath"}
                </h3>
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
                {isHindi 
                  ? '"मैं यह सत्यनिष्ठा से संकल्प लेता/लेती हूँ कि मैं सार्वजनिक स्थलों, कार्यस्थलों एवं समाज में महिलाओं और बालिकाओं की गरिमा, सुरक्षा और समानता के लिए सदैव तत्पर रहूँगा/रहूँगी। मैं उत्पीड़न का सक्रिय विरोध करूँगा/करूँगी और राजस्थान पुलिस के साथ मिलकर एक सुरक्षित राजस्थान का निर्माण करूँगा/करूँगी।"'
                  : '"I solemnly pledge that I shall always stand for the dignity, safety, and equality of women and girls in public spaces, workplaces, and society. I will actively oppose harassment and collaborate with Rajasthan Police to build a safe Rajasthan."'}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--police-gold-700)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontWeight: 600 }}>
                Every Step for Her Safety • {isHindi ? 'हर कदम नारी सुरक्षा के लिए' : 'Every Step for Women Safety'}
              </div>
            </div>

            {/* Form */}
            {!pledged ? (
              <form onSubmit={handleTakePledge} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder={isHindi ? "शपथ पत्र पर अपना नाम दर्ज करें..." : "Enter your full name to take the pledge..."}
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
                  <Heart size={15} /> {isHindi ? 'शपथ लें & बैज पाएं' : 'Take Pledge & Get Badge'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#dcfce7', border: '1px solid #86efac', padding: '12px 16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#15803d" />
                  <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                    {isHindi ? `धन्यवाद ${pledgeName}! आपका संकल्प पंजीकृत हो चुका है।` : `Thank you ${pledgeName}! Your pledge has been registered.`}
                  </span>
                </div>
                <button onClick={sharePledge} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                  <Share2 size={13} /> {isHindi ? 'शेयर करें' : 'Share'}
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
                  <div translate="no" className="notranslate" style={{ fontSize: '0.62rem', color: 'var(--crimson-600)', fontWeight: 700 }}>RUN FOR HER 2027</div>
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
              <Share2 size={14} color="#25D366" /> {isHindi ? 'WhatsApp स्टेटस पर लगाएं' : 'Share on WhatsApp'}
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
