import React, { useState } from 'react';
import { Award, Sparkles, Shield, RotateCw, CheckCircle2 } from 'lucide-react';
import { PoliceEmblem, OfficialGoldSeal } from './Emblems';

export function InteractiveMedal() {
  const [selectedMedal, setSelectedMedal] = useState("21k");
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const medals = {
    "21k": {
      title: "21 KM Half Marathon Gold Medal",
      finish: "Heavy Cast Antique Gold with Enamel Inlay",
      ribbon: "Official Police Navy & Crimson Dual Ribbon",
      color: "#d97706",
      desc: "Awarded to all official finishers who conquer the 21.097 KM Half Marathon course under the time limit."
    },
    "10k": {
      title: "10 KM Speed Challenge Medal",
      finish: "Brushed Gold with Red Enamel Ring",
      ribbon: "Tricolor & Gold Silk Ribbon",
      color: "#c69214",
      desc: "Awarded to all finishers completing the timed 10 KM course."
    },
    "5k": {
      title: "5 KM Community Finisher Medal",
      finish: "Polished Bronze-Gold Commemorative",
      ribbon: "Women's Safety 'Run for Her' Pink Ribbon",
      color: "#c9184a",
      desc: "Awarded across Jaipur and all 50 Districts celebrating public participation."
    }
  };

  const current = medals[selectedMedal];

  // Mouse move handler for interactive 3D perspective tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({
      x: -(y / rect.height) * 25,
      y: (x / rect.width) * 25
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <section className="section-padding" style={{ background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Interactive 3D Finisher Trophy</span>
          <h2>आधिकारिक फिनिशर पदक (Official Finisher Medal)</h2>
          <p>
            दौड़ पूरी करने वाले प्रत्येक प्रतिभागी को माननीय मुख्यमंत्री एवं महानिदेशक पुलिस के तत्वावधान में यह प्रतिष्ठित पदक प्रदान किया जाएगा। माउस या टच से पदक को घुमाकर देखें।
          </p>
        </div>

        {/* Medal Selection Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {[
            { id: "21k", label: "21 KM Half Marathon Gold" },
            { id: "10k", label: "10 KM Challenge Medal" },
            { id: "5k", label: "5 KM Community Medal" }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMedal(m.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: selectedMedal === m.id ? 'var(--police-navy-900)' : 'var(--police-navy-50)',
                color: selectedMedal === m.id ? '#ffffff' : 'var(--text-body)',
                border: selectedMedal === m.id ? '1px solid var(--police-navy-900)' : '1px solid var(--border-subtle)'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 3D Medal Showcase Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          alignItems: 'center',
          maxWidth: '880px',
          margin: '0 auto'
        }}>
          {/* Interactive Tiltable Medal Canvas */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
              perspective: '1000px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'grab',
              padding: '20px'
            }}
          >
            {/* The Medal Ribbon (Hanging from top) */}
            <div style={{
              width: '58px',
              height: '80px',
              background: selectedMedal === '5k' 
                ? 'linear-gradient(90deg, #c9184a 0%, #ff7597 50%, #c9184a 100%)' 
                : 'linear-gradient(90deg, #0f2b5c 0%, #d62828 50%, #0f2b5c 100%)',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '4px', height: '100%', background: '#fde68a' }}></div>
            </div>

            {/* The 3D Medal Disc with Vijay Stambh & Police Crest */}
            <div style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
              transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease',
              transformStyle: 'preserve-3d',
              position: 'relative',
              marginTop: '-16px',
              zIndex: 2
            }}>
              {/* Outer Golden Fluted Rim */}
              <div style={{
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef3c7 0%, #d97706 40%, #b45309 70%, #78350F 100%)',
                boxShadow: '0 20px 40px rgba(180, 83, 9, 0.35), 0 0 0 6px rgba(254, 243, 199, 0.6)',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Inner Recessed Medal Face */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #0f2b5c 60%, #081838 100%)',
                  border: '3px solid #fde68a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <PoliceEmblem size={68} />
                  
                  <div style={{
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    color: '#fef3c7',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: '4px'
                  }}>
                    FINISHER • 2026
                  </div>

                  <div style={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: '#fca5a5',
                    letterSpacing: '0.05em'
                  }}>
                    RUN FOR HER
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCw size={12} /> माउस या टच से पदक को घुमाकर देखें (Interactive 3D)
            </div>
          </div>

          {/* Medal Details & Dignitary Citation */}
          <div className="gov-card" style={{ padding: '24px', border: '1px solid var(--border-medium)', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Award size={22} color="var(--police-gold-700)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--police-navy-900)' }}>
                {current.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '16px' }}>
              {current.desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--police-navy-50)', padding: '10px 14px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>पदक निर्माण एवं धातु</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>{current.finish}</div>
              </div>

              <div style={{ background: 'var(--police-navy-50)', padding: '10px 14px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>रिबन डिजाइन</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>{current.ribbon}</div>
              </div>

              <div style={{ background: 'var(--police-navy-50)', padding: '10px 14px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>समारोह विवरण</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--crimson-600)' }}>
                  माननीय मुख्यमंत्री महोदय एवं खेल हस्तियों द्वारा समापन पर प्रदान
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>प्रत्येक वैध फिनिशर को फिनिश लाइन पर तुरंत प्रदान।</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
