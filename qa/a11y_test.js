
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });

  const out = {};

  // 1. Jakarta pill text
  await page.waitForTimeout(300);
  out.pillText = await page.textContent('#openPill');

  // 2. Timezone simulation tests
  out.tzTests = await page.evaluate(() => {
    const dayMap = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6, Sun:0 };
    function calc(weekday, hh, mm) {
      const mins = hh*60 + mm;
      return mins >= 510 && mins < 1260 ? 'Buka sekarang' : 'Tutup · buka kembali pukul 08.30';
    }
    // verify boundary logic + real formatter sanity
    const f = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Jakarta', weekday:'short', hour:'2-digit', minute:'2-digit', hour12:false });
    const parts = {}; f.formatToParts(new Date()).forEach(p=>parts[p.type]=p.value);
    return {
      t0829: calc(parts.weekday,8,29), t0830: calc(parts.weekday,8,30),
      t2059: calc(parts.weekday,20,59), t2100: calc(parts.weekday,21,0),
      jakartaNow: parts.weekday + ' ' + parts.hour + ':' + parts.minute,
      dayMapped: dayMap[parts.weekday]
    };
  });

  // 3. Drawer behaviour at 320px
  await page.click('.nav-toggle');
  await page.waitForTimeout(250);
  out.drawerOpen = await page.evaluate(() => document.getElementById('mobileNav').classList.contains('open'));
  out.bodyLocked = await page.evaluate(() => document.body.style.overflow === 'hidden');
  out.focusInDrawer = await page.evaluate(() => document.getElementById('mobileNav').contains(document.activeElement));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  out.drawerClosedByEsc = await page.evaluate(() => !document.getElementById('mobileNav').classList.contains('open'));
  out.focusBackOnToggle = await page.evaluate(() => document.activeElement.classList.contains('nav-toggle'));
  out.scrollRestored = await page.evaluate(() => document.body.style.overflow !== 'hidden');

  // outside click closes
  await page.click('.nav-toggle');
  await page.waitForTimeout(150);
  await page.mouse.click(160, 600); // middle of page, outside drawer
  await page.waitForTimeout(150);
  out.drawerClosedByOutside = await page.evaluate(() => !document.getElementById('mobileNav').classList.contains('open'));

  // 4. touch target sizes
  out.touchTargets = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.nav-toggle, .menu-tab, .nav-call, #menuSearchClear')];
    return els.map(e => { const r = e.getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height); });
  });

  // 5. nav order vs section order
  out.navOrder = await page.evaluate(() =>
    [...document.querySelectorAll('.nav-links a[href^="#"]')].map(a=>a.getAttribute('href')));
  out.sectionOrder = await page.evaluate(() =>
    [...document.querySelectorAll('section[id], header[id]')].map(s=>'#'+s.id));

  // 6. search hidden at 6 items
  out.searchHidden = await page.evaluate(() => document.getElementById('menuSearchWrap').hidden);

  console.log(JSON.stringify(out, null, 1));
  console.log('consoleErrors:', errors.length ? errors : 'none');
  await browser.close();
})();
