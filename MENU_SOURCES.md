# Menu Sources — Indoguna Meatshop & Gourmet BSD (The Icon BSD)

Branch identity used for verification: **Indoguna Meatshop & Gourmet BSD, The Icon Blok M1 No. 22, Sampora, Cisauk, Tangerang Regency, Banten 15345 · (021) 30305524**. All research done 2026-08-24.

## Published menu items and where they came from

| Item on site | Source | Confidence | Notes |
|---|---|---|---|
| BBQ Beef Back Ribs (3 Bones) | Side.id article (see S1) | Medium | Named as a recommended resto dish for this branch; no price published |
| Lamb Chops (3 Slices) | Side.id (S1) | Medium | Same |
| Mix Sausage With Mix Condiment | Side.id (S1) | Medium | Same |
| Cook Your Cut Service (+±Rp 60.000 incl. side dish) | Side.id (S1) + Google reviews mentioning picking cuts at the counter ("Bisa sambil belanja daging…", "bisa pilih di depan deket kasir") | High | Surcharge described as approximate; must be confirmed with restaurant |
| Fresh & Frozen Beef Cuts (wagyu, US beef) | Side.id (S1) + Tokopedia store of this branch (S4) + Google review highlights | High | Retail products; prices vary per cut → price null |
| Imported Sauces & Seasonings | Google review highlight: "banyak pilihan bumbu import" + Side.id (S1) | High | Retail products |

## Sources consulted

### S1 — Side.id (Merah Putih media group)
- URL: https://side.merahputih.com/indoguna-meatshop-gourmet/
- Branch: exact BSD branch (address quoted as Ruko Horison Broadway / The Icon Blok M1 No. 22)
- Date accessed: 2026-08-24
- Information taken: recommended dishes (BBQ Beef Back Ribs 3 Bones, Lamb Chops 3 Slices, Mix Sausage With Mix Condiment); cooking surcharge ±Rp 60.000 including side dish; raw meat priced per product
- Confidence: medium (local-media listing, not restaurant-official; date of last update unknown)

### S2 — Google Maps listing (branch's own public data)
- URL: https://maps.app.goo.gl/pJVukkiuHXNYEzs77
- Branch: exact
- Date accessed: 2026-08-24
- Information taken: category (Restaurant), dine-in/takeaway, Rp 100–250K per person, hours 08.30–21.00 daily, rating 4.5/507, verbatim review highlights, "Menu" photo tab exists but photo contents were not extractable in this session
- Confidence: high (for facts above). Menu photos exist on the listing but could not be read programmatically.

### S3 — indoguna.co.id (parent company, PT Indoguna Utama)
- URL: https://indoguna.co.id/products
- Branch: corporate catalog (not branch-specific)
- Date accessed: 2026-08-24
- Information taken: product categories sold by Indoguna (Meat, El Primo Sausages & Delicatessen, Frozen Goods, Dairy & Pastry, Seafood, Fine Goods, Dry Goods, Beverages)
- Confidence: high for retail categories, but explicitly NOT treated as the restaurant menu.

### S4 — Tokopedia "INDOGUNA MEATSHOP BSD" store
- URL: https://www.tokopedia.com/indoguna-meatshop-bsd
- Branch: exact BSD branch store (5.0★, 21 ratings at access time)
- Date accessed: 2026-08-24
- Information taken: existence of online retail channel for this branch; confirms retail-counter operation
- Confidence: medium (storefront seen via search results only; product list not crawled)

## Brand-reference sources — NOT used as BSD menu content

The following describe other branches of the same brand. Per content rules they were **not** copied into the BSD menu:

- Foodierate listing "Indoguna Meatshop & Gourmet Pelajar Pejuang" (Bandung): has a brand-level menu page but with zero items ("Gambar Menu Kosong") — no usable content.
- GoFood "Indoguna Gourmet, Cipaku 1" (Jakarta): full menu visible (salmon fillet, aglio olio, carbonara, wagyu/US/AUS burger packages, nachos, bakery items, Aussie beef steak section). This is a different branch in a different city; not published here.
- Instagram accounts (@meatshopindoguna_jkt, @meatshopindoguna_bsd): social media photos are rights-restricted and were not downloaded or hotlinked.

## Unresolved items requiring restaurant confirmation

1. Prices for every published dish (all currently `price: null` with "hubungi restoran" labels).
2. Current accuracy of the ±Rp 60.000 cooking surcharge.
3. The full current restaurant menu — the branch's own Google "Menu" photos and any printed menu should be photographed/obtained directly from the restaurant to extend `menu-data.js`.
4. Whether delivery platforms (GoFood/GrabFood/ShopeeFood) carry the BSD branch under a different listing name.
5. Exact appearance/plating of each dish for replacing illustration images with real photographs (see IMAGE_SEARCH_QUERIES.md).

## Image provenance (added 2026-08-26)

All synthetic imagery was replaced with licensed Pexels photography under the Pexels License
(free for commercial use, no attribution required, no hotlinking). Full per-image records:
`assets/data/image-credits.json`. All menu photos are marked `representative` ("Foto referensi")
— none depict Indoguna's actual plating. Sources verified 2026-08-26.

### S5 — Spending range (visible copy + priceRange support)

- Source: Google Maps listing for this exact branch — "Rp 100.000–250.000 per person · reported by 158 people" (S2, same listing).
- Date accessed: 2026-08-24
- Confidence: medium (crowd-reported figure on the branch's own Google profile)
- Used for: visible line "Kisaran pengeluaran Rp100.000–250.000 per orang · berdasarkan laporan pengunjung" and JSON-LD `priceRange`.
