import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Users\\Luqman Malik\\AppData\\Local\\imput\\Helium\\Application\\chrome.exe';
const outputPath = process.argv[2] || 'screenshot.png';

async function takeScreenshot() {
  console.log('Launching browser at:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1280,720'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    // Allow Three.js clock and animations to settle
    await new Promise((r) => setTimeout(r, 2500));
    const resolvedPath = path.resolve(outputPath);
    await page.screenshot({ path: resolvedPath });
    console.log('Screenshot successfully saved to:', resolvedPath);
  } finally {
    await browser.close();
  }
}

takeScreenshot().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
