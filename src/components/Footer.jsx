import React from 'react';
import { PoliceEmblem } from './Emblems';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer({ onNavigate }) {
  const { t, isHindi } = useLanguage();
  const handleNav = (e, pageId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      const el = document.getElementById(pageId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #1b3868 0%, #11264b 100%)',
      color: '#e2e8f0',
      borderTop: '4px solid var(--police-gold-500)',
      paddingTop: '50px',
      paddingBottom: '24px',
      position: 'relative'
    }}>
      <div className="container">
        {/* Footer Main Links & Identity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '36px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <PoliceEmblem size={40} />
              <div>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem', letterSpacing: '0.02em' }}>RAJASTHAN POLICE</div>
                <div translate="no" className="notranslate" style={{ color: '#ff7597', fontWeight: 800, fontSize: '0.8rem' }}>RUN FOR HER 2027</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '12px' }}>
              {isHindi 
                ? 'राजस्थान पुलिस द्वारा महिला सुरक्षा, सम्मान, समानता एवं सशक्तीकरण को समर्पित राज्यव्यापी जनसहभागिता अभियान।'
                : 'A statewide public participation movement dedicated to women safety, dignity, and empowerment by Rajasthan Police.'}
            </p>
            <div style={{ background: '#ffffff', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', maxWidth: '190px' }}>
              <img 
                src="/images/run_for_her_official_logo.png" 
                alt="Rajasthan Police Marathon Official Logo" 
                style={{ width: '100%', height: 'auto', display: 'block' }} 
              />
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 800 }}>
              {isHindi ? 'महत्वपूर्ण लिंक्स' : 'Important Links'}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', padding: 0, margin: 0 }}>
              <li><a href="#home" onClick={(e) => handleNav(e, 'home')} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }}>{isHindi ? 'मुख्य पृष्ठ' : 'Home'}</a></li>
              <li><a href="#route-schedule" onClick={(e) => handleNav(e, 'route-schedule')} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }}>{isHindi ? 'कोर्स रूट एवं समय-सारणी' : 'Course Route & Schedule'}</a></li>
              <li><a href="#certificates" onClick={(e) => handleNav(e, 'certificates')} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }}>{isHindi ? 'फिनिशर सर्टिफिकेट एवं सत्यापन' : 'Finisher Certificates & Verification'}</a></li>
              <li><a href="#pledge-safety" onClick={(e) => handleNav(e, 'pledge-safety')} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }}>{isHindi ? 'नारी सुरक्षा सामूहिक संकल्प' : 'Women Safety Pledge'}</a></li>
              <li><a href="#expo-terminal" onClick={(e) => handleNav(e, 'expo-terminal')} style={{ color: '#6ee7b7', fontWeight: 700, textDecoration: 'none' }}>{isHindi ? '📦 एक्सपो किट व गेट स्कैनर' : '📦 Expo Kit & Gate Scanner'}</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 800 }}>
              {isHindi ? 'आयोजन मुख्यालय' : 'Headquarters'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                <MapPin size={15} color="#fde047" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{isHindi ? 'पुलिस मुख्यालय, लाल कोठी, टोंक रोड, जयपुर, राजस्थान - 302015' : 'Police Headquarters, Lal Kothi, Tonk Road, Jaipur, Rajasthan - 302015'}</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                {isHindi ? 'जिला स्तरीय दौड़ संबंधित जिला पुलिस अधीक्षक (SP) के निर्देशन में संचालित।' : 'District-level runs conducted under respective District SP direction.'}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 800 }}>
              {isHindi ? 'नोडल प्रकोष्ठ' : 'Nodal Cell'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffffff' }}>{isHindi ? 'राज्य नोडल अधिकारी:' : 'State Nodal Officer:'}</strong> {isHindi ? 'एडीजीपी (कम्युनिटी पुलिसिंग)' : 'ADGP (Community Policing)'}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffffff' }}>{isHindi ? 'ट्रैफिक समन्वय:' : 'Traffic Coordination:'}</strong> {isHindi ? 'डीसीपी (ट्रैफिक), जयपुर' : 'DCP (Traffic), Jaipur'}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffffff' }}>{isHindi ? 'ईमेल (साझेदारी व संपर्क):' : 'Email (Partnership & Query):'}</strong>{' '}
                <a href="mailto:rajpolicemarathon@rajpolice.gov.in" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>
                  rajpolicemarathon@rajpolice.gov.in
                </a>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#94a3b8' }}>
                {isHindi ? 'कंट्रोल रूम एवं आपात स्थिति: 112 / 1090 (24x7)' : 'Control Room & Emergency: 112 / 1090 (24x7)'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div>
            {isHindi ? '© 2027 राजस्थान पुलिस, राजस्थान सरकार। सर्वाधिकार सुरक्षित।' : '© 2027 Rajasthan Police, Government of Rajasthan. All Rights Reserved.'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>"Every Step for Women Safety"</span>
            <span>•</span>
            <span style={{ color: '#fde047', fontWeight: 700 }}>{isHindi ? 'हर कदम नारी सुरक्षा के लिए' : 'Every Step for Women Safety'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
