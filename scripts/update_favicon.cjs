const puppeteer = require('puppeteer-core');
const fs = require('fs');

function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO image type (1 = icon)
  header.writeUInt16LE(images.length, 4); // count of images

  let offset = 6 + images.length * 16;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

async function updateFavicon() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const logoFile = fs.existsSync('public/images/run_for_her_official_logo.png')
      ? 'public/images/run_for_her_official_logo.png'
      : 'public/images/run_for_her_official_logo.jpg';
    const logoData = fs.readFileSync(logoFile);
    const mime = logoFile.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const base64 = `data:${mime};base64,` + logoData.toString('base64');

    // 1. Generate primary public/favicon.png (512x512)
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
    console.log('Saved public/favicon.png');

    // 2. Generate multi-resolution frames for valid ICO container (16x16, 32x32, 48x48)
    const sizes = [16, 32, 48];
    const icoFrames = [];

    for (const size of sizes) {
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; overflow: hidden; }
            img { width: ${Math.round(size * 0.94)}px; height: auto; max-height: ${Math.round(size * 0.94)}px; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${base64}" />
        </body>
        </html>
      `);
      const buffer = await page.screenshot({ type: 'png' });
      icoFrames.push({ buffer, width: size, height: size });
    }

    // 3. Encode into valid ICO container without copying PNG bytes directly
    const icoBuffer = encodeIco(icoFrames);
    fs.writeFileSync('public/favicon.ico', icoBuffer);
    console.log(`Saved public/favicon.ico (${icoBuffer.length} bytes, ${icoFrames.length} frames: 16x16, 32x32, 48x48)`);
  } finally {
    await browser.close();
  }
}

updateFavicon().catch((err) => {
  console.error('updateFavicon failed:', err);
  process.exitCode = 1;
});
