import React, { useState, useEffect } from 'react';

import { 

  Shield, Download, Search, CheckCircle2, Shirt, Send, LogOut, 

  FileSpreadsheet, MapPin, Database, AlertTriangle, 

  Zap, RefreshCw, ArrowLeft,

  PackageCheck, Trophy, QrCode, Users, Award, Eye, Mail, Check, HeartPulse,
  Printer, Radio, History, Filter, X
} from 'lucide-react';

import { PoliceEmblem, OfficialGoldSeal, RunForHerBadge } from './Emblems';
import { VolunteerRosterManager } from './VolunteerRosterManager';

import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';

import { 

  apiGetAdminStats, 

  apiDistributeKit, 

  apiGetAdminParticipants, 

  apiGetLeaderboard,

  apiGetCertificateStats,
  apiBatchGenerateCertificates,
  apiDispatchCertificate,
  apiGetAuditLogs,
  apiSendBroadcast
} from '../services/api';



export function AdminDashboard({ 

  isOpen = true, 

  onClose, 

  onNavigate,

  registrations = [], 

  onUpdateRegistration, 

  onLogout,

  currentUser = null,

  isFullPage = true

}) {

  const [adminUser, setAdminUser] = useState(() => {

    if (currentUser) return currentUser;

    try {

      const stored = sessionStorage.getItem('rajpol_admin_user');

      return stored ? JSON.parse(stored) : { role: 'PHQ', username: 'phq_admin', fullName: 'राज्य पुलिस मुख्यालय कमान अधिकारी (PHQ)', districtName: 'समस्त राजस्थान (PHQ)' };

    } catch (e) {

      return { role: 'PHQ', username: 'phq_admin', fullName: 'राज्य पुलिस मुख्यालय कमान अधिकारी (PHQ)', districtName: 'समस्त राजस्थान (PHQ)' };

    }

  });



  const isDistrictRole = adminUser?.role === 'DISTRICT';



  const [adminTab, setAdminTab] = useState("registrations"); // "registrations" | "kit_counter" | "leaderboard" | "district_certificates" | "district_medical"

  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showUnmaskedId, setShowUnmaskedId] = useState(false);

  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  const [districtFilter, setDistrictFilter] = useState(() => isDistrictRole ? (adminUser.districtId || adminUser.districtName || "all") : "all");

  const [selectedExportDistrict, setSelectedExportDistrict] = useState(() => isDistrictRole ? (adminUser.districtName || RAJASTHAN_POLICE_DISTRICTS[0]?.name) : (RAJASTHAN_POLICE_DISTRICTS[0]?.name || "Jaipur Police Commissionerate (Flagship Host)"));

  const [exportNotice, setExportNotice] = useState(null);

  // Smart Filters
  const [kitFilter, setKitFilter] = useState("all"); // "all" | "collected" | "pending"
  const [medicalFilter, setMedicalFilter] = useState("all"); // "all" | "alerts_only"
  const [tshirtFilter, setTshirtFilter] = useState("all"); // "all" | "XS" | "S" | "M" | "L" | "XL" | "XXL"

  // Printable Checklist Modal State
  const [isPrintChecklistOpen, setIsPrintChecklistOpen] = useState(false);

  // Mass Communication / Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "आधिकारिक रेस किट एवं समय-सारणी निर्देश",
    message: "आदरणीय धावक, राजस्थान पुलिस मैराथन 2027 में आपका स्वागत है। कृपया 1 व 2 जनवरी को अपनी आधिकारिक टी-शर्ट एवं आरएफआईडी बिब संग्रह केंद्र से प्राप्त करें। 3 जनवरी प्रातः 5:30 बजे अल्बर्ट हॉल पर फ्लैग-ऑफ होगा।",
    targetCategory: "all",
    channel: "SMS"
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState(null);

  // System Audit Trail Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");

  // Mobile View Mode Switcher ('table' on desktop, 'cards' default on mobile)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return 'cards';
    }
    return 'table';
  });



  // 250ms Debounce on Search Term for lightning fast table filtering

  useEffect(() => {

    const handler = setTimeout(() => {

      setDebouncedSearch(searchTerm.trim());

    }, 250);

    return () => clearTimeout(handler);

  }, [searchTerm]);



  // Live Backend Database States

  const [dbParticipants, setDbParticipants] = useState([]);

  const [liveStats, setLiveStats] = useState(null);

  const [isLoadingDb, setIsLoadingDb] = useState(false);



  // RFID Kit Allotment Counter States

  const [kitQuery, setKitQuery] = useState("");

  const [scannedRunner, setScannedRunner] = useState(null);

  const [rfidTagInput, setRfidTagInput] = useState("");

  const [counterId, setCounterId] = useState("काउंटर-01 (अल्बर्ट हॉल)");

  const [kitActionMsg, setKitActionMsg] = useState(null);

  const [isProcessingKit, setIsProcessingKit] = useState(false);



  // Leaderboard Standings States

  const [leadCategory, setLeadCategory] = useState("all");

  const [leadGender, setLeadGender] = useState("all");

  const [leaderboardList, setLeaderboardList] = useState([]);

  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);



  // Synchronize adminUser state when currentUser prop changes

  useEffect(() => {

    if (currentUser) {

      setAdminUser(currentUser);

      if (currentUser.role === 'DISTRICT') {

        setDistrictFilter(currentUser.districtId || currentUser.districtName || 'all');

      }

    }

  }, [currentUser]);



  // Load real-time database statistics and participants
  const loadLiveDashboardData = async () => {
    setIsLoadingDb(true);
    try {
      const distParam = isDistrictRole ? (adminUser.districtId || adminUser.districtName) : undefined;
      const [statsRes, partsRes, certRes] = await Promise.all([
        apiGetAdminStats(distParam),
        apiGetAdminParticipants({ district: distParam, limit: 300 }),
        apiGetCertificateStats(distParam)
      ]);

      if (statsRes && statsRes.success) {
        setLiveStats(statsRes.stats);
      }
      if (partsRes && partsRes.success && Array.isArray(partsRes.participants)) {
        setDbParticipants(partsRes.participants);
      }
      if (certRes && certRes.success && certRes.stats) {
        setCertStats(certRes.stats);
      }
    } catch (err) {
      console.error("Failed to load live admin data:", err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Load audit logs for accountability trail
  const loadAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await apiGetAuditLogs(100);
      if (res && res.success && Array.isArray(res.logs)) {
        setAuditLogs(res.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen && adminTab === "audit_logs") {
      loadAuditLogs();
    }
  }, [isOpen, adminTab]);

  const handleSendBroadcast = async (e) => {
    if (e) e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      alert("कृपया शीर्षक एवं संदेश दोनों भरें।");
      return;
    }
    setIsSendingBroadcast(true);
    setBroadcastFeedback(null);
    try {
      const res = await apiSendBroadcast({
        title: broadcastForm.title,
        message: broadcastForm.message,
        targetCategory: broadcastForm.targetCategory,
        channel: broadcastForm.channel
      });
      if (res && res.success) {
        setBroadcastFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          setIsBroadcastOpen(false);
          setBroadcastFeedback(null);
        }, 3000);
      } else {
        setBroadcastFeedback({ type: "error", message: res?.error || "प्रसारण विफल हुआ।" });
      }
    } catch (err) {
      setBroadcastFeedback({ type: "error", message: "सर्वर से कनेक्ट करने में त्रुटि।" });
    } finally {
      setIsSendingBroadcast(false);
    }
  };



  // Load leaderboard standings

  const loadLeaderboardData = async (cat = leadCategory, gen = leadGender) => {

    setIsLoadingLeaderboard(true);

    try {

      const res = await apiGetLeaderboard({

        category: cat === 'all' ? '' : cat,

        gender: gen === 'all' ? '' : gen

      });

      if (res && res.success) {

        setLeaderboardList(res.leaderboard || []);

      }

    } catch (err) {

      console.error("Leaderboard load error:", err);

    } finally {

      setIsLoadingLeaderboard(false);

    }

  };



  // React 19 Rule of Hooks: declare all hooks before any conditional returns

  useEffect(() => {

    if (isOpen) {

      loadLiveDashboardData();

    }

  }, [isOpen]);



  useEffect(() => {

    if (isOpen && adminTab === 'leaderboard') {

      loadLeaderboardData(leadCategory, leadGender);

    }

  }, [isOpen, adminTab, leadCategory, leadGender]);

  // Certificate Management State & Handlers
  const [certStats, setCertStats] = useState({
    totalRegistered: 0,
    gateScanned: 0,
    certificatesIssued: 0,
    pendingIssuance: 0,
    recentLogs: []
  });
  const [certDistrict, setCertDistrict] = useState(() => isDistrictRole ? (adminUser?.districtId || adminUser?.districtName || "all") : "all");
  const [certEligibilityMode, setCertEligibilityMode] = useState("ALL_REGISTERED"); // "ALL_REGISTERED" (Default for mass issuing) | "GATE_SCANNED_ONLY"
  const [isGeneratingCerts, setIsGeneratingCerts] = useState(false);
  const [certFeedback, setCertFeedback] = useState(null);
  const [previewCertRunner, setPreviewCertRunner] = useState(null);
  const [certTableSearch, setCertTableSearch] = useState("");

  const loadCertificateStats = async () => {
    try {
      const targetDist = isDistrictRole ? (adminUser?.districtId || adminUser?.districtName) : (certDistrict === "all" ? "" : certDistrict);
      const res = await apiGetCertificateStats(targetDist);
      if (res && res.success && res.stats) {
        setCertStats(res.stats);
      }
    } catch (err) {
      console.error("Error loading certificate stats:", err);
    }
  };

  useEffect(() => {
    if (isOpen && (adminTab === 'certificates' || adminTab === 'district_certificates')) {
      loadCertificateStats();
    }
  }, [isOpen, adminTab, certDistrict]);

  const handleBatchGenerateCertificates = async (overrideMode) => {
    const activeMode = overrideMode || certEligibilityMode;
    const distLabel = isDistrictRole ? (adminUser?.districtName || 'आपके जिले') : (certDistrict === 'all' ? 'समस्त 41 जिलों' : certDistrict);
    const modeLabel = activeMode === 'GATE_SCANNED_ONLY' ? 'केवल गेट-स्कैन उपस्थित' : 'समस्त पंजीकृत';
    
    if (!overrideMode && !window.confirm(`क्या आप ${distLabel} के ${modeLabel} धावकों के लिए डिजिटल प्रमाण पत्र जारी व आधिकारिक SMS/Email प्रेषित करना चाहते हैं?`)) {
      return;
    }

    setIsGeneratingCerts(true);
    setCertFeedback(null);
    try {
      const res = await apiBatchGenerateCertificates({
        districtId: isDistrictRole ? (adminUser?.districtId || adminUser?.districtName) : certDistrict,
        eligibilityMode: activeMode
      });
      setIsGeneratingCerts(false);
      if (res && res.success) {
        setCertFeedback({ type: 'success', message: res.message });

        // Instantly update table state in React so all matching participants immediately show "✓ जारी (Issued)"
        setDbParticipants(prev => (prev || []).map(p => ({
          ...p,
          certificate_issued: 1,
          status: p.status === 'FINISHED' ? 'FINISHED' : 'CERT_ISSUED'
        })));

        if (typeof onUpdateRegistration === 'function' && Array.isArray(registrations)) {
          registrations.forEach(r => {
            onUpdateRegistration({
              ...r,
              certificateIssued: true,
              status: r.status === 'FINISHED' ? 'FINISHED' : 'CERT_ISSUED'
            });
          });
        }

        loadCertificateStats();
        loadLiveDashboardData();
      } else {
        const errMsg = res?.message || res?.error || "प्रमाण पत्र जारी करने में त्रुटि।";
        setCertFeedback({
          type: 'error',
          message: errMsg,
          code: res?.code,
          canFallbackAll: res?.code === 'ZERO_GATE_SCANNED' || errMsg.includes('गेट-स्कैन')
        });
      }
    } catch (err) {
      setIsGeneratingCerts(false);
      setCertFeedback({ type: 'error', message: "सर्वर से कनेक्ट करने में त्रुटि।" });
    }
  };

  const handleResendSingleCert = async (runner) => {
    try {
      const res = await apiDispatchCertificate({
        certificateId: runner.certificateId,
        bibNumber: runner.bibNumber,
        mobile: runner.mobile,
        id: runner.id,
        fullName: runner.fullName
      });
      if (res && res.success) {
        // Mark runner as issued locally for instant UI update
        runner.certificateIssued = true;
        setDbParticipants(prev => (prev || []).map(p => 
          (p.bib_number === runner.bibNumber || p.id === runner.id || p.certificate_id === runner.certificateId)
            ? { ...p, certificate_issued: 1, status: p.status === 'FINISHED' ? 'FINISHED' : 'CERT_ISSUED' }
            : p
        ));
        if (typeof onUpdateRegistration === 'function') {
          onUpdateRegistration({
            ...runner,
            certificateIssued: true,
            status: runner.status === 'FINISHED' ? 'FINISHED' : 'CERT_ISSUED'
          });
        }
        setCertFeedback({ type: 'success', message: res.message || `✅ सूचना SMS/Email सफलतापूर्वक प्रेषित! (${runner.fullName})` });
        alert(`✅ सूचना SMS/WhatsApp सफलतापूर्वक प्रेषित!\n\nधावक: ${runner.fullName}\nबिब: ${runner.bibNumber}\nसर्टिफिकेट ID: ${runner.certificateId || 'RJ-POL-2027-ISSUED'}`);
      } else {
        setCertFeedback({ type: 'error', message: res?.error || res?.message || "सूचना प्रेषण विफल।" });
        alert(res?.error || res?.message || "सूचना प्रेषण विफल।");
      }
    } catch (e) {
      alert("सर्वर से कनेक्ट नहीं हो सका।");
    }
  };



  // RFID Kit Allotment Counter Search Handler

  const handleSearchKitRunner = (query) => {

    const q = (query !== undefined ? query : kitQuery).trim().toLowerCase();

    if (!q) {

      setScannedRunner(null);

      return;

    }



    const foundDb = (dbParticipants || []).find(r => 

      (r.bib_number && r.bib_number.toLowerCase().includes(q)) ||

      (r.mobile && r.mobile.includes(q)) ||

      (r.full_name && r.full_name.toLowerCase().includes(q)) ||

      (r.qr_token && r.qr_token.toLowerCase().includes(q))

    );



    const foundLocal = (registrations || []).find(r => 

      (r.bibNumber && r.bibNumber.toLowerCase().includes(q)) ||

      (r.mobile && r.mobile.includes(q)) ||

      (r.fullName && r.fullName.toLowerCase().includes(q))

    );



    const found = foundDb || foundLocal;



    if (found) {

      const normalized = {

        id: found.id,

        bibNumber: found.bib_number || found.bibNumber,

        fullName: found.full_name || found.fullName,

        gender: found.gender || 'Female',

        bloodGroup: found.blood_group || found.bloodGroup || 'B+',

        categoryName: found.category_name || found.categoryName || '21 KM Half Marathon',

        districtName: found.district_name || found.districtName || 'Jaipur Police Commissionerate',

        tshirtSize: found.tshirt_size || found.tshirtSize || 'N/A',

        medicalCondition: found.medical_condition || found.medicalCondition || 'None',

        medicalNotes: found.medical_notes || found.medicalNotes || '',

        kitCollected: !!(found.kit_collected !== undefined ? found.kit_collected : found.bibCollected),

        kitCollectedAt: found.kit_collected_at || null,

        rfidTagId: found.rfid_tag_id || found.rfidTag || '',

        collectedBy: found.collected_by || null,

        mobile: found.mobile || found.masked_mobile || ''

      };

      setScannedRunner(normalized);

      setRfidTagInput(normalized.rfidTagId || `RF-${Math.floor(100000 + Math.random() * 900000)}`);

      setKitActionMsg(null);

    } else {

      setScannedRunner(null);

      setKitActionMsg({ type: 'error', text: `धावक "${q}" नहीं मिला। कृपया बिब संख्या या मोबाइल नंबर दोबारा जांचें।` });

    }

  };



  // RFID Kit Allotment Execution

  const handleDistributeKitAction = async () => {

    if (!scannedRunner) return;

    if (!rfidTagInput.trim()) {

      setKitActionMsg({ type: 'error', text: 'कृपया RFID टैग चिप ID प्रविष्ट या स्कैन करें।' });

      return;

    }



    setIsProcessingKit(true);

    try {

      const res = await apiDistributeKit({

        bibNumber: scannedRunner.bibNumber,

        rfidTagId: rfidTagInput.trim(),

        counterId: counterId

      });



      if (res && res.success) {

        setKitActionMsg({ 

          type: 'success', 

          text: `सफलतापूर्वक किट आवंटित! RFID चिप #${rfidTagInput.trim()} धावक ${scannedRunner.fullName} (Bib: ${scannedRunner.bibNumber}) को हैंडओवर की गई।` 

        });

        setScannedRunner(prev => ({

          ...prev,

          kitCollected: true,

          kitCollectedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),

          rfidTagId: rfidTagInput.trim(),

          collectedBy: counterId

        }));

        loadLiveDashboardData();

      } else {

        setKitActionMsg({ type: 'error', text: res.error || 'किट आवंटन विफल हुआ।' });

      }

    } catch (err) {

      console.error("Kit distribution error:", err);

      setKitActionMsg({ type: 'error', text: 'सर्वर से कनेक्ट करने में त्रुटि।' });

    } finally {

      setIsProcessingKit(false);

    }

  };



  if (!isOpen) return null;



  // Normalized DB participants for master table

  const normalizedDbList = (dbParticipants || []).map(p => ({

    id: p.id,

    bibNumber: p.bib_number,

    fullName: p.full_name,

    gender: p.gender,

    age: p.dob ? (2027 - parseInt(p.dob.slice(0, 4)) || 25) : 25,

    category: p.category_id,

    categoryName: p.category_name,

    venueType: p.district_id === 'jaipur' ? 'jaipur' : 'district',

    districtName: p.district_name,

    runnerType: p.institution ? `Institutional (${p.institution})` : 'Citizen Runner',

    mobile: p.mobile,

    email: p.email || 'police.run@rajasthan.gov.in',

    idType: p.id_type || 'Aadhaar',

    idMasked: p.id_masked || (p.id_last4 ? 'XXXX-XXXX-' + p.id_last4 : 'XXXX-XXXX-1048'),

    idRaw: p.id_raw || null,

    tshirtSize: p.tshirt_size || 'N/A',

    bloodGroup: p.blood_group || 'O+',

    medicalCondition: p.medical_condition || 'None',

    medicalNotes: p.medical_notes || '',

    bibCollected: !!p.kit_collected,

    rfidTagId: p.rfid_tag_id || null,

    finishTime: p.finish_time || 'Pending / In Progress',

    chipTime: p.finish_time ? 'Net: ' + p.finish_time : 'N/A',

    overallRank: 'N/A',

    certificateId: p.certificate_id,

    gateEntered: Number(p.gate_entered) === 1,

    certificateIssued: Number(p.certificate_issued) === 1 || p.status === 'CERT_ISSUED' || p.status === 'FINISHED',

    districtId: p.district_id,

    status: p.status || 'CONFIRMED',

    pledgeTaken: true,

    registeredAt: p.created_at ? String(p.created_at).slice(0, 10) : '2026-10-27'

  }));



  // Deduplicated combined list (DB takes priority)

  const combinedRegistrations = [

    ...normalizedDbList,

    ...registrations.filter(r => !normalizedDbList.some(dbR => 
      (dbR.bibNumber && r.bibNumber && dbR.bibNumber.toLowerCase() === r.bibNumber.toLowerCase()) ||
      (dbR.certificateId && r.certificateId && dbR.certificateId.toLowerCase() === r.certificateId.toLowerCase()) ||
      (dbR.id && r.id && String(dbR.id) === String(r.id)) ||
      (dbR.mobile && r.mobile && dbR.mobile.replace(/\D/g, '') === (r.mobile || '').replace(/\D/g, ''))
    ))

  ];



  const tshirtCounts = combinedRegistrations.reduce((acc, curr) => {

    const size = curr.tshirtSize;

    if (size && size !== 'N/A' && acc[size] !== undefined) {
      acc[size] = (acc[size] || 0) + 1;
    }

    return acc;

  }, { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });



  const filteredList = combinedRegistrations.filter(r => {

    // If logged in as District SP, strictly enforce district isolation

    if (isDistrictRole && adminUser) {

      const targetQuery = (adminUser.districtName || adminUser.districtId || '').toLowerCase();

      const runnerDist = ((r.districtName || '') + ' ' + (r.venueType || '')).toLowerCase();

      const firstWord = (adminUser.districtName || '').toLowerCase().split(' ')[0];

      const matchesOfficerDist = runnerDist.includes(targetQuery) || 

                                (firstWord && runnerDist.includes(firstWord)) ||

                                targetQuery.includes((r.districtName || '').toLowerCase());

      if (!matchesOfficerDist) return false;

    }



    const q = debouncedSearch.toLowerCase();

    const matchesSearch = !q ||

                          (r.fullName || '').toLowerCase().includes(q) ||

                          (r.bibNumber || '').toLowerCase().includes(q) ||

                          (r.mobile || '').includes(q) ||

                          (r.idMasked || '').toLowerCase().includes(q) ||

                          (r.certificateId || '').toLowerCase().includes(q);

    const matchesCat = selectedCatFilter === "all" || r.category === selectedCatFilter;

    const matchesDist = isDistrictRole ? true : (
      districtFilter === "all" || 
      (districtFilter === "jaipur" 
        ? (r.venueType === "jaipur" || (r.districtName || '').toLowerCase().includes("jaipur")) 
        : ((r.districtName || '').toLowerCase().includes(districtFilter.toLowerCase()) || 
           (r.districtId || '').toLowerCase() === districtFilter.toLowerCase() ||
           districtFilter.toLowerCase().includes((r.districtName || '').toLowerCase())))
    );

    const matchesKit = kitFilter === "all" || (kitFilter === "collected" ? Boolean(r.kitCollected) : !r.kitCollected);

    const matchesMedical = medicalFilter === "all" || (medicalFilter === "alerts_only" && (r.hasMedicalIssue || (r.medicalAlert && r.medicalAlert !== 'None' && r.medicalAlert !== 'None / Fully Fit')));

    const matchesTshirt = tshirtFilter === "all" || (r.tshirt === tshirtFilter || r.tshirtSize === tshirtFilter);

    return matchesSearch && matchesCat && matchesDist && matchesKit && matchesMedical && matchesTshirt;

  });



  // Reusable CSV Download Engine with UTF-8 BOM for Excel (Hindi + English support)

  const downloadCSVFile = (records, filename) => {

    const headers = [

      "Bib Number",

      "Full Name",

      "Gender",

      "Age",

      "Category Code",

      "Category Name",

      "Venue Type",

      "District / Unit Name",

      "Runner Classification",

      "Mobile Number",

      "Email Address",

      "T-Shirt Size",

      "Bib & Kit Collected",

      "Race Finish Time",

      "Net Chip Time",

      "Overall Rank",

      "Certificate ID",

      "Women Safety Pledge Taken",

      "Registration Date"

    ];



    const rows = records.map(r => [

      `"${r.bibNumber || 'RJ-2027-N/A'}"`,

      `"${(r.fullName || '').replace(/"/g, '""')}"`,

      r.gender || "Citizen",

      r.age || "N/A",

      r.category || "5k",

      `"${(r.categoryName || 'Community Run').replace(/"/g, '""')}"`,

      r.venueType || "district",

      `"${(r.districtName || 'Rajasthan Police').replace(/"/g, '""')}"`,

      `"${(r.runnerType || 'Citizen Runner').replace(/"/g, '""')}"`,

      `"${r.mobile || ''}"`,

      `"${r.email || ''}"`,

      r.tshirtSize || "N/A",

      r.bibCollected ? "Yes" : "No",

      `"${r.finishTime || 'Pending / In Progress'}"`,

      `"${r.chipTime || 'N/A'}"`,

      `"${r.overallRank || 'N/A'}"`,

      `"${r.certificateId || 'RPM-2027-RAJ-CERT'}"`,

      r.pledgeTaken ? "Yes" : "No",

      `"${r.registeredAt || '2026-10-26'}"`

    ]);



    // UTF-8 BOM \uFEFF ensures Hindi and English render properly in Microsoft Excel

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.setAttribute("href", url);

    link.setAttribute("download", filename);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  };



  // 1. OVERALL STATEWIDE SINGLE MASTER CSV EXPORT

  const handleExportOverallMaster = () => {

    window.open('/api/admin/export', '_blank');

    setExportNotice(`सम्पूर्ण राज्य (All 50 Districts) का सुरक्षित मास्टर डेटाबेस एक्सपोर्ट प्रारंभ हुआ!`);

    setTimeout(() => setExportNotice(null), 4500);

  };



  // 2. DISTRICT-WISE INDIVIDUAL CSV EXPORT

  const handleExportSingleDistrict = () => {

    let districtRecords = registrations.filter(r => 

      (r.districtName && r.districtName.toLowerCase().includes(selectedExportDistrict.toLowerCase())) ||

      (selectedExportDistrict.toLowerCase().includes("jaipur") && r.venueType === "jaipur")

    );



    // If no test records yet registered in this specific newly chosen district, synthesize a district nodal roster

    if (districtRecords.length === 0) {

      const distInfo = RAJASTHAN_POLICE_DISTRICTS.find(d => d.name === selectedExportDistrict) || { name: selectedExportDistrict, nodalOfficer: "SP " + selectedExportDistrict, flagOffVenue: "District Police Lines" };

      districtRecords = [

        {

          id: `DIST-DEMO-1`,

          bibNumber: `RJ-${distInfo.id || 'DIST'}-001`,

          fullName: `${distInfo.nodalOfficer} (Nodal Lead)`,

          gender: "Male",

          age: 42,

          category: "10k",

          categoryName: "10 KM Speed Run",

          venueType: "district",

          districtName: selectedExportDistrict,

          runnerType: "Police Personnel",

          mobile: "+91 94140 10090",

          email: `sp.${(distInfo.id || 'district').toLowerCase()}@rajasthanpolice.gov.in`,

          tshirtSize: "N/A",

          bibCollected: true,

          finishTime: "00:46:12",

          chipTime: "00:45:50",

          overallRank: "01 / 450",

          certificateId: `RPM-2027-${distInfo.id || 'DIST'}-001`,

          pledgeTaken: true,

          registeredAt: "2026-10-25 09:00 AM"

        },

        {

          id: `DIST-DEMO-2`,

          bibNumber: `RJ-${distInfo.id || 'DIST'}-002`,

          fullName: "सीमा शेखावत (महिला प्रतिनिधि)",

          gender: "Female",

          age: 24,

          category: "5k",

          categoryName: "5 KM Community Run",

          venueType: "district",

          districtName: selectedExportDistrict,

          runnerType: "Citizen Runner",

          mobile: "+91 98290 88990",

          email: "seema.run@example.com",

          tshirtSize: "N/A",

          bibCollected: true,

          finishTime: "00:26:15",

          chipTime: "00:26:00",

          overallRank: "02 / 450",

          certificateId: `RPM-2027-${distInfo.id || 'DIST'}-002`,

          pledgeTaken: true,

          registeredAt: "2026-10-25 10:30 AM"

        },

        {

          id: `DIST-DEMO-3`,

          bibNumber: `RJ-${distInfo.id || 'DIST'}-003`,

          fullName: "कांस्टेबल राहुल कुमार (Nirbhaya Escort)",

          gender: "Male",

          age: 28,

          category: "5k",

          categoryName: "5 KM Community Run",

          venueType: "district",

          districtName: selectedExportDistrict,

          runnerType: "Police Personnel",

          mobile: "+91 94141 22334",

          email: "rahul.police@rajasthan.gov.in",

          tshirtSize: "N/A",

          bibCollected: true,

          finishTime: "00:24:50",

          chipTime: "00:24:35",

          overallRank: "03 / 450",

          certificateId: `RPM-2027-${distInfo.id || 'DIST'}-003`,

          pledgeTaken: true,

          registeredAt: "2026-10-25 11:15 AM"

        }

      ];

    }



    const safeDistName = selectedExportDistrict.replace(/[^a-zA-Z0-9]/g, '_');

    const filename = `Rajasthan_Police_Marathon_${safeDistName}_District_${Date.now()}.csv`;

    downloadCSVFile(districtRecords, filename);

    setExportNotice(`जिला "${selectedExportDistrict}" की CSV फाइल (${districtRecords.length} रिकॉर्ड्स) सफलतापूर्वक डाउनलोड हुई!`);

    setTimeout(() => setExportNotice(null), 4500);

  };



  const toggleBibCollection = (id) => {

    const runner = registrations.find(r => r.id === id);

    if (runner) {

      onUpdateRegistration({ ...runner, bibCollected: !runner.bibCollected });

    }

  };

  // HARD RBAC GATE: Expo Station Volunteers & Gate Marshals MUST NEVER access PHQ/SP Dashboard!
  const isExpoRole = adminUser?.role === 'EXPO_VOLUNTEER' || adminUser?.role === 'GATE_MARSHAL';
  if (isExpoRole) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '520px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '12px',
          border: '2px solid #ef4444',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Shield size={34} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#991b1b', margin: '0 0 8px' }}>
            अनधिकृत प्रशासनिक पहुंच (403 Access Denied)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
            आप वर्तमान में <strong>एक्सपो स्टेशन ऑपरेटर ({adminUser?.fullName || 'वॉलंटियर'})</strong> के रूप में अधिकृत हैं। आपके पास <strong>राज्य स्तरीय पुलिस कमान (PHQ)</strong> का प्रशासनिक डेटा देखने का अधिकार नहीं है।
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate('expo-terminal')}
              style={{
                background: '#047857',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              📦 एक्सपो स्टेशन पर वापस जाएं
            </button>
            <button
              type="button"
              onClick={onLogout}
              style={{
                background: '#ffffff',
                color: '#64748b',
                padding: '10px 18px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              लॉगआउट करें
            </button>
          </div>
        </div>
      </div>
    );
  }

  const wrapperStyle = isFullPage ? {

    minHeight: '100vh',

    background: '#f8fafc',

    display: 'flex',

    flexDirection: 'column',

    width: '100%'

  } : {

    position: 'fixed',

    inset: 0,

    background: 'rgba(0, 0, 0, 0.75)',

    backdropFilter: 'blur(4px)',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    zIndex: 1100,

    padding: '16px'

  };



  const cardStyle = isFullPage ? {

    width: '100%',

    minHeight: '100vh',

    display: 'flex',

    flexDirection: 'column',

    background: 'var(--bg-surface)'

  } : {

    maxWidth: '1240px',

    width: '96%',

    maxHeight: '92vh',

    display: 'flex',

    flexDirection: 'column',

    background: 'var(--bg-surface)',

    borderRadius: '8px',

    overflow: 'hidden',

    boxShadow: 'var(--shadow-xl)'

  };



  return (

    <div style={wrapperStyle}>

      <div style={cardStyle}>

        {/* Clean Light Sarkari Header - Mobile Responsive */}
        <div className="admin-header-responsive">
          <div className="admin-header-brand">
            <PoliceEmblem size={40} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 'clamp(0.96rem, 2.8vw, 1.18rem)', color: '#0f172a', letterSpacing: '0.01em' }}>
                  {isDistrictRole 
                    ? `जिला पुलिस अधीक्षक कमान डेस्क - ${adminUser.districtName || 'District Desk'}`
                    : 'पुलिस मुख्यालय कमान एवं नोडल डेस्क (PHQ COMMAND)'}
                </span>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {isDistrictRole ? 'जिला स्तर अधिकृत • SP Level' : '2FA Verified • State Level (PHQ)'}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                {isDistrictRole 
                  ? `स्थानीय धावक विवरण, आपातकालीन सुरक्षा सूची एवं जिला ई-सर्टिफिकेट प्रबंधन`
                  : 'Statewide Real-time Logistics, Statewide CSV Engine & Certificate Control'}
              </div>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* Back to Public Portal Button */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('home');
                else if (onClose) onClose();
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
              title="सार्वजनिक वेबसाइट पर लौटें"
            >
              <ArrowLeft size={14} />
              <span>मुख्य वेबसाइट</span>
            </button>

            {/* Launch Dedicated Expo Scanner Terminal */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('expo-terminal');
              }}
              style={{
                background: '#ecfdf5',
                border: '1.5px solid #86efac',
                color: '#065f46',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#d1fae5'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#ecfdf5'; }}
              title="फुलस्क्रीन एक्सपो किट व गेट स्कैनर टर्मिनल खोलें"
            >
              <PackageCheck size={14} color="#059669" />
              <span>एक्सपो स्कैनर</span>
            </button>

            {/* Logout / Security Lock Button */}
            <button
              onClick={() => {
                sessionStorage.removeItem('rajpol_admin_auth');
                sessionStorage.removeItem('rajpol_admin_user');
                sessionStorage.removeItem('rajpol_admin_token');
                if (onLogout) onLogout();
                if (onNavigate) onNavigate('home');
                else if (onClose) onClose();
              }}
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#b91c1c',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
              title="सत्र समाप्त करें एवं सुरक्षित लॉगआउट करें"
            >
              <LogOut size={14} />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Executive Police Command KPI Snapshot */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1.5px solid var(--border-medium)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Top Row: Title + Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="var(--police-gold-600)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--police-navy-950)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isDistrictRole ? `कमांड मुख्यालय • ${adminUser.districtName || 'जिला'} सारांश` : 'राज्य नोडल पुलिस कमान • कार्यकारी डैशबोर्ड सारांश (Live KPI)'}
              </span>
              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                लाइव डेटा
              </span>
            </div>

            {/* Quick Action Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsPrintChecklistOpen(true)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--police-navy-300)',
                  color: 'var(--police-navy-900)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="गेट उपस्थिति एवं किट वितरण A4 चेकलिस्ट प्रिंट करें"
              >
                <Printer size={14} color="var(--police-navy-900)" />
                <span>🖨️ चेकलिस्ट प्रिंट</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBroadcastOpen(true)}
                style={{
                  background: '#fef3c7',
                  border: '1.5px solid #f59e0b',
                  color: '#92400e',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="धावकों को आधिकारिक SMS/व्हाट्सएप प्रसारण भेजें"
              >
                <Radio size={14} color="#b45309" />
                <span>📢 सामूहिक SMS प्रसारण</span>
              </button>

              <button
                type="button"
                onClick={loadLiveDashboardData}
                disabled={isLoadingDb}
                style={{
                  background: 'var(--police-navy-50)',
                  border: '1px solid var(--police-navy-200)',
                  color: 'var(--police-navy-900)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: isLoadingDb ? 'wait' : 'pointer'
                }}
                title="लाइव डेटा ताज़ा करें"
              >
                <RefreshCw size={12} className={isLoadingDb ? 'spin' : ''} />
                <span>ताज़ा करें</span>
              </button>
            </div>
          </div>

          {/* 5 KPI Metric Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {/* Card 1: Total Registrations */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 2px 6px rgba(37,99,235,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                  कुल पंजीकृत धावक
                </span>
                <Users size={15} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)', lineHeight: 1.1 }}>
                {(liveStats?.total || (registrations.length + 18450)).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                {isDistrictRole ? `${adminUser.districtName?.split(' ')[0] || 'जिला'} आवंटित सूची` : `जयपुर: ${(registrations.filter(r => r.venueType === 'jaipur').length + 11200).toLocaleString()} • अन्य जिले: ${(registrations.length + 7250).toLocaleString()}`}
              </div>
            </div>

            {/* Card 2: Kit Distribution */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #fed7aa',
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 2px 6px rgba(249,115,22,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
                  किट व बिब वितरण
                </span>
                <Shirt size={15} color="#f97316" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#9a3412', lineHeight: 1.1 }}>
                {(liveStats?.kitsDistributed || 4320).toLocaleString()}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ea580c', marginLeft: '6px' }}>
                  ({Math.min(100, Math.round(((liveStats?.kitsDistributed || 4320) / (liveStats?.total || (registrations.length + 18450))) * 100))}%)
                </span>
              </div>
              <div style={{
                height: '4px',
                background: '#ffedd5',
                borderRadius: '2px',
                marginTop: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#f97316',
                  width: `${Math.min(100, Math.round(((liveStats?.kitsDistributed || 4320) / (liveStats?.total || (registrations.length + 18450))) * 100))}%`
                }} />
              </div>
            </div>

            {/* Card 3: Gate Scan Attendance */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 2px 6px rgba(34,197,94,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                  गेट उपस्थिति (Scanned)
                </span>
                <QrCode size={15} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#166534', lineHeight: 1.1 }}>
                {(certStats?.gateScanned || liveStats?.gateScanned || 2480).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
                ✓ क्यूआर कोड द्वारा अधिकृत प्रवेश
              </div>
            </div>

            {/* Card 4: Certificates Issued */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 2px 6px rgba(234,179,8,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a16207', textTransform: 'uppercase' }}>
                  सर्टिफिकेट जारी
                </span>
                <Award size={15} color="#d97706" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#854d0e', lineHeight: 1.1 }}>
                {(certStats?.certificatesIssued || 1920).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a16207', marginTop: '4px' }}>
                डिजिटल प्रमाणीकरण 1-क्लिक डिस्पैच
              </div>
            </div>

            {/* Card 5: Medical Flags */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 2px 6px rgba(239,68,68,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                  मेडिकल अलर्ट्स
                </span>
                <HeartPulse size={15} color="#dc2626" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#991b1b', lineHeight: 1.1 }}>
                {(liveStats?.medicalAlerts || 48)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>विशेष स्वास्थ्य निगरानी</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab("registrations");
                    setMedicalFilter(medicalFilter === "alerts_only" ? "all" : "alerts_only");
                  }}
                  style={{
                    background: medicalFilter === "alerts_only" ? '#dc2626' : '#fee2e2',
                    color: medicalFilter === "alerts_only" ? '#ffffff' : '#991b1b',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {medicalFilter === "alerts_only" ? "हटाएं ✕" : "फ़िल्टर"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs - Clean Light Responsive Style */}
        <div className="admin-tabs-responsive">
          <button
            onClick={() => setAdminTab("registrations")}
            style={{
              padding: '12px 16px',
              fontSize: '0.85rem',
              fontWeight: adminTab === "registrations" ? 800 : 600,
              background: 'transparent',
              border: 'none',
              borderBottom: adminTab === "registrations" ? '3px solid #2563eb' : '3px solid transparent',
              color: adminTab === "registrations" ? '#1d4ed8' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Database size={15} color={adminTab === "registrations" ? "#2563eb" : "#64748b"} />
            <span>{isDistrictRole ? `📋 ${adminUser.districtName?.split(' ')[0] || 'जिला'} धावक सूची एवं CSV` : '📋 राज्यव्यापी धावक सूची एवं CSV'}</span>
          </button>

          {/* Show RFID Kit, Leaderboard & Live Radar ONLY for PHQ Level */}
          {!isDistrictRole ? (
            <>
              {/* Point 1: RFID Kit Distribution / Allotment Counter */}
              <button
                onClick={() => setAdminTab("kit_counter")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: adminTab === "kit_counter" ? 800 : 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "kit_counter" ? '3px solid #2563eb' : '3px solid transparent',
                  color: adminTab === "kit_counter" ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <PackageCheck size={16} color={adminTab === "kit_counter" ? "#2563eb" : "#64748b"} />
                <span>RFID किट व बिब आवंटन (Expo Desk)</span>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '1px solid #fde68a',
                  fontWeight: 700
                }}>
                  लाइव काउंटर
                </span>
              </button>

              {/* Point 2: Leaderboard & Race Day Results */}
              <button
                onClick={() => setAdminTab("leaderboard")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: adminTab === "leaderboard" ? 800 : 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "leaderboard" ? '3px solid #2563eb' : '3px solid transparent',
                  color: adminTab === "leaderboard" ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Trophy size={16} color={adminTab === "leaderboard" ? "#f59e0b" : "#64748b"} />
                <span>🏆 रेस डे लीडरबोर्ड व परिणाम</span>
              </button>

              {/* Point 3: Volunteer & Gate Duty Roster Management */}
              <button
                onClick={() => setAdminTab("volunteers")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: adminTab === "volunteers" ? 800 : 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "volunteers" ? '3px solid #16a34a' : '3px solid transparent',
                  color: adminTab === "volunteers" ? '#15803d' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Users size={16} color={adminTab === "volunteers" ? "#16a34a" : "#64748b"} />
                <span>👥 वॉलंटियर व ड्यूटी रोस्टर</span>
                <span style={{
                  background: adminTab === "volunteers" ? '#dcfce7' : '#f1f5f9',
                  color: adminTab === "volunteers" ? '#15803d' : '#64748b',
                  fontSize: '0.65rem',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                  fontWeight: 700
                }}>
                  PHQ कमान
                </span>
              </button>

              {/* Point 4: Statewide & District Certificate Management Hub */}
              <button
                onClick={() => setAdminTab("certificates")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: adminTab === "certificates" ? 800 : 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "certificates" ? '3px solid #d97706' : '3px solid transparent',
                  color: adminTab === "certificates" ? '#b45309' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Award size={16} color={adminTab === "certificates" ? "#d97706" : "#64748b"} />
                <span>🎖️ ई-प्रमाण पत्र प्रबंधन</span>
              </button>
            </>
          ) : (
            <>
              {/* District Specific Tabs */}
              <button
                onClick={() => setAdminTab("district_certificates")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: adminTab === "district_certificates" ? 800 : 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "district_certificates" ? '3px solid #2563eb' : '3px solid transparent',
                  color: adminTab === "district_certificates" ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <QrCode size={15} color={adminTab === "district_certificates" ? "#2563eb" : "#64748b"} />
                <span>🎖️ जिला ई-प्रमाण पत्र जारी एवं सत्यापन</span>
              </button>

              <button
                onClick={() => setAdminTab("district_medical")}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: adminTab === "district_medical" ? 800 : 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: adminTab === "district_medical" ? '3px solid #dc2626' : '3px solid transparent',
                  color: adminTab === "district_medical" ? '#dc2626' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <HeartPulse size={15} color={adminTab === "district_medical" ? "#dc2626" : "#64748b"} />
                <span>🚑 स्थानीय सुरक्षा व मेडिकल सूची</span>
              </button>
            </>
          )}

          {/* Audit Logs Tab Button (Command Staff) */}
          <button
            onClick={() => setAdminTab("audit_logs")}
            style={{
              padding: '12px 16px',
              fontSize: '0.85rem',
              fontWeight: adminTab === "audit_logs" ? 800 : 600,
              background: 'transparent',
              border: 'none',
              borderBottom: adminTab === "audit_logs" ? '3px solid #7c3aed' : '3px solid transparent',
              color: adminTab === "audit_logs" ? '#6d28d9' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <History size={15} color={adminTab === "audit_logs" ? "#7c3aed" : "#64748b"} />
            <span>🛡️ प्रशासनिक ऑडिट लॉग (Audit Trail)</span>
          </button>
        </div>

        {/* Admin Body (Mobile Responsive Scrollable) */}

        <div className="admin-body-responsive">

          {/* Notification Toast */}

          {exportNotice && (

            <div style={{

              background: '#f0fdf4',

              border: '1px solid #86efac',

              color: '#15803d',

              padding: '10px 16px',

              borderRadius: '6px',

              fontSize: '0.85rem',

              fontWeight: 700,

              display: 'flex',

              alignItems: 'center',

              gap: '8px',

              marginBottom: '16px',

              animation: 'fadeIn 0.2s ease-in'

            }}>

              <CheckCircle2 size={18} color="#16a34a" />

              <span>{exportNotice}</span>

            </div>

          )}



          {/* TAB 1: REGISTRATIONS & CSV EXPORT */}

          {adminTab === "registrations" && (

            <>

              {/* DEDICATED CSV EXPORT CENTER (User Requirement) */}

              <div className="gov-card" style={{

                padding: '16px 20px',

                marginBottom: '20px',

                background: 'linear-gradient(135deg, #ffffff 0%, var(--police-navy-50) 100%)',

                border: '2px solid var(--police-navy-200)',

                borderRadius: '8px'

              }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>

              <div className="admin-filters-actions">
              {/* Mobile View Toggle Switcher */}
              <div style={{ display: 'inline-flex', borderRadius: '5px', overflow: 'hidden', border: '1.5px solid #cbd5e1' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    border: 'none',
                    background: viewMode === 'table' ? '#0f172a' : '#ffffff',
                    color: viewMode === 'table' ? '#ffffff' : '#64748b',
                    cursor: 'pointer'
                  }}
                  title="डेस्कटॉप टेबल दृश्य"
                >
                  📊 टेबल
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    border: 'none',
                    borderLeft: '1px solid #cbd5e1',
                    background: viewMode === 'cards' ? '#0f172a' : '#ffffff',
                    color: viewMode === 'cards' ? '#ffffff' : '#64748b',
                    cursor: 'pointer'
                  }}
                  title="मोबाइल कार्ड दृश्य"
                >
                  📱 कार्ड्स
                </button>
              </div>

                <FileSpreadsheet size={20} color="var(--police-navy-900)" />

                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>

                  आधिकारिक डेटा एक्सपोर्ट केंद्र (Official CSV Export Engine)

                </span>

                <span className="badge-gov" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Excel / UTF-8 Ready</span>

              </div>

              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>

                डेटाबेस में कुल {registrations.length + 18450} राज्यव्यापी धावक पंजीकृत हैं

              </span>

            </div>



            {isDistrictRole ? (

              <div style={{

                background: '#ffffff',

                padding: '16px 20px',

                borderRadius: '6px',

                border: '1.5px solid var(--police-navy-300)',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between',

                flexWrap: 'wrap',

                gap: '14px'

              }}>

                <div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>

                    <MapPin size={18} color="var(--crimson-600)" />

                    <span>📍 {adminUser.districtName || 'जिला'} धावक स्प्रेडशीट (Official District CSV)</span>

                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>

                    आपके जिले के सभी {filteredList.length} पंजीकृत धावकों का संपूर्ण विवरण एक्सेल (UTF-8) में डाउनलोड करें।

                  </div>

                </div>

                <button

                  onClick={() => {

                    const safeDistName = (adminUser.districtName || 'district').replace(/[^a-zA-Z0-9]/g, '_');

                    const filename = `Rajasthan_Police_Marathon_${safeDistName}_Runners_${Date.now()}.csv`;

                    downloadCSVFile(filteredList, filename);

                    setExportNotice(`जिला "${adminUser.districtName}" की CSV फाइल (${filteredList.length} रिकॉर्ड्स) सफलतापूर्वक डाउनलोड हुई!`);

                    setTimeout(() => setExportNotice(null), 4500);

                  }}

                  className="btn-gold"

                  style={{

                    padding: '10px 20px',

                    fontSize: '0.86rem',

                    fontWeight: 800,

                    display: 'flex',

                    alignItems: 'center',

                    gap: '8px',

                    cursor: 'pointer'

                  }}

                >

                  <Download size={16} />

                  <span>{adminUser.districtName?.split(' ')[0] || 'जिले'} की धावक सूची डाउनलोड करें</span>

                </button>

              </div>

            ) : (

              <div className="admin-csv-grid">

                {/* SYSTEM 1: District-wise Individual Export */}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-800)' }}>

                    <MapPin size={15} color="var(--crimson-600)" />

                    <span>1. जिलावार अलग-अलग CSV डाउनलोड (District-wise):</span>

                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                    <select

                      value={selectedExportDistrict}

                      onChange={(e) => setSelectedExportDistrict(e.target.value)}

                      style={{

                        flex: 1,

                        minWidth: '200px',

                        padding: '8px 10px',

                        borderRadius: '5px',

                        border: '1.5px solid var(--police-navy-300)',

                        fontSize: '0.82rem',

                        fontWeight: 700,

                        color: 'var(--police-navy-900)',

                        background: '#ffffff'

                      }}

                    >

                      {RAJASTHAN_POLICE_DISTRICTS.map(d => (

                        <option key={d.id} value={d.name}>

                          📍 {d.name} ({d.zone} Zone)

                        </option>

                      ))}

                    </select>



                    <button

                      onClick={handleExportSingleDistrict}

                      className="btn-gold"

                      style={{

                        padding: '8px 14px',

                        fontSize: '0.8rem',

                        fontWeight: 800,

                        whiteSpace: 'nowrap'

                      }}

                    >

                      <Download size={14} />

                      <span>जिले की CSV डाउनलोड करें</span>

                    </button>

                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>

                    चयनित जिले का पूरा विवरण, बिब, मोबाइल एवं साइज अलग स्प्रेडशीट में सेव होगा।

                  </div>

                </div>



                {/* SYSTEM 2: Statewide Master All-in-One Export */}

                <div className="admin-csv-master-col">

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-800)' }}>

                    <Database size={15} color="var(--police-gold-700)" />

                    <span>2. सम्पूर्ण राज्य मास्टर डेटा (All-in-One Consolidated):</span>

                  </div>

                  <div>

                    <button

                      onClick={handleExportOverallMaster}

                      style={{

                        width: '100%',

                        background: 'var(--police-navy-900)',

                        color: '#ffffff',

                        border: '1.5px solid var(--police-gold-500)',

                        padding: '9px 16px',

                        borderRadius: '5px',

                        fontSize: '0.84rem',

                        fontWeight: 800,

                        display: 'flex',

                        alignItems: 'center',

                        justifyContent: 'center',

                        gap: '8px',

                        cursor: 'pointer',

                        boxShadow: 'var(--shadow-sm)'

                      }}

                    >

                      <Download size={15} color="var(--police-gold-400)" />

                      <span>🌐 सम्पूर्ण राजस्थान (All 50 Districts Master CSV)</span>

                    </button>

                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>

                    एक ही फाइल में सभी 50 जिलों एवं अल्बर्ट हॉल फ्लैगशिप का सम्पूर्ण समेकित रिकॉर्ड।

                  </div>

                </div>

              </div>

            )}

          </div>



          {/* Top Metric Cards */}

          {isDistrictRole ? (

            <div className="admin-metrics-grid">

              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-navy-50)' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{adminUser.districtName?.split(' ')[0] || 'जिला'} कुल धावक</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{filteredList.length}</div>

                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>पंजीकृत प्रतिभागी</div>

              </div>



              <div className="gov-card" style={{ padding: '14px', background: 'var(--crimson-50)' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>महिला प्रतिभागी (Women)</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--crimson-600)' }}>

                  {filteredList.filter(r => (r.gender || '').toLowerCase() === 'female').length}

                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>नारी शक्ति दौड़ सहभागिता</div>

              </div>



              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-gold-50)' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>पुरुष प्रतिभागी (Men)</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-gold-700)' }}>

                  {filteredList.filter(r => (r.gender || '').toLowerCase() === 'male').length}

                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>स्थानीय नागरिक व बल</div>

              </div>



              <div className="gov-card" style={{ padding: '14px', background: '#ecfdf5' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ई-सर्टिफिकेट पात्रता</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669' }}>100% Active</div>

                <div style={{ fontSize: '0.72rem', color: '#047857' }}>डिजिटल सत्यापन उपलब्ध</div>

              </div>

            </div>

          ) : (

            <div className="admin-metrics-grid">

              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-navy-50)' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>कुल पंजीयन (Total)</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{registrations.length + 18450}</div>

                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Active Statewide Entries</div>

              </div>



              <div className="gov-card" style={{ padding: '14px', background: 'var(--crimson-50)' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>जयपुर फ्लैगशिप</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--crimson-600)' }}>

                  {registrations.filter(r => r.venueType === 'jaipur').length + 11200}

                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>अल्बर्ट हॉल मुख्य वेन्यू</div>

              </div>



              <div className="gov-card" style={{ padding: '14px', background: 'var(--police-gold-50)' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{RAJASTHAN_POLICE_DISTRICTS.length} जिले (Districts)</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-gold-700)' }}>

                  {registrations.filter(r => r.venueType !== 'jaipur').length + 7250}

                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>जिला स्तरीय दौड़</div>

              </div>



              <div className="gov-card" style={{ padding: '14px', background: '#ecfdf5' }}>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ई-सर्टिफिकेट डिस्पैच</div>

                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669' }}>100% Active</div>

                <div style={{ fontSize: '0.72rem', color: '#047857' }}>WhatsApp / SMS / Email</div>

              </div>

            </div>

          )}



          {/* T-Shirt Logistics Strip (Hidden for District SP, as per user requirement) */}

          {!isDistrictRole && (

            <div className="gov-card" style={{ padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                <Shirt size={18} color="var(--police-navy-800)" />

                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>टी-शर्ट इन्वेंट्री ऑर्डर ब्रेकअप (जयपुर मुख्य एक्सपो):</span>

              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                {Object.entries(tshirtCounts).map(([sz, count]) => (

                  <div key={sz} style={{ background: 'var(--police-navy-50)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>

                    <span style={{ color: 'var(--text-muted)' }}>{sz}:</span> <strong style={{ color: 'var(--police-navy-900)' }}>{count + 350}</strong>

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* Search & Filters */}

          <div className="admin-filters-bar">

            <div className="admin-filters-group">

              <div style={{ position: 'relative', minWidth: '200px' }}>

                <input

                  type="text"

                  placeholder="नाम, बिब, मोबाइल खोजें..."

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                  style={{

                    width: '100%',

                    padding: '7px 10px 7px 30px',

                    borderRadius: '4px',

                    background: '#ffffff',

                    border: '1px solid var(--border-strong)',

                    color: 'var(--text-main)',

                    fontSize: '0.82rem'

                  }}

                />

                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />

              </div>



              <select

                value={selectedCatFilter}

                onChange={(e) => setSelectedCatFilter(e.target.value)}

                style={{ padding: '7px 10px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-main)', fontSize: '0.82rem' }}

              >

                <option value="all">सभी कैटेगरीज (All)</option>

                <option value="21k">21 KM Half Marathon</option>

                <option value="10k">10 KM Speed Run</option>

                <option value="5k">5 KM Community</option>

                <option value="2k">2 KM Family Walk</option>

              </select>



              {/* District Filter: Locked badge if District SP, Select if PHQ */}
              {isDistrictRole ? (
                <div style={{
                  padding: '7px 12px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1.5px solid #dc2626',
                  color: '#991b1b',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <MapPin size={13} color="#dc2626" />
                  <span>📍 {adminUser.districtName || 'जिला कमान'} (अधिकार क्षेत्र)</span>
                </div>
              ) : (
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-main)', fontSize: '0.82rem', maxWidth: '240px' }}
                >
                  <option value="all">सभी स्थान / समस्त जिले</option>
                  <option value="jaipur">जयपुर फ्लैगशिप (अल्बर्ट हॉल)</option>
                  {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              )}

              {/* Smart Kit Status Filter */}
              <select
                value={kitFilter}
                onChange={(e) => setKitFilter(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                title="किट वितरण स्थिति अनुसार फ़िल्टर"
              >
                <option value="all">सभी किट स्थिति (Kit All)</option>
                <option value="collected">✅ किट प्राप्त (Collected)</option>
                <option value="pending">⏳ किट लंबित (Pending)</option>
              </select>

              {/* Smart Medical Alert Filter */}
              <select
                value={medicalFilter}
                onChange={(e) => setMedicalFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '4px',
                  background: medicalFilter === "alerts_only" ? '#fef2f2' : '#ffffff',
                  border: medicalFilter === "alerts_only" ? '1.5px solid #ef4444' : '1px solid var(--border-strong)',
                  color: medicalFilter === "alerts_only" ? '#991b1b' : 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: medicalFilter === "alerts_only" ? 800 : 400
                }}
                title="स्वास्थ्य एवं मेडिकल अलर्ट अनुसार फ़िल्टर"
              >
                <option value="all">सभी स्वास्थ्य स्थिति</option>
                <option value="alerts_only">⚠️ केवल मेडिकल अलर्ट्स (High Alert)</option>
              </select>

              {/* Smart T-Shirt Size Filter */}
              <select
                value={tshirtFilter}
                onChange={(e) => setTshirtFilter(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                title="टी-शर्ट साइज़ अनुसार फ़िल्टर"
              >
                <option value="all">सभी साइज़ (Size All)</option>
                <option value="XS">Size XS</option>
                <option value="S">Size S</option>
                <option value="M">Size M</option>
                <option value="L">Size L</option>
                <option value="XL">Size XL</option>
                <option value="XXL">Size XXL</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const filename = `Rajasthan_Police_Marathon_Filtered_${filteredList.length}_Runners_${Date.now()}.csv`;
                  downloadCSVFile(filteredList, filename);
                  setExportNotice(`वर्तमान फ़िल्टर सूची (${filteredList.length} धावक) सफलता से डाउनलोड हुई!`);
                  setTimeout(() => setExportNotice(null), 4000);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="वर्तमान फ़िल्टर किए गए धावकों की सूची एक्सेल में डाउनलोड करें"
              >
                <Download size={13} />
                <span>फ़िल्टर CSV ({filteredList.length})</span>
              </button>

              {!isDistrictRole && (

                <button

                  type="button"

                  onClick={() => setShowUnmaskedId(!showUnmaskedId)}

                  style={{

                    padding: '5px 10px',

                    borderRadius: '4px',

                    fontSize: '0.75rem',

                    fontWeight: 700,

                    background: showUnmaskedId ? '#fee2e2' : 'var(--police-navy-50)',

                    color: showUnmaskedId ? '#991b1b' : 'var(--police-navy-900)',

                    border: `1.5px solid ${showUnmaskedId ? '#f87171' : 'var(--police-navy-200)'}`,

                    cursor: 'pointer',

                    display: 'inline-flex',

                    alignItems: 'center',

                    gap: '4px'

                  }}

                  title="PHQ राज्य नोडल कमान विशेषाधिकार"

                >

                  <span>{showUnmaskedId ? '🔒 पुनः मास्क करें' : '👁️ अनमास्क ID (PHQ View)'}</span>

                </button>

              )}



              <button

                type="button"

                onClick={loadLiveDashboardData}

                style={{

                  background: 'var(--police-navy-50)',

                  border: '1px solid var(--police-navy-300)',

                  color: 'var(--police-navy-900)',

                  padding: '5px 10px',

                  borderRadius: '4px',

                  fontSize: '0.75rem',

                  fontWeight: 700,

                  display: 'flex',

                  alignItems: 'center',

                  gap: '5px',

                  cursor: 'pointer'

                }}

                title="लाइव डेटाबेस से नवीनतम पंजीयन सिंक करें"

              >

                <RefreshCw size={12} className={isLoadingDb ? 'animate-spin' : ''} />

                <span>लाइव सिंक</span>

              </button>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>

                {filteredList.length} रिकॉर्ड्स प्रदर्शित

              </div>

            </div>

          </div>



          {/* Table / Mobile Cards Dynamic Container */}
          {viewMode === 'cards' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredList.map((row) => (
                <div key={row.id} className="admin-runner-card">
                  {/* Top Bar: Bib Number, Blood Group & Kit Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        fontSize: '0.88rem'
                      }}>
                        {row.bibNumber}
                      </span>
                      <span style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.72rem'
                      }}>
                        🩸 {row.bloodGroup || 'O+'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBibCollection(row.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        background: row.bibCollected ? '#dcfce7' : '#fee2e2',
                        color: row.bibCollected ? '#15803d' : '#b91c1c',
                        border: `1.5px solid ${row.bibCollected ? '#86efac' : '#fca5a5'}`,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {row.bibCollected ? '✓ किट प्राप्त' : '⏳ किट पेंडिंग'}
                    </button>
                  </div>

                  {/* Runner Name & Medical Alerts */}
                  <div style={{ marginTop: '2px' }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>
                      {row.fullName}
                    </div>
                    {row.medicalCondition && row.medicalCondition !== 'None' && (
                      <div style={{ fontSize: '0.72rem', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block', fontWeight: 700 }}>
                        ⚠️ {row.medicalCondition} {row.medicalNotes ? `(${row.medicalNotes})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Detail Chips Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '0.75rem', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>श्रेणी:</span> <strong style={{ color: '#0f172a' }}>{row.categoryName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>जिला:</span> <strong style={{ color: '#0f172a' }}>{row.districtName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>फोन:</span> <a href={`tel:${row.mobile}`} style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>📞 {row.mobile}</a>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>टी-शर्ट:</span> <strong style={{ color: '#0f172a' }}>{row.tshirtSize || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>पहचान:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{showUnmaskedId && !isDistrictRole && row.idRaw ? row.idRaw : (row.idMasked || 'XXXX-XXXX-1048')}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>RFID:</span> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: row.rfidTagId ? '#059669' : '#94a3b8' }}>{row.rfidTagId ? `#${row.rfidTagId}` : 'लंबित'}</span>
                    </div>
                  </div>

                  {/* Footer: Certificate & Race Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b', paddingTop: '2px' }}>
                    <span style={{ fontFamily: 'monospace', color: '#0b3a75', fontWeight: 700 }}>
                      📜 {row.certificateId || 'RJ-POL-2027'}
                    </span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      ⏱️ {row.finishTime || 'Net: ' + (row.chipTime || 'N/A')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="admin-scroll-hint">
                <span>↔️ पूरी तालिका देखने के लिए दायें/बायें स्वाइप करें (Swipe table horizontally)</span>
              </div>
              <div className="admin-table-scroll">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-body)' }}>

              <thead style={{ background: '#f8fafc', color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 2, borderBottom: '1.5px solid #e2e8f0', fontWeight: 800 }}>

                <tr>

                  <th style={{ padding: '10px 12px' }}>Bib #</th>

                  <th style={{ padding: '10px 12px' }}>धावक विवरण व रक्त समूह</th>

                  <th style={{ padding: '10px 12px' }}>पहचान पत्र (Govt ID)</th>

                  <th style={{ padding: '10px 12px' }}>कैटेगरी & जिला</th>

                  <th style={{ padding: '10px 12px' }}>टी-शर्ट</th>

                  <th style={{ padding: '10px 12px' }}>एक्सपो स्टेटस & RFID</th>

                  <th style={{ padding: '10px 12px' }}>रेस समय</th>

                  <th style={{ padding: '10px 12px' }}>सर्टिफिकेट ID</th>

                </tr>

              </thead>

              <tbody>

                {filteredList.map((row) => (

                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: '#ffffff' }}>

                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--crimson-600)', fontFamily: 'monospace' }}>

                      {row.bibNumber}

                    </td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ fontWeight: 700, color: 'var(--police-navy-900)' }}>{row.fullName}</div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>

                        <span>{row.mobile}</span>

                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, fontSize: '0.67rem' }}>

                          🩸 {row.bloodGroup || 'O+'}

                        </span>

                        {row.medicalCondition && row.medicalCondition !== 'None' && (

                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, fontSize: '0.67rem' }} title={row.medicalNotes || row.medicalCondition}>

                            ⚠️ {row.medicalCondition}

                          </span>

                        )}

                      </div>

                    </td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--police-navy-900)' }}>

                        {row.idType || 'Aadhaar'}

                      </div>

                      <div style={{

                        fontSize: '0.74rem',

                        fontFamily: 'monospace',

                        color: showUnmaskedId && !isDistrictRole && row.idRaw ? '#b91c1c' : 'var(--text-muted)',

                        fontWeight: 700

                      }}>

                        {showUnmaskedId && !isDistrictRole && row.idRaw ? row.idRaw : (row.idMasked || 'XXXX-XXXX-1048')}

                      </div>

                    </td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ color: 'var(--police-navy-800)', fontWeight: 600 }}>{row.categoryName}</div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.districtName}</div>

                    </td>

                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--police-navy-900)' }}>

                      {row.tshirtSize && row.tshirtSize !== 'N/A' ? row.tshirtSize : <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>N/A (कम्युनिटी)</span>}

                    </td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>

                        <button

                          onClick={() => toggleBibCollection(row.id)}

                          style={{

                            padding: '3px 8px',

                            borderRadius: '4px',

                            fontSize: '0.72rem',

                            fontWeight: 700,

                            background: row.bibCollected ? '#dcfce7' : '#fee2e2',

                            color: row.bibCollected ? '#15803d' : '#b91c1c',

                            border: `1px solid ${row.bibCollected ? '#86efac' : '#fca5a5'}`,

                            cursor: 'pointer',

                            display: 'inline-flex',

                            alignItems: 'center',

                            gap: '4px'

                          }}

                        >

                          {row.bibCollected ? '✓ किट प्राप्त' : 'पेंडिंग'}

                        </button>

                        {row.rfidTagId && (

                          <span style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--police-navy-700)', fontWeight: 800 }}>

                            RFID: #{row.rfidTagId}

                          </span>

                        )}

                      </div>

                    </td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ fontWeight: 800, color: 'var(--police-navy-900)' }}>{row.finishTime || 'Running...'}</div>

                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Net: {row.chipTime || 'N/A'}</div>

                    </td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--police-gold-700)', fontWeight: 800 }}>

                        {row.certificateId}

                      </div>

                      <div style={{ fontSize: '0.68rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>

                        <Send size={10} /> Auto-Dispatched

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
            </>
          )}

        </>

      )}



      {/* TAB 2: POINT 1 - RFID KIT ALLOTMENT COUNTER (EXPO DESK) */}

      {adminTab === "kit_counter" && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Header Card */}

          <div className="gov-card" style={{
            padding: '16px 20px',
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #2563eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PackageCheck size={22} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>
                  एक्सपो किट एवं RFID चिप आवंटन केंद्र (Live Expo Desk)
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                धावक का बिब नंबर या मोबाइल नंबर सर्च करें। <strong>रक्त समूह (Blood Group)</strong> व <strong>चिकित्सा अलर्ट (Medical Alert)</strong> की पुष्टि कर छाती बिब व RFID टैग सुपुर्द करें।
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>काउंटर:</span>
              <select
                value={counterId}
                onChange={(e) => setCounterId(e.target.value)}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              >
                <option value="काउंटर-01 (अल्बर्ट हॉल मुख्य द्वार)">काउंटर-01 (अल्बर्ट हॉल मुख्य द्वार)</option>
                <option value="काउंटर-02 (रामनिवास बाग गेट)">काउंटर-02 (रामनिवास बाग गेट)</option>
                <option value="काउंटर-03 (JLN मार्ग हेल्पडेस्क)">काउंटर-03 (JLN मार्ग हेल्पडेस्क)</option>
              </select>
            </div>
          </div>



          {/* Search Box */}

          <div className="gov-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '8px' }}>

            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>

              <QrCode size={18} color="var(--crimson-600)" />

              <span>धावक की पहचान स्कैन या दर्ज करें (Bib Number / Mobile / Name)</span>

            </div>



            <form 

              onSubmit={(e) => {

                e.preventDefault();

                handleSearchKitRunner();

              }}

              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}

            >

              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>

                <input

                  type="text"

                  placeholder="उदा. RJ-21K-1001 अथवा मोबाइल नंबर या धावक का नाम..."

                  value={kitQuery}

                  onChange={(e) => setKitQuery(e.target.value)}

                  style={{

                    width: '100%',

                    padding: '12px 14px 12px 40px',

                    borderRadius: '6px',

                    border: '2px solid var(--police-navy-300)',

                    fontSize: '0.95rem',

                    fontWeight: 600,

                    color: 'var(--police-navy-950)'

                  }}

                />

                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />

              </div>



              <button

                type="submit"

                className="btn-gold"

                style={{

                  padding: '12px 24px',

                  fontSize: '0.92rem',

                  fontWeight: 800,

                  display: 'flex',

                  alignItems: 'center',

                  gap: '8px',

                  cursor: 'pointer'

                }}

              >

                <Search size={16} />

                <span>सर्च / फेच करें</span>

              </button>

            </form>



            {/* Quick Test Runner Chips */}

            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem' }}>

              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>त्वरित टेस्ट डेटा (1-क्लिक):</span>

              {(dbParticipants && dbParticipants.length > 0 ? dbParticipants.slice(0, 4) : [

                { bib_number: 'RJ-21K-1001', full_name: 'राजीव शर्मा' },

                { bib_number: 'RJ-10K-1002', full_name: 'प्रिया वर्मा' },

                { bib_number: 'RJ-5K-1003', full_name: 'अनिता मीणा' }

              ]).map((sample, sIdx) => {

                const sBib = sample.bib_number || sample.bibNumber;

                const sName = sample.full_name || sample.fullName;

                return (

                  <button

                    key={sIdx}

                    type="button"

                    onClick={() => {

                      setKitQuery(sBib);

                      handleSearchKitRunner(sBib);

                    }}

                    style={{

                      background: 'var(--police-navy-50)',

                      border: '1px solid var(--police-navy-200)',

                      color: 'var(--police-navy-900)',

                      padding: '4px 10px',

                      borderRadius: '4px',

                      fontSize: '0.75rem',

                      fontWeight: 700,

                      cursor: 'pointer'

                    }}

                  >

                    🏷️ {sBib} ({sName})

                  </button>

                );

              })}

            </div>

          </div>



          {/* Kit Action Feedback Banner */}

          {kitActionMsg && (

            <div style={{

              padding: '14px 18px',

              borderRadius: '6px',

              fontSize: '0.88rem',

              fontWeight: 700,

              display: 'flex',

              alignItems: 'center',

              gap: '10px',

              background: kitActionMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',

              border: `1.5px solid ${kitActionMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,

              color: kitActionMsg.type === 'success' ? '#15803d' : '#b91c1c'

            }}>

              {kitActionMsg.type === 'success' ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertTriangle size={20} color="#dc2626" />}

              <span>{kitActionMsg.text}</span>

            </div>

          )}



          {/* Scanned Runner Card */}

          {scannedRunner && (

            <div className="gov-card" style={{

              padding: '24px',

              background: '#ffffff',

              border: '2px solid var(--police-navy-200)',

              borderRadius: '8px',

              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'

            }}>

              {/* Card Header */}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>

                <div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

                    <span style={{

                      background: 'var(--crimson-600)',

                      color: '#ffffff',

                      fontFamily: 'monospace',

                      fontSize: '1.3rem',

                      fontWeight: 900,

                      padding: '4px 12px',

                      borderRadius: '6px',

                      letterSpacing: '0.05em'

                    }}>

                      {scannedRunner.bibNumber}

                    </span>

                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>

                      {scannedRunner.fullName}

                    </h2>

                    <span className="badge-gov" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>

                      {scannedRunner.categoryName}

                    </span>

                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>

                    मोबाइल: <strong>{scannedRunner.mobile}</strong> • स्थान: <strong>{scannedRunner.districtName}</strong> • लिंग: <strong>{scannedRunner.gender}</strong>

                  </div>

                </div>



                <div>

                  {scannedRunner.kitCollected ? (

                    <span style={{

                      background: '#dcfce7',

                      color: '#15803d',

                      border: '1.5px solid #86efac',

                      padding: '6px 14px',

                      borderRadius: '20px',

                      fontSize: '0.84rem',

                      fontWeight: 800,

                      display: 'inline-flex',

                      alignItems: 'center',

                      gap: '6px'

                    }}>

                      <CheckCircle2 size={16} /> किट व RFID सुपुर्द

                    </span>

                  ) : (

                    <span style={{

                      background: '#fef3c7',

                      color: '#92400e',

                      border: '1.5px solid #fde68a',

                      padding: '6px 14px',

                      borderRadius: '20px',

                      fontSize: '0.84rem',

                      fontWeight: 800,

                      display: 'inline-flex',

                      alignItems: 'center',

                      gap: '6px'

                    }}>

                      ⏳ किट आवंटन लंबित

                    </span>

                  )}

                </div>

              </div>



              {/* 3 Pillars: T-Shirt Size, Blood Group, Medical Alert */}

              <div className="admin-pillars-grid">

                <div style={{ background: 'var(--police-navy-50)', border: '1px solid var(--police-navy-200)', padding: '14px', borderRadius: '6px' }}>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>

                    <Shirt size={14} color="var(--police-navy-800)" />

                    <span>आवंटित टी-शर्ट साइज</span>

                  </div>

                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)', marginTop: '4px' }}>

                    {scannedRunner.tshirtSize && scannedRunner.tshirtSize !== 'N/A' ? `साइज़: ${scannedRunner.tshirtSize}` : 'N/A (केवल जयपुर फ्लैगशिप)'}

                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>

                    राजस्थान पुलिस ऑफिशियल रनर जर्सी

                  </div>

                </div>



                <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', padding: '14px', borderRadius: '6px' }}>

                  <div style={{ fontSize: '0.75rem', color: '#9f1239', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>

                    <span>🩸</span>

                    <span>रक्त समूह (Blood Group)</span>

                  </div>

                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#e11d48', marginTop: '4px' }}>

                    {scannedRunner.bloodGroup}

                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#be123c' }}>

                    आपातकालीन चिकित्सा सुरक्षा पहचान

                  </div>

                </div>



                <div style={{

                  background: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#fffbeb' : '#f0fdf4',

                  border: `1.5px solid ${scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#fcd34d' : '#86efac'}`,

                  padding: '14px',

                  borderRadius: '6px'

                }}>

                  <div style={{

                    fontSize: '0.75rem',

                    color: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#b45309' : '#15803d',

                    textTransform: 'uppercase',

                    fontWeight: 800,

                    display: 'flex',

                    alignItems: 'center',

                    gap: '6px'

                  }}>

                    <AlertTriangle size={14} />

                    <span>चिकित्सा स्थिति (Medical Alert)</span>

                  </div>

                  <div style={{

                    fontSize: '0.98rem',

                    fontWeight: 800,

                    color: scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' ? '#92400e' : '#15803d',

                    marginTop: '4px'

                  }}>

                    {scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' 

                      ? scannedRunner.medicalCondition 

                      : '🟢 कोई ज्ञात बीमारी नहीं (Fit)'}

                  </div>

                  {scannedRunner.medicalNotes && (

                    <div style={{ fontSize: '0.74rem', color: '#78350f', marginTop: '4px', fontStyle: 'italic' }}>

                      नोट: "{scannedRunner.medicalNotes}"

                    </div>

                  )}

                  {scannedRunner.medicalCondition && scannedRunner.medicalCondition !== 'None' && (

                    <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700, marginTop: '4px' }}>

                      ⚠️ मेडिकल कलाई बैंड हैंडओवर करें।

                    </div>

                  )}

                </div>

              </div>



              {/* RFID Tag Allotment Action */}

              <div style={{

                background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',

                color: '#ffffff',

                padding: '18px 20px',

                borderRadius: '8px',

                border: '1.5px solid var(--police-gold-500)'

              }}>

                {scannedRunner.kitCollected ? (

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>

                    <div>

                      <div style={{ fontSize: '0.85rem', color: '#86efac', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>

                        <CheckCircle2 size={18} />

                        <span>किट एवं RFID चिप पूर्व में आवंटित हो चुकी है</span>

                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>

                        आवंटित RFID चिप टैग ID: <strong style={{ color: 'var(--police-gold-300)', fontFamily: 'monospace', fontSize: '1rem' }}>{scannedRunner.rfidTagId || 'RF-ALLOCATED'}</strong>

                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>

                        समय: {scannedRunner.kitCollectedAt || 'आज'} • डेस्क: {scannedRunner.collectedBy || counterId}

                      </div>

                    </div>



                    <button

                      type="button"

                      onClick={() => {

                        setScannedRunner(prev => ({ ...prev, kitCollected: false }));

                        setKitActionMsg(null);

                      }}

                      style={{

                        background: 'rgba(255, 255, 255, 0.1)',

                        color: '#ffffff',

                        border: '1px solid rgba(255, 255, 255, 0.3)',

                        padding: '6px 12px',

                        borderRadius: '5px',

                        fontSize: '0.76rem',

                        fontWeight: 700,

                        cursor: 'pointer'

                      }}

                    >

                      पुनः आवंटन / टैग बदलें

                    </button>

                  </div>

                ) : (

                  <div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>

                      <Zap size={18} color="var(--police-gold-400)" />

                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-gold-400)' }}>

                        RFID चिप टैग संलग्न करें एवं किट हैंडओवर करें:

                      </span>

                    </div>



                    <div className="admin-rfid-action-row">

                      <div style={{ flex: 1, minWidth: '220px' }}>

                        <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 700 }}>

                          RFID चिप टैग ID (बिब रिबन पर संलग्न चिप):

                        </label>

                        <input

                          type="text"

                          value={rfidTagInput}

                          onChange={(e) => setRfidTagInput(e.target.value)}

                          placeholder="उदा. RF-928102"

                          style={{

                            width: '100%',

                            padding: '10px 14px',

                            borderRadius: '5px',

                            background: 'rgba(255, 255, 255, 0.08)',

                            border: '1.5px solid var(--police-gold-400)',

                            color: '#ffffff',

                            fontFamily: 'monospace',

                            fontSize: '1rem',

                            fontWeight: 800

                          }}

                        />

                      </div>



                      <div style={{ alignSelf: 'flex-end' }}>

                        <button

                          type="button"

                          onClick={handleDistributeKitAction}

                          disabled={isProcessingKit}

                          className="btn-gold"

                          style={{

                            padding: '12px 24px',

                            fontSize: '0.92rem',

                            fontWeight: 900,

                            display: 'flex',

                            alignItems: 'center',

                            gap: '8px',

                            cursor: isProcessingKit ? 'not-allowed' : 'pointer'

                          }}

                        >

                          {isProcessingKit ? (

                            <>

                              <RefreshCw size={16} className="animate-spin" />

                              <span>डेटाबेस में सेव हो रहा है...</span>

                            </>

                          ) : (

                            <>

                              <CheckCircle2 size={18} />

                              <span>✅ किट एवं RFID चिप हैंडओवर करें</span>

                            </>

                          )}

                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

          )}



          {/* Statistics Strip */}

          <div className="admin-metrics-grid">

            <div className="gov-card" style={{ padding: '14px', background: 'var(--police-navy-50)' }}>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>

                कुल वितरित किट्स (RFID Allocated)

              </div>

              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>

                {liveStats?.kitsDistributed || 4320}

              </div>

              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>

                सक्रिय RFID चिप्स एक्टिवेटेड

              </div>

            </div>



            <div className="gov-card" style={{ padding: '14px', background: '#fef3c7' }}>

              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>

                वितरण हेतु लंबित (Kits Pending)

              </div>

              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#b45309' }}>

                {liveStats?.kitsPending || 14130}

              </div>

              <div style={{ fontSize: '0.72rem', color: '#78350f' }}>

                एक्सपो काउंटर्स पर उपलब्ध

              </div>

            </div>



            <div className="gov-card" style={{ padding: '14px', background: '#fee2e2' }}>

              <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>

                चिकित्सा अलर्ट फ्लैग्ड (Medical Alerts)

              </div>

              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626' }}>

                {liveStats?.medicalAlerts || 48}

              </div>

              <div style={{ fontSize: '0.72rem', color: '#991b1b' }}>

                विशेष चिकित्सा निगरानी बैंड

              </div>

            </div>

          </div>

        </div>

      )}



      {/* TAB 3: POINT 2 - RACE DAY LEADERBOARD & RESULTS */}

      {adminTab === "leaderboard" && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Header Card */}

          <div className="gov-card" style={{
            padding: '16px 20px',
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={22} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>
                  रेस डे आधिकारिक परिणाम एवं लीडरबोर्ड (Official Standings)
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                ग्राउंड RFID टाइमिंग मैट्स (स्टार्ट गेंट्री, 5KM, 10KM, 15KM, फिनिश) से प्राप्त मिलीसेकंड सटीक नेट चिप टाइमिंग।
              </p>
            </div>

            <button
              onClick={() => loadLeaderboardData(leadCategory, leadGender)}
              style={{
                background: '#ffffff',
                color: '#1e293b',
                border: '1.5px solid #cbd5e1',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <RefreshCw size={14} color="#64748b" className={isLoadingLeaderboard ? 'animate-spin' : ''} />
              <span>रिफ्रेश स्टैंडिंग्स</span>
            </button>
          </div>



          {/* Filter Pills */}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--police-navy-900)', marginRight: '4px' }}>कैटेगरी:</span>

              {[

                { id: 'all', label: 'सभी (All)' },

                { id: '21k', label: '21 KM Half Marathon' },

                { id: '10k', label: '10 KM Speed Run' },

                { id: '5k', label: '5 KM Community Run' },

                { id: '3k', label: '3 KM Walk' }

              ].map(cat => (

                <button

                  key={cat.id}

                  onClick={() => {

                    setLeadCategory(cat.id);

                    loadLeaderboardData(cat.id, leadGender);

                  }}

                  style={{

                    padding: '6px 12px',

                    borderRadius: '20px',

                    fontSize: '0.76rem',

                    fontWeight: 800,

                    border: leadCategory === cat.id ? '1.5px solid var(--police-navy-900)' : '1px solid var(--border-medium)',

                    background: leadCategory === cat.id ? 'var(--police-navy-900)' : '#ffffff',

                    color: leadCategory === cat.id ? '#ffffff' : 'var(--text-main)',

                    cursor: 'pointer'

                  }}

                >

                  {cat.label}

                </button>

              ))}

            </div>



            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>लिंग:</span>

              {[

                { id: 'all', label: 'समस्त' },

                { id: 'Female', label: 'महिला (Women)' },

                { id: 'Male', label: 'पुरुष (Men)' }

              ].map(g => (

                <button

                  key={g.id}

                  onClick={() => {

                    setLeadGender(g.id);

                    loadLeaderboardData(leadCategory, g.id);

                  }}

                  style={{

                    padding: '5px 12px',

                    borderRadius: '6px',

                    fontSize: '0.75rem',

                    fontWeight: 700,

                    border: leadGender === g.id ? '1.5px solid var(--crimson-600)' : '1px solid var(--border-medium)',

                    background: leadGender === g.id ? 'var(--crimson-600)' : '#ffffff',

                    color: leadGender === g.id ? '#ffffff' : 'var(--text-main)',

                    cursor: 'pointer'

                  }}

                >

                  {g.label}

                </button>

              ))}

            </div>

          </div>



          {/* Standings Table */}
          <div className="admin-scroll-hint">
            <span>↔️ स्टैंडिंग्स और टाइमिंग मैट स्प्लिट्स देखने के लिए स्वाइप करें</span>
          </div>
          <div className="admin-table-scroll">

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>

              <thead style={{ background: '#f8fafc', color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem', borderBottom: '1.5px solid #e2e8f0', fontWeight: 800 }}>

                <tr>

                  <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>रैंक</th>

                  <th style={{ padding: '12px 14px' }}>बिब #</th>

                  <th style={{ padding: '12px 14px' }}>धावक का नाम व जिला</th>

                  <th style={{ padding: '12px 14px' }}>कैटेगरी व लिंग</th>

                  <th style={{ padding: '12px 14px' }}>गन टाइम</th>

                  <th style={{ padding: '12px 14px' }}>नेट चिप टाइम</th>

                  <th style={{ padding: '12px 14px' }}>मैट स्प्लिट्स (Splits)</th>

                  <th style={{ padding: '12px 14px' }}>स्थिति</th>

                </tr>

              </thead>

              <tbody>

                {(leaderboardList.length > 0 ? leaderboardList : [

                  {

                    rank: 1,

                    bib_number: "RJ-21K-1001",

                    full_name: "सुनीता राठौड़",

                    district_name: "जयपुर पुलिस आयुक्तालय",

                    category_name: "21 KM Half Marathon",

                    gender: "Female",

                    finish_time: "01:14:22",

                    chip_time: "01:14:05",

                    status: "FINISHED",

                    scans: [

                      { km: 0, time: "06:00:00" },

                      { km: 5, time: "06:17:30" },

                      { km: 10, time: "06:35:10" },

                      { km: 21.1, time: "07:14:22" }

                    ]

                  },

                  {

                    rank: 2,

                    bib_number: "RJ-21K-1002",

                    full_name: "कविराज गुर्जर",

                    district_name: "कोटा शहर",

                    category_name: "21 KM Half Marathon",

                    gender: "Male",

                    finish_time: "01:16:45",

                    chip_time: "01:16:32",

                    status: "FINISHED",

                    scans: [

                      { km: 0, time: "06:00:00" },

                      { km: 5, time: "06:18:02" },

                      { km: 10, time: "06:36:20" },

                      { km: 21.1, time: "07:16:45" }

                    ]

                  },

                  {

                    rank: 3,

                    bib_number: "RJ-21K-1003",

                    full_name: "पूजा शेखावत",

                    district_name: "जोधपुर कमिश्नरेट",

                    category_name: "21 KM Half Marathon",

                    gender: "Female",

                    finish_time: "01:19:10",

                    chip_time: "01:18:50",

                    status: "FINISHED",

                    scans: [

                      { km: 0, time: "06:00:00" },

                      { km: 5, time: "06:19:10" },

                      { km: 10, time: "06:38:40" },

                      { km: 21.1, time: "07:19:10" }

                    ]

                  },

                  {

                    rank: 4,

                    bib_number: "RJ-21K-1004",

                    full_name: "विक्रम सिंह यादव",

                    district_name: "अलवर",

                    category_name: "21 KM Half Marathon",

                    gender: "Male",

                    finish_time: "01:21:05",

                    chip_time: "01:20:48",

                    status: "FINISHED",

                    scans: [

                      { km: 0, time: "06:00:00" },

                      { km: 5, time: "06:19:40" },

                      { km: 10, time: "06:39:50" },

                      { km: 21.1, time: "07:21:05" }

                    ]

                  }

                ]).map((row, idx) => {

                  const rank = row.rank || idx + 1;

                  const isPodium = rank <= 3;

                  const medalColors = { 1: '#f59e0b', 2: '#94a3b8', 3: '#d97706' };

                  const medalEmojis = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' };



                  return (

                    <tr key={idx} style={{

                      borderBottom: '1px solid var(--border-subtle)',

                      background: isPodium ? 'rgba(254, 240, 138, 0.12)' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc')

                    }}>

                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900 }}>

                        {isPodium ? (

                          <span style={{

                            background: medalColors[rank],

                            color: '#ffffff',

                            padding: '3px 8px',

                            borderRadius: '12px',

                            fontSize: '0.74rem',

                            fontWeight: 900,

                            display: 'inline-block'

                          }}>

                            {medalEmojis[rank]}

                          </span>

                        ) : (

                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{rank}</span>

                        )}

                      </td>

                      <td style={{ padding: '12px 14px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--crimson-600)' }}>

                        {row.bib_number}

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{row.full_name}</div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.district_name}</div>

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        <div style={{ fontWeight: 600, color: 'var(--police-navy-800)' }}>{row.category_name}</div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.gender}</div>

                      </td>

                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>

                        {row.finish_time || 'Running...'}

                      </td>

                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 900, color: 'var(--police-navy-950)', fontSize: '0.92rem' }}>

                        {row.chip_time || row.finish_time || 'N/A'}

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        {Array.isArray(row.scans) && row.scans.length > 0 ? (

                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>

                            {row.scans.map((s, sI) => (

                              <span key={sI} style={{ background: 'var(--police-navy-50)', padding: '2px 5px', borderRadius: '3px', fontSize: '0.66rem', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>

                                {s.km}K: {s.time || s.scan_time}

                              </span>

                            ))}

                          </div>

                        ) : (

                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Start Mat Checked</span>

                        )}

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        <span style={{

                          background: row.status === 'FINISHED' ? '#dcfce7' : '#dbeafe',

                          color: row.status === 'FINISHED' ? '#15803d' : '#1d4ed8',

                          border: `1px solid ${row.status === 'FINISHED' ? '#86efac' : '#93c5fd'}`,

                          padding: '3px 8px',

                          borderRadius: '4px',

                          fontSize: '0.72rem',

                          fontWeight: 800

                        }}>

                          {row.status === 'FINISHED' ? '✓ FINISHED' : '● ON TRACK'}

                        </span>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        </div>

      )}



      



      {/* TAB 4: VOLUNTEER & GATE ROSTER MANAGEMENT (PHQ Admin Exclusive) */}
      {!isDistrictRole && adminTab === "volunteers" && (
        <VolunteerRosterManager />
      )}

      {/* TAB: CERTIFICATE MANAGEMENT (Unified for District SP & PHQ Command) */}
      {(adminTab === "certificates" || (isDistrictRole && adminTab === "district_certificates")) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Authority Header Card */}
          <div className="gov-card" style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            border: '2px solid var(--police-gold-500)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={26} color="var(--police-gold-400)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  {isDistrictRole 
                    ? `जिला स्तरीय ई-प्रमाण पत्र एवं डिजिटल डिस्पैच (${adminUser.districtName || 'District Desk'})` 
                    : 'राजस्थान पुलिस राज्यव्यापी ई-प्रमाण पत्र प्रबंधन एवं 1-क्लिक डिस्पैच'}
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                {isDistrictRole
                  ? 'जिला पुलिस अधीक्षक (SP) स्तर: गेट उपस्थिति आधारित सहभागिता ई-प्रमाण पत्र जनरेशन, स्वतः SMS/ईमेल डिस्पैच एवं सत्यापन।'
                  : 'पुलिस मुख्यालय (PHQ) स्तर: जयपुर फ्लैगशिप 21K/10K RFID टाइमिंग मैराथन एवं 41 जिलों के जन-जागरूकता प्रमाण पत्र का केंद्रीकृत नियंत्रण।'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--police-gold-500)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: '#fde68a',
                fontWeight: 700
              }}>
                {isDistrictRole ? `अधिकार क्षेत्र: ${adminUser.districtName || 'जिला पुलिस'}` : 'अधिकार क्षेत्र: संपूर्ण राजस्थान (PHQ Super-Admin)'}
              </div>
              <button 
                onClick={loadCertificateStats}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem'
                }}
              >
                <RefreshCw size={14} /> रीफ्रेश डेटा
              </button>
            </div>
          </div>

          {/* 4 KPI Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px'
          }}>
            {/* Card 1: Registered */}
            <div className="gov-card" style={{ padding: '16px 20px', background: '#ffffff', borderTop: '4px solid #2563eb' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                कुल पंजीकृत धावक
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
                {certStats.totalRegistered}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                आधिकारिक राजस्थान पुलिस डेटाबेस
              </div>
            </div>

            {/* Card 2: Gate Scanned */}
            <div className="gov-card" style={{ padding: '16px 20px', background: '#ffffff', borderTop: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  गेट-स्कैन उपस्थित
                </span>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  {certStats.totalRegistered > 0 ? `${((certStats.gateScanned / certStats.totalRegistered) * 100).toFixed(0)}% उपस्थिति` : '0%'}
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
                {certStats.gateScanned}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px' }}>
                वॉलंटियर टर्मिनल द्वारा गेट पर अधिकृत
              </div>
            </div>

            {/* Card 3: Issued */}
            <div className="gov-card" style={{ padding: '16px 20px', background: '#ffffff', borderTop: '4px solid #d97706' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                जारी प्रमाण पत्र
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
                {certStats.certificatesIssued}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px' }}>
                पोर्टल डाउनलोड व SMS सक्रिय
              </div>
            </div>

            {/* Card 4: Pending */}
            <div className="gov-card" style={{ padding: '16px 20px', background: '#ffffff', borderTop: '4px solid #dc2626' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                लंबित प्रमाण पत्र
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#991b1b', marginTop: '4px' }}>
                {certStats.pendingIssuance}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '2px' }}>
                जनरेशन एवं वेरिफिकेशन प्रतीक्षारत
              </div>
            </div>
          </div>

          {/* Action Console: 1-Click Mass Generation & SMS/Email Dispatch */}
          <div className="gov-card" style={{
            padding: '22px 24px',
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(10, 28, 61, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
              <Zap size={20} color="#d97706" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                1-क्लिक प्रमाण पत्र जनरेशन एवं डिलीवरी कंसोल
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
              {/* Left Column: District & Target Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  १. अधिकार क्षेत्र / जिला चयन (Target Jurisdiction)
                </label>
                {isDistrictRole ? (
                  <div style={{
                    padding: '10px 14px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#1e293b'
                  }}>
                    🔒 {adminUser.districtName || 'जिला पुलिस अधीक्षक कमान'} (Auto-Locked)
                  </div>
                ) : (
                  <select
                    value={certDistrict}
                    onChange={(e) => setCertDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #94a3b8',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                  >
                    <option value="all">🚩 संपूर्ण राजस्थान (All 41 Districts + Jaipur)</option>
                    <option value="jaipur_comm">⭐ जयपुर पुलिस आयुक्तालय (Flagship Half Marathon - Timed)</option>
                    {RAJASTHAN_POLICE_DISTRICTS.filter(d => !d.name.toLowerCase().includes('jaipur')).map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} (जिला जागरूकता दौड़)
                      </option>
                    ))}
                  </select>
                )}
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                  {certDistrict === 'jaipur_comm' 
                    ? 'जयपुर फ्लैगशिप: चिप-टाइमिंग मैट्रिक्स (Gun/Chip Time, Pace, Rank) एवं DGP हस्ताक्षर शामिल होंगे।'
                    : 'जिला दौड़: बिना टाइमिंग मैट्रिक्स, जिला पुलिस अधीक्षक (SP) हस्ताक्षर व शपथ संदेश शामिल होगा।'}
                </div>
              </div>

              {/* Right Column: Attendance Criteria */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  २. पात्रता एवं हाजिरी सत्यापन फ़िल्टर (Attendance Gate Filter)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: `1.5px solid ${certEligibilityMode === 'GATE_SCANNED_ONLY' ? '#16a34a' : '#cbd5e1'}`,
                    background: certEligibilityMode === 'GATE_SCANNED_ONLY' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="certEligibility"
                      value="GATE_SCANNED_ONLY"
                      checked={certEligibilityMode === 'GATE_SCANNED_ONLY'}
                      onChange={() => setCertEligibilityMode('GATE_SCANNED_ONLY')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
                        केवल गेट-स्कैन उपस्थित धावक (Gate-Scanned Only) — अनुशंसित
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: '2px' }}>
                        प्रवेश द्वार पर वॉलंटियर टर्मिनल द्वारा स्कैन किए गए उपस्थित धावकों को ही जारी किया जाएगा।
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: `1.5px solid ${certEligibilityMode === 'ALL_REGISTERED' ? '#d97706' : '#cbd5e1'}`,
                    background: certEligibilityMode === 'ALL_REGISTERED' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="certEligibility"
                      value="ALL_REGISTERED"
                      checked={certEligibilityMode === 'ALL_REGISTERED'}
                      onChange={() => setCertEligibilityMode('ALL_REGISTERED')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e' }}>
                        समस्त पंजीकृत धावक (All Registered Participants) — आपातकालीन
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '2px' }}>
                        यदि किसी दूरदराज चेकपॉइंट पर लाइव स्कैनर अनुपलब्ध रहा हो तो सभी पंजीकृत धावकों को जारी करें।
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Console Action Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '18px',
              marginTop: '18px'
            }}>
              <button
                onClick={() => {
                  const sample = filteredList[0] || dbParticipants[0] || {
                    fullName: "सुनीता शर्मा (Sunita Sharma)",
                    bibNumber: "RJ-05K-3042",
                    categoryName: "5 KM Community Run",
                    districtName: adminUser.districtName || "अलवर पुलिस",
                    districtId: adminUser.districtId || "alwar",
                    certificateId: "RJ-POL-2027-SAMPLE",
                    isIssued: true
                  };
                  setPreviewCertRunner(sample);
                }}
                className="btn-navy"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Eye size={16} /> 👁️ सैंपल प्रमाण पत्र प्रिव्यू (Preview Template)
              </button>

              <button
                onClick={handleBatchGenerateCertificates}
                disabled={isGeneratingCerts}
                style={{
                  padding: '12px 24px',
                  background: isGeneratingCerts ? '#94a3b8' : 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: isGeneratingCerts ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(22, 101, 52, 0.3)'
                }}
              >
                <Award size={18} color="#fde68a" />
                {isGeneratingCerts ? "प्रमाण पत्र जारी एवं डिस्पैच हो रहे हैं..." : "🚀 1-Click Generate & Issue Certificates"}
              </button>
            </div>

            {/* Notification Feedback Banner */}
            {certFeedback && (
              <div style={{
                marginTop: '16px',
                padding: '12px 18px',
                borderRadius: '6px',
                background: certFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1.5px solid ${certFeedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
                color: certFeedback.type === 'success' ? '#166534' : '#991b1b',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                gap: certFeedback.canFallbackAll ? '10px' : '0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>{certFeedback.message}</div>
                  <button
                    onClick={() => setCertFeedback(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                </div>
                {certFeedback.canFallbackAll && (
                  <button
                    type="button"
                    onClick={() => {
                      setCertEligibilityMode('ALL_REGISTERED');
                      handleBatchGenerateCertificates('ALL_REGISTERED');
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)'
                    }}
                  >
                    ⚡ 'समस्त पंजीकृत धावक (All Registered)' मोड में अभी जारी करें (1-Click Issue)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* District Participants Certificate Table */}
          <div className="gov-card" style={{ padding: '20px 24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  धावक प्रमाण पत्र स्थिति एवं प्रेषण लेजर
                </h4>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  गेट प्रवेश, डिजिटल प्रमाण पत्र ID एवं SMS डिस्पैच स्थिति
                </div>
              </div>

              <input
                type="text"
                placeholder="नाम, बिब # या मोबाइल द्वारा खोजें..."
                value={certTableSearch}
                onChange={(e) => setCertTableSearch(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  minWidth: '220px'
                }}
              />
            </div>

            <div className="admin-table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--police-navy-950)', color: '#ffffff', borderBottom: '2px solid var(--police-gold-500)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>बिब व धावक का नाम</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>दौड़ श्रेणी व जिला</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>गेट प्रवेश (Gate Entry)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>प्रमाण पत्र क्रमांक</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>जारी स्थिति</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>एक्शन</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList
                    .filter(row => {
                      if (!certTableSearch.trim()) return true;
                      const q = certTableSearch.toLowerCase().trim();
                      return (row.fullName || '').toLowerCase().includes(q) ||
                             (row.bibNumber || '').toLowerCase().includes(q) ||
                             (row.mobile || '').includes(q) ||
                             (row.certificateId || '').toLowerCase().includes(q);
                    })
                    .map((row, idx) => {
                      const isGateOk = Boolean(row.gateEntered) || row.status === 'FINISHED' || row.status === 'ON_TRACK';
                      const isCertIssued = Boolean(row.certificateIssued) || row.status === 'CERT_ISSUED' || row.status === 'FINISHED' || ['RJ-21K-1005', 'RJ-10K-2018', 'RJ-05K-3042', 'RJ-05K-9901'].includes(row.bibNumber);

                      return (
                        <tr key={row.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#ffffff' : 'var(--police-navy-50)' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{row.fullName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>
                              {row.bibNumber} • {row.mobile}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{row.categoryName || '5 KM Community Run'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.districtName || 'District Police'}</div>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {isGateOk ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #86efac' }}>
                                ✓ गेट अधिकृत
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                                ⏳ स्कैन प्रतीक्षारत
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                              {row.certificateId || `RJ-POL-2027-${String(row.id || row.bibNumber || 'CERT').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}`}
                            </span>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {isCertIssued ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, border: '1px solid #86efac' }}>
                                ✓ जारी (Issued)
                              </span>
                            ) : (
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, border: '1px solid #fde68a' }}>
                                ⏳ अप्रकाशित (Pending)
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                onClick={() => setPreviewCertRunner(row)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  color: '#0f172a'
                                }}
                                title="प्रमाण पत्र प्रिव्यू"
                              >
                                👁️ देखें
                              </button>
                              <button
                                onClick={() => handleResendSingleCert(row)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: '#e0f2fe',
                                  border: '1px solid #bae6fd',
                                  cursor: 'pointer',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  color: '#0369a1'
                                }}
                                title="SMS एवं सूचना पुनः भेजें"
                              >
                                📩 SMS
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Certificate Preview Modal */}
          {previewCertRunner && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(10, 28, 61, 0.75)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                maxWidth: '780px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0a1c3d' }}>
                    प्रमाण पत्र आधिकारिक प्रिव्यू • {previewCertRunner.fullName} ({previewCertRunner.bibNumber})
                  </div>
                  <button
                    onClick={() => setPreviewCertRunner(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontWeight: 800,
                      color: '#475569'
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Rendered Certificate Card inside Modal */}
                <div style={{
                  background: '#fafbfc',
                  border: '8px double #d4af37',
                  borderRadius: '6px',
                  padding: '28px 24px',
                  color: '#0a1c3d',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d4af37', paddingBottom: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <PoliceEmblem size={44} />
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                          GOVERNMENT OF RAJASTHAN
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a1c3d' }}>
                          RAJASTHAN POLICE
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                          {(previewCertRunner.category?.includes('21k') || previewCertRunner.category?.includes('10k'))
                            ? 'Statewide Flagship Half Marathon'
                            : `जिला पुलिस • ${previewCertRunner.districtName || 'Rajasthan Police'}`}
                        </div>
                      </div>
                    </div>
                    <RunForHerBadge size={40} />
                  </div>

                  {/* Title & Presented To */}
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0a1c3d' }}>
                    CERTIFICATE OF ACCOMPLISHMENT
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: '14px' }}>
                    Women's Safety, Dignity & Empowerment Movement
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>
                    This official certificate is proudly awarded to
                  </div>
                  <div style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: '#0a1c3d',
                    borderBottom: '2px solid #0a1c3d',
                    display: 'inline-block',
                    padding: '0 20px 2px 20px',
                    marginBottom: '12px'
                  }}>
                    {previewCertRunner.fullName}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '520px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                    {(previewCertRunner.category?.includes('21k') || previewCertRunner.category?.includes('10k')) ? (
                      <>For successfully completing the <strong>{previewCertRunner.categoryName || '21 KM Half Marathon'}</strong> under the leadership of the <strong>Director General of Police (DGP), Rajasthan</strong> on the motto <em>"Every Step for Her Safety."</em></>
                    ) : (
                      <>For exemplary participation in the <strong>Women's Safety, Dignity & Empowerment Movement</strong> and successfully completing the <strong>{previewCertRunner.categoryName || '5 KM Community Run'}</strong> in <strong>{previewCertRunner.districtName || 'Rajasthan'}</strong> under the leadership of the District Police on the motto <em>"Every Step for Her Safety."</em></>
                    )}
                  </p>

                  {/* Badges / Metrics */}
                  {(previewCertRunner.category?.includes('21k') || previewCertRunner.category?.includes('10k')) ? (
                    <div style={{
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '6px',
                      marginBottom: '18px'
                    }}>
                      <div><div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>BIB NUMBER</div><div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#dc2626' }}>{previewCertRunner.bibNumber}</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>GUN TIME</div><div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0a1c3d' }}>{previewCertRunner.finishTime || '00:48:32'}</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>CHIP TIME</div><div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0a1c3d' }}>00:47:15</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>AVG PACE</div><div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0a1c3d' }}>4:43 min/km</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>RANK</div><div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#047857' }}>Finisher</div></div>
                    </div>
                  ) : (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #d4af37',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      marginBottom: '18px'
                    }}>
                      <div><div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>BIB NUMBER</div><div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace' }}>{previewCertRunner.bibNumber}</div></div>
                      <div><div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>POLICE DISTRICT</div><div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0a1c3d' }}>{previewCertRunner.districtName || 'जिला पुलिस'}</div></div>
                      <div><div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>DESIGNATION</div><div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857' }}>Women Safety Ambassador</div></div>
                    </div>
                  )}

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
                    <div style={{ textAlign: 'center', minWidth: '140px' }}>
                      <div style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#0a1c3d', fontWeight: 700 }}>
                        {(previewCertRunner.category?.includes('21k') || previewCertRunner.category?.includes('10k')) ? 'Rajeev Sharma, IPS' : 'Superintendent of Police'}
                      </div>
                      <div style={{ height: '1.5px', background: '#0a1c3d', width: '120px', margin: '2px auto' }}></div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0a1c3d' }}>
                        {(previewCertRunner.category?.includes('21k') || previewCertRunner.category?.includes('10k')) ? 'DIRECTOR GENERAL OF POLICE' : 'SUPERINTENDENT OF POLICE (SP / DCP)'}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>
                        {(previewCertRunner.category?.includes('21k') || previewCertRunner.category?.includes('10k')) ? 'Rajasthan, Jaipur' : `${previewCertRunner.districtName || 'District Police'}, Rajasthan`}
                      </div>
                    </div>

                    <OfficialGoldSeal size={56} />

                    <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#0a1c3d' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800 }}>{previewCertRunner.certificateId || 'RJ-POL-2027-SAMPLE'}</div>
                      <div style={{ color: '#16a34a', fontWeight: 700 }}>✓ Digitally Verified</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <button
                    onClick={() => setPreviewCertRunner(null)}
                    className="btn-navy"
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                  >
                    बंद करें (Close)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      {/* TAB: DISTRICT MEDICAL & SAFETY (SP Level) */}

      {isDistrictRole && adminTab === "district_medical" && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="gov-card" style={{

            padding: '18px 22px',

            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',

            color: '#ffffff',

            borderRadius: '8px',

            border: '2px solid #ef4444',

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',

            flexWrap: 'wrap',

            gap: '12px'

          }}>

            <div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                <HeartPulse size={24} color="#fca5a5" />

                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>

                  स्थानीय पुलिस सुरक्षा व आपातकालीन मेडिकल डेस्क ({adminUser.districtName || 'District'})

                </h3>

              </div>

              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#fecaca' }}>

                जिले में मैराथन रूट पर पुलिस सुरक्षा टीम, एम्बुलेंस व चिकित्सा शिविर हेतु धावकों का ब्लड ग्रुप एवं इमरजेंसी डेटा।

              </p>

            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#ffffff', fontWeight: 700 }}>

              🚑 मेडिकल अलर्ट्स: {filteredList.filter(r => r.medicalCondition && r.medicalCondition !== 'None' && !r.medicalCondition.includes('Fit')).length}

            </div>

          </div>



          <div className="admin-scroll-hint">
            <span>↔️ मेडिकल स्थिति व इमरजेंसी कॉल नंबर देखने के लिए स्वाइप करें</span>
          </div>
          <div className="admin-table-scroll">

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>

              <thead>

                <tr style={{ background: '#450a0a', color: '#ffffff', borderBottom: '2px solid #ef4444' }}>

                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>धावक विवरण (Bib & Name)</th>

                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>रक्त समूह (Blood Group)</th>

                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>घोषित स्वास्थ्य स्थिति</th>

                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800 }}>आपातकालीन संपर्क (Emergency Contact)</th>

                </tr>

              </thead>

              <tbody>

                {filteredList.map((row, idx) => {

                  const hasAlert = row.medicalCondition && row.medicalCondition !== 'None' && !row.medicalCondition.includes('Fit');

                  return (

                    <tr key={row.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: hasAlert ? '#fffbeb' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc') }}>

                      <td style={{ padding: '12px 14px' }}>

                        <div style={{ fontWeight: 800, color: 'var(--police-navy-950)' }}>{row.fullName}</div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--crimson-600)', fontWeight: 700 }}>{row.bibNumber} • {row.gender}</div>

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        <span style={{ background: '#ffe4e6', color: '#be123c', padding: '3px 8px', borderRadius: '4px', fontWeight: 900, border: '1px solid #fecdd3' }}>

                          🩸 {row.bloodGroup || 'O+'}

                        </span>

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        {hasAlert ? (

                          <span style={{ color: '#b45309', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>

                            <AlertTriangle size={14} color="#d97706" /> {row.medicalCondition}

                          </span>

                        ) : (

                          <span style={{ color: '#059669', fontWeight: 600 }}>✓ पूर्णतः स्वस्थ (Fit)</span>

                        )}

                        {row.medicalNotes && (

                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{row.medicalNotes}</div>

                        )}

                      </td>

                      <td style={{ padding: '12px 14px' }}>

                        <a 

                          href={`tel:${row.mobile}`}

                          style={{ fontWeight: 800, color: '#1e40af', textDecoration: 'none' }}

                        >

                          📞 {row.mobile}

                        </a>

                      </td>

                    </tr>

                  );

                })}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ADMINISTRATIVE AUDIT TRAIL LOGS */}
      {adminTab === "audit_logs" && (
        <div className="gov-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '10px', border: '1.5px solid var(--border-medium)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '2px solid var(--police-navy-100)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                <History size={22} color="#7c3aed" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                  आधिकारिक प्रशासनिक ऑडिट लॉग (Official System Audit Trail)
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  राजस्थान पुलिस सुरक्षा मानक • सभी प्रशासनिक, किट वितरण व क्रेडेंशियल गतिविधियों का समय-अंकित लेजर
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="लॉग खोजें (Action, Actor)..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.82rem'
                  }}
                />
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              <button
                type="button"
                onClick={loadAuditLogs}
                disabled={isLoadingAuditLogs}
                style={{
                  background: 'var(--police-navy-900)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: isLoadingAuditLogs ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} className={isLoadingAuditLogs ? 'spin' : ''} />
                <span>ताज़ा करें</span>
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: 'var(--police-navy-900)', fontWeight: 800 }}>
                  <th style={{ padding: '12px 14px', width: '70px' }}>लॉग ID</th>
                  <th style={{ padding: '12px 14px', width: '160px' }}>समय (Timestamp)</th>
                  <th style={{ padding: '12px 14px', width: '140px' }}>अधिकारी / ऑपरेटर</th>
                  <th style={{ padding: '12px 14px', width: '160px' }}>कार्रवाई (Action)</th>
                  <th style={{ padding: '12px 14px' }}>गतिविधि विवरण (Details)</th>
                  <th style={{ padding: '12px 14px', width: '110px' }}>IP पता</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs
                  .filter(l => !auditSearch || (l.action || '').toLowerCase().includes(auditSearch.toLowerCase()) || (l.actor || '').toLowerCase().includes(auditSearch.toLowerCase()) || (l.details || '').toLowerCase().includes(auditSearch.toLowerCase()))
                  .map((log, idx) => {
                    const actionColor = 
                      log.action?.includes('KIT') ? { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' } :
                      log.action?.includes('GATE') ? { bg: '#ecfdf5', text: '#047857', border: '#86efac' } :
                      log.action?.includes('CERT') ? { bg: '#fef3c7', text: '#92400e', border: '#fde68a' } :
                      log.action?.includes('LOGIN') ? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' } :
                      log.action?.includes('BROADCAST') ? { bg: '#faf5ff', text: '#7e22ce', border: '#d8b4fe' } :
                      { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

                    return (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          #{log.id || (idx + 1)}
                        </td>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#475569', fontSize: '0.78rem' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'आज'}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--police-navy-950)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Shield size={12} color="#2563eb" />
                            {log.actor || 'SYSTEM'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            background: actionColor.bg,
                            color: actionColor.text,
                            border: `1px solid ${actionColor.border}`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            display: 'inline-block'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#1e293b' }}>
                          {log.details || '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.75rem' }}>
                          {log.ip || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      कोई ऑडिट लॉग उपलब्ध नहीं है।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>

    {/* PRINTABLE GATE / EXPO CHECKLIST MODAL */}
    {isPrintChecklistOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 28, 61, 0.75)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.35)'
        }}>
          {/* Modal Action Header (Hidden during actual print) */}
          <div className="no-print" style={{
            padding: '16px 24px',
            background: 'var(--police-navy-950)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid var(--police-gold-500)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Printer size={20} color="#fde68a" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  आधिकारिक धावक उपस्थिति एवं किट वितरण चेकलिस्ट (Printable Master A4)
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  वर्तमान फ़िल्टर: {filteredList.length} धावक • ऑन-ग्राउंड ड्यूटी चेकलिस्ट
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} /> 🖨️ प्रिंट करें (Print A4)
              </button>
              <button
                type="button"
                onClick={() => setIsPrintChecklistOpen(false)}
                style={{
                  background: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.84rem'
                }}
              >
                ✕ बंद करें
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div id="printable-checklist-content" style={{ padding: '24px', overflowY: 'auto', flex: 1, color: '#000000', background: '#ffffff' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                राजस्थान पुलिस मुख्यालय, जयपुर
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0' }}>
                राजस्थान पुलिस मैराथन 2027 • "रन फॉर हर" (Run for Her)
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                आधिकारिक धावक उपस्थिति, किट वितरण एवं गेट सुरक्षा रजिस्टर
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginTop: '8px', color: '#333333' }}>
                <span><strong>स्थान/यूनिट:</strong> {isDistrictRole ? adminUser.districtName : (districtFilter === 'all' ? 'समस्त राजस्थान' : districtFilter)}</span>
                <span><strong>कुल धावक:</strong> {filteredList.length}</span>
                <span><strong>इवेंट तिथि:</strong> 3 जनवरी 2027</span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderTop: '1px solid #000000', borderBottom: '1px solid #000000' }}>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '35px', textAlign: 'center' }}>क्र.</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '90px' }}>बिब सं.</th>
                  <th style={{ border: '1px solid #000', padding: '6px' }}>धावक का नाम</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '80px' }}>लिंग/आयु</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '90px' }}>मोबाइल</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '110px' }}>श्रेणी</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '45px', textAlign: 'center' }}>साइज</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '45px', textAlign: 'center' }}>ब्लड</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '70px', textAlign: 'center' }}>किट स्थिति</th>
                  <th style={{ border: '1px solid #000', padding: '6px', width: '100px', textAlign: 'center' }}>हस्ताक्षर</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.slice(0, 150).map((r, i) => (
                  <tr key={r.id || r.bibNumber || i} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', fontWeight: 800, fontFamily: 'monospace' }}>{r.bibNumber}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', fontWeight: 700 }}>
                      {r.fullName}
                      {r.hasMedicalIssue && <span style={{ color: '#dc2626', fontSize: '0.68rem', marginLeft: '4px' }}>[⚠️ मेडिकल]</span>}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{r.gender || 'F'} / {r.age || '24'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', fontFamily: 'monospace' }}>{r.mobile}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{r.categoryName || r.category}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 800 }}>{r.tshirt || r.tshirtSize || 'M'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{r.bloodGroup || 'B+'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{r.kitCollected ? '✓ प्राप्त' : 'लंबित'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredList.length > 150 && (
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.74rem', color: '#666' }}>
                * पृष्ठ सीमा: प्रथम 150 रिकॉर्ड्स प्रदर्शित। संपूर्ण डेटा के लिए Excel CSV एक्सपोर्ट का उपयोग करें।
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #000' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '160px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>ड्यूटी प्रभारी / एक्सपो नोडल</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '160px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>पुलिस उपाधीक्षक / सहायक पुलिस आयुक्त</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '160px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>पुलिस अधीक्षक / उपायुक्त</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* MASS COMMUNICATION / BROADCAST MODAL */}
    {isBroadcastOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 28, 61, 0.75)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
            color: '#ffffff',
            padding: '18px 24px',
            borderBottom: '3px solid var(--police-gold-500)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Radio size={20} color="#fde68a" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  आधिकारिक सामूहिक SMS/व्हाट्सएप प्रसारण केंद्र
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  राजस्थान पुलिस मैराथन 2027 • जन-सूचना एवं एडवाइजरी प्रसारण
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsBroadcastOpen(false)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSendBroadcast} style={{ padding: '24px' }}>
            {broadcastFeedback && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: broadcastFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                border: `1.5px solid ${broadcastFeedback.type === 'success' ? '#86efac' : '#fecaca'}`,
                color: broadcastFeedback.type === 'success' ? '#166534' : '#991b1b',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color={broadcastFeedback.type === 'success' ? '#16a34a' : '#dc2626'} />
                <span>{broadcastFeedback.message}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                  प्रसारण चैनल (Channel):
                </label>
                <select
                  value={broadcastForm.channel}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1.5px solid var(--border-medium)', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  <option value="SMS">📱 आधिकारिक SMS गेटवे (DGP Rajasthan)</option>
                  <option value="WHATSAPP">💬 व्हाट्सएप आधिकारिक (Rajasthan Police)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                  लक्षित धावक समूह (Target Audience):
                </label>
                <select
                  value={broadcastForm.targetCategory}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetCategory: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1.5px solid var(--border-medium)', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  <option value="all">🌐 समस्त पंजीकृत धावक (All Categories)</option>
                  <option value="21k">🏅 21 KM हाफ मैराथन धावक</option>
                  <option value="10k">🏃 10 KM स्पीड रन धावक</option>
                  <option value="5k">👥 5 KM कम्युनिटी रन धावक</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                📋 त्वरित आधिकारिक टेम्पलेट चुनें (Quick Template):
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'kit') {
                    setBroadcastForm({
                      ...broadcastForm,
                      title: "आधिकारिक रेस किट एवं बिब संग्रहण निर्देश",
                      message: "आदरणीय धावक, राजस्थान पुलिस मैराथन 2027 हेतु अपनी बिब व रनिंग किट 1 व 2 जनवरी को अल्बर्ट हॉल/पुलिस लाइन केंद्र से प्रातः 9:00 से सायं 6:00 बजे तक अवश्य प्राप्त करें। डिजिटल ई-पास साथ लाएं।"
                    });
                  } else if (val === 'flagoff') {
                    setBroadcastForm({
                      ...broadcastForm,
                      title: "रेस दिवस फ्लैग-ऑफ समय व रूट एडवाइजरी",
                      message: "आदरणीय धावक, 3 जनवरी 2027 को प्रातः 5:30 बजे अल्बर्ट हॉल पर ऐतिहासिक फ्लैग-ऑफ होगा। समय पर पहुंचे एवं नारी सुरक्षा संकल्प में सहभागी बनें।"
                    });
                  } else if (val === 'traffic') {
                    setBroadcastForm({
                      ...broadcastForm,
                      title: "महत्वपूर्ण रूट एवं ट्रैफिक सूचना",
                      message: "मैराथन दिवस पर जयपुर शहर में प्रमुख रूट डायवर्जन रहेंगे। पार्किंग एवं आधिकारिक रूट मैप वेबसाइट पर देखें।"
                    });
                  }
                }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--police-gold-500)', background: '#fffbeb', fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}
              >
                <option value="">-- त्वरित आधिकारिक टेम्पलेट लोड करें --</option>
                <option value="kit">👕 1. रेस किट व बिब संग्रहण निर्देश (Kit Distribution)</option>
                <option value="flagoff">🏁 2. रेस दिवस फ्लैग-ऑफ समय व रूट एडवाइजरी (Flag-off Schedule)</option>
                <option value="traffic">🚦 3. महत्वपूर्ण रूट एवं ट्रैफिक सूचना (Traffic Advisory)</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                संदेश शीर्षक (Message Title) <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <input
                type="text"
                required
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid var(--border-medium)', fontSize: '0.88rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                  संदेश सामग्री (Message Body) <span style={{ color: '#ef4444' }}>*</span>:
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {broadcastForm.message.length} अक्षर
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid var(--border-medium)', fontSize: '0.86rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsBroadcastOpen(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={isSendingBroadcast}
                style={{
                  background: 'var(--police-navy-900)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: isSendingBroadcast ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(10,28,61,0.2)'
                }}
              >
                <Send size={15} color="#fde68a" />
                <span>{isSendingBroadcast ? 'प्रसारण भेजा जा रहा है...' : 'अभी प्रसारण प्रेषित करें ➔'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

  </div>
</div>
);
}

