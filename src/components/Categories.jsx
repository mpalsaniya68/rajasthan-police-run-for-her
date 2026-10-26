import React from 'react';
import { RACE_CATEGORIES } from '../data/mockData';
import { Zap, Flame, Users, HeartHandshake, Sparkles, Check, Clock, ArrowRight } from 'lucide-react';

export function Categories({ onSelectCategory, onOpenBulkRegister }) {
  const getIcon = (name, color) => {
    switch (name) {
      case 'Zap': return <Zap size={22} color={color} />;
      case 'Flame': return <Flame size={22} color={color} />;
      case 'Users': return <Users size={22} color={color} />;
      case 'HeartHandshake': return <HeartHandshake size={22} color={color} />;
      default: return <Sparkles size={22} color={color} />;
    }
  };

  return (
    <section id="categories" className="section-padding" style={{ position: 'relative', background: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Official Rajasthan Police Marathon Standard</span>
          <h2>रेस कैटेगरीज एवं दूरी (Race Categories)</h2>
          <p>
            अपनी क्षमता अनुसार दूरी चुनें। अनुभवी मैराथन धावकों के लिए RFID टाइमिंग चिप युक्त 21K/10K से लेकर महिलाओं, परिवारों व युवाओं के लिए 5K/2K कम्युनिटी रन।
          </p>
        </div>

        <div className="grid-3">
          {RACE_CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="gov-card" 
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${cat.color}`,
                background: '#ffffff'
              }}
            >
              <div>
                {/* Header of Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: 'var(--police-navy-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {getIcon(cat.iconName, cat.color)}
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: cat.color,
                    background: 'var(--police-navy-50)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {cat.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--police-navy-900)' }}>
                  {cat.name}
                </h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px', minHeight: '40px' }}>
                  {cat.description}
                </p>

                {/* Timing & Age Details */}
                <div style={{
                  background: 'var(--police-navy-50)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-body)' }}>
                    <Clock size={14} color="var(--police-navy-800)" />
                    <span>फ्लैग-ऑफ: <strong>{cat.flagOff}</strong></span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    आयु: <strong>{cat.minAge}+ वर्ष</strong>
                  </div>
                </div>

                {/* Participant Perks */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-800)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    प्रतिभागी किट में क्या मिलेगा:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cat.perks.map((perk, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-body)' }}>
                        <span style={{ color: cat.color, display: 'flex', alignItems: 'center' }}><Check size={14} /></span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>शुल्क (Fee):</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#047857' }}>{cat.fee}</span>
                </div>
                <button 
                  onClick={() => onSelectCategory(cat.id)}
                  className="btn-glass-navy"
                  style={{ width: '100%', padding: '12px', fontSize: '0.92rem', justifyContent: 'center' }}
                >
                  <span>Select & Register</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Bulk Registration CTA Bar */}
        <div style={{
          marginTop: '32px',
          background: 'linear-gradient(135deg, var(--police-navy-50) 0%, #ffffff 100%)',
          border: '2px dashed var(--police-gold-500)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: 'var(--police-navy-800)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                INSTITUTIONAL
              </span>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--police-navy-900)' }}>
                🏢 कॉलेज, स्कूल, RPA, RAC बटालियन व ग्रुप हेतु बल्क रजिस्ट्रेशन
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-body)', maxWidth: '650px' }}>
              क्या आप अपनी संस्था के 50+ या 500+ धावकों को एक साथ रजिस्टर करना चाहते हैं? आधिकारिक CSV/एक्सेल टेम्पलेट डाउनलोड करें और सिंगल क्लिक में ऑटो-बिब जनरेट करें।
            </p>
          </div>
          <button 
            onClick={onOpenBulkRegister}
            className="btn-glass-gold"
            style={{ padding: '12px 24px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
          >
            बल्क रजिस्ट्रेशन पोर्टल खोलें &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
