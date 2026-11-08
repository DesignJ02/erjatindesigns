/* Act junctions: the chapters after each act divider hang from it like a folded sheet and swing down flat as you scroll. */
(function () {
  var acts = Array.prototype.slice.call(document.querySelectorAll(".le .act"));
  if (!acts.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var folds = [];
  acts.forEach(function (act) {
    var secs = [], n = act.nextElementSibling;
    while (n && !n.classList.contains("act") && n.classList.contains("ch")) { secs.push(n); n = n.nextElementSibling; }
    if (!secs.length) return;
    var fold = document.createElement("div");
    fold.className = "fold";
    act.parentNode.insertBefore(fold, secs[0]);
    var crease = document.createElement("i");              /* the natural crease the sheet hangs from */
    crease.className = "crease";
    crease.setAttribute("aria-hidden", "true");
    fold.appendChild(crease);
    secs.forEach(function (s) { fold.appendChild(s); });
    folds.push({ act: act, fold: fold, last: -1 });
  });
  /* make each fold span the whole viewport width; padding puts the content back in its column */
  function span() {
    folds.forEach(function (f) {
      var st = f.fold.style, par = f.fold.parentNode, pr = par.getBoundingClientRect(), pc = getComputedStyle(par);
      var l = pr.left + parseFloat(pc.paddingLeft) + parseFloat(pc.borderLeftWidth);
      var rt = pr.right - parseFloat(pc.paddingRight) - parseFloat(pc.borderRightWidth);
      var vw = document.documentElement.clientWidth;
      st.marginLeft = (-l) + "px"; st.paddingLeft = l + "px";
      st.marginRight = (-(vw - rt)) + "px"; st.paddingRight = (vw - rt) + "px";
    });
  }
  span();
  window.addEventListener("resize", span);
  window.addEventListener("load", span);
  var narrow = window.matchMedia("(max-width: 760px)");
  var ease = function (t) { return t * t * (3 - 2 * t); };
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    folds.forEach(function (f) {
      var top = f.act.getBoundingClientRect().top;
      var p = narrow.matches ? (vh * 0.92 - top) / (vh * 0.34) : (vh * 0.9 - top) / (vh * 0.5);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      p = Math.round(ease(p) * 500) / 500;
      if (p === f.last) return;
      f.last = p;
      if (p >= 1) { f.fold.style.transform = ""; f.fold.style.willChange = ""; f.fold.style.setProperty("--fp", 0); f.fold.classList.remove("folding"); return; }
      f.fold.classList.add("folding");
      f.fold.style.willChange = "transform";
      f.fold.style.transform = (narrow.matches ? "perspective(1700px) rotateX(" + (42 * (1 - p)).toFixed(2) : "perspective(2400px) rotateX(" + (80 * (1 - p)).toFixed(2)) + "deg)";
      f.fold.style.setProperty("--fp", (1 - p).toFixed(3));
    });
  }
  /* update on every signal that can move an act, plus a slow safety poll, so a fold can never be left half-open
     (layout shifts from late images or fonts, a dropped frame, a jump from a chapter link, restored scroll positions) */
  var pending = 0;
  function req() {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = 0; update(); });
    setTimeout(function () { if (pending) { cancelAnimationFrame(pending); pending = 0; update(); } }, 120);
  }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  window.addEventListener("load", function () { span(); req(); });
  window.addEventListener("pageshow", req);
  document.addEventListener("visibilitychange", req);
  if (window.ResizeObserver) { var ro = new ResizeObserver(req); folds.forEach(function (f) { ro.observe(f.fold); }); ro.observe(document.documentElement); }
  setInterval(function () { f_force(); }, 400);
  function f_force() {
    folds.forEach(function (f) { f.last = -1; });                 /* drop the cache so the next pass re-applies the correct state */
    update();
  }
  update();
})();

/* screen recordings play only while they are on screen (and not for visitors who asked for less motion).
   The two sides of a V1 / V2 slider start together and loop on their own length. A short timer re-tries any clip that the
   browser paused or refused, so a quick scroll past can never leave one stuck. */
(function () {
  var vids = document.querySelectorAll(".cx-vid video, .cx-cmp.vid video");
  if (!vids.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { document.querySelectorAll(".cx-vid video").forEach(function (v) { v.controls = true; }); return; }
  var groups = [];                                      /* each is { el: observed element, list: videos, on: visible? } */
  vids.forEach(function (v) {
    var g = v.closest(".cx-cmp.vid");
    var key = g || v, found = groups.filter(function (x) { return x.key === key; })[0];
    if (!found) groups.push({ key: key, el: g ? g.querySelector("video") : v, list: g ? Array.prototype.slice.call(g.querySelectorAll("video")) : [v], on: false, started: false });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var g = groups.filter(function (x) { return x.el === e.target; })[0];
      if (!g) return;
      g.on = e.isIntersecting;
      if (g.on) { if (!g.started) { g.list.forEach(function (v) { try { v.currentTime = 0; } catch (err) {} }); g.started = true; } }
      else { g.list.forEach(function (v) { v.pause(); }); g.started = false; }
    });
  }, { threshold: 0.35 });
  groups.forEach(function (g) { io.observe(g.el); });
  setInterval(function () {
    groups.forEach(function (g) {
      if (!g.on) return;
      g.list.forEach(function (v) { if (v.paused && v.readyState >= 2) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } });
    });
  }, 700);
})();

/* hero laptop: the poster button loads and plays the prototype in the screen; the full screen button plays it large */
(function () {
  var btn = document.querySelector(".lap-play"), v = document.querySelector(".lap-v"), fs = document.querySelector(".lap-fs");
  if (!btn || !v) return;
  function start() {
    if (!v.getAttribute("src")) v.src = v.getAttribute("data-src");
    v.hidden = false;
    btn.hidden = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  btn.addEventListener("click", start);
  var lap = document.querySelector(".scr.lap");
  function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement; }
  if (fs && lap) {
    var label = fs.querySelector("span");
    fs.addEventListener("click", function () {
      if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      start();
      var f = lap.requestFullscreen || lap.webkitRequestFullscreen;
      if (f) { try { var r = f.call(lap); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
    });
    function sync() { var on = fsEl() === lap; if (label) label.textContent = on ? "Exit full screen" : "Full screen"; fs.setAttribute("aria-label", on ? "Exit full screen" : "Play prototype full screen"); }
    document.addEventListener("fullscreenchange", function () {
      /* if the player's own full screen was used, swap it for the laptop version */
      if (fsEl() === v) { var x = document.exitFullscreen || document.webkitExitFullscreen; Promise.resolve(x.call(document)).then(function () { var f = lap.requestFullscreen || lap.webkitRequestFullscreen; if (f) f.call(lap); }).catch(function () {}); }
      sync();
    });
    document.addEventListener("webkitfullscreenchange", sync);
  }
})();

/* Options: the four cards pop up one by one, then the verdict plays out. The three rejected cards each dim and have their reason
   underlined before a REJECTED stamp lands; the chosen card then lifts, gains its border and the SELECTED badge.
   Nothing is hidden unless this script runs, and visitors who ask for less motion see the finished state straight away. */
(function () {
  var box = document.querySelector(".lx-opts");
  if (!box || !("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { box.classList.add("lx-done"); return; }
  var cards = Array.prototype.slice.call(box.querySelectorAll(".lx-opt"));
  box.classList.add("lx-anim");
  var timers = [], rv = function () { return window.rvScale ? window.rvScale() : 1; }, k0 = 1, at = function (ms, fn) { timers.push(setTimeout(fn, ms * k0)); };
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); k0 = rv();
    cards.forEach(function (c, i) {                                                                    /* each card pops up and is judged straight away */
      var t = i * 90;
      at(t, function () { c.classList.add("lx-in"); });
      if (c.classList.contains("sel")) { at(t + 200, function () { c.classList.add("lx-yes"); }); return; }
      at(t + 120, function () { c.classList.add("lx-why"); });                                       /* the reason is marked */
      at(t + 200, function () { c.classList.add("lx-no"); });                                        /* and the stamp lands */
    });
  }, { threshold: 0.4 });
  io.observe(box);
})();

/* The rider journey: each step is its own card, and the cards pop up one after another from left to right (300 ms each, ease in and out)
   the first time the row comes into view. Nothing is hidden unless this script runs; reduced-motion visitors see the cards at once. */
(function () {
  var row = document.querySelector(".lx-jcards");
  if (!row || !("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  Array.prototype.forEach.call(row.children, function (c, i) { c.style.setProperty("--i", i); });
  row.classList.add("lx-jr");
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); row.classList.add("lx-go");
  }, { threshold: 0.3 });
  io.observe(row);
})();

/* How it works: the three cards and the two arrows arrive in sequence, and each icon does one small thing: the pin drops and settles on
   a red ripple, the camera focuses inside viewfinder brackets and clicks once, a rupee coin follows a fine red path into the wallet which
   then shows a confirmation mark. Plays once when the row comes into view. Nothing is hidden unless this script runs; visitors who ask
   for less motion get the plain row. */
(function () {
  var how = document.querySelector(".lx-how");
  if (!how || !("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  var NS = "http://www.w3.org/2000/svg", steps = how.querySelectorAll(".lx-step"), arrs = how.querySelectorAll(".lx-arr");
  if (steps.length !== 3) return;
  var el = function (n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; };
  var wrap = function (svg, cls) { var g = el("g", { "class": cls }); Array.prototype.slice.call(svg.childNodes).forEach(function (c) { g.appendChild(c); }); svg.appendChild(g); return g; };
  var svgs = [0, 1, 2].map(function (i) { return steps[i].querySelector("svg"); });
  svgs.forEach(function (s) { s.style.overflow = "visible"; });
  /* 1 pin: the outline is drawn, the pin drops, a small red ripple spreads under it */
  var pin = wrap(svgs[0], "hx-pin"); pin.querySelector("path").setAttribute("pathLength", "1");
  svgs[0].insertBefore(el("ellipse", { "class": "hx-ring", cx: 12, cy: 21.6, rx: 4.2, ry: 1.2 }), pin);
  /* 2 camera: viewfinder brackets, a focusing ring in the lens, and a flash layer for the shutter */
  wrap(svgs[1], "hx-cam");
  var vf = el("g", { "class": "hx-vf" });
  ["M1 6V1h5", "M18 1h5v5", "M23 18v5h-5", "M6 23H1v-5"].forEach(function (d) { vf.appendChild(el("path", { d: d, pathLength: 1 })); });
  svgs[1].appendChild(vf);
  svgs[1].appendChild(el("circle", { "class": "hx-focus", cx: 12, cy: 13.4, r: 1.5 }));
  var flash = document.createElement("i"); flash.className = "hx-flash"; flash.setAttribute("aria-hidden", "true"); steps[1].querySelector(".lx-ico").appendChild(flash);
  /* 3 wallet: a fine red path, a rupee coin that rides it, the wallet's small nudge and a confirmation mark */
  var wal = wrap(svgs[2], "hx-wallet");
  svgs[2].insertBefore(el("path", { "class": "hx-trace", d: "M1 1.5Q7 -3.5 12 11", pathLength: 1 }), wal);
  var coin = el("g", { "class": "hx-coin" });
  coin.appendChild(el("circle", { r: 2.6 }));
  coin.appendChild(el("path", { "class": "hx-rs", d: "M-1.1 -1.1h2.2M-1.1 0.2h2.2M-1.1 -1.1c1.6 0 1.6 2.2 0 2.2h-.3l1.5 1.4" }));
  svgs[2].appendChild(coin);
  var ok = el("g", { "class": "hx-ok" });
  ok.appendChild(el("circle", { cx: 20.5, cy: 4, r: 3.7 }));
  ok.appendChild(el("path", { d: "M18.8 4.1l1.2 1.2 2.1-2.5", pathLength: 1 }));
  svgs[2].appendChild(ok);
  /* the arrows become fine lines that draw themselves */
  arrs.forEach(function (a) {
    a.textContent = "";
    var s = el("svg", { viewBox: "0 0 24 12", "class": "hx-arrow", "aria-hidden": "true", focusable: "false" });
    s.appendChild(el("path", { d: "M1 6h21", pathLength: 1, "class": "l" }));
    s.appendChild(el("path", { d: "M17 1.5L22 6l-5 4.5", pathLength: 1, "class": "h" }));
    a.appendChild(s);
  });
  how.classList.add("lx-hw");
  var k1 = 1, at = function (ms, fn) { setTimeout(fn, ms * k1); };
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); k1 = window.rvScale ? window.rvScale() : 1;
    at(0,    function () { steps[0].classList.add("in"); });
    at(60,   function () { steps[0].classList.add("go"); });       /* pin */
    at(450,  function () { arrs[0].classList.add("go"); });
    at(600,  function () { steps[1].classList.add("in"); });
    at(660,  function () { steps[1].classList.add("go"); });       /* camera: brackets, focus, then the click */
    at(1110, function () { arrs[1].classList.add("go"); });
    at(1260, function () { steps[2].classList.add("in"); });
    at(1320, function () { steps[2].classList.add("go"); });       /* coin, wallet, confirmation */
  }, { threshold: 0.35 });
  io.observe(how);
})();
