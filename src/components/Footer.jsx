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
      background: 'linear-gradient(180deg, #edf4fc 0%, #e2ecf7 100%)',
      color: '#334155',
      borderTop: '4px solid var(--police-navy-900)',
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
                <div style={{ fontWeight: 800, color: 'var(--police-navy-950)', fontSize: '1.05rem' }}>RAJASTHAN POLICE</div>
                <div translate="no" className="notranslate" style={{ color: '#be123c', fontWeight: 800, fontSize: '0.8rem' }}>RUN FOR HER 2027</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              {isHindi 
                ? 'राजस्थान पुलिस द्वारा महिला सुरक्षा, सम्मान, समानता एवं सशक्तीकरण को समर्पित राज्यव्यापी जनसहभागिता अभियान।'
                : 'A statewide public participation movement dedicated to women safety, dignity, and empowerment by Rajasthan Police.'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--police-navy-950)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 800 }}>
              {isHindi ? 'महत्वपूर्ण लिंक्स' : 'Important Links'}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <li><a href="#home" onClick={(e) => handleNav(e, 'home')} style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600 }}>{isHindi ? 'मुख्य पृष्ठ' : 'Home'}</a></li>
              <li><a href="#route-schedule" onClick={(e) => handleNav(e, 'route-schedule')} style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600 }}>{isHindi ? 'कोर्स रूट एवं समय-सारणी' : 'Course Route & Schedule'}</a></li>
              <li><a href="#certificates" onClick={(e) => handleNav(e, 'certificates')} style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600 }}>{isHindi ? 'फिनिशर सर्टिफिकेट एवं सत्यापन' : 'Finisher Certificates & Verification'}</a></li>
              <li><a href="#pledge-safety" onClick={(e) => handleNav(e, 'pledge-safety')} style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600 }}>{isHindi ? 'नारी सुरक्षा सामूहिक संकल्प' : 'Women Safety Pledge'}</a></li>
              <li><a href="#expo-terminal" onClick={(e) => handleNav(e, 'expo-terminal')} style={{ color: '#065f46', fontWeight: 700, textDecoration: 'none' }}>{isHindi ? '📦 एक्सपो किट व गेट स्कैनर' : '📦 Expo Kit & Gate Scanner'}</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--police-navy-950)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 800 }}>
              {isHindi ? 'आयोजन मुख्यालय' : 'Headquarters'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                <MapPin size={15} color="var(--police-gold-700)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{isHindi ? 'पुलिस मुख्यालय, लाल कोठी, टोंक रोड, जयपुर, राजस्थान - 302015' : 'Police Headquarters, Lal Kothi, Tonk Road, Jaipur, Rajasthan - 302015'}</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
                {isHindi ? 'जिला स्तरीय दौड़ संबंधित जिला पुलिस अधीक्षक (SP) के निर्देशन में संचालित।' : 'District-level runs conducted under respective District SP direction.'}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--police-navy-950)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 800 }}>
              {isHindi ? 'नोडल प्रकोष्ठ' : 'Nodal Cell'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: 'var(--police-navy-950)' }}>{isHindi ? 'राज्य नोडल अधिकारी:' : 'State Nodal Officer:'}</strong> {isHindi ? 'एडीजीपी (कम्युनिटी पुलिसिंग)' : 'ADGP (Community Policing)'}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: 'var(--police-navy-950)' }}>{isHindi ? 'ट्रैफिक समन्वय:' : 'Traffic Coordination:'}</strong> {isHindi ? 'डीसीपी (ट्रैफिक), जयपुर' : 'DCP (Traffic), Jaipur'}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: 'var(--police-navy-950)' }}>{isHindi ? 'ईमेल:' : 'Email:'}</strong> rpm.nodal@rajasthanpolice.gov.in
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#64748b' }}>
                {isHindi ? 'कंट्रोल रूम एवं आपात स्थिति: 112 / 1090 (24x7)' : 'Control Room & Emergency: 112 / 1090 (24x7)'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: '#64748b' }}>
          <div>
            {isHindi ? '© 2027 राजस्थान पुलिस, राजस्थान सरकार। सर्वाधिकार सुरक्षित।' : '© 2027 Rajasthan Police, Government of Rajasthan. All Rights Reserved.'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>"Every Step for Women Safety"</span>
            <span>•</span>
            <span style={{ color: 'var(--police-gold-700)', fontWeight: 700 }}>{isHindi ? 'हर कदम नारी सुरक्षा के लिए' : 'Every Step for Women Safety'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
