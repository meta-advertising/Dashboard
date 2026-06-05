const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const htmlPath = path.resolve(__dirname, 'visuel-paimpol.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.resolve(__dirname, 'moulin-elise-paimpol-1080x1080.png'),
    clip: { x: 0, y: 0, width: 1080, height: 1080 },
    omitBackground: false
  });

  console.log('Export terminé : moulin-elise-paimpol-1080x1080.png');

  await browser.close();
})();
