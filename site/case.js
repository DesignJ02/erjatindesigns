// Case-study behaviour: progress, chapter rail, compare slider, lightbox, reveals, count-up, hero parallax
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // reading progress
  var bar = $("#cxbar");
  function prog() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  }
  addEventListener("scroll", prog, { passive: true });
  prog();

  // chapter rail (scroll-spy)
  var links = $$("[data-ch]");
  if (links.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle("on", l.dataset.ch === e.target.id); });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    links.forEach(function (l) {
      var t = document.getElementById(l.dataset.ch);
      if (t) spy.observe(t);
      l.addEventListener("click", function (e) {
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      });
    });
  }

  // drag-to-compare
  $$(".cx-cmp").forEach(function (c) {
    var inp = $("input", c);
    var set = function () { c.style.setProperty("--p", inp.value); };
    inp.addEventListener("input", set);
    set();
    if (!reduce && "IntersectionObserver" in window) {
      // gentle intro sweep so people discover the interaction
      var once = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        once.disconnect();
        var from = 50, t0 = null;
        (function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1100);
          var v = from + Math.sin(k * Math.PI * 2) * 18 * (1 - k);
          inp.value = v; set();
          if (k < 1) requestAnimationFrame(step); else { inp.value = 50; set(); }
        })(performance.now());
      }, { threshold: 0.6 });
      once.observe(c);
    }
  });

  // lightbox
  var lb = $("#lb");
  if (lb) {
    var im = $("img", lb);
    $$(".cx-ph img, .cx-browser img, .cx-flat img").forEach(function (i) {
      i.addEventListener("click", function () { im.src = i.src; im.alt = i.alt; lb.hidden = false; });
    });
    lb.addEventListener("click", function () { lb.hidden = true; });
    addEventListener("keydown", function (e) { if (e.key === "Escape") lb.hidden = true; });
  }

  // reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    $$(".cx-rv").forEach(function (el) { io.observe(el); });
  } else {
    $$(".cx-rv").forEach(function (el) { el.classList.add("in"); });
  }

  // count-up stats
  $$("[data-to]").forEach(function (el) {
    var fmt = function (n) { return el.dataset.comma ? Math.round(n).toLocaleString("en-US") : n.toFixed(dec); };
    var to = parseFloat(el.dataset.to), suf = el.dataset.suf || "", dec = (el.dataset.to.split(".")[1] || "").length;
    if (reduce || !("IntersectionObserver" in window)) return; // real value is already in the markup
    el.firstChild.nodeValue = fmt(0);
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = null;
      (function step(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
        el.firstChild.nodeValue = fmt(to * e);
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.6 });
    o.observe(el);
  });

  // hero parallax
  var art = $(".cx-hero-art");
  if (art && !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var items = $$("[data-d]", art);
    addEventListener("mousemove", function (e) {
      var x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      items.forEach(function (el) {
        var d = parseFloat(el.dataset.d);
        el.style.translate = (-x * d) + "px " + (-y * d) + "px";
      });
    });
  }
})();
