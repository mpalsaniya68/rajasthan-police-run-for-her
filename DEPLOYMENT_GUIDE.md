# 🚀 राजस्थान पुलिस मैराथन 2027 - ज़ीरो बजट (100% Free) डिप्लॉयमेंट गाइड
### 4,00,000+ नागरिकों के लिए 100% फ्री, हाई-सिक्योरिटी क्लाउड सेटअप

---

## 🏛️ आर्किटेक्चर की खूबियां
1. **₹0 लाइफटाइम खर्च**: कोई पेड सर्वर या डेटाबेस की आवश्यकता नहीं।
2. **4 लाख क्षमता (High Concurrency)**: Vercel सर्वरलेस ऑटो-स्केलिंग + Turso Edge DB (9 GB स्टोरेज, 25 Million ऑपरेशन्स फ्री)।
3. **गवर्नमेंट-ग्रेड सुरक्षा (OWASP Compliant)**: 
   - Zod स्कीमा वैलिडेशन द्वारा SQL इंजेक्शन सुरक्षा।
   - PII डेटा प्रोटेक्शन (पब्लिक पेजों पर मोबाइल नंबर मास्किंग `XXXXXX1234`)।
   - एडमिन 2FA ऑथेंटिकेशन और एक्सेल फॉर्मूला इंजेक्शन से सुरक्षित CSV एक्सपोर्ट।
   - बॉट और स्पैम से बचाव के लिए आईपी-आधारित रेट लिमिटिंग।

---

## 🛠️ मोड 1: लोकल कंप्यूटर पर चलाना (Immediate Testing)
आपके कंप्यूटर पर सब कुछ पहले से पूरी तरह कॉन्फ़िगर है:
```bash
# डेवलपमेंट सर्वर चालू करें
npm run dev
```
* **लोकल डेटाबेस**: `./data/rajasthan_police_marathon.db` में डेटा स्वतः स्टोर होता रहेगा।
* **लोकल बैकएंड**: `http://localhost:5173/api/health` पर तुरंत उपलब्ध है।

---

## 🌐 मोड 2: Vercel पर 100% फ्री लाइव करना (Production Deployment)

### स्टेप 1: फ्री Turso Edge डेटाबेस बनाएं (2 मिनट)
1. [https://turso.tech](https://turso.tech) पर जाएं और फ्री अकाउंट बनाएं (किसी क्रेडिट कार्ड की जरूरत नहीं)।
2. नया डेटाबेस बनाएं (Location: `bom` - Mumbai, India):
   ```bash
   turso db create rajpol-marathon --location bom
   ```
3. अपना डेटाबेस URL और Auth Token प्राप्त करें:
   ```bash
   turso db show rajpol-marathon --url
   turso db tokens create rajpol-marathon
   ```

### स्टेप 2: Vercel पर एक क्लिक में डिप्लॉय करें
1. [https://vercel.com](https://vercel.com) पर जाएं (GitHub से लॉगिन करें)।
2. **"Add New" ➔ "Project"** पर क्लिक करें और अपनी रिपॉजिटरी `mpalsaniya68/rajasthan-police-run-for-her` चुनें।
3. **Environment Variables** सेक्शन में ये वेरिएबल्स जोड़ें:
   * `TURSO_DATABASE_URL` = (आपका Turso URL, उदा: `libsql://rajpol-marathon-xyz.turso.io`)
   * `TURSO_AUTH_TOKEN` = (आपका Turso Auth Token)
   * `APP_SECRET` = कम से कम 32 random bytes वाला secret
   * `ADMIN_BOOTSTRAP_USERNAME` = पहले PHQ admin के लिए अलग username
   * `ADMIN_BOOTSTRAP_PASSWORD` = कम से कम 16 अक्षरों का unique password
   * `EXPO_PASSCODE` = station/supervisor login के लिए कम से कम 16 अक्षरों का unique passcode
4. **"Deploy"** बटन पर क्लिक करें।

30 सेकंड के अंदर आपकी वेबसाइट और बैकएंड दोनों लाइव हो जाएंगे, बिल्कुल फ्री! 🏆

---

## 🔐 एडमिन और एक्सपो लॉगिन

कोई डिफ़ॉल्ट एडमिन या एक्सपो पासकोड नहीं है। पहली बार डेटाबेस शुरू करते समय `ADMIN_BOOTSTRAP_USERNAME` और `ADMIN_BOOTSTRAP_PASSWORD` से केवल तब PHQ admin बनाया जाता है जब कोई admin मौजूद न हो। बाद के startup पर मौजूदा admin पासवर्ड नहीं बदले जाते।

क्रेडेंशियल्स को Vercel Environment Variables में ही रखें—उन्हें source code, frontend variables (`VITE_*`), या Git में न डालें। पहले से deployed सिस्टम में पुराना `rajpolice` डिफ़ॉल्ट खाता तथा demo volunteer accounts हटेंगे; volunteers को PHQ द्वारा नए unique accounts दिए जाने चाहिए।
