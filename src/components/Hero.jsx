import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    src: '/images/marathon_hero_jaipur.jpg',
    alt: 'Rajasthan Police Marathon - Hawa Mahal & Amber Fort Sunrise',
    position: 'center center'
  },
  {
    src: '/images/marathon_hero_slide2.jpg',
    alt: 'Rajasthan Police Marathon - Albert Hall Museum Police & Citizens Run',
    position: 'center 35%'
  },
  {
    src: '/images/marathon_hero_slide3.jpg',
    alt: 'Rajasthan Police Marathon - Women Empowerment Finish Celebration',
    position: 'center 30%'
  },
  {
    src: '/images/marathon_hero_slide4.jpg',
    alt: 'Rajasthan Police Marathon - Udaipur City Palace & Lake Pichola Heritage Run',
    position: 'center 35%'
  },
  {
    src: '/images/marathon_hero_slide5.jpg',
    alt: 'Rajasthan Police Marathon - Jaisalmer Sonar Quila & Chittorgarh Vijay Stambh Unity Run',
    position: 'center 30%'
  }
];

export function Hero({ onOpenRegister, onOpenFindPass }) {
  // Live Countdown logic strictly targeted to 3 January 2027, 06:00:00 AM IST
  const TARGET_DATE = new Date(2027, 0, 3, 6, 0, 0);

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
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const slideCount = HERO_SLIDES.length;

  // Auto-advance 5-slide cinematic background carousel every 4.5 seconds (resets cleanly on manual dot click & HMR)
  useEffect(() => {
    const slideTimer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 4500);
    return () => clearTimeout(slideTimer);
  }, [activeSlide, slideCount]);

  const countdownItems = [
    { label: 'DAYS', val: String(timeLeft.days).padStart(2, '0') },
    { label: 'HOURS', val: String(timeLeft.hours).padStart(2, '0') },
    { label: 'MINS', val: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SECS', val: String(timeLeft.seconds).padStart(2, '0') }
  ];

  return (
    <section id="hero" className="hero-section">
      {/* 0. 3-Slide Cinematic Crossfade + Ken Burns Background Layers */}
      <div className="hero-slides-stage" aria-hidden="true">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={slide.src}
              className={`hero-slide-layer ${isActive ? 'is-active' : ''}`}
              style={{
                backgroundImage: `url('${slide.src}')`,
                backgroundPosition: slide.position
              }}
            />
          );
        })}
      </div>

      {/* 1. Soft Center Radial Scrim (Keeps forts & runners vivid while making center text razor-sharp) */}
      <div className="hero-radial-scrim" aria-hidden="true" />

      {/* 2. Hero Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
            {/* Top Event Super-Title */}
            <div style={{
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: 'clamp(0.78rem, 1.6vw, 1rem)',
              fontWeight: 800,
              color: '#fde68a',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              textShadow: '0 2px 12px rgba(5, 17, 38, 0.85)'
            }}>
              ★ RAJASTHAN POLICE STATEWIDE MARATHON 2027 ★
            </div>

            {/* Brand Hero Title (Locked against auto-translation) */}
            <h1
              translate="no"
              className="notranslate"
              style={{
                fontFamily: "'Inter', Arial, sans-serif",
                fontSize: 'clamp(2.6rem, 6.8vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.04,
                letterSpacing: '0.03em',
                color: '#ffffff',
                textTransform: 'uppercase',
                margin: '0 0 16px 0',
                textShadow: '0 6px 28px rgba(5, 17, 38, 0.72), 0 2px 6px rgba(0, 0, 0, 0.45)'
              }}
            >
              RUN FOR HER
            </h1>

            {/* Translucent Frosted Crimson-Glass Slogan Pill */}
            <div style={{ width: '100%', marginBottom: '26px' }}>
              <div className="hero-slogan-wrap" style={{
                background: 'linear-gradient(135deg, rgba(190, 18, 60, 0.76) 0%, rgba(136, 19, 55, 0.72) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                display: 'inline-block',
                padding: '8px 24px',
                borderRadius: '999px',
                boxShadow: '0 8px 24px rgba(136, 19, 55, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
              }}>
                <span style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.35)'
                }}>
                  "हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के नाम"
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="hero-cta-group">
              <button
                onClick={onOpenRegister}
                className="hero-btn-primary"
                title="ऑनलाइन पंजीकरण पोर्टल"
              >
                <span>पंजीकरण करें</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onOpenFindPass}
                className="hero-btn-glass"
                title="ई-पास खोजें व पुनः डाउनलोड करें"
              >
                <span>🔍 ई-पास खोजें</span>
              </button>
            </div>

            {/* Pure Transparent Liquid-Glass Countdown Card */}
            <div className="hero-countdown-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#fde68a',
                fontFamily: "'Inter', Arial, sans-serif",
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: '14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
                paddingBottom: '10px',
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)'
              }}>
                <Timer size={16} color="#fde68a" />
                <span translate="no" className="notranslate">EVENT COUNTDOWN</span>
              </div>

              <div className="hero-countdown-row">
                {countdownItems.map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <div className="hero-countdown-box">
                      <div className="hero-countdown-val">{item.val}</div>
                      <div translate="no" className="hero-countdown-lbl notranslate">{item.label}</div>
                    </div>
                    {idx < countdownItems.length - 1 && (
                      <span className="hero-countdown-sep" aria-hidden="true">:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Minimal Cinematic Slide Indicator Dots */}
            <div className="hero-slide-dots" role="tablist" aria-label="Hero background slides">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={slide.src}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${idx + 1}`}
                    onClick={() => setActiveSlide(idx)}
                    className={`hero-slide-dot ${isActive ? 'is-active' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Slider, Radial Contrast & Liquid Glass Styles */}
      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          background-color: #051126;
          color: #ffffff;
          border-bottom: 1px solid var(--border-subtle);
          padding-top: 52px;
          padding-bottom: 42px;
          min-height: 540px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-slides-stage {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .hero-slide-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0;
          transform: scale(1.0);
          transition: opacity 1.3s ease-in-out, transform 6.5s ease-out;
          will-change: opacity, transform;
        }

        .hero-slide-layer.is-active {
          opacity: 1;
          transform: scale(1.06);
        }

        /* Soft Center Radial Scrim: preserves bright edges/landmarks while giving center text crisp contrast */
        .hero-radial-scrim {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(ellipse 68% 76% at 50% 48%, rgba(5, 17, 38, 0.52) 0%, rgba(5, 17, 38, 0.24) 58%, rgba(5, 17, 38, 0.08) 100%),
            linear-gradient(180deg, rgba(5, 17, 38, 0.22) 0%, rgba(5, 17, 38, 0.08) 50%, rgba(5, 17, 38, 0.28) 100%);
        }

        .hero-cta-group {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .hero-btn-primary {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          padding: 13px 32px;
          border-radius: 999px;
          font-size: 0.98rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(225, 29, 72, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(225, 29, 72, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        .hero-btn-glass {
          background: rgba(10, 28, 61, 0.46);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.62);
          padding: 13px 26px;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 8px 22px rgba(5, 17, 38, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.22);
          transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .hero-btn-glass:hover {
          background: rgba(10, 28, 61, 0.68);
          border-color: #fde68a;
          transform: translateY(-2px);
        }

        .hero-countdown-card {
          max-width: 640px;
          margin: 0 auto;
          padding: 18px 24px 20px 24px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.24);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 16px 40px rgba(5, 17, 38, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.34);
          border: 1px solid rgba(255, 255, 255, 0.32);
          color: #ffffff;
        }

        .hero-countdown-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .hero-countdown-box {
          flex: 1;
          min-width: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 14px 8px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          text-align: center;
        }

        .hero-countdown-val {
          font-family: 'Inter', Arial, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: clamp(1.9rem, 4vw, 2.85rem);
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          text-shadow: 0 3px 14px rgba(5, 17, 38, 0.65);
        }

        .hero-countdown-lbl {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 0.72rem;
          color: #fde68a;
          font-weight: 800;
          letter-spacing: 0.14em;
          margin-top: 7px;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
        }

        .hero-countdown-sep {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: rgba(253, 230, 138, 0.85);
          line-height: 1;
          margin-top: -14px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
          animation: heroColonPulse 1.4s ease-in-out infinite;
        }

        @keyframes heroColonPulse {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.35; }
        }

        .hero-slide-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 22px;
        }

        .hero-slide-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.6);
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-slide-dot.is-active {
          width: 28px;
          background: #fde68a;
          border-color: #fde68a;
          box-shadow: 0 0 10px rgba(253, 230, 138, 0.75);
        }

        /* Mobile Specific Responsive Optimization (< 768px) */
        @media (max-width: 767px) {
          .hero-section {
            padding-top: 24px !important;
            padding-bottom: 30px !important;
            min-height: 460px !important;
          }

          .hero-slogan-wrap {
            padding: 7px 16px !important;
          }

          .hero-cta-group {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 340px !important;
            margin: 0 auto 22px auto !important;
            gap: 10px !important;
          }

          .hero-cta-group button {
            width: 100% !important;
            justify-content: center !important;
            padding: 13px 18px !important;
            font-size: 0.94rem !important;
            min-height: 48px !important;
          }

          .hero-countdown-card {
            padding: 14px 12px !important;
          }

          .hero-countdown-row {
            gap: 6px !important;
          }

          .hero-countdown-box {
            padding: 10px 4px !important;
            border-radius: 9px !important;
          }

          .hero-countdown-val {
            font-size: 1.5rem !important;
          }

          .hero-countdown-lbl {
            font-size: 0.62rem !important;
            letter-spacing: 0.08em !important;
            margin-top: 5px !important;
          }

          .hero-countdown-sep {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
