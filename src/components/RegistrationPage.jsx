import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  ArrowLeft,
  Share2,
  Check,
  Printer,
  Search,
  Download,
  FileText,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { RACE_CATEGORIES, RAJASTHAN_POLICE_DISTRICTS, INITIAL_REGISTRATIONS } from '../data/mockData';
import { PoliceEmblem, StateEmblemOfIndia } from './Emblems';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { apiRegister, apiTrackRunner, apiSendOtp, apiVerifyOtp, apiSearchPass, apiSendPassOtp, apiVerifyPassOtp } from '../services/api';
import { GovPaymentModal } from './GovPaymentModal';

const OTHER_DISTRICTS = RAJASTHAN_POLICE_DISTRICTS.filter(d => d.id !== 'JPR-COMM' && !d.flagship);

export function RegistrationPage({
  initialCategory = "21k",
  initialDistrict = "JPR-COMM",
  onNavigate,
  onRegisterSuccess,
  registrations = []
}) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [venueType, setVenueType] = useState(() => (initialDistrict && initialDistrict !== "JPR-COMM" && initialDistrict !== "jaipur_comm") ? "district" : "jaipur");

  const handleSelectVenueType = (type) => {
    setVenueType(type);
    if (type === "district") {
      // Districts only have 10K, 5K, 2K (No 21K in districts)
      if (category === "21k") {
        setCategory("10k");
      }
      setFormData(prev => ({ ...prev, tshirtSize: "N/A" }));
      if (!selectedDistrict || selectedDistrict === "JPR-COMM" || selectedDistrict === "jaipur_comm") {
        setSelectedDistrict(OTHER_DISTRICTS[0]?.id || "JDH-COMM");
      }
    } else {
      setFormData(prev => ({ ...prev, tshirtSize: prev.tshirtSize === "N/A" ? "M" : prev.tshirtSize }));
    }
  };

  const availableCategories = venueType === "district"
    ? RACE_CATEGORIES.filter(c => c.id === "10k" || c.id === "5k" || c.id === "2k")
    : RACE_CATEGORIES;
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    if (initialDistrict && initialDistrict !== "JPR-COMM" && initialDistrict !== "jaipur_comm") {
      return initialDistrict;
    }
    return OTHER_DISTRICTS[0]?.id || "JDH-COMM";
  });
  const [category, setCategory] = useState(initialCategory);
  const [runnerType, setRunnerType] = useState("Citizen Runner");

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Female",
    age: "",
    dob: "",
    mobile: "",
    email: "",
    idType: "Aadhaar",
    idNumber: "",
    bloodGroup: "B+",
    hasMedicalIssue: false,
    medicalConditions: [],
    medicalNotes: "",
    tshirtSize: "M",
    emergencyContactName: "",
    emergencyRelation: "अभिभावक (Guardian)",
    emergencyContactPhone: "",
    acceptedPledge: true,
    acceptedFitness: true
  });

  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredParticipant, setRegisteredParticipant] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isDownloadingPass, setIsDownloadingPass] = useState(false);

  // Mobile Security OTP Verification States
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [otpToast, setOtpToast] = useState(null);
  const [otpVerificationToken, setOtpVerificationToken] = useState('');

  // Tab State: "register" (New Registration) or "find" (Find/Re-print Existing E-Pass)
  const [activeTab, setActiveTab] = useState("register");
  const [findQuery, setFindQuery] = useState("");
  const [findResults, setFindResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const [findSearchError, setFindSearchError] = useState("");

  // OTP Unlocking States for Existing E-Pass
  const [selectedPassToUnlock, setSelectedPassToUnlock] = useState(null);
  const [passOtpSent, setPassOtpSent] = useState(false);
  const [passEnteredOtp, setPassEnteredOtp] = useState("");
  const [passOtpTimer, setPassOtpTimer] = useState(0);
  const [isSendingPassOtp, setIsSendingPassOtp] = useState(false);
  const [isVerifyingPassOtp, setIsVerifyingPassOtp] = useState(false);
  const [passOtpError, setPassOtpError] = useState("");
  const [passOtpToast, setPassOtpToast] = useState(null);

  const handleFindPass = async (e) => {
    if (e) e.preventDefault();
    const q = findQuery.trim();
    if (!q) {
      alert("कृपया अपना 10-अंकीय मोबाइल नंबर या बिब संख्या दर्ज करें।");
      return;
    }
    setIsFinding(true);
    setHasSearched(false);
    setFindSearchError("");
    setFindResults([]);
    setSelectedPassToUnlock(null);
    setPassOtpSent(false);
    setPassEnteredOtp("");
    setPassOtpError("");
    setPassOtpToast(null);

    try {
      const res = await apiSearchPass(q);
      if (res && res.success && res.runners && res.runners.length > 0) {
        setFindResults(res.runners);
        setSelectedPassToUnlock(res.runners[0]);
      } else {
        setFindSearchError(res?.error || "दर्ज किए गए मोबाइल नंबर या बिब संख्या से कोई अधिकृत ई-पास रिकॉर्ड नहीं मिला।");
      }
    } catch (err) {
      setFindSearchError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
    } finally {
      setIsFinding(false);
      setHasSearched(true);
    }
  };

  const handleSendPassUnlockOtp = async (passObj) => {
    const targetPass = passObj || selectedPassToUnlock || findResults[0];
    if (!targetPass) return;
    setIsSendingPassOtp(true);
    setPassOtpError("");

    try {
      const res = await apiSendPassOtp(targetPass.passId, findQuery.trim());
      if (res && res.success) {
        setPassOtpSent(true);
        setPassOtpTimer(45);
        if (res.code) {
          setPassOtpToast({ mobile: res.maskedMobile || targetPass.maskedMobile, otp: res.code });
          setTimeout(() => setPassOtpToast(null), 12000);
        }
      } else {
        setPassOtpError(res?.error || "OTP भेजने में त्रुटि हुई।");
      }
    } catch (err) {
      setPassOtpError("OTP सर्वर से कनेक्ट नहीं हो सका।");
    } finally {
      setIsSendingPassOtp(false);
    }
  };

  const handleVerifyPassUnlockOtp = async () => {
    const targetPass = selectedPassToUnlock || findResults[0];
    if (!targetPass) return;
    const cleanOtp = passEnteredOtp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setPassOtpError("कृपया मान्य 6-अंकीय OTP दर्ज करें।");
      return;
    }

    setIsVerifyingPassOtp(true);
    setPassOtpError("");

    try {
      const res = await apiVerifyPassOtp(targetPass.passId, findQuery.trim(), cleanOtp);
      if (res && res.success && res.participant) {
        setRegisteredParticipant(res.participant);
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setPassOtpError(res?.error || "अमान्य OTP! कृपया पंजीकृत मोबाइल पर आया सही 6-अंकीय कोड दर्ज करें।");
      }
    } catch (err) {
      setPassOtpError("सत्यापन सर्वर से कनेक्ट नहीं हो सका।");
    } finally {
      setIsVerifyingPassOtp(false);
    }
  };

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const medicalConditionOptions = [
    { id: "asthma", label: "दमा / श्वास रोग (Asthma / Respiratory)" },
    { id: "bp", label: "उच्च / निम्न रक्तचाप (High / Low BP)" },
    { id: "diabetes", label: "मधुमेह (Diabetes)" },
    { id: "cardiac", label: "हृदय संबंधी समस्या (Cardiovascular)" },
    { id: "ortho", label: "हड्डी / जोड़ों / रीढ़ की समस्या (Orthopaedic)" },
    { id: "other", label: "अन्य स्वास्थ्य स्थिति (Other Condition)" }
  ];

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Generate QR code on success
  useEffect(() => {
    if (isSuccess && registeredParticipant) {
      const qrPayload = JSON.stringify({
        org: "Rajasthan Police Marathon 2027",
        motto: "Run for Her - Women Safety",
        bib: registeredParticipant.bibNumber,
        certId: registeredParticipant.certificateId,
        name: registeredParticipant.fullName,
        category: registeredParticipant.categoryName,
        district: registeredParticipant.districtName,
        tshirt: registeredParticipant.tshirtSize || "M",
        bloodGroup: registeredParticipant.bloodGroup,
        mobile: registeredParticipant.mobile || "",
        medicalAlert: registeredParticipant.medicalCondition || "None",
        status: "OFFICIAL_POLICE_EPASS_CONFIRMED"
      });

      QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: { dark: '#0a1c3d', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error("QR Code Error:", err));
    }
  }, [isSuccess, registeredParticipant]);

  const currentCatObj = RACE_CATEGORIES.find(c => c.id === category) || RACE_CATEGORIES[0];
  const currentDistrictObj = venueType === "jaipur"
    ? (RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === "JPR-COMM") || RAJASTHAN_POLICE_DISTRICTS[0])
    : (OTHER_DISTRICTS.find(d => d.id === selectedDistrict) || OTHER_DISTRICTS[0] || RAJASTHAN_POLICE_DISTRICTS[0]);

  const handleConditionToggle = (label) => {
    setFormData(prev => {
      const exists = prev.medicalConditions.includes(label);
      const updated = exists
        ? prev.medicalConditions.filter(item => item !== label)
        : [...prev.medicalConditions, label];
      return { ...prev, medicalConditions: updated };
    });
  };

  const getMaskedId = (type, val) => {
    if (!val) return "XXXX-XXXX";
    const clean = val.replace(/\s+/g, "").toUpperCase();
    if (type === "Aadhaar") {
      const d = clean.replace(/\D/g, "");
      return d.length >= 4 ? `XXXX-XXXX-${d.slice(-4)}` : "XXXX-XXXX-XXXX";
    }
    return clean.length >= 4 ? `XXXXXX${clean.slice(-4)}` : "XXXXXXXXXX";
  };

  const formatAadhaarDisplay = (rawDigits, showFull = false) => {
    const clean = (rawDigits || '').replace(/\D/g, '').slice(0, 12);
    if (showFull) {
      return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    let res = '';
    for (let i = 0; i < clean.length; i++) {
      if (i > 0 && i % 4 === 0) res += ' ';
      if (i < 8) {
        res += 'X';
      } else {
        res += clean[i];
      }
    }
    return res;
  };

  const deriveRawAadhaar = (prevRaw, newDisplayVal, showFull = false) => {
    if (showFull) {
      return newDisplayVal.replace(/\D/g, '').slice(0, 12);
    }
    if (!newDisplayVal || !newDisplayVal.trim()) return '';
    if (!newDisplayVal.includes('X') && !newDisplayVal.includes('x')) {
      return newDisplayVal.replace(/[^0-9]/g, '').slice(0, 12);
    }

    const prevDisplay = formatAadhaarDisplay(prevRaw, false);
    let pIdx = 0;
    let nIdx = 0;
    while (pIdx < prevDisplay.length && nIdx < newDisplayVal.length && prevDisplay[pIdx] === newDisplayVal[nIdx]) {
      pIdx++;
      nIdx++;
    }

    let pEnd = prevDisplay.length - 1;
    let nEnd = newDisplayVal.length - 1;
    while (pEnd >= pIdx && nEnd >= nIdx && prevDisplay[pEnd] === newDisplayVal[nEnd]) {
      pEnd--;
      nEnd--;
    }

    let rawStart = 0;
    for (let i = 0; i < pIdx; i++) {
      if (prevDisplay[i] !== ' ') rawStart++;
    }

    let rawDeleted = 0;
    for (let i = pIdx; i <= pEnd; i++) {
      if (prevDisplay[i] !== ' ') rawDeleted++;
    }

    if (rawDeleted === 0 && prevDisplay.length > newDisplayVal.length && rawStart > 0) {
      rawStart--;
      rawDeleted = 1;
    }

    const inserted = newDisplayVal.slice(nIdx, nEnd + 1).replace(/[^0-9]/g, '');
    const newRaw = prevRaw.slice(0, rawStart) + inserted + prevRaw.slice(rawStart + rawDeleted);
    return newRaw.slice(0, 12);
  };

  // OTP 45-second resend cooldown timer
  useEffect(() => {
    let timerInterval;
    if (otpTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [otpTimer]);

  // E-Pass Unlock OTP cooldown timer
  useEffect(() => {
    let timerInterval;
    if (passOtpTimer > 0) {
      timerInterval = setInterval(() => {
        setPassOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [passOtpTimer]);

  const handleSendOtp = async () => {
    const clean = formData.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(clean)) {
      alert("कृपया पहले 10-अंकीय वैध भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)।");
      return;
    }

    setOtpError('');
    setOtpTimer(45);
    setOtpSent(true);

    try {
      const res = await apiSendOtp(clean);
      if (res && res.success) {
        setServerOtp(res.code || '');
        setEnteredOtp('');
        if (res.code) {
          setOtpToast({
            mobile: clean,
            otp: res.code
          });
        }
      } else {
        setOtpError(res?.error || "OTP भेजने में असमर्थ। कृपया कुछ समय बाद पुनः प्रयास करें।");
        setOtpSent(false);
      }
    } catch (err) {
      setOtpError("सर्वर कनेक्शन विफल। कृपया पुनः प्रयास करें।");
      setOtpSent(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError("कृपया 6-अंकों का पूरा ओटीपी दर्ज करें।");
      return;
    }

    try {
      const clean = formData.mobile.replace(/\D/g, "");
      const res = await apiVerifyOtp(clean, enteredOtp.trim());
      if (res && res.success) {
        setIsMobileVerified(true);
        if (res.verificationToken) {
          setOtpVerificationToken(res.verificationToken);
        }
        setOtpSent(false);
        setOtpError('');
        setOtpToast(null);
        return;
      } else {
        setOtpError(res?.error || "अमान्य ओटीपी कोड! कृपया सही 6-अंकों का सुरक्षा कोड दर्ज करें।");
      }
    } catch (err) {
      setOtpError("ओटीपी सत्यापन में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    }
  };

  const handleChangeMobileNumber = () => {
    setIsMobileVerified(false);
    setOtpSent(false);
    setEnteredOtp('');
    setServerOtp('');
    setOtpToast(null);
    setOtpError('');
  };

  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let calculatedAge = "";
    if (dobVal) {
      const birthYear = new Date(dobVal).getFullYear();
      calculatedAge = Math.max(0, 2027 - birthYear).toString();
    }
    setFormData(prev => ({ ...prev, dob: dobVal, age: calculatedAge }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("कृपया अपना पूरा नाम दर्ज करें।");
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      alert("कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।");
      return;
    }

    if (!formData.dob) {
      alert("कृपया अपनी जन्म तिथि (Date of Birth) दर्ज करें।");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      alert("कृपया वैध ईमेल पता दर्ज करें (सर्टिफिकेट एवं आधिकारिक ई-पास सीधे इसी ईमेल पर प्रेषित होंगे)।");
      return;
    }

    const cleanId = formData.idNumber.replace(/\s+/g, "").toUpperCase();
    if (!cleanId) {
      alert("कृपया अपने पहचान पत्र (Govt ID) की संख्या दर्ज करें।");
      return;
    }
    if (formData.idType === "Aadhaar") {
      const digits = cleanId.replace(/\D/g, "");
      if (digits.length !== 12) {
        alert("कृपया वैध 12-अंकीय आधार कार्ड संख्या दर्ज करें।");
        return;
      }
    } else if (formData.idType === "PAN") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanId)) {
        alert("कृपया वैध 10-अक्षरीय पैन कार्ड संख्या दर्ज करें (उदा. ABCDE1234F)।");
        return;
      }
    } else if (formData.idType === "Voter ID") {
      if (cleanId.length < 8 || cleanId.length > 16) {
        alert("कृपया वैध मतदाता पहचान पत्र (Voter ID) संख्या दर्ज करें।");
        return;
      }
    }

    const cleanEmergency = (formData.emergencyContactPhone || formData.mobile).replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanEmergency)) {
      alert("कृपया वैध 10-अंकीय आपातकालीन मोबाइल नंबर दर्ज करें।");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const calculatedDob = formData.dob || `${2027 - (parseInt(formData.age) || 25)}-01-01`;
    const selectedDistId = venueType === "jaipur" ? "jaipur_comm" : (selectedDistrict || OTHER_DISTRICTS[0]?.id || "jdh_comm").toLowerCase().replace(/-/g, '_');
    const medicalCondSummary = formData.hasMedicalIssue ? formData.medicalConditions.join(", ") : "None / Fully Fit";

    const payload = {
      fullName: formData.fullName.trim(),
      gender: formData.gender ? formData.gender.toLowerCase() : "female",
      dob: calculatedDob,
      mobile: cleanMobile,
      email: formData.email.trim(),
      emergencyContact: cleanEmergency,
      emergencyRelation: formData.emergencyRelation?.trim() || "अभिभावक (Guardian)",
      bloodGroup: formData.bloodGroup || "B+",
      hasMedicalIssue: formData.hasMedicalIssue,
      medicalCondition: medicalCondSummary,
      medicalNotes: formData.medicalNotes?.trim() || "",
      categoryId: category,
      districtId: selectedDistId,
      tshirtSize: venueType === "jaipur" ? (formData.tshirtSize && formData.tshirtSize !== "N/A" ? formData.tshirtSize : "M") : "N/A",
      idType: formData.idType,
      idNumber: cleanId,
      idLast4: cleanId.slice(-4),
      cleanId: cleanId,
      cleanEmergency: cleanEmergency,
      otpVerificationToken: otpVerificationToken || undefined,
      botTrap: formData.botTrap || ""
    };

    setPendingPayload(payload);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    if (!pendingPayload) return;
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);
    setErrorMessage("");

    const feeAmount = category === "21k" ? 499 : category === "10k" ? 399 : 199;
    const finalPayload = {
      fullName: pendingPayload.fullName,
      gender: pendingPayload.gender,
      dob: pendingPayload.dob,
      mobile: pendingPayload.mobile,
      email: pendingPayload.email,
      emergencyContact: pendingPayload.emergencyContact,
      emergencyRelation: pendingPayload.emergencyRelation,
      bloodGroup: pendingPayload.bloodGroup,
      hasMedicalIssue: pendingPayload.hasMedicalIssue,
      medicalCondition: pendingPayload.medicalCondition,
      medicalNotes: pendingPayload.medicalNotes,
      categoryId: pendingPayload.categoryId,
      districtId: pendingPayload.districtId,
      tshirtSize: pendingPayload.tshirtSize,
      idType: pendingPayload.idType,
      idNumber: pendingPayload.idNumber,
      idLast4: pendingPayload.idLast4,
      feeAmount: paymentData?.feeAmount || paymentData?.amount || feeAmount,
      orderId: paymentData?.orderId || `ORD2027-${Date.now().toString().slice(-6)}`,
      transactionId: paymentData?.transactionId || `TXN-RAJPOL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paymentMethod: paymentData?.paymentMethod || "UPI_QR",
      paymentStatus: "PAID"
    };

    const res = await apiRegister(finalPayload);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "पंजीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।");
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    const p = res.participant;
    const cleanId = pendingPayload.cleanId;
    const maskedIdVal = p.idMasked || getMaskedId(formData.idType, cleanId);
    const fullRecord = {
      id: p.id,
      bibNumber: p.bibNumber,
      certificateId: p.certificateId,
      fullName: p.fullName,
      gender: p.gender,
      age: parseInt(formData.age) || 24,
      mobile: formData.mobile,
      email: formData.email.trim(),
      idType: formData.idType,
      idMasked: maskedIdVal,
      idRaw: cleanId,
      bloodGroup: p.bloodGroup || formData.bloodGroup,
      medicalCondition: p.medicalCondition,
      medicalNotes: p.medicalNotes,
      category: category,
      categoryName: p.categoryName || currentCatObj.name,
      venueType: venueType,
      districtName: p.districtName || (venueType === "jaipur" ? "जयपुर पुलिस कमिश्नरेट (Albert Hall Flagship)" : currentDistrictObj.name),
      runnerType: runnerType,
      tshirtSize: venueType === "jaipur" ? (formData.tshirtSize && formData.tshirtSize !== "N/A" ? formData.tshirtSize : "M") : "N/A",
      emergencyContact: `${formData.emergencyContactName || 'Family'} (${formData.emergencyRelation || 'Kin'}: ${pendingPayload.cleanEmergency})`,
      registeredAt: new Date().toLocaleString(),
      bibCollected: false,
      isCompleted: false,
      pledgeTaken: true,
      feeAmount: finalPayload.feeAmount,
      orderId: finalPayload.orderId,
      transactionId: finalPayload.transactionId,
      paymentMethod: finalPayload.paymentMethod,
      paymentStatus: "PAID"
    };

    try {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 } });
    } catch (err) { }

    setRegisteredParticipant(fullRecord);
    if (onRegisterSuccess) {
      onRegisterSuccess(fullRecord);
    }
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadEPassPNG = async (participantParam) => {
    const p = participantParam || registeredParticipant;
    if (!p) return;
    setIsDownloadingPass(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 760;
      const ctx = canvas.getContext("2d");

      // 1. Background fill
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1200, 760);

      // Security outer frame
      ctx.strokeStyle = "#0a1c3d";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 1190, 750);

      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 3;
      ctx.strokeRect(16, 16, 1168, 728);

      // 2. Header Band (Deep Police Navy)
      ctx.fillStyle = "#0a1c3d";
      ctx.fillRect(20, 20, 1160, 120);

      // Header Golden Line
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(20, 137, 1160, 4);

      // Load Official Police Emblem
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/rajasthan-police-logo.png";
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 42, 34, 92, 92);
      }

      // Header Texts
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("RAJASTHAN POLICE MARATHON 2027", 154, 68);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("★ RUN FOR HER • OFFICIAL DIGITAL ENTRY PASS & ADMIT CARD ★", 154, 102);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("गृह विभाग, राजस्थान सरकार", 1150, 64);
      ctx.fillText("प्रमाण पत्र आईडी: " + (p.certificateId || "RJ-POL-2027"), 1150, 96);
      ctx.textAlign = "left";

      // Helper for rounded rectangle across all canvas contexts
      const drawRRect = (x, y, w, h, r) => {
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
      };

      // 3. Left Section: Bib Box (Width: 310, Center: 195)
      const bibBoxX = 40;
      const bibBoxW = 310;
      const bibCenterX = bibBoxX + bibBoxW / 2; // 195

      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#0a1c3d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      drawRRect(bibBoxX, 165, bibBoxW, 380, 12);
      ctx.fill();
      ctx.stroke();

      // Top title bar inside Bib Box
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("आधिकारिक छाती बिब संख्या", bibCenterX, 198);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("OFFICIAL BIB NUMBER", bibCenterX, 218);

      // Dedicated Inner Card for Bib Number (280px wide, centered)
      const badgeX = 55;
      const badgeW = 280;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRRect(badgeX, 236, badgeW, 68, 8);
      ctx.fill();
      ctx.stroke();

      // Dynamic Auto-Scaling for Bib Number (Strictly bounded to 235px max to prevent overflow)
      const bibText = String(p.bibNumber || "RJ-21K-1001").trim();
      let bibFontSize = 34; // Proportional and elegant font size
      ctx.font = `900 ${bibFontSize}px sans-serif`;
      while (ctx.measureText(bibText).width > 235 && bibFontSize > 18) {
        bibFontSize -= 1;
        ctx.font = `900 ${bibFontSize}px sans-serif`;
      }
      ctx.fillStyle = "#0a1c3d";
      ctx.fillText(bibText, bibCenterX, 282);

      // Category Pill (Crimson, Auto-Scaled)
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      drawRRect(badgeX, 318, badgeW, 44, 8);
      ctx.fill();

      const catText = String(p.categoryName || "21 KM Half Marathon").trim();
      let catFontSize = 17;
      ctx.font = `bold ${catFontSize}px sans-serif`;
      while (ctx.measureText(catText).width > 250 && catFontSize > 12) {
        catFontSize -= 1;
        ctx.font = `bold ${catFontSize}px sans-serif`;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillText(catText, bibCenterX, 346);

      // Blood Group & T-shirt in Bib box
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 15px sans-serif";
      const eventModeStr = (p.tshirtSize && p.tshirtSize !== 'N/A') ? `  |  Size: ${p.tshirtSize}` : '';
      ctx.fillText(`रक्त समूह: ${p.bloodGroup || 'B+'}${eventModeStr}`, bibCenterX, 396);

      // Divider Line
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(55, 418);
      ctx.lineTo(335, 418);
      ctx.stroke();

      // Entry Status & Reporting
      ctx.fillStyle = "#059669";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("✓ प्रवेश अधिकृत (Entry Approved)", bibCenterX, 448);
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("रिपोर्टिंग: 3 जन 2027, 05:00 AM", bibCenterX, 474);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("गेट नंबर 2 • अल्बर्ट हॉल", bibCenterX, 498);
      ctx.textAlign = "left";

      // 4. Middle Section: Runner Details
      const detailsX = 380;
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("धावक का पूरा नाम (RUNNER FULL NAME):", detailsX, 195);
      const nameStr = String(p.fullName || "पंजीकृत धावक").trim();
      let nameFontSize = 26;
      ctx.font = `bold ${nameFontSize}px sans-serif`;
      while (ctx.measureText(nameStr).width > 480 && nameFontSize > 18) {
        nameFontSize -= 1;
        ctx.font = `bold ${nameFontSize}px sans-serif`;
      }
      ctx.fillStyle = "#0a1c3d";
      ctx.fillText(nameStr, detailsX, 230);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("आयोजन स्थल (REPORTING VENUE):", detailsX, 275);
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("📍 " + (p.districtName || "जयपुर पुलिस कमिश्नरेट"), detailsX, 305);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("पहचान पत्र (GOVT ID TYPE & NUMBER):", detailsX, 350);
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 19px sans-serif";
      ctx.fillText(`${p.idType || 'Aadhaar'}: ${p.idMasked || 'XXXX-XXXX-1234'}`, detailsX, 378);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("पंजीकृत मोबाइल एवं ईमेल:", detailsX, 420);
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "18px sans-serif";
      ctx.fillText(`📞 ${p.mobile || ''}   ✉️ ${p.email || ''}`, detailsX, 448);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("आपातकालीन संपर्क (EMERGENCY CONTACT):", detailsX, 490);
      ctx.fillStyle = "#991b1b";
      ctx.font = "bold 17px sans-serif";
      ctx.fillText(p.emergencyContact || "पुलिस सहायता केंद्र 112", detailsX, 518);

      // 5. Right Section: Security QR Code
      const qrBoxX = 910;
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, 165, 250, 380, 12);
      ctx.fill();
      ctx.stroke();

      // Dynamically generate QR code payload specifically for this participant to ensure 100% freshness & readability
      const passPayload = JSON.stringify({
        org: "Rajasthan Police Marathon 2027",
        motto: "Run for Her - Women Safety",
        bib: p.bibNumber,
        certId: p.certificateId || p.id || `RPM-2027-${p.bibNumber}`,
        name: p.fullName,
        category: p.categoryName,
        district: p.districtName,
        tshirt: p.tshirtSize || "M",
        bloodGroup: p.bloodGroup || "B+",
        mobile: p.mobile || "",
        medicalAlert: p.medicalCondition || "None",
        status: "OFFICIAL_POLICE_EPASS_CONFIRMED"
      });

      let dynamicQrUrl = null;
      try {
        dynamicQrUrl = await QRCode.toDataURL(passPayload, {
          width: 240,
          margin: 1,
          color: { dark: '#0a1c3d', light: '#ffffff' }
        });
      } catch (qrGenErr) {
        console.warn("Dynamic QR generation fallback to state QR:", qrGenErr);
      }

      const activeQrSrc = dynamicQrUrl || qrCodeDataUrl;
      if (activeQrSrc) {
        const qrImg = new Image();
        qrImg.src = activeQrSrc;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
        });
        if (qrImg.complete && qrImg.naturalWidth > 0) {
          ctx.drawImage(qrImg, qrBoxX + 25, 200, 200, 200);
        }
      }

      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("गेट नंबर 2 पर स्कैन हेतु", qrBoxX + 125, 435);
      ctx.fillStyle = "#64748b";
      ctx.font = "13px sans-serif";
      ctx.fillText("सुरक्षा सत्यापन टोकन", qrBoxX + 125, 460);
      ctx.fillText("RFID चिप युक्त", qrBoxX + 125, 482);
      ctx.textAlign = "left";

      // 6. Payment Receipt Status Strip (Official e-Gras / Challan Receipt)
      ctx.fillStyle = "#ecfdf5";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(40, 565, 1120, 75, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#065f46";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("✓ ई-चालान एवं शासकीय शुल्क रसीद (PAYMENT CONFIRMED)", 60, 598);

      ctx.fillStyle = "#047857";
      ctx.font = "15px sans-serif";
      const feeText = `शुल्क राशि: ₹${p.feeAmount || 199}  |  ऑर्डर आईडी: ${p.orderId || 'ORD2027'}  |  ट्रांजैक्शन: ${p.transactionId || 'TXN-RAJPOL-PAID'}  |  माध्यम: ${p.paymentMethod || 'UPI_QR'}`;
      ctx.fillText(feeText, 60, 624);

      // 7. Official Bottom Footer
      ctx.fillStyle = "#0a1c3d";
      ctx.fillRect(20, 660, 1160, 70);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 17px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★ सेवार्थ कटिबद्धता • राजस्थान पुलिस मुख्यालय, जयपुर ★", 600, 692);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "13px sans-serif";
      ctx.fillText("24×7 महिला गरिमा हेल्पलाइन: 1090  |  आपातकालीन सेवा: 112  |  आधिकारिक पोर्टल: police.rajasthan.gov.in", 600, 715);
      ctx.textAlign = "left";

      // 8. Download directly as PNG file into user's device/local storage
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const safeBib = (p.bibNumber || "RUNNER").replace(/[^a-zA-Z0-9_-]/g, "_");
      downloadLink.download = `RJ-POLICE-MARATHON-EPASS-${safeBib}.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Pass download error:", err);
      alert("ई-पास डाउनलोड करने में त्रुटि। कृपया पुनः प्रयास करें।");
    } finally {
      setIsDownloadingPass(false);
    }
  };

  const handleSendToMyWhatsApp = () => {
    if (!registeredParticipant) return;
    const rawMobile = (registeredParticipant.mobile || '').replace(/\D/g, '');
    const phoneTarget = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const message = 
      `🏛️ *राजस्थान पुलिस मैराथन 2027 'RUN FOR HER'*\n` +
      `★ आधिकारिक डिजिटल ई-पास व प्रवेश पत्र ★\n\n` +
      `आदरणीय *${registeredParticipant.fullName}* जी,\n` +
      `राजस्थान पुलिस मैराथन 2027 में आपका पंजीकरण सफलतापूर्वक पूर्ण हो चुका है।\n\n` +
      `📋 *प्रवेश विवरण (Entry Details):*\n` +
      `🎽 *छाती बिब संख्या (BIB No.):* ${registeredParticipant.bibNumber}\n` +
      `🎯 *दौड़ श्रेणी:* ${registeredParticipant.categoryName}\n` +
      `📍 *स्थान:* ${registeredParticipant.districtName}\n` +
      `📅 *तारीख:* 3 जनवरी 2027, प्रातः 05:00 बजे रिपोर्टिंग\n` +
      (registeredParticipant.tshirtSize && registeredParticipant.tshirtSize !== 'N/A' ? `👕 *टी-शर्ट साइज़:* Size ${registeredParticipant.tshirtSize}\n` : '') +
      `🩸 *रक्त समूह:* ${registeredParticipant.bloodGroup || 'B+'}\n` +
      `🆔 *प्रमाण पत्र टोकन:* ${registeredParticipant.certificateId}\n\n` +
      `⚠️ *महत्वपूर्ण:* एक्सपो केंद्र व मैराथन प्रवेश द्वार पर यह बिब नंबर एवं पहचान पत्र दिखाना अनिवार्य है।\n\n` +
      `ई-पास डाउनलोड व सत्यापन पोर्टल:\n${window.location.origin}/#register\n\n` +
      `_राजस्थान पुलिस — सेवार्थ कटिबद्धता_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phoneTarget 
      ? `https://api.whatsapp.com/send?phone=${phoneTarget}&text=${encoded}` 
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    if (!registeredParticipant) return;
    const text = encodeURIComponent(
      `🏃‍♀️ मैंने राजस्थान पुलिस मैराथन 2027 'RUN FOR HER' में आधिकारिक पंजीकरण कर लिया है!\n\n` +
      `🏅 धावक: ${registeredParticipant.fullName}\n` +
      `🎽 बिब नंबर: ${registeredParticipant.bibNumber}\n` +
      `🎯 श्रेणी: ${registeredParticipant.categoryName}\n` +
      `📍 स्थान: ${registeredParticipant.districtName}\n` +
      `📅 तिथि: 3 जनवरी 2027, प्रातः 06:00 बजे\n\n` +
      `हर कदम नारी सुरक्षा और सम्मान के लिए! आप भी निःशुल्क रजिस्टर करें:\n${window.location.origin}/#register`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrintPass = () => {
    let printStyle = document.getElementById('pass-print-page-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'pass-print-page-style';
      printStyle.innerHTML = `
        @page {
          size: A4 portrait !important;
          margin: 0 !important;
        }
      `;
      document.head.appendChild(printStyle);
    }

    const cleanup = () => {
      const el = document.getElementById('pass-print-page-style');
      if (el) el.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* 1. Official Government Header Breadcrumb */}
      <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
            <button
              onClick={() => onNavigate && onNavigate('home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--police-navy-800)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
            >
              <ArrowLeft size={16} /> मुख्य पृष्ठ
            </button>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span style={{ color: 'var(--crimson-600)', fontWeight: 800 }}>
              आधिकारिक ऑनलाइन धावक पंजीकरण (Run for Her 2027)
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>आधिकारिक पोर्टल • राजस्थान पुलिस</div>
        </div>
      </div>

      <div className="registration-page-container">
        {isSuccess && registeredParticipant ? (
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            {/* SUCCESS STATE: OFFICIAL DIGITAL E-PASS & BIB CARD */}
        
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid var(--police-gold-500)',
            boxShadow: '0 20px 40px rgba(10, 28, 61, 0.12)',
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Success Top Banner */}
            <div className="no-print" style={{
              background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
              color: '#ffffff',
              padding: '28px 24px',
              textAlign: 'center',
              borderBottom: '4px solid var(--police-gold-500)',
              position: 'relative'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid #22c55e',
                color: '#4ade80',
                marginBottom: '12px'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', margin: '0 0 6px 0', color: '#fef08a', fontWeight: 900 }}>
                पंजीकरण सफलतापूर्वक पूर्ण हुआ!
              </h2>
              <div style={{ fontSize: '0.94rem', color: '#e2e8f0' }}>
                राजस्थान पुलिस मैराथन 2027 • <strong>Run for Her</strong> में आपका आधिकारिक ई-पास जारी किया गया है।
              </div>
            </div>

            <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>

              {/* Printable Official Police Runner Bib Card */}
              <div className="print-pass-card" style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)',
                border: '3px solid var(--police-navy-900)',
                borderRadius: '14px',
                padding: '24px',
                position: 'relative',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '28px'
              }}>
                {/* Bib Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--police-gold-500)', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PoliceEmblem size={48} />
                    <div>
                      <div style={{ fontWeight: 900, color: 'var(--police-navy-900)', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                        RAJASTHAN POLICE MARATHON 2027
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--crimson-600)', fontWeight: 800 }}>
                        ★ RUN FOR HER • OFFICIAL ENTRY PASS ★
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StateEmblemOfIndia size={40} />
                  </div>
                </div>

                {/* Bib Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>

                  {/* Left: Huge Bib Number & Category */}
                  <div style={{ textAlign: 'center', background: 'var(--police-navy-50)', padding: '20px', borderRadius: '12px', border: '1.5px dashed var(--police-navy-800)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                      आधिकारिक छाती बिब संख्या (Bib Number)
                    </div>
                    <div style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--police-navy-950)', letterSpacing: '2px', margin: '6px 0' }}>
                      {registeredParticipant.bibNumber}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--police-navy-900)',
                      color: 'var(--police-gold-400)',
                      padding: '4px 14px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.86rem'
                    }}>
                      {registeredParticipant.categoryName}
                    </div>
                  </div>

                  {/* Middle: Runner Identity & Medical Badge */}
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>धावक का नाम (Full Name)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--police-navy-900)' }}>{registeredParticipant.fullName}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>रक्त समूह (Blood Group)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--crimson-600)' }}>
                          {registeredParticipant.bloodGroup || 'B+'}
                        </div>
                      </div>
                      <div>
                        {registeredParticipant.tshirtSize && registeredParticipant.tshirtSize !== 'N/A' ? (
                          <>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>टी-शर्ट साइज़</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                              Size {registeredParticipant.tshirtSize}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>इवेंट प्रकार</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                              कम्युनिटी रन
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>आयोजन स्थल (Reporting Venue)</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--police-navy-800)' }}>
                        📍 {registeredParticipant.districtName}
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', background: 'var(--police-navy-50)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.76rem', color: 'var(--police-navy-900)', border: '1px solid var(--border-subtle)' }}>
                      <div><strong>पहचान पत्र (Govt ID):</strong> {registeredParticipant.idType || 'Aadhaar'} ({registeredParticipant.idMasked || 'XXXX-XXXX-1234'})</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}><strong>आधिकारिक ईमेल:</strong> {registeredParticipant.email}</div>
                    </div>

                    {registeredParticipant.medicalCondition && registeredParticipant.medicalCondition !== "None / Fully Fit" && (
                      <div style={{
                        marginTop: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: '#991b1b',
                        fontWeight: 700
                      }}>
                        ⚠️ मेडिकल अलर्ट: {registeredParticipant.medicalCondition}
                      </div>
                    )}
                  </div>

                  {/* Right: Security QR Code for Gate Scanner */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px',
                      background: '#ffffff',
                      border: '2px solid var(--police-gold-500)',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="Security Entry QR Token" style={{ width: '130px', height: '130px', display: 'block' }} />
                      ) : (
                        <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                          QR कोड लोड हो रहा है...
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '6px' }}>
                      गेट नंबर 2 पर स्कैन हेतु
                    </div>
                  </div>
                </div>

                {/* Bib Footer Callout */}
                <div style={{
                  marginTop: '18px',
                  paddingTop: '12px',
                  borderTop: '1px dashed var(--border-medium)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)'
                }}>
                  <div>
                    <strong>प्रमाण पत्र आईडी:</strong> {registeredParticipant.certificateId}
                  </div>
                  <div>
                    <strong>रिपोर्टिंग समय:</strong> 3 जनवरी 2027, प्रातः 05:00 बजे
                  </div>
                  <div style={{ color: 'var(--police-gold-700)', fontWeight: 800 }}>
                    ★ सेवार्थ कटिबद्धता ★
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Notice Banner */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>📲</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
                      ई-पास आपकी डिवाइस (Downloads) में स्वतः सुरक्षित किया जा रहा है!
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                      अपने पंजीकृत मोबाइल <strong>+91 {registeredParticipant.mobile}</strong> के व्हाट्सएप पर 1-क्लिक में रसीद सुरक्षित करें:
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendToMyWhatsApp}
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)'
                  }}
                  title="सीधे अपने व्हाट्सएप पर ई-पास प्राप्त करें"
                >
                  <Share2 size={16} /> अपने व्हाट्सएप पर ई-पास भेजें
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="action-buttons-row no-print" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={() => handleDownloadEPassPNG()}
                  disabled={isDownloadingPass}
                  className="btn-primary"
                  style={{
                    padding: '12px 22px',
                    fontSize: '0.92rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={18} /> {isDownloadingPass ? "डाउनलोड हो रहा है..." : "ई-पास डाउनलोड करें (PNG)"}
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: '1.5px solid #15803d',
                    borderRadius: '6px',
                    padding: '12px 22px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                  }}
                  title="मैराथन आमंत्रण दोस्तों के साथ व्हाट्सएप पर शेयर करें"
                >
                  <Share2 size={18} /> मित्रों के साथ शेयर करें
                </button>

                <button
                  onClick={handlePrintPass}
                  className="btn-navy"
                  style={{
                    padding: '12px 20px',
                    fontSize: '0.92rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={18} /> A4 प्रिंट / सेव करें
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('route-schedule')}
                  className="btn-navy"
                  style={{ padding: '12px 24px', fontSize: '0.94rem' }}
                >
                  दौड़ रूट एवं समय-सारणी देखें &rarr;
                </button>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setRegisteredParticipant(null);
                    setFormData(prev => ({
                      ...prev,
                      fullName: "",
                      mobile: "",
                      email: "",
                      hasMedicalIssue: false,
                      medicalConditions: [],
                      medicalNotes: ""
                    }));
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-body)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + नया पंजीकरण करें
                </button>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setActiveTab('find');
                    setRegisteredParticipant(null);
                  }}
                  style={{
                    background: 'var(--police-navy-50)',
                    border: '1px solid var(--police-navy-300)',
                    color: 'var(--police-navy-900)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Search size={15} /> अन्य ई-पास खोजें
                </button>
              </div>

            </div>
          </div>
          </div>
        ) : (
          <div>
            {/* Navigation Tabs: New Registration vs Find My E-Pass */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                background: '#ffffff',
                padding: '6px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <button
                  onClick={() => setActiveTab('register')}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'register' ? 'var(--police-navy-900)' : 'transparent',
                    color: activeTab === 'register' ? '#ffffff' : 'var(--police-navy-800)',
                    fontWeight: 800,
                    fontSize: '0.94rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FileText size={18} color={activeTab === 'register' ? '#fde68a' : 'currentColor'} />
                  <span>नया धावक पंजीकरण (New Registration)</span>
                </button>

                <button
                  onClick={() => setActiveTab('find')}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'find' ? 'var(--police-navy-900)' : 'transparent',
                    color: activeTab === 'find' ? '#ffffff' : 'var(--police-navy-800)',
                    fontWeight: 800,
                    fontSize: '0.94rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Search size={18} color={activeTab === 'find' ? '#fde68a' : 'currentColor'} />
                  <span>ई-पास खोजें / पुनः डाउनलोड (Find My E-Pass)</span>
                  <span style={{
                    background: activeTab === 'find' ? '#fde68a' : 'var(--police-gold-100)',
                    color: activeTab === 'find' ? '#0a1c3d' : 'var(--police-navy-900)',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 900
                  }}>
                    त्वरित खोज
                  </span>
                </button>
              </div>

              {activeTab === 'find' ? (
                /* 2. FIND EXISTING E-PASS INTERFACE */
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid var(--border-medium)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
              color: '#ffffff',
              padding: '24px',
              borderBottom: '3px solid var(--police-gold-500)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <PoliceEmblem size={44} />
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px 0', color: '#fef08a', fontWeight: 900 }}>
                    आधिकारिक ई-पास खोज एवं पुनः डाउनलोड केंद्र
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                    Rajasthan Police Marathon 2027 • अपना पंजीकृत ई-पास खोजें व प्रिंट करें
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('register')}
                className="btn-gold"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                + नया पंजीकरण करें
              </button>
            </div>

            <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
              {/* Search Form */}
              <form onSubmit={handleFindPass} style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                  अपना पंजीकृत 10-अंकीय मोबाइल नंबर या बिब संख्या दर्ज करें:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <input
                      type="text"
                      placeholder="उदा. 9829012345 या RJ-21K-1048"
                      value={findQuery}
                      onChange={(e) => setFindQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 38px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--police-navy-300)',
                        fontSize: '0.96rem',
                        fontWeight: 600
                      }}
                    />
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isFinding}
                    style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                  >
                    {isFinding ? "खोज जारी है..." : "ई-पास खोजें"}
                  </button>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  💡 सुझाव: फॉर्म भरते समय दिया गया 10 अंकों का मोबाइल नंबर दर्ज करें।
                </div>
              </form>

              {/* Loading Indicator while Searching */}
              {isFinding && (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.94rem'
                }}>
                  🔍 ई-पास रिकॉर्ड खोजा जा रहा है, कृपया प्रतीक्षा करें...
                </div>
              )}

              {/* Search Results - Not Found */}
              {hasSearched && !isFinding && findResults.length === 0 && (
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '10px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b', marginBottom: '4px' }}>
                    कोई ई-पास रिकॉर्ड नहीं मिला
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#7f1d1d', margin: '0 0 16px 0' }}>
                    {findSearchError || `दर्ज किए गए विवरण "${findQuery}" से संबंधित कोई अधिकृत ई-पास नहीं मिला।`}
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: '0.9rem', fontWeight: 800 }}
                  >
                    + नया पंजीकरण फॉर्म खोलें
                  </button>
                </div>
              )}

              {/* Found Masked Records - Requires OTP to Unlock */}
              {!isFinding && findResults.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--police-navy-950)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={20} color="#047857" />
                      <span>अधिकृत रिकॉर्ड प्राप्त हुआ (सत्यापन आवश्यक):</span>
                    </div>
                  </div>

                  {findResults.map((r, i) => {
                    const isSelected = selectedPassToUnlock?.passId === r.passId || findResults.length === 1;
                    return (
                      <div
                        key={r.passId || r.bibNumber || i}
                        style={{
                          background: '#ffffff',
                          border: isSelected ? '2px solid #0f172a' : '1.5px solid var(--border-medium)',
                          borderLeft: '5px solid #0f172a',
                          borderRadius: '12px',
                          padding: '20px 22px',
                          marginBottom: '16px',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                        }}
                      >
                        {/* Header Details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                          <div>
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                              पंजीकृत धावक का नाम:
                            </span>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em', marginTop: '2px' }}>
                              {r.maskedName}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            color: '#ffffff',
                            background: '#0f172a',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontFamily: 'monospace'
                          }}>
                            {r.bibNumber}
                          </span>
                        </div>

                        {/* Summary Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '10px',
                          background: '#f8fafc',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          marginBottom: '16px',
                          fontSize: '0.84rem'
                        }}>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 700 }}>पंजीकृत मोबाइल:</span>
                            <div style={{ fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                              {r.maskedMobile}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 700 }}>रेस श्रेणी:</span>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>
                              {r.categoryName}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 700 }}>इवेंट वेन्यू / जिला:</span>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>
                              {r.districtName}
                            </div>
                          </div>
                        </div>

                        {/* OTP Unlock Section */}
                        {(!passOtpSent || selectedPassToUnlock?.passId !== r.passId) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPassToUnlock(r);
                              handleSendPassUnlockOtp(r);
                            }}
                            disabled={isSendingPassOtp}
                            className="btn-primary"
                            style={{
                              width: '100%',
                              padding: '12px 18px',
                              fontSize: '0.94rem',
                              fontWeight: 900,
                              justifyContent: 'center',
                              background: '#0f172a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <KeyRound size={18} />
                            <span>{isSendingPassOtp ? "OTP भेजा जा रहा है..." : "ई-पास डाउनलोड करने हेतु OTP प्राप्त करें"}</span>
                          </button>
                        ) : (
                          <div style={{
                            background: '#ffffff',
                            border: '1.5px solid #0f172a',
                            borderRadius: '10px',
                            padding: '16px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)'
                          }}>
                            {/* Demo Toast */}
                            {passOtpToast && (
                              <div style={{
                                background: '#ecfdf5',
                                border: '1px solid #86efac',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                marginBottom: '12px',
                                fontSize: '0.8rem',
                                color: '#166534',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '6px'
                              }}>
                                <div>
                                  📩 सैंडबॉक्स SMS: <strong>{passOtpToast.mobile}</strong> पर भेजा गया OTP:
                                </div>
                                <div style={{
                                  background: '#ffffff',
                                  border: '1px solid #22c55e',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontWeight: 900,
                                  fontSize: '1rem',
                                  letterSpacing: '2px',
                                  color: '#15803d'
                                }}>
                                  {passOtpToast.otp}
                                </div>
                              </div>
                            )}

                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                              📲 पंजीकृत मोबाइल <strong>{r.maskedMobile}</strong> पर भेजा गया 6-अंकीय OTP दर्ज करें:
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="• • • • • •"
                                value={passEnteredOtp}
                                onChange={(e) => setPassEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                style={{
                                  flex: 1,
                                  minWidth: '160px',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #0f172a',
                                  fontSize: '1.1rem',
                                  fontFamily: 'monospace',
                                  letterSpacing: '4px',
                                  textAlign: 'center',
                                  fontWeight: 900
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => handleSendPassUnlockOtp(r)}
                                disabled={passOtpTimer > 0 || isSendingPassOtp}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  background: passOtpTimer > 0 ? '#f1f5f9' : '#ffffff',
                                  color: passOtpTimer > 0 ? '#94a3b8' : '#0f172a',
                                  fontSize: '0.82rem',
                                  fontWeight: 800,
                                  cursor: passOtpTimer > 0 ? 'not-allowed' : 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {passOtpTimer > 0 ? `पुनः OTP (${passOtpTimer}s)` : "पुनः OTP भेजें"}
                              </button>
                            </div>

                            {passOtpError && (
                              <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={14} />
                                <span>{passOtpError}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleVerifyPassUnlockOtp}
                              disabled={isVerifyingPassOtp || passEnteredOtp.length < 4}
                              className="btn-primary"
                              style={{
                                width: '100%',
                                padding: '12px 18px',
                                fontSize: '0.94rem',
                                fontWeight: 900,
                                justifyContent: 'center',
                                background: '#16a34a',
                                borderColor: '#16a34a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: (isVerifyingPassOtp || passEnteredOtp.length < 4) ? 'not-allowed' : 'pointer',
                                opacity: (isVerifyingPassOtp || passEnteredOtp.length < 4) ? 0.7 : 1
                              }}
                            >
                              <Unlock size={18} />
                              <span>{isVerifyingPassOtp ? "सत्यापन जारी है..." : "सत्यापित करें व आधिकारिक ई-पास डाउनलोड करें"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Information Advisory */}
              <div style={{
                marginTop: '28px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 800, color: 'var(--police-navy-900)', marginBottom: '4px' }}>
                  ℹ️ महत्वपूर्ण सूचना (Official Advisory):
                </div>
                • यह ई-पास 1 व 2 जनवरी 2027 को आधिकारिक बिब व रनिंग किट प्राप्त करने हेतु अनिवार्य है।<br />
                • 3 जनवरी 2027 को दौड़ स्थल (अल्बर्ट हॉल / जिला केंद्र) पर प्रवेश इसी ई-पास के डिजिटल अथवा प्रिंटेड रूप में दिखाने पर दिया जाएगा।
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM (NORMAL FULL PAGE) */
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>

            {/* Form Top Branding Banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
              color: '#ffffff',
              padding: '28px 24px',
              borderBottom: '3px solid var(--police-gold-500)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <PoliceEmblem size={52} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--police-gold-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    राजस्थान पुलिस मुख्यालय, जयपुर | राज्यव्यापी जन-अभियान • 3 जनवरी 2027
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.35rem, 2.6vw, 1.85rem)', margin: '4px 0', color: '#ffffff', fontWeight: 900 }}>
                    ऑनलाइन धावक पंजीकरण पोर्टल (Run for Her)
                  </h1>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                    हर कदम नारी सुरक्षा, सम्मान व सशक्तिकरण के लिए • अधिकृत ई-पास एवं आरएफआईडी बिब
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }} className="d-tablet-block"><div style={{ fontSize: '0.82rem', color: '#fef08a', fontWeight: 700 }}>इवेंट तिथि: 3 जनवरी 2027</div></div>
            </div>

            {/* Error Callout if any (Accessible WCAG Alert) */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  background: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  border: '1.5px solid #fecaca',
                  borderLeftWidth: '5px',
                  borderRadius: '6px',
                  margin: '16px 24px',
                  padding: '14px 20px',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
                }}
              >
                <AlertCircle size={20} color="#dc2626" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ padding: 'clamp(20px, 3.5vw, 36px)' }}>
              {/* Anti-Bot Invisible Honeypot Field */}
              <input type="text" name="botTrap" value={formData.botTrap || ""} onChange={(e) => setFormData(prev => ({ ...prev, botTrap: e.target.value }))} style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} tabIndex={-1} autoComplete="off" />

              {/* SECTION 1: दौड़ श्रेणी एवं स्थान चयन (CATEGORY & VENUE) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid var(--police-navy-50)', paddingBottom: '8px' }}>
                  <span style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>1</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                    दौड़ श्रेणी एवं आयोजन स्थल चुनें (Race Category & Venue)
                  </h3>
                </div>

                {/* Venue Toggle */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                    आप कहाँ दौड़ना चाहते हैं? (Select Participation Location):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    <div
                      onClick={() => handleSelectVenueType("jaipur")}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: venueType === "jaipur" ? '2px solid var(--police-gold-500)' : '1px solid var(--border-subtle)',
                        background: venueType === "jaipur" ? 'var(--police-navy-50)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="venueType"
                        checked={venueType === "jaipur"}
                        onChange={() => handleSelectVenueType("jaipur")}
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--police-navy-900)', fontSize: '0.94rem' }}>
                          जयपुर मुख्य फ्लैगशिप रन (Albert Hall)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          अल्बर्ट हॉल से जेएलएन मार्ग • डीजीपी राजस्थान द्वारा फ्लैग-ऑफ
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => handleSelectVenueType("district")}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: venueType === "district" ? '2px solid var(--police-gold-500)' : '1px solid var(--border-subtle)',
                        background: venueType === "district" ? 'var(--police-navy-50)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="venueType"
                        checked={venueType === "district"}
                        onChange={() => handleSelectVenueType("district")}
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--police-navy-900)', fontSize: '0.94rem' }}>
                          अन्य जिला पुलिस लाइन ({OTHER_DISTRICTS.length} जिले)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          अपने स्थानीय ज़िला मुख्यालय / पुलिस लाइन में एक साथ रन
                        </div>
                      </div>
                    </div>
                  </div>

                  {venueType === "district" && (
                    <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                        अपना जिला / पुलिस यूनिट चुनें:
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="form-control"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                      >
                        {OTHER_DISTRICTS.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Race Category Cards Grid */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                    दौड़ श्रेणी चुनें (Select Race Distance):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {availableCategories.map(cat => {
                      const isSelected = category === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid var(--police-navy-900)' : '1px solid var(--border-medium)',
                            background: isSelected ? 'var(--police-navy-50)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                            position: 'relative',
                            transition: 'all 0.15s'
                          }}
                        >
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: 'var(--police-navy-900)',
                              color: '#ffffff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--police-navy-800)', textTransform: 'uppercase' }}>
                              {cat.distance}
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.02rem', color: 'var(--police-navy-950)', margin: '4px 0' }}>
                              {cat.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                              {cat.desc || cat.description}
                            </div>
                          </div>

                          {/* Flagship Prize Money or Perks Badge (ONLY for Jaipur - Dark Black Theme) */}
                          {venueType === "jaipur" && cat.prizes && (
                            <div style={{
                              marginBottom: '10px',
                              padding: '6px 10px',
                              background: '#0f172a',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span>🏆 1st: {cat.prizes[0].amount} • 2nd: {cat.prizes[1].amount} • 3rd: {cat.prizes[2].amount}</span>
                            </div>
                          )}

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '10px',
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '8px'
                          }}>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>निर्धारित शुल्क:</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0a1c3d' }}>
                              {cat.fee || (cat.id === '21k' ? '₹499' : cat.id === '10k' ? '₹399' : '₹199')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: व्यक्तिगत विवरण (PERSONAL DETAILS) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid var(--police-navy-50)', paddingBottom: '8px' }}>
                  <span style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>2</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                    धावक का व्यक्तिगत विवरण (Runner Personal Information)
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      पूरा नाम (Full Name) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. सुनीता चौधरी (Sunita Choudhary)"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      लिंग (Gender) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="Female">महिला (Female)</option>
                      <option value="Male">पुरुष (Male)</option>
                      <option value="Other">अन्य (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      मोबाइल नंबर (Mobile Number) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="input-mobile-number"
                        type="tel"
                        required
                        disabled={isMobileVerified}
                        maxLength={10}
                        placeholder="उदा. 9829012345"
                        value={formData.mobile}
                        onChange={(e) => {
                          setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') });
                          if (isMobileVerified) setIsMobileVerified(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isMobileVerified 
                            ? '1.5px solid #16a34a' 
                            : (formData.mobile && !/^[6-9]/.test(formData.mobile) ? '1.5px solid #dc2626' : '1px solid var(--border-medium)'),
                          fontSize: '0.92rem',
                          background: isMobileVerified ? '#f0fdf4' : '#ffffff',
                          fontWeight: isMobileVerified ? 700 : 400
                        }}
                      />

                      {!isMobileVerified ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, '')) || otpTimer > 0}
                          style={{
                            background: /^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, '')) ? 'var(--police-navy-900)' : '#94a3b8',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0 16px',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: /^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, '')) ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Shield size={14} color="#fde68a" />
                          <span>{otpTimer > 0 ? `पुनः भेजें (${otpTimer}s)` : (otpSent ? 'पुनः भेजें' : 'ओटीपी भेजें')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleChangeMobileNumber}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            padding: '0 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          बदलें
                        </button>
                      )}
                    </div>

                    {/* Verification Status Badge or Helper Text */}
                    {isMobileVerified ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#166534',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        marginTop: '6px'
                      }}>
                        <CheckCircle2 size={15} color="#16a34a" />
                        <span>मोबाइल नंबर सफलतापूर्वक सत्यापित (Verified by Security OTP)</span>
                      </div>
                    ) : (
                      <>
                        {formData.mobile && !/^[6-9]/.test(formData.mobile) ? (
                          <div style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                            कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें।
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            पंजीकरण सत्यापन हेतु सुरक्षा ओटीपी दर्ज करें।
                          </div>
                        )}
                      </>
                    )}

                    {/* OTP Entry Card (Visible when OTP is sent & not yet verified) */}
                    {otpSent && !isMobileVerified && (
                      <div id="mobile-otp-section" style={{
                        marginTop: '10px',
                        padding: '14px',
                        background: '#f8fafc',
                        border: '1.5px solid var(--police-navy-800)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(10, 28, 61, 0.08)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Shield size={16} color="var(--police-navy-950)" />
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--police-navy-950)' }}>
                            6-अंकीय सुरक्षा ओटीपी दर्ज करें:
                          </span>
                        </div>

                        {otpToast && (
                          <div style={{
                            background: '#ecfdf5',
                            border: '1px solid #86efac',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            marginBottom: '10px',
                            fontSize: '0.8rem',
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '6px'
                          }}>
                            <div>
                              📩 सुरक्षा सैंडबॉक्स: <strong>+91 {otpToast.mobile}</strong> पर भेजा गया OTP:
                            </div>
                            <div style={{
                              background: '#ffffff',
                              border: '1px solid #22c55e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontWeight: 900,
                              fontSize: '1rem',
                              letterSpacing: '2px',
                              color: '#15803d'
                            }}>
                              {otpToast.otp}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="• • • • • •"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            style={{
                              width: '140px',
                              padding: '8px 12px',
                              fontSize: '1.1rem',
                              fontWeight: 900,
                              letterSpacing: '4px',
                              textAlign: 'center',
                              borderRadius: '6px',
                              border: '1.5px solid var(--police-navy-800)',
                              fontFamily: 'monospace',
                              background: '#ffffff'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            style={{
                              background: '#15803d',
                              color: '#ffffff',
                              border: 'none',
                              padding: '9px 18px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.86rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CheckCircle2 size={15} /> सत्यापित करें
                          </button>
                        </div>

                        {otpError && (
                          <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 800, marginTop: '8px' }}>
                            {otpError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      जन्म तिथि (Date of Birth) <span style={{ color: '#ef4444' }}>*</span>
                      {formData.age ? (
                        <span style={{ marginLeft: '8px', color: '#475569', fontWeight: 600, fontSize: '0.82rem' }}>
                          (आयु: {formData.age} वर्ष)
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="date"
                      required
                      max="2017-01-01"
                      min="1940-01-01"
                      value={formData.dob}
                      onChange={handleDobChange}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आधिकारिक ईमेल पता (Email Address) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="उदा. runner@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      आधिकारिक ई-प्रमाण पत्र एवं ई-पास सीधे इसी ईमेल पर प्रेषित किए जाएंगे।
                    </div>
                  </div>

                  {/* Photo ID Proof Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      पहचान पत्र प्रकार (Govt Photo ID Proof) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <select
                      value={formData.idType}
                      onChange={(e) => {
                        setShowAadhaar(false);
                        setFormData({ ...formData, idType: e.target.value, idNumber: "" });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="Aadhaar">आधार कार्ड (Aadhaar Card)</option>
                      <option value="PAN">पैन कार्ड (PAN Card)</option>
                      <option value="Voter ID">मतदाता पहचान पत्र (Voter ID)</option>
                    </select>
                  </div>

                  {/* Photo ID Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      {formData.idType === "Aadhaar" ? "आधार कार्ड संख्या" : formData.idType === "PAN" ? "पैन कार्ड संख्या" : "मतदाता पहचान पत्र संख्या"} <span style={{ color: '#ef4444' }}>*</span>:
                    </label>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        required
                        maxLength={formData.idType === "Aadhaar" ? 14 : 16}
                        placeholder={formData.idType === "Aadhaar" ? "XXXX XXXX 1048" : formData.idType === "PAN" ? "उदा. ABCDE1234F" : "उदा. RJ01234567"}
                        value={
                          formData.idType === "Aadhaar"
                            ? formatAadhaarDisplay(formData.idNumber, showAadhaar)
                            : formData.idNumber
                        }
                        onChange={(e) => {
                          let val = e.target.value;
                          if (formData.idType === "Aadhaar") {
                            const newRaw = deriveRawAadhaar(formData.idNumber, val, showAadhaar);
                            setFormData({ ...formData, idNumber: newRaw });
                          } else {
                            val = val.toUpperCase().trim();
                            setFormData({ ...formData, idNumber: val });
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: formData.idType === "Aadhaar" ? '10px 85px 10px 12px' : '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          fontSize: '0.94rem',
                          fontFamily: 'monospace',
                          letterSpacing: formData.idType === "Aadhaar" ? '0.08em' : 'normal',
                          background: '#ffffff'
                        }}
                      />
                      {formData.idType === "Aadhaar" && (
                        <button
                          type="button"
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          title={showAadhaar ? "आधार संख्या मास्क करें (Mask)" : "आधार संख्या देखें (Show)"}
                          aria-label={showAadhaar ? "आधार संख्या मास्क करें" : "आधार संख्या देखें"}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            color: '#334155',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '5px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          {showAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{showAadhaar ? "छिपाएं" : "देखें"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      धावक वर्गीकरण (Runner Classification):
                    </label>
                    <select
                      value={runnerType}
                      onChange={(e) => setRunnerType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="Citizen Runner">सामान्य नागरिक धावक (Citizen)</option>
                      <option value="Police Officer / Personnel">पुलिस कर्मी / अधिकारी (Police Personnel)</option>
                      <option value="College / School Student">छात्र / युवा धावक (Student)</option>
                      <option value="NCC / NSS / Scouts Cadet">NCC / NSS / स्काउट्स कैडेट</option>
                      <option value="Corporate / NGO Runner">संस्थागत / कॉर्पोरेट धावक</option>
                    </select>
                  </div>

                  {venueType === "jaipur" && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                        टी-शर्ट साइज़ (Official Dry-Fit Tee) <span style={{ color: '#ef4444' }}>*</span>:
                      </label>
                      <select
                        value={formData.tshirtSize}
                        onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                      >
                        <option value="XS">XS (Chest 34")</option>
                        <option value="S">S (Chest 36")</option>
                        <option value="M">M (Chest 38")</option>
                        <option value="L">L (Chest 40")</option>
                        <option value="XL">XL (Chest 42")</option>
                        <option value="XXL">XXL (Chest 44")</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: स्वास्थ्य, रक्त समूह एवं पूर्व बीमारी विवरण (HEALTH & MEDICAL DECLARATION - USER REQUEST) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid var(--police-navy-50)', paddingBottom: '8px' }}>
                  <span style={{
                    background: 'var(--police-navy-900)',
                    color: '#ffffff',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>3</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--police-navy-950)', fontWeight: 800 }}>
                      स्वास्थ्य, रक्त समूह एवं आपातकालीन विवरण (Medical & Emergency Safety)
                    </h3>
                  </div>
                </div>

                {/* Blood Group Selection - Dropdown Menu */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '8px' }}>
                    रक्त समूह (Blood Group) <span style={{ color: '#ef4444' }}>*</span>:
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-medium)',
                      fontSize: '0.94rem',
                      fontWeight: 700,
                      color: 'var(--police-navy-900)',
                      background: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- रक्त समूह चुनें (Select Blood Group) --</option>
                    {bloodGroupOptions.map(bg => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    * यह जानकारी आपातकालीन स्थिति में 108 एम्बुलेंस और ऑन-ट्रैक मेडिकल टीम के लिए अनिवार्य है।
                  </div>
                </div>

                {/* Pre-existing Medical Condition / Illness Toggle */}
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>
                      क्या आपको पूर्व से कोई स्वास्थ्य संबंधी समस्या या बीमारी है? (Pre-existing Health Condition):
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: '#16a34a' }}>
                      <input
                        type="radio"
                        name="hasMedicalIssue"
                        checked={!formData.hasMedicalIssue}
                        onChange={() => setFormData({ ...formData, hasMedicalIssue: false, medicalConditions: [], medicalNotes: "" })}
                      />
                      नहीं, मैं पूर्णतः स्वस्थ एवं फिट हूँ (No Condition / Fully Fit)
                    </label>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: '#dc2626' }}>
                      <input
                        type="radio"
                        name="hasMedicalIssue"
                        checked={formData.hasMedicalIssue}
                        onChange={() => setFormData({ ...formData, hasMedicalIssue: true })}
                      />
                      हाँ, मुझे पूर्व स्वास्थ्य स्थिति है (Yes, I have a condition)
                    </label>
                  </div>

                  {formData.hasMedicalIssue && (
                    <div style={{
                      marginTop: '12px',
                      padding: '16px',
                      background: '#ffffff',
                      border: '1.5px solid #fecaca',
                      borderRadius: '8px',
                      animation: 'fadeIn 0.2s ease-in'
                    }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#991b1b', marginBottom: '10px' }}>
                        लागू होने वाली स्वास्थ्य स्थितियों पर टिक करें (Select all that apply):
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                        {medicalConditionOptions.map(opt => {
                          const isChecked = formData.medicalConditions.includes(opt.label);
                          return (
                            <label
                              key={opt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: isChecked ? '1.5px solid #dc2626' : '1px solid var(--border-medium)',
                                background: isChecked ? '#fef2f2' : '#ffffff',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: isChecked ? 800 : 600,
                                color: isChecked ? '#991b1b' : 'var(--text-body)'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleConditionToggle(opt.label)}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                          विशेष चिकित्सकीय निर्देश / दवा विवरण (Medical Notes / Allergies / Inhaler Details):
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. दमा हेतु इनहेलर हमेशा साथ रहता है / पेनिसिलिन से एलर्जी"
                          value={formData.medicalNotes}
                          onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Kin Contact Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आपातकालीन संपर्क व्यक्ति का नाम (Kin Name) <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. रमेश चौधरी (पिता)"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      संबंध (Relationship):
                    </label>
                    <select
                      value={formData.emergencyRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    >
                      <option value="पिता (Father)">पिता (Father)</option>
                      <option value="माता (Mother)">माता (Mother)</option>
                      <option value="पति/पत्नी (Spouse)">पति / पत्नी (Spouse)</option>
                      <option value="भाई/बहन (Sibling)">भाई / बहन (Sibling)</option>
                      <option value="अभिभावक/मित्र (Guardian/Friend)">अभिभावक / मित्र (Guardian / Friend)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--police-navy-900)', marginBottom: '6px' }}>
                      आपातकालीन 10-अंकीय मोबाइल नंबर <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="उदा. 9829099887"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '') })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: आधिकारिक कानूनी एवं चिकित्सा फिटनेस घोषणा (LEGAL & MEDICAL INDEMNITY DECLARATION) */}
              <div style={{
                background: 'var(--police-navy-50)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: '10px',
                padding: '18px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <input
                    type="checkbox"
                    id="fitness-indemnity-check"
                    required
                    checked={formData.acceptedFitness}
                    onChange={(e) => setFormData({ ...formData, acceptedFitness: e.target.checked })}
                    style={{ marginTop: '3px', cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <label htmlFor="fitness-indemnity-check" style={{ fontSize: '0.83rem', color: 'var(--police-navy-950)', lineHeight: 1.55, cursor: 'pointer' }}>
                    <strong>शारीरिक स्वास्थ्य एवं कानूनी क्षतिपूर्ति घोषणा (Athlete Medical Indemnity) *:</strong> मैं प्रमाणित करता/करती हूँ कि मैं शारीरिक रूप से पूर्णतः स्वस्थ हूँ और इस मैराथन में भाग लेने हेतु चिकित्सकीय रूप से सक्षम हूँ। दौड़ के दौरान स्वास्थ्य कारणों से होने वाली किसी भी अप्रिय स्थिति के लिए मैं स्वयं उत्तरदायी रहूँगा/रहूँगी। मैं समझता/समझती हूँ कि निर्धारित कट-ऑफ समय के बाद रूट पर सामान्य यातायात बहाल कर दिया जाएगा।
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="pledge-check"
                    required
                    checked={formData.acceptedPledge}
                    onChange={(e) => setFormData({ ...formData, acceptedPledge: e.target.checked })}
                    style={{ marginTop: '3px', cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <label htmlFor="pledge-check" style={{ fontSize: '0.83rem', color: '#7c2d12', lineHeight: 1.55, cursor: 'pointer' }}>
                    <strong>महिला सुरक्षा व सम्मान संकल्प (Run for Her Pledge) *:</strong> मैं राजस्थान पुलिस के राज्यव्यापी 'Run for Her' अभियान से जुड़कर यह दृढ़ संकल्प लेता/लेती हूँ कि मैं समाज में प्रत्येक महिला, बेटी एवं बहन के सम्मान, गरिमा तथा भयमुक्त परिवेश के निर्माण में सदैव सक्रिय योगदान दूंगा/दूंगी।
                  </label>
                </div>
              </div>

              {/* Government Official Fee Summary Row */}
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  textAlign: 'left'
                }}>
                  <div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                      निर्धारित शासकीय पंजीकरण शुल्क (Payable Application Fee):
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0a1c3d', marginTop: '2px' }}>
                      {category === '21k' ? '₹499.00' : category === '10k' ? '₹399.00' : '₹199.00'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569', textAlign: 'right' }}>
                    <div>स्वीकृत माध्यम: <strong>UPI / Bharat QR / NetBanking / Cards</strong></div>
                    <div style={{ color: '#059669', fontWeight: 700, marginTop: '2px' }}>✓ e-Gras / SBI ePay शासकीय गेटवे (0% अतिरिक्त शुल्क)</div>
                  </div>
                </div>

                {/* Submit CTA Bar */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                      padding: '16px 36px',
                      fontSize: '1.08rem',
                      fontWeight: 900,
                      width: '100%',
                      maxWidth: '480px',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    {isSubmitting ? (
                      <span>प्रक्रियाधीन है... कृपया प्रतीक्षा करें</span>
                    ) : (
                      <span>पंजीकरण एवं ऑनलाइन शुल्क भुगतान करें (Pay Fee & Register) &rarr;</span>
                    )}
                  </button>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  पंजीकरण उपरांत आधिकारिक डिजिटल ई-पास व रसीद जारी की जाएगी।
                </div>
              </div>

            </form>
          </div>
              )}
            </div>

            
            
        )}
      </div>

      
      {/* Desktop Responsive Layout Styles */}
      <style>{`
        .registration-page-container {
          width: 100%;
          max-width: 1120px;
          margin: 24px auto 48px auto;
          padding: 0 16px;
        }
        @media (min-width: 640px) {
          .registration-page-container {
            padding: 0 24px;
          }
        }
      `}</style>
      {/* Official Government Electronic Payment Gateway Modal */}
      <GovPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        runnerData={formData}
        category={category}
        categoryName={currentCatObj?.name || "राजस्थान पुलिस मैराथन 2027"}
        feeAmount={category === "21k" ? 499 : category === "10k" ? 399 : 199}
      />
    </div>
  );
}
