# 🚀 राजस्थान पुलिस मैराथन 2026 - ज़ीरो बजट (100% Free) डिप्लॉयमेंट गाइड
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
3. **Environment Variables** सेक्शन में ये दो वेरिएबल्स जोड़ें:
   * `TURSO_DATABASE_URL` = (आपका Turso URL, उदा: `libsql://rajpol-marathon-xyz.turso.io`)
   * `TURSO_AUTH_TOKEN` = (आपका Turso Auth Token)
   * `APP_SECRET` = (कोई भी सुरक्षित सीक्रेट की)
4. **"Deploy"** बटन पर क्लिक करें।

30 सेकंड के अंदर आपकी वेबसाइट और बैकएंड दोनों लाइव हो जाएंगे, बिल्कुल फ्री! 🏆

---

## 👮‍♂️ डिफ़ॉल्ट पुलिस एडमिन क्रेडेंशियल्स
* **यूजरनेम**: `rajpolice`
* **सुरक्षा पासवर्ड**: `RajPol#2026`
* **क्विक हॉटकी**: वेबसाइट पर कहीं भी `Ctrl + Shift + A` दबाएं।
