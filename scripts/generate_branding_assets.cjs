const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const logoData = fs.readFileSync('public/images/run_for_her_official_logo.jpg');
  const logoBase64 = 'data:image/jpeg;base64,' + logoData.toString('base64');

  // 1. Generate Square Favicon (512x512)
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; width: 512px; height: 512px; overflow: hidden; }
        img { width: 490px; height: 245px; object-fit: contain; }
      </style>
    </head>
    <body>
      <img src="${logoBase64}" />
    </body>
    </html>
  `);
  await page.screenshot({ path: 'public/favicon.png', type: 'png' });
  fs.copyFileSync('public/favicon.png', 'public/favicon.ico');
  console.log('Saved favicon.png and favicon.ico');

  // 2. Generate WhatsApp / Social Share Banner (1200x630)
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 0; width: 1200px; height: 630px;
          background: #ffffff;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .top-stripe {
          position: absolute; top: 0; left: 0; right: 0; height: 8px;
          background: linear-gradient(90deg, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%);
        }
        .navy-top {
          position: absolute; top: 8px; left: 0; right: 0; height: 46px;
          background: #0a1c3d; color: #fde68a; font-weight: 800; font-size: 15px;
          display: flex; align-items: center; justify-content: space-between; padding: 0 40px;
          letter-spacing: 1px;
        }
        .center-logo {
          width: 980px; height: 490px; object-fit: contain;
          margin-top: 36px;
        }
        .bottom-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 52px;
          background: #0a1c3d; color: #ffffff;
          display: flex; align-items: center; justify-content: space-between; padding: 0 40px;
          border-top: 3.5px solid #d4af37; font-size: 16px; font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="top-stripe"></div>
      <div class="navy-top">
        <span>GOVERNMENT OF RAJASTHAN • RAJASTHAN POLICE</span>
        <span style="color: #6ee7b7;">📅 24 JANUARY 2027 • ALBERT HALL, JAIPUR</span>
      </div>
      <img class="center-logo" src="${logoBase64}" />
      <div class="bottom-bar">
        <span style="color: #fef08a;">★ हर कदम नारी सुरक्षा, सम्मान व सशक्तिकरण के लिए ★</span>
        <span style="color: #93c5fd; font-family: monospace; font-size: 17px;">marathon-rajpolice.vercel.app</span>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: 'public/images/social_share_card.jpg', type: 'jpeg', quality: 96 });
  console.log('Saved social_share_card.jpg');

  await browser.close();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
