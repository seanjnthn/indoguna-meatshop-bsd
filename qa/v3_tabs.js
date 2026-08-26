
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,120)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,120)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.evaluate(() => document.getElementById('full-menu').scrollIntoView());
  await page.waitForTimeout(600);
  // click through ALL tabs and record indicator positions
  const positions = [];
  for (const id of ['tab-grill','tab-steak-service','tab-retail','tab-all']) {
    await page.click('#' + id);
    await page.waitForTimeout(500);
    positions.push(await page.evaluate(() =>
      document.querySelector('.filter-indicator').style.left));
  }
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(JSON.stringify({ positions: [...new Set(positions)], overflowX: ov, errors: errors.length }));
  await browser.close();
})();
