import React from 'react';
import { PoliceEmblem, RunForHerBadge } from './Emblems';
import { SAFETY_HELPLINES } from '../data/mockData';
import { PhoneCall, Shield, Heart, MapPin, ExternalLink } from 'lucide-react';

export function Footer({ onNavigate }) {
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
      background: 'var(--police-navy-900)',
      color: '#ffffff',
      borderTop: '4px solid var(--police-gold-500)',
      paddingTop: '50px',
      paddingBottom: '24px',
      position: 'relative'
    }}>
      <div className="container">
        {/* Rajasthan Police Women Safety Grid */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <PhoneCall size={20} color="#ff7597" />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>
              राजस्थान पुलिस 24x7 महिला सुरक्षा एवं सहायता तंत्र (Women's Safety Network)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {SAFETY_HELPLINES.map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fca5a5', fontFamily: 'var(--font-heading)', marginBottom: '2px' }}>
                  {item.number}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Main Links & Identity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '36px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <PoliceEmblem size={40} />
              <div>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem' }}>RAJASTHAN POLICE</div>
                <div style={{ color: '#ff7597', fontWeight: 700, fontSize: '0.8rem' }}>RUN FOR HER 2026</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              महानिदेशक पुलिस <strong>राजीव शर्मा (IPS)</strong> के नेतृत्व में महिला सुरक्षा, सम्मान, समानता एवं सशक्तीकरण को समर्पित राज्यव्यापी जनसहभागिता अभियान।
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              महत्वपूर्ण लिंक्स
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
              <li><a href="#home" onClick={(e) => handleNav(e, 'home')}>🏠 होम / मुख्य विवरण</a></li>
              <li><a href="#categories" onClick={(e) => handleNav(e, 'categories')}>🏃 दौड़ श्रेणियां (21K / 10K / 5K / 2K)</a></li>
              <li><a href="#route-schedule" onClick={(e) => handleNav(e, 'route-schedule')}>🗺️ कोर्स रूट एवं समय-सारणी</a></li>
              <li><a href="#pledge-safety" onClick={(e) => handleNav(e, 'pledge-safety')}>❤️ नारी सुरक्षा सामूहिक शपथ</a></li>
              <li><a href="#districts" onClick={(e) => handleNav(e, 'districts')}>🏛️ समस्त 50 पुलिस जिले</a></li>
              <li><a href="#certificates" onClick={(e) => handleNav(e, 'certificates')}>🏆 फिनिशर सर्टिफिकेट एवं सत्यापन</a></li>
              <li><a href="#photos" onClick={(e) => handleNav(e, 'photos')}>📸 AI फोटो फाइंडर व सोशल स्टेटस</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              आयोजन मुख्यालय
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                <MapPin size={15} color="var(--police-gold-400)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>पुलिस मुख्यालय, लाल कोठी, टोंक रोड, जयपुर, राजस्थान - 302015</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                जिला स्तरीय दौड़ संबंधित जिला पुलिस अधीक्षक (SP) के निर्देशन में संचालित।
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div>
            © 2026 राजस्थान पुलिस, राजस्थान सरकार। सर्वाधिकार सुरक्षित।
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>"Every Step for Her Safety"</span>
            <span>•</span>
            <span style={{ color: '#fef08a' }}>हर कदम नारी सुरक्षा के लिए</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
