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
