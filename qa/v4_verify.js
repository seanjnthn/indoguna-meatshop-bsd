const { spawn } = require("node:child_process");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const baseUrl = "http://127.0.0.1:8471/";
const server = spawn("python3", ["-m", "http.server", "8471", "--bind", "127.0.0.1"], {
  cwd: root,
  stdio: "ignore"
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  let browser;
  const errors = [];
  try {
    await delay(500);
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForTimeout(900);

    const initial = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth > innerWidth,
      strayText: [...document.body.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        .map(node => node.textContent.trim()),
      hero: document.getElementById("heroStill").getAttribute("src"),
      drawerHidden: document.getElementById("mobileNav").getAttribute("aria-hidden"),
      drawerInert: document.getElementById("mobileNav").hasAttribute("inert")
    }));
    assert(!initial.overflowX, "desktop has horizontal overflow");
    assert(initial.strayText.length === 0, "unexpected top-level text node is visible");
    assert(initial.hero.includes("hero-v2.jpg"), "V4 hero is not active");
    assert(initial.drawerHidden === "true" && initial.drawerInert, "closed drawer is exposed to assistive technology");

    await page.getByRole("link", { name: "Lihat pilihan menu" }).click();
    await page.waitForTimeout(800);
    const desktopControls = await page.evaluate(() => {
      const active = document.querySelector(".nav-links a.active");
      const navIndicator = document.querySelector(".nav-indicator").getBoundingClientRect();
      const selected = document.querySelector('[role="tab"][aria-selected="true"]');
      const selectedRect = selected.getBoundingClientRect();
      const filterRect = document.querySelector(".filter-indicator").getBoundingClientRect();
      return {
        active: active && active.textContent.trim(),
        navIndicatorWidth: navIndicator.width,
        filterDeltaX: Math.round(filterRect.x - selectedRect.x),
        filterDeltaW: Math.round(filterRect.width - selectedRect.width)
      };
    });
    assert(desktopControls.active === "Menu", "desktop active navigation is incorrect");
    assert(desktopControls.navIndicatorWidth > 20, "desktop nav capsule did not initialize");
    assert(desktopControls.filterDeltaX === 0 && desktopControls.filterDeltaW === 0, "menu capsule is misaligned");

    const searchWrapRole = await page.evaluate(() => document.getElementById("menuSearchWrap").getAttribute("role"));
    assert(searchWrapRole === "search", "search container lacks role='search'");

    await page.evaluate(() => {
      const s = document.getElementById("menuSearch");
      s.value = "wagyu";
      s.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const s = document.getElementById("menuSearch");
      s.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await page.waitForTimeout(300);
    const resetSearchVal = await page.evaluate(() => document.getElementById("menuSearch").value);
    assert(resetSearchVal === "", "search input was not cleared by Escape key");

    const grill = page.getByRole("tab", { name: "Dari Grill" });
    await grill.click();
    await grill.press("ArrowRight");
    await page.waitForTimeout(650);
    const keyboardMenu = await page.evaluate(() => ({
      selected: document.querySelector('[role="tab"][aria-selected="true"]').textContent.trim(),
      focused: document.activeElement.textContent.trim(),
      cards: document.querySelectorAll(".menu-card").length
    }));
    assert(keyboardMenu.selected === "Layanan Steak", "keyboard tab selection failed");
    assert(keyboardMenu.focused === "Layanan Steak", "keyboard focus did not follow selection");
    assert(keyboardMenu.cards === 1, "keyboard filtering returned the wrong cards");

    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForTimeout(450);
    const mobile = await page.evaluate(() => {
      const nav = document.getElementById("nav").getBoundingClientRect();
      const toggle = document.querySelector(".nav-toggle").getBoundingClientRect();
      return {
        overflowX: document.documentElement.scrollWidth > innerWidth,
        toggleRight: toggle.right,
        navRight: nav.right,
        viewportWidth: innerWidth
      };
    });
    assert(!mobile.overflowX, "320px layout has horizontal overflow");
    assert(mobile.toggleRight <= mobile.viewportWidth && mobile.toggleRight <= mobile.navRight, "mobile menu toggle is clipped");

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawerOpen = await page.evaluate(() => ({
      open: document.getElementById("mobileNav").classList.contains("open"),
      hidden: document.getElementById("mobileNav").getAttribute("aria-hidden"),
      inert: document.getElementById("mobileNav").hasAttribute("inert"),
      focusedInside: document.getElementById("mobileNav").contains(document.activeElement)
    }));
    assert(drawerOpen.open && drawerOpen.hidden === "false" && !drawerOpen.inert, "drawer open state is inconsistent");
    assert(drawerOpen.focusedInside, "focus did not enter the drawer");

    await page.locator("#mobileNav a").last().press("Tab");
    assert(await page.evaluate(() => document.activeElement === document.querySelector("#mobileNav a")), "drawer focus trap failed");
    await page.keyboard.press("Escape");
    assert(await page.evaluate(() => document.activeElement.classList.contains("nav-toggle")), "drawer focus did not return to toggle");

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(900);
    const brokenImages = await page.evaluate(() => [...document.images]
      .filter(image => !image.complete || image.naturalWidth === 0)
      .map(image => image.src));
    assert(brokenImages.length === 0, `broken images: ${brokenImages.join(", ")}`);
    assert(errors.length === 0, `browser errors: ${errors.join(" | ")}`);

    console.log("V4 QA passed: desktop controls, keyboard menu, 320px nav, drawer a11y, images, and console.");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
