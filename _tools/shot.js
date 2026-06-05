const puppeteer=require('puppeteer'),path=require('path');
(async()=>{const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
await p.goto('file://'+path.resolve(__dirname,'presentation-ocargo-villenave-dornon.html'),{waitUntil:'networkidle0'});
for(const n of [1,5,6,7]){
 await p.evaluate(i=>{document.querySelectorAll('.slide').forEach((s,k)=>{s.style.opacity=k===i-1?'1':'0';s.style.visibility=k===i-1?'visible':'hidden';s.style.transform='none';});},n);
 await new Promise(r=>setTimeout(r,400));
 await p.screenshot({path:`/tmp/vo_slide${n}.png`});
}
await b.close();console.log('done');})();
