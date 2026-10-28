import React, { useState, useEffect } from 'react';
import { Shield, Calendar, MapPin, Users, Award, Heart, Bell, CheckCircle2, ArrowRight, Sparkles, Radio } from 'lucide-react';
import { RunForHerBadge, PoliceEmblem } from './Emblems';

export function Hero({ onOpenRegister, onOpenBulkRegister, onNavigate, totalRegistered = 18450 }) {
  // Live Countdown logic targeted to 20 December 2026, 06:00:00 AM
  const TARGET_DATE = new Date('2026-12-20T06:00:00');

  const calculateTimeLeft = () => {
    const diff = TARGET_DATE.getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notices = [
    { text: "राजस्थान पुलिस मैराथन 'RUN FOR HER' — रेस दिवस: 20 दिसंबर 2026", tag: "इवेंट तिथि" },
    { text: "अल्बर्ट हॉल, जयपुर एवं प्रदेश के सभी 50 पुलिस जिलों में एक साथ भव्य आयोजन", tag: "वेन्यू" },
    { text: "प्रातः 06:00 बजे फ्लैग-ऑफ पुलिस महानिदेशक (DGP) राजीव शर्मा (IPS) द्वारा", tag: "फ्लैग-ऑफ" },
    { text: "21K, 10K, 5K एवं 2K श्रेणियों हेतु निःशुल्क ऑनलाइन पंजीकरण जारी है", tag: "रजिस्ट्रेशन" },
    { text: "संस्थाओं, कॉलेजों व RPA बटालियनों हेतु बल्क / ग्रुप रजिस्ट्रेशन उपलब्ध", tag: "ग्रुप पोर्टल" },
    { text: "महिला सुरक्षा हेल्पलाइन 1090 (गरिमा) एवं 112 चौबीसों घंटे आपकी सेवा में तत्पर", tag: "सुरक्षा" }
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" style={{
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `url('/images/marathon_hero_jaipur.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 25%',
      backgroundRepeat: 'no-repeat',
      color: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: '20px',
      paddingBottom: '60px'
    }}>
      {/* 1. Base Subtle Dark Tint (Keeps the background photo clearly visible) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5, 17, 38, 0.45) 0%, rgba(10, 28, 61, 0.55) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* 2. Right-Angled Triangle Overlay: Subtle Rajasthan Police Red + Blue Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: 'polygon(0 0, 100% 0, 100% 100%)', // Right-angled triangle (90° right angle at Top-Right)
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.45) 0%, rgba(185, 28, 28, 0.32) 42%, rgba(10, 28, 61, 0.55) 88%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* 3. Subtle Complementary Triangle with 90° angle at Bottom-Left */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: 'polygon(0 0, 0 100%, 100% 100%)', // Right-angled triangle (90° right angle at Bottom-Left)
        background: 'linear-gradient(135deg, rgba(10, 28, 61, 0.6) 0%, rgba(15, 23, 42, 0.45) 65%, rgba(185, 28, 28, 0.22) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* 4. Sleek Golden Diagonal Accent Line along the Hypotenuse */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom right, transparent calc(50% - 1.5px), rgba(212, 175, 55, 0.4) 50%, transparent calc(50% + 1.5px))',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Hero Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Official State Notice Ticker (Dark Theme - High Contrast) */}
        <div className="container" style={{ marginBottom: '28px' }}>
        <div style={{
          background: 'rgba(5, 17, 38, 0.96)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(212, 175, 55, 0.5)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
          height: '46px'
        }}>
          {/* Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
            color: '#ffffff',
            padding: '0 16px',
            height: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 900,
            fontSize: '0.78rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flexShrink: 0,
            zIndex: 3,
            boxShadow: '4px 0 12px rgba(0, 0, 0, 0.4)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fef08a', display: 'inline-block', boxShadow: '0 0 8px #fef08a' }}></span>
            <Bell size={13} color="#fef08a" />
            <span style={{ color: '#ffffff' }}>लाइव सूचना / NOTICE</span>
          </div>

          {/* Marquee Track */}
          <div className="notice-ticker-track-container" style={{
            maskImage: 'linear-gradient(90deg, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)'
          }}>
            <div className="notice-ticker-track">
              {notices.map((n, i) => (
                <div key={`n1-${i}`} className="notice-item" style={{ color: '#ffffff' }}>
                  <span style={{
                    background: 'rgba(212, 175, 55, 0.22)',
                    color: '#fef08a',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    border: '1px solid rgba(212, 175, 55, 0.4)'
                  }}>
                    {n.tag}
                  </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{n.text}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', opacity: 0.85 }}></span>
                </div>
              ))}
              {notices.map((n, i) => (
                <div key={`n2-${i}`} className="notice-item" style={{ color: '#ffffff' }}>
                  <span style={{
                    background: 'rgba(212, 175, 55, 0.22)',
                    color: '#fef08a',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    border: '1px solid rgba(212, 175, 55, 0.4)'
                  }}>
                    {n.tag}
                  </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{n.text}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', opacity: 0.85 }}></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Official Organizing Body Crest Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{
            background: 'rgba(5, 17, 38, 0.88)',
            backdropFilter: 'blur(10px)',
            color: '#fde68a',
            padding: '7px 22px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 800,
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            letterSpacing: '0.03em'
          }}>
            <Shield size={15} color="#fde68a" />
            <span>राजस्थान पुलिस मुख्यालय, जयपुर | राज्यव्यापी जन-अभियान • नारी सुरक्षा, गरिमा एवं सशक्तिकरण</span>
          </div>
        </div>

        {/* Hero Headings - Majestic, Authoritative & Grounded */}
        <div style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
          
          <div style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
            fontWeight: 800,
            color: '#fde68a',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '8px',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            ★ RAJASTHAN POLICE STATEWIDE MARATHON 2026 ★
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.6rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            textTransform: 'uppercase',
            margin: '0 0 14px 0',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
          }}>
            RUN FOR HER
          </h1>

          {/* Slogan Banner */}
          <div style={{ width: '100%', marginBottom: '22px' }}>
            <div style={{
              background: 'rgba(201, 24, 74, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'inline-block',
              padding: '10px 28px',
              borderRadius: '100px',
              boxShadow: '0 4px 15px rgba(201, 24, 74, 0.4)'
            }}>
              <span style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.35rem)',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.02em'
              }}>
                "हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के नाम"
              </span>
            </div>
          </div>

          {/* Core Descriptive Text */}
          <p style={{
            fontSize: 'clamp(0.98rem, 1.9vw, 1.15rem)',
            color: '#f1f5f9',
            maxWidth: '820px',
            margin: '0 auto 32px auto',
            lineHeight: 1.65,
            textShadow: '0 2px 10px rgba(0,0,0,0.6)'
          }}>
            <strong>20 दिसंबर 2026</strong> को पुलिस महानिदेशक (DGP) <strong>राजीव शर्मा (IPS)</strong> के नेतृत्व में जयपुर के ऐतिहासिक अल्बर्ट हॉल से 10,000+ नागरिकों का फ्लैगशिप रन एवं प्रदेश के सभी 50 पुलिस जिलों में एक साथ 5KM/10KM कम्युनिटी रन।
          </p>

          {/* Action CTAs - Human, Tactile & High-Contrast */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '38px' }}>
            <button 
              onClick={onOpenRegister} 
              style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                padding: '15px 32px',
                borderRadius: '8px',
                fontSize: '1.02rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(225, 29, 72, 0.45)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              title="निःशुल्क इंडिविजुअल रजिस्ट्रेशन"
            >
              <span>इंडिविजुअल रजिस्ट्रेशन (निःशुल्क)</span>
              <ArrowRight size={18} />
            </button>

            <button 
              onClick={onOpenBulkRegister} 
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                padding: '15px 24px',
                borderRadius: '8px',
                fontSize: '0.96rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="ग्रुप व बल्क रजिस्ट्रेशन"
            >
              <Shield size={18} color="var(--police-gold-400)" />
              <span>ग्रुप व संस्थागत रजिस्ट्रेशन (RPA / कॉलेज)</span>
            </button>

            <button 
              onClick={() => onNavigate ? onNavigate('live-tracker') : scrollTo('live-tracker')} 
              style={{
                background: 'rgba(220, 38, 38, 0.2)',
                border: '1.5px solid #f87171',
                color: '#fecaca',
                padding: '15px 22px',
                borderRadius: '8px',
                fontSize: '0.94rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Radio size={16} color="#ef4444" />
              <span>🔴 लाइव रनर ट्रैकर (RFID)</span>
            </button>
          </div>

          {/* Official Countdown Card (Glassmorphic Dignified White Surface) */}
          <div style={{
            maxWidth: '720px',
            margin: '0 auto 36px auto',
            padding: '24px 28px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            border: '2px solid rgba(212, 175, 55, 0.5)',
            color: 'var(--police-navy-950)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--police-navy-900)', fontWeight: 800, fontSize: '0.92rem' }}>
                <Calendar size={18} color="var(--police-navy-900)" />
                <span>RACE DAY COUNTDOWN • 20 DEC 2026</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--crimson-600)', fontWeight: 800 }}>
                फ्लैग-ऑफ: 20 दिसंबर 2026, सुबह 06:00 AM • अल्बर्ट हॉल, जयपुर
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
              {[
                { label: 'दिन (DAYS)', val: timeLeft.days },
                { label: 'घंटे (HOURS)', val: String(timeLeft.hours).padStart(2, '0') },
                { label: 'मिनट (MINS)', val: String(timeLeft.minutes).padStart(2, '0') },
                { label: 'सेकंड (SECS)', val: String(timeLeft.seconds).padStart(2, '0') }
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: '#0a1c3d',
                  borderRadius: '10px',
                  padding: '14px 6px',
                  border: '1.5px solid #d4af37',
                  boxShadow: '0 4px 14px rgba(10, 28, 61, 0.25)'
                }}>
                  <div style={{
                    fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
                    fontWeight: 900,
                    color: '#fde68a',
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {item.val}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#f1f5f9', fontWeight: 800, letterSpacing: '0.04em', marginTop: '6px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Administrative Facts Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '14px'
          }}>
            <div style={{
              background: 'rgba(10, 28, 61, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#fef08a" />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fde68a' }}>{totalRegistered.toLocaleString()}+</div>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>पंजीकृत नागरिक व पुलिस धावक</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(10, 28, 61, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="#fca5a5" />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>50 पुलिस जिले</div>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>एक साथ 5K/10K का राज्यव्यापी आयोजन</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(10, 28, 61, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} color="#86efac" />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#86efac' }}>माननीय मुख्यमंत्री</div>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>शाम 06:00 बजे पदक वितरण समारोह</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
);
}
