const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const filePath = path.resolve(__dirname, 'presentation-ocargo-villenave-dornon.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 30000 });
  const totalSlides = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('Found ' + totalSlides + ' slides');
  await page.evaluate(() => {
    document.querySelector('.nav-bar').remove();
    document.querySelector('.progress-bar').remove();
    document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';
    document.body.style.width = '1920px';
    const container = document.getElementById('slidesContainer');
    container.style.width = '1920px';
    container.style.height = 'auto';
    container.style.position = 'relative';
    document.querySelectorAll('.slide').forEach(slide => {
      slide.style.position = 'relative';
      slide.style.opacity = '1';
      slide.style.visibility = 'visible';
      slide.style.transform = 'none';
      slide.style.pointerEvents = 'all';
      slide.style.width = '1920px';
      slide.style.height = '1080px';
      slide.style.pageBreakAfter = 'always';
      slide.style.pageBreakInside = 'avoid';
      slide.style.overflow = 'hidden';
      slide.style.flexShrink = '0';
    });
  });
  await page.waitForFunction(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).every(img => img.complete);
  }, { timeout: 15000 }).catch(() => console.log('Some images may not have loaded'));
  await new Promise(r => setTimeout(r, 2000));
  await page.pdf({
    path: path.resolve(__dirname, 'Presentation-Koven-Ocargo-Villenave-Ornon.pdf'),
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false
  });
  console.log('PDF generated');
  await browser.close();
})();
