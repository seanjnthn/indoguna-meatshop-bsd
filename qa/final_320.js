const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  const httpErrs = [];
  const jsErrs = [];
  page.on('response', r => { if (r.status() >= 400) httpErrs.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => jsErrs.push(e.message.slice(0,100)));
  page.on('console', m => { if (m.type()==='error') jsErrs.push(m.text().slice(0,100)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  // full scroll with proper settle time (like shoot.js)
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0, H = window.innerHeight; y < document.documentElement.scrollHeight; y += Math.floor(H*0.8)) {
      window.scrollTo(0,y); await delay(170);
    }
    window.scrollTo(0, document.documentElement.scrollHeight); await delay(400);
    await Promise.all([...document.images].map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load', res, {once:true});
        img.addEventListener('error', res, {once:true});
        setTimeout(res, 4000); // safety
      });
    }));
    window.scrollTo(0,0); await delay(400);
  });
  const final = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenCount: [...document.images].filter(i=>i.naturalWidth===0).length,
    totalImgs: document.images.length,
    barUsable: (() => { window.__ok = true; return !!window.__ok; })()
  }));
  console.log(JSON.stringify({...final, httpErrs: httpErrs.length, jsErrs: jsErrs.length}));
  await browser.close();
})();
