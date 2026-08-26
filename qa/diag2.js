
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,150)); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message.slice(0,150)));
  // capture the V2 script content as served
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  const served = await page.evaluate(() =>
    [...document.scripts].map(s => s.textContent || '').join('\n').includes('V2 motion system'));
  console.log('v2 script served to browser:', served);
  await page.waitForTimeout(2200);
  const st = await page.evaluate(() => ({
    heroLoaded: document.body.classList.contains('hero-loaded'),
    lineIn: getComputedStyle(document.querySelector('.line-in')).transform,
    kickerOpacity: getComputedStyle(document.querySelector('.kicker')).opacity
  }));
  console.log(JSON.stringify(st));
  console.log('errors:', errors.slice(0,3));
  await browser.close();
})();
