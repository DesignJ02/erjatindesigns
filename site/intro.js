/* Paper-unfolding intro.
   A three-panel sheet (six equal strips) lies folded on a green drafting mat and opens in two waves:
     1st opening  -> the engineering drawing (mechanical engineer: flange, section, title block)
     2nd opening  -> the designer's block and the homepage, printed as "Detail A"
   Then the camera pushes into that print until it is the real page.
   The motion is computed once and played by the compositor (Web Animations), so page work cannot stutter it. */
(function () {
  "use strict";
  var html = document.documentElement;
  var root = document.getElementById("intro");
  if (!root) return;
  if (!html.classList.contains("intro-pending")) { root.parentNode && root.parentNode.removeChild(root); return; }

  var finished = false, watchdog = null, started = false, anims = [];

  function seen() { try { sessionStorage.setItem("introSeen", "1"); } catch (e) {} }
  function cleanup() {
    html.classList.remove("intro-pending", "intro-lock");
    if (root && root.parentNode) root.parentNode.removeChild(root);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKey);
    clearTimeout(watchdog);
  }
  function reveal(fast) {
    if (finished) return; finished = true; seen();
    var g = window.gsap;
    var runHero = window.__runHero || function () {};
    var items = [".dr-bar", ".dr-eyebrow", ".dr-role", ".stack", ".dr-side > p", ".dr-hero-grid .dim-v"];
    if (g && !fast) { try { g.set(items, { opacity: 0, y: 10 }); } catch (e) {} }
    html.classList.remove("intro-lock");
    runHero();
    var cur = 1;
    try { cur = parseFloat(getComputedStyle(root).opacity); if (isNaN(cur)) cur = 1; } catch (e) {}
    try {
      var f = root.animate([{ opacity: cur }, { opacity: 0 }], { duration: fast ? 350 : 600, easing: "ease-in-out", fill: "forwards" });
      f.onfinish = cleanup;
      setTimeout(cleanup, (fast ? 350 : 600) + 400);
    } catch (e) { cleanup(); }
    if (g && !fast) g.to(items, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.1, clearProps: "opacity,transform" });
  }
  function skip() { if (finished) return; reveal(true); }
  function onKey(e) {
    if (e.key === "Escape" || e.key === "Enter") skip();
    else if (!finished && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home"].indexOf(e.key) > -1) e.preventDefault();
  }
  var rzT;
  var w0 = window.innerWidth || html.clientWidth || 0;
  /* mobile URL bars resize the height constantly; only a real width change ends the intro */
  function onResize() {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      var w = window.innerWidth;
      if (w0 && w > 0 && Math.abs(w - w0) > 60) skip(); else if (!w0 && w > 0) w0 = w;
    }, 150);
  }

  try {
    var vw = html.clientWidth || window.innerWidth || 1280, vh = window.innerHeight || html.clientHeight || 720;

    /* ---------- geometry: 3 panels, each 2 strips, 5 hinges ---------- */
    var PANEL_RATIO = 1.12;                         // panel height / width
    var Ws = Math.min(vw * 0.92, (vh * 0.76 / PANEL_RATIO) * 3, 1500);
    var P = Ws / 3, Hp = P * PANEL_RATIO;           // panel width / height in px
    var N = 6, SW = P / 2;                          // strips
    var PU = 1000;                                  // panel art units (width); height = 1000 * PANEL_RATIO
    var PH = PU * PANEL_RATIO;
    var MAIN = { 1: -1, 2: 1, 3: -1, 4: 1, 5: -1 };   // five hinges between six equal strips; sign alternates (zig-zag)
    var HERO = { x: 60, y: 210, w: 880, h: 880 * 745 / 1212 };   // where the homepage print sits on its panel

    /* ---------- the drawing ---------- */
    var L = function (x1, y1, x2, y2, c, st) { return '<line class="dr ' + (c || "") + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (st ? ' style="' + st + '"' : "") + '/>'; };
    var C = function (cx, cy, r, c) { return '<circle class="dr ' + (c || "") + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; };
    var T = function (x, y, txt, cls, size, extra) { return '<text class="t ' + (cls || "") + '" x="' + x + '" y="' + y + '" font-size="' + size + '" ' + (extra || "") + '>' + txt + '</text>'; };
    var R = function (x, y, w, h, c) { return '<rect class="dr ' + (c || "") + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>'; };
    var MID = 'text-anchor="middle"';
    function frame() {
      var s = R(18, 18, 964, PH - 36) + R(32, 32, 936, PH - 64, "thin");
      for (var i = 1; i < 10; i++) s += L(i * 100, 18, i * 100, 32, "thin") + L(i * 100, PH - 32, i * 100, PH - 18, "thin");
      for (var j = 1; j < 11; j++) s += L(18, j * 100, 32, j * 100, "thin") + L(968, j * 100, 982, j * 100, "thin");
      return s;
    }
    function hatch(x0, y0, w, h) {
      var o = R(x0, y0, w, h);
      for (var c = x0 + y0 + 8; c < x0 + w + y0 + h; c += 10) {
        var xa = Math.max(x0, c - (y0 + h)), xb = Math.min(x0 + w, c - y0);
        if (xb - xa > 1) o += L(xa.toFixed(1), (c - xa).toFixed(1), xb.toFixed(1), (c - xb).toFixed(1), "thin");
      }
      return o;
    }
    /* panel: the engineer's sheet */
    function panelEngineer() {
      var s = frame(), cx = 500, cy = 420;
      s += C(cx, cy, 250) + C(cx, cy, 205, "thin") + C(cx, cy, 128) + C(cx, cy, 168, "red thin chain");
      for (var k = 0; k < 6; k++) {
        var an = (30 + k * 60) * Math.PI / 180, hx = cx + 168 * Math.cos(an), hy = cy + 168 * Math.sin(an);
        s += C(hx.toFixed(1), hy.toFixed(1), 20) + L((hx - 30).toFixed(1), hy.toFixed(1), (hx + 30).toFixed(1), hy.toFixed(1), "red thin");
      }
      s += L(190, cy, 810, cy, "red thin chain") + L(cx, 130, cx, 710, "red thin chain");
      s += T(cx, cy + 56, "JS", "", 170, MID + ' font-weight="700" letter-spacing="-7"');
      s += L(150, cy, 190, cy, "", "stroke-width:4") + L(810, cy, 850, cy, "", "stroke-width:4");
      s += T(168, cy - 14, "A", "mono", 24, MID) + T(832, cy - 14, "A", "mono", 24, MID);
      s += L(250, 756, 750, 756) + L(250, 736, 250, 776, "thin") + L(750, 736, 750, 776, "thin") + L(250, 690, 250, 736, "thin dash") + L(750, 690, 750, 736, "thin dash");
      s += T(cx, 742, "Ø500 ±0.1", "mono", 24, MID);
      s += L(640, 262, 740, 168, "thin") + L(740, 168, 900, 168, "thin") + T(690, 154, "6× Ø40 EQ. SP.", "mono", 22);
      s += T(cx, 822, "FRONT VIEW", "mono", 20, MID);
      s += hatch(380, 880, 240, 40) + hatch(440, 920, 120, 70);
      s += L(330, 960, 670, 960, "red thin chain");
      s += T(700, 904, "SECTION A–A", "mono", 20);
      s += T(700, 934, "SCALE 1:1", "mono", 18);
      s += T(60, 1060, "SHEET 1 / 3 · MECHANICAL ENGINEER", "mono", 20);
      return s;
    }
    /* panel: the designer's title block + portrait */
    function panelDesigner() {
      var s = frame(), cx = 500, cy = 340;
      s += C(cx, cy, 168, "thin") + L(cx - 230, cy, cx + 230, cy, "red thin chain") + L(cx, cy - 230, cx, cy + 230, "red thin chain");
      s += '<circle class="disc" cx="' + cx + '" cy="' + cy + '" r="140"/>';
      s += '<image href="assets/portrait/final.webp" x="' + (cx - 145) + '" y="' + (cy - 145) + '" width="290" height="290" preserveAspectRatio="xMidYMid meet"/>';
      s += T(cx, 120, "DETAIL B · DESIGNER", "mono", 26, MID);
      s += L(cx - 168, cy + 218, cx + 168, cy + 218) + L(cx - 168, cy + 202, cx - 168, cy + 234, "thin") + L(cx + 168, cy + 202, cx + 168, cy + 234, "thin");
      s += T(cx, cy + 262, "Ø336", "mono", 24, MID);
      s += T(cx, 668, "REV A → REV B", "mono red", 26, MID);
      s += L(300, 690, 700, 690, "red");
      s += R(70, 770, 860, 290);
      s += L(70, 880, 930, 880, "thin") + L(70, 940, 930, 940, "thin") + L(70, 1000, 930, 1000, "thin") + L(520, 940, 520, 1060, "thin");
      s += T(96, 850, "JATIN SRIVASTAVA", "", 58, 'font-weight="700" letter-spacing="1"');
      s += T(96, 920, "MECHANICAL ENGINEER → PRODUCT DESIGNER", "mono", 26);
      s += T(96, 980, "REV A  ·  ENGINEER", "mono", 26) + T(96, 1040, "REV B  ·  DESIGNER", "mono red", 26);
      s += T(546, 980, "MATERIAL: CURIOSITY", "mono", 22) + T(546, 1040, "mm · ±0.1 · 1:1", "mono", 22);
      return s;
    }
    /* panel: the homepage as "Detail A" */
    function panelHome() {
      var s = frame();
      s += T(60, 130, "DETAIL A · HOMEPAGE", "mono", 28);
      s += T(940, 130, "SHEET 3 / 3", "mono", 24, 'text-anchor="end"');
      s += L(60, 176, 940, 176) + L(60, 164, 60, 188, "thin") + L(940, 164, 940, 188, "thin");
      s += T(500, 162, "1240", "mono", 22, MID);
      s += '<image href="assets/intro/hero.webp" x="' + HERO.x + '" y="' + HERO.y + '" width="' + HERO.w + '" height="' + HERO.h.toFixed(1) + '" preserveAspectRatio="none"/>';
      s += R(HERO.x, HERO.y, HERO.w, HERO.h.toFixed(1), "thin");
      s += T(60, HERO.y + HERO.h + 70, "PRODUCT DESIGN · USER-CENTRED", "mono", 24);
      s += T(60, HERO.y + HERO.h + 112, "FORMER ENGINEER · DESIGNER BY CHOICE", "mono", 24);
      s += T(940, PH - 60, "er.", "", 64, 'text-anchor="end" font-weight="700"');
      return s;
    }
    var PANELS = [panelEngineer(), panelDesigner(), panelHome()];    // left -> right: drawing first, homepage last

    /* ---------- DOM ---------- */
    var segHTML = "", k;
    for (k = N - 1; k >= 0; k--) {
      var pi = k >> 1, half = k & 1;
      var face = '<div class="face front' + (k === N - 1 ? " last" : "") + '"><svg viewBox="' + (half * 500) + ' 0 500 ' + PH.toFixed(1) + '" preserveAspectRatio="none" aria-hidden="true">' + PANELS[pi] + '</svg><i class="sh"></i></div>' +
                 '<div class="face back"><i class="sh"></i></div>';
      segHTML = '<div class="seg' + (MAIN[k] ? " main" : "") + '" data-k="' + k + '" style="width:' + SW.toFixed(3) + 'px;height:' + Hp.toFixed(3) + 'px;' + (k === 0 ? "margin-top:" + (-Hp / 2).toFixed(3) + "px" : "") + '">' + face + segHTML + "</div>";
    }
    var shadows = "", q;
    for (q = 0; q < N; q++) shadows += '<div class="pi-shadow"></div>';
    root.innerHTML =
      '<div class="pi-world"><div class="pi-cam"><div class="pi-tilt">' +
      '<div class="pi-mat"></div>' + shadows + '<div class="pi-sheet">' + segHTML + "</div>" +
      '</div></div></div><div class="pi-vig"></div>' +
      '<button type="button" class="pi-skip" aria-label="Skip intro animation">Skip intro</button>';
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Intro animation");

    var world = root.querySelector(".pi-world");
    var tilt = root.querySelector(".pi-tilt");
    var sheet = root.querySelector(".pi-sheet");
    var segs = Array.prototype.slice.call(root.querySelectorAll(".seg"));
    segs.sort(function (a, b) { return a.getAttribute("data-k") - b.getAttribute("data-k"); });
    var shEls = Array.prototype.slice.call(root.querySelectorAll(".pi-shadow"));
    var svgs = Array.prototype.slice.call(root.querySelectorAll(".face.front svg"));
    shEls.forEach(function (e) { e.style.width = SW.toFixed(2) + "px"; e.style.height = Hp.toFixed(1) + "px"; });
    var faceF = segs.map(function (s) { return s.querySelector(":scope > .face.front .sh"); });
    var faceB = segs.map(function (s) { return s.querySelector(":scope > .face.back .sh"); });
    var skipBtn = root.querySelector(".pi-skip");
    skipBtn.addEventListener("click", skip);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    var swallow = function (e) { e.preventDefault(); e.stopPropagation(); };
    root.addEventListener("wheel", swallow, { passive: false });
    root.addEventListener("touchmove", swallow, { passive: false });
    html.classList.add("intro-lock");
    try { skipBtn.focus({ preventScroll: true }); } catch (e) {}

    /* ---------- motion model ---------- */
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var ss = function (v) { v = clamp(v, 0, 1); return v * v * v * (v * (v * 6 - 15) + 10); };      // smootherstep
    var sine = function (v) { return 0.5 - 0.5 * Math.cos(Math.PI * clamp(v, 0, 1)); };
    var cub = function (v) { v = clamp(v, 0, 1); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
    var TT = { fold0: 0.55, fold: 3.8, ink0: 0.9, ink: 1.5, zoom0: 4.7, zoom: 1.5, end: 6.4, fps: 60 };
    var LX = -0.38, LZ = 0.925;                          // key light
    var Z_EPS = 1.2;

    function chain(Pm) {
      var h = [], zoff = [], i;
      for (i = 0; i < N; i++) { h.push(0); zoff.push(0); }
      for (i = 1; i < N; i++) {
        h[i] = MAIN[i] * 179.6 * (1 - Pm[i]);
        zoff[i] = -MAIN[i] * Z_EPS * (1 - Pm[i]);
      }
      var phi = 0, x = 0, z = 0, xs = [], zs = [], phis = [];
      for (i = 0; i < N; i++) {
        phi += h[i]; var r = phi * Math.PI / 180;
        phis.push(r); xs.push(x); zs.push(z);
        x += SW * Math.cos(r); z += -SW * Math.sin(r);
      }
      xs.push(x); zs.push(z);
      return { h: h, zoff: zoff, xs: xs, zs: zs, phis: phis };
    }
    /* the accordion is pulled open from its near end: each hinge lets one equal strip fall flat while the
       still-folded bundle behind it (never longer than one strip) rides along, so no big flap ever swings */
    var START = [0, 0.0, 0.1, 0.5, 0.6, 0.7], WIN = 0.28;

    var cw = root.clientWidth || vw, ch = root.clientHeight || vh, u = P / PU;
    var camX = cw / 2 - Ws / 2 + 2 * P + HERO.x * u, camY = ch / 2 - Hp / 2 + HERO.y * u;
    var camS = cw / (HERO.w * u);
    world.style.transformOrigin = camX.toFixed(1) + "px " + camY.toFixed(1) + "px";

    /* pass 1: kinematics + raw centring */
    var NF = Math.ceil(TT.end * TT.fps) + 1, fr = [], k2;
    for (k2 = 0; k2 < NF; k2++) {
      var t = k2 / TT.fps, mm = clamp((t - TT.fold0) / TT.fold, 0, 1);
      var Pm = [0]; for (var hh = 1; hh < N; hh++) Pm.push(ss((mm - START[hh]) / WIN));
      var c0 = chain(Pm);
      var mn = Infinity, mx = -Infinity;
      for (var bb = 0; bb <= N; bb++) { mn = Math.min(mn, c0.xs[bb]); mx = Math.max(mx, c0.xs[bb]); }
      c0.rawTx = -(mn + mx) / 2; c0.t = t; c0.m = mm;
      fr.push(c0);
    }
    /* the sheet re-centres while it opens; low-pass it so the pan never kinks when the extreme edge changes hands */
    var tx = fr.map(function (f) { return f.rawTx; }), pass, win = Math.round(0.45 * TT.fps);
    for (pass = 0; pass < 3; pass++) {
      var out = [];
      for (k2 = 0; k2 < NF; k2++) {
        var acc = 0, cnt = 0;
        for (var d = -win; d <= win; d++) { var j = clamp(k2 + d, 0, NF - 1); acc += tx[j]; cnt++; }
        out.push(acc / cnt);
      }
      tx = out;
    }

    /* pass 2: per-element keyframes */
    var K = { sheet: [], tilt: [], world: [], root: [], seg: [], shT: [], faceF: [], faceB: [], svg: [] };
    for (var q3 = 0; q3 < N; q3++) { K.seg.push([]); K.shT.push([]); K.faceF.push([]); K.faceB.push([]); K.svg.push([]); }
    for (k2 = 0; k2 < NF; k2++) {
      var f = fr[k2], tt = f.t, e = sine(f.m);
      var inkV = sine((tt - TT.ink0) / TT.ink).toFixed(3);
      var zz = cub((tt - TT.zoom0) / TT.zoom);
      K.root.push({ opacity: clamp(tt / 0.5, 0, 1).toFixed(3) });
      K.sheet.push({ transform: "translate3d(" + tx[k2].toFixed(2) + "px,0,0)" });
      K.tilt.push({ transform: "rotateX(" + (28 * (1 - e)).toFixed(3) + "deg) rotateZ(" + (-2 * (1 - e)).toFixed(3) + "deg)" });
      K.world.push({ transform: "translate3d(" + (-camX * zz).toFixed(2) + "px," + (-camY * zz).toFixed(2) + "px,0) scale(" + (1 + (camS - 1) * zz).toFixed(4) + ")" });
      for (var c = 0; c < N; c++) {
        K.seg[c].push({ transform: c === 0 ? "none" : "rotateY(" + f.h[c].toFixed(3) + "deg) translateZ(" + f.zoff[c].toFixed(3) + "px)" });
        var n0 = Math.sin(f.phis[c]), n1 = Math.cos(f.phis[c]);
        var lit = n0 * LX + n1 * LZ, front = n1 >= 0, litv = front ? lit : -lit;
        var al = clamp((0.92 - litv) * 0.4, 0, 0.17).toFixed(3);
        K.faceF[c].push({ opacity: front ? al : "0" });
        K.faceB[c].push({ opacity: front ? "0" : al });
        var zmid = Math.max(0, (f.zs[c] + f.zs[c + 1]) / 2), xa = f.xs[c] + tx[k2], xb = f.xs[c + 1] + tx[k2];
        var sx = Math.max(0.02, Math.abs(xb - xa) / SW);
        K.shT[c].push({
          transform: "translate3d(" + (Math.min(xa, xb) + zmid * 0.35 + 1).toFixed(1) + "px," + (-Hp / 2 + zmid * 0.28 + 2).toFixed(1) + "px,-3px) scale3d(" + sx.toFixed(4) + ",1,1)",
          opacity: clamp(0.3 - zmid * 0.0009, 0.08, 0.3).toFixed(2)
        });
        K.svg[c].push({ opacity: inkV });
      }
    }

    var opts = { duration: TT.end * 1000, easing: "linear", fill: "both" };
    function add(el, frames) { if (!el) return; var a = el.animate(frames, opts); a.pause(); anims.push(a); }
    add(root, K.root); add(sheet, K.sheet); add(tilt, K.tilt); add(world, K.world);
    for (var c2 = 0; c2 < N; c2++) {
      add(segs[c2], K.seg[c2]); add(shEls[c2], K.shT[c2]);
      add(faceF[c2], K.faceF[c2]); add(faceB[c2], K.faceB[c2]); add(svgs[c2], K.svg[c2]);
    }
    var master = anims[0];
    window.__introAnims = anims;
    window.__introSeek = function (sec) { anims.forEach(function (a) { a.pause(); a.currentTime = sec * 1000; }); };
    function go() {
      if (started || finished) return; started = true;
      anims.forEach(function (a) { a.currentTime = 0; a.play(); });
      master.onfinish = function () { reveal(false); };
      /* hand over slightly before the last frame so the cross-fade overlaps the end of the zoom */
      setTimeout(function () { if (!finished) reveal(false); }, (TT.zoom0 + TT.zoom + 0.05) * 1000);
    }
    window.__introGo = go;
    if (!/[?&]hold/.test(location.search)) {
      var imgs = ["assets/intro/hero.webp", "assets/portrait/final.webp"].map(function (u2) {
        var im = new Image(); im.src = u2; return im.decode ? im.decode().catch(function () {}) : Promise.resolve();
      });
      Promise.all(imgs).then(go);
      setTimeout(go, 1200);
    }
    watchdog = setTimeout(function () { if (!finished && !/[?&]hold/.test(location.search)) skip(); }, (TT.end + 6) * 1000);
  } catch (err) {
    if (window.console) console.warn("[intro] skipped:", err && err.message);
    finished = true;
    cleanup();
    if (window.__runHero) window.__runHero();
  }
})();
