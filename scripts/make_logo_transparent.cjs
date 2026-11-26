const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function makeTransparent() {
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

  const result = await page.evaluate(async () => {
    const img = document.getElementById('img');
    await img.decode();
    const cvs = document.getElementById('cvs');
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const idata = ctx.getImageData(0, 0, w, h);
    const d = idata.data;

    // BFS Flood Fill from edges for pure/near white pixels
    const visited = new Uint8Array(w * h);
    const queue = [];

    const isWhite = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      // Check if it's outer background white/near-white
      return r > 242 && g > 242 && b > 242;
    };

    // Add perimeter pixels that are white to queue
    for (let x = 0; x < w; x++) {
      if (isWhite(x, 0)) { queue.push(x, 0); visited[0 * w + x] = 1; }
      if (isWhite(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
    }
    for (let y = 0; y < h; y++) {
      if (!visited[y * w + 0] && isWhite(0, y)) { queue.push(0, y); visited[y * w + 0] = 1; }
      if (!visited[y * w + (w - 1)] && isWhite(w - 1, y)) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
    }

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];

      // Mark transparent
      const idx = (cy * w + cx) * 4;
      d[idx + 3] = 0; // Alpha = 0

      // 4-way neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nidx = ny * w + nx;
          if (!visited[nidx] && isWhite(nx, ny)) {
            visited[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }

    // Smooth outer edges slightly (feather 1px transition for anti-aliasing)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        if (d[idx + 3] !== 0) {
          // If this pixel is near white (r,g,b > 235) and adjacent to transparent
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          if (r > 238 && g > 238 && b > 238) {
            const hasTransparentNeighbor = 
              d[((y-1)*w + x)*4 + 3] === 0 ||
              d[((y+1)*w + x)*4 + 3] === 0 ||
              d[(y*w + x-1)*4 + 3] === 0 ||
              d[(y*w + x+1)*4 + 3] === 0;
            if (hasTransparentNeighbor) {
              // Fade alpha based on brightness
              const brightness = (r + g + b) / 3;
              const alpha = Math.max(0, Math.min(255, Math.round((255 - brightness) * 4)));
              d[idx + 3] = alpha;
            }
          }
        }
      }
    }

    ctx.putImageData(idata, 0, 0);
    return cvs.toDataURL('image/png');
  });

  // Save transparent PNG
  const base64Data = result.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('public/images/run_for_her_official_logo.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved public/images/run_for_her_official_logo.png! Size:', fs.statSync('public/images/run_for_her_official_logo.png').size);

  await browser.close();
}

makeTransparent().catch(console.error);
