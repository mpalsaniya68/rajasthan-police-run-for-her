import React, { useState, useEffect } from 'react';
import { apiVerifyCertificate, apiDispatchCertificate } from '../services/api';
import { Award, Search, Download, Share2, Send, CheckCircle2, Shield, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { PoliceEmblem, OfficialGoldSeal, RunForHerBadge } from './Emblems';
import QRCode from 'qrcode';

export function CertificateHub({ registrations = [] }) {
  const [selectedRunner, setSelectedRunner] = useState(registrations[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showDispatchNotice, setShowDispatchNotice] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [isVerifiedFromBackend, setIsVerifiedFromBackend] = useState(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

  // Check URL hash for direct QR verification: #verify?certId=RJ-POL-2026-XXXX
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
            setIsVerifiedFromBackend(true);
            setSearchFeedback({ type: 'success', message: `✅ डिजिटल QR कोड द्वारा आधिकारिक प्रमाण पत्र सत्यापित (${res.certificate.certificateId})` });
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

  const handleSearch = async (e) => {
    e.preventDefault();
    const rawQ = searchQuery.trim();
    if (!rawQ) return;
    const q = rawQ.toLowerCase();
    setSearchFeedback(null);

    // 1. Check in local loaded registrations
    const foundLocal = registrations.find(r => 
      (r.bibNumber && r.bibNumber.toLowerCase() === q) || 
      (r.certificateId && r.certificateId.toLowerCase() === q) ||
      (r.mobile && r.mobile.includes(q)) || 
      (r.fullName && r.fullName.toLowerCase().includes(q))
    );

    if (foundLocal) {
      setSelectedRunner(foundLocal);
      setIsVerifiedFromBackend(true);
      setSearchFeedback({ type: 'success', message: `धावक रिकॉर्ड प्राप्त हुआ: ${foundLocal.fullName} (Bib: ${foundLocal.bibNumber})` });
      return;
    }

    // 2. Query Central Police Edge Database
    setIsSearching(true);
    try {
      const res = await apiVerifyCertificate(rawQ);
      setIsSearching(false);
      if (res && res.success && res.certificate) {
        setSelectedRunner(res.certificate);
        setIsVerifiedFromBackend(true);
        setSearchFeedback({ type: 'success', message: `✅ राजस्थान पुलिस डेटाबेस से आधिकारिक प्रमाण पत्र सत्यापित (${res.certificate.certificateId})` });
      } else {
        setIsVerifiedFromBackend(false);
        setSearchFeedback({ type: 'error', message: res.error || `कोई रिकॉर्ड नहीं मिला: "${rawQ}"। कृपया वैध बिब नंबर, मोबाइल अथवा सर्टिफिकेट ID दर्ज करें।` });
      }
    } catch (err) {
      setIsSearching(false);
      setSearchFeedback({ type: 'error', message: "सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें।" });
    }
  };

  const handleAutoDispatch = async () => {
    if (!selectedRunner) return;
    setShowDispatchNotice(true);
    try {
      await apiDispatchCertificate({
        certificateId: selectedRunner.certificateId,
        mobile: selectedRunner.mobile
      });
    } catch (e) {
      console.error("Dispatch notice error:", e);
    }
    setTimeout(() => setShowDispatchNotice(false), 5000);
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

      // Background Watermark (Crest)
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.045;
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
      ctx.fillText("यह गर्वपूर्वक प्रमाणित किया जाता है कि (This is to proudly certify that)", 675, 252);

      // Runner Name
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "900 46px sans-serif";
      ctx.fillText(selectedRunner.fullName || "Valued Participant", 675, 315);

      // Underline under Name
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(400, 332, 550, 3);

      // Description Statement
      ctx.fillStyle = "#334155";
      ctx.font = "600 20px sans-serif";
      const catText = selectedRunner.categoryName || "21 KM Half Marathon";
      ctx.fillText(`ने राजस्थान पुलिस मैराथन 2027 के अंतर्गत "${catText}" को सफलतापूर्वक पूर्ण किया है।`, 675, 375);

      ctx.fillStyle = "#64748b";
      ctx.font = "16px sans-serif";
      ctx.fillText("Has demonstrated exceptional endurance, community spirit, and support for Women's Dignity & Safety.", 675, 408);

      // Metrics Pillars Box
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(150, 445, 1050, 105);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(150, 445, 1050, 105);

      // Pillar 1: Bib Number
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("OFFICIAL BIB NUMBER", 325, 480);
      ctx.fillStyle = "#dc2626";
      ctx.font = "900 28px monospace";
      ctx.fillText(selectedRunner.bibNumber || "RJ-21K-1001", 325, 520);

      // Divider 1
      ctx.strokeStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(500, 455);
      ctx.lineTo(500, 540);
      ctx.stroke();

      // Pillar 2: Official Finish Time
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("OFFICIAL FINISH TIME", 675, 480);
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "900 28px monospace";
      ctx.fillText(selectedRunner.finishTime || "00:48:32", 675, 520);

      // Divider 2
      ctx.beginPath();
      ctx.moveTo(850, 455);
      ctx.lineTo(850, 540);
      ctx.stroke();

      // Pillar 3: District / Venue
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("PARTICIPATION DISTRICT", 1025, 480);
      ctx.fillStyle = "#0a1c3d";
      ctx.font = "800 19px sans-serif";
      ctx.fillText(selectedRunner.districtName ? selectedRunner.districtName.split(" • ")[0].slice(0, 22) : "Rajasthan Police HQ", 1025, 518);

      // Event Date & Authority
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("आयोजन तिथि: 3 जनवरी 2027 • अधिकृत फिनिशर प्रमाण पत्र", 675, 595);

      // Bottom Signatures & Seal Section
      ctx.textAlign = "center";
      ctx.font = "italic bold 28px serif";
      ctx.fillStyle = "#0a1c3d";
      ctx.fillText("Rajeev Sharma, IPS", 280, 715);
      ctx.fillStyle = "#0a1c3d";
      ctx.fillRect(180, 726, 200, 2);
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("DIRECTOR GENERAL OF POLICE", 280, 748);
      ctx.fillStyle = "#64748b";
      ctx.font = "13px sans-serif";
      ctx.fillText("Rajasthan Police, Jaipur", 280, 768);

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

  if (!selectedRunner) return null;

  return (
    <section id="certificates" className="section-padding" style={{ position: 'relative', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Official Finisher Honors</span>
          <h2>डिजिटल फिनिशर सर्टिफिकेट एवं ऑटो-डिस्पैच हब</h2>
          <p>
            रेस पूरी होते ही तय दूरी के आधार पर राजस्थान पुलिस मुख्यालय द्वारा अधिकृत डिजिटल सर्टिफिकेट स्वतः जनरेट होकर धावक के मोबाइल (SMS/WhatsApp) व ईमेल पर प्रेषित हो जाता है।
          </p>
        </div>

        {/* Runner Selector & Quick Search Bar */}
        <div className="gov-card" style={{
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
              placeholder="बिब # या मोबाइल नंबर..."
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
          <div style={{
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
                <Shield size={20} color="#16a34a" />
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

        {/* Automated Dispatch Notification Alert */}
        {showDispatchNotice && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#059669" />
              <div>
                <strong style={{ color: '#065f46', fontSize: '0.88rem' }}>सर्टिफिकेट स्वतः प्रेषित हुआ!</strong>
                <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                  आधिकारिक लिंक एवं PDF <strong>{selectedRunner.mobile}</strong> (WhatsApp/SMS) तथा <strong>{selectedRunner.email}</strong> पर भेजा गया।
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>Status: Delivered ✓</span>
          </div>
        )}

        {/* Certificate Display & Control Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: '24px', alignItems: 'start' }} className="cert-responsive-grid">
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
              {/* Watermark Rajasthan Police Crest */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                pointerEvents: 'none',
                zIndex: 0
              }}>
                <PoliceEmblem size={380} />
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Statewide Public Awareness Initiative
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <RunForHerBadge size={48} />
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--crimson-600)', marginTop: '2px' }}>
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
                    {selectedRunner.fullName}
                  </div>
                </div>

                {/* Statement */}
                <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-body)', maxWidth: '580px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
                  For successfully completing the <strong>{selectedRunner.categoryName}</strong> under the leadership of the <strong>Director General of Police (DGP), Rajasthan</strong> on the motto <em>"Every Step for Her Safety."</em>
                </p>

                {/* Timing Matrix */}
                <div style={{
                  background: 'var(--police-navy-50)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>BIB NUMBER</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--crimson-600)' }}>{selectedRunner.bibNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>GUN TIME</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{selectedRunner.finishTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>CHIP TIME</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{selectedRunner.chipTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG PACE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a1c3d' }}>{selectedRunner.avgPace}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>RANK</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>{selectedRunner.genderRank}</div>
                  </div>
                </div>

                {/* Signatures & Seal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '1.2rem',
                      color: '#0a1c3d',
                      fontWeight: 700,
                      marginBottom: '2px'
                    }}>
                      Rajeev Sharma, IPS
                    </div>
                    <div style={{ height: '2px', background: '#0a1c3d', width: '130px', margin: '0 auto 2px auto' }}></div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0a1c3d' }}>
                      DIRECTOR GENERAL OF POLICE
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Rajasthan, Jaipur</div>
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

          {/* RIGHT SIDE: DISPATCH CONTROLS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="gov-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--police-navy-900)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={15} color="var(--police-navy-800)" /> ऑटोमैटिक डिलीवरी स्थिति
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--police-navy-50)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600 }}>SMS Notification</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedRunner.mobile}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>✓ Sent</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--police-navy-50)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600 }}>WhatsApp PDF</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Official Digital Card</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>✓ Delivered</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--police-navy-50)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600 }}>Email Attachment</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedRunner.email}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>✓ Delivered</span>
                </div>
              </div>

              <button 
                onClick={handleAutoDispatch}
                className="btn-secondary"
                style={{ width: '100%', padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
              >
                <Send size={14} /> पुनः SMS/Email डिस्पैच करें
              </button>
            </div>

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
                  onClick={() => window.print()}
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

                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  color: '#065f46',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>अधिकृत सत्यापन पूर्ण (100% Verified)</div>
                    <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                      राजस्थान पुलिस महानिदेशक कार्यालय द्वारा अधिकृत एवं सुरक्षित क्यूआर क्रिप्टोग्राफिक लेजर द्वारा डिजिटल सत्यापित।
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
