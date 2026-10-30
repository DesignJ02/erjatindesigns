/* 404 drawing: a thick arch and two eyes built from real bezier points, with their handles shown. Nothing moves on its
   own: the visitor grabs a point (mouse, finger, or arrow keys on a focused point) and reshapes the drawing. A little
   after they let go, it eases back to its resting shape. */
(function () {
  "use strict";
  var svg = document.getElementById("nf-art");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- the shape at rest ---- */
  var A = { OL: [248, 353], OT: [449, 150], OR: [650, 353], IR: [600, 353], IT: [449, 200], IL: [298, 353] };
  var REST = {
    olo: [248, 243], otl: [338, 150], otr: [561, 150], oro: [650, 240],
    ilo: [298, 268], itl: [366, 200], itr: [533, 200], iro: [600, 268],
    leye: [40, 40], reye: [40, 40]
  };
  var EYE = { leye: [396, 305], reye: [503, 305] };
  var HANDLES = [["OL", "olo"], ["OT", "otl"], ["OT", "otr"], ["OR", "oro"], ["IL", "ilo"], ["IT", "itl"], ["IT", "itr"], ["IR", "iro"]];
  var KAPPA = 0.5523, BOUNDS = [96, 56, 804, 404], IDLE = 5000, BACK = 1300;
  var LABEL = { olo: "outer left handle", otl: "outer top-left handle", otr: "outer top-right handle", oro: "outer right handle", ilo: "inner left handle", itl: "inner top-left handle", itr: "inner top-right handle", iro: "inner right handle" };

  /* ---- build the pieces once ---- */
  var band = document.getElementById("band"), eyeP = { leye: document.getElementById("eye-l"), reye: document.getElementById("eye-r") };
  var gHandles = document.getElementById("handles"), gNodes = document.getElementById("nodes"), gHits = document.getElementById("hits");
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
  var lines = HANDLES.map(function () { return mk("line", {}, gHandles); });
  var dots = {}, hits = {};
  Object.keys(A).forEach(function (k) { dots[k] = mk("circle", { r: 3 }, gNodes); });
  HANDLES.forEach(function (h) { dots[h[1]] = mk("circle", { r: 3 }, gNodes); });
  var SIDES = ["n", "e", "s", "w"];
  var eyeDots = {};
  ["leye", "reye"].forEach(function (k) { eyeDots[k] = SIDES.map(function () { return mk("circle", { r: 3 }, gNodes); }); });

  /* one big invisible target on top of every point you can move, so it is easy to grab with a finger too */
  function target(id, dot, label, cls) {
    var h = mk("circle", { r: 15, "class": "hit " + (cls || ""), tabindex: 0, role: "slider", "aria-label": label + ", drag or use the arrow keys", "aria-valuetext": "movable point" }, gHits);
    h.dataset.id = id;
    hits[id] = { el: h, dot: dot };
  }
  HANDLES.forEach(function (h) { target(h[1], dots[h[1]], LABEL[h[1]]); });
  ["leye", "reye"].forEach(function (k) {
    var side = k === "leye" ? "left eye" : "right eye";
    SIDES.forEach(function (s, i) { target(k + ":" + s, eyeDots[k][i], side + " " + (s === "n" ? "top" : s === "s" ? "bottom" : s === "e" ? "right" : "left") + " point", s === "n" || s === "s" ? "v" : "h"); });
  });

  var n1 = function (n) { return Math.round(n * 10) / 10; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };
  var ease = function (u) { u = clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  var P = function (p) { return n1(p[0]) + " " + n1(p[1]); };
  function eyePath(c, r) {
    var x = c[0], y = c[1], rx = r[0], ry = r[1], kx = KAPPA * rx, ky = KAPPA * ry;
    return "M" + n1(x) + " " + n1(y - ry) +
      " C" + n1(x + kx) + " " + n1(y - ry) + " " + n1(x + rx) + " " + n1(y - ky) + " " + n1(x + rx) + " " + n1(y) +
      " C" + n1(x + rx) + " " + n1(y + ky) + " " + n1(x + kx) + " " + n1(y + ry) + " " + n1(x) + " " + n1(y + ry) +
      " C" + n1(x - kx) + " " + n1(y + ry) + " " + n1(x - rx) + " " + n1(y + ky) + " " + n1(x - rx) + " " + n1(y) +
      " C" + n1(x - rx) + " " + n1(y - ky) + " " + n1(x - kx) + " " + n1(y - ry) + " " + n1(x) + " " + n1(y - ry) + "Z";
  }

  /* ---- current state, and drawing it ---- */
  var S = {};
  Object.keys(REST).forEach(function (k) { S[k] = REST[k].slice(); });
  function place(id, p) {
    var h = hits[id]; if (!h) return;
    h.el.setAttribute("cx", n1(p[0])); h.el.setAttribute("cy", n1(p[1]));
    h.dot.setAttribute("cx", n1(p[0])); h.dot.setAttribute("cy", n1(p[1]));
  }
  function draw() {
    band.setAttribute("d", "M" + P(A.OL) + " C" + P(S.olo) + " " + P(S.otl) + " " + P(A.OT) + " C" + P(S.otr) + " " + P(S.oro) + " " + P(A.OR) +
      " L" + P(A.IR) + " C" + P(S.iro) + " " + P(S.itr) + " " + P(A.IT) + " C" + P(S.itl) + " " + P(S.ilo) + " " + P(A.IL) + "Z");
    HANDLES.forEach(function (h, i) {
      var a = A[h[0]], b = S[h[1]], l = lines[i];
      l.setAttribute("x1", a[0]); l.setAttribute("y1", a[1]); l.setAttribute("x2", n1(b[0])); l.setAttribute("y2", n1(b[1]));
      place(h[1], b);
    });
    Object.keys(A).forEach(function (k) { dots[k].setAttribute("cx", A[k][0]); dots[k].setAttribute("cy", A[k][1]); });
    ["leye", "reye"].forEach(function (k) {
      var c = EYE[k], r = S[k];
      eyeP[k].setAttribute("d", eyePath(c, r));
      place(k + ":n", [c[0], c[1] - r[1]]); place(k + ":e", [c[0] + r[0], c[1]]);
      place(k + ":s", [c[0], c[1] + r[1]]); place(k + ":w", [c[0] - r[0], c[1]]);
    });
  }

  /* ---- grabbing ---- */
  var drag = null, idleT = 0, backRaf = 0;
  function toSvg(e) {
    var m = svg.getScreenCTM(); if (!m) return [0, 0];
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var q = pt.matrixTransform(m.inverse()); return [q.x, q.y];
  }
  function moveTo(id, q) {
    var parts = id.split(":");
    if (parts.length === 1) { S[id] = [clamp(q[0], BOUNDS[0], BOUNDS[2]), clamp(q[1], BOUNDS[1], BOUNDS[3])]; return; }
    var k = parts[0], s = parts[1], c = EYE[k];
    if (s === "n" || s === "s") S[k] = [S[k][0], clamp(Math.abs(q[1] - c[1]), 7, 92)];
    else S[k] = [clamp(Math.abs(q[0] - c[0]), 7, 66), S[k][1]];
  }
  function touched() {
    cancelAnimationFrame(backRaf); backRaf = 0;
    clearTimeout(idleT);
    idleT = setTimeout(settle, IDLE);
  }
  function settle() {
    if (drag) { idleT = setTimeout(settle, 800); return; }
    var from = {}, t0 = performance.now();
    Object.keys(S).forEach(function (k) { from[k] = S[k].slice(); });
    if (reduce) { Object.keys(REST).forEach(function (k) { S[k] = REST[k].slice(); }); draw(); return; }
    function step(now) {
      var u = ease((now - t0) / BACK);
      Object.keys(S).forEach(function (k) { S[k] = lerp(from[k], REST[k], u); });
      draw();
      backRaf = u < 1 ? requestAnimationFrame(step) : 0;
    }
    backRaf = requestAnimationFrame(step);
  }
  gHits.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".hit"); if (!el) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer: carry on without capture */ }
    drag = { id: el.dataset.id, el: el, pid: e.pointerId };
    document.body.classList.add("nf-grabbing");
    hits[drag.id].dot.classList.add("hot");
    touched();
  });
  gHits.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    moveTo(drag.id, toSvg(e)); draw(); touched();
  });
  function release(e) {
    if (!drag || (e && e.pointerId !== drag.pid)) return;
    hits[drag.id].dot.classList.remove("hot");
    drag = null;
    document.body.classList.remove("nf-grabbing");
    touched();
  }
  gHits.addEventListener("pointerup", release);
  gHits.addEventListener("pointercancel", release);
  gHits.addEventListener("lostpointercapture", release);
  Object.keys(hits).forEach(function (id) {
    var h = hits[id];
    h.el.addEventListener("pointerenter", function () { h.dot.classList.add("hot"); });
    h.el.addEventListener("pointerleave", function () { if (!drag || drag.id !== id) h.dot.classList.remove("hot"); });
    h.el.addEventListener("focus", function () { h.dot.classList.add("hot"); });
    h.el.addEventListener("blur", function () { h.dot.classList.remove("hot"); });
    h.el.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
      if (e.key === "Escape") { e.preventDefault(); settle(); return; }
      if (!d) return;
      e.preventDefault();
      var cur = id.indexOf(":") < 0 ? S[id] : null, parts = id.split(":");
      if (cur) moveTo(id, [cur[0] + d[0], cur[1] + d[1]]);
      else {
        var k = parts[0], s = parts[1], c = EYE[k];
        var px = s === "e" ? c[0] + S[k][0] : s === "w" ? c[0] - S[k][0] : c[0], py = s === "s" ? c[1] + S[k][1] : s === "n" ? c[1] - S[k][1] : c[1];
        moveTo(id, [px + d[0], py + d[1]]);
      }
      draw(); touched();
    });
  });
  svg.addEventListener("dblclick", function (e) { if (!e.target.closest(".hit")) settle(); });

  /* offline: the same drawing says so, and the page comes back by itself when the connection does */
  if (navigator.onLine === false) {
    var t = document.querySelector(".nf-title"), c = document.querySelector(".nf-copy");
    if (t) t.textContent = "No Internet Connection";
    if (c) c.textContent = "Check your connection, then give it another go.";
    document.title = "No internet connection | Jatin Srivastava";
    window.addEventListener("online", function () { location.reload(); });
  }

  draw();
})();
