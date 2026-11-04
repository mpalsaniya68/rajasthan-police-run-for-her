import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, QrCode, Search, CheckCircle2, AlertTriangle, PackageCheck, 
  Shirt, RefreshCw, LogOut, Camera, CameraOff, Volume2, VolumeX, 
  UserCheck, AlertOctagon, Sparkles, Award
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { PoliceEmblem, RunForHerBadge } from './Emblems';

// Built-in Web Audio API Synthesizer (No external MP3 files needed)
const playSound = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      // Pleasant high-pitch two-tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc1.stop(ctx.currentTime + 0.1);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'error' || type === 'duplicate') {
      // Deep warning buzz tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Audio autoplay restrictions fallback
  }
};

export function ExpoScannerTerminal({ currentUser, onLogout, onNavigate }) {
  // Operating Mode: 'expo' (Kit & T-Shirt Handover) or 'gate' (Race Day Morning Entry)
  const [terminalMode, setTerminalMode] = useState(() => {
    return currentUser?.counterId?.startsWith('gate_') ? 'gate' : 'expo';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedRunner, setScannedRunner] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // 'SUCCESS', 'ALREADY_COLLECTED', 'INVALID', 'GATE_APPROVED', 'GATE_ALREADY_ENTERED'
  const [statusMessage, setStatusMessage] = useState('');
  const [isHandingOver, setIsHandingOver] = useState(false);

  // Counter Statistics
  const [counterStats, setCounterStats] = useState({
    myCounterKits: 0,
    totalKitsDistributed: 0,
    totalGateEntries: 0,
    pendingKits: 0
  });

  // Camera Scanner States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const html5QrCodeRef = useRef(null);
  const inputSearchRef = useRef(null);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load Initial Counter Statistics
  const fetchStats = async () => {
    const token = sessionStorage.getItem('rajpol_admin_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/expo/stats?counterId=${encodeURIComponent(currentUser?.counterId || '')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setCounterStats(data.stats);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [currentUser]);

  // Keep input focused for Hardware Barcode / QR Scanner Gun
  useEffect(() => {
    if (!isCameraActive && inputSearchRef.current) {
      inputSearchRef.current.focus();
    }
  }, [isCameraActive, scannedRunner]);

  // Camera QR Scanner Lifecycle
  useEffect(() => {
    if (isCameraActive) {
      const qrScanner = new Html5Qrcode('interactive-qr-scanner');
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0
      };

      qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Successful QR Detection
          handleVerifyRunner(decodedText);
          // Optional short pause on scan
        },
        (error) => {
          // Continuous frame parsing error (silent)
        }
      ).catch((err) => {
        console.error("Camera init error:", err);
        setCameraError("कैमरा चालू करने में असमर्थ। कृपया कैमरा अनुमति (Permission) दें अथवा बारकोड गन / सर्च बार का उपयोग करें।");
        setIsCameraActive(false);
      });

      return () => {
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current.clear();
          }).catch(() => {});
        }
      };
    }
  }, [isCameraActive, terminalMode]);

  // Toggle Camera
  const toggleCamera = () => {
    setCameraError('');
    setIsCameraActive(prev => !prev);
  };

  // Main Verification Function (Works with QR string, Bib, Phone, or Barcode Gun)
  const handleVerifyRunner = async (rawInput) => {
    if (!rawInput || !rawInput.trim()) return;
    const clean = rawInput.trim();
    setIsSearching(true);
    setScanStatus(null);
    setStatusMessage('');

    const token = sessionStorage.getItem('rajpol_admin_token');

    // 1. If in Race-Day Gate Entry Mode: Direct Instant Gate Verification
    if (terminalMode === 'gate') {
      try {
        const res = await fetch('/api/gate/verify-entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            q: clean,
            gateName: currentUser?.counterName || "गेट-01 (अल्बर्ट हॉल प्रवेश)",
            operatorName: currentUser?.fullName || "गेट मार्शल"
          })
        });

        const data = await res.json();
        setIsSearching(false);

        if (data.status === 'ENTRY_APPROVED') {
          if (soundEnabled) playSound('success');
          setScanStatus('GATE_APPROVED');
          setStatusMessage(data.message);
          setScannedRunner(data.runner);
          fetchStats();
        } else if (data.status === 'ALREADY_ENTERED') {
          if (soundEnabled) playSound('duplicate');
          setScanStatus('GATE_ALREADY_ENTERED');
          setStatusMessage(data.message);
          setScannedRunner(data.runner);
        } else {
          if (soundEnabled) playSound('error');
          setScanStatus('INVALID');
          setStatusMessage(data.message || 'अमान्य ई-पास! रिकॉर्ड उपलब्ध नहीं है।');
          setScannedRunner(null);
        }
      } catch (err) {
        setIsSearching(false);
        setScanStatus('INVALID');
        setStatusMessage('सर्वर से कनेक्ट करने में त्रुटि।');
      }
      return;
    }

    // 2. If in Expo Kit Handover Mode: Query Runner Profile
    try {
      const res = await fetch('/api/expo/runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ q: clean })
      });

      const data = await res.json();
      setIsSearching(false);

      if (data.success && data.runner) {
        setScannedRunner(data.runner);
        if (data.runner.kitCollected) {
          if (soundEnabled) playSound('duplicate');
          setScanStatus('ALREADY_COLLECTED');
          setStatusMessage(`⚠️ पूर्व में वितरित! यह किट ${data.runner.collectedBy || 'काउंटर'} द्वारा पहले ही सौंपी जा चुकी है।`);
        } else {
          if (soundEnabled) playSound('success');
          setScanStatus('SUCCESS');
          setStatusMessage('✅ धावक सत्यापित! कृपया नीचे दिए गए टी-शर्ट साइज की पुष्टि कर किट सुपुर्द करें।');
        }
      } else {
        if (soundEnabled) playSound('error');
        setScanStatus('INVALID');
        setStatusMessage(data.error || 'धावक रिकॉर्ड नहीं मिला। कृपया ई-पास या बिब पुनः जांचें।');
        setScannedRunner(null);
      }
    } catch (err) {
      setIsSearching(false);
      setScanStatus('INVALID');
      setStatusMessage('सर्वर से संपर्क नहीं हो पाया।');
    }
  };

  // Handover Execution
  const handleHandoverKit = async () => {
    if (!scannedRunner) return;
    setIsHandingOver(true);
    const token = sessionStorage.getItem('rajpol_admin_token');

    try {
      const res = await fetch('/api/expo/handover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          runnerId: scannedRunner.id,
          bibNumber: scannedRunner.bibNumber,
          rfidTagId: `RFID-${scannedRunner.bibNumber}`,
          operatorName: currentUser?.fullName || 'वॉलंटियर',
          counterName: currentUser?.counterName || 'काउंटर-01'
        })
      });

      const data = await res.json();
      setIsHandingOver(false);

      if (data.success && data.runner) {
        if (soundEnabled) playSound('success');
        setScanStatus('SUCCESS_HANDED_OVER');
        setStatusMessage(data.message);
        setScannedRunner(prev => ({
          ...prev,
          kitCollected: true,
          kitCollectedAt: data.runner.kit_collected_at,
          collectedBy: data.runner.collected_by
        }));
        fetchStats();
      } else {
        if (soundEnabled) playSound('error');
        setScanStatus('ALREADY_COLLECTED');
        setStatusMessage(data.error || 'किट वितरण में त्रुटि');
      }
    } catch (err) {
      setIsHandingOver(false);
      setStatusMessage('सर्वर त्रुटि: किट स्टेटस अपडेट नहीं हो पाया।');
    }
  };

  // Reset to Ready State
  const handleClear = () => {
    setScannedRunner(null);
    setScanStatus(null);
    setStatusMessage('');
    setSearchQuery('');
    if (inputSearchRef.current) {
      inputSearchRef.current.focus();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* 1. Official Terminal Top Header */}
      <header style={{
        background: '#0a1c3d',
        color: '#ffffff',
        borderBottom: '3px solid #d4af37',
        padding: '12px 20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Station Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PoliceEmblem size={42} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                राजस्थान पुलिस मुख्यालय • मैराथन 2027
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentUser?.counterName || "एक्सपो किट व बिब डेस्क"}</span>
                <span style={{
                  fontSize: '0.7rem',
                  background: terminalMode === 'gate' ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 800
                }}>
                  {terminalMode === 'gate' ? '⚡ गेट एंट्री मोड' : '📦 एक्सपो किट मोड'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                अधिकृत ऑपरेटर: <strong style={{ color: '#f1f5f9' }}>{currentUser?.fullName || "वॉलंटियर"}</strong>
              </div>
            </div>
          </div>

          {/* Right: Operational Quick Stats & Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Counter Tally Pill */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '6px 14px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.65rem', color: '#fde68a', fontWeight: 700 }}>
                {terminalMode === 'gate' ? 'इस गेट से प्रविष्ट' : 'आपके काउंटर से वितरित'}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {terminalMode === 'gate' ? counterStats.totalGateEntries : counterStats.myCounterKits}
              </div>
            </div>

            {/* Mode Switcher Toggle */}
            <button
              onClick={() => {
                setTerminalMode(prev => prev === 'expo' ? 'gate' : 'expo');
                handleClear();
              }}
              style={{
                background: terminalMode === 'gate' ? '#334155' : '#047857',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="मोड बदलें (एक्सपो किट ⇄ गेट एंट्री)"
            >
              <RefreshCw size={14} />
              <span>{terminalMode === 'expo' ? 'गेट एंट्री मोड पर जाएं' : 'एक्सपो किट मोड पर जाएं'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              style={{
                background: soundEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${soundEnabled ? '#22c55e' : '#ef4444'}`,
                color: '#ffffff',
                padding: '8px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title={soundEnabled ? "ऑडियो बीप सक्रिय" : "ऑडियो म्यूट"}
            >
              {soundEnabled ? <Volume2 size={16} color="#4ade80" /> : <VolumeX size={16} color="#f87171" />}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Terminal Workspace */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '16px' }}>
        
        {/* Top Control Bar: Camera Scanner & Hardware Gun Input */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          padding: '16px 20px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={22} color="#0a1c3d" />
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0a1c3d' }}>
                {terminalMode === 'gate' ? 'अल्बर्ट हॉल गेट स्कैनर' : 'धावक ई-पास व बिब स्कैनर'}
              </h2>
            </div>

            {/* Camera Toggle Button */}
            <button
              onClick={toggleCamera}
              style={{
                background: isCameraActive ? '#ef4444' : '#0b3a75',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '6px',
                fontSize: '0.86rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              {isCameraActive ? <CameraOff size={18} /> : <Camera size={18} />}
              <span>{isCameraActive ? 'कैमरा बंद करें' : '📷 मोबाइल / वेबकैम QR स्कैनर चालू करें'}</span>
            </button>
          </div>

          {/* Camera View Box (When Active) */}
          {isCameraActive && (
            <div style={{
              background: '#0a1c3d',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#fde68a', fontWeight: 800, marginBottom: '8px' }}>
                ई-पास का QR कोड कैमरे के सामने लाएं (स्वतः स्कैन होगा)
              </div>
              <div 
                id="interactive-qr-scanner" 
                style={{ 
                  width: '100%', 
                  maxWidth: '380px', 
                  margin: '0 auto', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              ></div>
              {cameraError && (
                <div style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '8px', fontWeight: 700 }}>
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {/* Barcode Gun / Keyboard Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyRunner(searchQuery);
            }}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputSearchRef}
                type="text"
                placeholder="यहाँ बिब नंबर दर्ज करें या 2D बारकोड गन से ट्रिगर दबाएं (उदा. RJ-21K-1048)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '6px',
                  border: '2px solid #0b3a75',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#0a1c3d',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
              <Search size={20} color="#0b3a75" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              style={{
                background: '#0a1c3d',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={16} />
              <span>{isSearching ? 'जाँच हो रही है...' : 'सत्यापित करें'}</span>
            </button>

            {(scannedRunner || scanStatus) && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕ रीसेट
              </button>
            )}
          </form>

          {/* Quick Demo Test Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <span style={{ color: '#64748b', fontWeight: 700 }}>त्वरित टेस्ट डेटा:</span>
            {[
              { bib: 'RJ-21K-1048', name: 'पूजा चौधरी (21K - Size M)' },
              { bib: 'RJ-10K-3419', name: 'विक्रम सिंह (10K - Size L)' },
              { bib: 'RJ-05K-7714', name: 'दीपक मीणा (5K - Size XL)' }
            ].map(testItem => (
              <button
                key={testItem.bib}
                type="button"
                onClick={() => {
                  setSearchQuery(testItem.bib);
                  handleVerifyRunner(testItem.bib);
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#0b3a75',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🏷️ {testItem.bib}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Real-time Status Alert Banner */}
        {scanStatus && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '1.05rem',
            fontWeight: 800,
            background: 
              scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED' 
                ? '#f0fdf4' 
                : scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED'
                  ? '#fffbeb'
                  : '#fef2f2',
            border: `2px solid ${
              scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED'
                ? '#22c55e'
                : scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED'
                  ? '#f59e0b'
                  : '#ef4444'
            }`,
            color: 
              scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED'
                ? '#15803d'
                : scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED'
                  ? '#b45309'
                  : '#b91c1c'
          }}>
            {scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED' ? (
              <CheckCircle2 size={26} color="#16a34a" style={{ flexShrink: 0 }} />
            ) : scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED' ? (
              <AlertTriangle size={26} color="#d97706" style={{ flexShrink: 0 }} />
            ) : (
              <AlertOctagon size={26} color="#dc2626" style={{ flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{statusMessage}</div>
              {scanStatus === 'ALREADY_COLLECTED' && (
                <div style={{ fontSize: '0.84rem', marginTop: '2px', color: '#92400e' }}>
                  ⚠️ कृपया पुनः किट सुपुर्द न करें। यह धावक पहले ही किट प्राप्त कर चुका है।
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. MODE 1: EXPO KIT HANDOVER PROFILE CARD */}
        {terminalMode === 'expo' && scannedRunner && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #0a1c3d',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }}>
            {/* Top Bar of Runner Profile */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    padding: '4px 14px',
                    borderRadius: '6px'
                  }}>
                    {scannedRunner.bibNumber}
                  </span>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0a1c3d' }}>
                    {scannedRunner.fullName}
                  </h1>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '6px' }}>
                  दौड़ श्रेणी: <strong style={{ color: '#0a1c3d' }}>{scannedRunner.categoryName}</strong> • स्थान: <strong>{scannedRunner.districtName}</strong>
                </div>
              </div>

              <div>
                {scannedRunner.kitCollected ? (
                  <div style={{
                    background: '#dcfce7',
                    border: '2px solid #86efac',
                    color: '#15803d',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={18} /> किट व RFID आवंटित ✓
                  </div>
                ) : (
                  <div style={{
                    background: '#fef3c7',
                    border: '2px solid #fde68a',
                    color: '#92400e',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ⏳ किट आवंटन लंबित
                  </div>
                )}
              </div>
            </div>

            {/* THREE MASSIVE PILLARS: T-SHIRT SIZE, BLOOD GROUP, MEDICAL ALERT */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Pillar 1: THE T-SHIRT SIZE (ULTRA HIGH-VISIBILITY) */}
              <div style={{
                background: '#f0fdf4',
                border: '3px solid #16a34a',
                borderRadius: '10px',
                padding: '18px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
              }}>
                <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Shirt size={18} color="#16a34a" />
                  <span>आवंटित टी-शर्ट साइज</span>
                </div>
                <div style={{
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  color: '#14532d',
                  margin: '4px 0',
                  lineHeight: 1,
                  fontFamily: 'monospace'
                }}>
                  {scannedRunner.tshirtSize || 'M'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                  राजस्थान पुलिस आधिकारिक रनिंग जर्सी
                </div>
              </div>

              {/* Pillar 2: BLOOD GROUP */}
              <div style={{
                background: '#fff1f2',
                border: '2px solid #f43f5e',
                borderRadius: '10px',
                padding: '18px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.82rem', color: '#be123c', fontWeight: 800, textTransform: 'uppercase' }}>
                  🩸 रक्त समूह (Blood Group)
                </div>
                <div style={{
                  fontSize: '2.6rem',
                  fontWeight: 900,
                  color: '#e11d48',
                  margin: '4px 0',
                  lineHeight: 1
                }}>
                  {scannedRunner.bloodGroup || 'N/A'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9f1239', fontWeight: 700 }}>
                  आपातकालीन सुरक्षा पहचान
                </div>
              </div>

              {/* Pillar 3: MEDICAL ALERT */}
              <div style={{
                background: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#fffbeb' : '#f8fafc',
                border: `2px solid ${scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#f59e0b' : '#cbd5e1'}`,
                borderRadius: '10px',
                padding: '18px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 800, textTransform: 'uppercase' }}>
                  ⚠️ चिकित्सा अलर्ट (Medical Alert)
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#b45309' : '#059669',
                  margin: '12px 0 6px 0'
                }}>
                  {scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' 
                    ? `⚠️ ${scannedRunner.medicalCondition}` 
                    : '✓ स्वस्थ (No Medical Issues)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  आपातकालीन संपर्क: {scannedRunner.emergencyContact || '112'}
                </div>
              </div>
            </div>

            {/* ACTION FOOTER: HANDOVER EXECUTION */}
            <div style={{
              background: '#f8fafc',
              borderTop: '2px solid #e2e8f0',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                {scannedRunner.kitCollected ? (
                  <div style={{ fontSize: '0.86rem', color: '#15803d', fontWeight: 700 }}>
                    ✓ यह किट {scannedRunner.collectedBy || 'काउंटर'} द्वारा पूर्व में सुपुर्द की जा चुकी है।
                  </div>
                ) : (
                  <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 700 }}>
                    कृपया धावक का पहचान पत्र (Aadhaar / ID) जांचें और सही <strong>साइज {scannedRunner.tshirtSize}</strong> की टी-शर्ट व चेस्ट बिब हैंडओवर करें।
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {!scannedRunner.kitCollected ? (
                  <button
                    onClick={handleHandoverKit}
                    disabled={isHandingOver}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '8px',
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <PackageCheck size={22} />
                    <span>{isHandingOver ? 'डेटाबेस में दर्ज हो रहा है...' : '✅ किट एवं बिब हैंडओवर करें'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleClear}
                    style={{
                      background: '#0a1c3d',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    अगला धावक स्कैन करें &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. MODE 2: RACE DAY GATE SENTRY PROFILE CARD */}
        {terminalMode === 'gate' && scannedRunner && (
          <div style={{
            background: scanStatus === 'GATE_APPROVED' ? '#f0fdf4' : '#fffbeb',
            borderRadius: '12px',
            border: `3px solid ${scanStatus === 'GATE_APPROVED' ? '#16a34a' : '#f59e0b'}`,
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 16px',
              borderRadius: '20px',
              background: scanStatus === 'GATE_APPROVED' ? '#16a34a' : '#d97706',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 900,
              marginBottom: '14px'
            }}>
              {scanStatus === 'GATE_APPROVED' ? '✓ GATE ENTRY GRANTED' : '⚠️ PREVIOUSLY ENTERED'}
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0a1c3d', margin: '0 0 6px 0' }}>
              {scannedRunner.fullName}
            </h1>

            <div style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: '#dc2626',
              marginBottom: '12px'
            }}>
              BIB: {scannedRunner.bibNumber}
            </div>

            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#1e3a8a',
              background: '#ffffff',
              display: 'inline-block',
              padding: '8px 24px',
              borderRadius: '8px',
              border: '2px solid #93c5fd',
              marginBottom: '20px'
            }}>
              👉 अधिकृत कॉरिडोर: <strong>{scannedRunner.categoryName}</strong>
            </div>

            <div>
              <button
                onClick={handleClear}
                style={{
                  background: '#0a1c3d',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                अगला धावक स्कैन करें (Next Runner) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* 6. Idle Empty State Notice */}
        {!scannedRunner && !scanStatus && (
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '2px dashed #cbd5e1',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div style={{
              display: 'inline-flex',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <QrCode size={32} color="#0a1c3d" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', color: '#0a1c3d', fontSize: '1.15rem', fontWeight: 800 }}>
              स्कैनर तैयार है (Terminal Ready)
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '480px', marginInline: 'auto' }}>
              ऊपर दिए गए बटन से मोबाइल कैमरा चालू करें अथवा USB बारकोड गन से धावक के ई-पास का QR कोड स्कैन करें।
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
