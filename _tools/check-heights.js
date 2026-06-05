const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const filePath = path.resolve(__dirname, 'presentation-ocargo-villenave-dornon.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    document.querySelector('.nav-bar')?.remove();
    document.querySelector('.progress-bar')?.remove();
    document.querySelectorAll('.slide').forEach(s => {
      s.style.position='relative'; s.style.opacity='1'; s.style.visibility='visible';
      s.style.transform='none'; s.style.width='1920px'; s.style.height='auto';
      s.style.overflow='visible';
    });
  });
  await new Promise(r=>setTimeout(r,1500));
  const res = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.slide')).map((s,i)=>({
      slide: i+1, h: Math.round(s.scrollHeight)
    }));
  });
  res.forEach(r => console.log(`Slide ${r.slide}: ${r.h}px ${r.h>1080?'  ⚠️ OVERFLOW (+'+(r.h-1080)+')':'✅'}`));
  await browser.close();
})();
