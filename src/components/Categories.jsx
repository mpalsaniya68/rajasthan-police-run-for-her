import React from 'react';
import { RACE_CATEGORIES } from '../data/mockData';
import { Zap, Flame, Users, HeartHandshake, Sparkles, Check, Clock, ArrowRight, Timer } from 'lucide-react';

export function Categories({ onSelectCategory, onOpenBulkRegister }) {
  const getIcon = (name) => {
    switch (name) {
      case 'Zap': return <Zap size={24} color="var(--police-navy-900)" />;
      case 'Flame': return <Flame size={24} color="var(--police-navy-900)" />;
      case 'Users': return <Users size={24} color="var(--police-navy-900)" />;
      case 'HeartHandshake': return <HeartHandshake size={24} color="var(--police-navy-900)" />;
      default: return <Sparkles size={24} color="var(--police-navy-900)" />;
    }
  };

  return (
    <section id="categories" className="section-padding" style={{ position: 'relative', background: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            दौड़ श्रेणियां (Race Categories)
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '12px 0 8px 0' }}>
            रेस कैटेगरीज एवं दूरी (Race Categories)
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', maxWidth: '820px', margin: '0 auto' }}>
            अपनी क्षमता अनुसार दूरी चुनें। अनुभवी मैराथन धावकों के लिए RFID टाइमिंग चिप युक्त 21K/10K से लेकर महिलाओं, परिवारों व युवाओं के लिए 5K/2K कम्युनिटी रन।
          </p>
        </div>

        <div className="grid-3" style={{ gap: '24px' }}>
          {RACE_CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="gov-card" 
              style={{
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1.5px solid var(--border-medium)',
                borderTop: '4px solid var(--police-navy-900)',
                borderRadius: '12px',
                background: '#ffffff',
                boxShadow: '0 4px 16px rgba(10, 28, 61, 0.05)'
              }}
            >
              <div>
                {/* Header of Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: 'var(--police-navy-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid var(--border-medium)'
                  }}>
                    {getIcon(cat.iconName)}
                  </div>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    color: 'var(--police-navy-900)',
                    background: 'var(--police-navy-50)',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)'
                  }}>
                    {cat.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.55rem', fontWeight: 900, marginBottom: '10px', color: 'var(--police-navy-950)', letterSpacing: '-0.01em' }}>
                  {cat.name}
                </h3>
                
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px', minHeight: '48px', fontWeight: 500 }}>
                  {cat.description}
                </p>

                {/* Timing, Age & Official Cut-Off Details */}
                <div style={{
                  background: '#f8fafc',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '22px',
                  border: '1px solid var(--border-medium)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.96rem', color: 'var(--police-navy-950)', fontWeight: 600 }}>
                      <Clock size={17} color="var(--police-navy-800)" />
                      <span>फ्लैग-ऑफ: <strong style={{ color: 'var(--police-navy-950)', fontWeight: 800 }}>{cat.flagOff}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>
                      आयु: <strong style={{ color: 'var(--police-navy-950)', fontWeight: 800 }}>{cat.minAge}+ वर्ष</strong>
                    </div>
                  </div>
                  {cat.cutOffTime && (
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#991b1b',
                      fontWeight: 700,
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}>
                      <Timer size={16} color="#dc2626" />
                      <span>कट-ऑफ समय: <strong style={{ fontWeight: 800 }}>{cat.cutOffTime}</strong></span>
                    </div>
                  )}
                </div>

                {/* Participant Perks */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: 'var(--police-navy-900)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '12px'
                  }}>
                    प्रतिभागी किट में क्या मिलेगा:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
                    {cat.perks.map((perk, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.96rem', color: 'var(--police-navy-950)', fontWeight: 600 }}>
                        <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                          <Check size={17} strokeWidth={2.8} />
                        </span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px'
                }}>
                  <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 700 }}>पंजीकरण शुल्क (Registration Fee):</span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>{cat.fee}</span>
                </div>
                <button 
                  onClick={() => onSelectCategory(cat.id)}
                  className="btn-navy"
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    justifyContent: 'center',
                    borderRadius: '50px',
                    gap: '8px'
                  }}
                >
                  <span>पंजीकरण करें (Register Now)</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Bulk Registration CTA Bar */}
        <div style={{
          marginTop: '36px',
          background: 'linear-gradient(135deg, var(--police-navy-50) 0%, #ffffff 100%)',
          border: '2px dashed var(--police-gold-500)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ background: 'var(--police-navy-800)', color: '#ffffff', fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px' }}>
                INSTITUTIONAL
              </span>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--police-navy-900)', fontWeight: 800 }}>
                🏢 कॉलेज, स्कूल, RPA, RAC बटालियन व ग्रुप हेतु बल्क रजिस्ट्रेशन
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.96rem', color: 'var(--text-body)', maxWidth: '720px', lineHeight: '1.6' }}>
              क्या आप अपनी संस्था के 50+ या 500+ धावकों को एक साथ रजिस्टर करना चाहते हैं? आधिकारिक CSV/एक्सेल टेम्पलेट डाउनलोड करें और सिंगल क्लिक में ऑटो-बिब जनरेट करें।
            </p>
          </div>
          <button 
            onClick={onOpenBulkRegister}
            className="btn-gold"
            style={{ padding: '13px 26px', fontSize: '1rem', whiteSpace: 'nowrap', borderRadius: '50px', fontWeight: 800 }}
          >
            बल्क रजिस्ट्रेशन पोर्टल खोलें &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
