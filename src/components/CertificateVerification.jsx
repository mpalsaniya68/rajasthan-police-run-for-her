import React, { useState } from 'react';
import { Shield, CheckCircle2, Search, FileCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { PoliceEmblem, OfficialGoldSeal } from './Emblems';

export function CertificateVerification({ registrations = [] }) {
  const [certInput, setCertInput] = useState("RPM-2026-RAJ-1048");
  const [verifiedRecord, setVerifiedRecord] = useState(
    registrations.find(r => r.certificateId === "RPM-2026-RAJ-1048") || registrations[0] || null
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = (idToVerify) => {
    const target = (idToVerify || certInput).trim().toUpperCase();
    setErrorMsg("");

    const match = registrations.find(r => 
      r.certificateId.toUpperCase() === target ||
      r.bibNumber.toUpperCase() === target
    );

    if (match) {
      setVerifiedRecord(match);
      setCertInput(match.certificateId);
    } else {
      setVerifiedRecord(null);
      setErrorMsg(`सर्टिफिकेट आईडी अथवा बिब "${target}" का कोई अधिकृत रिकॉर्ड नहीं मिला। कृपया पुनः जांचें।`);
    }
  };

  return (
    <section id="verify" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gov">Authenticity Verification</span>
          <h2>आधिकारिक सर्टिफिकेट सत्यापन पोर्टल (Certificate Verification)</h2>
          <p>
            राजस्थान पुलिस मुख्यालय द्वारा जारी किसी भी फिनिशर सर्टिफिकेट की प्रामाणिकता जांचने के लिए नीचे सर्टिफिकेट आईडी अथवा बिब नंबर दर्ज करें।
          </p>
        </div>

        {/* Verification Input Box */}
        <div className="gov-card" style={{
          maxWidth: '720px',
          margin: '0 auto 30px auto',
          padding: '24px',
          border: '2px solid var(--border-medium)'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="सर्टिफिकेट ID (उदा. RPM-2026-RAJ-1048) अथवा बिब #..."
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '11px 14px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => handleVerify(certInput)}
              className="btn-navy"
              style={{ padding: '11px 22px', fontSize: '0.9rem' }}
            >
              <FileCheck size={16} /> सत्यापित करें
            </button>
          </div>

          {/* Quick Demo Test Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>सैंपल रिकॉर्ड टेस्ट:</span>
            {registrations.slice(0, 3).map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setCertInput(r.certificateId);
                  handleVerify(r.certificateId);
                }}
                style={{
                  background: 'var(--police-navy-50)',
                  color: 'var(--police-navy-800)',
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {r.certificateId} ({r.fullName.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        {verifiedRecord ? (
          <div className="gov-card" style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '26px',
            border: '2px solid #059669',
            background: '#ffffff'
          }}>
            {/* Top Verification Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={24} color="#15803d" />
                </div>
                <div>
                  <div style={{ color: '#15803d', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                    सर्टिफिकेट अधिकृत एवं सत्यापित (GENUINE & VALID)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    राजस्थान पुलिस राज्य मुख्यालय ऑथेंटिकेशन लेजर
                  </div>
                </div>
              </div>

              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid #86efac'
              }}>
                STATUS: ACTIVE & AUTHENTIC
              </span>
            </div>

            {/* Credential Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>धावक का नाम</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>{verifiedRecord.fullName}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>सर्टिफिकेट ID</div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--police-gold-700)', fontFamily: 'monospace' }}>{verifiedRecord.certificateId}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>अलॉटेड बिब #</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--crimson-600)' }}>{verifiedRecord.bibNumber}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>इवेंट कैटेगरी</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--police-navy-800)' }}>{verifiedRecord.categoryName}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>आधिकारिक समय (Gun Time)</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>{verifiedRecord.finishTime}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>नेट चिप टाइम (Chip Time)</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--police-navy-900)' }}>{verifiedRecord.chipTime}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>स्थान / जिला</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-body)' }}>{verifiedRecord.districtName}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>कैटेगरी रैंक</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>{verifiedRecord.genderRank}</div>
              </div>
            </div>

            {/* Cryptographic Assurance Footer */}
            <div style={{
              background: 'var(--police-navy-50)',
              padding: '10px 14px',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="var(--police-gold-700)" />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Digitally Authorized by Director General of Police (DGP), Rajasthan
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Ledger ID: #RJ-POL-2026-VERIFIED
              </div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="gov-card" style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #ef4444',
            background: '#fef2f2',
            textAlign: 'center'
          }}>
            <AlertTriangle size={30} color="#dc2626" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ color: '#b91c1c', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
              सत्यापन रिकॉर्ड नहीं मिला
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-body)' }}>
              {errorMsg}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
