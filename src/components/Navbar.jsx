import React, { useState } from 'react';
import { PoliceEmblem } from './Emblems';
import { Shield, Menu, X, Phone, PackageCheck, LogOut, Globe, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Navbar({ 
  onOpenRegister, 
  onOpenFindPass,
  activePage = 'home', 
  onNavigate, 
  isAdminAuthenticated = false,
  adminUser = null
}) {
  const { language, toggleLanguage, isHindi, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState("normal"); // "normal", "large", "xlarge"

  const isExpoRole = adminUser?.role === 'EXPO_VOLUNTEER' || adminUser?.role === 'GATE_MARSHAL';

  const navAdminTarget = !isAdminAuthenticated 
    ? 'admin-login' 
    : isExpoRole 
      ? 'expo-terminal' 
      : 'admin';

  const navAdminLabel = !isAdminAuthenticated
    ? t('adminLogin')
    : isExpoRole
      ? (adminUser?.role === 'GATE_MARSHAL' ? (isHindi ? '🚪 गेट स्कैनर' : '🚪 Gate Scanner') : (isHindi ? '📦 एक्सपो स्टेशन' : '📦 Expo Station'))
      : (isHindi ? '🛡️ एडमिन कमान' : '🛡️ Admin Command');

  const navAdminBg = !isAdminAuthenticated
    ? '#1e3a8a'
    : isExpoRole
      ? '#047857'
      : '#15803d';

  const handleNav = (pageId) => {
    setMobileMenuOpen(false);
    let targetPage = pageId;
    if (pageId === 'admin-login' || pageId === 'admin') {
      if (isAdminAuthenticated) {
        targetPage = isExpoRole ? 'expo-terminal' : 'admin';
      } else {
        targetPage = 'admin-login';
      }
    }
    if (onNavigate) {
      onNavigate(targetPage);
    } else {
      const element = document.getElementById(targetPage);
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
              {isHindi ? 'राजस्थान सरकार | GOVERNMENT OF RAJASTHAN' : 'GOVERNMENT OF RAJASTHAN'}
            </span>
          </div>

          {/* Right: Emergency Helpline, Language Toggle, Accessibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontWeight: 700 }}>
              <Phone size={12} />
              <span>{t('womenHelpline')}</span>
            </div>

            {/* Accessibility Font Size Controls (WCAG 1.4.4) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="d-tablet-inline">
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Font:</span>
              <button 
                onClick={() => handleFontChange("normal")}
                aria-label="सामान्य फ़ॉन्ट आकार (Normal font size)"
                style={{ background: fontSize === "normal" ? '#1e3a8a' : 'transparent', color: '#fff', border: '1px solid #3b82f6', borderRadius: '2px', padding: '1px 5px', fontSize: '0.68rem', cursor: 'pointer' }}
              >
                A
              </button>
              <button 
                onClick={() => handleFontChange("large")}
                aria-label="बड़ा फ़ॉन्ट आकार (Large font size)"
                style={{ background: fontSize === "large" ? '#1e3a8a' : 'transparent', color: '#fff', border: '1px solid #3b82f6', borderRadius: '2px', padding: '1px 5px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Government Branding Banner (Police Header) */}
      <div className="navbar-brand-bar" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '2px solid var(--police-gold-500)'
      }}>
        <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          
          {/* Official Rajasthan Police Crest + Headings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => handleNav('home')}>
            {/* Official Rajasthan Police Emblem with Vijay Stambh */}
            <PoliceEmblem size={52} className="navbar-police-logo" />

            <div>
              {/* Primary Heading */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.15rem, 2.5vw, 1.7rem)',
                fontWeight: 900,
                color: 'var(--police-navy-900)',
                lineHeight: 1.1,
                letterSpacing: '0.01em'
              }}>
                {t('mainTitle')}
              </div>

              {/* Sub-Heading & Tagline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                <span 
                  translate="no"
                  className="notranslate"
                  style={{
                    fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                    fontWeight: 900,
                    color: 'var(--crimson-600)',
                    letterSpacing: '0.04em'
                  }}
                >
                  RUN FOR HER
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }} className="d-tablet-inline">
                  • {t('tagline')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header: Language Switch & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Mobile/Tablet Language Pill */}
            <button
              onClick={toggleLanguage}
              style={{
                background: 'var(--police-navy-900)',
                color: '#fde68a',
                border: '1.5px solid var(--police-gold-500)',
                borderRadius: '6px',
                padding: '6px 11px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title={isHindi ? "Switch site to English" : "वेबसाइट को हिन्दी में बदलें"}
            >
              <Globe size={13} color="#fde68a" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
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
      <div className="navbar-tier3-bar" style={{
        background: '#0a1c3d',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0'
      }}>
        <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Desktop Nav Items - Clean, Professional Government Format */}
          <nav aria-label={isHindi ? "मुख्य नेविगेशन मेन्यू" : "Main Navigation"} style={{ display: 'none', alignItems: 'center', gap: '4px' }} className="desktop-nav-items">
            {[
              { id: 'home', label: t('navHome') },
              { id: 'register', label: t('navRegister'), isGold: true },
              { id: 'find-pass', label: t('navFindPass'), isFindPass: true },
              { id: 'route-schedule', label: t('navRoute') },
              { id: 'certificates', label: t('navCertificates') },
              { id: 'pledge-safety', label: t('navPledge') }
            ].map(tab => {
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.isFindPass) {
                      if (onOpenFindPass) onOpenFindPass();
                      else handleNav('find-pass');
                    } else if (tab.id === 'register') {
                      if (onOpenRegister) onOpenRegister();
                      else handleNav('register');
                    } else {
                      handleNav(tab.id);
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    padding: '11px 16px',
                    fontSize: '0.86rem',
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

          {/* Right Nav Utilities: Admin / Expo Station Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto'
          }}>
            <button
              id="btn-nav-admin-login"
              onClick={() => handleNav(navAdminTarget)}
              style={{
                background: navAdminBg,
                color: '#ffffff',
                border: '1.5px solid var(--police-gold-500)',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'background 0.2s ease'
              }}
              title={isAdminAuthenticated ? `लॉगिन: ${adminUser?.fullName || 'अधिकृत अधिकारी'}` : "अधिकृत पुलिस प्रशासनिक कमान एवं एक्सपो लॉगिन"}
            >
              {isExpoRole ? (
                <PackageCheck size={14} color="#fde68a" />
              ) : (
                <Shield size={13} color="#fde68a" />
              )}
              <span>{navAdminLabel}</span>
            </button>

            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("क्या आप वर्तमान सत्र से लॉगआउट करना चाहते हैं?")) {
                    sessionStorage.removeItem('rajpol_admin_auth');
                    sessionStorage.removeItem('rajpol_admin_token');
                    sessionStorage.removeItem('rajpol_admin_user');
                    window.location.reload();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fee2e2',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="सत्र से लॉगआउट करें (Logout)"
              >
                <LogOut size={12} color="#fca5a5" />
                <span>लॉगआउट</span>
              </button>
            )}
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
          {/* Mobile Language Switcher (Prominent at top of drawer) */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'var(--police-navy-900)',
              color: '#fde68a',
              border: '1.5px solid var(--police-gold-500)',
              borderRadius: '6px',
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Languages size={18} color="#fde68a" />
              <span>{isHindi ? 'Switch website to English' : 'वेबसाइट को हिन्दी में बदलें'}</span>
            </div>
            <span style={{ background: '#1e3a8a', padding: '3px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#fff', fontWeight: 900 }}>
              {isHindi ? 'English' : 'हिन्दी'}
            </span>
          </button>

          {[
            { id: 'home', label: t('navHome') },
            { id: 'register', label: t('navRegister'), color: 'var(--police-gold-700)' },
            { id: 'find-pass', label: t('navFindPass'), color: 'var(--police-navy-900)', isFindPass: true },
            { id: 'route-schedule', label: t('navRoute') },
            { id: 'certificates', label: t('navCertificates'), color: 'var(--police-gold-700)' },
            { id: 'pledge-safety', label: t('navPledge'), color: 'var(--crimson-600)' }
          ].map(tab => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (tab.isFindPass) {
                    if (onOpenFindPass) onOpenFindPass();
                    else handleNav('find-pass');
                  } else if (tab.id === 'register') {
                    if (onOpenRegister) onOpenRegister();
                    else handleNav('register');
                  } else {
                    handleNav(tab.id);
                  }
                }}
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
            onClick={() => { setMobileMenuOpen(false); handleNav(navAdminTarget); }}
            style={{
              background: isExpoRole 
                ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' 
                : 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
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
            {isExpoRole ? <PackageCheck size={16} color="#fde68a" /> : <Shield size={16} color="var(--police-gold-400)" />}
            <span>{navAdminLabel}</span>
          </button>
        </div>
      )}

      {/* Responsive Breakpoint Styles */}
      <style>{`
        .navbar-brand-bar {
          padding: 8px 0;
        }
        .d-tablet-inline {
          display: none !important;
        }
        .d-desktop-block {
          display: none !important;
        }
        .navbar-tier3-bar {
          display: none !important;
        }
        .desktop-nav-items {
          display: none !important;
        }
        .mobile-toggle {
          display: flex !important;
        }

        /* Mobile specific compact polish (< 640px) */
        @media (max-width: 639px) {
          .navbar-police-logo {
            width: 40px !important;
            height: 40px !important;
          }
          .btn-primary {
            padding: 6px 12px !important;
            font-size: 0.8rem !important;
          }
        }

        /* Tablet (>= 640px) */
        @media (min-width: 640px) {
          .navbar-brand-bar {
            padding: 12px 0;
          }
          .d-tablet-inline {
            display: inline-flex !important;
          }
        }

        /* Desktop (>= 1024px) */
        @media (min-width: 1024px) {
          .d-desktop-block {
            display: block !important;
          }
          .navbar-tier3-bar {
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
