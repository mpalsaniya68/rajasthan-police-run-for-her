const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testPixels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const logoData = fs.readFileSync('public/images/run_for_her_official_logo.jpg');
  const logoBase64 = 'data:image/jpeg;base64,' + logoData.toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
    <img id="img" src="${logoBase64}" />
    <canvas id="cvs"></canvas>
    </body></html>
  `);

  const info = await page.evaluate(async () => {
    const img = document.getElementById('img');
    await img.decode();
    const cvs = document.getElementById('cvs');
    cvs.width = img.naturalWidth;
    cvs.height = img.naturalHeight;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const idata = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const data = idata.data;
    
    // Sample corner pixels: top-left, top-right, bottom-left, bottom-right
    const getP = (x, y) => {
      const idx = (y * cvs.width + x) * 4;
      return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
    };
    
    return {
      w: cvs.width,
      h: cvs.height,
      tl: getP(0, 0),
      tr: getP(cvs.width - 1, 0),
      bl: getP(0, cvs.height - 1),
      br: getP(cvs.width - 1, cvs.height - 1),
      midTop: getP(Math.floor(cvs.width / 2), 5)
    };
  });

  console.log('Pixel samples:', info);
  await browser.close();
}

testPixels().catch(console.error);
