const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'rapport-audit-rnpc.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle2', timeout: 15000 });

  await page.pdf({
    path: path.resolve(__dirname, 'Audit-Meta-Ads-RNPC-B2C.pdf'),
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true
  });

  console.log('PDF généré : Audit-Meta-Ads-RNPC-B2C.pdf');
  await browser.close();
})();
