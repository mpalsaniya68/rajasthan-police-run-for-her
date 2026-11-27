import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export function PatronDesk() {
  const { isHindi } = useLanguage();

  return (
    <section id="patron-desk" style={{ background: '#ffffff', padding: '60px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
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
              </div>
            </div>

            {/* DGP Official Written Message */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-gold">{isHindi ? 'आयोजन संरक्षक संदेश' : "Patron's Message"}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {isHindi ? 'संदेश' : 'Official Message'}
                </span>
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
                    {isHindi ? '(राजीव शर्मा, भा.पु.से.)' : '(Rajeev Sharma, IPS)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>
                    {isHindi ? 'महानिदेशक पुलिस, राजस्थान' : 'Director General of Police, Rajasthan'}
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
