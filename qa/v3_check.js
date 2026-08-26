
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,150)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(1800);

  const out = {};
  // navbar floating geometry
  out.navFloating = await page.evaluate(() => {
    const n = document.querySelector('nav');
    const cs = getComputedStyle(n);
    return { position: cs.position, radius: cs.borderRadius,
             width: Math.round(n.getBoundingClientRect().width),
             vw: window.innerWidth };
  });
  // nav state morph on scroll
  out.navAtTopStrong = await page.evaluate(() => document.getElementById('nav').classList.contains('glass--strong'));
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.waitForTimeout(700);
  out.navAfterScrollStrong = await page.evaluate(() => document.getElementById('nav').classList.contains('glass--strong'));
  // filter indicator exists + moves
  await page.evaluate(() => document.getElementById('full-menu').scrollIntoView());
  await page.waitForTimeout(800);
  out.indicator = await page.evaluate(() => {
    const ind = document.querySelector('.filter-indicator');
    if (!ind) return null;
    const before = { l: ind.style.left, w: ind.style.width };
    document.getElementById('tab-grill').click();
    return new Promise(res => setTimeout(() => {
      const after = { l: ind.style.left, w: ind.style.width };
      res({ before, after, moved: before.l !== after.l });
    }, 500));
  });
  // sticky island glass at mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.waitForTimeout(600);
  out.island = await page.evaluate(() => {
    const bar = document.getElementById('mobileActionBar');
    const cs = getComputedStyle(bar);
    return { shown: bar.classList.contains('mab-show'), radius: cs.borderRadius, bg: cs.backgroundImage !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' };
  });
  out.overflowX = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  out.errors = errors.length;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
