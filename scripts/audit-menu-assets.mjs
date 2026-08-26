#!/usr/bin/env node
/* Dependency-free audit of menu data + image assets.
   Usage: node scripts/audit-menu-assets.mjs   (exit 1 on critical errors) */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let errors = 0, warnings = 0;
const err = (m) => { console.error("ERROR:", m); errors++; };
const warn = (m) => { console.warn("WARN:", m); warnings++; };

// Load menu data without a browser
const dataSrc = readFileSync(path.join(root, "assets/data/menu-data.js"), "utf8");
const sandbox = { window: {} };
new Function("window", dataSrc)(sandbox.window);
const MENU = sandbox.window.INDOGUNA_MENU || [];
const CATS = (sandbox.window.INDOGUNA_MENU_CATEGORIES || []).map(c => c.id);

console.log(`Loaded ${MENU.length} menu items, ${CATS.length} categories.\n`);

// Duplicate IDs / slugs / names
const ids = new Set(), slugs = new Set(), names = new Set();
for (const it of MENU) {
  if (!it.id) err("item missing id");
  else if (ids.has(it.id)) err(`duplicate id: ${it.id}`);
  else ids.add(it.id);
  const slug = (it.image || "").split("/").pop().replace(/\.[a-z]+$/i, "");
  if (slug && slugs.has(slug)) err(`duplicate slug: ${slug}`);
  if (slug) slugs.add(slug);
  if (!it.name || !String(it.name).trim()) err(`${it.id}: empty name`);
  else if (names.has(it.name)) err(`duplicate name: ${it.name}`);
  else names.add(it.name);
}

// Credits
let credits = [];
try {
  credits = JSON.parse(readFileSync(path.join(root, "assets/data/image-credits.json"), "utf8"));
} catch {
  warn("image-credits.json missing or invalid");
}
const creditByFile = new Map(credits.map(c => [c.file, c]));

// Per-item checks
const hashes = new Map();
for (const it of MENU) {
  const tag = it.id;
  if (!CATS.includes(it.category) && !(sandbox.window.INDOGUNA_MENU_CATEGORIES || []).some(c => c.id === "all")) {
    err(`${tag}: category "${it.category}" not in category list`);
  }
  if (!(sandbox.window.INDOGUNA_MENU_CATEGORIES || []).map(c => c.id).includes(it.category)) {
    err(`${tag}: category "${it.category}" not declared in INDOGUNA_MENU_CATEGORIES`);
  }
  if (typeof it.price === "number" && it.price < 0) err(`${tag}: negative price`);
  if (it.price != null && (!Number.isFinite(it.price))) err(`${tag}: non-finite price`);
  if (!it.imageAlt || !String(it.imageAlt).trim()) err(`${tag}: missing alt text`);
  if (!["verified", "representative", "illustration"].includes(it.imageStatus)) {
    err(`${tag}: invalid imageStatus "${it.imageStatus}"`);
  }
  if (it.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(it.lastVerified)) warn(`${tag}: lastVerified not YYYY-MM-DD`);

  // Image file exists?
  const file = path.join(root, it.image || "");
  if (!it.image || !existsSync(file)) {
    err(`${tag}: image missing on disk: ${it.image}`);
  } else {
    const h = createHash("sha256").update(readFileSync(file)).digest("hex");
    if (hashes.has(h)) err(`${tag}: image content duplicates ${hashes.get(h)} (${it.image})`);
    hashes.set(h, it.image);
    if (/\.svg$/i.test(it.image)) {
      // SVGs are text; check they are distinct already via hash. Size check n/a.
    }
  }

  // Credit record present for each image
  const credit = creditByFile.get(it.image);
  if (!credit) err(`${tag}: no image-credit record for ${it.image}`);
  else {
    if (it.imageStatus === "verified" && !credit.sourceUrl) {
      err(`${tag}: verified image but credit has no sourceUrl`);
    }
    if (!credit.sourceName || !credit.license) warn(`${tag}: credit record incomplete (${it.image})`);
  }
  if (it.imageStatus === "illustration") {
    console.log(`  note: ${tag} uses illustration imagery — "Ilustrasi" badge required in UI`);
  }
}

// Duplicate credit files
const seenCredit = new Set();
for (const c of credits) {
  if (seenCredit.has(c.file)) warn(`duplicate credit record for ${c.file}`);
  seenCredit.add(c.file);
}

console.log(`\nAudit complete: ${errors} error(s), ${warnings} warning(s).`);
if (errors > 0) process.exit(1);
