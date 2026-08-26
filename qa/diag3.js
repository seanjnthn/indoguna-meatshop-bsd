
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,250)); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message.slice(0,250)));
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP'+r.status()+': '+r.url()); });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const st = await page.evaluate(() => ({
    heroLoaded: document.body.classList.contains('hero-loaded'),
    lineIn: getComputedStyle(document.querySelector('.line-in')).transform,
    kickerOpacity: getComputedStyle(document.querySelector('.kicker')).opacity
  }));
  console.log(JSON.stringify(st));
  console.log('errors:', JSON.stringify(errors.slice(0,4)));
  await browser.close();
})();
