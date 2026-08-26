const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });

  // boundary logic (same formula as production code)
  const tz = await page.evaluate(() => {
    function state(hh, mm) {
      const mins = hh*60 + mm;
      return (mins >= 510 && mins < 1260) ? 'open' : 'closed';
    }
    return {
      t0829: state(8,29), t0830: state(8,30),
      t2059: state(20,59), t2100: state(21,0)
    };
  });

  // pill visual state check
  const pillState = await page.evaluate(() => {
    const p = document.getElementById('openPill');
    const cs = getComputedStyle(p, '::before');
    return { state: p.dataset.state, dotColor: cs.backgroundColor, anim: cs.animationName };
  });

  // weekday highlight
  const today = await page.evaluate(() => {
    const f = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',weekday:'short'});
    const map = {Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:0};
    const day = map[f.format(new Date())];
    const row = document.querySelector('#hoursTable .today');
    return { jakartaDay: day, highlighted: row ? row.querySelector('span').textContent : null };
  });

  // drawer
  await page.click('.nav-toggle');
  await page.waitForTimeout(200);
  const dOpen = await page.evaluate(() => document.getElementById('mobileNav').classList.contains('open'));
  const focusIn = await page.evaluate(() => document.getElementById('mobileNav').contains(document.activeElement));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const dEsc = await page.evaluate(() => !document.getElementById('mobileNav').classList.contains('open'));
  const focusBack = await page.evaluate(() => document.activeElement.classList.contains('nav-toggle'));
  await page.click('.nav-toggle'); await page.waitForTimeout(150);
  await page.mouse.click(160, 650); await page.waitForTimeout(150);
  const dOutside = await page.evaluate(() => !document.getElementById('mobileNav').classList.contains('open'));
  const scrollOk = await page.evaluate(() => document.body.style.overflow !== 'hidden');

  // nav labels
  const navLabels = await page.evaluate(() =>
    [...document.querySelectorAll('.nav-links a')].map(a => a.textContent.trim()));

  // footer disclosure
  const footer = await page.evaluate(() =>
    [...document.querySelectorAll('.foot-bottom span')].map(s => s.textContent.trim()).join(' || '));

  // touch targets
  const targets = await page.evaluate(() => {
    const c = document.querySelector('.nav-call').getBoundingClientRect();
    const t = document.querySelector('.nav-toggle').getBoundingClientRect();
    return { call: Math.round(c.width)+'x'+Math.round(c.height), toggle: Math.round(t.width)+'x'+Math.round(t.height) };
  });

  console.log(JSON.stringify({ tz, pillState, today, drawer: {dOpen, focusIn, dEsc, focusBack, dOutside, scrollOk},
    navLabels, footer, targets, errors: errors.length }, null, 1));
  await browser.close();
})();
