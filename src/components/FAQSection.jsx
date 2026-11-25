import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function FAQSection({ onNavigate }) {
  const { t, isHindi } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqsHi = [
    {
      q: "राजस्थान पुलिस मैराथन 2027 में भाग लेने की क्या प्रक्रिया व सुविधाएं हैं?",
      a: "राजस्थान पुलिस मैराथन 2027 ('Run for Her' अभियान) में राज्य का कोई भी नागरिक, महिला, युवा एवं धावक पोर्टल पर ऑनलाइन पंजीकरण करके सीधे भाग ले सकता है। पंजीकृत प्रतिभागियों को ड्राई-फिट टी-शर्ट, RFID टाइमिंग चिप बिब, फिनिशर मेडल, DGP हस्ताक्षरित डिजिटल ई-सर्टिफिकेट, हाइड्रेशन एवं पोस्ट-रन रिफ्रेशमेंट्स प्रदान किए जाएंगे।"
    },
    {
      q: "रनिंग किट, टी-शर्ट और RFID बिब कब और कहाँ से प्राप्त होंगे?",
      a: "सभी पंजीकृत धावकों को 22 और 23 जनवरी 2027 (प्रातः 10:00 बजे से सायं 07:00 बजे तक) बिब एक्सपो (अल्बर्ट हॉल, रामनिवास बाग प्रांगण, जयपुर) के दौरान किट वितरित की जाएगी। किट प्राप्त करने हेतु अपना डिजिटल ई-पास (E-Pass) और वैध फोटो पहचान पत्र (आधार कार्ड / पैन / वोटर ID) साथ लाएं।"
    },
    {
      q: "क्या फिनिशर मेडल और डिजिटल ई-सर्टिफिकेट सभी को मिलेगा?",
      a: "हाँ, निर्धारित कट-ऑफ समय में अपनी दौड़ पूर्ण करने वाले प्रत्येक प्रतिभागी को राजस्थान पुलिस का फिनिशर मेडल प्रदान किया जाएगा। इसके अतिरिक्त, पुलिस महानिदेशक (DGP) द्वारा हस्ताक्षरित ई-प्रमाण पत्र दौड़ समाप्त होने के 2 घंटे के भीतर आपके पंजीकृत मोबाइल (WhatsApp/SMS) और ईमेल पर स्वतः प्रेषित कर दिया जाएगा।"
    },
    {
      q: "24 जनवरी 2027 को दौड़ का रिपोर्टिंग समय और फ्लैग-ऑफ का समय क्या है?",
      a: "• 21 KM हाफ मैराथन: प्रातः 05:00 AM रिपोर्टिंग | 06:00 AM फ्लैग-ऑफ\n• 10 KM स्पीड रन: प्रातः 05:15 AM रिपोर्टिंग | 06:15 AM फ्लैग-ऑफ\n• 5 KM कम्युनिटी रन: प्रातः 05:30 AM रिपोर्टिंग | 06:45 AM फ्लैग-ऑफ\n• 2 KM फैमिली वॉक: प्रातः 06:00 AM रिपोर्टिंग | 07:15 AM फ्लैग-ऑफ\nकृपया दौड़ से कम से कम 45 मिनट पूर्व अपने निर्धारित गेट पर पहुँचें।"
    },
    {
      q: "दौड़ के दिन वाहनों की पार्किंग और ट्रैफिक डायवर्जन की क्या व्यवस्था है?",
      a: "धावकों की पूर्ण सुरक्षा हेतु जेएलएन मार्ग (अल्बर्ट हॉल से जवाहर सर्किल तक) सुबह 04:30 बजे से 09:30 बजे तक आम यातायात के लिए बंद रहेगा और केवल मैराथन के लिए आरक्षित रहेगा। प्रतिभागियों के वाहनों के लिए रामनिवास बाग अंडरपास पार्किंग एवं जेडीए मल्टी-लेवल पार्किंग (स्टेडियम कट) में निःशुल्क आरक्षित पार्किंग उपलब्ध रहेगी।"
    },
    {
      q: "यदि मेरा ई-पास खो गया हो या मोबाइल डिलीट हो गया हो, तो क्या नया फॉर्म भरना पड़ेगा?",
      a: "बिल्कुल नहीं! आपको दोबारा फॉर्म भरने की आवश्यकता नहीं है। आप पोर्टल के 'रजिस्ट्रेशन' पेज पर जाकर 'ई-पास खोजें (Find My E-Pass)' टैब पर क्लिक करें और अपना 10 अंकों का मोबाइल नंबर दर्ज करें। आपका ई-पास तुरंत स्क्रीन पर आ जाएगा जिसे आप पुनः प्रिंट अथवा डाउनलोड कर सकते हैं।"
    },
    {
      q: "क्या एक ही परिवार या समूह के सदस्य अलग-अलग फॉर्म भर सकते हैं?",
      a: "हाँ, प्रत्येक प्रतिभागी का नाम, आयु व विवरण अलग से दर्ज करके अपना व्यक्तिगत ई-पास एवं पंजीकरण संख्या प्राप्त कर सकते हैं।"
    },
    {
      q: "रेस के दौरान चिकित्सा, एम्बुलेंस अथवा आपात स्थिति में क्या सहायता उपलब्ध रहेगी?",
      a: "प्रत्येक 500 मीटर पर राजस्थान पुलिस निर्भया स्क्वाड, महिला पुलिसकर्मी, प्राथमिक चिकित्सा बूथ तथा 8 एडवांस लाइफ सपोर्ट (ALS) एम्बुलेंस तैनात रहेंगी। किसी भी अप्रत्याशित परिस्थिति में 24x7 महिला हेल्पलाइन 1090 अथवा राष्ट्रीय आपातकालीन सेवा 112 पर तुरंत संपर्क किया जा सकता है।"
    }
  ];

  const faqsEn = [
    {
      q: "What is the procedure to participate in Rajasthan Police Marathon 2027 and what perks are included?",
      a: "Any citizen, woman, youth, and runner can participate directly by registering online on this portal for the 'Run for Her' marathon. Registered runners receive a dry-fit running t-shirt, RFID timing chip bib, official finisher medal, DGP-signed digital e-certificate, hydration on course, and post-run refreshments."
    },
    {
      q: "When and where will the running kit, T-shirt, and RFID bib be distributed?",
      a: "Kits will be distributed during the 2-day Bib Expo on 22nd & 23rd January 2027 (10:00 AM to 07:00 PM) at Albert Hall / Ram Niwas Garden, Jaipur. Please bring your digital E-Pass and a valid government photo ID (Aadhaar / Voter ID / College ID)."
    },
    {
      q: "Will all finishers receive medals and digital E-Certificates?",
      a: "Yes! Every participant who completes their run within the official cut-off time will be awarded an official Rajasthan Police Finisher Medal. A verified digital e-certificate signed by the Director General of Police (DGP) will also be sent to your registered WhatsApp/SMS and email within 2 hours of race completion."
    },
    {
      q: "What are the reporting and flag-off timings on race day (24 January 2027)?",
      a: "• 21 KM Half Marathon: 05:00 AM Reporting | 06:00 AM Flag-Off\n• 10 KM Speed Run: 05:15 AM Reporting | 06:15 AM Flag-Off\n• 5 KM Community Run: 05:30 AM Reporting | 06:45 AM Flag-Off\n• 2 KM Family Walk: 06:00 AM Reporting | 07:15 AM Flag-Off\nPlease arrive at your designated entry gate at least 45 minutes prior to flag-off."
    },
    {
      q: "What are the parking arrangements and traffic diversions on race day?",
      a: "For complete runner safety, JLN Marg corridor (from Albert Hall to Jawahar Circle) will be strictly closed to general traffic from 04:30 AM to 09:30 AM and reserved exclusively for runners. Free dedicated parking is provided at Ram Niwas Garden Underpass Parking and JDA Multi-Level Parking."
    },
    {
      q: "If I lose my E-Pass or delete the SMS, do I need to register again?",
      a: "No! There is no need to fill out a new form. Visit the 'Find E-Pass' tab on this portal, enter your 10-digit mobile number, and your original E-Pass will appear instantly on screen, ready to view, print, or download."
    },
    {
      q: "Can multiple members from a family or group register individually?",
      a: "Yes, each participant can enter their individual details to receive their unique personal E-Pass and registration number."
    },
    {
      q: "What medical and emergency support is available along the race route?",
      a: "Rajasthan Police Nirbhaya Squad, female police officers, first-aid posts, and 8 Advanced Life Support (ALS) ambulances are stationed every 500 meters along the corridor. In any emergency, call 24x7 Women Helpline 1090 or National Emergency 112 immediately."
    }
  ];

  const faqs = isHindi ? faqsHi : faqsEn;

  return (
    <section id="faq-section" style={{ background: '#ffffff', padding: '60px 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Header - Only Middle Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)',
            fontWeight: 900,
            color: 'var(--police-navy-950)',
            margin: 0
          }}>
            {t('faqHeading')}
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isOpen ? '#ffffff' : 'var(--police-navy-50)',
                  border: isOpen ? '2px solid var(--police-navy-800)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  boxShadow: isOpen ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.25s ease',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isOpen ? 'var(--police-navy-900)' : '#e2e8f0',
                      color: isOpen ? '#fde68a' : 'var(--police-navy-900)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      Q{idx + 1}
                    </span>
                    <span style={{
                      fontSize: 'clamp(0.92rem, 1.8vw, 1.05rem)',
                      fontWeight: 800,
                      color: isOpen ? 'var(--police-navy-950)' : 'var(--police-navy-900)'
                    }}>
                      {faq.q}
                    </span>
                  </div>

                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isOpen ? 'var(--police-gold-500)' : '#ffffff',
                    color: isOpen ? '#0a1c3d' : 'var(--police-navy-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 22px 20px 60px',
                    color: 'var(--text-body)',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '14px',
                    animation: 'fadeIn 0.2s ease-in'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Assistance Help Strip */}
        <div style={{
          marginTop: '36px',
          background: 'linear-gradient(135deg, var(--police-navy-950) 0%, var(--police-navy-900) 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          border: '1.5px solid var(--police-gold-500)'
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fef08a' }}>
              क्या आपका कोई और सवाल है?
            </div>
            <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '2px' }}>
              राजस्थान पुलिस महिला गरिमा हेल्पलाइन 1090 एवं राष्ट्रीय आपातकालीन सेवा 112 पर चौबीसों घंटे सहायता उपलब्ध है।
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate && onNavigate('register')}
              className="btn-gold"
              style={{ padding: '9px 18px', fontSize: '0.86rem' }}
            >
              ऑनलाइन पंजीकरण करें &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
