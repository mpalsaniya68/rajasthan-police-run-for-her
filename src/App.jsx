import React, { useState, useEffect } from 'react';

import { Shield } from 'lucide-react';

import { INITIAL_REGISTRATIONS } from './data/mockData';

import { Navbar } from './components/Navbar';

import { Hero } from './components/Hero';

import { Categories } from './components/Categories';

import { InteractiveRoute } from './components/InteractiveRoute';

import { SafetyPledge } from './components/SafetyPledge';

import { DistrictHub } from './components/DistrictHub';

import { ScheduleExpo } from './components/ScheduleExpo';

import { CertificateHub } from './components/CertificateHub';

import { BulkRegistrationModal } from './components/BulkRegistrationModal';

import { Footer } from './components/Footer';

import { AdminDashboard } from './components/AdminDashboard';

import { AdminLoginPage } from './components/AdminLoginPage';

import { ExpoScannerTerminal } from './components/ExpoScannerTerminal';

import { PatronDesk } from './components/PatronDesk';
import { PrizePodiumSection } from './components/PrizePodiumSection';

import { RegistrationPage } from './components/RegistrationPage';

import { FAQSection } from './components/FAQSection';
import { MobileQuickSosBar } from './components/MobileQuickSosBar';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>⚠️ स्क्रीन लोड करने में समस्या आई</h3>
            <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '18px' }}>
              कृपया पुनः प्रयास करें अथवा मुख्य पृष्ठ पर जाएं।
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => window.location.reload()} style={{ background: '#0b3a75', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                पेज रिफ्रेश करें
              </button>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '';
                  window.location.href = '/';
                }} 
                style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >
                🏠 मुख्य पृष्ठ पर जाएं
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {

  // Active Page State ('home', 'register', 'categories', 'route-schedule', 'districts', 'certificates', 'photos', 'pledge-safety')

  const [activePage, setActivePage] = useState('home');

  // Persistent registrations state

  const [registrations, setRegistrations] = useState(() => {

    try {

      const saved = localStorage.getItem('rpm_registrations');

      return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;

    } catch (e) {

      return INITIAL_REGISTRATIONS;

    }

  });

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState("21k");

  const [selectedDistrictForRegister, setSelectedDistrictForRegister] = useState("JPR-COMM");

  const [selectedRegTab, setSelectedRegTab] = useState("register");

  

  // Single Access Admin States & RBAC Credentials

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {

    return sessionStorage.getItem('rajpol_admin_auth') === 'true';

  });

  const [adminUser, setAdminUser] = useState(() => {

    try {

      const saved = sessionStorage.getItem('rajpol_admin_user');

      return saved ? JSON.parse(saved) : null;

    } catch (e) {

      return null;

    }

  });

  const navigateToPage = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminTrigger = () => {
    if (sessionStorage.getItem('rajpol_admin_auth') === 'true') {
      if (adminUser?.role === 'EXPO_VOLUNTEER' || adminUser?.role === 'GATE_MARSHAL') {
        navigateToPage('expo-terminal');
      } else {
        navigateToPage('admin');
      }
    } else {
      navigateToPage('admin-login');
    }
  };

  // Global Keyboard Shortcut: [Ctrl + Shift + A] / [Cmd + Shift + A]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleOpenAdminTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminUser]);

  const handleAdminLoginSuccess = (user) => {

    setIsAdminAuthenticated(true);

    setAdminUser(user);

    if (user?.role === 'EXPO_VOLUNTEER' || user?.role === 'GATE_MARSHAL') {

      navigateToPage('expo-terminal');

    } else {

      navigateToPage('admin');

    }

  };

  const handleAdminLogout = async () => {

    const token = sessionStorage.getItem('rajpol_admin_token');

    if (token) {

      try {

        await fetch('/api/admin/logout', {

          method: 'POST',

          headers: { 'Authorization': `Bearer ${token}` }

        });

      } catch (e) {

        // Continue logout locally

      }

    }

    sessionStorage.removeItem('rajpol_admin_auth');

    sessionStorage.removeItem('rajpol_admin_user');

    sessionStorage.removeItem('rajpol_admin_token');

    setIsAdminAuthenticated(false);

    setAdminUser(null);

    navigateToPage('home');

  };

  // Sync with LocalStorage

  useEffect(() => {

    try {

      localStorage.setItem('rpm_registrations', JSON.stringify(registrations));

    } catch (e) {

      console.error("LocalStorage write error:", e);

    }

  }, [registrations]);

  const handleRegisterSuccess = (newRecord) => {

    setRegistrations(prev => [newRecord, ...prev]);

  };

  const handleBulkRegisterSuccess = (newBatch) => {

    setRegistrations(prev => [...newBatch, ...prev]);

  };

  const handleUpdateRegistration = (updatedRecord) => {

    setRegistrations(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));

  };

  const openRegisterModalWithCat = (catId = "21k") => {
    setSelectedCategoryForModal(catId);
    setSelectedRegTab("register");
    navigateToPage('register');
  };

  const handleOpenFindPass = () => {
    setSelectedRegTab("find");
    navigateToPage('register');
  };

  return (

    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* WCAG Accessible Skip Link */}

      <a href="#main-content" className="skip-to-content">

        मुख्य सामग्री पर जाएं (Skip to main content)

      </a>

            {/* Official Top Navbar with Page Tabs */}
      <Navbar
        onOpenRegister={() => openRegisterModalWithCat(selectedCategoryForModal)}
        onOpenBulkRegister={() => setIsBulkModalOpen(true)}
        onOpenFindPass={handleOpenFindPass}
        activePage={activePage}
        onNavigate={navigateToPage}
        isAdminAuthenticated={isAdminAuthenticated}
        adminUser={adminUser}
      />

      {/* Main Content View Container */}

      <main id="main-content" tabIndex="-1" style={{ flex: 1 }}>
        <ErrorBoundary>

        {/* 0. DEDICATED FULL-PAGE ONLINE RUNNER REGISTRATION */}

        {activePage === 'register' && (

          <div id="page-register">

            <RegistrationPage

              initialCategory={selectedCategoryForModal}

              initialDistrict={selectedDistrictForRegister}

              initialTab={selectedRegTab}

              onNavigate={navigateToPage}

              onRegisterSuccess={handleRegisterSuccess}

            />

          </div>

        )}

        {/* 1. HOME PAGE */}

        {activePage === 'home' && (

          <div id="page-home">

            <Hero

              onOpenRegister={() => openRegisterModalWithCat(selectedCategoryForModal)}

              onOpenBulkRegister={() => setIsBulkModalOpen(true)}

              onOpenFindPass={handleOpenFindPass}

              totalRegistered={registrations.length + 18450}

            />

            <PatronDesk />

            <PrizePodiumSection

              onOpenRegister={() => openRegisterModalWithCat(selectedCategoryForModal)}

            />

            <FAQSection

              onNavigate={navigateToPage}

            />

          </div>

        )}

        {/* 2. CATEGORIES & REGISTRATION PAGE */}

        {activePage === 'categories' && (

          <div id="page-categories">

            <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>

              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>

                  <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>

                  <span>/</span>

                  <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>दौड़ श्रेणियां एवं रजिस्ट्रेशन</span>

                </div>

                <span className="badge-gov">आधिकारिक पंजीकरण खुला है</span>

              </div>

            </div>

            <Categories 

              onSelectCategory={openRegisterModalWithCat}

              onOpenBulkRegister={() => setIsBulkModalOpen(true)} 

            />

          </div>

        )}

        {/* 3. ROUTE & SCHEDULE EXPO PAGE */}

        {activePage === 'route-schedule' && (

          <div id="page-route-schedule">

            <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>

              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>

                  <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>

                  <span>/</span>

                  <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>रूट मैप, कार्यक्रम समय-सारणी एवं एक्सपो किट</span>

                </div>

                <span className="badge-gold">फ्लैग-ऑफ: 3 जनवरी 2027, सुबह 06:00 बजे</span>

              </div>

            </div>

            <ScheduleExpo />

            <InteractiveRoute />

          </div>

        )}

        {/* 4. POLICE DISTRICTS PAGE */}

        {activePage === 'districts' && (

          <div id="page-districts">

            <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>

              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>

                  <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>

                  <span>/</span>

                  <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>राजस्थान के समस्त पुलिस जिले</span>

                </div>

                <span className="badge-gov">राज्यव्यापी पुलिस जिला केंद्र</span>

              </div>

            </div>

            <DistrictHub onSelectDistrict={(distId) => {

              setSelectedDistrictForRegister(distId);

              navigateToPage('register');

            }} />

          </div>

        )}

        {/* 5. FINISHER CERTIFICATES & LEDGER VERIFICATION PAGE */}

        {activePage === 'certificates' && (

          <div id="page-certificates">

            <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>

              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>

                  <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>

                  <span>/</span>

                  <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>ई-सर्टिफिकेट डाउनलोड एवं आधिकारिक सत्यापन पोर्टल</span>

                </div>

                <span className="badge-gold">आधिकारिक राजस्थान पुलिस ई-प्रमाण पत्र</span>

              </div>

            </div>

            <CertificateHub registrations={registrations} />

          </div>

        )}

        {/* 6. WOMEN SAFETY PLEDGE & 24x7 HELPLINE DIRECTORY PAGE */}

        {activePage === 'pledge-safety' && (

          <div id="page-pledge-safety">

            <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>

              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>

                  <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>

                  <span>/</span>

                  <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>महिला सुरक्षा संकल्प एवं 24x7 आपातकालीन हेल्पलाइन</span>

                </div>

                <span className="badge-pink">महिला हेल्पलाइन: 1090 / 112</span>

              </div>

            </div>

            <SafetyPledge />

          </div>

        )}

        {/* 9. DEDICATED FULL-PAGE ADMINISTRATIVE LOGIN */}

        {activePage === 'admin-login' && (

          <div id="page-admin-login">

            <AdminLoginPage

              onNavigate={navigateToPage}

              onLoginSuccess={handleAdminLoginSuccess}

            />

          </div>

        )}

        {/* 10. DEDICATED FULL-PAGE ADMINISTRATIVE COMMAND DESK */}

        {activePage === 'admin' && (

          <div id="page-admin">

            {isAdminAuthenticated ? (
              (adminUser?.role === 'EXPO_VOLUNTEER' || adminUser?.role === 'GATE_MARSHAL') ? (
                <div style={{
                  minHeight: '80vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  background: '#f8fafc'
                }}>
                  <div style={{
                    maxWidth: '480px',
                    width: '100%',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1.5px solid #ef4444',
                    padding: '32px 24px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#fee2e2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <Shield size={30} color="#dc2626" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', margin: '0 0 8px' }}>
                      अनधिकृत प्रशासनिक पहुंच (403 Access Denied)
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
                      आप वर्तमान में <strong>एक्सपो स्टेशन ऑपरेटर ({adminUser?.fullName || 'वॉलंटियर'})</strong> के रूप में अधिकृत हैं। आपके पास <strong>राज्य स्तरीय पुलिस कमान (PHQ)</strong> का प्रशासनिक डेटा देखने का अधिकार नहीं है।
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button
                        onClick={() => navigateToPage('expo-terminal')}
                        style={{
                          background: '#047857',
                          color: '#ffffff',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📦 एक्सपो स्टेशन पर जाएं
                      </button>
                      <button
                        onClick={handleAdminLogout}
                        style={{
                          padding: '10px 18px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          background: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: 700,
                          color: '#64748b'
                        }}
                      >
                        लॉगआउट करें
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <AdminDashboard
                  isFullPage={true}
                  isOpen={true}
                  currentUser={adminUser}
                  onNavigate={navigateToPage}
                  onClose={() => navigateToPage('home')}
                  onLogout={handleAdminLogout}
                  registrations={registrations}
                  onUpdateRegistration={handleUpdateRegistration}
                />
              )
            ) : (

              <AdminLoginPage

                onNavigate={navigateToPage}

                onLoginSuccess={handleAdminLoginSuccess}

              />

            )}

          </div>

        )}

        {/* 11. DEDICATED FULL-PAGE EXPO KIT & RACE-DAY SCANNER TERMINAL */}

        {activePage === 'expo-terminal' && (

          <div id="page-expo-terminal">

            {isAdminAuthenticated ? (

              <ExpoScannerTerminal

                currentUser={adminUser}

                onLogout={handleAdminLogout}

                onNavigate={navigateToPage}

              />

            ) : (

              <AdminLoginPage

                onNavigate={navigateToPage}

                onLoginSuccess={handleAdminLoginSuccess}

              />

            )}

          </div>

        )}

              </ErrorBoundary>
      </main>

      {/* Footer with Helpline Matrix & Quick Page Navigation */}

      <Footer onNavigate={navigateToPage} />

      {/* Top Rec 1: Institutional & Bulk Registration Portal (RPA / Battalion / Colleges) */}

      <BulkRegistrationModal

        isOpen={isBulkModalOpen}

        onClose={() => setIsBulkModalOpen(false)}

        onBulkRegisterSuccess={handleBulkRegisterSuccess}

      />

      {/* Rajasthan Police 24x7 Women Safety & Emergency Mobile Quick Dial Bar */}
      <MobileQuickSosBar />

    </div>

  );

}

