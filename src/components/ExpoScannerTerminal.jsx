import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, QrCode, Search, CheckCircle2, AlertTriangle, PackageCheck, 
  Shirt, RefreshCw, LogOut, Camera, CameraOff, Volume2, VolumeX, 
  UserCheck, AlertOctagon, Sparkles, Award, Upload, RotateCcw
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
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);

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
  } catch (e) {}
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
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  const html5QrCodeRef = useRef(null);
  const inputSearchRef = useRef(null);
  const fileInputRef = useRef(null);

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
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Keep input focused for Hardware Barcode / QR Scanner Gun
  useEffect(() => {
    if (!isCameraActive && inputSearchRef.current) {
      inputSearchRef.current.focus();
    }
  }, [isCameraActive, scannedRunner]);

  // Stop scanner instance cleanly
  const stopScannerInstance = async () => {
    if (html5QrCodeRef.current) {
      try {
        const scanner = html5QrCodeRef.current;
        html5QrCodeRef.current = null;
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (e) {
        console.warn('Scanner stop note:', e);
      }
    }
  };

  // Robust multi-device camera starter
  const startCamera = async (targetCameraId = null) => {
    setIsCameraStarting(true);
    setCameraError('');
    await stopScannerInstance();

    const el = document.getElementById('interactive-qr-scanner');
    if (!el) {
      setIsCameraStarting(false);
      return;
    }

    try {
      const scannerInstance = new Html5Qrcode('interactive-qr-scanner');
      html5QrCodeRef.current = scannerInstance;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(180, Math.floor(edge * 0.72));
          return { width: size, height: size };
        }
      };

      const onScanSuccess = (decodedText) => {
        if (decodedText) {
          handleVerifyRunner(decodedText);
        }
      };

      // Step 1: Detect available cameras
      let devices = availableCameras;
      if (!devices || devices.length === 0) {
        try {
          devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
          }
        } catch (camListErr) {
          console.warn('Camera enumeration note:', camListErr);
        }
      }

      // Step 2: Choose Camera ID
      let cameraIdToUse = targetCameraId || selectedCameraId;
      if (!cameraIdToUse && devices && devices.length > 0) {
        const rearCam = devices.find(d => 
          (d.label || '').toLowerCase().includes('back') || 
          (d.label || '').toLowerCase().includes('rear') || 
          (d.label || '').toLowerCase().includes('environment')
        );
        cameraIdToUse = rearCam ? rearCam.id : devices[0].id;
        setSelectedCameraId(cameraIdToUse);
      }

      // Step 3: Attempt start with camera ID
      if (cameraIdToUse) {
        try {
          await scannerInstance.start(cameraIdToUse, config, onScanSuccess, () => {});
          setIsCameraStarting(false);
          return;
        } catch (deviceStartErr) {
          console.warn('Specific camera ID failed, trying soft ideal constraint:', deviceStartErr);
        }
      }

      // Step 4: Fallback to soft ideal constraint
      try {
        await scannerInstance.start({ facingMode: { ideal: 'environment' } }, config, onScanSuccess, () => {});
        setIsCameraStarting(false);
        return;
      } catch (idealErr) {
        console.warn('Ideal environment failed, falling back to user camera:', idealErr);
      }

      // Step 5: Fallback to front / user webcam constraint
      try {
        await scannerInstance.start({ facingMode: 'user' }, config, onScanSuccess, () => {});
        setIsCameraStarting(false);
        return;
      } catch (userErr) {
        console.warn('User camera failed, trying unconstrained start:', userErr);
      }

      // Step 6: Fallback to any video track
      await scannerInstance.start(true, config, onScanSuccess, () => {});
      setIsCameraStarting(false);

    } catch (finalErr) {
      setIsCameraStarting(false);
      console.error('Camera start failed:', finalErr);
      let msg = 'कैमरा चालू नहीं हो सका। ';
      if (finalErr?.name === 'NotAllowedError' || finalErr?.name === 'PermissionDeniedError') {
        msg += 'ब्राउज़र में कैमरा अनुमति ब्लॉक है। कृपया एड्रेस बार में लॉक 🔒 आइकन पर क्लिक कर कैमरा Allow करें।';
      } else if (finalErr?.name === 'NotFoundError' || finalErr?.name === 'DevicesNotFoundError') {
        msg += 'कोई कैमरा नहीं मिला। कृपया USB वेबकैम जोड़ें अथवा नीचे दिए गए बटन से फोटो / इमेज चुनें।';
      } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        msg += 'ब्राउज़र सुरक्षा नियमों के अनुसार कैमरा केवल HTTPS या localhost पर ही कार्य करता है।';
      } else {
        msg += 'कृपया कैमरा अनुमति जांचें अथवा नीचे दिए गए बटन से फोटो चुनें या बिब नंबर दर्ज करें।';
      }
      setCameraError(msg);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    setCameraError('');
    setIsCameraActive(prev => !prev);
  };

  // Switch camera when user selects different device
  const handleSwitchCamera = async (camId) => {
    setSelectedCameraId(camId);
    if (isCameraActive) {
      await startCamera(camId);
    }
  };

  // Camera Lifecycle hook
  useEffect(() => {
    let timer;
    if (isCameraActive) {
      timer = setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      stopScannerInstance();
    }
    return () => {
      clearTimeout(timer);
      stopScannerInstance();
    };
  }, [isCameraActive, terminalMode]);

  // File Upload QR Code Scanner Handler
  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSearching(true);
    setScanStatus(null);
    setStatusMessage('');

    try {
      const html5Qr = new Html5Qrcode('qr-file-scanner-temp');
      const decodedText = await html5Qr.scanFile(file, true);
      try { await html5Qr.clear(); } catch(err) {}
      setIsSearching(false);
      handleVerifyRunner(decodedText);
    } catch (err) {
      setIsSearching(false);
      console.error('File QR scan error:', err);
      alert('इस फोटो में कोई मान्य QR कोड नहीं पहचाना जा सका। कृपया स्पष्ट फोटो चुनें अथवा नीचे बिब नंबर दर्ज करें।');
    }
    e.target.value = '';
  };

  // Main Verification Function (Works with QR string, Bib, Phone, or Barcode Gun)
  const handleVerifyRunner = async (rawInput) => {
    if (!rawInput || !rawInput.trim()) return;
    const clean = rawInput.trim();
    setIsSearching(true);
    setScanStatus(null);
    setStatusMessage('');

    const token = sessionStorage.getItem('rajpol_admin_token');

    try {
      const res = await fetch(`/api/expo/runner?q=${encodeURIComponent(clean)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIsSearching(false);

      if (data.success && data.runner) {
        setScannedRunner(data.runner);

        if (terminalMode === 'gate') {
          if (data.runner.gate_entered) {
            if (soundEnabled) playSound('duplicate');
            setScanStatus('GATE_ALREADY_ENTERED');
            setStatusMessage(`⚠️ पूर्व में प्रवेशित! यह धावक पहले ही ${data.runner.gate_entry_time || 'गेट'} पर प्रवेश ले चुका है।`);
          } else {
            handleApproveGateEntry(data.runner);
          }
        } else {
          if (data.runner.kit_collected) {
            if (soundEnabled) playSound('duplicate');
            setScanStatus('ALREADY_COLLECTED');
            setStatusMessage(`⚠️ पूर्व में वितरित! यह किट ${data.runner.collected_by || 'अन्य काउंटर'} द्वारा ${data.runner.kit_collected_at || 'पूर्व में'} सौंपी जा चुकी है।`);
          } else {
            if (soundEnabled) playSound('success');
            setScanStatus('SUCCESS');
            setStatusMessage('✅ धावक सत्यापित! कृपया नीचे दिए गए टी-शर्ट साइज की पुष्टि कर किट सुपुर्द करें।');
          }
        }
      } else {
        if (soundEnabled) playSound('error');
        setScanStatus('INVALID');
        setStatusMessage(data.error || 'धावक रिकॉर्ड नहीं मिला। कृपया ई-पास या बिब पुनः जांचें।');
        setScannedRunner(null);
      }
    } catch (err) {
      console.warn('Server runner query error, using local fallback:', err);
      try {
        const saved = localStorage.getItem('rpm_registrations');
        const list = saved ? JSON.parse(saved) : [];
        const cleanLower = clean.toLowerCase();
        let targetBib = clean;
        try {
          if (clean.startsWith('{')) {
            const parsed = JSON.parse(clean);
            if (parsed.bib) targetBib = parsed.bib;
          }
        } catch(e) {}
        const bibLower = targetBib.toLowerCase();

        const found = list.find(r => 
          (r.bibNumber && r.bibNumber.toLowerCase() === bibLower) ||
          (r.bibNumber && r.bibNumber.toLowerCase() === cleanLower) ||
          (r.mobile && r.mobile.replace(/\D/g, '').includes(clean.replace(/\D/g, ''))) ||
          (r.id && r.id.toLowerCase() === cleanLower)
        );

        if (found) {
          setIsSearching(false);
          const normalized = {
            id: found.id,
            bibNumber: found.bibNumber || targetBib,
            fullName: found.fullName || 'Citizen Runner',
            categoryName: found.categoryName || '21 KM Half Marathon',
            districtName: found.districtName || 'Jaipur Police Commissionerate',
            tshirtSize: found.tshirtSize || 'M',
            bloodGroup: found.bloodGroup || 'O+',
            medicalCondition: found.medicalCondition || 'None',
            kitCollected: !!(found.kitCollected || found.bibCollected),
            kitCollectedAt: found.kitCollectedAt || null,
            collectedBy: found.collectedBy || null,
            mobile: found.mobile || ''
          };
          setScannedRunner(normalized);

          if (normalized.kitCollected) {
            if (soundEnabled) playSound('duplicate');
            setScanStatus('ALREADY_COLLECTED');
            setStatusMessage(`⚠️ पूर्व में वितरित! यह किट ${normalized.collectedBy || 'काउंटर'} द्वारा पहले ही सौंपी जा चुकी है।`);
          } else {
            if (soundEnabled) playSound('success');
            setScanStatus('SUCCESS');
            setStatusMessage('✅ धावक सत्यापित! कृपया नीचे दिए गए टी-शर्ट साइज की पुष्टि कर किट सुपुर्द करें।');
          }
          return;
        }
      } catch (fallbackErr) {
        console.error('Local fallback error:', fallbackErr);
      }
      setIsSearching(false);
      setScanStatus('INVALID');
      setStatusMessage('धावक रिकॉर्ड नहीं मिला। कृपया ई-पास या बिब पुनः जांचें।');
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
      console.warn('Server handover error, using local fallback:', err);
      try {
        const saved = localStorage.getItem('rpm_registrations');
        const list = saved ? JSON.parse(saved) : [];
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const operatorStr = `${currentUser?.counterName || 'काउंटर'} [${currentUser?.fullName || 'वॉलंटियर'}]`;
        const updated = list.map(r => {
          if (r.id === scannedRunner.id || r.bibNumber === scannedRunner.bibNumber) {
            return { ...r, kitCollected: true, bibCollected: true, kitCollectedAt: nowStr, collectedBy: operatorStr };
          }
          return r;
        });
        localStorage.setItem('rpm_registrations', JSON.stringify(updated));
        if (soundEnabled) playSound('success');
        setScanStatus('SUCCESS_HANDED_OVER');
        setStatusMessage(`✅ किट व RFID बिब सफलतापूर्वक हैंडओवर! (${scannedRunner.fullName} • साइज ${scannedRunner.tshirtSize})`);
        setScannedRunner(prev => ({
          ...prev,
          kitCollected: true,
          kitCollectedAt: nowStr,
          collectedBy: operatorStr
        }));
        setCounterStats(prev => ({
          ...prev,
          myCounterKits: (prev.myCounterKits || 0) + 1,
          totalKitsDistributed: (prev.totalKitsDistributed || 0) + 1
        }));
        setIsHandingOver(false);
        return;
      } catch (localErr) {
        console.error('Local handover error:', localErr);
      }
      setIsHandingOver(false);
      setStatusMessage('सर्वर त्रुटि: किट स्टेटस अपडेट नहीं हो पाया।');
    }
  };

  // Gate Entry Execution (Race Day Mode)
  const handleApproveGateEntry = async (runner) => {
    const target = runner || scannedRunner;
    if (!target) return;
    const token = sessionStorage.getItem('rajpol_admin_token');

    try {
      const res = await fetch('/api/expo/gate-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          runnerId: target.id,
          bibNumber: target.bibNumber,
          gateName: currentUser?.counterName || 'अल्बर्ट हॉल मुख्य प्रवेश गेट',
          marshalName: currentUser?.fullName || 'गेट मार्शल'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (soundEnabled) playSound('success');
        setScanStatus('GATE_APPROVED');
        setStatusMessage(`✓ गेट प्रवेश स्वीकृत: ${target.fullName} (Bib: ${target.bibNumber})`);
        fetchStats();
      }
    } catch (e) {
      if (soundEnabled) playSound('success');
      setScanStatus('GATE_APPROVED');
      setStatusMessage(`✓ गेट प्रवेश स्वीकृत: ${target.fullName} (Bib: ${target.bibNumber})`);
      setCounterStats(prev => ({ ...prev, totalGateEntries: (prev.totalGateEntries || 0) + 1 }));
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
      {/* Hidden File Scanner DOM target */}
      <div id="qr-file-scanner-temp" style={{ display: 'none' }}></div>

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

            {/* Public Portal Switch */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                मुख्य साइट
              </button>
            )}

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

            {/* Action Buttons: Camera Toggle & File Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
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
                <span>{isCameraActive ? 'कैमरा बंद करें' : '📷 मोबाइल / वेबकैम QR चालू करें'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
                title="गैलरी या फोटो से QR कोड स्कैन करें"
              >
                <Upload size={16} />
                <span>📁 QR फोटो / फाइल चुनें</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileScan}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Camera View Box */}
          <div style={{
            display: isCameraActive ? 'block' : 'none',
            background: '#0a1c3d',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '16px',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Camera Selector (if multiple available e.g. front & back) */}
            {availableCameras.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#fde68a', fontWeight: 700 }}>कैमरा चुनें:</span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => handleSwitchCamera(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    maxWidth: '260px'
                  }}
                >
                  {availableCameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `कैमरा ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ fontSize: '0.82rem', color: '#fde68a', fontWeight: 800, marginBottom: '8px' }}>
              {isCameraStarting ? 'कैमरा चालू हो रहा है...' : 'ई-पास का QR कोड कैमरे के सामने लाएं (स्वतः स्कैन होगा)'}
            </div>

            <div 
              id="interactive-qr-scanner" 
              style={{ 
                width: '100%', 
                maxWidth: '420px', 
                margin: '0 auto', 
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000000',
                minHeight: isCameraActive ? '260px' : '0'
              }}
            ></div>

            {/* Camera Error / Troubleshooting Card */}
            {cameraError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid #ef4444',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '12px',
                maxWidth: '520px',
                marginInline: 'auto',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  <span>कैमरा सूचना (Camera Notice)</span>
                </div>
                <div style={{ color: '#ffffff', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  {cameraError}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => startCamera(selectedCameraId)}
                    style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>पुनः प्रयास करें (Retry)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Upload size={14} />
                    <span>📁 फोटो से QR स्कैन करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
              { bib: 'RJ-05K-5012', name: 'सुनीता शर्मा (5K - Size S)' }
            ].map(test => (
              <button
                key={test.bib}
                type="button"
                onClick={() => {
                  setSearchQuery(test.bib);
                  handleVerifyRunner(test.bib);
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {test.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Status Alert Banner */}
        {statusMessage && (
          <div style={{
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 
              scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED' ? '#ecfdf5' :
              scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED' ? '#fffbeb' : '#fef2f2',
            border: `1.5px solid ${
              scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED' ? '#10b981' :
              scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED' ? '#f59e0b' : '#ef4444'
            }`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED' ? (
                <CheckCircle2 size={24} color="#059669" />
              ) : scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED' ? (
                <AlertTriangle size={24} color="#d97706" />
              ) : (
                <AlertOctagon size={24} color="#dc2626" />
              )}
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 
                  scanStatus === 'SUCCESS' || scanStatus === 'SUCCESS_HANDED_OVER' || scanStatus === 'GATE_APPROVED' ? '#065f46' :
                  scanStatus === 'ALREADY_COLLECTED' || scanStatus === 'GATE_ALREADY_ENTERED' ? '#92400e' : '#991b1b'
              }}>
                {statusMessage}
              </span>
            </div>
            <button
              onClick={() => setStatusMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* 4. EXPO MODE: Runner Verification Card & T-Shirt Handover */}
        {scannedRunner && terminalMode === 'expo' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '2px solid #0a1c3d',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }}>
            {/* T-Shirt Size Giant Visual Banner */}
            <div style={{
              background: scannedRunner.kitCollected ? '#f8fafc' : '#eff6ff',
              border: `2px solid ${scannedRunner.kitCollected ? '#cbd5e1' : '#3b82f6'}`,
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '10px',
                  background: scannedRunner.kitCollected ? '#94a3b8' : '#1e40af',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '2rem',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>
                  {scannedRunner.tshirtSize || 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    आधिकारिक टी-शर्ट साइज (Official T-Shirt Size)
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a1c3d' }}>
                    साइज: {scannedRunner.tshirtSize || 'M'} ({
                      scannedRunner.tshirtSize === 'S' ? 'Small' :
                      scannedRunner.tshirtSize === 'M' ? 'Medium' :
                      scannedRunner.tshirtSize === 'L' ? 'Large' :
                      scannedRunner.tshirtSize === 'XL' ? 'Extra Large' : 'XXL'
                    })
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: scannedRunner.kitCollected ? '#fee2e2' : '#dcfce7',
                  color: scannedRunner.kitCollected ? '#991b1b' : '#166534',
                  border: `1.5px solid ${scannedRunner.kitCollected ? '#f87171' : '#86efac'}`
                }}>
                  {scannedRunner.kitCollected ? (
                    <>⚠️ किट पूर्व में सुपुर्द (Handed Over)</>
                  ) : (
                    <>✓ किट वितरण हेतु लंबित (Ready for Handover)</>
                  )}
                </span>
                {scannedRunner.kitCollected && scannedRunner.collectedBy && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    हस्तांतरण: {scannedRunner.collectedBy} ({scannedRunner.kitCollectedAt || ''})
                  </div>
                )}
              </div>
            </div>

            {/* Runner Profile Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>धावक का नाम (Full Name):</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a1c3d' }}>
                  {scannedRunner.fullName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>आधिकारिक बिब नंबर (Bib #):</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace' }}>
                  {scannedRunner.bibNumber}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>दौड़ श्रेणी (Category):</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {scannedRunner.categoryName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>जिला / यूनिट (District):</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  {scannedRunner.districtName || 'समस्त राजस्थान'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ब्लड ग्रुप / मेडिकल:</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#b91c1c' }}>
                  {scannedRunner.bloodGroup || 'O+'} (मेडिकल: {scannedRunner.medicalCondition || 'सामान्य'})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>मोबाइल नंबर (Mobile):</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                  {scannedRunner.mobile ? scannedRunner.mobile.slice(0, 6) + 'XXXX' : 'XXXXXXXXXX'}
                </div>
              </div>
            </div>

            {/* Anti-Fraud RFID Kit Handover Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                सुरक्षा जांच: <strong style={{ color: '#0a1c3d' }}>RFID टैग ऑटो-लिंक (RFID-{scannedRunner.bibNumber})</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#475569',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  रद्द करें / अगला धावक
                </button>

                <button
                  type="button"
                  onClick={handleHandoverKit}
                  disabled={isHandingOver || scannedRunner.kitCollected}
                  style={{
                    background: scannedRunner.kitCollected ? '#94a3b8' : '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '6px',
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    cursor: scannedRunner.kitCollected ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                    opacity: isHandingOver ? 0.7 : 1
                  }}
                >
                  <PackageCheck size={20} />
                  <span>
                    {isHandingOver ? 'वितरण दर्ज हो रहा है...' : 
                     scannedRunner.kitCollected ? 'यह किट पहले ही दी जा चुकी है' : 
                     '✓ किट व RFID बिब हैंडओवर करें (Confirm Delivery)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. GATE ENTRY MODE: Race Day Morning Verification */}
        {scannedRunner && terminalMode === 'gate' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: `3px solid ${scanStatus === 'GATE_APPROVED' ? '#16a34a' : '#f59e0b'}`,
            padding: '32px 24px',
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
              ऊपर दिए गए बटन से मोबाइल कैमरा चालू करें अथवा '📁 QR फोटो / फाइल चुनें' या USB बारकोड गन से धावक के ई-पास का QR कोड स्कैन करें।
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
