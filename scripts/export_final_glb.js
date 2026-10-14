import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Users\\Luqman Malik\\AppData\\Local\\imput\\Helium\\Application\\chrome.exe';

async function exportGlb() {
  console.log('Launching browser to export GLB...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/car_model/final.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2000));

    console.log('Triggering GLTF export in page...');
    const base64Data = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const origCreate = URL.createObjectURL;
        URL.createObjectURL = (blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result.split(',')[1]);
          };
          reader.readAsDataURL(blob);
          return origCreate(blob);
        };

        const btn = document.getElementById('downloadBtn');
        if (!btn) {
          reject(new Error('Download button not found'));
          return;
        }
        btn.click();
        setTimeout(() => reject(new Error('Export timed out after 15s')), 15000);
      });
    });

    const buffer = Buffer.from(base64Data, 'base64');
    const finalGlbPath = path.resolve('car_model/final.glb');
    const publicGlbPath = path.resolve('public/models/suzuki_alto_final.glb');

    fs.writeFileSync(finalGlbPath, buffer);
    fs.writeFileSync(publicGlbPath, buffer);
    console.log(`Export complete! Saved ${buffer.length} bytes to ${finalGlbPath} and ${publicGlbPath}`);
  } finally {
    await browser.close();
  }
}

exportGlb().catch((err) => {
  console.error('Export error:', err);
  process.exit(1);
});
