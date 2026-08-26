
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,200)); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message.slice(0,200)));
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const diag = await page.evaluate(() => ({
    heroLoaded: document.body.classList.contains('hero-loaded'),
    v2Script: [...document.scripts].some(sc => (sc.textContent||'').includes('V2 motion system')),
    readyState: document.readyState,
    wideEls: (() => {
      const vw = document.documentElement.clientWidth;
      return [...document.querySelectorAll('*')]
        .filter(el => el.getBoundingClientRect().right > vw + 4)
        .slice(0,5)
        .map(el => el.tagName + '.' + String(el.className).split(' ')[0] + ' w=' + Math.round(el.getBoundingClientRect().width));
    })()
  }));
  console.log(JSON.stringify(diag, null, 1));
  console.log('errors:', errors.slice(0,3));
  await browser.close();
})();
