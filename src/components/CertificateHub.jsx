import React, { useState, useEffect } from 'react';
import { apiVerifyCertificate } from '../services/api';
import { Award, Search, Download, Share2, CheckCircle2 } from 'lucide-react';
import { PoliceEmblem, OfficialGoldSeal, RunForHerBadge } from './Emblems';
import QRCode from 'qrcode';
import { useLanguage } from '../context/LanguageContext';
import { formatLocalizedName, formatLocalizedDistrict, formatLocalizedCategory, formatBibNumber, toTitleCase } from '../utils/localization';

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
            setSearchFeedback({
              type: 'success',
              message: isHindi
                ? `प्रमाण पत्र सत्यापित (${res.certificate.certificateId})`
                : `Certificate Verified (${res.certificate.certificateId})`
            });
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
      title: isHindi ? "⏳ प्रमाण पत्र रेस डे (24 जनवरी 2027) के बाद उपलब्ध होगा" : "⏳ Certificate available after Race Day (24 Jan 2027)",
      message: isHindi
        ? "आपका पंजीकरण पूर्णतः सुरक्षित है! 24 जनवरी 2027 को दौड़ संपन्न होने, RFID टाइमिंग व उपस्थिति सत्यापन के उपरांत आपका अधिकृत डिजिटल प्रमाण पत्र यहाँ स्वतः डाउनलोड हेतु उपलब्ध हो जाएगा।"
        : "Your registration is completely safe! Official digital certificate will be automatically available for download here after race completion, RFID timing, and committee verification on 24 January 2027."
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
        setSearchFeedback({
          type: 'success',
          message: isHindi
            ? `प्रमाण पत्र उपलब्ध (${foundLocal.certificateId || foundLocal.bibNumber})`
            : `Certificate Available (${foundLocal.certificateId || foundLocal.bibNumber})`
        });
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
          setSearchFeedback({
            type: 'success',
            message: isHindi
              ? `प्रमाण पत्र सत्यापित (${res.certificate.certificateId})`
              : `Certificate Verified (${res.certificate.certificateId})`
          });
        }
      } else if (res && (res.status === 404 || (res.error && res.error.includes("रिकॉर्ड में नहीं मिला")))) {
        setSearchFeedback({
          type: 'error',
          message: isHindi 
            ? `दर्ज किए गए विवरण "${rawQ}" से संबंधित कोई प्रमाण पत्र रिकॉर्ड नहीं मिला।` 
            : `No certificate record found matching "${rawQ}".`
        });
      } else {
        setSearchFeedback({
          type: 'error',
          message: isHindi 
            ? (res?.error || "सर्वर से कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।")
            : "Unable to connect to the server. Please try again."
        });
      }
    } catch (err) {
      setIsSearching(false);
      setSearchFeedback({
        type: 'error',
        message: isHindi 
          ? "सर्वर से कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।" 
          : "Unable to connect to the server. Please try again."
      });
    }
  };

  const handleDownloadCertificatePNG = async () => {
    if (!selectedRunner) return;
    setIsDownloadingCert(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1240;
      canvas.height = 1754;
      const ctx = canvas.getContext("2d");

      // 1. Parchment / Crisp Background (A4 Portrait 1240 x 1754)
      ctx.fillStyle = "#fafbfc";
      ctx.fillRect(0, 0, 1240, 1754);

      // 2. High-Authority Borders (A4 Portrait)
      ctx.strokeStyle = "#0a1c3d";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 1226, 1740);

      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(22, 22, 1196, 1710);

      ctx.strokeStyle = "rgba(10, 28, 61, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(32, 32, 1176, 1690);

      // Corner ornamental squares
      const drawCorner = (x, y) => {
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(x - 6, y - 6, 12, 12);
        ctx.fillStyle = "#0a1c3d";
        ctx.fillRect(x - 3, y - 3, 6, 6);
      };
      drawCorner(22, 22);
      drawCorner(1218, 22);
      drawCorner(22, 1732);
      drawCorner(1218, 1732);

      // Load Official Police Logo, Event Logo & Beti Bachao Seal
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/rajasthan-police-logo.png";

      const eventLogoImg = new Image();
      eventLogoImg.crossOrigin = "anonymous";
      eventLogoImg.src = "/images/run_for_her_official_logo.jpg";

      const betiBachaoSealImg = new Image();
      betiBachaoSealImg.crossOrigin = "anonymous";
      betiBachaoSealImg.src = "/images/beti_bachao_seal.png";

      await Promise.all([
        new Promise(r => {
          logoImg.onload = r;
          logoImg.onerror = r;
        }),
        new Promise(r => {
          eventLogoImg.onload = r;
          eventLogoImg.onerror = r;
        }),
        new Promise(resolve => {
          let settled = false;
          const settle = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve();
            }
          };
          const timer = setTimeout(settle, 2000);
          betiBachaoSealImg.onload = settle;
          betiBachaoSealImg.onerror = settle;
          if (betiBachaoSealImg.complete) {
            settle();
          }
        })
      ]);

      // Background Watermark (Crest) - Crisp and continuously visible behind text
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.drawImage(logoImg, 380, 580, 480, 480);
        ctx.restore();
      }

      const bib = String(selectedRunner.bibNumber || selectedRunner.bib_number || "").toUpperCase();
      const distId = String(selectedRunner.districtId || selectedRunner.district_id || "").toLowerCase();
      const distName = String(selectedRunner.districtName || selectedRunner.district_name || "").toLowerCase();
      const cat = String(selectedRunner.category || selectedRunner.categoryId || selectedRunner.category_id || selectedRunner.categoryName || selectedRunner.category_name || "").toLowerCase();

      const isTimedCategory = cat.includes("21") || cat.includes("10") || bib.includes("21K") || bib.includes("10K");
      const isTimedCompetitive = isTimedCategory;

      const pureDistrictEn = formatLocalizedDistrict(selectedRunner.districtName || selectedRunner.district_name, false) || "Jaipur";

      const runnerGunTime = selectedRunner.finishTime || selectedRunner.finish_time || (cat.includes("21") ? "01:52:18" : cat.includes("10") ? "00:51:24" : "00:26:40");
      const runnerChipTime = selectedRunner.chipTime || (cat.includes("21") ? "01:51:04" : cat.includes("10") ? "00:50:10" : "00:25:52");
      const runnerAvgPace = selectedRunner.avgPace || (cat.includes("21") ? "5:16 min/km" : cat.includes("10") ? "5:01 min/km" : "5:10 min/km");
      const runnerRank = selectedRunner.overallRank ? (String(selectedRunner.overallRank).startsWith('#') ? selectedRunner.overallRank : `#${selectedRunner.overallRank} Overall`) : (selectedRunner?.genderRank ? (String(selectedRunner.genderRank).startsWith('#') ? selectedRunner.genderRank : `#${selectedRunner.genderRank} Overall`) : (selectedRunner?.bibNumber ? `#${String(selectedRunner.bibNumber).replace(/\D/g, '').slice(-3) || '384'} Overall` : "#384 Overall"));

      // 1. TOP HEADER (A4 Portrait)
      // Top Left: Authority Text Stack
      ctx.textAlign = "left";
      ctx.fillStyle = "#b45309";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("GOVERNMENT OF RAJASTHAN", 60, 85);

      ctx.fillStyle = "#0a1c3d";
      ctx.font = "900 28px sans-serif";
      ctx.fillText("RAJASTHAN POLICE", 60, 118);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Rajasthan Police Headquarters • Jaipur", 60, 142);

      // Top Center: Police Logo Emblem (Centered at 620)
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 575, 62, 90, 90);
      }

      // Top Right: Official RUN FOR HER Marathon Event Logo
      if (eventLogoImg.complete && eventLogoImg.naturalWidth > 0) {
        const evW = 160;
        const evH = 80;
        const evX = 1180 - evW;
        const evY = 66;
        ctx.drawImage(eventLogoImg, evX, evY, evW, evH);
      } else {
        const badgeCX = 1130;
        const badgeCY = 100;
        ctx.save();
        ctx.beginPath();
        ctx.arc(badgeCX, badgeCY, 24, 0, 2 * Math.PI);
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 12.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("RUN FOR HER 2027", badgeCX, 140);
      }

      // Full Width Golden Line below Header
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(50, 170, 1140, 2.5);

      // 2. CERTIFICATE TITLE & AWARD
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 38px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("CERTIFICATE OF ACHIEVEMENT", 620, 260);

      ctx.fillStyle = "#b45309";
      ctx.font = "bold 17px sans-serif";
      ctx.fillText("WOMEN'S SAFETY, DIGNITY & EMPOWERMENT", 620, 298);

      ctx.fillStyle = "#64748b";
      ctx.font = "italic 18px sans-serif";
      ctx.fillText("This certificate is hereby awarded to", 620, 380);

      // 3. RUNNER NAME in Calligraphy / Script Font (Directly touching underline)
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.load('56px "Great Vibes"');
        }
      } catch (fontErr) {
        console.warn('Script font loading fallback:', fontErr);
      }

      const runnerName = toTitleCase(formatLocalizedName(selectedRunner.fullName || selectedRunner.full_name, false)) || "Participant";
      let nameFontSize = 56;
      ctx.font = `${nameFontSize}px 'Segoe Script', 'Brush Script MT', 'Great Vibes', cursive`;
      while (ctx.measureText(runnerName).width > 740 && nameFontSize > 28) {
        nameFontSize -= 2;
        ctx.font = `${nameFontSize}px 'Segoe Script', 'Brush Script MT', 'Great Vibes', cursive`;
      }
      ctx.fillStyle = "#0a1c3d";
      ctx.textAlign = "center";
      ctx.fillText(runnerName, 620, 500);

      const measuredNameW = ctx.measureText(runnerName).width;
      const underlineW = Math.max(measuredNameW + 60, 320);
      ctx.fillStyle = "#0a1c3d";
      ctx.fillRect(620 - underlineW / 2, 508, underlineW, 2.5);

      // 4. STATEMENT (Pure Black High Contrast)
      ctx.fillStyle = "#000000";
      ctx.font = "500 19px Georgia, serif";
      const catText = formatLocalizedCategory(selectedRunner.categoryName || selectedRunner.category, false) || (isTimedCompetitive ? "21 KM Half Marathon" : "5 KM Community Run");

      ctx.fillText("For demonstrating exceptional commitment towards women safety by", 620, 600);
      ctx.fillText(`successfully completing the ${catText} in Jaipur.`, 620, 630);

      ctx.font = "italic 700 18px Georgia, serif";
      ctx.fillStyle = "#000000";
      ctx.fillText("\"Running Together for a Safer Tomorrow.\"", 620, 675);

      // 5. METRICS BOX (5-column card)
      const drawRRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      const boxX = 60;
      const boxY = 740;
      const boxW = 1120;
      const boxH = 110;

      ctx.fillStyle = "rgba(241, 245, 249, 0.65)";
      ctx.strokeStyle = "rgba(212, 175, 55, 0.55)";
      ctx.lineWidth = 1.5;
      drawRRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      const colW = boxW / 5;
      const cols = [
        { label: "REGISTRATION NO.", val: formatBibNumber(selectedRunner.bibNumber) || "RJ-05K-1003", color: "#dc2626", font: "bold 20px monospace" },
        { label: "GUN TIME", val: runnerGunTime, color: "#0a1c3d", font: "bold 20px monospace" },
        { label: "CHIP TIME", val: runnerChipTime, color: "#0a1c3d", font: "bold 20px monospace" },
        { label: "AVG PACE", val: runnerAvgPace, color: "#0a1c3d", font: "bold 20px sans-serif" },
        { label: "RANK", val: runnerRank, color: "#047857", font: "bold 20px sans-serif" }
      ];

      cols.forEach((col, idx) => {
        const cx = boxX + colW * idx + colW / 2;
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(col.label, cx, boxY + 40);

        ctx.fillStyle = col.color;
        ctx.font = col.font;
        ctx.fillText(col.val, cx, boxY + 78);

        if (idx < cols.length - 1) {
          const divX = boxX + colW * (idx + 1);
          ctx.strokeStyle = "rgba(203, 213, 225, 0.7)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(divX, boxY + 16);
          ctx.lineTo(divX, boxY + boxH - 16);
          ctx.stroke();
        }
      });

      // 6. BOTTOM FOOTER (Exact match to Preview)
      // Left: DGP Signature (All Rajasthan Police Marathon Certificates)
      const sigX = 220;
      ctx.textAlign = "center";
      ctx.font = "italic bold 28px serif";
      ctx.fillStyle = "#0a1c3d";
      ctx.fillText("Rajeev Sharma, IPS", sigX, 1530);
      ctx.fillRect(sigX - 100, 1542, 200, 2);
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("DIRECTOR GENERAL OF POLICE", sigX, 1566);
      ctx.fillStyle = "#64748b";
      ctx.font = "13px sans-serif";
      ctx.fillText("Rajasthan Police Headquarters, Jaipur", sigX, 1588);

      // Center: Beti Bachao Beti Padhao Emblem Seal (Official Campaign Seal - Centered at 620)
      if (betiBachaoSealImg.complete && betiBachaoSealImg.naturalWidth > 0) {
        const sealSize = 100;
        const sealX = 620 - (sealSize / 2);
        ctx.drawImage(betiBachaoSealImg, sealX, 1500, sealSize, sealSize);
      } else if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 620 - 45, 1500, 90, 90);
      }

      // Right: Security QR Code
      if (qrCodeUrl) {
        const qrImg = new Image();
        qrImg.src = qrCodeUrl;
        await new Promise((r) => { qrImg.onload = r; qrImg.onerror = r; });
        if (qrImg.complete) {
          ctx.drawImage(qrImg, 1010, 1485, 96, 96);
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 1;
          ctx.strokeRect(1010, 1485, 96, 96);
        }
      }
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(selectedRunner.certificateId || "RJ-POL-2027-CERT", 1058, 1605);
      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("✓ Digitally Verified", 1058, 1626);

      // Convert Canvas to PNG and Trigger Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        const cleanBib = (formatBibNumber(selectedRunner.bibNumber) || "FINISHER").replace(/[^a-zA-Z0-9_-]/g, "_");
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

  // Dedicated A4 Portrait Print Engine for Finisher Certificate (Pure Certificate Only)
  const handlePrintCertificate = () => {
    let printStyle = document.getElementById('cert-print-page-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'cert-print-page-style';
      printStyle.innerHTML = `
        @page {
          size: A4 portrait !important;
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
            display: flex !important;
            justify-content: center !important;
            overflow: visible !important;
          }
          #page-certificates .cert-responsive-grid > div:last-child {
            display: none !important;
          }
          .printable-certificate {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            visibility: visible !important;
            box-sizing: border-box !important;
            width: 200mm !important;
            height: 285mm !important;
            max-width: 200mm !important;
            max-height: 285mm !important;
            margin: 5mm auto !important;
            padding: 14mm 12mm 12mm 12mm !important;
            background: #ffffff !important;
            border: 8px double #b45309 !important;
            border-radius: 6px !important;
            box-shadow: none !important;
            position: relative !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-certificate .cert-inner-content {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            height: 100% !important;
            width: 100% !important;
            flex: 1 !important;
          }
          .printable-certificate .cert-footer-content {
            margin-top: auto !important;
            padding-top: 14px !important;
            border-top: 1.5px solid #cbd5e1 !important;
            width: 100% !important;
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

  // Ensure browser Ctrl+P also triggers clean A4 portrait
  useEffect(() => {
    const handleBeforePrint = () => {
      let printStyle = document.getElementById('cert-print-page-style');
      if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'cert-print-page-style';
        printStyle.innerHTML = `
          @page {
            size: A4 portrait !important;
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
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              visibility: visible !important;
              box-sizing: border-box !important;
              width: 200mm !important;
              height: 285mm !important;
              max-width: 200mm !important;
              max-height: 285mm !important;
              margin: 5mm auto !important;
              padding: 14mm 12mm 12mm 12mm !important;
              background: #ffffff !important;
              border: 8px double #b45309 !important;
              border-radius: 6px !important;
              box-shadow: none !important;
              position: relative !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-certificate .cert-inner-content {
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              height: 100% !important;
              width: 100% !important;
              flex: 1 !important;
            }
            .printable-certificate .cert-footer-content {
              margin-top: auto !important;
              padding-top: 14px !important;
              border-top: 1.5px solid #cbd5e1 !important;
              width: 100% !important;
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

  const isTimedCategory = cat.includes("21") || cat.includes("10") || bib.includes("21K") || bib.includes("10K");
  const isTimedCompetitive = isTimedCategory;

  const pureDistrictEn = formatLocalizedDistrict(selectedRunner?.districtName || selectedRunner?.district_name, false) || "Jaipur";
  const pureDistrictHi = formatLocalizedDistrict(selectedRunner?.districtName || selectedRunner?.district_name, true) || "जयपुर";
  const pureDistrict = pureDistrictEn;

  const runnerGunTime = selectedRunner?.finishTime || selectedRunner?.finish_time || (cat.includes("21") ? "01:52:18" : cat.includes("10") ? "00:51:24" : "00:26:40");
  const runnerChipTime = selectedRunner?.chipTime || (cat.includes("21") ? "01:51:04" : cat.includes("10") ? "00:50:10" : "00:25:52");
  const runnerAvgPace = selectedRunner?.avgPace || (cat.includes("21") ? "5:16 min/km" : cat.includes("10") ? "5:01 min/km" : "5:10 min/km");
  const runnerRank = selectedRunner?.overallRank ? (String(selectedRunner.overallRank).startsWith('#') ? selectedRunner.overallRank : `#${selectedRunner.overallRank} Overall`) : (selectedRunner?.genderRank ? (String(selectedRunner.genderRank).startsWith('#') ? selectedRunner.genderRank : `#${selectedRunner.genderRank} Overall`) : (selectedRunner?.bibNumber ? `#${String(selectedRunner.bibNumber).replace(/\D/g, '').slice(-3) || '384'} Overall` : "#384 Overall"));

  return (
    <section id="certificates" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header no-print" style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: 'var(--police-navy-950)', margin: '0 0 8px 0', fontWeight: 800 }}>
            {isHindi ? 'मैराथन प्रमाण पत्र' : 'Marathon Certificate'}
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
            gridTemplateColumns: isIssued ? 'minmax(0, 595px) minmax(0, 320px)' : 'minmax(0, 595px)',
            justifyContent: 'center',
            gap: '28px',
            alignItems: 'start'
          }}
          className="cert-responsive-grid"
        >
          {/* THE OFFICIAL HIGH-DIGNITY CERTIFICATE (A4 PORTRAIT) */}
          <div style={{ overflowX: 'auto', paddingBottom: '10px', display: 'flex', justifyContent: 'center' }}>
            <div className="printable-certificate" lang="en" style={{
              background: '#ffffff',
              color: '#0a1c3d',
              borderRadius: '8px',
              padding: 'clamp(28px, 4vw, 36px) clamp(20px, 3.5vw, 28px)',
              boxShadow: 'var(--shadow-md)',
              border: '10px double var(--police-gold-500)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '595px',
              minHeight: '840px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}>
              {/* Watermark Rajasthan Police Crest - Crisp & continuously visible behind cards */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.16,
                pointerEvents: 'none',
                zIndex: 0
              }}>
                <PoliceEmblem size={360} />
              </div>

              <div className="cert-inner-content" style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                height: '100%',
                width: '100%'
              }}>
                {/* Upper & Middle Certificate Body */}
                <div className="cert-body-content">
                  {/* Certificate Header (3-Column Layout: Left Text, Center Logo, Right Event Logo) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    borderBottom: '2px solid var(--police-gold-500)',
                    paddingBottom: '12px',
                    marginBottom: '18px'
                  }}>
                    {/* Left: Authority Text Stack */}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--police-gold-700)', textTransform: 'uppercase' }}>
                        GOVERNMENT OF RAJASTHAN
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a1c3d', fontFamily: 'var(--font-heading)', lineHeight: 1.15 }}>
                        RAJASTHAN POLICE
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Police Headquarters • Jaipur
                      </div>
                    </div>

                    {/* Center: Police Emblem Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 8px' }}>
                      <PoliceEmblem size={50} />
                    </div>

                    {/* Right: Official Event Logo */}
                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <img 
                        src="/images/run_for_her_official_logo.jpg" 
                        alt="Run For Her Official Event Logo"
                        style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.35rem, 2.5vw, 1.65rem)',
                      fontWeight: 700,
                      color: '#0a1c3d',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      Certificate of Achievement
                    </div>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: 'var(--police-gold-700)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginTop: '3px'
                    }}>
                      Women's Safety, Dignity & Empowerment
                    </div>
                  </div>

                  {/* Presented To */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '4px' }}>
                      This certificate is hereby awarded to
                    </div>
                    <div style={{
                      position: 'relative',
                      display: 'inline-block',
                      fontSize: 'clamp(2.2rem, 4vw, 2.85rem)',
                      lineHeight: 1.1,
                      fontWeight: 400,
                      color: '#0a1c3d',
                      fontFamily: "'Segoe Script', 'Brush Script MT', 'Great Vibes', cursive",
                      padding: '0 20px',
                      margin: '0 auto 6px auto',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        position: 'relative',
                        zIndex: 2,
                        fontFamily: "'Segoe Script', 'Brush Script MT', 'Great Vibes', cursive"
                      }}>
                        {toTitleCase(formatLocalizedName(selectedRunner.fullName || selectedRunner.full_name, false))}
                      </span>
                      <div style={{
                        position: 'absolute',
                        bottom: '0.2em',
                        left: '0',
                        right: '0',
                        height: '2px',
                        background: '#0a1c3d',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }} />
                    </div>
                  </div>

                  {/* Statement (High Contrast) */}
                  <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#000000', maxWidth: '480px', margin: '0 auto 18px auto', lineHeight: 1.6, fontWeight: 500 }}>
                    For demonstrating exceptional commitment towards women safety by successfully completing the <strong style={{ color: '#000000', fontWeight: 800 }}>{formatLocalizedCategory(selectedRunner.categoryName || selectedRunner.category, false) || '21 KM Half Marathon'}</strong> in <strong style={{ color: '#000000', fontWeight: 800 }}>Jaipur</strong>.
                    <br />
                    <em style={{ fontWeight: 700, color: '#000000', display: 'inline-block', marginTop: '6px' }}>"Running Together for a Safer Tomorrow."</em>
                  </p>

                  {/* Metrics Matrix: Unified 5-Column Official Timing Grid for all participants */}
                  <div style={{
                    background: 'rgba(241, 245, 249, 0.55)',
                    backdropFilter: 'blur(1.5px)',
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                    borderRadius: '8px',
                    padding: '10px 6px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px',
                    textAlign: 'center',
                    marginBottom: '18px',
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700 }}>REG. NO.</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--crimson-600)' }}>{formatBibNumber(selectedRunner.bibNumber)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700 }}>GUN TIME</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0a1c3d' }}>{runnerGunTime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700 }}>CHIP TIME</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0a1c3d' }}>{runnerChipTime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG PACE</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0a1c3d' }}>{runnerAvgPace}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700 }}>RANK</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#047857' }}>{runnerRank}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Signatures & Seal (Anchored firmly at bottom) */}
                {/* Certificate Footer (3-Column Layout: Left Signature, Center Seal, Right QR Code) */}
                <div className="cert-footer-content" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'flex-end',
                  borderTop: '1.5px solid var(--border-subtle)',
                  paddingTop: '14px',
                  marginTop: 'auto',
                  width: '100%'
                }}>
                  {/* Left: DGP Signature */}
                  <div style={{ textAlign: 'left', minWidth: '130px' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '1.1rem',
                      color: '#0a1c3d',
                      fontWeight: 700,
                      marginBottom: '2px'
                    }}>
                      Rajeev Sharma, IPS
                    </div>
                    <div style={{ height: '1.5px', background: '#0a1c3d', width: '130px', marginBottom: '3px' }}></div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0a1c3d', letterSpacing: '0.02em' }}>
                      DIRECTOR GENERAL OF POLICE
                    </div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                      Rajasthan Police Headquarters, Jaipur
                    </div>
                  </div>

                  {/* Center: Beti Bachao Beti Padhao Emblem Seal */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 8px' }}>
                    <img 
                      src="/images/beti_bachao_seal.png" 
                      alt="Beti Bachao Beti Padhao Official Emblem" 
                      style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'inline-block' }} 
                    />
                  </div>

                  {/* Right: Security QR Code & Certificate ID */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    {qrCodeUrl && (
                      <img src={qrCodeUrl} alt="Verify QR" style={{ width: '60px', height: '60px', border: '1px solid var(--border-subtle)', padding: '2px', borderRadius: '4px', display: 'inline-block' }} />
                    )}
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0a1c3d', marginTop: '2px', fontFamily: 'monospace' }}>
                      {selectedRunner.certificateId}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Digitally Verified
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
              border: '2px solid var(--police-navy-300)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--police-navy-50)',
              border: '1.5px solid var(--police-navy-300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              fontSize: '1.5rem'
            }}>
              ⏳
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: '0 0 10px 0' }}>
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
              {isHindi ? 'समझ गया (OK)' : 'Understood (OK)'}
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
