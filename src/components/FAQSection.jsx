import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Shield, CheckCircle2, Phone, Sparkles } from 'lucide-react';

export function FAQSection({ onOpenRegister, onNavigate }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "क्या राजस्थान पुलिस मैराथन 2026 में भाग लेने के लिए कोई पंजीकरण शुल्क है?",
      a: "नहीं, यह राजस्थान पुलिस मुख्यालय, जयपुर का नारी सुरक्षा, सम्मान एवं सशक्तिकरण को समर्पित 100% निःशुल्क राज्यव्यापी जन-अभियान है। 21K हाफ मैराथन, 10K स्पीड रन, 5K कम्युनिटी रन और 2K फैमिली वॉक—सभी श्रेणियों में प्रवेश पूर्णतः निःशुल्क है।"
    },
    {
      q: "रनिंग किट, टी-शर्ट और RFID बिब कब और कहाँ से प्राप्त होंगे?",
      a: "सभी पंजीकृत धावकों को 18 और 19 दिसंबर 2026 (प्रातः 10:00 बजे से सायं 07:00 बजे तक) बिब एक्सपो के दौरान किट वितरित की जाएगी। जयपुर में यह वितरण अल्बर्ट हॉल / रामनिवास बाग प्रांगण में होगा, तथा जिला मुख्यालयों पर संबंधित जिला पुलिस लाइन में होगा। किट प्राप्त करने हेतु अपना डिजिटल ई-पास (E-Pass) और वैध फोटो पहचान पत्र (आधार कार्ड / पैन / वोटर ID) साथ लाएं।"
    },
    {
      q: "क्या फिनिशर मेडल और डिजिटल ई-सर्टिफिकेट सभी को मिलेगा?",
      a: "हाँ, निर्धारित कट-ऑफ समय में अपनी दौड़ पूर्ण करने वाले प्रत्येक प्रतिभागी को राजस्थान पुलिस का आधिकारिक फिनिशर मेडल प्रदान किया जाएगा। इसके अतिरिक्त, पुलिस महानिदेशक (DGP) द्वारा हस्ताक्षरित आधिकारिक ई-प्रमाण पत्र दौड़ समाप्त होने के 2 घंटे के भीतर आपके पंजीकृत मोबाइल (WhatsApp/SMS) और ईमेल पर स्वतः प्रेषित कर दिया जाएगा।"
    },
    {
      q: "20 दिसंबर को दौड़ का रिपोर्टिंग समय और फ्लैग-ऑफ का समय क्या है?",
      a: "• 21 KM हाफ मैराथन: प्रातः 05:00 AM रिपोर्टिंग | 06:00 AM फ्लैग-ऑफ\n• 10 KM स्पीड रन: प्रातः 05:15 AM रिपोर्टिंग | 06:15 AM फ्लैग-ऑफ\n• 5 KM कम्युनिटी रन: प्रातः 05:30 AM रिपोर्टिंग | 06:45 AM फ्लैग-ऑफ\n• 2 KM फैमिली वॉक: प्रातः 06:00 AM रिपोर्टिंग | 07:15 AM फ्लैग-ऑफ\nकृपया दौड़ से कम से कम 45 मिनट पूर्व अपने निर्धारित गेट पर पहुँचें।"
    },
    {
      q: "दौड़ के दिन वाहनों की पार्किंग और ट्रैफिक डायवर्जन की क्या व्यवस्था है?",
      a: "धावकों की पूर्ण सुरक्षा हेतु जेएलएन मार्ग (अल्बर्ट हॉल से जवाहर सर्किल तक) सुबह 04:30 बजे से 09:30 बजे तक आम यातायात के लिए बंद रहेगा और केवल मैराथन के लिए आरक्षित रहेगा। प्रतिभागियों के वाहनों के लिए रामनिवास बाग अंडरपास पार्किंग एवं जेडीए मल्टी-लेवल पार्किंग (स्टेडियम कट) में निःशुल्क आरक्षित पार्किंग उपलब्ध रहेगी।"
    },
    {
      q: "यदि मेरा ई-पास खो गया हो या मोबाइल डिलीट हो गया हो, तो क्या नया फॉर्म भरना पड़ेगा?",
      a: "बिल्कुल नहीं! आपको दोबारा फॉर्म भरने की आवश्यकता नहीं है। आप पोर्टल के 'रजिस्ट्रेशन' पेज पर जाकर 'ई-पास खोजें (Find My E-Pass)' टैब पर क्लिक करें और अपना 10 अंकों का मोबाइल नंबर दर्ज करें। आपका आधिकारिक ई-पास तुरंत स्क्रीन पर आ जाएगा जिसे आप पुनः प्रिंट अथवा डाउनलोड कर सकते हैं।"
    },
    {
      q: "क्या स्कूल, कॉलेज या खेल संस्थान अपने सभी धावकों का एक साथ ग्रुप रजिस्ट्रेशन कर सकते हैं?",
      a: "हाँ, 50 अथवा उससे अधिक प्रतिभागियों के लिए पोर्टल पर 'संस्थागत / बल्क रजिस्ट्रेशन' की सुविधा उपलब्ध है। संस्था के नोडल अधिकारी एक्सेल/CSV टेम्पलेट डाउनलोड करके एक क्लिक में पूरे समूह का ऑटो-पंजीकरण कर सकते हैं।"
    },
    {
      q: "रेस के दौरान चिकित्सा, एम्बुलेंस अथवा आपात स्थिति में क्या सहायता उपलब्ध रहेगी?",
      a: "प्रत्येक 500 मीटर पर राजस्थान पुलिस निर्भया स्क्वाड, महिला पुलिसकर्मी, प्राथमिक चिकित्सा बूथ तथा 8 एडवांस लाइफ सपोर्ट (ALS) एम्बुलेंस तैनात रहेंगी। किसी भी अप्रत्याशित परिस्थिति में 24x7 महिला हेल्पलाइन 1090 अथवा राष्ट्रीय आपातकालीन सेवा 112 पर तुरंत संपर्क किया जा सकता है।"
    }
  ];

  return (
    <section id="faq-section" style={{ background: '#ffffff', padding: '60px 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--police-navy-50)',
            color: 'var(--police-navy-900)',
            padding: '6px 16px',
            borderRadius: '100px',
            fontSize: '0.82rem',
            fontWeight: 800,
            border: '1px solid var(--border-medium)',
            marginBottom: '12px'
          }}>
            <HelpCircle size={15} color="var(--crimson-600)" />
            <span>प्रतिभागी सहायता केंद्र • FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 900,
            color: 'var(--police-navy-950)',
            margin: '0 0 12px 0'
          }}>
            अक्सर पूछे जाने वाले महत्वपूर्ण सवाल (FAQs)
          </h2>

          <p style={{
            fontSize: '0.96rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            राजस्थान पुलिस मैराथन 2026 'RUN FOR HER' के संबंध में धावकों एवं नागरिकों द्वारा पूछे जाने वाले सामान्य प्रश्नों के आधिकारिक उत्तर।
          </p>
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
              निःशुल्क पंजीकरण करें &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
