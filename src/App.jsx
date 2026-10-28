import React, { useState, useEffect } from 'react';
import { INITIAL_REGISTRATIONS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { InteractiveRoute } from './components/InteractiveRoute';
import { SafetyPledge } from './components/SafetyPledge';
import { DistrictHub } from './components/DistrictHub';
import { ScheduleExpo } from './components/ScheduleExpo';
import { CertificateHub } from './components/CertificateHub';
import { CertificateVerification } from './components/CertificateVerification';
import { BulkRegistrationModal } from './components/BulkRegistrationModal';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { LiveTrackerHub } from './components/LiveTrackerHub';
import { PatronDesk } from './components/PatronDesk';
import { RegistrationPage } from './components/RegistrationPage';

export default function App() {
  // Active Page State ('home', 'register', 'categories', 'route-schedule', 'districts', 'live-tracker', 'certificates', 'photos', 'pledge-safety', 'all')
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

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState("21k");
  
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
  const [hotkeyToast, setHotkeyToast] = useState(null);

  // Global Keyboard Shortcut: [Ctrl + Shift + A] / [Cmd + Shift + A]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setHotkeyToast("[Ctrl + Shift + A] पुलिस नोडल कमान सक्रिय");
        setTimeout(() => setHotkeyToast(null), 3000);

        if (sessionStorage.getItem('rajpol_admin_auth') === 'true') {
          navigateToPage('admin');
        } else {
          navigateToPage('admin-login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAdminTrigger = () => {
    if (sessionStorage.getItem('rajpol_admin_auth') === 'true') {
      navigateToPage('admin');
    } else {
      navigateToPage('admin-login');
    }
  };

  const handleAdminLoginSuccess = (user) => {
    setIsAdminAuthenticated(true);
    setAdminUser(user);
    navigateToPage('admin');
  };

  const handleAdminLogout = () => {
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

  const openRegisterModalWithCat = (catId) => {
    setSelectedCategoryForModal(catId);
    navigateToPage('register');
  };

  const navigateToPage = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Official Top Navbar with Page Tabs */}
      <Navbar
        onOpenRegister={() => navigateToPage('register')}
        onOpenBulkRegister={() => setIsBulkModalOpen(true)}
        onOpenAdmin={handleOpenAdminTrigger}
        activePage={activePage}
        onNavigate={navigateToPage}
        totalRegistered={registrations.length + 18450}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Secret Hotkey Notification Toast */}
      {hotkeyToast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          zIndex: 9999,
          background: 'var(--police-navy-950)',
          color: '#fef08a',
          border: '1.5px solid var(--police-gold-500)',
          borderRadius: '8px',
          padding: '10px 18px',
          fontSize: '0.85rem',
          fontWeight: 800,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <span>🛡️</span>
          <span>{hotkeyToast}</span>
        </div>
      )}

      {/* Main Content View Container */}
      <main style={{ flex: 1 }}>
        {/* 0. DEDICATED FULL-PAGE ONLINE RUNNER REGISTRATION */}
        {activePage === 'register' && (
          <div id="page-register">
            <RegistrationPage
              initialCategory={selectedCategoryForModal}
              onNavigate={navigateToPage}
              onRegisterSuccess={handleRegisterSuccess}
            />
          </div>
        )}

        {/* 1. HOME PAGE */}
        {(activePage === 'home' || activePage === 'all') && (
          <div id="page-home">
            <Hero
              onOpenRegister={() => navigateToPage('register')}
              onOpenBulkRegister={() => setIsBulkModalOpen(true)}
              onNavigate={navigateToPage}
              totalRegistered={registrations.length + 18450}
            />
            <PatronDesk
              onOpenRegister={() => navigateToPage('register')}
              onOpenBulkRegister={() => setIsBulkModalOpen(true)}
              onNavigate={navigateToPage}
            />
          </div>
        )}

        {/* 2. CATEGORIES & REGISTRATION PAGE */}
        {(activePage === 'categories' || activePage === 'all') && (
          <div id="page-categories">
            {activePage !== 'all' && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>
                    <span>/</span>
                    <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>दौड़ श्रेणियां एवं रजिस्ट्रेशन</span>
                  </div>
                  <span className="badge-gov">निःशुल्क पंजीकरण खुला है</span>
                </div>
              </div>
            )}
            <Categories 
              onSelectCategory={openRegisterModalWithCat}
              onOpenBulkRegister={() => setIsBulkModalOpen(true)} 
            />
          </div>
        )}

        {/* 3. ROUTE & SCHEDULE EXPO PAGE */}
        {(activePage === 'route-schedule' || activePage === 'all') && (
          <div id="page-route-schedule">
            {activePage !== 'all' && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>
                    <span>/</span>
                    <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>रूट मैप, कार्यक्रम समय-सारणी एवं एक्सपो किट</span>
                  </div>
                  <span className="badge-gold">फ्लैग-ऑफ: 20 दिसंबर, सुबह 06:00 बजे</span>
                </div>
              </div>
            )}
            <ScheduleExpo />
            <InteractiveRoute />
          </div>
        )}

        {/* 4. 50 POLICE DISTRICTS PAGE */}
        {(activePage === 'districts' || activePage === 'all') && (
          <div id="page-districts">
            {activePage !== 'all' && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>
                    <span>/</span>
                    <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>राजस्थान के समस्त पुलिस जिले</span>
                  </div>
                  <span className="badge-gov">राज्यव्यापी पुलिस जिला केंद्र</span>
                </div>
              </div>
            )}
            <DistrictHub onSelectDistrict={() => setIsRegisterOpen(true)} />
          </div>
        )}

        {/* 5. FINISHER CERTIFICATES & LEDGER VERIFICATION PAGE */}
        {(activePage === 'certificates' || activePage === 'all') && (
          <div id="page-certificates">
            {activePage !== 'all' && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>
                    <span>/</span>
                    <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>ई-सर्टिफिकेट डाउनलोड एवं आधिकारिक सत्यापन पोर्टल</span>
                  </div>
                  <span className="badge-gold">आधिकारिक राजस्थान पुलिस ई-प्रमाण पत्र</span>
                </div>
              </div>
            )}
            <CertificateHub registrations={registrations} />
            <CertificateVerification registrations={registrations} />
          </div>
        )}

        {/* 6. WOMEN SAFETY PLEDGE & 24x7 HELPLINE DIRECTORY PAGE */}
        {(activePage === 'pledge-safety' || activePage === 'all') && (
          <div id="page-pledge-safety">
            {activePage !== 'all' && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>मुख्य पृष्ठ</button>
                    <span>/</span>
                    <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>महिला सुरक्षा संकल्प एवं 24x7 आपातकालीन हेल्पलाइन</span>
                  </div>
                  <span className="badge-pink">महिला हेल्पलाइन: 1090 / 112</span>
                </div>
              </div>
            )}
            <SafetyPledge />
          </div>
        )}

        {/* 8. LIVE RUNNER RFID TRACKER & COURSE RADAR PAGE */}
        {(activePage === 'live-tracker' || activePage === 'all') && (
          <div id="page-live-tracker">
            {activePage !== 'all' && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigateToPage('home')} style={{ background: 'none', border: 'none', color: 'var(--police-navy-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>🏠 मुख्य पृष्ठ</button>
                    <span>/</span>
                    <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>लाइव रनर ट्रैकिंग एवं जेएलएन मार्ग कोर्स मॉनिटर</span>
                  </div>
                  <span className="badge-pink" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }}></span>
                    RFID ग्राउंड टाइमिंग सेंसर सक्रिय
                  </span>
                </div>
              </div>
            )}
            <LiveTrackerHub onNavigate={navigateToPage} />
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
            ) : (
              <AdminLoginPage
                onNavigate={navigateToPage}
                onLoginSuccess={handleAdminLoginSuccess}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer with Helpline Matrix & Quick Page Navigation */}
      {activePage !== 'admin' && <Footer onNavigate={navigateToPage} />}

      {/* Interactive Registration Modal with Live Bib Generator */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialCategory={selectedCategoryForModal}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Top Rec 1: Institutional & Bulk Registration Portal (RPA / Battalion / Colleges) */}
      <BulkRegistrationModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkRegisterSuccess={handleBulkRegisterSuccess}
      />
    </div>
  );
}
