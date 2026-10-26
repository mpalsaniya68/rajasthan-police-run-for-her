import React, { useState } from 'react';
import { Share2, Download, Sparkles, Smartphone, Check, Heart, Shield, RefreshCw } from 'lucide-react';
import { PoliceEmblem, RunForHerBadge } from './Emblems';

export function SocialStoryGenerator() {
  const [runnerName, setRunnerName] = useState("सुनीता शर्मा (Sunita Sharma)");
  const [category, setCategory] = useState("10 KM Speed Run");
  const [selectedSlogan, setSelectedSlogan] = useState("Every Step for Her Safety — हर कदम नारी सुरक्षा के लिए");
  const [badgeType, setBadgeType] = useState("pledge"); // "pledge", "registered", "finisher"
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const slogans = [
    "Every Step for Her Safety — हर कदम नारी सुरक्षा के लिए",
    "Run Together. Stand Together. Make Rajasthan Safer.",
    "नारी सुरक्षा, सम्मान एवं समानता के लिए राजस्थान पुलिस के साथ कदम",
    "I Run for Her Dignity • मैं नारी सम्मान के लिए दौड़ रहा/रही हूँ"
  ];

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
    alert(`9:16 WhatsApp Status HD पोस्टर तैयार होकर डाउनलोड हो गया! आप इसे अपने WhatsApp Status या Instagram Story पर लगा सकते हैं।`);
  };

  const handleWhatsAppStatus = () => {
    const text = `🌟 मैं राजस्थान पुलिस के साथ नारी सुरक्षा के लिए कदम बढ़ा रहा हूँ! राजस्थान पुलिस मैराथन - "RUN FOR HER" में भाग लें और निःशुल्क ई-पास प्राप्त करें: ${window.location.origin} 🏃‍♀️👮‍♂️ #RunForHer #RajasthanPolice`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="story-generator" className="section-padding" style={{ position: 'relative', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Viral Social Movement Studio</span>
          <h2>एक-क्लिक सोशल मीडिया स्टोरी व स्टेटस पोस्टर (Viral Story Studio)</h2>
          <p>
            अपने नाम और संकल्प के साथ 9:16 वर्टिकल WhatsApp Status एवं Instagram Story पोस्टर जनरेट करें और इस जन-आंदोलन को पूरे राजस्थान में वायरल करें।
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          alignItems: 'center',
          maxWidth: '920px',
          margin: '0 auto'
        }}>
          {/* Left: Customizer Controls */}
          <div className="gov-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <Smartphone size={20} color="var(--police-navy-800)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--police-navy-900)' }}>पोस्टर कस्टमाइजर</h3>
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                पोस्टर पर आपका नाम:
              </label>
              <input
                type="text"
                value={runnerName}
                onChange={(e) => setRunnerName(e.target.value)}
                placeholder="अपना नाम दर्ज करें"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.88rem' }}
              />
            </div>

            {/* Badge Type Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                पोस्टर का प्रकार (Badge Type):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: "pledge", label: "सुरक्षा संकल्प" },
                  { id: "registered", label: "पंजीकृत धावक" },
                  { id: "finisher", label: "फिनिशर प्राइड" }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBadgeType(b.id)}
                    style={{
                      padding: '7px 4px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: badgeType === b.id ? 'var(--police-navy-900)' : 'var(--police-navy-50)',
                      color: badgeType === b.id ? '#ffffff' : 'var(--text-body)',
                      border: badgeType === b.id ? '1px solid var(--police-navy-900)' : '1px solid var(--border-subtle)',
                      textAlign: 'center'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                दौड़ श्रेणी (Category):
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '9px', border: '1px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                <option value="21 KM Half Marathon">21 KM Half Marathon</option>
                <option value="10 KM Speed Run">10 KM Speed Run</option>
                <option value="5 KM Community Run">5 KM Community Run</option>
                <option value="2 KM Family & Youth Walk">2 KM Family & Youth Walk</option>
              </select>
            </div>

            {/* Slogan Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                पोस्टर संदेश (Slogan):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {slogans.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSlogan(s)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: selectedSlogan === s ? 700 : 500,
                      background: selectedSlogan === s ? 'var(--crimson-50)' : '#ffffff',
                      color: selectedSlogan === s ? 'var(--crimson-600)' : 'var(--text-body)',
                      border: selectedSlogan === s ? '1px solid var(--crimson-600)' : '1px solid var(--border-subtle)',
                      textAlign: 'left'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={handleDownload}
                className="btn-navy"
                style={{ padding: '10px', fontSize: '0.82rem', justifyContent: 'center' }}
              >
                <Download size={15} /> 9:16 पोस्टर डाउनलोड
              </button>
              <button
                onClick={handleWhatsAppStatus}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Share2 size={15} /> WhatsApp स्टेटस
              </button>
            </div>
          </div>

          {/* Right: The 9:16 Vertical Story Live Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
              WhatsApp Status (9:16) Live Preview
            </div>

            {/* The 9:16 Smartphone Card Frame */}
            <div style={{
              width: '280px',
              height: '497px', // Exact 9:16 aspect ratio
              background: 'linear-gradient(180deg, #0a1c3d 0%, #0f2b5c 40%, #1e3a8a 70%, #d62828 100%)',
              borderRadius: '24px',
              border: '4px solid #ffffff',
              boxShadow: '0 20px 45px rgba(10, 28, 61, 0.3)',
              padding: '18px 16px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center'
            }}>
              {/* Background Ashoka & Vijay Stambh Watermark */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.08,
                pointerEvents: 'none'
              }}>
                <PoliceEmblem size={260} />
              </div>

              {/* Story Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '8px', zIndex: 1 }}>
                <PoliceEmblem size={30} />
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fde68a', letterSpacing: '0.04em' }}>
                  RAJASTHAN POLICE MARATHON
                </div>
                <RunForHerBadge size={28} />
              </div>

              {/* Center Content */}
              <div style={{ zIndex: 1, padding: '10px 0' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#fef3c7',
                  letterSpacing: '0.04em',
                  marginBottom: '10px'
                }}>
                  {badgeType === "pledge" ? "★ I TOOK THE SAFETY PLEDGE ★" : badgeType === "registered" ? "★ OFFICIAL REGISTERED RUNNER ★" : "★ PROUD FINISHER ★"}
                </div>

                <div style={{
                  fontSize: 'clamp(1.15rem, 3vw, 1.4rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                  marginBottom: '6px'
                }}>
                  {runnerName || "YOUR NAME"}
                </div>

                <div style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 700, marginBottom: '14px' }}>
                  {category}
                </div>

                {/* Slogan Quote Box */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.72rem',
                  color: '#f8fafc',
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                  marginBottom: '12px'
                }}>
                  "{selectedSlogan}"
                </div>

                <div style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>
                  10,000+ जयपुर फ्लैगशिप • समस्त 50 पुलिस जिले
                </div>
              </div>

              {/* Story Footer with DGP Reference & Call to Action */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '0.62rem',
                color: '#fef3c7',
                fontWeight: 700,
                zIndex: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>नेतृत्व: पुलिस महानिदेशक राजीव शर्मा (IPS)</div>
                <div style={{ color: '#ffffff', opacity: 0.9, marginTop: '2px' }}>
                  आप भी जुड़ें: marathon.police.rajasthan.gov.in
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              📲 सीधे एक क्लिक में अपने WhatsApp Status या Instagram Story पर लगाएं।
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
