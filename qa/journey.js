const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,150)); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message.slice(0,150)));
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });

  const steps = [0, 0.7, 1.2, 2, 2.6];
  const vh = await page.evaluate(() => window.innerHeight);
  let barShownAt = null;
  for (const mult of steps) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round(mult * vh));
    await page.waitForTimeout(450);
    if (barShownAt === null && mult >= 0.7) {
      const shown = await page.evaluate(() =>
        document.getElementById('mobileActionBar').classList.contains('mab-show'));
      if (shown) barShownAt = mult;
    }
  }
  // menu CTA scrolls to menu
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await page.waitForTimeout(500);
  await page.click('#mobileActionBar a[href="#full-menu"]');
  await page.waitForTimeout(1000);
  const menuVisible = await page.evaluate(() => {
    const r = document.getElementById('full-menu').getBoundingClientRect();
    return r.top < window.innerHeight * 0.5;
  });
  // reveals after journey
  const clipsGo = await page.evaluate(() =>
    [...document.querySelectorAll('#about .rv-clip')].filter(x=>x.classList.contains('rv-go')).length);
  // footer hide
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  const barHiddenAtFooter = await page.evaluate(() =>
    !document.getElementById('mobileActionBar').classList.contains('mab-show'));

  console.log(JSON.stringify({ barShownAt, clipsGo, menuCTAScrollsToMenu: menuVisible,
    barHiddenAtFooter, errors: errors.length }, null, 1));
  await browser.close();
})();
