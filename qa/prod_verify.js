
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const events = [];
  const errors = [];
  page.on('console', m => {
    if (m.type() === 'error') errors.push(m.text().slice(0,120));
    if (m.text().includes('[analytics]')) events.push(m.text());
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0,120)));
  await page.goto('https://seanjnthn.github.io/indoguna-meatshop-bsd/?v=9ea54e7', { waitUntil: 'load' });
  await page.evaluate(() => { window.DEBUG_ANALYTICS = true; });
  await page.waitForTimeout(1000);
  // click hero CTA on production
  const box = await page.locator('.hero-ctas a.btn-primary').boundingBox();
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  await page.waitForTimeout(800);
  // sticky bar call
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.3));
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('#mobileActionBar a[href^="tel:"]').click());
  await page.waitForTimeout(500);
  console.log(JSON.stringify({
    prodEventsFired: events.length,
    unique: [...new Set(events.map(e=>e.split(' ')[1].replace(/[\[\]']/g,'').split(':')[0]))],
    errors: errors.length
  }, null, 1));
  await browser.close();
})();
