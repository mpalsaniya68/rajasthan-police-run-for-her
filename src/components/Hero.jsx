import React, { useState, useEffect } from 'react';
import { Timer, Bell, ArrowRight } from 'lucide-react';

export function Hero({ onOpenRegister, onOpenFindPass, totalRegistered = "1000+" }) {
  // Live Countdown logic strictly targeted to 3 January 2027, 06:00:00 AM IST
  const TARGET_DATE = new Date(2027, 0, 3, 6, 0, 0); // 3 January 2027, 06:00:00 local IST

  const calculateTimeLeft = () => {
    const diff = TARGET_DATE.getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isPassed: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notices = [
    { text: "राजस्थान पुलिस मैराथन 'RUN FOR HER' — रेस दिवस: 3 जनवरी 2027", tag: "इवेंट तिथि" },
    { text: "अल्बर्ट हॉल, जयपुर एवं प्रदेश के समस्त पुलिस जिलों में एक साथ भव्य आयोजन", tag: "वेन्यू" },
    { text: "प्रातः 06:00 बजे फ्लैग-ऑफ ऐतिहासिक अल्बर्ट हॉल, जयपुर से", tag: "फ्लैग-ऑफ" },
    { text: "21K, 10K, 5K एवं 2K श्रेणियों हेतु आधिकारिक ऑनलाइन पंजीकरण जारी है", tag: "पंजीकरण" },
    { text: "आधिकारिक डिजिटल ई-पास व क्यूआर कोड तुरंत डाउनलोड करें", tag: "ई-पास पोर्टल" },
    { text: "महिला सुरक्षा हेल्पलाइन 1090 (गरिमा) एवं 112 चौबीसों घंटे आपकी सेवा में तत्पर", tag: "सुरक्षा" }
  ];

  return (
    <section id="hero" className="hero-section">
      {/* 0. Background Photo Layer (Crisply framed and responsive on mobile & desktop) */}
      <div className="hero-bg-photo" />

      {/* 1. Neutral Subtle Dark Contrast Tint (Zero Color Cast - Keeps photo 100% natural) */}
      <div className="hero-base-tint" />

      {/* Hero Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Official State Notice Ticker (Full Width Edge-to-Edge with Enhanced Font) */}
        <div style={{ width: '100%', marginBottom: '22px' }}>
          <div className="hero-ticker-container" style={{
            width: '100%',
            background: 'rgba(5, 17, 38, 0.96)',
            backdropFilter: 'blur(12px)',
            borderTop: '1.5px solid rgba(212, 175, 55, 0.45)',
            borderBottom: '1.5px solid rgba(212, 175, 55, 0.45)',
            borderLeft: 'none',
            borderRight: 'none',
            borderRadius: '0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            height: '48px'
          }}>


            {/* Marquee Track */}
            <div className="notice-ticker-track-container" style={{
              maskImage: 'linear-gradient(90deg, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)'
            }}>
              <div className="notice-ticker-track">
                {notices.map((n, i) => (
                  <div key={`n-${i}`} className="notice-item" style={{ color: '#ffffff', fontSize: '0.96rem' }}>
                    <span style={{
                      background: 'rgba(212, 175, 55, 0.25)',
                      color: '#fef08a',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      border: '1px solid rgba(212, 175, 55, 0.5)'
                    }}>
                      {n.tag}
                    </span>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.96rem' }}>{n.text}</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Hero Headings - Majestic, Authoritative & Grounded */}
          <div style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
            
            <div style={{
              fontSize: 'clamp(0.85rem, 2vw, 1.15rem)',
              fontWeight: 800,
              color: '#fde68a',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '6px',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              ★ RAJASTHAN POLICE STATEWIDE MARATHON 2027 ★
            </div>

            <h1 style={{
              fontSize: 'clamp(2.3rem, 6.5vw, 4.6rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              textTransform: 'uppercase',
              margin: '0 0 12px 0',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
            }}>
              RUN FOR HER
            </h1>

            {/* Slogan Banner */}
            <div style={{ width: '100%', marginBottom: '24px' }}>
              <div className="hero-slogan-wrap" style={{
                background: '#b91c1c',
                border: '1px solid #991b1b',
                display: 'inline-block',
                padding: '6px 20px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
              }}>
                <span style={{
                  fontSize: 'clamp(0.92rem, 2.2vw, 1.35rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '0.02em'
                }}>
                  "हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के नाम"
                </span>
              </div>
            </div>

            {/* Action CTAs - Responsive Full-Width on Mobile, Thumb Reachable */}
            <div className="hero-cta-group">
              <button 
                onClick={onOpenRegister} 
                style={{
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  padding: '14px 32px',
                  borderRadius: '50px',
                  fontSize: '1rem',
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
                title="ऑनलाइन पंजीकरण पोर्टल"
              >
                <span>पंजीकरण करें</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={onOpenFindPass} 
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.45)',
                  padding: '14px 24px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title="खोया हुआ ई-पास खोजें व पुनः डाउनलोड करें"
              >
                <span>🔍 ई-पास / बिब खोजें</span>
              </button>
            </div>

            {/* Transparent Glassmorphic Countdown Card */}
            <div className="hero-countdown-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fde68a', fontWeight: 800, fontSize: '0.94rem', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '10px' }}>
                <Timer size={18} color="#fde68a" />
                <span style={{ letterSpacing: '0.04em' }}>इवेंट काउंटडाउन</span>
              </div>

              <div className="hero-countdown-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                {[
                  { label: 'दिन', val: String(timeLeft.days).padStart(2, '0') },
                  { label: 'घंटे', val: String(timeLeft.hours).padStart(2, '0') },
                  { label: 'मिनट', val: String(timeLeft.minutes).padStart(2, '0') },
                  { label: 'सेकंड', val: String(timeLeft.seconds).padStart(2, '0') }
                ].map((item, idx) => (
                  <div key={idx} className="hero-countdown-box" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '14px 8px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                  }}>
                    <div className="hero-countdown-val" style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                      fontWeight: 900,
                      color: '#fde68a',
                      lineHeight: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}>
                      {item.val}
                    </div>
                    <div className="hero-countdown-lbl" style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 800, letterSpacing: '0.04em', marginTop: '6px' }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Responsive 50/50 Dual-Tone Police Banner Styles */}
      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          background-image: url('/images/marathon_hero_jaipur.jpg');
          background-size: cover;
          background-position: center 25%;
          background-repeat: no-repeat;
          color: #ffffff;
          border-bottom: 1px solid var(--border-subtle);
          padding-top: 20px;
          padding-bottom: 56px;
        }

        .hero-bg-photo {
          position: absolute;
          inset: 0;
          background-image: url('/images/marathon_hero_jaipur.jpg');
          background-size: cover;
          background-position: center 25%;
          background-repeat: no-repeat;
          z-index: 0;
          pointer-events: none;
        }

        .hero-base-tint {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
          pointer-events: none;
        }



        .hero-cta-group {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 34px;
        }

        .hero-countdown-card {
          max-width: 680px;
          margin: 0 auto;
          padding: 20px 24px;
          border-radius: 16px;
          background: rgba(10, 28, 61, 0.4);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }

        /* Mobile Specific Responsive Optimization (< 768px) */
        @media (max-width: 767px) {
          .hero-section {
            padding-top: 12px !important;
            padding-bottom: 36px !important;
          }

          .hero-bg-photo {
            background-position: center center !important;
            background-size: cover !important;
            opacity: 0.42 !important;
          }

          /* Maintain true triangle dual-tone on mobile as well */

          .hero-ticker-container {
            height: 42px !important;
            margin-bottom: 14px !important;
          }

          .hero-ticker-badge {
            padding: 0 12px !important;
            font-size: 0.8rem !important;
          }

          .hero-crest-badge {
            padding: 4px 12px !important;
            font-size: 0.74rem !important;
            margin-bottom: 10px !important;
          }

          .hero-slogan-wrap {
            padding: 6px 16px !important;
          }

          .hero-desc-text {
            margin-bottom: 20px !important;
            line-height: 1.5 !important;
          }

          /* Stack buttons neatly on mobile for thumb reachability */
          .hero-cta-group {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 360px !important;
            margin: 0 auto 22px auto !important;
            gap: 10px !important;
          }

          .hero-cta-group button {
            width: 100% !important;
            justify-content: center !important;
            padding: 13px 18px !important;
            font-size: 0.94rem !important;
            min-height: 48px !important;
            border-radius: 50px !important;
          }

          /* Compact 4-cell countdown for mobile screens */
          .hero-countdown-card {
            padding: 14px 10px !important;
            margin-bottom: 20px !important;
          }

          .hero-countdown-grid {
            gap: 6px !important;
          }

          .hero-countdown-box {
            padding: 8px 3px !important;
            border-radius: 8px !important;
          }

          .hero-countdown-val {
            font-size: 1.45rem !important;
          }

          .hero-countdown-lbl {
            font-size: 0.64rem !important;
            margin-top: 4px !important;
          }

          /* Compact 1-column facts on mobile */
          .hero-facts-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .hero-fact-card {
            padding: 10px 14px !important;
          }
        }
      `}</style>
    </section>
  );
}
