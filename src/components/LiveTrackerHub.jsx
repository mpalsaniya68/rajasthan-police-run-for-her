import React, { useState, useEffect } from 'react';
import { TRACKING_CHECKPOINTS, INITIAL_TRACKING_PROFILES } from '../data/mockData';
import { 
  Search, Timer, MapPin, Activity, Award, Heart, Share2, 
  AlertTriangle, CheckCircle2, Radio, Zap, Shield, Phone, 
  ChevronRight, ArrowRight, User, RefreshCw, Sparkles 
} from 'lucide-react';

export function LiveTrackerHub({ onNavigate }) {
  const [tracks, setTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('rpm_live_tracks');
      return saved ? JSON.parse(saved) : INITIAL_TRACKING_PROFILES;
    } catch (e) {
      return INITIAL_TRACKING_PROFILES;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBib, setSelectedBib] = useState("RJ-21K-1048");
  const [cheerToast, setCheerToast] = useState(null);
  const [simUpdateToast, setSimUpdateToast] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('rpm_live_tracks', JSON.stringify(tracks));
    } catch (e) {}
  }, [tracks]);

  // Selected runner profile
  const currentRunner = tracks.find(r => r.bibNumber.toLowerCase() === selectedBib.toLowerCase()) || tracks[0];

  // Filtered list for search results or quick-picker
  const filteredRunners = tracks.filter(r => {
    const matchesSearch = 
      r.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mobile.includes(searchQuery);
    const matchesCat = filterCategory === "all" || r.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Action: Send Live Cheer
  const handleSendCheer = () => {
    setTracks(prev => prev.map(r => {
      if (r.bibNumber === currentRunner.bibNumber) {
        return { ...r, cheersCount: (r.cheersCount || 0) + 1 };
      }
      return r;
    }));

    setCheerToast(`🎉 आपने ${currentRunner.fullName} को चीयर (उत्साहवर्धन) भेजा!`);
    setTimeout(() => setCheerToast(null), 3000);
  };

  // Action: Interactive Simulation (Advance Runner to next checkpoint)
  const handleSimulateNextMat = () => {
    if (currentRunner.status === 'FINISHED') {
      setSimUpdateToast(`🏁 ${currentRunner.fullName} पहले ही फिनिश लाइन क्रॉस कर चुके हैं!`);
      setTimeout(() => setSimUpdateToast(null), 3000);
      return;
    }

    setTracks(prev => prev.map(r => {
      if (r.bibNumber !== currentRunner.bibNumber) return r;

      // Find current checkpoint index in splits
      const currentIdx = r.splits.findIndex(s => s.status === 'current');
      if (currentIdx === -1) return r;

      const nextSplits = r.splits.map((s, idx) => {
        if (idx < currentIdx) return { ...s, status: 'completed' };
        if (idx === currentIdx) {
          const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return { ...s, status: 'completed', timestamp: nowTime, splitTime: '00:13:10', pace: '5:16' };
        }
        if (idx === currentIdx + 1) return { ...s, status: 'current' };
        return { ...s, status: 'upcoming' };
      });

      const nextCheckpoint = nextSplits[currentIdx];
      const isNowFinished = currentIdx + 1 >= nextSplits.length;
      const newKm = nextCheckpoint ? nextCheckpoint.distanceKm : r.totalCourseKm;
      const newPct = Math.min(100, Math.round((newKm / r.totalCourseKm) * 100));

      return {
        ...r,
        status: isNowFinished ? 'FINISHED' : 'IN_PROGRESS',
        currentKm: newKm,
        currentProgressPct: newPct,
        lastCheckpointId: nextCheckpoint ? nextCheckpoint.checkpointId : 'finish',
        lastCheckpointName: nextCheckpoint ? nextCheckpoint.name : 'Finish Line',
        lastSeenTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        safetyStatus: 'NORMAL',
        splits: nextSplits
      };
    }));

    setSimUpdateToast(`⏱️ RFID मैट स्कैन: ${currentRunner.fullName} का नया चेकपॉइंट रिकॉर्ड हुआ!`);
    setTimeout(() => setSimUpdateToast(null), 3500);
  };

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏃‍♂️ राजस्थान पुलिस मैराथन 2026: मैं ${currentRunner.fullName} (Bib: ${currentRunner.bibNumber}) को लाइव ट्रैक कर रहा हूँ!\n` +
      `📍 वर्तमान स्थिति: ${currentRunner.lastCheckpointName} (${currentRunner.currentKm} KM)\n` +
      `⏱️ पेस: ${currentRunner.currentPace} | स्टेटस: ${currentRunner.status === 'FINISHED' ? 'मैराथन पूर्ण 🏆' : 'दौड़ जारी 🟢'}\n` +
      `🔗 आप भी लाइव ट्रैक करें: https://police.rajasthan.gov.in/marathon2026/track`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section id="live-tracker" className="section-padding" style={{ background: '#f8fafc', minHeight: '80vh', position: 'relative' }}>
      <div className="container">

        {/* 1. Header Banner with Live Pulse */}
        <div style={{
          background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '28px 24px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid rgba(212, 175, 55, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Background Glow */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: '1px solid rgba(239, 68, 68, 0.4)'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'inline-block',
                    boxShadow: '0 0 10px #ef4444'
                  }}></span>
                  RFID LIVE RADAR
                </span>
                <span className="badge-gold">जयपुर जेएलएन मार्ग कोर्स</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', fontWeight: 900, margin: '0 0 6px 0', color: '#ffffff' }}>
                लाइव रनर ट्रैकिंग एवं कोर्स मॉनिटर (Live Runner Tracker)
              </h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '720px' }}>
                चेस्ट बिब (RFID Chip) एवं ग्राउंड सेंसर्स द्वारा ट्रैक की जा रही लाइव रनिंग स्थिति। अपने धावक का Bib नंबर दर्ज कर उनकी वास्तविक समय प्रगति, स्प्लिट गति और ईटीए देखें।
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>रेस ट्रैक सक्रियता</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--police-gold-400)' }}>10,480+ धावक</div>
              <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 800 }}>● 6 टाइमिंग चेकपॉइंट्स एक्टिव</div>
            </div>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Bib नंबर (उदा. RJ-21K-1048), धावक का नाम या मोबाइल दर्ज करें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  background: 'var(--police-navy-50)'
                }}
              />
            </div>

            {/* Category Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>श्रेणी:</span>
              {[
                { id: 'all', label: 'सभी' },
                { id: '21k', label: '21 KM' },
                { id: '10k', label: '10 KM' },
                { id: '5k', label: '5 KM' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: filterCategory === cat.id ? 'var(--police-navy-800)' : '#f1f5f9',
                    color: filterCategory === cat.id ? '#ffffff' : 'var(--text-body)',
                    border: '1px solid ' + (filterCategory === cat.id ? 'var(--police-navy-800)' : 'var(--border-subtle)')
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preset Runner Selectors (For Testing / Demo) */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--police-navy-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="var(--police-gold-600)" /> त्वरित टेस्ट धावक:
            </span>
            {tracks.map(r => (
              <button
                key={r.bibNumber}
                onClick={() => { setSelectedBib(r.bibNumber); setSearchQuery(""); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: selectedBib === r.bibNumber ? 'var(--police-navy-900)' : '#ffffff',
                  color: selectedBib === r.bibNumber ? '#ffffff' : 'var(--police-navy-900)',
                  border: '1px solid ' + (selectedBib === r.bibNumber ? 'var(--police-navy-900)' : 'var(--border-medium)'),
                  boxShadow: selectedBib === r.bibNumber ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <span>{r.fullName}</span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: r.status === 'FINISHED' ? '#dcfce7' : r.status === 'DELAYED_ALERT' ? '#fee2e2' : '#fef3c7',
                  color: r.status === 'FINISHED' ? '#166534' : r.status === 'DELAYED_ALERT' ? '#991b1b' : '#92400e',
                  fontWeight: 800
                }}>
                  {r.status === 'FINISHED' ? '🏁 पूर्ण' : r.status === 'DELAYED_ALERT' ? '⚠️ अलर्ट' : `${r.currentKm} KM`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Runner Tracking Detail Card */}
        {currentRunner && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>

            {/* Runner Profile Header Ribbon */}
            <div style={{
              background: 'linear-gradient(90deg, var(--police-navy-900) 0%, var(--police-navy-800) 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: 'var(--police-navy-900)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  boxShadow: 'var(--shadow-sm)',
                  border: '2px solid var(--police-gold-400)'
                }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--crimson-600)', letterSpacing: '0.05em' }}>BIB NO.</span>
                  <span style={{ fontSize: '0.92rem', color: 'var(--police-navy-950)' }}>{currentRunner.bibNumber.split('-')[2]}</span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                      {currentRunner.fullName}
                    </h2>
                    <span style={{
                      background: 'rgba(212, 175, 55, 0.25)',
                      color: 'var(--police-gold-300)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      border: '1px solid rgba(212, 175, 55, 0.4)'
                    }}>
                      {currentRunner.categoryName}
                    </span>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#e2e8f0',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem'
                    }}>
                      {currentRunner.runnerType}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>📍 {currentRunner.districtName}</span>
                    <span>• {currentRunner.gender}, {currentRunner.age} वर्ष</span>
                    <span>• फ्लैग-ऑफ: {currentRunner.startTime}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Cheering Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {currentRunner.status === 'FINISHED' ? (
                  <div style={{
                    background: '#166534',
                    color: '#dcfce7',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1.5px solid #4ade80'
                  }}>
                    <Award size={16} /> मैराथन सफलतापूर्वक पूर्ण (Finisher)
                  </div>
                ) : currentRunner.status === 'DELAYED_ALERT' ? (
                  <div style={{
                    background: '#991b1b',
                    color: '#fee2e2',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1.5px solid #ef4444',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    <AlertTriangle size={16} /> विलंब सुरक्षा अलर्ट (Medical Attention)
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#86efac',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1.5px solid #22c55e'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                    कोर्स पर दौड़ जारी (On Course)
                  </div>
                )}

                {/* Send Cheer Button */}
                <button
                  onClick={handleSendCheer}
                  style={{
                    background: 'var(--crimson-600)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title="धावक का हौसला बढ़ाएं"
                >
                  <Heart size={15} fill="#ffffff" /> चीयर करें ({currentRunner.cheersCount || 0})
                </button>

                {/* WhatsApp Share */}
                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="WhatsApp पर लाइव ट्रैकिंग शेयर करें"
                >
                  <Share2 size={14} /> शेयर
                </button>
              </div>
            </div>

            {/* Medical / Safety Alert Callout if Flagged */}
            {currentRunner.status === 'DELAYED_ALERT' && (
              <div style={{
                background: '#fff1f2',
                borderBottom: '2px solid #e11d48',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={24} color="#e11d48" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '0.9rem' }}>
                    🚨 राजस्थान पुलिस स्वास्थ्य एवं सुरक्षा निगरानी अलर्ट
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#be123c', marginTop: '2px' }}>
                    {currentRunner.medicalNotes || "धावक का 5KM से 10KM के बीच अपेक्षित समय से अधिक विलंब हुआ है। जेएलएन मार्ग पर तैनात पुलिस बाइक पेट्रोल व मेडिकल वैन 04 को स्थिति जांचने का निर्देश दिया गया है।"}
                  </div>
                </div>
                <button
                  onClick={() => alert(`राजस्थान पुलिस कंट्रोल रूम (112 / 1090) ने रनर ${currentRunner.fullName} के इमरजेंसी कांटेक्ट ${currentRunner.mobile} पर संपर्क किया है।`)}
                  style={{
                    background: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📞 कंट्रोल रूम जांच स्थिति
                </button>
              </div>
            )}

            {/* Interactive Course Progression Track */}
            <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--border-subtle)', background: '#fafbfc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--police-navy-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="var(--crimson-600)" />
                  लाइव रूट प्रोग्रेस: {currentRunner.lastCheckpointName} ({currentRunner.currentKm} KM / {currentRunner.totalCourseKm} KM)
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>
                  {currentRunner.currentProgressPct}% पूर्ण
                </span>
              </div>

              {/* Progress Bar Container */}
              <div style={{
                position: 'relative',
                height: '14px',
                background: '#e2e8f0',
                borderRadius: '8px',
                overflow: 'visible',
                margin: '20px 0 35px 0'
              }}>
                {/* Active Colored Fill */}
                <div style={{
                  height: '100%',
                  width: `${currentRunner.currentProgressPct}%`,
                  background: currentRunner.status === 'FINISHED' 
                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                    : currentRunner.status === 'DELAYED_ALERT'
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, var(--police-navy-700), var(--crimson-600))',
                  borderRadius: '8px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}>
                  {/* Pulsing Runner Avatar Pin */}
                  <div style={{
                    position: 'absolute',
                    right: '-16px',
                    top: '-12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--police-navy-950)',
                    color: '#ffffff',
                    border: '3px solid var(--police-gold-400)',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    zIndex: 2,
                    cursor: 'pointer'
                  }} title={`वर्तमान स्थान: ${currentRunner.currentKm} KM`}>
                    🏃
                  </div>
                </div>

                {/* Checkpoint Markers on the Line */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>0K अल्बर्ट हॉल</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>5K यूनिवर्सिटी</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>10K WTP</span>
                  {currentRunner.totalCourseKm > 10 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>15K जवाहर सर्किल</span>
                  )}
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--crimson-600)' }}>
                    🏁 {currentRunner.totalCourseKm}K फ़िनिश
                  </span>
                </div>
              </div>

              {/* Simulation Controller (Demo Mode Interactive Advancement) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  onClick={handleSimulateNextMat}
                  style={{
                    background: '#f8fafc',
                    color: 'var(--police-navy-800)',
                    border: '1.5px solid var(--police-navy-300)',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="डेमो: अगले चेकपॉइंट पर RFID स्कैन सिमुलेट करें"
                >
                  <RefreshCw size={14} /> ⚡ टेस्ट: अगला चेकपॉइंट क्रॉस कराएं
                </button>
              </div>
            </div>

            {/* 4 Performance Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1px',
              background: 'var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {/* Card 1: Current Pace */}
              <div style={{ background: '#ffffff', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Timer size={15} color="var(--police-navy-700)" /> वर्तमान पेस (Avg Pace)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--police-navy-950)', margin: '6px 0 2px 0' }}>
                  {currentRunner.currentPace}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>गति: {currentRunner.currentSpeed || '11.3 km/h'}</div>
              </div>

              {/* Card 2: Projected Finish Time (ETA) */}
              <div style={{ background: '#ffffff', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Activity size={15} color="var(--crimson-600)" /> अनुमानित समाप्ति (ETA)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--crimson-600)', margin: '6px 0 2px 0' }}>
                  {currentRunner.projectedFinishTime}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>चिप टाइम: ~{currentRunner.projectedChipTime}</div>
              </div>

              {/* Card 3: Elapsed Time */}
              <div style={{ background: '#ffffff', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Zap size={15} color="var(--police-gold-600)" /> बीता हुआ समय (Elapsed)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--police-navy-950)', margin: '6px 0 2px 0' }}>
                  {currentRunner.elapsedTime}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>अंतिम देखा: {currentRunner.lastSeenTime}</div>
              </div>

              {/* Card 4: Estimated Live Rank */}
              <div style={{ background: '#ffffff', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Award size={15} color="var(--police-gold-600)" /> लाइव अनुमानित रैंक
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--police-gold-700)', margin: '6px 0 2px 0' }}>
                  #{currentRunner.genderRank || '8'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>({currentRunner.gender})</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ओवरऑल: {currentRunner.overallRank}</div>
              </div>
            </div>

            {/* Split Timings Checkpoint Table */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                  ⏱️ आधिकारिक चेकपॉइंट एवं स्प्लिट टाइमिंग (Split Timings Ledger)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  * सेंसर मैट द्वारा मिलीसेकंड स्तर पर रिकॉर्डेड
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--police-navy-50)', borderBottom: '2px solid var(--border-medium)', color: 'var(--police-navy-900)' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>चेकपॉइंट (RFID Gate)</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>दूरी</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>पार करने का समय</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>स्प्लिट अवधि</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>स्प्लिट पेस</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>स्थिति</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRunner.splits.map((s, idx) => (
                      <tr 
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: s.status === 'current' ? '#eff6ff' : idx % 2 === 0 ? '#ffffff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: s.status === 'current' ? 800 : 600, color: s.status === 'current' ? 'var(--police-navy-900)' : 'var(--text-body)' }}>
                          {s.status === 'completed' && <span style={{ color: '#16a34a', marginRight: '6px' }}>✓</span>}
                          {s.status === 'current' && <span style={{ color: '#2563eb', marginRight: '6px' }}>📍</span>}
                          {s.status === 'upcoming' && <span style={{ color: '#94a3b8', marginRight: '6px' }}>○</span>}
                          {s.name}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{s.distanceKm} KM</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{s.timestamp}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>{s.splitTime}</td>
                        <td style={{ padding: '12px 14px' }}>{s.pace !== '-' ? `${s.pace} /km` : '-'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {s.status === 'completed' ? (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                              सत्यापित ✓
                            </span>
                          ) : s.status === 'current' ? (
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                              वर्तमान पड़ाव 📍
                            </span>
                          ) : (
                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                              आगामी
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Police Safety & Medical Assurance Footer Box */}
            <div style={{
              background: '#f8fafc',
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={22} color="var(--police-navy-800)" />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--police-navy-900)' }}>राजस्थान पुलिस महिला सुरक्षा डेस्क:</strong> जेएलएन मार्ग के प्रत्येक 500 मीटर पर निर्भया स्क्वाड एवं एम्बुलेंस यूनिट्स तैनात हैं।
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="tel:1090"
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid #fca5a5'
                  }}
                >
                  <Phone size={13} /> गरिमा 1090
                </a>
                <a
                  href="tel:112"
                  style={{
                    background: '#f1f5f9',
                    color: 'var(--police-navy-900)',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <Phone size={13} /> आपातकालीन 112
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Secret Toasts */}
        {cheerToast && (
          <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '25px',
            background: 'var(--police-navy-950)',
            color: '#fde68a',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            border: '1.5px solid var(--police-gold-500)',
            fontSize: '0.88rem',
            fontWeight: 800,
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-in'
          }}>
            {cheerToast}
          </div>
        )}

        {simUpdateToast && (
          <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '25px',
            background: '#047857',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            border: '1.5px solid #34d399',
            fontSize: '0.88rem',
            fontWeight: 800,
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-in'
          }}>
            {simUpdateToast}
          </div>
        )}

      </div>
    </section>
  );
}
