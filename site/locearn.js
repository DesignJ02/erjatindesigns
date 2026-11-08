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
  var timers = [], at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    cards.forEach(function (c, i) {                                                                    /* each card pops up and is judged straight away */
      var t = i * 220;
      at(t, function () { c.classList.add("lx-in"); });
      if (c.classList.contains("sel")) { at(t + 330, function () { c.classList.add("lx-yes"); }); return; }
      at(t + 200, function () { c.classList.add("lx-why"); });                                       /* the reason is marked */
      at(t + 330, function () { c.classList.add("lx-no"); });                                        /* and the stamp lands */
    });
  }, { threshold: 0.4 });
  io.observe(box);
})();

/* The rider journey picture: its five steps arrive one after another from left to right, each in its own way (slide, curtain, route trace, focus pull, circle).
   While it plays, one clipped copy of the picture per step slides in; afterwards the plain picture takes over, so the end state is
   seamless. Nothing is hidden unless this script runs; reduced-motion visitors, and narrow screens, see the picture straight away. */
(function () {
  var fig = document.querySelector(".lx-jimg"), base = fig && fig.querySelector("img");
  if (!base || !("IntersectionObserver" in window) || window.innerWidth < 761 || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  var cuts = [0, 21.25, 39, 57.25, 76.9, 100], segs = [];         /* the five steps, cut at the arrows */
  for (var i = 0; i < 5; i++) {
    var s = document.createElement("div"), box = document.createElement("div"), im = base.cloneNode(false);
    s.className = "lx-jseg e" + (i + 1); s.setAttribute("aria-hidden", "true");
    s.style.cssText = "--l:" + cuts[i] + "%;--r:" + cuts[i + 1] + "%;--c:" + ((cuts[i] + cuts[i + 1]) / 2) + "%;clip-path:inset(-40px " + (100 - cuts[i + 1]) + "% -40px " + cuts[i] + "%)";
    box.className = "lx-jin"; im.alt = ""; im.removeAttribute("loading");
    box.appendChild(im); s.appendChild(box); fig.appendChild(s); segs.push(s);
  }
  fig.classList.add("lx-jr");
  var mark = document.createElement("span");
  mark.setAttribute("aria-hidden", "true"); mark.style.cssText = "display:block;position:relative;top:150px;height:1px;margin-bottom:-1px;pointer-events:none";
  fig.parentNode.insertBefore(mark, fig);
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); mark.remove();
    segs.forEach(function (s, k) { setTimeout(function () { s.classList.add("on"); }, k * 300); });
    setTimeout(function () { fig.classList.remove("lx-jr"); segs.forEach(function (s) { s.remove(); }); }, 4 * 300 + 1300);
  }, { threshold: 0, rootMargin: "0px 0px -15% 0px" });
  io.observe(mark);
})();
