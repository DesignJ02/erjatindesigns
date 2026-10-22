/* Paper-unfolding intro.
   A gate-fold of three equal panels lies on a green drafting mat. The designer panel stays put; the engineering
   drawing and the homepage are two doors folded over it. They swing open one after the other (two openings),
   then the camera pushes into the homepage print until it is the real page.
   The motion is computed once and played by the compositor (Web Animations), so page work cannot stutter it. */
(function () {
  "use strict";
  var html = document.documentElement;
  var root = document.getElementById("intro");
  if (!root) return;
  if (!html.classList.contains("intro-pending")) { root.parentNode && root.parentNode.removeChild(root); return; }

  var finished = false, watchdog = null, started = false, anims = [];

  /* Paper sound, made with the Web Audio API. Browsers block sound until the visitor has interacted with the page,
     so it tries to play on its own and, if the browser says no, offers a small "Sound on" button instead. */
  var snd = (function () {
    var ctx = null, master = null, buf = null, events = null, clock = null, btn = null, off = false;
    function noise() {
      if (buf) return buf;
      var n = Math.floor(ctx.sampleRate * 1.5), d;
      buf = ctx.createBuffer(1, n, ctx.sampleRate); d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    }
    function src(when, dur) { var s2 = ctx.createBufferSource(); s2.buffer = noise(); s2.loop = true; s2.start(when, Math.random()); s2.stop(when + dur + 0.05); return s2; }
    /* a crinkling slide of paper: band-passed noise whose level flutters, with the odd tiny crackle */
    function rustle(when, dur, vol, phase0) {
      var s2 = src(when, dur), bp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = "bandpass"; bp.Q.value = 0.7; hp.type = "highpass"; hp.frequency.value = 700;
      bp.frequency.setValueAtTime(1500, when); bp.frequency.linearRampToValueAtTime(3400, when + dur);
      g.gain.value = 0;
      s2.connect(bp); bp.connect(hp); hp.connect(g); g.connect(master);
      for (var k = 0; k < dur; k += 0.03 + Math.random() * 0.05) {
        var p = Math.min(1, (k + phase0) / (dur + phase0)), env = Math.pow(Math.sin(Math.PI * p), 0.8);
        g.gain.setTargetAtTime(vol * env * (0.2 + Math.random() * 0.8), when + k, 0.012);
        if (Math.random() < 0.3) click(when + k, vol * env);
      }
    }
    function click(when, vol) {
      var c = src(when, 0.02), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      hp.type = "highpass"; hp.frequency.value = 2800;
      g.gain.setValueAtTime(vol * 0.9, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.012);
      c.connect(hp); hp.connect(g); g.connect(master);
    }
    /* a flap of paper settling flat: a short soft thump */
    function pat(when, vol) {
      var n = src(when, 0.12), lp = ctx.createBiquadFilter(), g = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain();
      lp.type = "lowpass"; lp.frequency.value = 600;
      g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.1);
      n.connect(lp); lp.connect(g); g.connect(master);
      o.frequency.setValueAtTime(95, when); o.frequency.exponentialRampToValueAtTime(48, when + 0.14);
      og.gain.setValueAtTime(vol * 0.7, when); og.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
      o.connect(og); og.connect(master); o.start(when); o.stop(when + 0.2);
    }
    function whoosh(when, dur, vol, phase0) {
      var s2 = src(when, dur), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = "bandpass"; bp.Q.value = 0.5;
      bp.frequency.setValueAtTime(450, when); bp.frequency.exponentialRampToValueAtTime(2200, when + dur);
      var peak = when + Math.max(0.05, dur * 0.55 - phase0);
      g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(vol, peak); g.gain.linearRampToValueAtTime(0.0001, when + dur);
      s2.connect(bp); bp.connect(g); g.connect(master);
    }
    /* schedule whatever is still to come, measured from where the animation is right now */
    function schedule() {
      var now = ctx.currentTime + 0.03, ct = clock ? clock() : 0;
      events.forEach(function (e) {
        var end = e.t + (e.d || 0);
        if (end < ct) return;
        var when = now + Math.max(0, e.t - ct), phase = Math.max(0, ct - e.t), dur = (e.d || 0) - phase;
        if (e.k === "rustle" && dur > 0.05) rustle(when, dur, e.v, phase);
        else if (e.k === "whoosh" && dur > 0.05) whoosh(when, dur, e.v, phase);
        else if (e.k === "pat" && e.t >= ct) pat(when, e.v);
      });
    }
    function start() {
      if (off || !ctx) return;
      master = master || (function () { var m = ctx.createGain(); m.gain.value = 0.5; m.connect(ctx.destination); return m; })();
      schedule(); hideBtn();
    }
    function hideBtn() { if (btn && btn.parentNode) btn.parentNode.removeChild(btn); btn = null; }
    function offer(root) {
      if (btn || off) return;
      btn = document.createElement("button");
      btn.type = "button"; btn.className = "pi-snd"; btn.textContent = "Sound on"; btn.setAttribute("aria-label", "Play the paper sound");
      btn.addEventListener("click", function () { if (ctx) ctx.resume().then(start, hideBtn); });
      root.appendChild(btn);
    }
    return {
      arm: function (evs, getClock, root) {
        events = evs; clock = getClock;
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          ctx = new AC();
          if (ctx.state === "running") start(); else offer(root);
        } catch (e) { ctx = null; }
      },
      stop: function () {
        off = true; hideBtn();
        try { if (master && ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.05); setTimeout(function () { try { ctx.close(); } catch (e) {} }, 400); } else if (ctx) ctx.close(); } catch (e) {}
      }
    };
  })();
  var DESK_SND = [{ k: "rustle", t: 0.95, d: 1.5, v: 0.5 }, { k: "pat", t: 2.45, v: 0.5 }, { k: "rustle", t: 2.9, d: 1.5, v: 0.5 }, { k: "pat", t: 4.4, v: 0.55 }, { k: "whoosh", t: 4.9, d: 1.4, v: 0.16 }];
  var MOB_SND = [{ k: "rustle", t: 0.8, d: 1.05, v: 0.5 }, { k: "pat", t: 1.85, v: 0.5 }, { k: "rustle", t: 1.95, d: 1.15, v: 0.5 }, { k: "pat", t: 3.1, v: 0.55 }, { k: "whoosh", t: 3.0, d: 0.7, v: 0.14 }];
  var sndClock = function () { return anims[0] ? anims[0].currentTime / 1000 : 0; };

  function seen() { try { sessionStorage.setItem("introSeen", "1"); } catch (e) {} }
  function cleanup() {
    html.classList.remove("intro-pending", "intro-lock");
    if (root && root.parentNode) root.parentNode.removeChild(root);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKey);
    clearTimeout(watchdog);
  }
  function reveal(fast) {
    if (finished) return; finished = true; seen(); snd.stop();
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

    /* ---------- phones: one sheet, two folds opening downward, then the page. Same compositor-driven approach. ---------- */
    if (vw <= 760) {
      var MW = Math.min(vw * 0.82, 340), MH = MW * 1.34, S3 = MH / 3;
      var INKC = "#2b2a28", REDC = "#c81e48", YELC = "#f9bf3c";
      var mart = function (x, y, s, txt, extra) { return '<text x="' + x + '" y="' + y + '" font-size="' + s + '" font-family="DM Mono, monospace" letter-spacing=".08em" fill="' + INKC + '" ' + (extra || "") + '>' + txt + '</text>'; };
      var artSvg =
        '<rect x="6" y="6" width="288" height="390" fill="none" stroke="' + INKC + '" stroke-opacity=".5" stroke-width="1"/>' +
        '<path d="M6 40h8M286 40h8M6 362h8M286 362h8M60 6v8M240 6v8M60 388v8M240 388v8" stroke="' + INKC + '" stroke-opacity=".5"/>' +
        mart(150, 34, 9, "DETAIL B · DESIGNER", 'text-anchor="middle"') +
        '<circle cx="150" cy="128" r="78" fill="none" stroke="' + INKC + '" stroke-opacity=".55" stroke-dasharray="3 3"/>' +
        '<path d="M58 128H242M150 36V220" stroke="' + REDC + '" stroke-opacity=".7" stroke-dasharray="9 3 2 3"/>' +
        '<circle cx="150" cy="128" r="62" fill="' + YELC + '"/>' +
        '<defs><clipPath id="pmc"><circle cx="150" cy="128" r="62"/></clipPath></defs>' +
        '<image href="assets/portrait/final.webp" x="75" y="53" width="150" height="150" clip-path="url(#pmc)" preserveAspectRatio="xMidYMid slice"/>' +
        '<path d="M82 226H218M82 220v12M218 220v12" stroke="' + INKC + '" stroke-width="1"/>' + mart(150, 246, 10, "&#216;336", 'text-anchor="middle"') +
        mart(150, 268, 9.5, "REV A → REV B", 'text-anchor="middle" fill="' + REDC + '" style="fill:' + REDC + '"') + '<path d="M96 276H204" stroke="' + REDC + '"/>' +
        '<rect x="22" y="292" width="256" height="88" fill="none" stroke="' + INKC + '"/><path d="M22 328H278M22 354H278M178 354V380" stroke="' + INKC + '" stroke-opacity=".7"/>' +
        '<text x="34" y="319" font-size="19" font-weight="700" font-family="General Sans, sans-serif" fill="' + INKC + '">JATIN SRIVASTAVA</text>' +
        mart(34, 345, 7.6, "MECHANICAL ENGINEER → PRODUCT DESIGNER") +
        mart(34, 371, 8, "REV A · ENGINEER") + mart(188, 371, 8, "REV B · DESIGNER", 'style="fill:' + REDC + '"');
      var face = function (i) {
        return '<div class="pm-face f"><svg viewBox="0 0 300 402" style="position:absolute;left:0;top:' + (-i * S3).toFixed(2) + 'px;width:' + MW.toFixed(2) + 'px;height:' + MH.toFixed(2) + 'px" aria-hidden="true">' + artSvg + '</svg><i class="pm-sh"></i></div><div class="pm-face b"><i class="pm-sh"></i></div>';
      };
      root.innerHTML =
        '<div class="pm-stage"><div class="pi-mat pm-mat"></div><div class="pm-world"><div class="pm-tilt"><div class="pm-sheet" style="width:' + MW.toFixed(2) + 'px;height:' + S3.toFixed(2) + 'px">' +
        '<div class="pm-s sa">' + face(0) +
        '<div class="pm-s sb" style="height:' + S3.toFixed(2) + 'px">' + face(1) +
        '<div class="pm-s sc" style="height:' + S3.toFixed(2) + 'px">' + face(2) + '</div></div></div></div></div></div></div><div class="pi-vig"></div>' +
        '<button type="button" class="pi-skip" aria-label="Skip intro animation">Skip intro</button>';
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-label", "Intro animation");
      var mskip = root.querySelector(".pi-skip");
      mskip.addEventListener("click", skip);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
      var mswallow = function (e) { e.preventDefault(); e.stopPropagation(); };
      root.addEventListener("wheel", mswallow, { passive: false });
      root.addEventListener("touchmove", mswallow, { passive: false });
      html.classList.add("intro-lock");
      try { mskip.focus({ preventScroll: true }); } catch (e) {}

      var mc = function (v, a, b) { return v < a ? a : v > b ? b : v; };
      var mss = function (v) { v = mc(v, 0, 1); return v * v * v * (v * (v * 6 - 15) + 10); };
      var msine = function (v) { return 0.5 - 0.5 * Math.cos(Math.PI * mc(v, 0, 1)); };
      var MT = { end: 3.7, c0: 0.8, cd: 1.05, b0: 1.95, bd: 1.15, handoff: 3.3 }, D2R = Math.PI / 180, NFm = Math.ceil(MT.end * 60) + 1;
      var sheet = root.querySelector(".pm-sheet"), tiltEl = root.querySelector(".pm-tilt"), sa = root.querySelector(".sa"), sb = root.querySelector(".sb"), sc = root.querySelector(".sc"), world = root.querySelector(".pm-world");
      sheet.style.marginLeft = (-MW / 2).toFixed(2) + "px";
      var KK = { world: [], tilt: [], sheet: [], b: [], c: [], bF: [], bB: [], cF: [], cB: [], bS: [], cS: [], mat: [] };
      for (var m1 = 0; m1 < NFm; m1++) {
        var t = m1 / 60, tC = mss((t - MT.c0) / MT.cd), tB = mss((t - MT.b0) / MT.bd);
        var th2 = -180 * (1 - tC), th1 = 180 * (1 - tB), abs2 = th1 + th2;
        var cen = S3 * (0.5 - 0.5 * tC + 1.5 * tB);
        var ee = msine((t - MT.c0) / (MT.b0 + MT.bd - MT.c0));
        var land = mss((t - 3.0) / 0.7);
        KK.world.push({ transform: "scale(" + (0.94 + 0.06 * msine(t / 0.7) + 0.5 * land).toFixed(4) + ")", opacity: mc(t / 0.5, 0, 1).toFixed(3) });
        KK.tilt.push({ transform: "rotateX(" + (16 * (1 - ee)).toFixed(3) + "deg)" });
        KK.sheet.push({ transform: "translateY(" + (-cen).toFixed(2) + "px)" });
        KK.b.push({ transform: "translateZ(" + (0.7 * th1 / 180).toFixed(2) + "px) rotateX(" + th1.toFixed(3) + "deg)" });
        KK.c.push({ transform: "translateZ(" + (0.7 * Math.abs(th2) / 180).toFixed(2) + "px) rotateX(" + th2.toFixed(3) + "deg)" });
        var bf = Math.cos(th1 * D2R) >= 0, cf = Math.cos(abs2 * D2R) >= 0;
        KK.bF.push({ opacity: bf ? "1" : "0" }); KK.bB.push({ opacity: bf ? "0" : "1" });
        KK.cF.push({ opacity: cf ? "1" : "0" }); KK.cB.push({ opacity: cf ? "0" : "1" });
        KK.bS.push({ opacity: (0.2 * Math.abs(Math.sin(th1 * D2R))).toFixed(3) });
        KK.cS.push({ opacity: (0.2 * Math.abs(Math.sin(th2 * D2R))).toFixed(3) });
        KK.mat.push({ transform: "scale(" + (1.12 - 0.06 * ee).toFixed(4) + ")" });
      }
      var mopts = { duration: MT.end * 1000, easing: "linear", fill: "both" };
      function madd(el, fr) { if (!el) return; var a = el.animate(fr, mopts); a.pause(); anims.push(a); }
      madd(world, KK.world); madd(tiltEl, KK.tilt); madd(sheet, KK.sheet); madd(sb, KK.b); madd(sc, KK.c);
      madd(sb.querySelector(":scope > .pm-face.f"), KK.bF); madd(sb.querySelector(":scope > .pm-face.b"), KK.bB);
      madd(sc.querySelector(":scope > .pm-face.f"), KK.cF); madd(sc.querySelector(":scope > .pm-face.b"), KK.cB);
      madd(sb.querySelector(":scope > .pm-face.f .pm-sh"), KK.bS); madd(sc.querySelector(":scope > .pm-face.f .pm-sh"), KK.cS);
      madd(root.querySelector(".pm-mat"), KK.mat);
      window.__introAnims = anims;
      window.__introSeek = function (sec) { anims.forEach(function (a) { a.pause(); a.currentTime = sec * 1000; }); };
      var mgo = function () {
        if (started || finished) return; started = true;
        anims.forEach(function (a) { a.currentTime = 0; a.play(); });
        snd.arm(MOB_SND, sndClock, root);
        setTimeout(function () { if (!finished) reveal(false); }, MT.handoff * 1000);
      };
      window.__introGo = mgo;
      if (!/[?&]hold/.test(location.search)) {
        var pim = new Image(); pim.src = "assets/portrait/final.webp";
        (pim.decode ? pim.decode().catch(function () {}) : Promise.resolve()).then(mgo);
        setTimeout(mgo, 1000);
      }
      watchdog = setTimeout(function () { if (!finished && !/[?&]hold/.test(location.search)) skip(); }, (MT.end + 6) * 1000);
      return;
    }


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
      s += '<image href="assets/intro/hero.webp?v=3" x="' + HERO.x + '" y="' + HERO.y + '" width="' + HERO.w + '" height="' + HERO.h.toFixed(1) + '" preserveAspectRatio="none"/>';
      s += R(HERO.x, HERO.y, HERO.w, HERO.h.toFixed(1), "thin");
      s += T(60, HERO.y + HERO.h + 70, "PRODUCT DESIGN · USER-CENTRED", "mono", 24);
      s += T(60, HERO.y + HERO.h + 112, "ENGINEER BY TRAINING · DESIGNER BY CHOICE", "mono", 24);
      s += T(940, PH - 60, "js.", "", 64, 'text-anchor="end" font-weight="700"');
      return s;
    }
    var PANELS = [panelEngineer(), panelDesigner(), panelHome()];    // left -> right: drawing first, homepage last

    /* ---------- DOM: a gate-fold. The designer panel stays put; the drawing and the homepage are two equal
       doors that lie folded over it and swing open one after the other. ---------- */
    function panelHTML(cls, left, art, origin) {
      return '<div class="pn ' + cls + '" style="left:' + left.toFixed(2) + 'px;top:' + (-Hp / 2).toFixed(2) + 'px;width:' + P.toFixed(2) + 'px;height:' + Hp.toFixed(2) + 'px;transform-origin:' + origin + '">' +
        '<div class="face front"><svg viewBox="0 0 ' + PU + ' ' + PH.toFixed(1) + '" preserveAspectRatio="none" aria-hidden="true">' + art + '</svg><i class="sh"></i></div>' +
        '<div class="face back"><i class="sh"></i></div></div>';
    }
    var shadows = "", q;
    for (q = 0; q < 3; q++) shadows += '<div class="pi-shadow" style="width:' + P.toFixed(2) + 'px;height:' + Hp.toFixed(1) + 'px"></div>';
    root.innerHTML =
      '<div class="pi-world"><div class="pi-cam"><div class="pi-tilt">' +
      '<div class="pi-mat"></div>' + shadows +
      panelHTML("c", -P / 2, PANELS[1], "50% 50%") +
      panelHTML("r", P / 2, PANELS[2], "0 50%") +
      panelHTML("l", -1.5 * P, PANELS[0], "100% 50%") +
      '</div></div></div><div class="pi-vig"></div>' +
      '<button type="button" class="pi-skip" aria-label="Skip intro animation">Skip intro</button>';
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Intro animation");

    var world = root.querySelector(".pi-world");
    var tilt = root.querySelector(".pi-tilt");
    var pnC = root.querySelector(".pn.c"), pnL = root.querySelector(".pn.l"), pnR = root.querySelector(".pn.r");
    var pns = [pnL, pnC, pnR];                              /* left door, centre, right door */
    var shEls = Array.prototype.slice.call(root.querySelectorAll(".pi-shadow"));
    var svgs = pns.map(function (p) { return p.querySelector(".face.front svg"); });
    var faceF = pns.map(function (p) { return p.querySelector(".face.front .sh"); });
    var faceB = pns.map(function (p) { return p.querySelector(".face.back .sh"); });
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
    var TT = { l0: 0.95, ld: 1.5, r0: 2.9, rd: 1.5, ink0: 0.5, ink: 1.6, zoom0: 4.9, zoom: 1.5, end: 6.6, fps: 60 };
    var LX = -0.38, LZ = 0.925;                          // key light
    var D = Math.PI / 180;

    var cw = root.clientWidth || vw, ch = root.clientHeight || vh, u = P / PU;
    var camX = cw / 2 + P / 2 + HERO.x * u, camY = ch / 2 - Hp / 2 + HERO.y * u;      /* top-left of the homepage print, sheet flat */
    var camS = cw / (HERO.w * u);
    world.style.transformOrigin = camX.toFixed(1) + "px " + camY.toFixed(1) + "px";

    var NF = Math.ceil(TT.end * TT.fps) + 1, k2;
    /* camera: frame whatever is open at the moment, then low-pass it so the scale and the sideways drift stay silky */
    var rawS = [], rawC = [];
    for (k2 = 0; k2 < NF; k2++) {
      var tq = k2 / TT.fps;
      var cL = Math.cos(179.6 * (1 - ss((tq - TT.l0) / TT.ld)) * D), cR = Math.cos(179.6 * (1 - ss((tq - TT.r0) / TT.rd)) * D);
      var x0 = -P / 2 - P * Math.max(0, cL), x1 = P / 2 + P * Math.max(0, cR);
      rawS.push(clamp(0.9 * cw / (x1 - x0), 1, 1.3));
      rawC.push((x0 + x1) / 2);
    }
    function smoothArr(arr, secs, passes) {
      var win = Math.round(secs * TT.fps), pass, out, i, d, acc;
      for (pass = 0; pass < passes; pass++) {
        out = [];
        for (i = 0; i < arr.length; i++) { acc = 0; for (d = -win; d <= win; d++) acc += arr[clamp(i + d, 0, arr.length - 1)]; out.push(acc / (2 * win + 1)); }
        arr = out;
      }
      return arr;
    }
    var camScale = smoothArr(rawS, 0.35, 3), camPan = smoothArr(rawC, 0.35, 3);
    /* landing is measured against the final framing (scale sF, sheet centred) */
    var sF = camScale[NF - 1];
    camX = cw / 2 + sF * (P / 2 + HERO.x * u);
    camY = ch / 2 + sF * (-Hp / 2 + HERO.y * u);
    camS = cw / (HERO.w * u * sF);
    world.style.transformOrigin = camX.toFixed(1) + "px " + camY.toFixed(1) + "px";
    var K = { tilt: [], world: [], root: [], mat: [], fFront: [[], [], []], fBack: [[], [], []], pn: [[], [], []], shT: [[], [], []], faceF: [[], [], []], faceB: [[], [], []], svg: [[], [], []] };
    for (k2 = 0; k2 < NF; k2++) {
      var t = k2 / TT.fps;
      var pL = ss((t - TT.l0) / TT.ld), pR = ss((t - TT.r0) / TT.rd);
      var openAll = ss((t - TT.l0) / (TT.r0 + TT.rd - TT.l0));
      var e = sine((t - TT.l0) / (TT.r0 + TT.rd - TT.l0));
      var inkV = sine((t - TT.ink0) / TT.ink).toFixed(3);
      var zz = cub((t - TT.zoom0) / TT.zoom);
      /* angle about each hinge: 180 deg = folded over the centre panel, 0 = lying flat beside it */
      var thL = 179.6 * (1 - pL) * D, thR = -179.6 * (1 - pR) * D;
      var ths = [thL, 0, thR];
      /* tiny lift so the stacked doors never z-fight: right door above the centre, left door above both */
      var zo = [2.4 * (1 - pL), 0, 1.2 * (1 - pR)];
      K.root.push({ opacity: clamp(t / 0.5, 0, 1).toFixed(3) });
      K.tilt.push({ transform: "scale(" + camScale[k2].toFixed(4) + ") translate3d(" + (-camPan[k2]).toFixed(2) + "px,0,0) rotateX(" + (26 * (1 - e)).toFixed(3) + "deg)" });
      K.mat.push({ transform: "scale(" + (1.1 + 0.08 * (1 - e)).toFixed(4) + ")" });
      K.world.push({ transform: "translate3d(" + (-camX * zz).toFixed(2) + "px," + (-camY * zz).toFixed(2) + "px,0) scale(" + (1 + (camS - 1) * zz).toFixed(4) + ")" });
      for (var c = 0; c < 3; c++) {
        var th = ths[c];
        K.pn[c].push({ transform: "translateZ(" + zo[c].toFixed(2) + "px) rotateY(" + (th / D).toFixed(3) + "deg)" });
        var n0 = Math.sin(th), n1 = Math.cos(th);
        var lit = n0 * LX + n1 * LZ, front = n1 >= 0, litv = front ? lit : -lit;
        var al = clamp((0.92 - litv) * 0.4, 0, 0.17).toFixed(3);
        K.fFront[c].push({ opacity: front ? "1" : "0" });
        K.fBack[c].push({ opacity: front ? "0" : "1" });
        K.faceF[c].push({ opacity: front ? al : "0" });
        K.faceB[c].push({ opacity: front ? "0" : al });
        /* shadow on the mat: the footprint of the door, shrinking as it stands up, drifting with its height */
        var wFrac = Math.abs(Math.cos(th)), zmid = (c === 1) ? 0 : (P / 2) * Math.abs(Math.sin(th));
        var sx = Math.max(0.02, wFrac), left;
        if (c === 0) left = (-P / 2) - P * (th === 0 ? 1 : wFrac) + (th > Math.PI / 2 ? 0 : 0) - 0;
        else if (c === 2) left = P / 2;
        else left = -P / 2;
        if (c === 0) {                                   /* door spans from the hinge (-P/2) outward by P*cos(th) */
          var xEnd = -P / 2 - P * Math.cos(th);
          left = Math.min(-P / 2, xEnd);
        } else if (c === 2) {
          var xEnd2 = P / 2 + P * Math.cos(th);
          left = Math.min(P / 2, xEnd2);
        }
        K.shT[c].push({
          transform: "translate3d(" + (left + zmid * 0.35 + 1).toFixed(1) + "px," + (-Hp / 2 + zmid * 0.28 + 2).toFixed(1) + "px,-3px) scale3d(" + sx.toFixed(4) + ",1,1)",
          opacity: clamp(0.3 - zmid * 0.0009, 0.08, 0.3).toFixed(2)
        });
        K.svg[c].push({ opacity: inkV });
      }
    }
    /* the shadow box is P wide and scaled about its left edge, so for a leftward door the box must start at its left edge */
    var opts = { duration: TT.end * 1000, easing: "linear", fill: "both" };
    function add(el, frames) { if (!el) return; var a = el.animate(frames, opts); a.pause(); anims.push(a); }
    add(root, K.root); add(tilt, K.tilt); add(world, K.world); add(root.querySelector(".pi-mat"), K.mat);
    for (var c2 = 0; c2 < 3; c2++) {
      add(pns[c2], K.pn[c2]); add(shEls[c2], K.shT[c2]);
      add(faceF[c2], K.faceF[c2]); add(faceB[c2], K.faceB[c2]); add(svgs[c2], K.svg[c2]);
      add(pns[c2].querySelector('.face.front'), K.fFront[c2]); add(pns[c2].querySelector('.face.back'), K.fBack[c2]);
    }
    var master = anims[0];
    window.__introAnims = anims;
    window.__introSeek = function (sec) { anims.forEach(function (a) { a.pause(); a.currentTime = sec * 1000; }); };
    function go() {
      if (started || finished) return; started = true;
      anims.forEach(function (a) { a.currentTime = 0; a.play(); });
      master.onfinish = function () { reveal(false); };
      snd.arm(DESK_SND, sndClock, root);
      /* hand over slightly before the last frame so the cross-fade overlaps the end of the zoom */
      setTimeout(function () { if (!finished) reveal(false); }, (TT.zoom0 + TT.zoom + 0.05) * 1000);
    }
    window.__introGo = go;
    if (!/[?&]hold/.test(location.search)) {
      var imgs = ["assets/intro/hero.webp?v=3", "assets/portrait/final.webp"].map(function (u2) {
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
