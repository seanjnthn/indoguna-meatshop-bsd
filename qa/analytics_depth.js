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
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.evaluate(() => { window.DEBUG_ANALYTICS = true; });
  await page.waitForTimeout(500);

  const vh = await page.evaluate(() => window.innerHeight);
  for (let i = 1; i <= 10; i++) {
    const y = Math.round(i * vh * 0.6);
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(600);
  const depths = events.filter(e => e.includes('scroll_depth')).map(e => {
    const m = e.match(/percent:\s*(\d+)/); return m ? m[1] : '?';
  });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.4));
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#mobileActionBar a[href*="maps/dir"]').click());
  await page.waitForTimeout(400);
  const dirs = events.filter(e => e.includes('sticky_directions'));
  console.log(JSON.stringify({ depthMarksFired: depths, depthUnique: [...new Set(depths)],
    stickyDirections: dirs.length, errors: errors.length }, null, 1));
  console.log('all unique:', [...new Set(events.map(e=>e.split(' ')[1].replace(/[\[\]']/g,'').split(':')[0]))]);
  await browser.close();
})();
