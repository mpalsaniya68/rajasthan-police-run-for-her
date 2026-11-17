import React from 'react';

export function PatronDesk() {
  return (
    <section id="patron-desk" style={{ background: '#f8fafc', padding: '60px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">

        {/* 1. SECTION: MESSAGE FROM DIRECTOR GENERAL OF POLICE (DGP RAJASTHAN) */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '2px solid var(--police-navy-200)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          marginBottom: '0'
        }}>
          <div style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
            {/* DGP Portrait & Designation */}
            <div style={{ textAlign: 'center', maxWidth: '340px', margin: '0 auto' }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '100%',
                maxWidth: '280px',
                height: '352px',
                borderRadius: '16px',
                padding: '6px',
                background: 'linear-gradient(135deg, var(--police-gold-500), var(--police-navy-800))',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden'
              }}>
                <img
                  src="/images/dgp_rajeev_sharma.jpg"
                  alt="DGP Rajeev Sharma, IPS"
                  loading="eager"
                  style={{
                    width: '100%',
                    height: '340px',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    borderRadius: '12px',
                    display: 'block'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  background: 'rgba(10, 28, 61, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  zIndex: 2
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fef08a' }}>राजीव शर्मा, भा.पु.से. (IPS)</div>
                  <div style={{ fontSize: '0.72rem', color: '#e2e8f0', marginTop: '2px' }}>महानिदेशक पुलिस, राजस्थान (DGP)</div>
                </div>
              </div>
            </div>

            {/* DGP Official Written Message */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-gold">आयोजन संरक्षक संदेश</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>आधिकारिक वक्तव्य</span>
              </div>
              {/* DGP Official Written Message Area - Left blank per instructions */}
              <div style={{
                minHeight: '210px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                border: '1.5px dashed var(--border-medium)',
                margin: '18px 0'
              }}>
              </div>

              {/* Official Stamp & Sign Off */}
              <div style={{
                marginTop: '22px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>
                    (राजीव शर्मा, भा.पु.से.)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>
                    महानिदेशक पुलिस, राजस्थान
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
