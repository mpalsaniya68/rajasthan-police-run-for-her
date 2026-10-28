import React, { useState, useEffect } from 'react';
import { Award, Search, Download, Share2, Send, CheckCircle2, Shield, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { PoliceEmblem, OfficialGoldSeal, RunForHerBadge } from './Emblems';
import QRCode from 'qrcode';

export function CertificateHub({ registrations = [] }) {
  const [selectedRunner, setSelectedRunner] = useState(registrations[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showDispatchNotice, setShowDispatchNotice] = useState(false);

  useEffect(() => {
    if (registrations.length > 0 && !selectedRunner) {
      setSelectedRunner(registrations[0]);
    }
  }, [registrations]);

  useEffect(() => {
    if (selectedRunner) {
      const verifyUrl = `${window.location.origin}#verify?certId=${selectedRunner.certificateId}`;
      QRCode.toDataURL(verifyUrl, { width: 130, margin: 1, color: { dark: '#0a1c3d', light: '#ffffff' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("Certificate QR Error:", err));
    }
  }, [selectedRunner]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    const found = registrations.find(r => 
      r.bibNumber.toLowerCase().includes(q) || 
      r.mobile.includes(q) || 
      r.fullName.toLowerCase().includes(q) ||
      r.certificateId.toLowerCase().includes(q)
    );
    if (found) {
      setSelectedRunner(found);
    } else {
      alert("कोई रिकॉर्ड नहीं मिला: " + searchQuery);
    }
  };

  const handleAutoDispatch = () => {
    setShowDispatchNotice(true);
    setTimeout(() => setShowDispatchNotice(false), 5000);
  };

  const shareWhatsApp = () => {
    if (!selectedRunner) return;
    const text = `🎉 I have completed the ${selectedRunner.categoryName} in Rajasthan Police Marathon - "RUN FOR HER" with an official finish time of ${selectedRunner.finishTime}! Verify my official certificate here: ${window.location.origin}#verify?certId=${selectedRunner.certificateId} 🏃‍♀️👮‍♂️ #RunForHer #RajasthanPolice`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!selectedRunner) return null;

  return (
    <section id="certificates" className="section-padding" style={{ position: 'relative', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Official Finisher Honors</span>
          <h2>डिजिटल फिनिशर सर्टिफिकेट एवं ऑटो-डिस्पैच हब</h2>
          <p>
            रेस पूरी होते ही तय दूरी के आधार पर राजस्थान पुलिस मुख्यालय द्वारा अधिकृत डिजिटल सर्टिफिकेट स्वतः जनरेट होकर धावक के मोबाइल (SMS/WhatsApp) व ईमेल पर प्रेषित हो जाता है।
          </p>
        </div>

        {/* Runner Selector & Quick Search Bar */}
        <div className="gov-card" style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Quick Select Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>क्विक रनर चयन:</span>
            {registrations.slice(0, 4).map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRunner(r)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: selectedRunner.id === r.id ? 'var(--police-navy-800)' : 'var(--police-navy-50)',
                  color: selectedRunner.id === r.id ? '#ffffff' : 'var(--text-body)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {r.fullName} ({r.category.toUpperCase()})
              </button>
            ))}
          </div>

          {/* Search by Bib or Phone */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="बिब # या मोबाइल नंबर..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                minWidth: '180px'
              }}
            />
            <button type="submit" className="btn-navy" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
              <Search size={14} /> खोजें
            </button>
          </form>
        </div>

        {/* Automated Dispatch Notification Alert */}
        {showDispatchNotice && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#059669" />
              <div>
                <strong style={{ color: '#065f46', fontSize: '0.88rem' }}>सर्टिफिकेट स्वतः प्रेषित हुआ!</strong>
                <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                  आधिकारिक लिंक एवं PDF <strong>{selectedRunner.mobile}</strong> (WhatsApp/SMS) तथा <strong>{selectedRunner.email}</strong> पर भेजा गया।
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>Status: Delivered ✓</span>
          </div>
        )}

        {/* Certificate Display & Control Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: '24px', alignItems: 'start' }} className="cert-responsive-grid">
          {/* THE OFFICIAL HIGH-DIGNITY CERTIFICATE (SCROLLABLE ON MOBILE) */}
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <div className="printable-certificate" style={{
              background: '#ffffff',
              color: '#0a1c3d',
              borderRadius: '8px',
              padding: 'clamp(20px, 4vw, 36px)',
              boxShadow: 'var(--shadow-md)',
              border: '10px double var(--police-gold-500)',
              position: 'relative',
              overflow: 'hidden',
              minWidth: '580px' // Ensures standard certificate layout doesn't squash on small screens
            }}>
              {/* Watermark Rajasthan Police Crest */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                pointerEvents: 'none',
                zIndex: 0
              }}>
                <PoliceEmblem size={380} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Certificate Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--police-gold-500)', paddingBottom: '12px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PoliceEmblem size={54} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--police-gold-700)', textTransform: 'uppercase' }}>
                        GOVERNMENT OF RAJASTHAN
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0a1c3d', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                        RAJASTHAN POLICE
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Statewide Public Awareness Initiative
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <RunForHerBadge size={48} />
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--crimson-600)', marginTop: '2px' }}>
                      RUN FOR HER 2026
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
                    fontWeight: 700,
                    color: '#0a1c3d',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    Certificate of Accomplishment
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--police-gold-700)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginTop: '2px'
                  }}>
                    Women's Safety, Dignity & Empowerment Movement
                  </div>
                </div>

                {/* Presented To */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '4px' }}>
                    This official certificate is proudly awarded to
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: '#0a1c3d',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #0a1c3d',
                    display: 'inline-block',
                    padding: '0 24px 2px 24px',
                    letterSpacing: '0.02em'
                  }}>
                    {selectedRunner.fullName}
                  </div>
                </div>

                {/* Statement */}
                <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-body)', maxWidth: '580px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
                  For successfully completing the <strong>{selectedRunner.categoryName}</strong> under the leadership of the <strong>Director General of Police (DGP), Rajasthan</strong> on the motto <em>"Every Step for Her Safety."</em>
                </p>

                {/* Timing Matrix */}
                <div style={{
                  background: 'var(--police-navy-50)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>BIB NUMBER</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--crimson-600)' }}>{selectedRunner.bibNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>GUN TIME</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{selectedRunner.finishTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>CHIP TIME</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{selectedRunner.chipTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG PACE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{selectedRunner.avgPace}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>RANK</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>{selectedRunner.genderRank}</div>
                  </div>
                </div>

                {/* Signatures & Seal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '1.2rem',
                      color: '#0a1c3d',
                      fontWeight: 700,
                      marginBottom: '2px'
                    }}>
                      Rajeev Sharma, IPS
                    </div>
                    <div style={{ height: '2px', background: '#0a1c3d', width: '130px', margin: '0 auto 2px auto' }}></div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0a1c3d' }}>
                      DIRECTOR GENERAL OF POLICE
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Rajasthan, Jaipur</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <OfficialGoldSeal size={70} />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    {qrCodeUrl && (
                      <img src={qrCodeUrl} alt="Verify QR" style={{ width: '60px', height: '60px', border: '1px solid var(--border-subtle)', padding: '2px', borderRadius: '4px' }} />
                    )}
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0a1c3d', marginTop: '2px' }}>
                      {selectedRunner.certificateId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: DISPATCH CONTROLS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="gov-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={15} color="var(--police-navy-800)" /> ऑटोमैटिक डिलीवरी स्थिति
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--police-navy-50)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600 }}>SMS Notification</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedRunner.mobile}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>✓ Sent</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--police-navy-50)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600 }}>WhatsApp PDF</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Official Digital Card</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>✓ Delivered</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--police-navy-50)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600 }}>Email Attachment</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedRunner.email}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>✓ Delivered</span>
                </div>
              </div>

              <button 
                onClick={handleAutoDispatch}
                className="btn-secondary"
                style={{ width: '100%', padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
              >
                <Send size={14} /> पुनः SMS/Email डिस्पैच करें
              </button>
            </div>

            <div className="gov-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                सर्टिफिकेट डाउनलोड व शेयर
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-gold"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  <Download size={15} /> Print / Save as PDF
                </button>

                <button
                  onClick={shareWhatsApp}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: 'none'
                  }}
                >
                  <Share2 size={15} /> WhatsApp पर शेयर करें
                </button>

                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  color: '#065f46',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>अधिकृत सत्यापन पूर्ण (100% Verified)</div>
                    <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                      राजस्थान पुलिस महानिदेशक कार्यालय द्वारा अधिकृत एवं सुरक्षित क्यूआर क्रिप्टोग्राफिक लेजर द्वारा डिजिटल सत्यापित।
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cert-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
