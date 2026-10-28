import React, { useState } from 'react';
import { PoliceEmblem, StateEmblemOfIndia, RunForHerBadge } from './Emblems';
import { Shield, Award, MapPin, UserPlus, FileCheck, Menu, X, Heart, Phone, HelpCircle, Sun, CloudRain } from 'lucide-react';

export function Navbar({ 
  onOpenRegister, 
  onOpenBulkRegister, 
  onOpenAdmin, 
  activePage = 'home', 
  onNavigate, 
  totalRegistered = 18450,
  isAdminAuthenticated = false 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState("normal"); // "normal", "large", "xlarge"
  const [lang, setLang] = useState("hi"); // "hi" or "en"

  const handleNav = (pageId) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      const element = document.getElementById(pageId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleFontChange = (size) => {
    setFontSize(size);
    if (size === "large") document.documentElement.style.fontSize = "17px";
    else if (size === "xlarge") document.documentElement.style.fontSize = "18px";
    else document.documentElement.style.fontSize = "16px";
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#ffffff',
      boxShadow: 'var(--shadow-md)',
      width: '100%'
    }}>
      {/* 1. Indian National Flag Tricolor Ribbon */}
      <div className="tiranga-line"></div>

      {/* 2. Official Government Top Utility Bar */}
      <div style={{
        background: '#0a1c3d',
        color: '#f8fafc',
        fontSize: '0.78rem',
        padding: '5px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {/* Left: Govt Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 800, color: '#fde68a', letterSpacing: '0.03em' }}>
              राजस्थान सरकार | GOVERNMENT OF RAJASTHAN
            </span>
          </div>

          {/* Right: Emergency Helpline, Accessibility, Nodal Admin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontWeight: 700 }}>
              <Phone size={12} />
              <span>महिला हेल्पलाइन: 1090 / 112</span>
            </div>

            {/* Accessibility Font Size Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="d-tablet-inline">
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Font:</span>
              <button 
                onClick={() => handleFontChange("normal")}
                style={{ background: fontSize === "normal" ? '#1e3a8a' : 'transparent', color: '#fff', border: '1px solid #3b82f6', borderRadius: '2px', padding: '1px 5px', fontSize: '0.68rem' }}
              >
                A
              </button>
              <button 
                onClick={() => handleFontChange("large")}
                style={{ background: fontSize === "large" ? '#1e3a8a' : 'transparent', color: '#fff', border: '1px solid #3b82f6', borderRadius: '2px', padding: '1px 5px', fontSize: '0.72rem', fontWeight: 700 }}
              >
                A+
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fde68a',
                border: '1px solid rgba(253, 230, 138, 0.4)',
                borderRadius: '3px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              {lang === 'hi' ? 'English' : 'हिन्दी'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Government Branding Banner (Police Header) */}
      <div style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '2px solid var(--police-gold-500)',
        padding: '12px 0'
      }}>
        <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          {/* Official Emblem + Rajasthan Police Crest + Headings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => handleNav('home')}>
            {/* State Emblem of India */}
            <div className="d-tablet-inline">
              <StateEmblemOfIndia size={48} />
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '48px', background: 'var(--border-medium)' }} className="d-tablet-inline"></div>

            {/* Official Rajasthan Police Emblem with Vijay Stambh */}
            <PoliceEmblem size={56} />

            <div>
              {/* Devanagari Primary Heading */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.15rem, 2.5vw, 1.7rem)',
                fontWeight: 900,
                color: 'var(--police-navy-900)',
                lineHeight: 1.1,
                letterSpacing: '0.01em'
              }}>
                राजस्थान पुलिस मैराथन 2026
              </div>

              {/* English Sub-Heading & Tagline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                <span style={{
                  fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                  fontWeight: 900,
                  color: 'var(--crimson-600)',
                  letterSpacing: '0.04em'
                }}>
                  RUN FOR HER
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--police-gold-700)', fontWeight: 800 }}>
                  ★ सेवार्थ कटिबद्धता ★
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} className="d-tablet-inline">
                  • Every Step for Her Safety
                </span>
              </div>
            </div>
          </div>

          {/* Right Header: Cause Badge & Quick Registration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Dignitary Authority Callout */}
            <div style={{ textAlign: 'right', display: 'none' }} className="d-desktop-block">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>आयोजन नेतृत्व</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>राजीव शर्मा (IPS), DGP</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>महानिदेशक पुलिस, राजस्थान</div>
            </div>

            {/* Bulk / Institutional Action */}
            <button 
              onClick={onOpenBulkRegister}
              className="btn-gold"
              style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap', display: 'none' }}
              id="bulk-btn-header"
            >
              संस्थागत / बल्क
            </button>

            {/* Quick Register CTA */}
            <button 
              onClick={onOpenRegister} 
              className="btn-glass-primary btn-glass-register" 
              style={{ padding: '8px 18px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
            >
              <UserPlus size={15} /> रजिस्ट्रेशन
            </button>

            {/* Mobile / Tablet Toggle Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'var(--police-navy-50)',
                color: 'var(--police-navy-900)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              className="mobile-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tier 3: Sticky Interactive Navigation Menu Bar */}
      <div style={{
        background: '#0a1c3d',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0'
      }}>
        <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Desktop Nav Items - Clean, Professional Government Format */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '4px' }} className="desktop-nav-items">
            {[
              { id: 'home', label: 'मुख्य पृष्ठ' },
              { id: 'register', label: 'रजिस्ट्रेशन (e-Pass)', isGold: true },
              { id: 'categories', label: 'दौड़ श्रेणियां' },
              { id: 'route-schedule', label: 'रूट व एक्सपो' },
              { id: 'districts', label: '50 जिला केंद्र' },
              { id: 'live-tracker', label: 'लाइव ट्रैकर', isLive: true },
              { id: 'certificates', label: 'ई-प्रमाण पत्र' },
              { id: 'pledge-safety', label: 'सुरक्षा संकल्प' },
              { id: 'all', label: 'समस्त विवरण' }
            ].map(tab => {
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNav(tab.id)}
                  style={{
                    padding: '11px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: isActive ? '#fde68a' : tab.isGold ? '#fde68a' : '#f8fafc',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid var(--police-gold-400)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px 4px 0 0'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderBottomColor = 'var(--police-gold-400)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  {tab.isLive && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px #ef4444' }}></span>
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Official Helpline & Admin Login in Nav Right (Placed at extreme right corner) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.78rem',
            color: '#cbd5e1',
            padding: '4px 0',
            marginLeft: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="d-tablet-inline">
              <span style={{ color: '#fde68a', fontWeight: 800 }}>★ राजस्थान पुलिस</span>
              <span>|</span>
              <span style={{ color: '#fca5a5', fontWeight: 700 }}>हेल्पलाइन: 1090 / 112</span>
            </div>

            {/* Admin Login Button - Placed at the extreme right corner */}
            <button
              id="btn-nav-admin-login"
              onClick={() => handleNav(isAdminAuthenticated ? 'admin' : 'admin-login')}
              style={{
                background: isAdminAuthenticated ? '#15803d' : '#1e3a8a',
                color: '#ffffff',
                border: '1.5px solid var(--police-gold-500)',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isAdminAuthenticated ? '#166534' : '#2563eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isAdminAuthenticated ? '#15803d' : '#1e3a8a';
              }}
              title="अधिकृत पुलिस प्रशासनिक कमान एवं जिला SP लॉगिन"
            >
              <Shield size={13} color="#fde68a" />
              <span>{isAdminAuthenticated ? 'प्रशासनिक कमान' : 'प्रशासनिक लॉगिन'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mobile & Tablet Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: '#ffffff',
          borderTop: '2px solid var(--police-gold-500)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {[
            { id: 'home', label: 'मुख्य पृष्ठ (Home)' },
            { id: 'register', label: 'ऑनलाइन रजिस्ट्रेशन (e-Pass Form)', color: 'var(--police-gold-700)' },
            { id: 'admin-login', label: 'प्रशासनिक लॉगिन (Admin Portal)', color: '#d97706' },
            { id: 'categories', label: 'दौड़ श्रेणियां व दूरी (Categories)' },
            { id: 'route-schedule', label: 'रूट मैप व एक्सपो समय-सारणी (Route & Schedule)' },
            { id: 'districts', label: 'राजस्थान के समस्त 50 पुलिस जिले (Districts)' },
            { id: 'live-tracker', label: 'लाइव रनर ट्रैकर (Live RFID Course Radar)', isLive: true, color: '#dc2626' },
            { id: 'certificates', label: 'फिनिशर सर्टिफिकेट व सत्यापन (Certificates)', color: 'var(--police-gold-700)' },
            { id: 'pledge-safety', label: 'महिला सुरक्षा संकल्प (Safety Protocol)', color: 'var(--crimson-600)' },
            { id: 'all', label: 'समस्त विवरण (Overview)' }
          ].map(tab => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.id)}
                style={{
                  background: isActive ? 'var(--police-navy-100)' : 'var(--police-navy-50)',
                  color: tab.color || 'var(--police-navy-900)',
                  border: isActive ? '1.5px solid var(--police-navy-800)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '11px 14px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.isLive && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenBulkRegister(); }}
            className="btn-glass-gold"
            style={{
              padding: '11px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '0.88rem',
              justifyContent: 'center',
              marginTop: '4px'
            }}
          >
            संस्थागत एवं ग्रुप बल्क रजिस्ट्रेशन (RPA / कॉलेज)
          </button>

          <button
            onClick={() => { setMobileMenuOpen(false); handleNav(isAdminAuthenticated ? 'admin' : 'admin-login'); }}
            style={{
              background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
              color: '#fde68a',
              border: '1px solid var(--police-gold-500)',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              cursor: 'pointer'
            }}
          >
            <Shield size={16} color="var(--police-gold-400)" /> 
            <span>{isAdminAuthenticated ? 'प्रशासनिक कमान (Admin Dashboard)' : 'प्रशासनिक लॉगिन (Admin Login)'}</span>
          </button>
        </div>
      )}

      {/* Responsive Breakpoint Styles */}
      <style>{`
        .d-tablet-inline {
          display: none !important;
        }
        .d-desktop-block {
          display: none !important;
        }
        .desktop-nav-items {
          display: none !important;
        }
        .mobile-toggle {
          display: flex !important;
        }

        /* Tablet (>= 640px) */
        @media (min-width: 640px) {
          .d-tablet-inline {
            display: inline-flex !important;
          }
        }

        /* Desktop (>= 1024px) */
        @media (min-width: 1024px) {
          .d-desktop-block {
            display: block !important;
          }
          .desktop-nav-items {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
