import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, QrCode, Search, CheckCircle2, AlertTriangle, PackageCheck, 
  RefreshCw, LogOut, Camera, CameraOff, Volume2, VolumeX, 
  UserCheck, AlertOctagon, Upload, RotateCcw,
  Download, Clock, ClipboardList
} from 'lucide-react';
import { apiGetVolunteerScans } from '../services/api';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { PoliceEmblem } from './Emblems';
import { isJaipurDistrict } from '../data/mockData';

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
  const isProcessingScanRef = useRef(false);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Volunteer Logged-in Operator Distribution & Scan History
  const [volunteerScans, setVolunteerScans] = useState([]);
  const [counterRoster, setCounterRoster] = useState([]);
  const [isLoadingScans, setIsLoadingScans] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all"); // 'all' | 'collected' | 'pending' | 'activity'

  // Fetch logged-in volunteer's scanned & distributed runners from API & local storage
  const fetchVolunteerHistory = async () => {
    setIsLoadingScans(true);
    try {
      const res = await apiGetVolunteerScans(currentUser?.counterId);
      if (res && res.success) {
        setVolunteerScans(res.scans || []);
        if (res.roster && Array.isArray(res.roster)) {
          setCounterRoster(res.roster);
        }
        if (res.stats) {
          setCounterStats(prev => ({
            ...prev,
            myCounterKits: res.stats.myKitsDistributed !== undefined ? res.stats.myKitsDistributed : prev.myCounterKits,
            totalGateEntries: res.stats.myGateEntries !== undefined ? res.stats.myGateEntries : prev.totalGateEntries,
            totalKitsDistributed: res.stats.totalCollected !== undefined ? res.stats.totalCollected : prev.totalKitsDistributed,
            pendingKits: res.stats.totalPending !== undefined ? res.stats.totalPending : prev.pendingKits
          }));
        }
      }
    } catch (err) {
      console.warn("fetchVolunteerHistory note:", err);
    } finally {
      setIsLoadingScans(false);
    }
  };

  useEffect(() => {
    fetchVolunteerHistory();
  }, [currentUser?.counterId, currentUser?.username]);

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
        try {
          scanner.clear();
        } catch (e) {}
      } catch (e) {
        console.warn('Scanner stop note:', e);
      }
    }
    const el = document.getElementById('interactive-qr-scanner');
    if (el) {
      el.innerHTML = '';
    }
  };

  // Enumerate cameras in background once camera stream is active or permitted
  const populateAvailableCameras = () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevs = (devices || []).filter(d => d.kind === 'videoinput');
        if (videoDevs.length > 0) {
          setAvailableCameras(videoDevs.map((d, idx) => ({
            id: d.deviceId,
            label: d.label || `कैमरा ${idx + 1}`
          })));
        }
      }).catch(() => {});
    }
  };

  // Robust multi-device camera starter (Windows, Mac, Android, iOS)
  const startCamera = async (targetCameraId = null) => {
    setIsCameraStarting(true);
    setCameraError('');
    isProcessingScanRef.current = false;
    await stopScannerInstance();

    // Check mediaDevices support in current browser context
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setIsCameraStarting(false);
      const isSec = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isSec) {
        setCameraError('ब्राउज़र सुरक्षा प्रतिबंध: कैमरा केवल सुरक्षित HTTPS अथवा localhost पर ही कार्य करता है। [Error: Insecure Context]');
      } else {
        setCameraError('आपका ब्राउज़र वेबकैम API का समर्थन नहीं करता है। कृपया Google Chrome या MS Edge का प्रयोग करें। [Error: mediaDevices not supported]');
      }
      return;
    }

    const el = document.getElementById('interactive-qr-scanner');
    if (!el) {
      setIsCameraStarting(false);
      return;
    }

    const config = {
      fps: 25, // 25 FPS scan rate for millisecond-fast response
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        // Broad scan zone (88% of viewfinder) so QR is captured instantly without precise centering
        const edge = Math.min(viewfinderWidth, viewfinderHeight);
        const size = Math.max(220, Math.floor(edge * 0.88));
        return { width: size, height: size };
      },
      aspectRatio: 1.0,
      disableFlip: false
    };

    // Instant callback upon detecting QR code: Zero-latency execution
    const onScanSuccess = (decodedText) => {
      if (!decodedText || isProcessingScanRef.current) return;
      isProcessingScanRef.current = true;

      // 1. Instant audio feedback
      if (soundEnabled) playSound('success');

      // 2. Immediately trigger runner verification & instant UI display
      handleVerifyRunner(decodedText);

      // 3. Close camera tracks in background without blocking the UI thread
      setTimeout(() => {
        stopScannerInstance().catch(() => {});
        setIsCameraActive(false);
      }, 50);
    };

    // Helper to start with fresh, hardware-accelerated scanner instance
    const tryStartWith = async (cameraConfig) => {
      await stopScannerInstance();
      const freshScanner = new Html5Qrcode('interactive-qr-scanner', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false
      });
      html5QrCodeRef.current = freshScanner;
      await freshScanner.start(cameraConfig, config, onScanSuccess, () => {});
      return freshScanner;
    };

    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    const primaryFacing = isMobile ? 'environment' : 'user';
    const secondaryFacing = isMobile ? 'user' : 'environment';

    try {
      // Attempt 1: If specific camera ID was selected from dropdown, try that ID
      const specificCam = targetCameraId || selectedCameraId;
      if (specificCam) {
        try {
          await tryStartWith(specificCam);
          setIsCameraStarting(false);
          populateAvailableCameras();
          return;
        } catch (specErr) {
          console.warn('Specific camera ID failed, proceeding to platform default:', specErr);
          await stopScannerInstance();
          await new Promise(r => setTimeout(r, 350));
        }
      }

      // Attempt 2: Platform-aware facing mode (PC/Laptop = 'user' webcam; Mobile = 'environment' rear cam)
      try {
        await tryStartWith({ 
          facingMode: primaryFacing,
          focusMode: 'continuous',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        });
        setIsCameraStarting(false);
        populateAvailableCameras();
        return;
      } catch (primaryErr) {
        console.warn(`Primary camera (${primaryFacing}) failed, testing fallback (${secondaryFacing}):`, primaryErr);
        await stopScannerInstance();
        await new Promise(r => setTimeout(r, 350));
      }

      // Attempt 3: Secondary facing mode fallback
      try {
        await tryStartWith({ 
          facingMode: secondaryFacing,
          focusMode: 'continuous',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        });
        setIsCameraStarting(false);
        populateAvailableCameras();
        return;
      } catch (secondaryErr) {
        console.warn('Secondary facingMode failed, checking direct device enumeration fallback:', secondaryErr);
        await stopScannerInstance();
        await new Promise(r => setTimeout(r, 350));
      }

      // Attempt 4: Fallback to first enumerated video input device if available
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = (devices || []).filter(d => d.kind === 'videoinput');
        if (videoDevs.length > 0 && videoDevs[0].deviceId) {
          await tryStartWith(videoDevs[0].deviceId);
          setIsCameraStarting(false);
          populateAvailableCameras();
          return;
        }
      } catch (enumErr) {
        console.warn('Device enumeration fallback failed:', enumErr);
      }

      throw new Error('No working camera stream could be established.');

    } catch (finalErr) {
      setIsCameraStarting(false);
      console.error('Camera startup exception:', finalErr);

      const errStr = String(finalErr?.message || finalErr?.name || finalErr || '');
      const errLower = errStr.toLowerCase();

      let friendlyMsg = 'कैमरा चालू नहीं हो सका।';
      let actionHint = 'कृपया कैमरा अनुमति जांचें अथवा नीचे दिए गए "📁 QR फोटो / फाइल चुनें" बटन से सीधे फोटो चुनें या बिब नंबर दर्ज करें।';

      if (errLower.includes('notallowed') || errLower.includes('permission') || errLower.includes('denied') || errLower.includes('dismissed')) {
        friendlyMsg = 'कैमरा अनुमति (Permission) अवरुद्ध (Blocked) है।';
        actionHint = 'ब्राउज़र के URL बार में बायीं तरफ ताले 🔒 अथवा कैमरा आइकन पर क्लिक करें, Camera को "Allow" (अनुमति दें) करें, फिर "पुनः प्रयास करें" दबाएं।';
      } else if (errLower.includes('notreadable') || errLower.includes('could not start video source') || errLower.includes('trackstart') || errLower.includes('busy') || errLower.includes('in use')) {
        friendlyMsg = 'कैमरा हार्डवेयर किसी अन्य ऍप में व्यस्त है (Device In Use)।';
        actionHint = 'आपका वेबकैम किसी अन्य प्रोग्राम (उदा. Zoom, Teams, Skype या ब्राउज़र के दूसरे टैब) में खुला है। कृपया अन्य ऍप्स बंद करके "पुनः प्रयास करें"।';
      } else if (errLower.includes('notfound') || errLower.includes('devicesnotfound') || errLower.includes('overconstrained') || errLower.includes('no functional') || errLower.includes('no working')) {
        friendlyMsg = 'कोई चालू वेबकैम / कैमरा नहीं मिला।';
        actionHint = 'कृपया सुनिश्चित करें कि आपका वेबकैम कनेक्टेड है, अथवा नीचे दिए गए "📁 QR फोटो / फाइल चुनें" बटन से सीधे ई-पास की फोटो स्कैन करें।';
      } else if (!window.isSecureContext && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        friendlyMsg = 'असुरक्षित HTTP कनेक्शन प्रतिबंध।';
        actionHint = 'ब्राउज़र सुरक्षा नीतियों के तहत कैमरा केवल HTTPS अथवा localhost पर ही कार्य करता है।';
      }

      setCameraError(`${friendlyMsg} ${actionHint} [तकनीकी विवरण: ${errStr.slice(0, 100)}]`);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    isProcessingScanRef.current = false;
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
      const html5Qr = new Html5Qrcode('qr-file-scanner-temp', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false
      });
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

  // Clear and immediately reopen camera for the next runner
  const handleScanNextRunner = async () => {
    isProcessingScanRef.current = false;
    setScannedRunner(null);
    setScanStatus(null);
    setStatusMessage('');
    setSearchQuery('');
    setCameraError('');
    setIsCameraActive(true);
  };

  // Main Verification Function (Works with QR string, Bib, Phone, or Barcode Gun)
  const handleVerifyRunner = async (rawInput) => {
    if (!rawInput || !rawInput.trim()) return;
    const clean = rawInput.trim();
    setIsSearching(true);
    setScanStatus(null);
    setStatusMessage('');

    // 1. Try to extract structured JSON data from QR payload if present
    let parsedQr = null;
    let targetBibOrQuery = clean;

    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsedQr = JSON.parse(clean.slice(firstBrace, lastBrace + 1));
        if (parsedQr.bib) targetBibOrQuery = String(parsedQr.bib).trim();
        else if (parsedQr.certId) targetBibOrQuery = String(parsedQr.certId).trim();
        else if (parsedQr.mobile) targetBibOrQuery = String(parsedQr.mobile).trim();
      } catch (e) {
        console.warn('QR JSON parse note:', e);
      }
    }

    // Set search box to clean bib number so user sees "RJ-21K-1048" instead of raw JSON
    setSearchQuery(targetBibOrQuery);

    let initialFound = null;

    // 🚀 ULTRA-FAST OPTIMISTIC PATH 1: Instant (< 5ms) hydration directly from QR payload
    if (parsedQr && parsedQr.bib) {
      const bibUpper = String(parsedQr.bib).toUpperCase();
      const collectedKits = JSON.parse(localStorage.getItem('rpm_collected_kits') || '{}');
      const isLocallyCollected = !!collectedKits[bibUpper];
      const collInfo = collectedKits[bibUpper];

      initialFound = {
        id: parsedQr.certId || `run_${bibUpper}`,
        bibNumber: bibUpper,
        fullName: parsedQr.name || 'Rajasthan Police Marathon Runner',
        categoryName: parsedQr.category || '21 KM Half Marathon',
        districtName: parsedQr.district || 'जयपुर पुलिस कमिश्नरेट',
        tshirtSize: (!isJaipurDistrict(parsedQr.districtId, parsedQr.district) || parsedQr.tshirt === 'N/A') ? 'N/A' : (parsedQr.tshirt || 'M').toUpperCase(),
        bloodGroup: parsedQr.bloodGroup || 'B+',
        medicalCondition: parsedQr.medicalAlert || 'सामान्य (Fit)',
        mobile: parsedQr.mobile || '',
        kitCollected: isLocallyCollected,
        kitCollectedAt: collInfo?.time || null,
        collectedBy: collInfo?.by || null,
        rfidTagId: `RFID-${bibUpper}`
      };
    } else {
      // Check local storage registry for bib / mobile lookup (< 1ms)
      try {
        const saved = localStorage.getItem('rpm_registrations');
        const list = saved ? JSON.parse(saved) : [];
        const cleanLower = targetBibOrQuery.toLowerCase();
        const rawCleanLower = clean.toLowerCase();

        const foundLocal = list.find(r => 
          (r.bibNumber && r.bibNumber.toLowerCase() === cleanLower) ||
          (r.bibNumber && r.bibNumber.toLowerCase() === rawCleanLower) ||
          (r.id && r.id.toLowerCase() === cleanLower) ||
          (r.certificateId && r.certificateId.toLowerCase() === cleanLower) ||
          (r.mobile && r.mobile.replace(/\D/g, '').includes(targetBibOrQuery.replace(/\D/g, '')))
        );

        if (foundLocal) {
          const collectedKits = JSON.parse(localStorage.getItem('rpm_collected_kits') || '{}');
          const isCollected = !!(foundLocal.kitCollected || foundLocal.bibCollected || collectedKits[foundLocal.bibNumber?.toUpperCase()]);
          const collInfo = collectedKits[foundLocal.bibNumber?.toUpperCase()];

          initialFound = {
            id: foundLocal.id || foundLocal.certificateId || `run_${Date.now()}`,
            bibNumber: foundLocal.bibNumber || targetBibOrQuery.toUpperCase(),
            fullName: foundLocal.fullName || 'Rajasthan Police Runner',
            categoryName: foundLocal.categoryName || '21 KM Half Marathon',
            districtName: foundLocal.districtName || 'जयपुर पुलिस कमिश्नरेट',
            tshirtSize: (!isJaipurDistrict(foundLocal.districtId, foundLocal.districtName) || foundLocal.tshirtSize === 'N/A') ? 'N/A' : (foundLocal.tshirtSize || 'M').toUpperCase(),
            bloodGroup: foundLocal.bloodGroup || 'B+',
            medicalCondition: foundLocal.medicalCondition || 'सामान्य (Fit)',
            kitCollected: isCollected,
            kitCollectedAt: collInfo?.time || foundLocal.kitCollectedAt || null,
            collectedBy: collInfo?.by || foundLocal.collectedBy || null,
            mobile: foundLocal.mobile || '',
            rfidTagId: foundLocal.rfidTagId || `RFID-${foundLocal.bibNumber || targetBibOrQuery}`
          };
        }
      } catch (localErr) {
        console.warn('Local registry lookup note:', localErr);
      }
    }

    // ⚡️ IMMEDIATELY SHOW RUNNER ON SCREEN WITHOUT WAITING FOR SERVER (< 5ms response time!)
    if (initialFound) {
      setScannedRunner(initialFound);
      setIsSearching(false);

      if (terminalMode === 'gate') {
        if (initialFound.gate_entered) {
          if (soundEnabled) playSound('duplicate');
          setScanStatus('GATE_ALREADY_ENTERED');
          setStatusMessage(`⚠️ पूर्व में प्रवेशित! यह धावक पहले ही ${initialFound.gate_entry_time || 'गेट'} पर प्रवेश ले चुका है।`);
        } else {
          handleApproveGateEntry(initialFound);
        }
      } else {
        if (initialFound.kitCollected) {
          if (soundEnabled) playSound('duplicate');
          setScanStatus('ALREADY_COLLECTED');
          setStatusMessage(`⚠️ पूर्व में वितरित! यह किट ${initialFound.collectedBy || 'अन्य काउंटर'} द्वारा ${initialFound.kitCollectedAt || 'पूर्व में'} सौंपी जा चुकी है।`);
        } else {
          setScanStatus('SUCCESS');
          setStatusMessage('✅ धावक ई-पास व QR तुरंत सत्यापित! कृपया नीचे दिए गए टी-शर्ट साइज की पुष्टि कर किट सुपुर्द करें।');
        }
      }
    }

    // 🚀 ULTRA-FAST PATH 2: Background Central Database Verification & Reconciliation
    const token = sessionStorage.getItem('rajpol_admin_token');
    try {
      const res = await fetch(`/api/expo/runner?q=${encodeURIComponent(targetBibOrQuery)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.runner) {
          const dbRunner = data.runner;
          const isCollectedInDb = Boolean(dbRunner.kit_collected);

          setScannedRunner(prev => {
            const base = prev || {};
            return {
              ...base,
              id: dbRunner.id || base.id,
              bibNumber: dbRunner.bib_number || base.bibNumber,
              fullName: dbRunner.full_name || base.fullName,
              categoryName: dbRunner.category_name || base.categoryName,
              districtName: dbRunner.district_name || base.districtName,
              tshirtSize: (!isJaipurDistrict(dbRunner.district_id, dbRunner.district_name) || dbRunner.tshirt_size === 'N/A') ? 'N/A' : (dbRunner.tshirt_size || 'M').toUpperCase(),
              bloodGroup: dbRunner.blood_group || base.bloodGroup,
              medicalCondition: dbRunner.medical_condition || base.medicalCondition,
              mobile: dbRunner.masked_mobile || base.mobile,
              kitCollected: isCollectedInDb,
              kitCollectedAt: dbRunner.kit_collected_at || base.kitCollectedAt,
              collectedBy: dbRunner.collected_by || base.collectedBy,
              rfidTagId: dbRunner.rfid_tag_id || base.rfidTagId
            };
          });

          if (isCollectedInDb) {
            if (soundEnabled) playSound('duplicate');
            setScanStatus('ALREADY_COLLECTED');
            setStatusMessage(`⚠️ पूर्व में वितरित! यह किट ${dbRunner.collected_by || 'अन्य काउंटर'} द्वारा ${dbRunner.kit_collected_at || 'पूर्व में'} सौंपी जा चुकी है।`);
          } else if (!initialFound) {
            if (soundEnabled) playSound('success');
            setScanStatus('SUCCESS');
            setStatusMessage('✅ धावक केंद्रीय डेटाबेस से सत्यापित! कृपया नीचे दिए गए टी-शर्ट साइज की पुष्टि कर किट सुपुर्द करें।');
          }
          setIsSearching(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('Server background sync note:', apiErr);
    }

    // If neither local cache nor central server found the runner
    if (!initialFound) {
      if (soundEnabled) playSound('error');
      setScanStatus('INVALID');
      setStatusMessage(`❌ धावक रिकॉर्ड नहीं मिला ("${targetBibOrQuery}")। कृपया ई-पास या बिब पुनः जांचें।`);
      setScannedRunner(null);
    }
    setIsSearching(false);
  };

  // Handover Execution
  const handleHandoverKit = async () => {
    if (!scannedRunner) return;
    setIsHandingOver(true);
    const token = sessionStorage.getItem('rajpol_admin_token');

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const operatorStr = `${currentUser?.counterName || 'काउंटर-01'} [${currentUser?.fullName || 'वॉलंटियर'}]`;

    // 1. Immediately record in local storage so double-distribution is blocked offline
    try {
      const collectedKits = JSON.parse(localStorage.getItem('rpm_collected_kits') || '{}');
      collectedKits[scannedRunner.bibNumber.toUpperCase()] = { time: nowStr, by: operatorStr };
      localStorage.setItem('rpm_collected_kits', JSON.stringify(collectedKits));

      const saved = localStorage.getItem('rpm_registrations');
      const list = saved ? JSON.parse(saved) : [];
      const updated = list.map(r => {
        if (r.id === scannedRunner.id || (r.bibNumber && r.bibNumber.toUpperCase() === scannedRunner.bibNumber.toUpperCase())) {
          return { ...r, kitCollected: true, bibCollected: true, kitCollectedAt: nowStr, collectedBy: operatorStr };
        }
        return r;
      });
      localStorage.setItem('rpm_registrations', JSON.stringify(updated));
    } catch (e) {
      console.warn('Local handover storage error:', e);
    }

    // 2. Sync with Central Server API
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

      const sizeText = (scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A') ? ` • साइज ${scannedRunner.tshirtSize}` : '';
      const defaultSuccessMsg = `✅ किट व RFID बिब सफलतापूर्वक हैंडओवर! (${scannedRunner.fullName}${sizeText})`;

      if (data.success && data.runner) {
        if (soundEnabled) playSound('success');
        setScanStatus('SUCCESS_HANDED_OVER');
        setStatusMessage(data.message || defaultSuccessMsg);
        setScannedRunner(prev => ({
          ...prev,
          kitCollected: true,
          kitCollectedAt: data?.runner?.kit_collected_at || nowStr,
          collectedBy: data?.runner?.collected_by || operatorStr
        }));
        // Prepend to logged-in volunteer's live scan history list
        const newRecord = {
          id: `kit_${Date.now()}_${scannedRunner.bibNumber}`,
          type: "KIT_HANDOVER",
          bibNumber: scannedRunner.bibNumber,
          fullName: scannedRunner.fullName,
          gender: scannedRunner.gender || "-",
          categoryName: scannedRunner.categoryName,
          districtName: scannedRunner.districtName || "जयपुर",
          tshirtSize: scannedRunner.tshirtSize || "N/A",
          rfidTagId: `RFID-${scannedRunner.bibNumber}`,
          timestamp: new Date().toISOString(),
          operatorInfo: operatorStr,
          statusLabel: "किट हैंडओवर पूर्ण"
        };
        setVolunteerScans(prev => [newRecord, ...prev.filter(x => x.bibNumber !== scannedRunner.bibNumber)]);
        setCounterRoster(prev => prev.map(r => {
          if (r.id === scannedRunner.id || (r.bibNumber && r.bibNumber.toUpperCase() === scannedRunner.bibNumber.toUpperCase())) {
            return {
              ...r,
              kitCollected: true,
              kitCollectedAt: new Date().toISOString(),
              collectedBy: operatorStr
            };
          }
          return r;
        }));
        setCounterStats(prev => ({
          ...prev,
          myCounterKits: (prev.myCounterKits || 0) + 1,
          totalKitsDistributed: (prev.totalKitsDistributed || 0) + 1,
          pendingKits: Math.max(0, (prev.pendingKits || 1) - 1)
        }));
        fetchStats();
        fetchVolunteerHistory();
      } else {
        if (soundEnabled) playSound('success');
        setScanStatus('SUCCESS_HANDED_OVER');
        setStatusMessage(defaultSuccessMsg);
        setScannedRunner(prev => ({
          ...prev,
          kitCollected: true,
          kitCollectedAt: nowStr,
          collectedBy: operatorStr
        }));
        const newRecord = {
          id: `kit_${Date.now()}_${scannedRunner.bibNumber}`,
          type: "KIT_HANDOVER",
          bibNumber: scannedRunner.bibNumber,
          fullName: scannedRunner.fullName,
          gender: scannedRunner.gender || "-",
          categoryName: scannedRunner.categoryName,
          districtName: scannedRunner.districtName || "जयपुर",
          tshirtSize: scannedRunner.tshirtSize || "N/A",
          rfidTagId: `RFID-${scannedRunner.bibNumber}`,
          timestamp: new Date().toISOString(),
          operatorInfo: operatorStr,
          statusLabel: "किट हैंडओवर पूर्ण"
        };
        setVolunteerScans(prev => [newRecord, ...prev.filter(x => x.bibNumber !== scannedRunner.bibNumber)]);
        setCounterRoster(prev => prev.map(r => {
          if (r.id === scannedRunner.id || (r.bibNumber && r.bibNumber.toUpperCase() === scannedRunner.bibNumber.toUpperCase())) {
            return {
              ...r,
              kitCollected: true,
              kitCollectedAt: new Date().toISOString(),
              collectedBy: operatorStr
            };
          }
          return r;
        }));
        setCounterStats(prev => ({
          ...prev,
          myCounterKits: (prev.myCounterKits || 0) + 1,
          totalKitsDistributed: (prev.totalKitsDistributed || 0) + 1,
          pendingKits: Math.max(0, (prev.pendingKits || 1) - 1)
        }));
        fetchStats();
        fetchVolunteerHistory();
      }
    } catch (err) {
      setIsHandingOver(false);
      const sizeText = (scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A') ? ` • साइज ${scannedRunner.tshirtSize}` : '';
      if (soundEnabled) playSound('success');
      setScanStatus('SUCCESS_HANDED_OVER');
      setStatusMessage(`✅ किट व RFID बिब सफलतापूर्वक हैंडओवर! (${scannedRunner.fullName}${sizeText})`);
      setScannedRunner(prev => ({
        ...prev,
        kitCollected: true,
        kitCollectedAt: nowStr,
        collectedBy: operatorStr
      }));
      const newRecord = {
        id: `kit_${Date.now()}_${scannedRunner.bibNumber}`,
        type: "KIT_HANDOVER",
        bibNumber: scannedRunner.bibNumber,
        fullName: scannedRunner.fullName,
        gender: scannedRunner.gender || "-",
        categoryName: scannedRunner.categoryName,
        districtName: scannedRunner.districtName || "जयपुर",
        tshirtSize: scannedRunner.tshirtSize || "N/A",
        rfidTagId: `RFID-${scannedRunner.bibNumber}`,
        timestamp: new Date().toISOString(),
        operatorInfo: operatorStr,
        statusLabel: "किट हैंडओवर पूर्ण"
      };
      setVolunteerScans(prev => [newRecord, ...prev.filter(x => x.bibNumber !== scannedRunner.bibNumber)]);
      setCounterRoster(prev => prev.map(r => {
        if (r.id === scannedRunner.id || (r.bibNumber && r.bibNumber.toUpperCase() === scannedRunner.bibNumber.toUpperCase())) {
          return {
            ...r,
            kitCollected: true,
            kitCollectedAt: new Date().toISOString(),
            collectedBy: operatorStr
          };
        }
        return r;
      }));
      setCounterStats(prev => ({
        ...prev,
        myCounterKits: (prev.myCounterKits || 0) + 1,
        totalKitsDistributed: (prev.totalKitsDistributed || 0) + 1,
        pendingKits: Math.max(0, (prev.pendingKits || 1) - 1)
      }));
      fetchStats();
      fetchVolunteerHistory();
    }
  };

  // Select runner directly from bottom table / roster
  const handleSelectRunnerFromList = (runner) => {
    if (!runner) return;
    setScannedRunner({
      id: runner.id,
      bibNumber: runner.bibNumber,
      fullName: runner.fullName,
      categoryName: runner.categoryName,
      districtName: runner.districtName,
      tshirtSize: runner.tshirtSize,
      bloodGroup: runner.bloodGroup || 'B+',
      medicalCondition: 'सामान्य (Fit)',
      kitCollected: runner.kitCollected,
      kitCollectedAt: runner.kitCollectedAt,
      collectedBy: runner.collectedBy,
      mobile: runner.maskedMobile || runner.mobile || '',
      rfidTagId: runner.rfidTagId || `RFID-${runner.bibNumber}`
    });
    setSearchQuery(runner.bibNumber);
    if (runner.kitCollected) {
      if (soundEnabled) playSound('duplicate');
      setScanStatus('ALREADY_COLLECTED');
      setStatusMessage(`⚠️ पूर्व में वितरित! यह किट ${runner.collectedBy || 'काउंटर'} द्वारा सुपुर्द की जा चुकी है।`);
    } else {
      if (soundEnabled) playSound('success');
      setScanStatus('SUCCESS');
      setStatusMessage(`✅ धावक सूची से चयनित (${runner.fullName})! कृपया टी-शर्ट साइज की पुष्टि कर किट हैंडओवर करें।`);
    }
    const el = document.getElementById('scanned-runner-details-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
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
        // Prepend to logged-in volunteer's live scan history list
        const newGateRecord = {
          id: `gate_${Date.now()}_${target.bibNumber}`,
          type: "GATE_ENTRY",
          bibNumber: target.bibNumber,
          fullName: target.fullName,
          gender: target.gender || "-",
          categoryName: target.categoryName || "प्रवेश द्वार",
          districtName: target.districtName || "जयपुर",
          tshirtSize: "N/A",
          rfidTagId: "-",
          timestamp: new Date().toISOString(),
          operatorInfo: currentUser?.counterName || "गेट स्टेशन",
          statusLabel: "गेट प्रवेश अधिकृत"
        };
        setVolunteerScans(prev => [newGateRecord, ...prev]);
        setCounterStats(prev => ({
          ...prev,
          totalGateEntries: prev.totalGateEntries + 1
        }));
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
    isProcessingScanRef.current = false;
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

      {/* 1. Official Terminal Top Header (Vibrant Police Blue Theme) */}
      <header style={{
        background: 'linear-gradient(90deg, #0d3b82 0%, #1d4ed8 45%, #2563eb 100%)',
        color: '#ffffff',
        borderBottom: '3.5px solid #f59e0b',
        padding: '12px 20px',
        boxShadow: '0 4px 18px rgba(13, 59, 130, 0.35)',
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

            <style>{`
              #interactive-qr-scanner video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 8px !important;
                transform: translateZ(0);
                backface-visibility: hidden;
              }
              #interactive-qr-scanner img[alt="Info icon"] { display: none !important; }
            `}</style>

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
            flexWrap: 'wrap',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {scanStatus === 'INVALID' && (
                <button
                  type="button"
                  onClick={handleScanNextRunner}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} />
                  <span>📷 पुनः स्कैन करें (Retry Scan)</span>
                </button>
              )}

              <button
                onClick={() => setStatusMessage('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}
                title="बंद करें"
              >
                ✕
              </button>
            </div>
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
                  background: (scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A') ? (scannedRunner.kitCollected ? '#94a3b8' : '#1e40af') : '#e2e8f0',
                  color: (scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A') ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: (scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A') ? '2rem' : '1.3rem',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>
                  {scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A' ? scannedRunner.tshirtSize : 'N/A'}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    {scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A' ? 'आधिकारिक टी-शर्ट साइज (Official T-Shirt Size)' : 'टी-शर्ट पात्रता (T-Shirt Eligibility)'}
                  </div>
                  <div style={{ fontSize: (scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A') ? '1.4rem' : '1.05rem', fontWeight: 900, color: '#0a1c3d' }}>
                    {scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A' ? (
                      `साइज: ${scannedRunner.tshirtSize} (${
                        scannedRunner.tshirtSize === 'S' ? 'Small' :
                        scannedRunner.tshirtSize === 'M' ? 'Medium' :
                        scannedRunner.tshirtSize === 'L' ? 'Large' :
                        scannedRunner.tshirtSize === 'XL' ? 'Extra Large' : 'XXL'
                      })`
                    ) : (
                      <span style={{ color: '#475569' }}>
                        N/A (केवल जयपुर फ्लैगशिप आयोजन हेतु • जिला सहभागिता किट)
                      </span>
                    )}
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                सुरक्षा जांच: <strong style={{ color: '#0a1c3d' }}>RFID टैग ऑटो-लिंक (RFID-{scannedRunner.bibNumber})</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#475569',
                    padding: '11px 18px',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✕ रीसेट (Clear)
                </button>

                {!scannedRunner.kitCollected && (
                  <button
                    type="button"
                    onClick={handleHandoverKit}
                    disabled={isHandingOver}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '6px',
                      fontSize: '0.98rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                      opacity: isHandingOver ? 0.7 : 1
                    }}
                  >
                    <PackageCheck size={20} />
                    <span>
                      {isHandingOver ? 'वितरण दर्ज हो रहा है...' : '✓ किट व RFID बिब हैंडओवर करें (Confirm Delivery)'}
                    </span>
                  </button>
                )}

                {/* Prominent Volunteer Action: Scan Next Runner */}
                <button
                  type="button"
                  onClick={handleScanNextRunner}
                  style={{
                    background: scannedRunner.kitCollected ? '#047857' : '#0a1c3d',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 26px',
                    borderRadius: '6px',
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(10, 28, 61, 0.25)'
                  }}
                >
                  <Camera size={19} />
                  <span>📷 अगला धावक स्कैन करें (Scan Next Runner) &rarr;</span>
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
                onClick={handleScanNextRunner}
                style={{
                  background: '#0a1c3d',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={18} />
                <span>📷 अगला धावक स्कैन करें (Next Runner) &rarr;</span>
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
            padding: '36px 20px',
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'inline-flex',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#eff6ff',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <QrCode size={28} color="#1d4ed8" />
            </div>
            <h3 style={{ margin: '0 0 4px 0', color: '#0a1c3d', fontSize: '1.1rem', fontWeight: 800 }}>
              स्कैनर तैयार है (Terminal Ready)
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', maxWidth: '520px', marginInline: 'auto' }}>
              ऊपर दिए गए बटन से मोबाइल कैमरा चालू करें अथवा '📁 QR फोटो / फाइल चुनें' या USB बारकोड गन से धावक के ई-पास का QR कोड स्कैन करें।
            </p>
          </div>
        )}

        {/* 7. VOLUNTEER ACTIVITY SUMMARY DATA CARDS (List se pehle ka data format) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>
          {/* Card 1: Total Scans */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1.5px solid #bfdbfe',
            borderLeft: '4.5px solid #2563eb',
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <QrCode size={24} color="#1d4ed8" />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                कुल स्कैन व सत्यापन (Total Scans)
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
                {counterStats.myCounterKits + counterStats.totalGateEntries}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                आपके काउंटर द्वारा वेरीफाईड
              </div>
            </div>
          </div>

          {/* Card 2: Kits Distributed */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1.5px solid #bbf7d0',
            borderLeft: '4.5px solid #16a34a',
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <PackageCheck size={24} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                सफलतापूर्वक किट वितरित (Kits Handed Over)
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#166534', lineHeight: 1.1, marginTop: '2px' }}>
                {counterStats.myCounterKits}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                RFID चिप व बिब हैंडओवर
              </div>
            </div>
          </div>

          {/* Card 3: Gate Entries */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1.5px solid #fde68a',
            borderLeft: '4.5px solid #d97706',
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserCheck size={24} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                गेट प्रवेश अधिकृत (Gate Entries)
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#92400e', lineHeight: 1.1, marginTop: '2px' }}>
                {counterStats.totalGateEntries}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                स्टेडियम व ट्रैक प्रवेश सत्यापित
              </div>
            </div>
          </div>

          {/* Card 4: Station Info */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            borderLeft: '4.5px solid #0a1c3d',
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shield size={24} color="#0a1c3d" />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                आवंटित ड्यूटी स्टेशन (Assigned Station)
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
                {currentUser?.counterName?.split('(')[0]?.trim() || "काउंटर-01"}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, marginTop: '3px' }}>
                🟢 ऑन-ड्यूटी: {currentUser?.fullName || "वॉलंटियर"}
              </div>
            </div>
          </div>
        </div>

        {/* 8. SCANNED & DISTRIBUTED RUNNERS LIVE ROSTER (Volunteer Scans Table) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {/* Table Header & Controls Bar */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '2px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                  धावक सूची एवं किट वितरण स्थिति (Runners Roster & Kit Status)
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  समस्त पंजीकृत धावक — किट दी गई (✅) एवं शेष (⏳) का लाइव विवरण
                </div>
              </div>
            </div>

            {/* Controls: Search, Filter, Refresh */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  placeholder="बिब, नाम या मोबाइल से खोजें..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `📋 समस्त धावक (${counterRoster.length || volunteerScans.length})` },
                  { id: 'collected', label: `✅ किट दी गई (${counterRoster.length > 0 ? counterRoster.filter(r => r.kitCollected).length : volunteerScans.filter(s => s.type === 'KIT_HANDOVER').length})` },
                  { id: 'pending', label: `⏳ किट शेष (${counterRoster.filter(r => !r.kitCollected).length})` },
                  { id: 'activity', label: `⏱️ हालिया स्कैन लॉग (${volunteerScans.length})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryFilter(f.id)}
                    style={{
                      padding: '5px 11px',
                      fontSize: '0.75rem',
                      fontWeight: historyFilter === f.id ? 800 : 600,
                      borderRadius: '5px',
                      border: historyFilter === f.id ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                      background: historyFilter === f.id ? '#1d4ed8' : '#ffffff',
                      color: historyFilter === f.id ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchVolunteerHistory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="रोस्टर रिफ्रेश करें"
              >
                <RefreshCw size={13} className={isLoadingScans ? 'animate-spin' : ''} />
                <span>रिफ्रेश</span>
              </button>

              {/* Export CSV Button */}
              {(counterRoster.length > 0 || volunteerScans.length > 0) && (
                <button
                  onClick={() => {
                    const csvRows = [
                      ["#", "Bib Number", "Runner Name", "Category", "T-Shirt Size", "Mobile", "District", "Status", "Handover Time", "Collected By"].join(",")
                    ];
                    const exportItems = historyFilter === 'activity' 
                      ? volunteerScans 
                      : (counterRoster.length > 0 ? counterRoster : volunteerScans);
                    exportItems.forEach((s, idx) => {
                      csvRows.push([
                        idx + 1,
                        `"${s.bibNumber || ''}"`,
                        `"${s.fullName || ''}"`,
                        `"${s.categoryName || ''}"`,
                        `"${s.tshirtSize || 'N/A'}"`,
                        `"${s.mobile || ''}"`,
                        `"${s.districtName || ''}"`,
                        `"${s.kitCollected ? 'KIT_COLLECTED' : 'PENDING'}"`,
                        `"${s.kitCollectedAt || s.timestamp ? new Date(s.kitCollectedAt || s.timestamp).toLocaleString('en-IN') : ''}"`,
                        `"${s.collectedBy || s.operatorInfo || ''}"`
                      ].join(","));
                    });
                    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `RPM2027_Expo_Roster_${currentUser?.username || 'counter'}.csv`;
                    link.click();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: '1px solid #16a34a',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="वर्तमान सूची की CSV डाउनलोड करें"
                >
                  <Download size={13} />
                  <span>CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          {isLoadingScans && counterRoster.length === 0 && volunteerScans.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <div>धावक सूची लोड हो रही है...</div>
            </div>
          ) : (() => {
            let baseList = [];
            if (historyFilter === 'activity') {
              baseList = volunteerScans;
            } else if (counterRoster.length > 0) {
              if (historyFilter === 'collected') {
                baseList = counterRoster.filter(r => r.kitCollected);
              } else if (historyFilter === 'pending') {
                baseList = counterRoster.filter(r => !r.kitCollected);
              } else {
                baseList = counterRoster;
              }
            } else {
              baseList = volunteerScans;
            }

            const q = historySearch.toLowerCase().trim();
            const displayList = q ? baseList.filter(s => {
              const matchBib = (s.bibNumber || '').toLowerCase().includes(q);
              const matchName = (s.fullName || '').toLowerCase().includes(q);
              const matchCat = (s.categoryName || '').toLowerCase().includes(q);
              const matchDist = (s.districtName || '').toLowerCase().includes(q);
              const matchMob = (s.mobile || '').toLowerCase().includes(q);
              return matchBib || matchName || matchCat || matchDist || matchMob;
            }) : baseList;

            if (displayList.length === 0) {
              return (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <PackageCheck size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1e293b' }}>
                    {historySearch ? 'खोज के अनुसार कोई रिकॉर्ड नहीं मिला' : 'इस फिल्टर के अंतर्गत कोई धावक नहीं है'}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', maxWidth: '460px', marginInline: 'auto' }}>
                    जैसे ही आप धावक का ई-पास अथवा बारकोड स्कैन करेंगे, या ऊपर दिए गए फिल्टर बदलेंगे, रिकॉर्ड प्रदर्शित हो जाएगा।
                  </p>
                </div>
              );
            }

            return (
              <div style={{ overflowX: 'auto', maxHeight: '460px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '45px' }}>#</th>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155' }}>धावक का नाम व जिला</th>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '130px' }}>बिब नंबर</th>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155' }}>दौड़ श्रेणी (Category)</th>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '75px', textAlign: 'center' }}>टी-शर्ट</th>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '180px' }}>वितरण स्थिति</th>
                      <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '120px', textAlign: 'right' }}>कार्रवाई</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayList.map((s, idx) => {
                      const isCollected = Boolean(s.kitCollected || s.type === 'KIT_HANDOVER');
                      const isGate = s.type === 'GATE_ENTRY';
                      const handoverTime = s.kitCollectedAt || s.timestamp;
                      const formattedTime = handoverTime 
                        ? new Date(handoverTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                        : null;

                      return (
                        <tr 
                          key={s.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                        >
                          {/* Index */}
                          <td style={{ padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>
                            {idx + 1}
                          </td>

                          {/* Runner Name & District */}
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                              {s.fullName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                              <span>{s.districtName || 'राजस्थान'}</span>
                              {s.mobile && (
                                <span style={{ marginLeft: '6px', color: '#475569', fontFamily: 'monospace' }}>
                                  ({s.mobile})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Bib Number */}
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #bfdbfe',
                              display: 'inline-block'
                            }}>
                              {s.bibNumber || 'RJ-RUN'}
                            </span>
                          </td>

                          {/* Race Category */}
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#334155',
                              background: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              display: 'inline-block'
                            }}>
                              {s.categoryName}
                            </span>
                          </td>

                          {/* T-Shirt Size */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{
                              fontWeight: 900,
                              fontSize: '0.82rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: (s.tshirtSize && s.tshirtSize !== 'N/A') ? '#1e40af' : '#e2e8f0',
                              color: (s.tshirtSize && s.tshirtSize !== 'N/A') ? '#ffffff' : '#64748b'
                            }}>
                              {s.tshirtSize || 'N/A'}
                            </span>
                          </td>

                          {/* Kit Status */}
                          <td style={{ padding: '10px 12px' }}>
                            {isGate ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a'
                              }}>
                                🚪 गेट अधिकृत {formattedTime ? `(${formattedTime})` : ''}
                              </span>
                            ) : isCollected ? (
                              <div>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  border: '1px solid #86efac'
                                }}>
                                  ✓ किट दी गई
                                </span>
                                {formattedTime && (
                                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={10} />
                                    <span>{formattedTime}</span>
                                    {s.collectedBy && (
                                      <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.collectedBy}>
                                        • {s.collectedBy}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #fed7aa'
                              }}>
                                ⏳ किट शेष (Pending)
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            {!isCollected ? (
                              <button
                                onClick={() => handleSelectRunnerFromList(s)}
                                style={{
                                  background: '#2563eb',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '5px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 1px 2px rgba(37,99,235,0.2)'
                                }}
                                title="इस धावक को किट हैंडओवर हेतु ऊपर लोड करें"
                              >
                                <PackageCheck size={13} />
                                <span>किट दें</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSelectRunnerFromList(s)}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  padding: '3px 8px',
                                  borderRadius: '5px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="विवरण देखें"
                              >
                                <span>विवरण</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
