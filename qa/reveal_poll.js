const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,200)));
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  // scroll slowly to about and stay
  await page.evaluate(() => {
    document.getElementById('about').scrollIntoView({behavior:'instant'});
  });
  // poll clip state every 300ms for 4s
  const timeline = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(350);
    const st = await page.evaluate(() => ({
      go: [...document.querySelectorAll('#about .rv-clip')].filter(x=>x.classList.contains('rv-go')).length,
      inCls: !!document.querySelector('#about .rv-in'),
      top: Math.round(document.getElementById('about').getBoundingClientRect().top)
    }));
    timeline.push(st);
    if (st.go === 2) break;
  }
  console.log(JSON.stringify(timeline));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
