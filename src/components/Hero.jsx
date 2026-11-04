import React, { useState, useEffect } from 'react';
import { Shield, Calendar, MapPin, Users, Award, Heart, Bell, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { RunForHerBadge, PoliceEmblem } from './Emblems';

export function Hero({ onOpenRegister, onOpenBulkRegister, onNavigate, totalRegistered = 18450 }) {
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
    { text: "प्रातः 06:00 बजे फ्लैग-ऑफ पुलिस महानिदेशक (DGP) राजीव शर्मा (IPS) द्वारा", tag: "फ्लैग-ऑफ" },
    { text: "21K, 10K, 5K एवं 2K श्रेणियों हेतु आधिकारिक ऑनलाइन पंजीकरण जारी है", tag: "पंजीकरण" },
    { text: "संस्थाओं, कॉलेजों व RPA बटालियनों हेतु बल्क / ग्रुप रजिस्ट्रेशन उपलब्ध", tag: "ग्रुप पोर्टल" },
    { text: "महिला सुरक्षा हेल्पलाइन 1090 (गरिमा) एवं 112 चौबीसों घंटे आपकी सेवा में तत्पर", tag: "सुरक्षा" }
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section">
      {/* 0. Background Photo Layer (Crisply framed and responsive on mobile & desktop) */}
      <div className="hero-bg-photo" />

      {/* 1. Neutral Subtle Dark Contrast Tint (Zero Color Cast - Keeps photo 100% natural) */}
      <div className="hero-base-tint" />

      {/* Hero Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Official State Notice Ticker (Dark Theme - High Contrast) */}
        <div className="container" style={{ marginBottom: '20px' }}>
          <div className="hero-ticker-container" style={{
            background: 'rgba(5, 17, 38, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            height: '44px'
          }}>
            {/* Badge */}
            <div className="hero-ticker-badge" style={{
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
              <Bell size={14} color="#fef08a" />
              <span style={{ color: '#ffffff', letterSpacing: '0.04em' }}>आधिकारिक बुलेटिन</span>
            </div>

            {/* Marquee Track */}
            <div className="notice-ticker-track-container" style={{
              maskImage: 'linear-gradient(90deg, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)'
            }}>
              <div className="notice-ticker-track">
                {notices.map((n, i) => (
                  <div key={`n-${i}`} className="notice-item" style={{ color: '#ffffff' }}>
                    <span style={{
                      background: 'rgba(212, 175, 55, 0.25)',
                      color: '#fef08a',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      border: '1px solid rgba(212, 175, 55, 0.5)'
                    }}>
                      {n.tag}
                    </span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{n.text}</span>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Official Organizing Body Crest Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '14px' }}>
            <div className="hero-crest-badge" style={{
              background: 'rgba(5, 17, 38, 0.88)',
              backdropFilter: 'blur(10px)',
              color: '#fde68a',
              padding: '6px 20px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: '1.5px solid rgba(212, 175, 55, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              letterSpacing: '0.03em',
              textAlign: 'center'
            }}>
              <Shield size={15} color="#fde68a" />
              <span>राजस्थान पुलिस मुख्यालय, जयपुर | राज्यव्यापी जन-अभियान • 3 जनवरी 2027</span>
            </div>
          </div>

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
            <div style={{ width: '100%', marginBottom: '16px' }}>
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

            {/* Core Descriptive Text */}
            <p className="hero-desc-text" style={{
              fontSize: 'clamp(0.94rem, 1.8vw, 1.15rem)',
              color: '#f1f5f9',
              maxWidth: '820px',
              margin: '0 auto 26px auto',
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(0,0,0,0.6)'
            }}>
              <strong>3 जनवरी 2027</strong> को पुलिस महानिदेशक (DGP) <strong>राजीव शर्मा (IPS)</strong> के नेतृत्व में जयपुर के ऐतिहासिक अल्बर्ट हॉल से 10,000+ नागरिकों का फ्लैगशिप रन एवं प्रदेश के सभी 41 पुलिस जिलों व कमिश्नरेट में एक साथ 5KM/10KM कम्युनिटी रन।
            </p>

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
                <span>रजिस्ट्रेशन (Register Now)</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={onOpenBulkRegister} 
                style={{
                  background: 'linear-gradient(135deg, #0a1c3d 0%, #152e5a 100%)',
                  color: '#ffffff',
                  border: '1.5px solid var(--police-gold-500)',
                  padding: '14px 26px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(10, 28, 61, 0.45)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1e3a8a';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 28, 61, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0a1c3d 0%, #152e5a 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 28, 61, 0.45)';
                }}
                title="ग्रुप व बल्क रजिस्ट्रेशन"
              >
                <Shield size={18} color="#fde68a" />
                <span>ग्रुप / संस्थागत पंजीकरण (Bulk Entry)</span>
              </button>
            </div>

            {/* Official Countdown Card (Glassmorphic Dignified White Surface) */}
            <div className="hero-countdown-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--police-navy-900)', fontWeight: 800, fontSize: '0.9rem' }}>
                  <Calendar size={18} color="var(--police-navy-900)" />
                  <span>RACE DAY COUNTDOWN • 03 JAN 2027</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.86rem', color: 'var(--crimson-600)', fontWeight: 800 }}>
                    3 जनवरी 2027, प्रातः 06:00 बजे IST
                  </div>
                </div>
              </div>

              <div className="hero-countdown-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                {[
                  { label: 'दिन (DAYS)', val: String(timeLeft.days).padStart(2, '0') },
                  { label: 'घंटे (HOURS)', val: String(timeLeft.hours).padStart(2, '0') },
                  { label: 'मिनट (MINS)', val: String(timeLeft.minutes).padStart(2, '0') },
                  { label: 'सेकंड (SECS)', val: String(timeLeft.seconds).padStart(2, '0') }
                ].map((item, idx) => (
                  <div key={idx} className="hero-countdown-box" style={{
                    background: '#0a1c3d',
                    borderRadius: '10px',
                    padding: '12px 6px',
                    border: '1.5px solid #d4af37',
                    boxShadow: '0 4px 14px rgba(10, 28, 61, 0.25)'
                  }}>
                    <div className="hero-countdown-val" style={{
                      fontSize: 'clamp(1.7rem, 3.8vw, 2.6rem)',
                      fontWeight: 900,
                      color: '#fde68a',
                      lineHeight: 1,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {item.val}
                    </div>
                    <div className="hero-countdown-lbl" style={{ fontSize: '0.72rem', color: '#f1f5f9', fontWeight: 800, letterSpacing: '0.04em', marginTop: '6px' }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Administrative Facts Strip */}
            <div className="hero-facts-grid">
              <div className="hero-fact-card" style={{
                background: '#0a1c3d',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={20} color="#fef08a" />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fde68a' }}>{totalRegistered.toLocaleString()}+</div>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>पंजीकृत नागरिक व पुलिस धावक</div>
                </div>
              </div>

              <div className="hero-fact-card" style={{
                background: '#0a1c3d',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="#fca5a5" />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>समस्त पुलिस जिले</div>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>एक साथ 5K/10K का राज्यव्यापी आयोजन</div>
                </div>
              </div>

              <div className="hero-fact-card" style={{
                background: '#0a1c3d',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={20} color="#86efac" />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#86efac' }}>माननीय मुख्यमंत्री</div>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>शाम 06:00 बजे पदक वितरण समारोह</div>
                </div>
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
          max-width: 720px;
          margin: 0 auto 34px auto;
          padding: 22px 28px;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          border: 2px solid rgba(212, 175, 55, 0.5);
          color: var(--police-navy-950);
        }

        .hero-facts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 14px;
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
            height: 38px !important;
            margin-bottom: 12px !important;
          }

          .hero-ticker-badge {
            padding: 0 10px !important;
            font-size: 0.72rem !important;
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
