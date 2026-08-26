
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,150)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,150)); });
  await page.goto('https://seanjnthn.github.io/indoguna-meatshop-bsd/?v=2259a07', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  // filter click on production
  await page.evaluate(() => document.getElementById('full-menu').scrollIntoView());
  await page.waitForTimeout(700);
  await page.click('#tab-grill');
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    indicatorLeft: document.querySelector('.filter-indicator').style.left,
    cardsShown: document.querySelectorAll('.menu-card').length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    navGlass: document.getElementById('nav').classList.contains('glass--regular')
  }));
  console.log(JSON.stringify({...r, errors: errors.length}));
  await browser.close();
})();
