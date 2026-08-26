const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  // scroll fast like the regression does, then check which images are still decoding
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0, H = window.innerHeight; y < document.documentElement.scrollHeight; y += Math.floor(H*0.8)) {
      window.scrollTo(0,y); await delay(120);
    }
    window.scrollTo(0,0); await delay(300);
  });
  await page.waitForTimeout(400);
  let bad = await page.evaluate(() =>
    [...document.images].filter(i=>i.naturalWidth===0).map(i => ({src: (i.currentSrc||i.src).split('/').pop(), complete: i.complete})));
  console.log('immediately after scroll:', JSON.stringify(bad));
  await page.waitForTimeout(2500); // allow lazy decodes to finish
  bad = await page.evaluate(() =>
    [...document.images].filter(i=>i.naturalWidth===0).map(i => ({src: (i.currentSrc||i.src).split('/').pop()})));
  console.log('after settle wait:', JSON.stringify(bad));
  const httpBad = [];
  page.on('response', r => { if (r.status() >= 400) httpBad.push(r.url()); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0, H = window.innerHeight; y < document.documentElement.scrollHeight; y += Math.floor(H*0.8)) {
      window.scrollTo(0,y); await delay(200);
    }
  });
  await page.waitForTimeout(3000);
  const final = await page.evaluate(() =>
    [...document.images].filter(i=>i.naturalWidth===0).length);
  console.log('HTTP errors:', httpBad.length, '| final naturalWidth=0 count:', final);
  await browser.close();
})();
