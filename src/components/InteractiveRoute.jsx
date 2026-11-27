import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Droplets, 
  HeartPulse, 
  Timer, 
  Music, 
  Shield, 
  Navigation, 
  ExternalLink, 
  Flag, 
  Clock, 
  Award,
  Compass
} from 'lucide-react';
import { 
  JAIPUR_ROUTE_CONFIGS, 
  HorizontalRouteMapCard, 
  ALBERT_HALL_MAPS_URL 
} from '../utils/jaipurRouteMap';
import QRCode from 'qrcode';
import { useLanguage } from '../context/LanguageContext';

export function InteractiveRoute() {
  const { t, isHindi } = useLanguage();
  // Category Selector: Default to '21k' as requested by the user
  const [selectedCategory, setSelectedCategory] = useState('21k');
  const [activeFacilityFilter, setActiveFacilityFilter] = useState('all');
  const [locationQrUrl, setLocationQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(ALBERT_HALL_MAPS_URL, {
      width: 140,
      margin: 1,
      color: { dark: '#0a1c3d', light: '#ffffff' }
    })
      .then(url => setLocationQrUrl(url))
      .catch(() => {});
  }, []);

  const routeConfig = JAIPUR_ROUTE_CONFIGS[selectedCategory] || JAIPUR_ROUTE_CONFIGS['21k'];

  // Checkpoints for each category
  const CHECKPOINTS_DATA = {
    '21k': isHindi ? [
      { km: "0 KM", name: "अल्बर्ट हॉल (रामनिवास बाग)", type: "start", typeLabel: "प्रारंभ बिंदु", notes: "फ्लैग-ऑफ गैन्ट्री, RFID टाइमिंग मैट, वॉर्म-अप एरिना" },
      { km: "1.5 KM", name: "त्रिमूर्ति सर्किल", type: "water", typeLabel: "जल सेवा", notes: "इलेक्ट्रोलाइट पेय, शीतल जल, प्राथमिक चिकित्सा वैन" },
      { km: "3.5 KM", name: "बिरला मंदिर / राजस्थान विश्वविद्यालय", type: "water", typeLabel: "जल सेवा", notes: "हाइड्रेशन स्टेशन, पुलिस पेट्रोलिंग पोस्ट" },
      { km: "5.5 KM", name: "गांधी सर्किल क्रॉसिंग", type: "timing", typeLabel: "टाइमिंग मैट", notes: "5K टर्नअराउंड कट, 21K टाइमिंग मैट, पुलिस पाइप बैंड" },
      { km: "8.5 KM", name: "एमएनआईटी एवं एपेक्स सर्किल", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "ऊर्जावर्धक फल, संगीत एवं राजस्थानी लोक कलाकार" },
      { km: "10.5 KM", name: "जवाहर सर्किल / पत्रिका गेट", type: "timing", typeLabel: "U-टर्न पॉइंट", notes: "21K U-टर्न टाइमिंग मैट, मुख्य मेडिकल बेस व रिफ्रेशमेंट" },
      { km: "12.0 KM", name: "वर्ल्ड ट्रेड पार्क (WTP) वापसी", type: "water", typeLabel: "जल सेवा", notes: "हाई-स्पीड हाइड्रेशन एवं आइस स्पंजिंग स्टेशन" },
      { km: "15.5 KM", name: "केवी स्कूल लूप", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "युवा धावक प्रोत्साहन स्क्वाड, एनर्जी ग्लूकोज डेस्क" },
      { km: "17.5 KM", name: "जवाहर कला केंद्र (JKK)", type: "medical", typeLabel: "चिकित्सा केंद्र", notes: "आईसीयू एम्बुलेंस, फिजियोथेरेपी व क्रैम्प रिलीफ डेस्क" },
      { km: "19.5 KM", name: "जेडीए / सोनी हॉस्पिटल मोड़", type: "water", typeLabel: "जल सेवा", notes: "अंतिम 1.5 KM स्पीड बूस्ट हाइड्रेशन पोस्ट" },
      { km: "21.097 KM", name: "अल्बर्ट हॉल फिनिश लाइन", type: "finish", typeLabel: "समापन रेखा", notes: "फिनिशर मेडल वितरण, रिकवरी ब्रेकफास्ट, मेडिकल लाउंज" }
    ] : [
      { km: "0 KM", name: "Albert Hall Museum (Ram Niwas Garden)", type: "start", typeLabel: "Start Point", notes: "Flag-off gantry, RFID timing mats, athlete warm-up arena" },
      { km: "1.5 KM", name: "Trimurti Circle", type: "water", typeLabel: "Hydration Station", notes: "Electrolyte hydration drinks, water, first-aid unit" },
      { km: "3.5 KM", name: "Birla Mandir / Rajasthan University", type: "water", typeLabel: "Hydration Station", notes: "Hydration station, police patrol post" },
      { km: "5.5 KM", name: "Gandhi Circle Crossing", type: "timing", typeLabel: "Timing Mat", notes: "5K turnaround cut, 21K timing mat, live police pipe band" },
      { km: "8.5 KM", name: "MNIT & Apex Circle", type: "cheer", typeLabel: "Cheering Zone", notes: "Energy fruits, cheering squads, and folk performances" },
      { km: "10.5 KM", name: "Jawahar Circle / Patrika Gate", type: "timing", typeLabel: "U-Turn Point", notes: "21K U-turn timing mat, main medical base & refreshments" },
      { km: "12.0 KM", name: "World Trade Park (WTP) Inbound", type: "water", typeLabel: "Hydration Station", notes: "High-speed hydration and ice sponging station" },
      { km: "15.5 KM", name: "KV School Loop", type: "cheer", typeLabel: "Cheering Zone", notes: "Youth cheer squad, energy glucose replenishment desk" },
      { km: "17.5 KM", name: "Jawahar Kala Kendra (JKK)", type: "medical", typeLabel: "Medical Center", notes: "ICU ambulance standby, physiotherapy & cramp relief desk" },
      { km: "19.5 KM", name: "JDA / Soni Hospital Mod", type: "water", typeLabel: "Hydration Station", notes: "Final 1.5 KM speed boost hydration post" },
      { km: "21.097 KM", name: "Albert Hall Grand Finish Line", type: "finish", typeLabel: "Finish Line", notes: "Finisher medal presentation, recovery breakfast, medical lounge" }
    ],
    '10k': isHindi ? [
      { km: "0 KM", name: "अल्बर्ट हॉल (फ्लैग-ऑफ)", type: "start", typeLabel: "प्रारंभ बिंदु", notes: "फ्लैग-ऑफ गैन्ट्री, RFID टाइमिंग मैट, वॉर्म-अप ज़ोन" },
      { km: "1.2 KM", name: "त्रिमूर्ति सर्किल", type: "water", typeLabel: "जल सेवा", notes: "शीतल पेयजल एवं त्वरित प्राथमिक चिकित्सा पोस्ट" },
      { km: "2.2 KM", name: "बिरला मंदिर", type: "water", typeLabel: "जल सेवा", notes: "इलेक्ट्रोलाइट ड्रिंक्स डेस्क, महिला पुलिस सहायता केंद्र" },
      { km: "3.2 KM", name: "राजस्थान विश्वविद्यालय गेट", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "छात्र-छात्रा प्रोत्साहन बैंड, हाइड्रेशन पॉइंट" },
      { km: "4.2 KM", name: "गांधी सर्किल", type: "medical", typeLabel: "चिकित्सा केंद्र", notes: "पैरामेडिक टीम, एम्बुलेंस स्टैंडबाय" },
      { km: "5.0 KM", name: "डीबी क्रॉसिंग / एमएनआईटी कट", type: "timing", typeLabel: "U-टर्न पॉइंट", notes: "10K U-टर्न टाइमिंग मैट, एनर्जी ड्रिंक्स" },
      { km: "6.0 KM", name: "कॉमर्स कॉलेज", type: "water", typeLabel: "जल सेवा", notes: "वापसी मार्ग जल सेवा एवं ग्लूकोज" },
      { km: "7.2 KM", name: "जवाहर कला केंद्र", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "पुलिस बैंड वादन एवं सांस्कृतिक स्वागत" },
      { km: "8.2 KM", name: "कनोडिया कॉलेज क्रॉसिंग", type: "water", typeLabel: "जल सेवा", notes: "शीतलता स्पंज एवं एनर्जी जल डेस्क" },
      { km: "9.0 KM", name: "जेडीए सर्किल", type: "medical", typeLabel: "चिकित्सा केंद्र", notes: "रैपिड रिस्पॉन्स प्राथमिक उपचार" },
      { km: "10.0 KM", name: "अल्बर्ट हॉल फिनिश लाइन", type: "finish", typeLabel: "समापन रेखा", notes: "10K फिनिशर मेडल, टाइमिंग स्लिप व रिफ्रेशमेंट्स" }
    ] : [
      { km: "0 KM", name: "Albert Hall Museum (Flag-Off)", type: "start", typeLabel: "Start Point", notes: "Flag-off gantry, RFID timing mats, warm-up zone" },
      { km: "1.2 KM", name: "Trimurti Circle", type: "water", typeLabel: "Hydration Station", notes: "Fresh drinking water & first-aid post" },
      { km: "2.2 KM", name: "Birla Mandir", type: "water", typeLabel: "Hydration Station", notes: "Electrolyte drinks desk, police women assistance post" },
      { km: "3.2 KM", name: "Rajasthan University Gate", type: "cheer", typeLabel: "Cheering Zone", notes: "Student cheer band, hydration point" },
      { km: "4.2 KM", name: "Gandhi Circle", type: "medical", typeLabel: "Medical Center", notes: "Paramedic team, ambulance standby" },
      { km: "5.0 KM", name: "DB Crossing / MNIT Cut", type: "timing", typeLabel: "U-Turn Point", notes: "10K U-turn timing mat, energy drinks" },
      { km: "6.0 KM", name: "Commerce College", type: "water", typeLabel: "Hydration Station", notes: "Return corridor hydration & glucose" },
      { km: "7.2 KM", name: "Jawahar Kala Kendra", type: "cheer", typeLabel: "Cheering Zone", notes: "Police pipe band & cultural cheer" },
      { km: "8.2 KM", name: "Kanoria College Crossing", type: "water", typeLabel: "Hydration Station", notes: "Cooling sponges & energy hydration desk" },
      { km: "9.0 KM", name: "JDA Circle", type: "medical", typeLabel: "Medical Center", notes: "Rapid response medical booth" },
      { km: "10.0 KM", name: "Albert Hall Grand Finish Line", type: "finish", typeLabel: "Finish Line", notes: "10K finisher medal, timing slip & refreshments" }
    ],
    '5k': isHindi ? [
      { km: "0 KM", name: "अल्बर्ट हॉल (फ्लैग-ऑफ)", type: "start", typeLabel: "प्रारंभ बिंदु", notes: "सामूहिक महिला सुरक्षा शपथ एवं फ्लैग-ऑफ" },
      { km: "1.0 KM", name: "त्रिमूर्ति सर्किल", type: "water", typeLabel: "जल सेवा", notes: "स्वच्छ पेयजल एवं प्राथमिक चिकित्सा" },
      { km: "1.8 KM", name: "बिरला मंदिर क्रॉसिंग", type: "water", typeLabel: "जल सेवा", notes: "हाइड्रेशन डेस्क, निर्भया स्क्वाड सुरक्षा पेट्रोल" },
      { km: "2.2 KM", name: "राजस्थान विश्वविद्यालय मुख्य द्वार", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "पुलिस पाइप बैंड एवं महिला सुरक्षा प्रदर्शनी" },
      { km: "2.5 KM", name: "गांधी सर्किल", type: "timing", typeLabel: "U-टर्न पॉइंट", notes: "5K कम्युनिटी रन U-टर्न, हाइड्रेशन एवं एनर्जी पॉइंट" },
      { km: "3.0 KM", name: "कनोडिया कॉलेज", type: "water", typeLabel: "जल सेवा", notes: "वापसी मार्ग जल वितरण केंद्र" },
      { km: "3.8 KM", name: "जेडीए सर्किल", type: "medical", typeLabel: "चिकित्सा केंद्र", notes: "डॉक्टर्स टीम एवं मेडिकल सहायता बूथ" },
      { km: "4.4 KM", name: "सोनी हॉस्पिटल क्रॉसिंग", type: "water", typeLabel: "जल सेवा", notes: "अंतिम जल सेवा पोस्ट" },
      { km: "5.0 KM", name: "अल्बर्ट हॉल म्यूजियम", type: "finish", typeLabel: "समापन रेखा", notes: "सहभागिता मेडल, ब्रेकफास्ट एवं नारी सुरक्षा प्रमाण पत्र" }
    ] : [
      { km: "0 KM", name: "Albert Hall Museum (Flag-Off)", type: "start", typeLabel: "Start Point", notes: "Collective Women Safety Oath & Flag-off" },
      { km: "1.0 KM", name: "Trimurti Circle", type: "water", typeLabel: "Hydration Station", notes: "Drinking water & first-aid support" },
      { km: "1.8 KM", name: "Birla Mandir Crossing", type: "water", typeLabel: "Hydration Station", notes: "Hydration desk, Nirbhaya Squad mobile patrol" },
      { km: "2.2 KM", name: "Rajasthan University Main Gate", type: "cheer", typeLabel: "Cheering Zone", notes: "Police pipe band & safety awareness banners" },
      { km: "2.5 KM", name: "Gandhi Circle", type: "timing", typeLabel: "U-Turn Point", notes: "5K Community Run U-turn, hydration & energy drinks" },
      { km: "3.0 KM", name: "Kanoria College", type: "water", typeLabel: "Hydration Station", notes: "Inbound water distribution point" },
      { km: "3.8 KM", name: "JDA Circle", type: "medical", typeLabel: "Medical Center", notes: "Doctor team & medical assistance booth" },
      { km: "4.4 KM", name: "Soni Hospital Crossing", type: "water", typeLabel: "Hydration Station", notes: "Final hydration point" },
      { km: "5.0 KM", name: "Albert Hall Museum", type: "finish", typeLabel: "Finish Line", notes: "Participation medal, breakfast & safety certificate" }
    ],
    '2k': isHindi ? [
      { km: "0 KM", name: "अल्बर्ट हॉल (फ्लैग-ऑफ)", type: "start", typeLabel: "प्रारंभ बिंदु", notes: "फैमिली वॉक एवं रन फॉर हर सामूहिक मार्च" },
      { km: "0.4 KM", name: "रामनिवास बाग उत्तरी द्वार", type: "water", typeLabel: "जल सेवा", notes: "पेयजल एवं प्राथमिक सहायता बूथ" },
      { km: "0.8 KM", name: "जेएलएन मार्ग ग्रीन कॉरिडोर", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "महिला सुरक्षा बैनर्स, सेल्फी पॉइंट एवं पुलिस बैंड" },
      { km: "1.0 KM", name: "त्रिमूर्ति सर्किल", type: "timing", typeLabel: "U-टर्न पॉइंट", notes: "2K वॉक U-टर्न, रिफ्रेशमेंट डेस्क" },
      { km: "1.4 KM", name: "जेएलएन मार्ग वापसी कॉरिडोर", type: "water", typeLabel: "जल सेवा", notes: "पेयजल एवं एनर्जी ड्रिंक्स" },
      { km: "1.8 KM", name: "अल्बर्ट हॉल एप्रोच गेट", type: "cheer", typeLabel: "चीयरिंग ज़ोन", notes: "स्वागत उद्घोषणा एवं फोटोग्राफी पॉइंट" },
      { km: "2.0 KM", name: "अल्बर्ट हॉल म्यूजियम फिनिश", type: "finish", typeLabel: "समापन रेखा", notes: "मेडल, रिफ्रेशमेंट्स व बच्चों हेतु विशेष कैप्स" }
    ] : [
      { km: "0 KM", name: "Albert Hall Museum (Flag-Off)", type: "start", typeLabel: "Start Point", notes: "Family walk & Run for Her community march" },
      { km: "0.4 KM", name: "Ram Niwas Garden North Gate", type: "water", typeLabel: "Hydration Station", notes: "Drinking water & first-aid support" },
      { km: "0.8 KM", name: "JLN Marg Green Corridor", type: "cheer", typeLabel: "Cheering Zone", notes: "Women safety banners, photo booth & police band" },
      { km: "1.0 KM", name: "Trimurti Circle", type: "timing", typeLabel: "U-Turn Point", notes: "2K Walk U-turn, refreshment desk" },
      { km: "1.4 KM", name: "JLN Marg Return Corridor", type: "water", typeLabel: "Hydration Station", notes: "Drinking water & energy drinks" },
      { km: "1.8 KM", name: "Albert Hall Approach Gate", type: "cheer", typeLabel: "Cheering Zone", notes: "Welcome announcements & photography point" },
      { km: "2.0 KM", name: "Albert Hall Museum Finish", type: "finish", typeLabel: "Finish Line", notes: "Medal, refreshments & special caps for children" }
    ]
  };

  const currentCheckpoints = CHECKPOINTS_DATA[selectedCategory] || CHECKPOINTS_DATA['21k'];

  const filteredCheckpoints = activeFacilityFilter === 'all'
    ? currentCheckpoints
    : currentCheckpoints.filter(c => c.type === activeFacilityFilter || c.type === 'start' || c.type === 'finish');

  const CATEGORY_TABS = [
    {
      id: '21k',
      badge: '21 KM',
      label: isHindi ? '21 KM हाफ मैराथन' : '21 KM Half Marathon',
      accent: '#dc2626',
      badgeBg: 'bg-red-600',
      timing: 'Reporting: 05:00 AM | Flag-Off: 06:00 AM'
    },
    {
      id: '10k',
      badge: '10 KM',
      label: isHindi ? '10 KM स्पीड रन' : '10 KM Speed Run',
      accent: '#1d4ed8',
      badgeBg: 'bg-blue-600',
      timing: 'Reporting: 05:15 AM | Flag-Off: 06:15 AM'
    },
    {
      id: '5k',
      badge: '5 KM',
      label: isHindi ? '5 KM कम्युनिटी रन' : '5 KM Community Run',
      accent: '#0f172a',
      badgeBg: 'bg-slate-800',
      timing: 'Reporting: 05:30 AM | Flag-Off: 06:45 AM'
    },
    {
      id: '2k',
      badge: '2 KM',
      label: isHindi ? '2 KM फैमिली वॉक' : '2 KM Family Walk',
      accent: '#0284c7',
      badgeBg: 'bg-sky-600',
      timing: 'Reporting: 06:00 AM | Flag-Off: 07:15 AM'
    }
  ];

  return (
    <section id="route" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)', paddingTop: '28px' }}>
      <div className="container">
        
        {/* Compact Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--police-navy-950)', margin: 0, fontWeight: 800 }}>
            {t('routeHeading')}
          </h2>
        </div>

        {/* 1. INTERACTIVE CATEGORY TABS (USER SELECTS ONE, DEFAULT: 21K) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  background: '#ffffff',
                  border: isSelected ? `2.5px solid ${tab.accent}` : '1.5px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 4px 16px ${tab.accent}25` : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Active Top Accent Strip */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3.5px',
                    background: tab.accent
                  }}></div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      background: tab.accent,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em'
                    }}>
                      {tab.badge}
                    </span>
                    <span style={{ fontSize: '1.02rem', fontWeight: 800, color: isSelected ? 'var(--police-navy-950)' : '#334155' }}>
                      {tab.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. CATEGORY SUMMARY HEADER BAR (WHITE BACKGROUND, HEADING ONLY) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: routeConfig.accent,
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 900,
              padding: '3px 12px',
              borderRadius: '999px',
              letterSpacing: '0.04em'
            }}>
              {routeConfig.shortBadge}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--police-navy-950)', letterSpacing: '0.02em' }}>
              {isHindi ? (routeConfig.titleHi || routeConfig.title) : routeConfig.title}
            </div>
          </div>

          <a
            href={ALBERT_HALL_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'var(--police-navy-900)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(10, 28, 61, 0.15)'
            }}
          >
            <Navigation size={14} color="#fde047" />
            <span>{isHindi ? 'गूगल मैप्स नेविगेशन' : 'Google Maps Navigation'}</span>
            <ExternalLink size={12} color="#cbd5e1" />
          </a>
        </div>

        {/* 3. DEDICATED HORIZONTAL VISUAL ROUTE MAP CARD FOR SELECTED CATEGORY */}
        <div style={{ marginBottom: '28px' }}>
          <HorizontalRouteMapCard 
            route={routeConfig} 
            locationQrUrl={locationQrUrl} 
            hideHeader={true}
            isHindi={isHindi}
          />
        </div>

        {/* 4. FACILITY LAYER FILTER TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
          {[
            { id: 'all', label: isHindi ? 'समस्त सुविधाएं' : 'All Facilities', icon: MapPin },
            { id: 'water', label: isHindi ? 'जल एवं हाइड्रेशन' : 'Water & Hydration', icon: Droplets },
            { id: 'medical', label: isHindi ? 'चिकित्सा एवं एम्बुलेंस' : 'Medical & Ambulance', icon: HeartPulse },
            { id: 'timing', label: isHindi ? 'RFID टाइमिंग व U-Turn' : 'RFID Timing & U-Turn', icon: Timer },
            { id: 'cheer', label: isHindi ? 'चीयरिंग व पुलिस बैंड' : 'Cheering & Police Band', icon: Music }
          ].map(btn => {
            const Icon = btn.icon;
            const isSelected = activeFacilityFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveFacilityFilter(btn.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '50px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: isSelected ? 'var(--police-navy-900)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--police-navy-900)',
                  border: isSelected ? '1.5px solid var(--police-navy-900)' : '1.5px solid var(--border-medium)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(10, 28, 61, 0.2)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Icon size={15} color={isSelected ? 'var(--police-gold-400)' : 'var(--police-navy-800)'} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. INTERACTIVE CHECKPOINTS TIMELINE GRID */}
        <div className="gov-card" style={{ padding: '24px', border: '1.5px solid var(--border-medium)', background: '#ffffff', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={22} color={routeConfig.accent} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--police-navy-950)' }}>
                {routeConfig.shortBadge} {isHindi ? 'रूट चेकपॉइंट्स एवं सुविधाएं' : 'Route Checkpoints & Facilities'}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 800, background: '#ecfdf5', padding: '4px 12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              {isHindi ? '✓ सुरक्षित कॉरिडोर • प्रत्येक 500 मी. पर पुलिस पेट्रोल' : '✓ Secured Corridor • Police Patrol every 500m'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {filteredCheckpoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  background: pt.type === 'timing' ? '#fef2f2' : (pt.type === 'start' || pt.type === 'finish' ? '#eff6ff' : '#f8fafc'),
                  border: pt.type === 'timing' ? '1.5px solid #fecaca' : (pt.type === 'start' || pt.type === 'finish' ? '1.5px solid #bfdbfe' : '1.5px solid var(--border-medium)'),
                  borderRadius: '10px',
                  padding: '16px 18px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    color: routeConfig.accent,
                    background: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)'
                  }}>
                    {pt.km}
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    color: pt.type === 'timing' ? '#b91c1c' : 'var(--police-navy-900)',
                    background: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 800
                  }}>
                    {pt.typeLabel}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--police-navy-950)', marginBottom: '6px' }}>
                  {pt.name}
                </div>

                <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                  {pt.notes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. NIRBHAYA SQUAD & POLICE PATROL CITIZEN NOTICE */}
        <div style={{
          background: 'var(--police-navy-50)',
          border: '1.5px solid var(--police-navy-200)',
          borderLeft: '5px solid var(--police-navy-900)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="var(--police-navy-900)" />
            <span style={{ fontSize: '0.94rem', color: 'var(--police-navy-950)', lineHeight: '1.6' }}>
              {isHindi ? (
                <>रूट पर प्रत्येक 500 मीटर पर <strong>राजस्थान पुलिस मोबाइल पेट्रोलिंग एवं निर्भया स्क्वाड</strong> की महिला पुलिसकर्मी तैनात रहेंगी।</>
              ) : (
                <>Female officers from <strong>Rajasthan Police Mobile Patrol & Nirbhaya Squad</strong> will be stationed every 500 meters along the route.</>
              )}
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--police-navy-900)', fontWeight: 800 }}>
            {isHindi ? 'आपातकालीन सेवा: 112 • महिला गरिमा: 1090' : 'Emergency Services: 112 • Women Helpline: 1090'}
          </div>
        </div>

      </div>
    </section>
  );
}
