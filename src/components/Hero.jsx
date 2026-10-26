import React, { useState, useEffect } from 'react';
import { Shield, Calendar, MapPin, Users, Award, ChevronRight, Heart, Bell, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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

  // Letter-by-letter typing animation for "RUN FOR HER" in repeat mode
  const [typedTitle, setTypedTitle] = useState('');
  const [isDeletingTitle, setIsDeletingTitle] = useState(false);
  const FULL_TITLE = "RUN FOR HER";

  useEffect(() => {
    let timeout;
    const typingSpeed = isDeletingTitle ? 60 : 120;
    const pauseBeforeDelete = 2400; // Pause when full text is typed
    const pauseBeforeRestart = 500;  // Pause before re-typing

    if (!isDeletingTitle && typedTitle === FULL_TITLE) {
      timeout = setTimeout(() => setIsDeletingTitle(true), pauseBeforeDelete);
    } else if (isDeletingTitle && typedTitle === '') {
      timeout = setTimeout(() => setIsDeletingTitle(false), pauseBeforeRestart);
    } else {
      timeout = setTimeout(() => {
        setTypedTitle(prev =>
          isDeletingTitle
            ? FULL_TITLE.substring(0, prev.length - 1)
            : FULL_TITLE.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [typedTitle, isDeletingTitle]);

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
      background: 'linear-gradient(180deg, #ffffff 0%, #f4f6fa 100%)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: '20px',
      paddingBottom: '60px'
    }}>
      {/* Official State Notice Ticker (Repeated Loop moving Left-to-Right) */}
      <div className="container" style={{ marginBottom: '24px' }}>
        <div className="notice-ticker-wrapper">
          <div className="notice-ticker-badge">
            <span className="pulse-dot"></span>
            <Bell size={13} />
            <span>लाइव सूचना / NOTICE</span>
          </div>

          <div className="notice-ticker-track-container">
            <div className="notice-ticker-track">
              {/* Loop Duplicate 1 */}
              {notices.map((n, i) => (
                <div key={`n1-${i}`} className="notice-item">
                  <span style={{
                    background: 'rgba(10, 28, 61, 0.08)',
                    color: 'var(--police-navy-800)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {n.tag}
                  </span>
                  <span>{n.text}</span>
                  <span className="notice-item-divider"></span>
                </div>
              ))}

              {/* Loop Duplicate 2 for seamless infinite loop */}
              {notices.map((n, i) => (
                <div key={`n2-${i}`} className="notice-item">
                  <span style={{
                    background: 'rgba(10, 28, 61, 0.08)',
                    color: 'var(--police-navy-800)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {n.tag}
                  </span>
                  <span>{n.text}</span>
                  <span className="notice-item-divider"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Dignitary & Official Patron Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span className="badge-gov">
            <Shield size={13} color="var(--police-navy-800)" /> राजस्थान पुलिस का राज्यव्यापी जन-आंदोलन
          </span>
          <span className="badge-pink">
            <Heart size={13} /> नारी सुरक्षा, गरिमा एवं सशक्तिकरण
          </span>
        </div>

        {/* Hero Headings (High Contrast Light Theme) */}
        <div style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
            fontWeight: 800,
            color: 'var(--police-gold-700)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            RAJASTHAN POLICE MARATHON 2026
          </div>

          {/* Animated Main Title */}
          <div style={{
            minHeight: 'clamp(2.6rem, 6vw, 4.8rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--police-navy-900)',
              textTransform: 'uppercase',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}>
              <span>{typedTitle}</span>
              <span className="typewriter-cursor">|</span>
            </h1>
          </div>

          {/* Slogans from Official PDF */}
          <div style={{ width: '100%', marginBottom: '18px' }}>
            <div style={{
              background: 'var(--crimson-50)',
              border: '1px solid rgba(201, 24, 74, 0.25)',
              display: 'inline-block',
              padding: '8px 24px',
              borderRadius: '100px'
            }}>
              <span style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.4rem)',
                fontWeight: 800,
                color: 'var(--crimson-600)',
                letterSpacing: '0.02em'
              }}>
                "Every Step for Her Safety — हर कदम नारी सुरक्षा के लिए"
              </span>
            </div>
          </div>

          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
            color: 'var(--text-body)',
            maxWidth: '780px',
            margin: '0 auto 28px auto',
            lineHeight: 1.6
          }}>
            <strong>Run Together. Stand Together. Make Rajasthan Safer.</strong> <strong>20 दिसंबर 2026</strong> को पुलिस महानिदेशक (DGP) <strong>राजीव शर्मा (IPS)</strong> के नेतृत्व में जयपुर के प्रतिष्ठित अल्बर्ट हॉल से 10,000+ नागरिकों का फ्लैगशिप रन एवं प्रदेश के सभी 50 पुलिस जिलों में एक साथ 5KM/10KM कम्युनिटी रन।
          </p>

          {/* Action Buttons - Rounded Shape with Glassmorphism & Eye-catching Sway/Gleam */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '38px' }}>
            <button 
              onClick={onOpenRegister} 
              className="btn-glass-primary btn-glass-register" 
              style={{ padding: '15px 32px', fontSize: '1.04rem', fontWeight: 800 }}
              title="निःशुल्क इंडिविजुअल रजिस्ट्रेशन"
            >
              <Sparkles size={19} />
              <span>इंडिविजुअल रजिस्ट्रेशन (निःशुल्क)</span>
              <ArrowRight size={17} />
            </button>
            <button 
              onClick={onOpenBulkRegister} 
              className="btn-glass-navy" 
              style={{ padding: '15px 26px', fontSize: '0.98rem', fontWeight: 800 }}
              title="ग्रुप व बल्क रजिस्ट्रेशन"
            >
              <Shield size={19} color="var(--police-gold-400)" />
              <span>🏢 ग्रुप / बल्क रजिस्ट्रेशन (RPA/कॉलेज)</span>
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('photos') : scrollTo('story-generator')} 
              className="btn-glass-gold" 
              style={{ padding: '14px 22px', fontSize: '0.94rem' }}
            >
              📱 WhatsApp स्टेटस बनाएं
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('photos') : scrollTo('photos')} 
              className="btn-secondary" 
              style={{ padding: '14px 22px', fontSize: '0.92rem' }}
            >
              📸 AI फोटो खोजें
            </button>
          </div>

          {/* Official Countdown Card (Clean White Surface) */}
          <div className="gov-card" style={{
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            padding: '22px 26px',
            border: '2px solid var(--border-medium)',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--police-navy-800)', fontWeight: 800, fontSize: '0.9rem' }}>
                <Calendar size={18} color="var(--police-navy-800)" />
                <span>RACE DAY COUNTDOWN • 20 DEC 2026 • JAIPUR & ALL DISTRICTS</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--crimson-600)', fontWeight: 700 }}>
                Flag-off: 20 दिसंबर 2026, सुबह 06:00 AM by DGP Rajeev Sharma, IPS
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
                  background: 'var(--police-navy-50)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 4px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
                    fontWeight: 900,
                    color: 'var(--police-navy-900)',
                    lineHeight: 1
                  }}>
                    {item.val}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', marginTop: '4px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Facts / Dignitary Protocols Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <div className="gov-card" style={{ padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--police-navy-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={22} color="var(--police-navy-800)" />
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>
                  {totalRegistered.toLocaleString()}+
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>पंजीकृत धावक (Statewide)</div>
              </div>
            </div>

            <div className="gov-card" style={{ padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--police-gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={22} color="var(--police-gold-700)" />
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>50 पुलिस जिले</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>एक साथ 5K/10K का आयोजन</div>
              </div>
            </div>

            <div className="gov-card" style={{ padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--crimson-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={22} color="var(--crimson-600)" />
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>माननीय मुख्यमंत्री</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>शाम के समारोह में पदक वितरण</div>
              </div>
            </div>
          </div>

          {/* Quick Portal Access Hub (Multi-Page Navigation Grid) */}
          <div style={{ marginTop: '36px', textAlign: 'center' }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--police-gold-700)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              ★ आधिकारिक पोर्टल सेवाएं एवं अनुभाग (PORTAL DIRECTORY) ★
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {[
                { id: 'categories', icon: '🏃', title: 'दौड़ श्रेणियां', desc: '21K, 10K, 5K, 2K विवरण' },
                { id: 'route-schedule', icon: '🗺️', title: 'रूट व एक्सपो', desc: 'रूट मैप व किट वितरण' },
                { id: 'districts', icon: '🏛️', title: '50 पुलिस जिले', desc: 'जिला वेन्यू व नोडल अधिकारी' },
                { id: 'certificates', icon: '🏆', title: 'सर्टिफिकेट', desc: 'ई-सर्टिफिकेट डाउनलोड व सत्यापन' },
                { id: 'photos', icon: '📸', title: 'AI फोटो खोजें', desc: 'चेहरा व बिब फोटो फाइंडर' },
                { id: 'pledge-safety', icon: '❤️', title: 'नारी सुरक्षा', desc: 'सुरक्षा संकल्प व 1090/112' }
              ].map(card => (
                <button
                  key={card.id}
                  onClick={() => onNavigate ? onNavigate(card.id) : scrollTo(card.id)}
                  className="gov-card"
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--police-gold-500)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{card.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>{card.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{card.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
