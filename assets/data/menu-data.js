/* ============================================================
   Indoguna Meatshop & Gourmet BSD — Menu data
   Only items verifiable from public sources for the BSD branch.
   Prices are NOT published by the restaurant for these dishes;
   price stays null until confirmed. See MENU_SOURCES.md.
   ============================================================ */
window.INDOGUNA_MENU = [
  {
    id: "bbq-beef-back-ribs",
    name: "BBQ Beef Back Ribs (3 Bones)",
    category: "grill",
    description: "Barbecued beef back ribs glazed in barbecue sauce, served as a three-bone rack.",
    price: null,
    priceLabel: null,
    image: "assets/img/menu/bbq-beef-back-ribs.svg",
    imageAlt: "Illustration of barbecued beef back ribs glazed with barbecue sauce",
    imageStatus: "illustration",
    imageSource: "original-svg-illustration",
    sourceConfidence: "medium",
    lastVerified: "2026-08-24",
    featured: true,
    available: true,
    keywords: ["beef", "ribs", "bbq", "barbecue", "grilled", "iga", "sapi", "bakar"]
  },
  {
    id: "lamb-chops",
    name: "Lamb Chops (3 Slices)",
    category: "grill",
    description: "Grilled lamb chops, served as three slices with the bone in.",
    price: null,
    priceLabel: null,
    image: "assets/img/menu/lamb-chops.svg",
    imageAlt: "Illustration of three grilled lamb chops with french-trimmed bones",
    imageStatus: "illustration",
    imageSource: "original-svg-illustration",
    sourceConfidence: "medium",
    lastVerified: "2026-08-24",
    featured: false,
    available: true,
    keywords: ["lamb", "chops", "domba", "grilled", "kambing"]
  },
  {
    id: "mix-sausage",
    name: "Mix Sausage With Mix Condiment",
    category: "grill",
    description: "A platter of assorted grilled sausages served with a selection of condiments.",
    price: null,
    priceLabel: null,
    image: "assets/img/menu/mix-sausage.svg",
    imageAlt: "Illustration of a mixed grilled sausage platter with dipping condiments",
    imageStatus: "illustration",
    imageSource: "original-svg-illustration",
    sourceConfidence: "medium",
    lastVerified: "2026-08-24",
    featured: false,
    available: true,
    keywords: ["sausage", "sosis", "platter", "grilled", "condiment", "saus"]
  },
  {
    id: "cook-your-cut",
    name: "Cook Your Cut Service",
    category: "steak-service",
    description: "Pick any cut from the retail counter and have the kitchen grill it for you, including side dish and complements. Cooking surcharge approx. Rp 60.000 (reported by Side.id; confirm current rate with the restaurant).",
    price: null,
    priceLabel: "Biaya masak ±Rp 60.000 (termasuk side dish)",
    image: "assets/img/menu/choose-your-cut.svg",
    imageAlt: "Illustration of a butcher display counter with fresh beef cuts on crushed ice",
    imageStatus: "illustration",
    imageSource: "original-svg-illustration",
    sourceConfidence: "high",
    lastVerified: "2026-08-24",
    featured: true,
    available: true,
    keywords: ["steak", "cut", "grill", "service", "masak", "pilih", "daging", "side dish"]
  },
  {
    id: "fresh-beef-cuts",
    name: "Fresh & Frozen Beef Cuts",
    category: "retail",
    description: "Retail counter cuts such as wagyu and US beef, fresh or frozen, priced per product at the counter.",
    price: null,
    priceLabel: "Harga sesuai potongan · hubungi restoran",
    image: "assets/img/menu/fresh-beef-cuts.svg",
    imageAlt: "Illustration of fresh marbled wagyu and lean beef cuts on butcher paper",
    imageStatus: "illustration",
    imageSource: "original-svg-illustration",
    sourceConfidence: "high",
    lastVerified: "2026-08-24",
    featured: false,
    available: true,
    keywords: ["wagyu", "us beef", "daging", "sapi", "retail", "frozen", "fresh", "belanja"]
  },
  {
    id: "imported-seasonings",
    name: "Imported Sauces & Seasonings",
    category: "retail",
    description: "Imported condiments, marinades and seasonings from the gourmet shelves, mentioned repeatedly in guest reviews.",
    price: null,
    priceLabel: "Harga di rak · hubungi restoran",
    image: "assets/img/menu/imported-seasonings.svg",
    imageAlt: "Illustration of gourmet shelves stocked with imported sauces and seasonings",
    imageStatus: "illustration",
    imageSource: "original-svg-illustration",
    sourceConfidence: "high",
    lastVerified: "2026-08-24",
    featured: false,
    available: true,
    keywords: ["bumbu", "import", "sauce", "saus", "seasoning", "marinade", "gourmet"]
  }
];

window.INDOGUNA_MENU_CATEGORIES = [
  { id: "all",           label: "All" },
  { id: "grill",         label: "From the Grill" },
  { id: "steak-service", label: "Steak Service" },
  { id: "retail",        label: "Retail Counter" }
];
