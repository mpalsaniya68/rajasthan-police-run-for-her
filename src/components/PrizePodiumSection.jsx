import React from 'react';
import { Trophy, Medal, Award, Shirt, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function PrizePodiumSection({ onOpenRegister }) {
  const { t, isHindi } = useLanguage();

  return (
    <section 
      id="prizes-showcase" 
      style={{ 
        position: 'relative', 
        background: '#ffffff', 
        padding: '64px 0',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--police-navy-950)', margin: '0 0 8px 0', fontWeight: 800 }}>
            {t('prizesHeading')}
          </h2>
        </div>

        {/* 3-Column Prize Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          {/* CARD 1: 21 KM Half Marathon */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            borderTop: '4px solid #d4af37',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                  {isHindi ? '21 KM हाफ मैराथन' : '21 KM Half Marathon'}
                </h3>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '4px' }}>
                  {isHindi ? 'प्रमुख रेस' : 'Timed Run'}
                </span>
              </div>

              {/* Podium Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    <Trophy size={18} color="#d4af37" strokeWidth={2.2} />
                    <span>{isHindi ? 'प्रथम पुरस्कार' : '1st Prize'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-950)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹51,000
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    <Medal size={18} color="#64748b" strokeWidth={2.2} />
                    <span>{isHindi ? 'द्वितीय पुरस्कार' : '2nd Prize'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-950)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹31,000
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    <Award size={18} color="#b45309" strokeWidth={2.2} />
                    <span>{isHindi ? 'तृतीय पुरस्कार' : '3rd Prize'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-950)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹21,000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: 10 KM Speed Run */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            borderTop: '4px solid #64748b',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                  {isHindi ? '10 KM स्पीड रन' : '10 KM Speed Run'}
                </h3>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '4px' }}>
                  {isHindi ? 'स्पीड रन' : 'Timed Run'}
                </span>
              </div>

              {/* Podium Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    <Trophy size={18} color="#d4af37" strokeWidth={2.2} />
                    <span>{isHindi ? 'प्रथम पुरस्कार' : '1st Prize'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-950)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹21,000
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    <Medal size={18} color="#64748b" strokeWidth={2.2} />
                    <span>{isHindi ? 'द्वितीय पुरस्कार' : '2nd Prize'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-950)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹11,000
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    <Award size={18} color="#b45309" strokeWidth={2.2} />
                    <span>{isHindi ? 'तृतीय पुरस्कार' : '3rd Prize'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--police-navy-950)', fontVariantNumeric: 'tabular-nums' }}>
                    ₹5,100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: 5K & 2K Fun Run */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            borderTop: '4px solid #b45309',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                  {isHindi ? '5 KM व 2 KM फन रन' : '5K & 2K Fun Run'}
                </h3>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#ffedd5', color: '#9a3412', padding: '3px 10px', borderRadius: '4px' }}>
                  {isHindi ? 'कम्युनिटी वॉक' : 'Open for All'}
                </span>
              </div>

              {/* Perks Highlights Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  gap: '12px'
                }}>
                  <Medal size={18} color="#d4af37" strokeWidth={2.2} />
                  <div style={{ fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    {isHindi ? 'आधिकारिक फिनिशर मेडल' : 'Official Finisher Medal'}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  gap: '12px'
                }}>
                  <Shirt size={18} color="var(--police-navy-800)" strokeWidth={2.2} />
                  <div style={{ fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    {isHindi ? 'ड्राई-फिट रनिंग टी-शर्ट' : 'Dry-Fit Running T-Shirt'}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  gap: '12px'
                }}>
                  <UtensilsCrossed size={18} color="var(--police-navy-800)" strokeWidth={2.2} />
                  <div style={{ fontWeight: 700, color: 'var(--police-navy-900)', fontSize: '0.92rem' }}>
                    {isHindi ? 'पोस्ट-रन अल्पाहार व हाइड्रेशन' : 'Post-Run Refreshments & Hydration'}
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
