const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const views = [
    { w: 1440, h: 900,  name: 'desktop-1440' },
    { w: 768,  h: 1024, name: 'tablet-768' },
    { w: 390,  h: 844,  name: 'mobile-390' },
    { w: 320,  h: 700,  name: 'mobile-320' },
  ];
  for (const v of views) {
    const page = await browser.newPage({ viewport: { width: v.w, height: v.h } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('request', req => {
      if (/images\.pexels|cdn\.pixabay|images\.unsplash/.test(req.url()))
        errors.push('EXTERNAL IMAGE REQUEST: ' + req.url());
    });
    await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });

    // fonts ready + progressive scroll + wait all images
    await page.evaluate(async () => {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      await document.fonts.ready;
      const step = Math.max(300, Math.floor(window.innerHeight * 0.75));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await delay(160);
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
      await delay(400);
      await Promise.all([...document.images].map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(res => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
      }));
      window.scrollTo(0, 0);
      await delay(400);
    });

    // verify every image loaded
    const broken = await page.evaluate(() =>
      [...document.images].filter(i => i.naturalWidth === 0).map(i => i.src));
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const pill = await page.evaluate(() => ({
      state: document.getElementById('openPill').dataset.state,
      text: document.getElementById('openPill').textContent.trim()
    }));

    await page.screenshot({ path: 'qa/screenshots/' + v.name + '-full.png', fullPage: true });
    console.log(v.name + ': overflowX=' + overflow + ' | broken=' + broken.length +
      ' | consoleErrors=' + errors.length + ' | pill=' + pill.state + ' "' + pill.text + '"');
    if (broken.length) console.log('  broken:', broken.slice(0,3));
    if (errors.length) console.log('  errors:', errors.slice(0,3));
    await page.close();
  }
  await browser.close();
})();
