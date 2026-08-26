const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const events = [];
  const onConsole = m => { if (m.text().startsWith('[analytics]')) events.push(m.text()); };
  page.on('console', onConsole);
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  // DEBUG flag must be set BEFORE interactions; analytics reads it at event-time so this is fine
  await page.evaluate(() => { window.DEBUG_ANALYTICS = true; });
  await page.waitForTimeout(800);

  // hero click
  await page.click('.hero-ctas a.btn-primary');
  await page.waitForTimeout(400);
  let n1 = events.length;

  // sticky call click (tel: triggers navigation attempt — use evaluate to avoid aborting test)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.3));
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    document.querySelector('#mobileActionBar a[href^="tel:"]').click();
  });
  await page.waitForTimeout(400);
  let n2 = events.length;

  // filter
  await page.click('#tab-grill');
  await page.waitForTimeout(400);
  let n3 = events.length;

  console.log(JSON.stringify({
    afterHero: n1, afterSticky: n2, afterFilter: n3,
    uniqueEvents: [...new Set(events.map(e => e.split(' ')[1].replace(/[\[\]']/g,'').split(':')[0]))]
  }, null, 1));
  console.log(events.join('\n'));
  await browser.close();
})();
