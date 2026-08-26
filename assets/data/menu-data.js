/* ============================================================
   Indoguna Meatshop & Gourmet BSD — Menu data
   Only items verifiable from public sources for the BSD branch.
   Prices are NOT published by the restaurant for these dishes;
   price stays null until confirmed. See MENU_SOURCES.md.
   Photos: licensed Pexels stock, marked imageStatus "representative"
   (they depict the dish type, not Indoguna's exact plating).
   ============================================================ */
window.INDOGUNA_MENU = [
  {
    id: "bbq-beef-back-ribs",
    name: "BBQ Beef Back Ribs (3 Bones)",
    category: "grill",
    type: "dish",
    description: "Barbecued beef back ribs glazed in barbecue sauce, served as a three-bone rack.",
    price: null,
    priceLabel: null,
    priceNote: "Hubungi restoran untuk harga terbaru",
    image: "assets/img/menu/ribs-640.webp",
    srcset: "assets/img/menu/ribs-640.webp 640w, assets/img/menu/ribs-1200.webp 1200w",
    imageAlt: "Fresh marbled beef back ribs on butcher paper",
    imagePosition: "50% 45%",
    imageStatus: "representative",
    imageSource: "Pexels #12884544 (Dana Sredojevic)",
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
    type: "dish",
    description: "Grilled lamb chops, served as three slices with the bone in.",
    price: null,
    priceLabel: null,
    priceNote: "Hubungi restoran untuk harga terbaru",
    image: "assets/img/menu/lamb-640.webp",
    srcset: "assets/img/menu/lamb-640.webp 640w, assets/img/menu/lamb-1200.webp 1200w",
    imageAlt: "Grilled lamb chops with herbs and tomatoes served on a dark plate",
    imagePosition: "50% 50%",
    imageStatus: "representative",
    imageSource: "Pexels #7741798 (Emre Vonal)",
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
    type: "dish",
    description: "A platter of assorted grilled sausages served with a selection of condiments.",
    price: null,
    priceLabel: null,
    priceNote: "Hubungi restoran untuk harga terbaru",
    image: "assets/img/menu/sausage-640.webp",
    srcset: "assets/img/menu/sausage-640.webp 640w, assets/img/menu/sausage-1200.webp 1200w",
    imageAlt: "Grilled sausages served with bread, greens and condiments on a wooden board",
    imagePosition: "50% 55%",
    imageStatus: "representative",
    imageSource: "Pexels #5253033 (Baworn Srisatjalertwaja)",
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
    type: "service",
    description: "Pick any cut from the retail counter and have the kitchen grill it for you, including side dish and complements.",
    price: null,
    priceLabel: null,
    priceNote: "Biaya memasak dapat berubah — konfirmasi ke restoran",
    image: "assets/img/menu/counter_case-640.webp",
    srcset: "assets/img/menu/counter_case-640.webp 640w, assets/img/menu/counter_case-1200.webp 1200w",
    imageAlt: "Fresh meat selection displayed at a butcher counter",
    imagePosition: "50% 50%",
    imageStatus: "representative",
    imageSource: "Pexels #6138720 (Federico Arnaboldi)",
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
    type: "retail",
    description: "Retail counter cuts such as wagyu and US beef, fresh or frozen, priced per product at the counter.",
    price: null,
    priceLabel: null,
    priceNote: "Harga sesuai potongan · hubungi restoran",
    image: "assets/img/menu/raw_cuts-640.webp",
    srcset: "assets/img/menu/raw_cuts-640.webp 640w, assets/img/menu/raw_cuts-1200.webp 1200w",
    imageAlt: "Marbled raw beef steak held over a chilled display",
    imagePosition: "50% 40%",
    imageStatus: "representative",
    imageSource: "Pexels #9541976 (Nadin Sh)",
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
    type: "retail",
    description: "Imported condiments, marinades and seasonings from the gourmet shelves, mentioned repeatedly in guest reviews.",
    price: null,
    priceLabel: null,
    priceNote: "Harga di rak · hubungi restoran",
    image: "assets/img/menu/seasonings-640.webp",
    srcset: "assets/img/menu/seasonings-640.webp 640w, assets/img/menu/seasonings-1200.webp 1200w",
    imageAlt: "Handcrafted sauce jars and bottles displayed on a market stall shelf",
    imagePosition: "50% 50%",
    imageStatus: "representative",
    imageSource: "Pexels #11631717 (gökçe erem)",
    sourceConfidence: "high",
    lastVerified: "2026-08-24",
    featured: false,
    available: true,
    keywords: ["bumbu", "import", "sauce", "saus", "seasoning", "marinade", "gourmet"]
  }
];

window.INDOGUNA_MENU_CATEGORIES = [
  { id: "all",           label: "Semua" },
  { id: "grill",         label: "Dari Grill" },
  { id: "steak-service", label: "Layanan Steak" },
  { id: "retail",        label: "Retail Counter" }
];

window.INDOGUNA_TYPE_LABELS = {
  dish: "Hidangan",
  service: "Layanan",
  retail: "Retail Counter"
};
