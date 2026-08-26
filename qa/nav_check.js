
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  await page.goto('http://localhost:8471/', { waitUntil: 'networkidle' });
  const out = await page.evaluate(() => {
    const call = document.querySelector('.nav-call');
    const toggle = document.querySelector('.nav-toggle');
    const cr = call.getBoundingClientRect(), tr = toggle.getBoundingClientRect();
    // brand vs controls collision check
    const brand = document.querySelector('.brand').getBoundingClientRect();
    return {
      callVisible: cr.width > 0 && cr.height > 0,
      callRect: Math.round(cr.width) + 'x' + Math.round(cr.height),
      callRight: Math.round(cr.right),
      toggleRect: Math.round(tr.width) + 'x' + Math.round(tr.height),
      toggleLeft: Math.round(tr.left),
      brandRight: Math.round(brand.right),
      noCollision: brand.right < tr.left
    };
  });
  console.log(JSON.stringify(out));
  // retake 320 screenshot after fix
  await page.screenshot({ path: 'qa/screenshots/mobile-320-full.png', fullPage: true });
  await browser.close();
})();
