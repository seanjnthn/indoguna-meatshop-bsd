/* V2.1 — lightweight analytics + consolidated scroll loop */
window.INDOGUNA_ANALYTICS = (function () {
  "use strict";
  function trackEvent(name, params) {
    params = params || {};
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params);
      }
      if (window.DEBUG_ANALYTICS === true) console.log("[analytics]", name, params);
    } catch (e) { /* never break the page */ }
  }

  /* ---- delegated click tracking ---- */
  var HERO_SEL = '.hero-ctas a';
  var STICKY_SEL = '#mobileActionBar a';

  function classify(href) {
    if (!href) return "unknown";
    if (href.indexOf("tel:") === 0) return "call";
    if (href.indexOf("maps/dir") !== -1 || href.indexOf("maps.app.goo.gl") !== -1) return "directions";
    if (href.charAt(0) === "#") return "menu";
    return "external";
  }

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a") : null;
    if (!a) return;

    /* sticky bar */
    if (a.closest(STICKY_SEL)) {
      trackEvent("sticky_" + classify(a.getAttribute("href")) + "_click", { location: "sticky_bar" });
      return;
    }
    /* hero CTAs */
    if (a.closest(HERO_SEL)) {
      trackEvent("hero_" + classify(a.getAttribute("href")) + "_click", { location: "hero" });
      return;
    }
    /* visit / footer contact actions */
    if (a.closest("#visit") || a.closest("footer")) {
      var kind = classify(a.getAttribute("href"));
      if (kind === "call") trackEvent("phone_click", { location: a.closest("footer") ? "footer" : "visit" });
      else if (kind === "directions") trackEvent("directions_click", { location: a.closest("footer") ? "footer" : "visit" });
      else if (kind === "external" && a.getAttribute("href").indexOf("maps.app.goo.gl") !== -1)
        trackEvent("maps_click", { location: a.closest("footer") ? "footer" : "visit" });
    }
  }, { passive: true });

  /* ---- scroll depth (25/50/75/90, once each) ---- */
  var fired = {};
  var marks = [25, 50, 75, 90];
  var sTick = false;
  function checkDepth() {
    sTick = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    var pct = Math.round((window.scrollY / max) * 100);
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      if (!fired[m] && pct >= m) {
        fired[m] = true;
        trackEvent("scroll_depth", { percent: m });
      }
    }
  }
  window.addEventListener("scroll", function () {
    if (!sTick) { sTick = true; requestAnimationFrame(checkDepth); }
  }, { passive: true });

  /* ---- section visibility (about/menu/reviews/visit, once each) ---- */
  var seen = {};
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !seen[e.target.id]) {
          seen[e.target.id] = true;
          trackEvent("section_view", { section: e.target.id });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    ["about", "full-menu", "reviews", "visit"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  return { trackEvent: trackEvent };
})();
