/* Indoguna Meatshop BSD — menu rendering, search, tabs (vanilla JS, no deps) */
(function () {
  "use strict";
  var MENU = window.INDOGUNA_MENU || [];
  var CATS = window.INDOGUNA_MENU_CATEGORIES || [{ id: "all", label: "All" }];
  var TYPES = window.INDOGUNA_TYPE_LABELS || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var root = document.getElementById("full-menu");
  if (!root) return;

  var grid = document.getElementById("menuGrid");
  var search = document.getElementById("menuSearch");
  var searchWrap = document.getElementById("menuSearchWrap");
  var clearBtn = document.getElementById("menuSearchClear");
  var countEl = document.getElementById("menuCount");
  var emptyEl = document.getElementById("menuEmpty");
  var tablist = document.getElementById("menuTabs");
  var fmt = new Intl.NumberFormat("id-ID");

  var state = { cat: "all", q: "" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function priceHtml(item) {
    if (item.price != null && item.price > 0) return "Rp " + fmt.format(item.price);
    return '<span class="price-note">' + esc(item.priceNote || "Hubungi restoran untuk harga terbaru") + "</span>";
  }

  function card(item) {
    var badge = "";
    if (item.imageStatus === "representative") {
      badge =
        '<span class="menu-badge" tabindex="0" aria-label="Foto menggambarkan jenis hidangan dan mungkin berbeda dari penyajian aktual">' +
        "Foto referensi</span>";
    } else if (item.imageStatus === "illustration") {
      badge = '<span class="menu-badge">Ilustrasi</span>';
    }
    var cat = CATS.filter(function (c) { return c.id === item.category; })[0];
    var typeLabel = TYPES[item.type] || "";
    var srcsetAttr = item.srcset ? ' srcset="' + esc(item.srcset) + '" sizes="(max-width:560px) 100vw, (max-width:1024px) 50vw, 33vw"' : "";
    var pos = item.imagePosition ? ' style="object-position:' + esc(item.imagePosition) + '"' : "";
    return (
      '<article class="menu-card reveal in" data-id="' + esc(item.id) + '">' +
      '<div class="menu-card-media">' +
      '<img src="' + esc(item.image) + '"' + srcsetAttr +
      ' alt="' + esc(item.imageAlt) + '" width="1200" height="900" loading="lazy" decoding="async"' + pos + ">" +
      badge +
      "</div>" +
      '<div class="menu-card-body">' +
      '<div class="menu-meta"><span class="menu-cat">' + esc(cat ? cat.label : item.category) + "</span>" +
      (typeLabel ? '<span class="menu-type">' + esc(typeLabel) + "</span>" : "") +
      "</div>" +
      "<h3>" + esc(item.name) + "</h3>" +
      '<p class="menu-desc">' + esc(item.description) + "</p>" +
      '<p class="menu-price">' + priceHtml(item) + "</p>" +
      "</div></article>"
    );
  }

  function matches(item) {
    if (state.cat !== "all" && item.category !== state.cat) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    var hay = [item.name, item.description, item.category]
      .concat(item.keywords || [])
      .join(" ")
      .toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function render() {
    var items = MENU.filter(matches);
    grid.innerHTML = items.map(card).join("");
    if (items.length === 0) {
      countEl.textContent = "Tidak ada menu yang cocok";
    } else {
      countEl.textContent = items.length + " pilihan";
    }
    emptyEl.hidden = items.length !== 0;
    grid.hidden = items.length === 0;
  }

  /* Progressive disclosure: hide search below 9 items; keep implementation intact */
  if (MENU.length < 9 && searchWrap) searchWrap.hidden = true;

  /* Category tabs */
  tablist.innerHTML = CATS.map(function (c, i) {
    return (
      '<button class="menu-tab" role="tab" id="tab-' + c.id + '" ' +
      'aria-selected="' + (i === 0) + '" data-cat="' + c.id + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
      esc(c.label) +
      "</button>"
    );
  }).join("");

  tablist.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    selectTab(btn);
  });

  function selectTab(btn) {
    [].slice.call(tablist.querySelectorAll("[role=tab]")).forEach(function (t) {
      t.setAttribute("aria-selected", t === btn ? "true" : "false");
      t.tabIndex = t === btn ? 0 : -1;
    });
    state.cat = btn.dataset.cat;
    render();
  }

  /* Arrow-key navigation between tabs */
  tablist.addEventListener("keydown", function (e) {
    var tabs = [].slice.call(tablist.querySelectorAll("[role=tab]"));
    var idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    var next = null;
    if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
    else if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === "Home") next = tabs[0];
    else if (e.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
      selectTab(next);
    }
  });

  /* Search (preserved; hidden when MENU < 9) */
  var debounce;
  search.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.q = search.value.trim();
      clearBtn.hidden = !state.q;
      render();
    }, reduced ? 0 : 120);
  });
  clearBtn.addEventListener("click", function () {
    search.value = "";
    state.q = "";
    clearBtn.hidden = true;
    render();
    search.focus();
  });

  render();

  /* Active nav highlighting for all sections */
  var sections = [].slice.call(document.querySelectorAll("section[id], header[id]"));
  var navLinks = [].slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  function highlight() {
    var y = window.scrollY + 140;
    var current = null;
    sections.forEach(function (s) {
      if (s.offsetTop <= y) current = s.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { highlight(); ticking = false; });
      }
    },
    { passive: true }
  );
  highlight();

  /* Mobile navigation drawer */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("mobileNav");
  if (toggle && drawer) {
    var lastFocus = null;
    function setNav(open) {
      drawer.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        lastFocus = document.activeElement;
        var firstLink = drawer.querySelector("a");
        if (firstLink) firstLink.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    }
    toggle.addEventListener("click", function () {
      setNav(!drawer.classList.contains("open"));
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
      /* outside click handled on document below */
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        setNav(false);
        toggle.focus();
      }
    });
    /* Close when clicking outside the drawer */
    document.addEventListener("click", function (e) {
      if (
        drawer.classList.contains("open") &&
        !drawer.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        setNav(false);
      }
    });
  }
})();
