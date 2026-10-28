import React from 'react';
import { Shield, Award, MapPin, Calendar, Clock, AlertCircle, CheckCircle2, Heart, Users, Compass, Droplets } from 'lucide-react';
import { PoliceEmblem } from './Emblems';

export function PatronDesk({ onOpenRegister, onOpenBulkRegister, onNavigate }) {
  return (
    <section id="patron-desk" style={{ background: '#f8fafc', padding: '60px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">

        {/* 1. SECTION: MESSAGE FROM DIRECTOR GENERAL OF POLICE (DGP RAJASTHAN) */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '2px solid var(--police-navy-200)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          marginBottom: '50px'
        }}>
          {/* Official Top Bar */}
          <div style={{
            background: 'var(--police-navy-950)',
            color: '#ffffff',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            borderBottom: '3px solid var(--police-gold-500)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PoliceEmblem size={28} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fde68a', letterSpacing: '0.04em' }}>
                राजस्थान पुलिस मुख्यालय, जयपुर | HEADQUARTERS DESK
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#fef08a', fontWeight: 700 }}>
              ★ सेवार्थ कटिबद्धता ★
            </div>
          </div>

          <div style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
            {/* DGP Portrait & Designation */}
            <div style={{ textAlign: 'center', maxWidth: '340px', margin: '0 auto' }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                borderRadius: '16px',
                padding: '6px',
                background: 'linear-gradient(135deg, var(--police-gold-500), var(--police-navy-800))',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <img
                  src="/images/dgp_rajeev_sharma.jpg"
                  alt="DGP Rajeev Sharma, IPS"
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    height: '340px',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    borderRadius: '12px',
                    display: 'block'
                  }}
                  onError={(e) => {
                    // Fallback placeholder if image not rendered
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  background: 'rgba(10, 28, 61, 0.92)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(212, 175, 55, 0.4)'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fef08a' }}>राजीव शर्मा, भा.पु.से. (IPS)</div>
                  <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>महानिदेशक पुलिस, राजस्थान (DGP)</div>
                </div>
              </div>
            </div>

            {/* DGP Official Written Message */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-gold">आयोजन संरक्षक संदेश</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>आधिकारिक वक्तव्य</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 900, color: 'var(--police-navy-950)', margin: '0 0 16px 0', lineHeight: 1.25 }}>
                "यह केवल 21 किलोमीटर की दौड़ नहीं, बल्कि राजस्थान के हर नागरिक का नारी सुरक्षा के प्रति साझा संकल्प है।"
              </h2>

              <div style={{ fontSize: '0.94rem', color: 'var(--text-body)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0 }}>
                  राजस्थान पुलिस सदैव आमजन में विश्वास और अपराधियों में भय के मूलमंत्र पर कार्य करती रही है। आज समाज में महिलाओं और बेटियों को केवल सुरक्षा का आश्वासन नहीं, बल्कि यह अटूट विश्वास दिलाना आवश्यक है कि प्रदेश का प्रत्येक मार्ग उनके लिए निर्भय और सुरक्षित है।
                </p>
                <p style={{ margin: 0 }}>
                  <strong>'RUN FOR HER'</strong> इसी विचार की अभिव्यक्ति है। 20 दिसंबर 2026 को गुलाबी नगरी जयपुर के ऐतिहासिक अल्बर्ट हॉल से लेकर प्रदेश के समस्त पुलिस जिलों में एक साथ यह महा-आयोजन होगा। इसमें पुलिस के जवान, अधिकारी, खिलाड़ी, छात्र, शिक्षक, चिकित्सक और आम नागरिक एक साथ दौड़ेंगे।
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--police-navy-900)' }}>
                  मैं राजस्थान के समस्त नागरिकों से सादर अपील करता हूँ कि 20 दिसंबर को अपने जूते बांधिए, अपने परिवार के साथ आइए और नारी सम्मान के इस महायज्ञ में भागीदार बनिए।
                </p>
              </div>

              {/* Official Stamp & Sign Off */}
              <div style={{
                marginTop: '22px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>
                    (राजीव शर्मा, भा.पु.से.)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--police-gold-700)', fontWeight: 700 }}>
                    महानिदेशक पुलिस, राजस्थान
                  </div>
                </div>

                <div style={{
                  background: 'var(--crimson-50)',
                  border: '1px solid var(--crimson-200)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--crimson-700)',
                  fontWeight: 800
                }}>
                  ★ मुख्य अतिथि (शाम 06:00 बजे): माननीय मुख्यमंत्री, राजस्थान
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SECTION: RACE DAY LOGISTICS & GROUND ADVISORY (REAL OPERATIONAL FACTS) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(20px, 3.5vw, 36px)',
          border: '1.5px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="badge-gov">रेस दिवस जमीनी व्यवस्था</span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--police-navy-950)' }}>
                धावकों के लिए महत्वपूर्ण दिशा-निर्देश एवं सुविधाएं (Race-Day Guide)
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--police-navy-800)', fontWeight: 800 }}>
              ★ 20 दिसंबर 2026 • अल्बर्ट हॉल प्रांगण, जयपुर ★
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {/* Fact 1: Parking & Entry Gates */}
            <div style={{ background: 'var(--police-navy-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--police-navy-900)', fontWeight: 800 }}>
                <MapPin size={18} color="var(--crimson-600)" />
                <span>पार्किंग एवं प्रवेश द्वार (Gate Plan)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                • <strong>धावक प्रवेश:</strong> न्यू गेट एवं अजमेरी गेट (Gate 2 & 4)<br />
                • <strong>निःशुल्क पार्किंग:</strong> रामनिवास बाग अंडरपास पार्किंग एवं जेडीए बहुमंजिला पार्किंग (स्टेडियम कट)<br />
                • <strong>ट्रैफिक डायवर्जन:</strong> JLN मार्ग सुबह 04:30 से 09:30 तक केवल धावकों हेतु आरक्षित रहेगा।
              </div>
            </div>

            {/* Fact 2: Baggage & Kit Checklist */}
            <div style={{ background: 'var(--police-navy-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--police-navy-900)', fontWeight: 800 }}>
                <CheckCircle2 size={18} color="var(--police-gold-700)" />
                <span>एक्सपो किट व बैगेज व्यवस्था</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                • <strong>किट वितरण:</strong> 18 व 19 दिसंबर (प्रातः 10 AM - 07 PM) अल्बर्ट हॉल आर्ट गैलरी विंग<br />
                • <strong>अनिवार्य दस्तावेज:</strong> रजिस्ट्रेशन SMS/QR कोड एवं वैध फोटो ID प्रूफ (आधार/वोटर ID)<br />
                • <strong>सुरक्षित बैगेज काउंटर:</strong> अल्बर्ट हॉल पूर्वी द्वार पर टोकन सुविधा उपलब्ध।
              </div>
            </div>

            {/* Fact 3: Reporting & Holding Pen Schedule */}
            <div style={{ background: 'var(--police-navy-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--police-navy-900)', fontWeight: 800 }}>
                <Clock size={18} color="var(--police-navy-800)" />
                <span>रिपोर्टिंग समय एवं होल्डिंग ज़ोन</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                • <strong>21 KM हाफ मैराथन:</strong> प्रातः 05:00 AM रिपोर्टिंग | 06:00 AM फ्लैग-ऑफ<br />
                • <strong>10 KM स्पीड रन:</strong> प्रातः 05:15 AM रिपोर्टिंग | 06:15 AM फ्लैग-ऑफ<br />
                • <strong>5 KM कम्युनिटी रन:</strong> प्रातः 05:30 AM रिपोर्टिंग | 06:45 AM फ्लैग-ऑफ<br />
                • <strong>वॉर्म-अप:</strong> मुख्य मंच पर राजस्थान पुलिस बैंड एवं ज़ुम्बा ट्रेनर्स द्वारा।
              </div>
            </div>

            {/* Fact 4: Medical & Hydration Shield */}
            <div style={{ background: 'var(--police-navy-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--police-navy-900)', fontWeight: 800 }}>
                <Droplets size={18} color="#0284c7" />
                <span>मेडिकल, एम्बुलेंस एवं मौसम</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                • <strong>मौसम पूर्वानुमान:</strong> 11°C से 14°C सुहानी गुलाबी ठंड, हल्की हवा (आदर्श रनिंग वेदर)<br />
                • <strong>सुरक्षा कवच:</strong> प्रत्येक 500 मीटर पर निर्भया स्क्वाड एवं 8 एडवांस लाइफ सपोर्ट एम्बुलेंस<br />
                • <strong>हाइड्रेशन:</strong> ग्लूकोज, इलेक्ट्रोलाइट्स, संतरा एवं केला स्टेशंस पूरे 21KM ट्रैक पर।
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
