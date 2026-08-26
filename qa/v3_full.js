const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,120)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,120)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  const out = {};

  // navbar glass state at top vs scrolled
  out.navTop = await page.evaluate(() => {
    const n = document.getElementById('nav');
    return { pos: getComputedStyle(n).position, strong: n.classList.contains('glass--strong'),
             radius: getComputedStyle(n).borderRadius };
  });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.waitForTimeout(600);
  out.navScrolled = await page.evaluate(() =>
    document.getElementById('nav').classList.contains('glass--strong'));

  // drawer smoked glass
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.nav-toggle').click());
  await page.waitForTimeout(500);
  out.drawer = await page.evaluate(() => {
    const d = document.getElementById('mobileNav');
    return { open: d.classList.contains('open'),
             radius: getComputedStyle(d).borderRadius,
             blur: getComputedStyle(d).backdropFilter !== 'none',
             bg: getComputedStyle(d).backgroundColor };
  });
  // backdrop fallback test: emulate no support
  out.overflowX = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // analytics still fire after V3 DOM changes
  const events = [];
  page.on('console', m => { if (m.text().includes('[analytics]')) events.push(m.text()); });
  await page.evaluate(() => { window.DEBUG_ANALYTICS = true; });
  await page.keyboard.press('Escape');
  await page.click('#tab-all');
  await page.waitForTimeout(500);
  out.analyticsAfterV3 = [...new Set(events.map(e=>e.split(' ')[1].replace(/[\[\]']/g,'').split(':')[0]))];
  out.errors = errors.length;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
