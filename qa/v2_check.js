
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800); // let hero intro settle

  const out = {};
  // hero intro applied
  out.heroLoaded = await page.evaluate(() => document.body.classList.contains('hero-loaded'));
  out.lineInTransform = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.line-in')).transform);
  // action bar hidden at top
  out.barAtTop = await page.evaluate(() =>
    document.getElementById('mobileActionBar').classList.contains('mab-show'));
  // scroll past hero -> bar shows
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.waitForTimeout(700);
  out.barAfterHero = await page.evaluate(() =>
    document.getElementById('mobileActionBar').classList.contains('mab-show'));
  out.heroInnerOpacityLow = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector('.hero-inner')).opacity) < 0.4);
  // near footer -> bar hides
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(700);
  out.barNearFooterHidden = await page.evaluate(() =>
    !document.getElementById('mobileActionBar').classList.contains('mab-show'));
  // about reveals
  await page.evaluate(() => document.getElementById('about').scrollIntoView());
  await page.waitForTimeout(1300);
  out.aboutReveals = await page.evaluate(() => ({
    labelIn: !!document.querySelector('#about .sec-label.rv-in'),
    clipsGo: [...document.querySelectorAll('#about .rv-clip')].filter(x=>x.classList.contains('rv-go')).length,
    fadesGo: [...document.querySelectorAll('#about .rv-fade')].filter(x=>x.classList.contains('rv-go')).length
  }));
  out.overflowX = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  out.errors = errors.length;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
