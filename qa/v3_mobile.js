const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,120)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,120)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  // scroll journey like a real user
  const vh = await page.evaluate(() => window.innerHeight);
  for (let i = 1; i <= 6; i++) {
    await page.evaluate(yy => window.scrollTo(0, yy), i * vh * 0.9);
    await page.waitForTimeout(350);
  }
  const out = {};
  out.overflowX = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  out.horizontalScrollPossible = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth);
  // tabs still scrollable horizontally inside their strip?
  out.tabsScrollable = await page.evaluate(() => {
    const t = document.getElementById('menuTabs');
    return { scrollW: t.scrollWidth, clientW: t.clientWidth, canScroll: t.scrollWidth > t.clientWidth };
  });
  // indicator still works after fixes
  await page.click('#tab-grill');
  await page.waitForTimeout(500);
  out.indicatorLeft = await page.evaluate(() =>
    document.querySelector('.filter-indicator').style.left);
  // sticky bar
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.3));
  await page.waitForTimeout(600);
  out.barShown = await page.evaluate(() =>
    document.getElementById('mobileActionBar').classList.contains('mab-show'));
  out.errors = errors.length;
  console.log(JSON.stringify(out));
  await browser.close();
})();
