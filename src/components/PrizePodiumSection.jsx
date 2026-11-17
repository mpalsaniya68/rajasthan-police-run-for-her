import React from 'react';

export function PrizePodiumSection({ onOpenRegister }) {
  return (
    <section 
      id="prizes-showcase" 
      style={{ 
        position: 'relative', 
        background: '#ffffff', 
        padding: '50px 0 60px 0',
        borderBottom: '1px solid var(--border-medium)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: '#0f172a', margin: '0 0 8px 0', fontWeight: 900 }}>
            Prizes & Rewards (पुरस्कार एवं सम्मान)
          </h2>
        </div>

        {/* 3-Column Prize Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          {/* CARD 1: 21 KM Half Marathon */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #0f172a',
            borderTop: '5px solid #0f172a',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 20px 0' }}>
                21 KM हाफ मैराथन
              </h3>

              {/* Podium Breakdown (Clean White Theme) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥇</span>
                    <span>1st Prize (प्रथम विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>To Be Announced</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥈</span>
                    <span>2nd Prize (द्वितीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>To Be Announced</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥉</span>
                    <span>3rd Prize (तृतीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>To Be Announced</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: 10 KM Speed Run */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #0f172a',
            borderTop: '5px solid #0f172a',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 20px 0' }}>
                10 KM स्पीड रन
              </h3>

              {/* Podium Breakdown (Clean White Theme) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥇</span>
                    <span>1st Prize (प्रथम विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>To Be Announced</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥈</span>
                    <span>2nd Prize (द्वितीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>To Be Announced</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🥉</span>
                    <span>3rd Prize (तृतीय विजेता)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>To Be Announced</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: 5KM & 2KM Community & Family Run */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '2px solid #0f172a',
            borderTop: '5px solid #0f172a',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 20px 0' }}>
                5K एवं 2K फन रन
              </h3>

              {/* Perks Highlights Box (Clean White Theme) */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #0f172a',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.35rem' }}>🥇</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                    फिनिशर मेडल (Finisher Medal)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.35rem' }}>👕</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                    ड्राई-फिट टी-शर्ट (Dry-Fit T-Shirt)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.35rem' }}>🥪</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                    पोस्ट-रन रिफ्रेशमेंट्स (Refreshments)
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
