import React, { useState, useEffect } from 'react';
import { apiVerifyCertificate } from '../services/api';
import { Award, Search, Download, Share2, CheckCircle2 } from 'lucide-react';
import { PoliceEmblem, OfficialGoldSeal, RunForHerBadge } from './Emblems';
import QRCode from 'qrcode';
import { useLanguage } from '../context/LanguageContext';
import { formatLocalizedName, formatLocalizedDistrict, formatLocalizedCategory } from '../utils/localization';

export function CertificateHub({ registrations = [] }) {
  const { t, isHindi } = useLanguage();
  const [selectedRunner, setSelectedRunner] = useState(registrations[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [certNoticePopup, setCertNoticePopup] = useState(null);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

  const checkRunnerIssued = (runner) => {
    if (!runner) return false;
    const isDemoRunner = ['RJ-21K-1005', 'RJ-10K-2018', 'RJ-05K-3042', 'RJ-05K-9901'].includes(runner.bibNumber);
    return Boolean(isDemoRunner || runner.isIssued || runner.status === 'CERT_ISSUED' || runner.status === 'FINISHED');
  };

  // Check URL hash for direct QR verification: #verify?certId=RJ-POL-2027-XXXX
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('certId=')) {
      const match = hash.match(/certId=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const cId = match[1];
        setSearchQuery(cId);
        setIsSearching(true);
        apiVerifyCertificate(cId).then(res => {
          setIsSearching(false);
          if (res && res.success && res.certificate) {
            setSelectedRunner(res.certificate);
            setSearchFeedback({ type: 'success', message: `✅ डिजिटल QR कोड द्वारा प्रमाण पत्र सत्यापित (${res.certificate.certificateId})` });
          }
        }).catch(() => setIsSearching(false));
      }
    }
  }, []);

  useEffect(() => {
    if (registrations.length > 0 && !selectedRunner) {
      setSelectedRunner(registrations[0]);
    }
  }, [registrations]);

  useEffect(() => {
    if (selectedRunner) {
      const verifyUrl = `${window.location.origin}#verify?certId=${selectedRunner.certificateId}`;
      QRCode.toDataURL(verifyUrl, { width: 130, margin: 1, color: { dark: '#0a1c3d', light: '#ffffff' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("Certificate QR Error:", err));
    }
  }, [selectedRunner]);

  const openNotIssuedPopup = () => {
    setCertNoticePopup({
      title: "प्रमाण पत्र अभी जारी नहीं हुआ है",
      message: "दौड़ समापन, गेट उपस्थिति सत्यापन एवं पुलिस अधिकृत समिति द्वारा जारी किए जाने के उपरांत ही प्रमाण पत्र डाउनलोड हेतु उपलब्ध होगा। जारी होते ही आपके पंजीकृत मोबाइल पर SMS/ईमेल द्वारा सूचना प्रेषित की जाएगी।"
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const rawQ = searchQuery.trim();
    if (!rawQ) return;
    const q = rawQ.toLowerCase();
    setSearchFeedback(null);
    setCertNoticePopup(null);

    // 1. Check in local loaded registrations
    const foundLocal = registrations.find(r => 
      (r.bibNumber && r.bibNumber.toLowerCase() === q) || 
      (r.certificateId && r.certificateId.toLowerCase() === q) ||
      (r.mobile && r.mobile.includes(q)) || 
      (r.fullName && r.fullName.toLowerCase().includes(q))
    );

    if (foundLocal) {
      setSelectedRunner(foundLocal);
      if (!checkRunnerIssued(foundLocal)) {
        openNotIssuedPopup();
      } else {
        setSearchFeedback({ type: 'success', message: isHindi ? `धावक रिकॉर्ड प्राप्त हुआ: ${foundLocal.fullName} (पंजीकरण सं: ${foundLocal.bibNumber})` : `Runner record found: ${foundLocal.fullName} (Reg No: ${foundLocal.bibNumber})` });
      }
      return;
    }

    // 2. Query Central Police Edge Database
    setIsSearching(true);
    try {
      const res = await apiVerifyCertificate(rawQ);
      setIsSearching(false);
      if (res && res.success && res.certificate) {
        setSelectedRunner(res.certificate);
        if (!checkRunnerIssued(res.certificate)) {
          openNotIssuedPopup();
        } else {
          setSearchFeedback({ type: 'success', message: `✅ राजस्थान पुलिस डेटाबेस से प्रमाण पत्र सत्यापित (${res.certificate.certificateId})` });
        }
      } else {
        openNotIssuedPopup();
      }
    } catch (err) {
      setIsSearching(false);
      openNotIssuedPopup();
    }
  };

  const handleDownloadCertificatePNG = async () => {
    if (!selectedRunner) return;
    setIsDownloadingCert(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1350;
      canvas.height = 920;
      const ctx = canvas.getContext("2d");

      // 1. Parchment / Crisp Background
      ctx.fillStyle = "#fafbfc";
      ctx.fillRect(0, 0, 1350, 920);

      // 2. High-Authority Borders
      ctx.strokeStyle = "#0a1c3d";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 1336, 906);

      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(22, 22, 1306, 876);

      ctx.strokeStyle = "rgba(10, 28, 61, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(32, 32, 1286, 856);

      // Corner ornamental squares
      const drawCorner = (x, y) => {
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(x - 6, y - 6, 12, 12);
        ctx.fillStyle = "#0a1c3d";
        ctx.fillRect(x - 3, y - 3, 6, 6);
      };
      drawCorner(22, 22);
      drawCorner(1328, 22);
      drawCorner(22, 898);
      drawCorner(1328, 898);

      // Load Official Police Logo
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/rajasthan-police-logo.png";
      await new Promise(r => {
        logoImg.onload = r;
        logoImg.onerror = r;
      });

      // Background Watermark (Crest) - Crisp and continuously visible
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.drawImage(logoImg, 450, 240, 450, 450);
        ctx.restore();
      }

      // Top Police Logo
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 60, 52, 95, 95);
      }

      // Header Texts
      ctx.fillStyle = "#996515";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GOVERNMENT OF RAJASTHAN • RAJASTHAN POLICE HEADQUARTERS, JAIPUR", 675, 75);

      ctx.fillStyle = "#0a1c3d";
      ctx.font = "900 32px sans-serif";
      ctx.fillText("RAJASTHAN POLICE MARATHON 2027", 675, 115);

      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("RUN FOR HER • STATEWIDE WOMEN SAFETY & EMPOWERMENT INITIATIVE", 675, 142);

      // Golden Divider
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(150, 162, 1050, 3);

      // Certificate Title
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "800 24px sans-serif";
      ctx.fillText("OFFICIAL FINISHER CERTIFICATE OF EXCELLENCE", 675, 215);

      ctx.fillStyle = "#64748b";
      ctx.font = "italic 16px sans-serif";
      ctx.fillText("This official certificate is proudly awarded to", 675, 252);

      // Runner Name
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "900 46px sans-serif";
      ctx.fillText(selectedRunner.fullName || "Valued Participant", 675, 315);

      // Underline under Name
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(400, 332, 550, 3);

      const bib = String(selectedRunner.bibNumber || selectedRunner.bib_number || "").toUpperCase();
      const distId = String(selectedRunner.districtId || selectedRunner.district_id || "").toLowerCase();
      const distName = String(selectedRunner.districtName || selectedRunner.district_name || "").toLowerCase();
      const cat = String(selectedRunner.category || selectedRunner.categoryId || selectedRunner.category_id || selectedRunner.categoryName || selectedRunner.category_name || "").toLowerCase();

      const isJaipur = distId.includes("jaipur") || distId === "jpr-comm" || distId === "jaipur_comm" || distName.includes("जयपुर") || distName.includes("jaipur");
      const isTimedCategory = cat.includes("21") || cat.includes("10") || bib.includes("21K") || bib.includes("10K");
      const isTimedCompetitive = isJaipur || isTimedCategory;

      const pureDistrictEn = formatLocalizedDistrict(selectedRunner.districtName || selectedRunner.district_name, false) || (isJaipur ? "Jaipur" : "District Police");
      const pureDistrictHi = formatLocalizedDistrict(selectedRunner.districtName || selectedRunner.district_name, true) || (isJaipur ? "जयपुर" : "जिला पुलिस");

      const runnerGunTime = selectedRunner.finishTime || selectedRunner.finish_time || (cat.includes("21") ? "01:52:18" : cat.includes("10") ? "00:51:24" : "00:26:40");
      const runnerChipTime = selectedRunner.chipTime || (cat.includes("21") ? "01:51:04" : cat.includes("10") ? "00:50:10" : "00:25:52");
      const runnerAvgPace = selectedRunner.avgPace || (cat.includes("21") ? "5:16 min/km" : cat.includes("10") ? "5:01 min/km" : "5:10 min/km");
      const runnerRank = selectedRunner.overallRank ? `#${selectedRunner.overallRank} Overall` : (selectedRunner.genderRank || "Finisher");

      // Description Statement
      ctx.fillStyle = "#334155";
      ctx.font = "600 20px sans-serif";
      const catText = formatLocalizedCategory(selectedRunner.categoryName || selectedRunner.category, false) || (isTimedCompetitive ? "21 KM Half Marathon" : "5 KM Community Run");
      
      if (isTimedCompetitive) {
        ctx.fillText(`For successfully completing the ${catText} in ${pureDistrictEn} under the leadership of the`, 675, 375);
        ctx.fillStyle = "#0a1c3d";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("Director General of Police (DGP), Rajasthan on the motto \"Every Step for Her Safety.\"", 675, 408);
      } else {
        ctx.fillText(`For exemplary participation in Women's Safety & Empowerment and completing the ${catText} in`, 675, 375);
        ctx.fillStyle = "#0a1c3d";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(`${pureDistrictEn} under the leadership of the District Police on the motto \"Every Step for Her Safety.\"`, 675, 408);
      }

      // Metrics Pillars Box - Semi-transparent background so the watermark crest is continuous and beautifully visible!
      ctx.fillStyle = "rgba(241, 245, 249, 0.45)";
      ctx.fillRect(150, 445, 1050, 105);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(150, 445, 1050, 105);

      if (isTimedCompetitive) {
        // 5 Columns: REGISTRATION NO. | GUN TIME | CHIP TIME | AVG PACE | RANK
        // Column 1: REGISTRATION NO.
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("REGISTRATION NO.", 255, 480);
        ctx.fillStyle = "#dc2626";
        ctx.font = "900 22px monospace";
        ctx.fillText(selectedRunner.bibNumber || "RJ-21K-1001", 255, 520);

        // Divider 1
        ctx.strokeStyle = "rgba(203, 213, 225, 0.7)";
        ctx.beginPath();
        ctx.moveTo(360, 455);
        ctx.lineTo(360, 540);
        ctx.stroke();

        // Column 2: GUN TIME
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("GUN TIME", 465, 480);
        ctx.fillStyle = "#0a1c3d";
        ctx.font = "900 22px monospace";
        ctx.fillText(runnerGunTime, 465, 520);

        // Divider 2
        ctx.beginPath();
        ctx.moveTo(570, 455);
        ctx.lineTo(570, 540);
        ctx.stroke();

        // Column 3: CHIP TIME
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("CHIP TIME", 675, 480);
        ctx.fillStyle = "#0a1c3d";
        ctx.font = "900 22px monospace";
        ctx.fillText(runnerChipTime, 675, 520);

        // Divider 3
        ctx.beginPath();
        ctx.moveTo(780, 455);
        ctx.lineTo(780, 540);
        ctx.stroke();

        // Column 4: AVG PACE
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("AVG PACE", 885, 480);
        ctx.fillStyle = "#0a1c3d";
        ctx.font = "900 22px monospace";
        ctx.fillText(runnerAvgPace, 885, 520);

        // Divider 4
        ctx.beginPath();
        ctx.moveTo(990, 455);
        ctx.lineTo(990, 540);
        ctx.stroke();

        // Column 5: RANK
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("OFFICIAL RANK", 1095, 480);
        ctx.fillStyle = "#047857";
        ctx.font = "800 20px sans-serif";
        ctx.fillText(runnerRank, 1095, 520);
      } else {
        // District Level: Pure District & Honorary Ambassador Recognition
        // Pillar 1: Registration Number
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("REGISTRATION NO.", 325, 480);
        ctx.fillStyle = "#dc2626";
        ctx.font = "900 28px monospace";
        ctx.fillText(selectedRunner.bibNumber || "RJ-05K-3001", 325, 520);

        // Divider 1
        ctx.strokeStyle = "rgba(203, 213, 225, 0.7)";
        ctx.beginPath();
        ctx.moveTo(500, 455);
        ctx.lineTo(500, 540);
        ctx.stroke();

        // Pillar 2: Pure District (No Commissionerate or Extra Suffixes)
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("POLICE DISTRICT", 675, 480);
        ctx.fillStyle = "#0a1c3d";
        ctx.font = "900 24px sans-serif";
        ctx.fillText(pureDistrictEn, 675, 520);

        // Divider 2
        ctx.beginPath();
        ctx.moveTo(850, 455);
        ctx.lineTo(850, 540);
        ctx.stroke();

        // Pillar 3: Ambassador Recognition
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("HONORARY DESIGNATION", 1025, 480);
        ctx.fillStyle = "#047857";
        ctx.font = "800 18px sans-serif";
        ctx.fillText("Women Safety Ambassador", 1025, 520);
      }

      // Event Date & Authority
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`Event Date: 3 January 2027 • ${isTimedCompetitive ? 'Official Finisher Certificate' : 'Participation & Women Safety Ambassador Certificate'}`, 675, 595);

      // Bottom Signatures & Seal Section
      ctx.textAlign = "center";
      ctx.font = "italic bold 28px serif";
      ctx.fillStyle = "#0a1c3d";

      if (isTimedCompetitive) {
        ctx.fillText("Rajeev Sharma, IPS", 280, 715);
        ctx.fillStyle = "#0a1c3d";
        ctx.fillRect(180, 726, 200, 2);
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("DIRECTOR GENERAL OF POLICE", 280, 748);
        ctx.fillStyle = "#64748b";
        ctx.font = "13px sans-serif";
        ctx.fillText("Rajasthan Police Headquarters, Jaipur", 280, 768);
      } else {
        ctx.fillText("Superintendent of Police", 280, 715);
        ctx.fillStyle = "#0a1c3d";
        ctx.fillRect(180, 726, 200, 2);
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("SUPERINTENDENT OF POLICE (SP / DCP)", 280, 748);
        ctx.fillStyle = "#64748b";
        ctx.font = "13px sans-serif";
        ctx.fillText(`${pureDistrictEn}, Rajasthan`, 280, 768);
      }

      // Center: Official Seal
      ctx.save();
      ctx.beginPath();
      ctx.arc(675, 730, 54, 0, 2 * Math.PI);
      ctx.fillStyle = "#fef3c7";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#d4af37";
      ctx.stroke();
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 640, 695, 70, 70);
      }
      ctx.restore();
      ctx.fillStyle = "#996515";
      ctx.font = "900 11px sans-serif";
      ctx.fillText("★ OFFICIAL SEAL ★", 675, 805);

      // Right: QR Code
      if (qrCodeUrl) {
        const qrImg = new Image();
        qrImg.src = qrCodeUrl;
        await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
        if (qrImg.complete) {
          ctx.drawImage(qrImg, 1020, 665, 100, 100);
        }
      }
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 13px monospace";
      ctx.fillText(selectedRunner.certificateId || "RJ-POL-2027-CERT", 1070, 782);
      ctx.fillStyle = "#15803d";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("✓ Digitally Verified Record", 1070, 800);

      // Convert Canvas to PNG and Trigger Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        const cleanBib = (selectedRunner.bibNumber || "FINISHER").replace(/[^a-zA-Z0-9_-]/g, "_");
        link.download = `Rajasthan_Police_Certificate_${cleanBib}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        setIsDownloadingCert(false);
      }, "image/png");
    } catch (err) {
      console.error("Certificate generation error:", err);
      setIsDownloadingCert(false);
      window.print();
    }
  };

  const shareWhatsApp = () => {
    if (!selectedRunner) return;
    const text = `🎉 I have completed the ${selectedRunner.categoryName} in Rajasthan Police Marathon - "RUN FOR HER" with an official finish time of ${selectedRunner.finishTime}! Verify my official certificate here: ${window.location.origin}#verify?certId=${selectedRunner.certificateId} 🏃‍♀️👮‍♂️ #RunForHer #RajasthanPolice`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Dedicated A4 Landscape Print Engine for Finisher Certificate (Pure Certificate Only)
  const handlePrintCertificate = () => {
    let printStyle = document.getElementById('cert-print-page-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'cert-print-page-style';
      printStyle.innerHTML = `
        @page {
          size: A4 landscape !important;
          margin: 0 !important;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 100% !important;
            height: 100% !important;
          }
          header, footer, nav, button, input, select, form,
          .topbar, .navbar-container, .no-print,
          .section-header, .gov-card, .cert-dispatch-controls,
          #page-certificates > div:first-child,
          #page-certificates .section-header,
          #page-certificates .gov-card,
          #page-certificates .cert-dispatch-controls,
          .registration-breadcrumb {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #page-certificates .section-padding {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            border: none !important;
          }
          #page-certificates .container {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #page-certificates .cert-responsive-grid {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #page-certificates .cert-responsive-grid > div:first-child {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            overflow: visible !important;
          }
          #page-certificates .cert-responsive-grid > div:last-child {
            display: none !important;
          }
          .printable-certificate {
            display: block !important;
            visibility: visible !important;
            box-sizing: border-box !important;
            width: 278mm !important;
            height: 194mm !important;
            max-width: 278mm !important;
            max-height: 194mm !important;
            margin: 8mm auto !important;
            padding: 22px 30px 16px 30px !important;
            background: #ffffff !important;
            border: 8px double #b45309 !important;
            border-radius: 6px !important;
            box-shadow: none !important;
            position: relative !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
    }

    const cleanup = () => {
      const el = document.getElementById('cert-print-page-style');
      if (el) el.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
  };

  // Ensure browser Ctrl+P also triggers clean A4 landscape
  useEffect(() => {
    const handleBeforePrint = () => {
      let printStyle = document.getElementById('cert-print-page-style');
      if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'cert-print-page-style';
        printStyle.innerHTML = `
          @page {
            size: A4 landscape !important;
            margin: 0 !important;
          }
          @media print {
            header, footer, nav, button, input, select, form,
            .topbar, .navbar-container, .no-print,
            .section-header, .gov-card, .cert-dispatch-controls,
            #page-certificates > div:first-child,
            #page-certificates .section-header,
            #page-certificates .gov-card,
            #page-certificates .cert-dispatch-controls {
              display: none !important;
              visibility: hidden !important;
            }
            .printable-certificate {
              display: block !important;
              visibility: visible !important;
              margin: 8mm auto !important;
              width: 278mm !important;
              height: 194mm !important;
            }
          }
        `;
        document.head.appendChild(printStyle);
      }
    };

    const handleAfterPrint = () => {
      const el = document.getElementById('cert-print-page-style');
      if (el) el.remove();
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      const el = document.getElementById('cert-print-page-style');
      if (el) el.remove();
    };
  }, []);

  if (!selectedRunner) return null;

  const isIssued = checkRunnerIssued(selectedRunner);

  const bib = String(selectedRunner?.bibNumber || selectedRunner?.bib_number || "").toUpperCase();
  const distId = String(selectedRunner?.districtId || selectedRunner?.district_id || "").toLowerCase();
  const distName = String(selectedRunner?.districtName || selectedRunner?.district_name || "").toLowerCase();
  const cat = String(selectedRunner?.category || selectedRunner?.categoryId || selectedRunner?.category_id || selectedRunner?.categoryName || selectedRunner?.category_name || "").toLowerCase();

  const isJaipur = distId.includes("jaipur") || distId === "jpr-comm" || distId === "jaipur_comm" || distName.includes("जयपुर") || distName.includes("jaipur");
  const isTimedCategory = cat.includes("21") || cat.includes("10") || bib.includes("21K") || bib.includes("10K");
  const isTimedCompetitive = isJaipur || isTimedCategory;

  const pureDistrictEn = formatLocalizedDistrict(selectedRunner?.districtName || selectedRunner?.district_name, false) || (isJaipur ? "Jaipur" : "District Police");
  const pureDistrictHi = formatLocalizedDistrict(selectedRunner?.districtName || selectedRunner?.district_name, true) || (isJaipur ? "जयपुर" : "जिला पुलिस");
  const pureDistrict = pureDistrictEn;

  const runnerGunTime = selectedRunner?.finishTime || selectedRunner?.finish_time || (cat.includes("21") ? "01:52:18" : cat.includes("10") ? "00:51:24" : "00:26:40");
  const runnerChipTime = selectedRunner?.chipTime || (cat.includes("21") ? "01:51:04" : cat.includes("10") ? "00:50:10" : "00:25:52");
  const runnerAvgPace = selectedRunner?.avgPace || (cat.includes("21") ? "5:16 min/km" : cat.includes("10") ? "5:01 min/km" : "5:10 min/km");
  const runnerRank = selectedRunner?.overallRank ? `#${selectedRunner.overallRank} Overall` : (selectedRunner?.genderRank || "Finisher");

  return (
    <section id="certificates" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header no-print" style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '0 0 8px 0', fontWeight: 800 }}>
            {isHindi ? 'मैराथन ई-प्रमाण पत्र' : 'Marathon E-Certificate'}
          </h2>
        </div>

        {/* Runner Selector & Quick Search Bar */}
        <div className="gov-card no-print" style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Quick Select Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>क्विक रनर चयन:</span>
            {registrations.slice(0, 4).map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRunner(r)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: selectedRunner.id === r.id ? 'var(--police-navy-800)' : 'var(--police-navy-50)',
                  color: selectedRunner.id === r.id ? '#ffffff' : 'var(--text-body)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {r.fullName} ({r.category.toUpperCase()})
              </button>
            ))}
          </div>

          {/* Search by Bib or Phone */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={isHindi ? "पंजीकरण सं. या मोबाइल नंबर..." : "Registration No. or Mobile..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                minWidth: '180px'
              }}
            />
            <button type="submit" disabled={isSearching} className="btn-navy" style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} /> {isSearching ? "सत्यापित हो रहा है..." : "सत्यापित करें"}
            </button>
          </form>
        </div>

        {/* Real-time Police Database Verification Feedback */}
        {searchFeedback && (
          <div className="no-print" style={{
            background: searchFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: searchFeedback.type === 'success' ? '1.5px solid #22c55e' : '1.5px solid #f87171',
            borderLeftWidth: '5px',
            borderRadius: '6px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {searchFeedback.type === 'success' ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <Award size={20} color="#dc2626" />
              )}
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: searchFeedback.type === 'success' ? '#166534' : '#991b1b' }}>
                {searchFeedback.message}
              </span>
            </div>
            <button
              onClick={() => setSearchFeedback(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Certificate Display & Control Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isIssued ? 'minmax(0, 1fr) minmax(0, 320px)' : 'minmax(0, 920px)',
            justifyContent: 'center',
            gap: '24px',
            alignItems: 'start'
          }}
          className="cert-responsive-grid"
        >
          {/* THE OFFICIAL HIGH-DIGNITY CERTIFICATE (SCROLLABLE ON MOBILE) */}
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <div className="printable-certificate" style={{
              background: '#ffffff',
              color: '#0a1c3d',
              borderRadius: '8px',
              padding: 'clamp(20px, 4vw, 36px)',
              boxShadow: 'var(--shadow-md)',
              border: '10px double var(--police-gold-500)',
              position: 'relative',
              overflow: 'hidden',
              minWidth: '580px' // Ensures standard certificate layout doesn't squash on small screens
            }}>
              {/* Watermark Rajasthan Police Crest - Crisp & continuously visible behind cards */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.20,
                pointerEvents: 'none',
                zIndex: 0
              }}>
                <PoliceEmblem size={400} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Certificate Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--police-gold-500)', paddingBottom: '12px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PoliceEmblem size={54} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--police-gold-700)', textTransform: 'uppercase' }}>
                        GOVERNMENT OF RAJASTHAN
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0a1c3d', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                        RAJASTHAN POLICE
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isTimedCompetitive ? 'var(--text-muted)' : 'var(--police-gold-700)', fontWeight: 700 }}>
                        {isTimedCompetitive 
                          ? 'Rajasthan Police Headquarters • Jaipur' 
                          : `District Police • ${pureDistrictEn}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <RunForHerBadge size={48} />
                    <div translate="no" className="notranslate" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--crimson-600)', marginTop: '2px' }}>
                      RUN FOR HER 2027
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
                    fontWeight: 700,
                    color: '#0a1c3d',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    Certificate of Accomplishment
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--police-gold-700)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginTop: '2px'
                  }}>
                    Women's Safety, Dignity & Empowerment Movement
                  </div>
                </div>

                {/* Presented To */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '4px' }}>
                    This official certificate is proudly awarded to
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: '#0a1c3d',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #0a1c3d',
                    display: 'inline-block',
                    padding: '0 24px 2px 24px',
                    letterSpacing: '0.02em'
                  }}>
                    {formatLocalizedName(selectedRunner.fullName, false)}
                  </div>
                </div>

                {/* Statement */}
                <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-body)', maxWidth: '580px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
                  {isTimedCompetitive ? (
                    <>For successfully completing the <strong>{formatLocalizedCategory(selectedRunner.categoryName || selectedRunner.category, false) || '21 KM Half Marathon'}</strong> in <strong>{pureDistrictEn}</strong> under the leadership of the <strong>Director General of Police (DGP), Rajasthan</strong> on the motto <em>"Every Step for Her Safety."</em></>
                  ) : (
                    <>For exemplary participation in the <strong>Women's Safety, Dignity & Empowerment Movement</strong> and successfully completing the <strong>{formatLocalizedCategory(selectedRunner.categoryName || selectedRunner.category, false) || '5 KM Community Run'}</strong> in <strong>{pureDistrictEn}</strong> under the leadership of the District Police on the motto <em>"Every Step for Her Safety."</em></>
                  )}
                </p>

                {/* Metrics Matrix: Dual Mode (Timed Grid vs District Awareness Badges) */}
                {isTimedCompetitive ? (
                  <div style={{
                    background: 'rgba(241, 245, 249, 0.45)',
                    backdropFilter: 'blur(1.5px)',
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>REGISTRATION NO.</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--crimson-600)' }}>{selectedRunner.bibNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>GUN TIME</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{runnerGunTime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>CHIP TIME</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{runnerChipTime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG PACE</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{runnerAvgPace}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>RANK</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>{runnerRank}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'blur(1.5px)',
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>REGISTRATION NO.</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--crimson-600)', fontFamily: 'monospace' }}>{selectedRunner.bibNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>POLICE DISTRICT</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0a1c3d' }}>{pureDistrictEn}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>HONORARY DESIGNATION</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857' }}>Women Safety Ambassador</div>
                    </div>
                  </div>
                )}

                {/* Signatures & Seal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ textAlign: 'center', minWidth: '150px' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '1.15rem',
                      color: '#0a1c3d',
                      fontWeight: 700,
                      marginBottom: '2px'
                    }}>
                      {isTimedCompetitive ? 'Rajeev Sharma, IPS' : 'Superintendent of Police'}
                    </div>
                    <div style={{ height: '2px', background: '#0a1c3d', width: '130px', margin: '0 auto 2px auto' }}></div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0a1c3d' }}>
                      {isTimedCompetitive ? 'DIRECTOR GENERAL OF POLICE' : 'SUPERINTENDENT OF POLICE (SP / DCP)'}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {isTimedCompetitive ? 'Rajasthan Police Headquarters, Jaipur' : `${pureDistrictEn}, Rajasthan`}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <OfficialGoldSeal size={70} />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    {qrCodeUrl && (
                      <img src={qrCodeUrl} alt="Verify QR" style={{ width: '60px', height: '60px', border: '1px solid var(--border-subtle)', padding: '2px', borderRadius: '4px' }} />
                    )}
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0a1c3d', marginTop: '2px' }}>
                      {selectedRunner.certificateId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: DOWNLOAD & ACTIONS CONTROLS (Shown only when certificate is issued) */}
          {isIssued && (
            <div className="cert-dispatch-controls no-print" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="gov-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  सर्टिफिकेट डाउनलोड व शेयर
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handleDownloadCertificatePNG}
                    disabled={isDownloadingCert}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '11px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      justifyContent: 'center',
                      background: 'var(--police-navy-900)',
                      color: '#ffffff',
                      border: '1.5px solid var(--police-gold-500)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 2px 8px rgba(10, 28, 61, 0.25)',
                      cursor: isDownloadingCert ? 'wait' : 'pointer'
                    }}
                  >
                    <Download size={16} color="var(--police-gold-400)" /> {isDownloadingCert ? "सर्टिफिकेट तैयार हो रहा है..." : "Download HD Certificate (PNG)"}
                  </button>

                  <button
                    onClick={handlePrintCertificate}
                    className="btn-gold"
                    style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
                  >
                    <Download size={15} /> Print / Save as PDF
                  </button>

                  <button
                    onClick={shareWhatsApp}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#25D366',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      border: 'none'
                    }}
                  >
                    <Share2 size={15} /> WhatsApp पर शेयर करें
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* On-Demand Popup Modal when user searches before certificate is issued */}
      {certNoticePopup && (
        <div
          className="no-print"
          role="dialog"
          aria-modal="true"
          onClick={() => setCertNoticePopup(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 28, 61, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 2000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '460px',
              width: '100%',
              padding: '26px 24px',
              boxShadow: '0 24px 50px rgba(10, 28, 61, 0.3)',
              border: '2px solid #f59e0b',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#fffbeb',
              border: '1.5px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              fontSize: '1.5rem'
            }}>
              ⏳
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e', margin: '0 0 10px 0' }}>
              {certNoticePopup.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {certNoticePopup.message}
            </p>
            <button
              type="button"
              onClick={() => setCertNoticePopup(null)}
              style={{
                background: 'var(--police-navy-900)',
                color: '#ffffff',
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ठीक है
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cert-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
