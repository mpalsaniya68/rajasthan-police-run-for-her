const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function trimAndOptimize() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const pngData = fs.readFileSync('public/images/run_for_her_official_logo.png');
  const base64 = 'data:image/png;base64,' + pngData.toString('base64');
  
  await page.setContent(`<!DOCTYPE html><html><body><img id="img" src="${base64}" /><canvas id="c"></canvas></body></html>`);
  
  const cropData = await page.evaluate(async () => {
    const img = document.getElementById('img');
    await img.decode();
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const a = d[(y * c.width + x) * 4 + 3];
        if (a > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Add 4px padding around cropped bounds
    minX = Math.max(0, minX - 4);
    minY = Math.max(0, minY - 4);
    maxX = Math.min(c.width - 1, maxX + 4);
    maxY = Math.min(c.height - 1, maxY + 4);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Create trimmed canvas
    const c2 = document.createElement('canvas');
    c2.width = cropW;
    c2.height = cropH;
    const ctx2 = c2.getContext('2d');
    ctx2.drawImage(c, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    return {
      minX, minY, maxX, maxY, cropW, cropH,
      dataUrl: c2.toDataURL('image/png')
    };
  });

  console.log('Trimmed crop info:', cropData.cropW, 'x', cropData.cropH, 'from original 1024x512');
  const base64Crop = cropData.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('public/images/run_for_her_official_logo.png', Buffer.from(base64Crop, 'base64'));
  console.log('Saved tightly trimmed transparent PNG!');

  await browser.close();
}

trimAndOptimize().catch(console.error);
