const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  // Mobile emulation, 4x CPU throttle approximation via CDP
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36',
    isMobile: true, hasTouch: true
  });
  const page = await ctx.newPage();
  let bytes = 0; const reqs = [];
  page.on('response', async r => {
    try { const h = await r.allHeaders(); bytes += parseInt(h['content-length']||'0',10) || 0; } catch(e){}
    reqs.push(r.url());
  });
  await cdpSession(page);
  async function cdpSession(p){
    const cdp = await p.context().newCDPSession(p);
    await cdp.send('Performance.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  const t0 = Date.now();
  await page.goto('http://localhost:8471/', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const metrics = await page.evaluate(() => new Promise(res => {
    new PerformanceObserver(list => {}).observe({type:'layout-shift', buffered:true});
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint');
    res({
      fcp: Math.round((paints.find(p=>p.name==='first-contentful-paint')?.startTime) || 0),
      loadMs: Math.round(nav.loadEventEnd),
      transferKB: null
    });
  }));
  // LCP + CLS via observer injection
  const vitals = await page.evaluate(() => new Promise(res => {
    let lcp = 0, cls = 0;
    new PerformanceObserver(l => { const e = l.getEntries(); lcp = e[e.length-1].startTime; })
      .observe({type:'largest-contentful-paint', buffered:true});
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; })
      .observe({type:'layout-shift', buffered:true});
    setTimeout(() => res({ lcp: Math.round(lcp), cls: cls.toFixed(3) }), 1200);
  }));
  console.log(JSON.stringify({ ...metrics, ...vitals, totalBytesKB: Math.round(bytes/1024), requests: reqs.length }, null, 1));
  await browser.close();
})();
