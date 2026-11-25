import React from 'react';
import { RACE_DAY_TIMELINE, PROHIBITED_ITEMS } from '../data/mockData';
import { Clock, Package, AlertCircle, ShieldAlert, Luggage } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ScheduleExpo() {
  const { t, isHindi } = useLanguage();

  const hindiTimeline = [
    { time: 'प्रातः 05:00', title: 'धावक रिपोर्टिंग एवं सुरक्षा जांच', desc: 'समस्त पंजीकृत धावक अपने डिजिटल ई-पास एवं फोटो पहचान पत्र के साथ अल्बर्ट हॉल निर्धारित प्रवेश द्वार पर पहुंचें।' },
    { time: 'प्रातः 05:30', title: 'वार्म-अप एवं जुम्बा सत्र', desc: 'होल्डिंग एरिना में हाई-एनर्जी वार्म-अप, संगीत, हाइड्रेशन एवं दौड़ की अंतिम तैयारी।' },
    { time: 'प्रातः 06:00', title: '21 KM हाफ मैराथन फ्लैग-ऑफ', desc: 'वरिष्ठ अतिथियों द्वारा हरी झंडी दिखाकर 21 KM हाफ मैराथन का भव्य शुभारंभ, RFID टाइमिंग मैट सक्रिय।' },
    { time: 'प्रातः 06:15', title: '10 KM स्पीड रन फ्लैग-ऑफ', desc: 'जेएलएन मार्ग सुरक्षित कॉरिडोर पर 10 KM धावकों का फ्लैग-ऑफ।' },
    { time: 'प्रातः 06:45', title: '5 KM कम्युनिटी रन फ्लैग-ऑफ', desc: 'महिला सुरक्षा व सम्मान संकल्प के साथ युवाओं एवं नागरिकों की दौड़ का शुभारंभ।' },
    { time: 'प्रातः 07:15', title: '2 KM फैमिली वॉक फ्लैग-ऑफ', desc: 'परिवारों एवं वरिष्ठ नागरिकों का महिला सशक्तिकरण एवं सहभागिता मार्च।' },
    { time: 'प्रातः 09:30', title: 'दौड़ समापन एवं पुरस्कार वितरण', desc: 'समय-सीमा समाप्ति, फिनिशर मेडल वितरण एवं मुख्य मंच पर पुरस्कार सम्मान समारोह।' }
  ];

  const englishTimeline = [
    { time: '05:00 AM', title: 'Reporting & Security Screening', desc: 'All registered runners report at assigned Albert Hall entry gates with their digital E-Pass & photo ID.' },
    { time: '05:30 AM', title: 'Zumba & Athlete Warm-up', desc: 'High-energy musical warm-up, hydration intake, and marshalling inside the holding pens.' },
    { time: '06:00 AM', title: '21 KM Half Marathon Flag-Off', desc: 'Flagged off by senior dignitaries. Professional timing mat system activated.' },
    { time: '06:15 AM', title: '10 KM Speed Run Flag-Off', desc: 'Flagged off along the protected JLN Marg traffic-free green corridor.' },
    { time: '06:45 AM', title: '5 KM Community Run Flag-Off', desc: 'Youth, college students, and citizens run for women safety and empowerment.' },
    { time: '07:15 AM', title: '2 KM Family Walk Flag-Off', desc: 'Fun walk celebrating women safety and community participation.' },
    { time: '09:30 AM', title: 'Course Cut-Off & Podium Honors', desc: 'Official route cut-off, timing mat closing, and prize felicitation.' }
  ];

  const timelineItems = isHindi ? hindiTimeline : englishTimeline;

  return (
    <section id="schedule" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        {/* Header - Only Middle Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', color: 'var(--police-navy-950)', margin: 0, fontWeight: 900 }}>
            {t('scheduleHeading')}
          </h2>
        </div>

        {/* TOP ROW: Timeline + Bib Expo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '28px', alignItems: 'start', marginBottom: '36px' }} className="sched-responsive-grid">
          
          {/* Race Day Morning Program Timeline */}
          <div className="gov-card" style={{ padding: '28px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <Clock size={24} color="var(--police-navy-900)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                {isHindi ? 'रेस दिवस कार्यक्रम — 24 जनवरी 2027 (अल्बर्ट हॉल, जयपुर)' : 'Race Day Program — 24 January 2027 (Albert Hall, Jaipur)'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                bottom: '10px',
                left: '7px',
                width: '2px',
                background: 'var(--police-navy-800)'
              }}></div>

              {timelineItems.map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '5px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--police-navy-900)',
                    border: '2.5px solid #ffffff',
                    boxShadow: '0 0 0 2px var(--police-navy-800)'
                  }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--police-navy-950)',
                      background: 'var(--police-navy-50)',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-medium)'
                    }}>
                      {item.time}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                      {item.title}
                    </h4>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.55, margin: '4px 0 0 0', fontWeight: 500 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bib Expo & Kit Collection Guide */}
          <div className="gov-card" style={{ padding: '28px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <Package size={24} color="var(--police-navy-900)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--police-navy-950)', margin: 0 }}>
                {isHindi ? 'बिब एक्सपो एवं किट वितरण' : 'Bib Expo & Kit Collection'}
              </h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--police-navy-900)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '4px' }}>
                {isHindi ? 'एक्सपो स्थल' : 'EXPO VENUE'}
              </div>
              <div style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--police-navy-950)', marginBottom: '4px' }}>
                {isHindi ? 'पुलिस मेमोरियल ग्राउंड / एसएमएस इंडोर कॉम्प्लेक्स' : 'Police Memorial Ground / SMS Indoor Complex'}
              </div>
              <div style={{ fontSize: '0.96rem', color: '#334155', lineHeight: 1.5, marginBottom: '6px' }}>
                {isHindi ? 'जेएलएन मार्ग, जयपुर (22-23 जनवरी 2027, सुबह 10:00 से सायं 07:00 बजे तक)' : 'JLN Marg, Jaipur (22-23 Jan 2027, 10:00 AM to 07:00 PM)'}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                {isHindi ? '* जिलों में संबंधित जिला पुलिस अधीक्षक (SP) कार्यालय प्रांगण में एक्सपो आयोजित होगा।' : '* In other districts, expo will be hosted at the respective District SP Headquarters.'}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--police-navy-900)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '8px' }}>
                {isHindi ? 'किट में मिलने वाली सामग्री:' : 'Items Included in Runner Kit:'}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
                {(isHindi ? [
                  "इवेंट ड्राई-फिट रनिंग टी-शर्ट",
                  "RFID टाइमिंग चिप युक्त रेस बिब",
                  "प्रतिभागी बैज एवं महिला सुरक्षा रिबन",
                  "रूट मैप एवं पोस्ट-रन अल्पाहार कूपन",
                  "महिला सुरक्षा हेल्पलाइन ब्रोशर"
                ] : [
                  "Official Dry-Fit Running T-Shirt",
                  "Race BIB with RFID Timing Chip",
                  "Official Participant Badge & Women Safety Ribbon",
                  "Route Map & Post-Run Refreshment Coupon",
                  "Women Safety Helpline Guide"
                ]).map((perk, i) => (
                  <li key={i} style={{ fontSize: '0.96rem', color: 'var(--police-navy-950)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crucial ID Notice */}
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              gap: '12px'
            }}>
              <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.92rem', color: '#78350f', lineHeight: 1.55 }}>
                {isHindi ? (
                  <>
                    <strong style={{ fontWeight: 800 }}>अनिवार्य नियम:</strong> किट प्राप्त करने हेतु डिजिटल ई-पास एवं एक मान्य सरकारी फोटो पहचान पत्र (आधार / वोटर आईडी / कॉलेज आईडी) साथ लाएं। <em>दौड़ वाले दिन सुबह 24 जनवरी को कोई बिब वितरण नहीं होगा।</em>
                  </>
                ) : (
                  <>
                    <strong style={{ fontWeight: 800 }}>Mandatory Rule:</strong> Bring your digital E-Pass and a valid government photo ID (Aadhaar / Voter ID / College ID) to collect your kit. <em>No bib collection will be permitted on race morning (24 Jan).</em>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Baggage Policy + Prohibited Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          
          {/* Baggage Counter Policy */}
          <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--police-navy-950)', fontWeight: 800 }}>
              <Luggage size={22} color="var(--police-navy-900)" />
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {isHindi ? 'बैगेज ड्रॉप काउंटर व्यवस्था' : 'Baggage Counter Facility'}
              </h4>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.65, fontWeight: 500 }}>
              {isHindi ? (
                <>
                  • <strong>स्थान:</strong> अल्बर्ट हॉल गेट 3 (गेट 2 एवं 4 से प्रवेश के उपरांत)<br />
                  • <strong>समय:</strong> सुबह 04:45 AM से 06:15 AM तक सामान जमा होगा।<br />
                  • <strong>सुरक्षा थैला:</strong> केवल राजस्थान पुलिस द्वारा दिए गए टोकन युक्त पारदर्शी बैग में ही कपड़े व जूते जमा किए जाएंगे।<br />
                  • <strong>सख्त निर्देश:</strong> कोई भी कीमती वस्तु (लैपटॉप, नकद धनराशि, आभूषण, मोबाइल) जमा न करें।
                </>
              ) : (
                <>
                  • <strong>Location:</strong> Albert Hall Gate 3 (Post-entry via Gates 2 & 4)<br />
                  • <strong>Timings:</strong> Baggage accepted from 04:45 AM to 06:15 AM.<br />
                  • <strong>Security Bags:</strong> Only transparent token bags issued by Rajasthan Police allowed.<br />
                  • <strong>Strict Advisory:</strong> Do not deposit any valuables, laptops, cash, or jewelry.
                </>
              )}
            </div>
          </div>

          {/* Prohibited Items on Course */}
          <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', borderRadius: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--police-navy-950)', fontWeight: 800 }}>
              <ShieldAlert size={22} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {isHindi ? 'दौड़ मार्ग पर प्रतिबंधित वस्तुएं' : 'Prohibited Items on Race Course'}
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(isHindi ? PROHIBITED_ITEMS : [
                { item: 'Glass bottles & steel tumblers', reason: 'Slip hazard on track' },
                { item: 'Backpacks & heavy bags', reason: 'Security guidelines prohibit' },
                { item: 'Selfie sticks & flags', reason: 'Obstruction to fellow runners' },
                { item: 'Pets & strollers', reason: 'Safety regulations on competitive track' }
              ]).map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.55 }}>
                  <strong style={{ color: '#991b1b', fontWeight: 800 }}>✕ {item.item}:</strong> {item.reason}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .sched-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
