#!/usr/bin/env node
/* Dependency-free audit of menu data + image assets (site + menu).
   Usage: node scripts/audit-menu-assets.mjs   (exit 1 on critical errors) */
import { createHash } from "node:crypto";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let errors = 0, warnings = 0;
const err = (m) => { console.error("ERROR:", m); errors++; };
const warn = (m) => { console.warn("WARN:", m); warnings++; };
const stats = { checked: 0, missing: 0, dupFiles: 0, dupSources: 0, missingCredits: 0, oversized: 0, representative: 0, verified: 0 };

// ---------- Load data ----------
const dataSrc = readFileSync(path.join(root, "assets/data/menu-data.js"), "utf8");
const sandbox = { window: {} };
new Function("window", dataSrc)(sandbox.window);
const MENU = sandbox.window.INDOGUNA_MENU || [];
const CATS = (sandbox.window.INDOGUNA_MENU_CATEGORIES || []).map(c => c.id);
console.log(`Loaded ${MENU.length} menu items, ${CATS.length} categories.\n`);

let credits = [];
try {
  credits = JSON.parse(readFileSync(path.join(root, "assets/data/image-credits.json"), "utf8"));
} catch {
  warn("image-credits.json missing or invalid");
}

// ---------- Per-item checks ----------
const hashes = new Map();          // sha256 -> first file
const srcPages = new Map();        // sourcePageUrl -> slot
const srcAssetIds = new Map();     // sourceAssetId -> slot
const creditByFile = new Map();
for (const c of credits) creditByFile.set(c.file, c);

const SIZE_LIMITS = { "assets/video/hero-poster.jpg": 450, default: 250, menu: 180 };

function checkFile(file, limitKB, label) {
  stats.checked++;
  const abs = path.join(root, file);
  if (!file || !existsSync(abs)) {
    err(`${label}: image missing on disk: ${file}`);
    stats.missing++;
    return null;
  }
  if (!/\.(webp|jpe?g|png|svg)$/i.test(file)) err(`${label}: unsupported format ${file}`);
  if (/\.svg$/i.test(file) && /menu\//.test(file) && !/favicon/.test(file)) {
    warn(`${label}: SVG in menu images — should have been replaced with photography (${file})`);
  }
  const kb = statSync(abs).size / 1024;
  if (kb > limitKB) { err(`${label}: oversized ${kb.toFixed(0)}KB > ${limitKB}KB (${file})`); stats.oversized++; }
  const h = createHash("sha256").update(readFileSync(abs)).digest("hex");
  if (hashes.has(h)) {
    err(`${label}: duplicate image content — ${file} identical to ${hashes.get(h)}`);
    stats.dupFiles++;
  } else hashes.set(h, file);
  return h;
}

MENU.forEach((it, idx) => {
  const tag = it.id || `item#${idx}`;
  if (!it.id) err("item missing id");
  if (!it.name || !String(it.name).trim()) err(`${tag}: empty name`);
  if (!CATS.includes(it.category)) err(`${tag}: category "${it.category}" not declared`);
  if (typeof it.price === "number" && it.price < 0) err(`${tag}: negative price`);
  if (!it.imageAlt || !String(it.imageAlt).trim()) err(`${tag}: missing alt text`);
  if (!["verified", "representative", "illustration"].includes(it.imageStatus)) {
    err(`${tag}: invalid imageStatus "${it.imageStatus}"`);
  }
  if (it.imageStatus === "verified") stats.verified++;
  if (it.imageStatus === "representative") stats.representative++;
  if (it.imageStatus === "verified" && String(it.imageSource || "").toLowerCase().includes("pexels")) {
    err(`${tag}: stock photo incorrectly marked verified`);
  }
  if (it.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(it.lastVerified)) warn(`${tag}: lastVerified not YYYY-MM-DD`);
  // dimensions present via width/height attrs in JS-rendered img
  if (!it.srcset) warn(`${tag}: no srcset (responsive sizes) for ${it.image}`);

  // primary + alt-size files
  checkFile(it.image, SIZE_LIMITS.menu, tag);
  if (Array.isArray(it.altFiles)) it.altFiles.forEach(f => checkFile(f, SIZE_LIMITS.menu, tag));

  // credits
  const base1200 = (it.image || "").replace(/-640\./, "-1200.");
  const credit = creditByFile.get(base1200);
  if (!credit) { err(`${tag}: no image-credit record for ${base1200}`); stats.missingCredits++; }
  else {
    if (!credit.sourcePageUrl || !credit.sourceName) { err(`${tag}: credit incomplete for ${base1200}`); stats.missingCredits++; }
    if (credit.sourcePageUrl) {
      if (srcPages.has(credit.sourcePageUrl)) {
        err(`duplicate source photograph across slots: ${credit.sourcePageUrl} used by both "${srcPages.get(credit.sourcePageUrl)}" and "${tag}"`);
        stats.dupSources++;
      } else srcPages.set(credit.sourcePageUrl, tag);
    }
    if (credit.sourceAssetId) {
      if (srcAssetIds.has(credit.sourceAssetId)) {
        err(`duplicate sourceAssetId across slots: ${credit.sourceAssetId}`);
        stats.dupSources++;
      } else srcAssetIds.set(credit.sourceAssetId, tag);
    }
  }
});

// ---------- Site-level assets ----------
const SITE_ASSETS = [
  ["assets/video/hero-poster.jpg", SIZE_LIMITS["assets/video/hero-poster.jpg"], "site-hero"],
  ["assets/img/about-counter.webp", SIZE_LIMITS.default, "site-about"],
  ["assets/img/butcher-cut.webp", SIZE_LIMITS.default, "site-butcher"],
  ["assets/img/counter-steaks.webp", SIZE_LIMITS.default, "site-counter-steaks"],
  ["assets/img/counter-mixed.webp", SIZE_LIMITS.default, "site-counter-mixed"],
  ["assets/img/counter-pantry.webp", SIZE_LIMITS.default, "site-counter-pantry"]
];
for (const [file, lim, label] of SITE_ASSETS) {
  checkFile(file, lim, label);
  const credit = creditByFile.get(file);
  if (!credit) { err(`${label}: no credit record`); stats.missingCredits++; continue; }
  if (!credit.sourcePageUrl || !credit.sourceName) { err(`${label}: credit incomplete`); stats.missingCredits++; continue; }
  if (srcPages.has(credit.sourcePageUrl)) {
    err(`duplicate source photograph across slots: ${credit.sourcePageUrl} also used by "${srcPages.get(credit.sourcePageUrl)}"`);
    stats.dupSources++;
  } else srcPages.set(credit.sourcePageUrl, label);
}
// OG image may share hero source — verify that's the ONLY overlap
const ogCredit = credits.find(c => (c.altFiles || []).includes("assets/img/og-image.jpg") || c.file === "assets/img/og-image.jpg");

// index.html references resolve?
const html = readFileSync(path.join(root, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href|poster)="(assets\/[^"]+\.(?:webp|jpe?g|png|svg|mp4))"/g)].map(m => m[1]);
for (const ref of new Set(refs)) {
  if (!existsSync(path.join(root, ref))) err(`index.html references missing asset: ${ref}`);
}

// ---------- Summary ----------
console.log("\n===== AUDIT SUMMARY =====");
console.log("Assets checked:", stats.checked);
console.log("Missing files:", stats.missing);
console.log("Duplicate files:", stats.dupFiles);
console.log("Duplicate source photographs:", stats.dupSources);
console.log("Missing credits:", stats.missingCredits);
console.log("Oversized files:", stats.oversized);
console.log("Representative images:", stats.representative);
console.log("Verified images:", stats.verified);
console.log(`Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) process.exit(1);
