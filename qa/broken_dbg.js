const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const broken = [];
  page.on('response', r => { if (r.status() >= 400) broken.push(r.status() + ' ' + r.url().slice(-50)); });
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0, H = window.innerHeight; y < document.documentElement.scrollHeight; y += Math.floor(H*0.8)) {
      window.scrollTo(0,y); await delay(140);
    }
  });
  await page.waitForTimeout(1500);
  // which image is broken?
  const bad = await page.evaluate(() =>
    [...document.images].filter(i => i.naturalWidth === 0).map(i => ({ src: i.currentSrc || i.src, cls: i.className, loading: i.loading })));
  console.log('HTTP4xx:', broken);
  console.log('naturalWidth=0:', JSON.stringify(bad));
  await browser.close();
})();
