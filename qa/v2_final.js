
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  // Desktop pass
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,150)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const step = Math.max(300, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y); await delay(170);
    }
    window.scrollTo(0, document.documentElement.scrollHeight); await delay(400);
    await Promise.all([...document.images].map(img => img.complete ? 0 :
      new Promise(r => { img.addEventListener('load', r, {once:true}); img.addEventListener('error', r, {once:true}); })));
    window.scrollTo(0, 0); await delay(500);
  });
  await page.waitForTimeout(600);
  const d = await page.evaluate(() => ({
    heroLoaded: document.body.classList.contains('hero-loaded'),
    brokenImgs: [...document.images].filter(i=>i.naturalWidth===0).length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    barVisibleDesktop: getComputedStyle(document.getElementById('mobileActionBar')).display
  }));
  console.log('DESKTOP:', JSON.stringify(d));
  await page.screenshot({ path: 'qa/screenshots/v2-desktop-1440-full-review.jpg', fullPage: true, quality: 80, type: 'jpeg' });
  await page.close();

  // Mobile pass
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on('pageerror', e => errors.push(e.message.slice(0,150)));
  await m.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  await m.waitForTimeout(2200);
  await m.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const step = Math.max(300, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y); await delay(170);
    }
    window.scrollTo(0, document.documentElement.scrollHeight); await delay(400);
    await Promise.all([...document.images].map(img => img.complete ? 0 :
      new Promise(r => { img.addEventListener('load', r, {once:true}); img.addEventListener('error', r, {once:true}); })));
    window.scrollTo(0, window.innerHeight * 1.4); await delay(500);
  });
  const mo = await m.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    barShown: document.getElementById('mobileActionBar').classList.contains('mab-show'),
    brokenImgs: [...document.images].filter(i=>i.naturalWidth===0).length,
    touchTargets: (() => {
      const items = [...document.querySelectorAll('.mab-item')];
      return items.map(el => { const r = el.getBoundingClientRect(); return Math.round(r.height); });
    })()
  }));
  console.log('MOBILE:', JSON.stringify(mo));
  await m.screenshot({ path: 'qa/screenshots/v2-mobile-390-full-review.jpg', fullPage: true, quality: 80, type: 'jpeg' });
  console.log('errors total:', errors.length ? errors.slice(0,4) : 'none');
  await browser.close();
})();
