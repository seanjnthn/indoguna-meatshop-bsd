/* Indoguna V4 — optical glass behavior and motion refinement */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function raf2(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }

  /* Sliding navigation material follows the current section. */
  var navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    var navIndicator = document.createElement("span");
    navIndicator.className = "nav-indicator";
    navIndicator.setAttribute("aria-hidden", "true");
    navLinks.appendChild(navIndicator);

    function activeNavLink() {
      return navLinks.querySelector('a.active[href^="#"]');
    }

    function moveNavIndicator(target) {
      if (!target || window.matchMedia("(max-width:720px)").matches) {
        navLinks.style.setProperty("--nav-opacity", "0");
        return;
      }
      navLinks.style.setProperty("--nav-x", target.offsetLeft + "px");
      navLinks.style.setProperty("--nav-w", target.offsetWidth + "px");
      navLinks.style.setProperty("--nav-opacity", "1");
    }

    function syncNavIndicator() {
      var active = activeNavLink();
      navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
        if (link === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      moveNavIndicator(active);
    }

    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("pointerenter", function () { moveNavIndicator(link); }, { passive: true });
      link.addEventListener("focus", function () { moveNavIndicator(link); });
    });
    navLinks.addEventListener("pointerleave", syncNavIndicator, { passive: true });
    navLinks.addEventListener("focusout", function (event) {
      if (!navLinks.contains(event.relatedTarget)) syncNavIndicator();
    });

    var navClassObserver = new MutationObserver(syncNavIndicator);
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
      navClassObserver.observe(link, { attributes: true, attributeFilter: ["class"] });
    });
    window.addEventListener("resize", syncNavIndicator, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncNavIndicator);
    raf2(syncNavIndicator);
  }

  /* Keep the menu's shared glass capsule aligned for click and keyboard use. */
  var tabs = document.getElementById("menuTabs");
  if (tabs) {
    function menuIndicator() {
      var indicator = tabs.querySelector(".filter-indicator");
      if (!indicator) {
        indicator = document.createElement("span");
        indicator.className = "filter-indicator";
        indicator.setAttribute("aria-hidden", "true");
        tabs.appendChild(indicator);
      }
      return indicator;
    }

    function syncMenuIndicator() {
      var selected = tabs.querySelector('[role="tab"][aria-selected="true"]');
      var indicator = menuIndicator();
      if (!selected || selected.offsetWidth === 0) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.left = selected.offsetLeft + "px";
      indicator.style.width = selected.offsetWidth + "px";
      indicator.style.opacity = "1";
    }

    var tabObserver = new MutationObserver(syncMenuIndicator);
    function observeTabs() {
      tabs.querySelectorAll('[role="tab"]').forEach(function (tab) {
        tabObserver.observe(tab, { attributes: true, attributeFilter: ["aria-selected"] });
      });
      syncMenuIndicator();
    }
    observeTabs();
    tabs.addEventListener("scroll", syncMenuIndicator, { passive: true });
    window.addEventListener("resize", syncMenuIndicator, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncMenuIndicator);
    raf2(syncMenuIndicator);
  }

  /* Pointer light follows the cursor but never moves the control itself. */
  if (!reduced && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".menu-toolbar,.mobile-action-bar").forEach(function (surface) {
      surface.classList.add("liquid-pointer");
      var pending = false;
      surface.addEventListener("pointermove", function (event) {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          var rect = surface.getBoundingClientRect();
          surface.style.setProperty("--shine-x", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
          surface.style.setProperty("--shine-y", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
          pending = false;
        });
      }, { passive: true });
    });
  }

  /* Stagger visible cards once; reduced-motion users get immediate content. */
  var mediaItems = [].slice.call(document.querySelectorAll(".menu-card,.dish,.quote-card"));
  if (!reduced && "IntersectionObserver" in window) {
    mediaItems.forEach(function (item, index) {
      item.classList.add("media-lift");
      item.style.setProperty("--lift-delay", ((index % 3) * 70) + "ms");
    });
    document.body.classList.add("motion-ready");
    var mediaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("media-visible");
        mediaObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    mediaItems.forEach(function (item) { mediaObserver.observe(item); });
  } else {
    mediaItems.forEach(function (item) { item.classList.add("media-visible"); });
  }
})();
