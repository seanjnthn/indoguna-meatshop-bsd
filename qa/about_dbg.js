const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  // scroll about into view like a user, then inspect
  await page.evaluate(() => document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(1600);
  const res = await page.evaluate(() => ({
    labelIn: !!document.querySelector('#about .sec-label.rv-in'),
    clipsTotal: document.querySelectorAll('#about .rv-clip').length,
    clipsGo: [...document.querySelectorAll('#about .rv-clip')].filter(x=>x.classList.contains('rv-go')).length,
    fadesGo: [...document.querySelectorAll('#about .rv-fade')].filter(x=>x.classList.contains('rv-go')).length,
    fadesTotal: document.querySelectorAll('#about .rv-fade').length,
    clipPathOfA: getComputedStyle(document.querySelector('.para-a')).clipPath,
    opacityOfP1: getComputedStyle(document.querySelector('.about-copy p')).opacity
  }));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
