// Drafting behaviour: live dimension values, dimension lines per section, pencil draw-in
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) give every section / chapter a vertical dimension line (value is its real height)
  $$(".dr-sec, .cx .ch").forEach(function (sec) {
    if (sec.querySelector(":scope > .dim-v")) return;
    var d = document.createElement("span");
    d.className = "dim-v";
    d.setAttribute("data-measure", "h:self");
    d.innerHTML = "<b></b><i>0</i><b></b>";
    d.__target = sec;
    sec.appendChild(d);
  });

  // 2) measure: data-measure="w:.selector" | "h:.selector" | "d:#id" | "h:self" (parent section)
  function measure() {
    $$("[data-measure]").forEach(function (el) {
      var spec = el.getAttribute("data-measure").split(":");
      var mode = spec[0], sel = spec.slice(1).join(":");
      var target = el.__target || (sel === "self" ? el.parentElement : document.querySelector(sel));
      if (!target) return;
      var r = target.getBoundingClientRect();
      var v = Math.round(mode === "h" ? r.height : r.width);
      var text = (mode === "d" ? "Ø " : "") + v;
      var holder = el.tagName.toLowerCase() === "text" ? el : (el.querySelector("i") || el);
      if (holder.textContent !== text) holder.textContent = text;
    });
  }
  measure();
  addEventListener("load", measure);
  addEventListener("resize", measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);

  // 3) pencil draw-in: every stroked shape inside .draw gets pathLength=1 so dash maths is uniform
  $$(".draw").forEach(function (svg) {
    $$("path, line, rect, circle, polygon, ellipse, polyline", svg).forEach(function (n) {
      n.setAttribute("pathLength", "1");
    });
  });
  if (reduce || !("IntersectionObserver" in window)) {
    $$(".draw").forEach(function (s) { s.classList.add("in", "done"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = e.target;
        s.classList.add("in");
        io.unobserve(s);
        setTimeout(function () { s.classList.add("done"); }, 2000);
      });
    }, { threshold: 0.2 });
    $$(".draw").forEach(function (s) { io.observe(s); });
  }
})();

/* light/dark bulb on pages that do not load script.js (case studies) */
(function () {
  var b = document.getElementById("theme");
  if (!b || document.querySelector('script[src*="script.js"]')) return;
  b.addEventListener("click", function () {
    var r = document.documentElement;
    var next = (r.getAttribute("data-theme") || "light") === "dark" ? "light" : "dark";
    r.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* project artwork has a dark-mode variant; swap sources with the theme (no filter, so a paper backing works in both) */
(function () {
  var root = document.documentElement;
  function sync() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll("img[data-dark]").forEach(function (im) {
      var want = dark ? im.getAttribute("data-dark") : im.getAttribute("data-light");
      if (want && im.getAttribute("src") !== want) im.setAttribute("src", want);
    });
  }
  sync();
  try { new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme"] }); } catch (e) {}
})();

/* images occasionally fail on a busy dev server / flaky connection and then stay as a broken-image icon;
   retry each failed image a few times with a cache-busting query so the exploded portrait and work art always load */
(function () {
  function retry(im) {
    var n = +(im.getAttribute("data-retry") || 0);
    if (n >= 4) return;
    im.setAttribute("data-retry", String(n + 1));
    var base = (im.getAttribute("src") || "").replace(/([?&])r=\d+/, "").replace(/[?&]$/, "");
    if (!base) return;
    setTimeout(function () { im.setAttribute("src", base + (base.indexOf("?") > -1 ? "&" : "?") + "r=" + (n + 1) + Date.now() % 1000); }, 250 * (n + 1));
  }
  function watch(im) {
    im.addEventListener("error", function () { retry(im); });
    if (im.complete && im.naturalWidth === 0 && im.getAttribute("src")) retry(im);
  }
  var imgs = document.querySelectorAll("img");
  for (var i = 0; i < imgs.length; i++) watch(imgs[i]);
})();

/* process stack: opens on first hover/tap, then follows scroll direction while in view; each layer explains a step */
(function () {
  var stk = document.getElementById("stk");
  if (!stk) return;
  var card = stk.querySelector(".stk-card"), layers = Array.prototype.slice.call(stk.querySelectorAll(".lay"));
  var kEl = card.querySelector(".k"), tEl = card.querySelector("b"), pEl = card.querySelector("p");
  var dflt = [kEl.textContent, tEl.textContent, pEl.textContent];
  var used = false, inView = false, lastY = window.pageYOffset || 0, ticking = false;
  function setState(s) { if (stk.getAttribute("data-state") !== s) stk.setAttribute("data-state", s); }
  function show(l) {
    layers.forEach(function (x) { x.classList.toggle("on", x === l); });
    stk.classList.toggle("has-on", !!l);
    if (l) { kEl.textContent = l.getAttribute("data-key"); tEl.textContent = l.getAttribute("data-title"); pEl.textContent = l.getAttribute("data-text"); }
    else { kEl.textContent = dflt[0]; tEl.textContent = dflt[1]; pEl.textContent = dflt[2]; }
  }
  stk.addEventListener("pointerenter", function () { used = true; setState("open"); });
  layers.forEach(function (l) {
    l.addEventListener("pointerenter", function () { used = true; setState("open"); show(l); });
    l.addEventListener("focus", function () { used = true; setState("open"); show(l); });
    l.addEventListener("blur", function () { show(null); });
    l.addEventListener("click", function () { used = true; setState("open"); show(l); });   /* touch */
  });
  stk.addEventListener("pointerleave", function () { show(null); });
  try {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.15 }).observe(stk);
  } catch (e) { inView = true; }
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset || 0, d = y - lastY;
    if (Math.abs(d) < 8) return;
    lastY = y;
    var r = stk.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    inView = r.bottom > vh * 0.1 && r.top < vh * 0.9;
    if (!used || !inView) return;       /* the first opening is always the visitor's own hover */
    setState(d > 0 ? "open" : "closed");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* CAD inspector: hovering a line of the name selects it like a CAD object and reads out live dimensions,
   font, weight and size straight from the computed style. */
(function () {
  var h1 = document.querySelector('h1[aria-label="Jatin Srivastava"]');
  if (!h1 || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var lines = h1.querySelectorAll(".l1 > span, .l2 > span");
  if (!lines.length) return;
  var el = document.createElement("div");
  el.className = "cad-hover";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="cad-box"><i class="g a"></i><i class="g b"></i><i class="g c"></i><i class="g d"></i></div>' +
    '<div class="cad-dw"><b></b></div><div class="cad-dh"><b></b></div><div class="cad-tip"></div>';
  document.body.appendChild(el);
  var box = el.querySelector(".cad-box"), dw = el.querySelector(".cad-dw"), dh = el.querySelector(".cad-dh"), tip = el.querySelector(".cad-tip");
  var cur = null, mx = 0, my = 0, raf = 0;
  var WEIGHTS = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "Semibold", 700: "Bold", 800: "ExtraBold", 900: "Black" };
  var f1 = function (n) { return n.toFixed(1); };

  function draw() {
    raf = 0;
    if (!cur) return;
    var rg = document.createRange();
    rg.selectNodeContents(cur);
    var r = rg.getBoundingClientRect(), cs = getComputedStyle(cur);
    var fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    var w = WEIGHTS[cs.fontWeight] || cs.fontWeight;
    var fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
    var ls = cs.letterSpacing === "normal" ? "0" : f1(parseFloat(cs.letterSpacing)) + "px";
    box.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
    dw.style.cssText = "left:" + r.left + "px;top:" + (r.bottom + 4) + "px;width:" + r.width + "px";
    dw.firstChild.textContent = f1(r.width);
    dh.style.cssText = "left:" + (r.right + 18) + "px;top:" + r.top + "px;height:" + r.height + "px";
    dh.firstChild.textContent = f1(r.height);
    tip.innerHTML = '<b>' + fam + ' ' + w + '</b><span>' + f1(fs) + ' px &middot; lead ' + (isNaN(lh) ? "auto" : f1(lh)) + ' &middot; track ' + ls + '</span>';
    var tw = tip.offsetWidth, x = r.right + 46, y = r.top + r.height / 2 - 18;
    if (x + tw > window.innerWidth - 8) { x = r.left; y = r.bottom + 30; }
    tip.style.transform = "translate(" + x + "px," + y + "px)";
    raf = requestAnimationFrame(draw);
  }
  Array.prototype.forEach.call(lines, function (s) {
    s.addEventListener("pointerenter", function () { cur = s; el.classList.add("on"); if (!raf) raf = requestAnimationFrame(draw); });
    s.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; });
    s.addEventListener("pointerleave", function () { if (cur === s) { cur = null; el.classList.remove("on"); } });
  });
})();
