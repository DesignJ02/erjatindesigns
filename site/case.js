// Case-study behaviour: progress, chapter rail, compare slider, lightbox, reveals, count-up, hero parallax
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };


  // going back to the home page from a case study should not replay the intro film
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href*='index.html']");
    if (a) { try { sessionStorage.setItem("introSeen", "1"); } catch (err) {} }
  });

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
  /* jump to a chapter. The page keeps changing height while you travel (images load, sheets unfold), so a plain smooth scroll
     stops short or long. This one re-measures the chapter heading on every frame, and keeps correcting briefly after it arrives. */
  var NAV = 140, scrollRaf = 0, stopScroll = function () { cancelAnimationFrame(scrollRaf); scrollRaf = 0; };
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { addEventListener(ev, stopScroll, { passive: true }); });
  function goTo(sec) {
    stopScroll();
    var head = sec.querySelector(".ch-head") || sec;
    var where = function () { return Math.max(0, Math.round(head.getBoundingClientRect().top + scrollY - NAV)); };
    if (reduce) { scrollTo(0, where()); return; }
    var from = scrollY, t0 = performance.now(), dur = Math.min(1200, Math.max(550, Math.abs(where() - from) * 0.22)), settled = 0;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, to = where();
      scrollTo(0, k < 1 ? from + (to - from) * e : to);
      if (k < 1) { scrollRaf = requestAnimationFrame(step); return; }
      /* arrived: watch for layout shifts a little longer and follow the heading */
      if (Math.abs(to - scrollY) > 1) settled = 0; else settled++;
      if (now - t0 < dur + 1500 && settled < 20) scrollRaf = requestAnimationFrame(step);
      else scrollRaf = 0;
    })(t0);
  }
  var rail = links.length ? links[0].closest(".cx-rail") : null;
  /* after a jump the list stays open while the pointer is on it and folds away once the pointer leaves; the clicked link must not keep it open through focus */
  function shut() {
    if (!rail) return;
    if (document.activeElement && rail.contains(document.activeElement)) document.activeElement.blur();
  }
  if (rail) { var away = function () { rail.classList.remove("shut"); if (document.activeElement && rail.contains(document.activeElement) && !document.activeElement.matches(":focus-visible")) document.activeElement.blur(); }; rail.addEventListener("mouseleave", away); rail.addEventListener("pointerleave", away); }
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
        goTo(t);
        shut();
        if (history.replaceState) history.replaceState(null, "", "#" + l.dataset.ch);
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
