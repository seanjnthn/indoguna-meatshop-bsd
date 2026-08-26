
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const views = [
    { w: 1440, h: 900,  name: 'desktop-1440' },
    { w: 768,  h: 1024, name: 'tablet-768' },
    { w: 390,  h: 844,  name: 'mobile-390' },
    { w: 320,  h: 700,  name: 'mobile-320' },
  ];
  for (const v of views) {
    const page = await browser.newPage({ viewport: { width: v.w, height: v.h } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa/screenshots/' + v.name + '-full.png', fullPage: true });
    // horizontal overflow check
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(v.name + ': saved | overflowX=' + overflow + 'px | consoleErrors=' + errors.length);
    if (errors.length) console.log('  errors:', errors.slice(0,3).join(' | '));
    await page.close();
  }
  await browser.close();
})();
