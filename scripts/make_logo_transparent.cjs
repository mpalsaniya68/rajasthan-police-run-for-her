const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function makeTransparent() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const logoData = fs.readFileSync('public/images/run_for_her_official_logo.jpg');
    const logoBase64 = 'data:image/jpeg;base64,' + logoData.toString('base64');

    await page.setContent(`<!DOCTYPE html><html><body><img id="img" src="${logoBase64}" /><canvas id="c"></canvas></body></html>`);

    const result = await page.evaluate(async () => {
      const img = document.getElementById('img');
      await img.decode();
      const c = document.getElementById('c');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const idata = ctx.getImageData(0, 0, w, h);
      const d = idata.data;

      // Police Emblem center & radius
      const emblemCX = 184;
      const emblemCY = 360;
      const emblemR2 = 102 * 102;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];

          const dx = x - emblemCX;
          const dy = y - emblemCY;
          const inEmblem = (dx * dx + dy * dy) <= emblemR2;

          if (inEmblem) {
            continue; // Preserve official police emblem
          }

          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const diff = maxC - minC;

          const isTextArea = y > 260 && x > 280;
          if (isTextArea) {
            const isRed = (r > 130 && (r - g) > 35 && (r - b) > 35) || (r > 90 && g < 45 && b < 45);
            const isBlue = (b > 75 && (b - r) > 15 && (b - g) > 10) || (b > 60 && r < 50 && g < 60);

            if (!isRed && !isBlue) {
              d[idx + 3] = 0;
            } else if (minC > 140) {
              const alpha = Math.max(0, Math.min(255, Math.round((diff / maxC) * 255)));
              d[idx + 3] = alpha;
            } else {
              d[idx + 3] = 255;
            }
          } else {
            if (minC > 200 && diff < 30) {
              d[idx + 3] = 0;
            } else if (minC > 180 && diff < 20) {
              const t = (minC - 180) / 20;
              d[idx + 3] = Math.round((1 - t) * 255);
            }
          }
        }
      }

      ctx.putImageData(idata, 0, 0);

      // Tight bounding box crop
      let minX = w, minY = h, maxX = 0, maxY = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const a = d[(y * w + x) * 4 + 3];
          if (a > 20) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      minX = Math.max(0, minX - 4);
      minY = Math.max(0, minY - 4);
      maxX = Math.min(w - 1, maxX + 4);
      maxY = Math.min(h - 1, maxY + 4);

      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;

      const c2 = document.createElement('canvas');
      c2.width = cropW;
      c2.height = cropH;
      const ctx2 = c2.getContext('2d');
      ctx2.drawImage(c, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

      return {
        dataUrl: c2.toDataURL('image/png'),
        cropW,
        cropH
      };
    });

    const base64Data = result.dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('public/images/run_for_her_official_logo.png', Buffer.from(base64Data, 'base64'));
    console.log(`Saved public/images/run_for_her_official_logo.png (${result.cropW}x${result.cropH})`);
  } finally {
    await browser.close();
  }
}

makeTransparent().catch((err) => {
  console.error('makeTransparent failed:', err);
  process.exitCode = 1;
});
