import React, { createContext, useContext, useState, useEffect } from 'react';

export const TRANSLATIONS = {
  hi: {
    // Utility Top Bar
    govtIdentity: 'राजस्थान सरकार',
    govtIdentityEn: 'GOVERNMENT OF RAJASTHAN',
    womenHelpline: 'महिला हेल्पलाइन: 1090 / 112',
    adminLogin: 'प्रशासनिक लॉगिन',
    switchLang: 'English',

    // Navbar
    mainTitle: 'राजस्थान पुलिस मैराथन 2027',
    tagline: 'महिला सुरक्षा हेतु हर कदम',
    navHome: 'मुख्य पृष्ठ',
    navRegister: 'पंजीकरण (ई-पास)',
    navFindPass: '🔍 ई-पास खोजें',
    navRoute: 'रूट व एक्सपो',
    navCertificates: 'ई-प्रमाण पत्र',
    navPledge: 'सुरक्षा संकल्प',

    // Hero
    superTitle: '★ राजस्थान पुलिस राज्य स्तरीय मैराथन 2027 ★',
    slogan: '"हर कदम नारी सुरक्षा, सम्मान एवं सशक्तिकरण के नाम"',
    days: 'दिन',
    hours: 'घंटे',
    mins: 'मिनट',
    secs: 'सेकंड',

    // Section Headings (Pure Clean Hindi without Parenthesized English)
    pledgeHeading: 'नारी सुरक्षा सामूहिक शपथ',
    routeHeading: 'जयपुर फ्लैगशिप रेस रूट',
    scheduleHeading: 'कार्यक्रम समय-सारणी, बिब एक्सपो एवं रेस नियम',
    faqHeading: 'अक्सर पूछे जाने वाले महत्वपूर्ण सवाल',
    prizesHeading: 'इनाम व पुरस्कार',
    certificatesHeading: 'डिजिटल फिनिशर ई-प्रमाण पत्र एवं लेजर सत्यापन',
    registrationHeading: 'ऑनलाइन धावक पंजीकरण'
  },
  en: {
    // Utility Top Bar
    govtIdentity: 'GOVERNMENT OF RAJASTHAN',
    govtIdentityEn: 'GOVERNMENT OF RAJASTHAN',
    womenHelpline: 'Women Helpline: 1090 / 112',
    adminLogin: 'Admin Login',
    switchLang: 'हिन्दी',

    // Navbar
    mainTitle: 'Rajasthan Police Marathon 2027',
    tagline: 'Every Step for Women Safety',
    navHome: 'Home',
    navRegister: 'Registration (E-Pass)',
    navFindPass: '🔍 Find E-Pass',
    navRoute: 'Route & Expo',
    navCertificates: 'E-Certificates',
    navPledge: 'Safety Pledge',

    // Hero
    superTitle: '★ RAJASTHAN POLICE STATEWIDE MARATHON 2027 ★',
    slogan: '"Every Step for Women Safety, Dignity & Empowerment"',
    days: 'DAYS',
    hours: 'HOURS',
    mins: 'MINS',
    secs: 'SECS',

    // Section Headings (English view)
    pledgeHeading: "Women's Safety Pledge",
    routeHeading: 'Jaipur Flagship Race Route Map',
    scheduleHeading: 'Event Schedule, Bib Expo & Race Rules',
    faqHeading: 'Frequently Asked Questions (FAQs)',
    prizesHeading: 'Prizes & Rewards',
    certificatesHeading: 'Digital Finisher E-Certificates & Ledger Verification',
    registrationHeading: 'Online Runner Registration'
  }
};

const LanguageContext = createContext({
  language: 'hi',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isHindi: true,
  t: (key) => key
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('rpm_lang');
        if (saved === 'en' || saved === 'hi') return saved;
      }
    } catch (e) {}
    return 'hi';
  });

  useEffect(() => {
    try {
      localStorage.setItem('rpm_lang', language);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    } catch (e) {}
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const setLanguage = (lang) => {
    if (lang === 'hi' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['hi']?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isHindi: language === 'hi',
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
