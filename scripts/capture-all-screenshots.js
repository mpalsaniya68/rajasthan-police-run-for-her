import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(projectRoot, 'screenshots');
const PUBLIC_SCREENSHOT_DIR = path.resolve(projectRoot, 'public', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_SCREENSHOT_DIR)) fs.mkdirSync(PUBLIC_SCREENSHOT_DIR, { recursive: true });

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch (e) {
      // wait
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`Server failed to start at ${url} within ${timeoutMs}ms`);
}

async function main() {
  console.log('[1/4] Starting production server on port 3000...');
  const serverProcess = spawn('node', ['server/server.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000', HOST: '127.0.0.1' }
  });

  try {
    await waitForServer('http://127.0.0.1:3000');
    console.log('[2/4] Server is up and ready! Launching headless Chrome...');

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2 // High DPI Retina quality
      }
    });

    const page = await browser.newPage();

    const shots = [
      {
        id: '01_Home_Hero_Section',
        title: 'मुख्य पृष्ठ (होम) - मुख्य बैनर एवं उलटी गिनती',
        desc: 'आधिकारिक राजस्थान पुलिस मैराथन 2027 मुख्य पृष्ठ, लोगो, उलटी गिनती (Countdown Timer), 1000+ पंजीकृत धावक लाइव काउंटर व त्वरित नेविगेशन बटन।',
        url: 'http://127.0.0.1:3000/#home',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 0));
          await new Promise(r => setTimeout(r, 1200));
        }
      },
      {
        id: '02_Home_DGP_Message_and_Objectives',
        title: 'पुलिस महानिदेशक (DGP) संदेश एवं अभियान के उद्देश्य',
        desc: 'पुलिस महानिदेशक महोदय का आधिकारिक वक्तव्य, महिला सुरक्षा, सम्मान व सशक्तिकरण ("Run for Her") अभियान के प्रमुख स्तंभ व उद्देश्य।',
        url: 'http://127.0.0.1:3000/#home',
        action: async (p) => {
          await p.evaluate(() => {
            const el = document.getElementById('dgp-message') || document.querySelector('section:nth-of-type(2)');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
            else window.scrollTo(0, 750);
          });
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '03_Home_Safety_and_Highlights',
        title: 'इवेंट मुख्य आकर्षण, सुरक्षा व्यवस्था व पुरस्कार',
        desc: 'मैराथन के मुख्य आकर्षण, राजस्थान पुलिस की अत्याधुनिक सुरक्षा व मेडिकल व्यवस्था, फिनिशर मेडल, टी-शर्ट और ई-प्रमाण पत्र विवरण।',
        url: 'http://127.0.0.1:3000/#home',
        action: async (p) => {
          await p.evaluate(() => {
            const el = document.getElementById('highlights') || document.querySelector('section:nth-of-type(3)');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
            else window.scrollTo(0, 1600);
          });
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '04_Race_Categories_and_Prizes',
        title: 'दौड़ श्रेणियां (Race Categories) व नकद पुरस्कार विवरण',
        desc: '21 KM हाफ मैराथन (ओपन), 10 KM पुलिस प्राइड रन एवं 5 KM महिला सुरक्षा जन-जागरूकता दौड़ का दूरी, पात्रता, रूट व ₹15+ लाख के पुरस्कार।',
        url: 'http://127.0.0.1:3000/#categories',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 150));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '05_Registration_Form_Individual',
        title: 'धावक ऑनलाइन पंजीकरण पोर्टल (Registration Form)',
        desc: 'धावक विवरण (नाम, आयु, लिंग, मोबाइल), जिला चयन, टी-शर्ट साइज गाइड, मेडिकल घोषणा एवं आधार/पहचान पत्र सुरक्षा जांच।',
        url: 'http://127.0.0.1:3000/#register',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 320));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '06_Registration_EPass_Lookup',
        title: 'डिजिटल ई-पास खोज एवं सत्यापन (Digital E-Pass Lookup)',
        desc: 'पंजीकृत धावक का बिब नंबर अथवा मोबाइल नंबर द्वारा तुरंत डिजिटल ई-पास व क्यूआर कोड खोजने और डाउनलोड करने का पोर्टल।',
        url: 'http://127.0.0.1:3000/#register',
        action: async (p) => {
          await p.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const passBtn = buttons.find(b => b.textContent && b.textContent.includes('ई-पास'));
            if (passBtn) passBtn.click();
            window.scrollTo(0, 280);
          });
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '07_Route_Map_and_Event_Schedule',
        title: 'आधिकारिक रूट मैप एवं समय-सारणी (Route & Schedule)',
        desc: 'अल्बर्ट हॉल, रामनिवास बाग से जेएलएन मार्ग होते हुए विस्तृत रूट मैप, हाइड्रेशन व मेडिकल केंद्र, RFID टाइमिंग मैट्स एवं फ्लैग-ऑफ समय।',
        url: 'http://127.0.0.1:3000/#route-schedule',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 200));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '08_Districts_Participation_Hub',
        title: 'राज्य के 33 जिले एवं 2 पुलिस कमिश्नरेट सहभागिता केंद्र',
        desc: 'राजस्थान के सभी 33 जिलों व 2 पुलिस कमिश्नरेट में आयोजित होने वाले समानांतर दौड़ अभियान, जिला नोडल अधिकारी व जन-सहभागिता डैशबोर्ड।',
        url: 'http://127.0.0.1:3000/#districts',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 200));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '09_Finisher_Certificate_Lookup',
        title: 'आधिकारिक फिनिशर सर्टिफिकेट व टाइमिंग पोर्टल',
        desc: 'दौड़ समाप्ति के उपरांत आधिकारिक फिनिशर सर्टिफिकेट, सटीक RFID नेट टाइम, डिजिटल हस्ताक्षर एवं क्यूआर कोड सत्यापन।',
        url: 'http://127.0.0.1:3000/#certificates',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 250));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '10_Women_Safety_Pledge',
        title: 'डिजिटल नारी सम्मान व सुरक्षा संकल्प (Safety Pledge)',
        desc: 'नागरिकों द्वारा नारी सुरक्षा व सम्मान का ऑनलाइन डिजिटल संकल्प लेने एवं राजस्थान पुलिस द्वारा अधिकृत ई-संकल्प प्रमाण पत्र प्राप्त करने की सुविधा।',
        url: 'http://127.0.0.1:3000/#pledge-safety',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 200));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '11_Admin_2FA_Security_Login',
        title: 'पुलिस अधिकारी एवं ऑपरेटर 2FA सुरक्षा लॉगिन पोर्टल',
        desc: 'राजस्थान पुलिस मुख्यालय (PHQ) कमान, जिला एडमिन एवं एक्सपो वॉलंटियर्स हेतु यूजरनेम, पासवर्ड व वन-टाइम सुरक्षा पासकोड आधारित त्रिस्तरीय लॉगिन।',
        url: 'http://127.0.0.1:3000/#admin-login',
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 100));
          await new Promise(r => setTimeout(r, 1000));
        }
      },
      {
        id: '12_Admin_Command_Dashboard',
        title: 'पुलिस मुख्यालय (PHQ) केंद्रीय प्रशासनिक कमान डैशबोर्ड',
        desc: 'राज्य स्तरीय लाइव केपीआई (कुल पंजीकरण, जिलावार धावक, फीस संग्रह), बल्क सीएसवी एक्सपोर्ट, एसएमएस ब्रॉडकास्ट एवं ऑडिट ट्रेल्स।',
        url: 'http://127.0.0.1:3000/#admin',
        preNav: async (p) => {
          // Pre-seed SessionStorage with Super Admin authority
          await p.evaluateOnNewDocument(() => {
            sessionStorage.setItem('rajpol_admin_auth', 'true');
            sessionStorage.setItem('rajpol_admin_token', 'mock_phq_token');
            sessionStorage.setItem('rajpol_admin_user', JSON.stringify({
              username: 'phq_admin',
              fullName: 'राज्य नोडल अधिकारी (PHQ)',
              role: 'SUPER_ADMIN',
              district: 'ALL'
            }));
          });
        },
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 0));
          await new Promise(r => setTimeout(r, 1200));
        }
      },
      {
        id: '13_Expo_Volunteer_Scanner_Terminal',
        title: 'एक्सपो डेस्क बारकोड/QR स्कैनर व किट हैंडओवर टर्मिनल',
        desc: 'वॉलंटियर्स हेतु बारकोड/QR स्कैनर, आरएफआईडी टैग ऑटो-लिंकिंग, टी-शर्ट साइज सत्यापन, एसएमएस ओटीपी हैंडओवर एवं डुप्लीकेट वितरण रोकथाम।',
        url: 'http://127.0.0.1:3000/#expo-terminal',
        preNav: async (p) => {
          // Pre-seed SessionStorage with Volunteer Station authority
          await p.evaluateOnNewDocument(() => {
            sessionStorage.setItem('rajpol_admin_auth', 'true');
            sessionStorage.setItem('rajpol_admin_token', 'mock_expo_token');
            sessionStorage.setItem('rajpol_admin_user', JSON.stringify({
              username: 'counter_01',
              fullName: 'मदन (वॉलंटियर)',
              role: 'EXPO_VOLUNTEER',
              counterName: 'काउंटर-01 (21KM हाफ मैराथन - पुरुष)',
              counterId: 'counter_01'
            }));
          });
        },
        action: async (p) => {
          await p.evaluate(() => window.scrollTo(0, 0));
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    ];

    console.log(`[3/4] Capturing ${shots.length} high-resolution screenshots...`);

    const capturedList = [];

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      console.log(`   📸 [${i + 1}/${shots.length}] ${shot.id}...`);

      const shotPage = await browser.newPage();
      await shotPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

      if (shot.preNav) {
        await shot.preNav(shotPage);
      }

      await shotPage.goto(shot.url, { waitUntil: 'networkidle2', timeout: 20000 });
      if (shot.action) {
        await shot.action(shotPage);
      }

      const fileName = `${shot.id}.png`;
      const filePath = path.join(SCREENSHOT_DIR, fileName);
      const publicFilePath = path.join(PUBLIC_SCREENSHOT_DIR, fileName);

      await shotPage.screenshot({ path: filePath, fullPage: false });
      fs.copyFileSync(filePath, publicFilePath);

      capturedList.push({
        fileName,
        title: shot.title,
        desc: shot.desc,
        url: shot.url
      });

      await shotPage.close();
    }

    await browser.close();
    console.log('[4/4] All screenshots captured successfully!');

    // Generate single master presentation HTML file
    console.log('Generating master presentation file...');
    generatePresentationHtml(capturedList);

  } finally {
    serverProcess.kill('SIGTERM');
    console.log('Cleaned up server process.');
  }
}

function generatePresentationHtml(capturedList) {
  const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>राजस्थान पुलिस मैराथन 2027 • सम्पूर्ण वेबसाइट प्रस्तुति (Complete Portal Presentation)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --police-navy: #0a1c3d;
      --police-navy-light: #162f65;
      --police-gold: #d4af37;
      --police-gold-light: #fef3c7;
      --bg-slate: #f8fafc;
      --text-dark: #0f172a;
      --text-muted: #475569;
      --border-color: #e2e8f0;
      --card-shadow: 0 10px 25px -5px rgba(10, 28, 61, 0.1), 0 8px 10px -6px rgba(10, 28, 61, 0.05);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg-slate);
      color: var(--text-dark);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    header.hero-header {
      background: linear-gradient(135deg, #061226 0%, #0a1c3d 50%, #162f65 100%);
      color: #ffffff;
      padding: 50px 24px;
      text-align: center;
      border-bottom: 5px solid var(--police-gold);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    .header-badge {
      display: inline-block;
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid var(--police-gold);
      color: #fde68a;
      padding: 6px 18px;
      border-radius: 30px;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 14px;
    }
    h1.hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #ffffff 40%, #fde68a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: #cbd5e1;
      max-width: 820px;
      margin: 0 auto 20px;
      font-weight: 500;
    }
    .header-controls {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    .btn {
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-gold {
      background: linear-gradient(135deg, #d4af37 0%, #b89628 100%);
      color: #0a1c3d;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35);
    }
    .btn-gold:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(212, 175, 55, 0.45);
    }
    .btn-outline {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .container {
      max-width: 1400px;
      margin: 40px auto;
      padding: 0 24px;
    }
    .toc-card {
      background: #ffffff;
      border: 1.5px solid var(--border-color);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 45px;
      box-shadow: var(--card-shadow);
    }
    .toc-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--police-navy);
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }
    .toc-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-decoration: none;
      color: var(--police-navy);
      font-weight: 700;
      font-size: 0.88rem;
      transition: all 0.15s ease;
    }
    .toc-item:hover {
      background: var(--police-gold-light);
      border-color: var(--police-gold);
      transform: translateX(4px);
    }
    .toc-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--police-navy);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
    .presentation-module {
      background: #ffffff;
      border: 1.5px solid var(--border-color);
      border-radius: 18px;
      overflow: hidden;
      margin-bottom: 55px;
      box-shadow: var(--card-shadow);
      scroll-margin-top: 240px;
    }
    .module-header {
      background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
      padding: 24px 30px;
      border-bottom: 1.5px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .module-index {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 4px;
    }
    .module-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--police-navy);
      margin-bottom: 6px;
    }
    .module-desc {
      font-size: 0.95rem;
      color: var(--text-muted);
      max-width: 900px;
      line-height: 1.5;
    }
    .module-badge {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .module-image-container {
      background: #0f172a;
      padding: 20px;
      text-align: center;
      border-bottom: 1.5px solid var(--border-color);
    }
    .module-image {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      display: block;
      margin: 0 auto;
      transition: transform 0.25s ease;
      cursor: zoom-in;
    }
    .module-image:hover {
      transform: scale(1.008);
    }
    .module-footer {
      padding: 16px 30px;
      background: #f8fafc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      color: #64748b;
    }
    footer.page-footer {
      background: var(--police-navy);
      color: #94a3b8;
      padding: 40px 24px;
      text-align: center;
      border-top: 3px solid var(--police-gold);
      font-size: 0.9rem;
    }
    @media print {
      header.hero-header {
        position: static;
        box-shadow: none;
      }
      .header-controls, .btn {
        display: none !important;
      }
      .presentation-module {
        page-break-inside: avoid;
        margin-bottom: 30px;
      }
    }
  </style>
</head>
<body>

  <header class="hero-header">
    <div class="header-badge">राजस्थान पुलिस मुख्यालय, जयपुर • आधिकारिक पोर्टल प्रस्तुति</div>
    <h1 class="hero-title">राजस्थान पुलिस मैराथन 2027 • सम्पूर्ण वेबसाइट व फ़ंक्शन प्रजेंटेशन</h1>
    <p class="hero-subtitle">
      "Run for Her" नारी सुरक्षा, सम्मान व सशक्तिकरण राज्यव्यापी महा-अभियान — सभी 13 मुख्य फीचर्स, पब्लिक पोर्टल्स, 2FA कमान डैशबोर्ड एवं एक्सपो स्कैनर टर्मिनल का सचित्र विस्तृत विवरण।
    </p>
    <div class="header-controls">
      <button onclick="window.print()" class="btn btn-gold">
        🖨️ PDF / प्रिंट रूप में सेव करें (Print to PDF)
      </button>
      <a href="#module-1" class="btn btn-outline">
        ⬇️ प्रस्तुति का अवलोकन प्रारंभ करें
      </a>
    </div>
  </header>

  <div class="container">

    <!-- Table of Contents -->
    <div class="toc-card">
      <div class="toc-title">
        📑 प्रस्तुति अनुक्रमणिका (Table of Contents - Quick Navigation)
      </div>
      <div class="toc-grid">
        ${capturedList.map((item, idx) => `
          <a href="#module-${idx + 1}" class="toc-item">
            <span class="toc-num">${idx + 1}</span>
            <span>${item.title}</span>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Presentation Modules -->
    ${capturedList.map((item, idx) => `
      <section id="module-${idx + 1}" class="presentation-module">
        <div class="module-header">
          <div>
            <div class="module-index">मॉड्यूल ${String(idx + 1).padStart(2, '0')} / ${capturedList.length}</div>
            <h2 class="module-title">${item.title}</h2>
            <p class="module-desc">${item.desc}</p>
          </div>
          <div class="module-badge">
            ✅ लाइव पोर्टल स्क्रीनशॉट (HD)
          </div>
        </div>

        <div class="module-image-container">
          <img 
            src="screenshots/${item.fileName}" 
            alt="${item.title}" 
            class="module-image" 
            loading="lazy"
            onclick="window.open(this.src, '_blank')"
            title="पूर्ण आकार (Full Resolution) में देखने हेतु क्लिक करें"
          />
        </div>

        <div class="module-footer">
          <span>आधिकारिक यूआरएल: <code>${item.url}</code></span>
          <span>प्रस्तुति कोड: <strong>RPM-2027-MOD-${idx + 1}</strong></span>
        </div>
      </section>
    `).join('')}

  </div>

  <footer class="page-footer">
    <p><strong>राजस्थान पुलिस मैराथन 2027 • Run for Her</strong></p>
    <p style="margin-top: 6px; font-size: 0.8rem;">
      राजस्थान पुलिस मुख्यालय, लाल कोठी, जयपुर | तकनीकी प्रकोष्ठ एवं मैराथन आयोजन समिति द्वारा अधिकृत प्रस्तुति दस्तावेज
    </p>
  </footer>

</body>
</html>`;

  fs.writeFileSync(path.resolve(projectRoot, 'presentation.html'), htmlContent, 'utf-8');
  fs.writeFileSync(path.resolve(projectRoot, 'public', 'presentation.html'), htmlContent, 'utf-8');
  console.log(`Generated: presentation.html & public/presentation.html`);
}

main().catch(err => {
  console.error('[Capture Error]:', err);
  process.exit(1);
});
