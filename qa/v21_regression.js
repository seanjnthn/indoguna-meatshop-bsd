
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const report = {};

  // ===== 1. Viewport matrix =====
  const views = [[320,568],[390,844],[768,1024],[1440,900]];
  /*eslint-disable*/
  report.viewports = [];
  for (const [w,h] of views) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0,100)));
    page.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,100)); });
    await page.goto('http://localhost:8471/', { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await page.evaluate(async () => {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      for (let y = 0, H = window.innerHeight; y < document.documentElement.scrollHeight; y += Math.floor(H*0.8)) {
        window.scrollTo(0,y); await delay(120);
      }
      window.scrollTo(0,0); await delay(300);
    });
    const r = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: [...document.images].filter(i=>i.naturalWidth===0).length,
      barIsDisplayNone: getComputedStyle(document.getElementById('mobileActionBar')).display === 'none',
      heroVisible: getComputedStyle(document.querySelector('.hero-title')).opacity !== undefined
    }));
    report.viewports.push({ w, h, ...r, errors: errs.length });
    await page.close();
  }

  // ===== 2. Reduced motion =====
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await ctx.newPage();
  const rErrs = [];
  rp.on('pageerror', e => rErrs.push(e.message.slice(0,100)));
  await rp.goto('http://localhost:8471/', { waitUntil: 'load' });
  await rp.waitForTimeout(1500);
  const rm = await rp.evaluate(() => ({
    heroLoaded: document.body.classList.contains('hero-loaded'),
    kickerOpacity: getComputedStyle(document.querySelector('.kicker')).opacity,
    lineInTransform: getComputedStyle(document.querySelector('.line-in')).transform,
    aboutLabelOpacity: (() => {
      document.getElementById('about').scrollIntoView();
      return null;
    })()
  }));
  await rp.waitForTimeout(1400);
  const rm2 = await rp.evaluate(() => ({
    aboutLabelOpacity: getComputedStyle(document.querySelector('#about .sec-label')).opacity,
    paraAclip: getComputedStyle(document.querySelector('.para-a')).clipPath,
    menuCards: document.querySelectorAll('.menu-card').length,
    barWorks: (() => { window.scrollTo(0, window.innerHeight * 1.3); return true; })()
  }));
  await rp.waitForTimeout(600);
  rm2.barShown = await rp.evaluate(() =>
    document.getElementById('mobileActionBar').classList.contains('mab-show'));
  report.reducedMotion = { ...rm, ...rm2, errors: rErrs.length };
  await ctx.close();

  // ===== 3. Keyboard navigation =====
  const kp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const kErrs = [];
  kp.on('pageerror', e => kErrs.push(e.message.slice(0,100)));
  await kp.goto('http://localhost:8471/', { waitUntil: 'load' });
  await kp.waitForTimeout(1500);
  // Tab through first 15 focusables; record tag+visible focus
  const kb = await kp.evaluate(() => {
    const results = [];
    let el = document.body;
    for (let i = 0; i < 15; i++) {
      el = el.nextElementSibling ? null : null;
      break;
    }
    return results;
  });
  // simpler: press Tab repeatedly and track activeElement
  const focused = [];
  await kp.keyboard.press('Tab');
  for (let i = 0; i < 14; i++) {
    const info = await kp.evaluate(() => {
      const a = document.activeElement;
      const cs = a ? getComputedStyle(a) : null;
      return a && a !== document.body ? (a.tagName + ':' + (a.textContent||'').trim().slice(0,18)) : 'body';
    });
    focused.push(info);
    await kp.keyboard.press('Tab');
    await kp.waitForTimeout(60);
  }
  // drawer keyboard test at mobile size
  await kp.setViewportSize({ width: 390, height: 844 });
  await kp.keyboard.press('Escape');
  const drawerTest = await kp.evaluate(async () => {
    const toggle = document.querySelector('.nav-toggle');
    toggle.focus(); toggle.click();
    await new Promise(r => setTimeout(r, 250));
    const open = document.getElementById('mobileNav').classList.contains('open');
    const inDrawer = document.getElementById('mobileNav').contains(document.activeElement);
    return { open, inDrawer };
  });
  await kp.keyboard.press('Escape');
  await kp.waitForTimeout(200);
  const drawerClosed = await kp.evaluate(() =>
    !document.getElementById('mobileNav').classList.contains('open') &&
    document.activeElement.classList.contains('nav-toggle'));
  report.keyboard = { tabSequence: focused.filter(f=>f!=='body').slice(0,10), drawerTest, drawerClosed, errors: kErrs.length };

  // ===== 4. Hero failure test: block the poster image =====
  const hp = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await hp.route('**/hero-poster.jpg*', route => route.abort());
  const hErrs = [];
  hp.on('pageerror', e => hErrs.push(e.message.slice(0,100)));
  await hp.goto('http://localhost:8471/', { waitUntil: 'load' }).catch(()=>{});
  await hp.waitForTimeout(2000);
  const heroFail = await hp.evaluate(() => ({
    headlineVisible: getComputedStyle(document.querySelector('.line-in')).opacity !== '0',
    ctasPresent: document.querySelectorAll('.hero-ctas a').length === 2,
    bgNotBlank: getComputedStyle(document.querySelector('.hero')).backgroundColor
  }));
  report.heroFailure = { ...heroFail, jsErrors: hErrs.length };
  await hp.close();

  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})();
