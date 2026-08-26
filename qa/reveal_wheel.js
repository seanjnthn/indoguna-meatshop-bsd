const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,200)));
  // simulate a natural user scroll (wheel-like steps)
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(220);
  }
  // now about should be near viewport
  await page.waitForTimeout(1200);
  const st = await page.evaluate(() => ({
    go: [...document.querySelectorAll('#about .rv-clip')].filter(x=>x.classList.contains('rv-go')).length,
    fades: [...document.querySelectorAll('#about .rv-fade')].filter(x=>x.classList.contains('rv-go')).length,
    bar: document.getElementById('mobileActionBar').classList.contains('mab-show'),
    heroOpacity: getComputedStyle(document.querySelector('.hero-inner')).opacity
  }));
  console.log(JSON.stringify(st));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
