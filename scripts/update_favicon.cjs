const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function updateFaviconAndSocial() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const pngData = fs.readFileSync('public/images/run_for_her_official_logo.png');
  const base64 = 'data:image/png;base64,' + pngData.toString('base64');

  // Square Favicon (512x512) with trimmed transparent logo
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; width: 512px; height: 512px; overflow: hidden; }
        img { width: 480px; height: auto; max-height: 480px; object-fit: contain; }
      </style>
    </head>
    <body>
      <img src="${base64}" />
    </body>
    </html>
  `);
  await page.screenshot({ path: 'public/favicon.png', type: 'png' });
  fs.copyFileSync('public/favicon.png', 'public/favicon.ico');
  console.log('Updated favicon.png and favicon.ico with trimmed transparent logo!');

  await browser.close();
}

updateFaviconAndSocial().catch(console.error);
