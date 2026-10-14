// Hero monogram: layer toggles, sketch -> final reveal, exploded view, dimension highlight, reset.
(function () {
  "use strict";
  var fig = document.getElementById("mono");
  if (!fig) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || fig).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || fig).querySelectorAll(s)); };

  var hidden = {};              // { construct: true, dim: true, final: true }
  var stage = "final";          // "sketch" | "final"
  var exploded = false;         // pinned by click / button / Enter
  var dimPinned = false;
  var timers = [];
  var touched = false;          // once the visitor interacts, the intro sequence must not override their choices
  var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
  var clearTimers = function () { timers.forEach(clearTimeout); timers = []; };

  var final = $("#mono-final");
  var dim = $(".dim-hit");
  var stageLabel = $("[data-stage-label]");

  function render() {
    fig.setAttribute("data-hide", Object.keys(hidden).filter(function (k) { return hidden[k]; }).join(" "));
    fig.setAttribute("data-stage", stage);
    fig.classList.toggle("is-exploded", exploded);
    final.setAttribute("aria-pressed", String(exploded));
    dim.setAttribute("aria-pressed", String(dimPinned));
    $$("[data-act=layer]").forEach(function (b) { b.setAttribute("aria-pressed", String(!hidden[b.dataset.layer])); });
    var st = $("[data-act=stage]");
    st.setAttribute("aria-pressed", String(stage === "final"));
    stageLabel.textContent = stage === "final" ? "Final" : "Sketch";
    $("[data-act=explode]").setAttribute("aria-pressed", String(exploded));
  }

  // --- diameter label: count up when the dimension is highlighted ---
  var numEls = $$("[data-measure^='d:'], [data-measure^='w:']", dim.parentNode);
  function countUp() {
    numEls.forEach(function (el) {
      var txt = el.textContent, m = txt.match(/(\d+)/);
      if (!m) return;
      var to = parseInt(m[1], 10), pre = txt.slice(0, m.index), t0 = null, done = false;
      var finish = function () { done = true; el.textContent = pre + to; };
      if (reduce) return;
      setTimeout(finish, 420);                 // always land on the true value, even if frames are throttled
      (function step(t) {
        if (done) return;
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 320), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(to * e);
        if (k < 1) requestAnimationFrame(step); else finish();
      })(performance.now());
    });
  }
  function setDim(on) {
    if (fig.classList.contains("dim-on") === on) return;
    fig.classList.toggle("dim-on", on);
    if (on) countUp();
  }

  // --- build sequence: construction geometry first, then the finished mark ---
  function play(from) {
    clearTimers();
    if (reduce) { stage = "final"; render(); return; }
    stage = "sketch";
    fig.setAttribute("data-stage", "pre");
    void fig.getBoundingClientRect();       // restart transitions
    later(function () { render(); }, 40);     // sketch: lines grow, outline appears
    later(function () { stage = "final"; render(); }, 1100);
  }

  // --- controls ---
  fig.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    touched = true;
    var act = b.dataset.act;
    if (act === "layer") {
      hidden[b.dataset.layer] = !hidden[b.dataset.layer];
      render();
    } else if (act === "stage") {
      clearTimers();
      stage = stage === "final" ? "sketch" : "final";
      render();
    } else if (act === "explode") {
      exploded = !exploded; render();
    } else if (act === "reset") {
      hidden = {}; exploded = false; dimPinned = false; setDim(false);
      render();
      play();
    }
  });

  // monogram: click / Enter / Space pins the exploded view (hover is handled by CSS on fine pointers)
  function toggleExplode() { touched = true; exploded = !exploded; render(); }
  final.addEventListener("click", toggleExplode);
  final.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExplode(); }
  });

  // dimension: hover / focus highlight, click or Enter pins it (works on touch)
  dim.addEventListener("mouseenter", function () { setDim(true); });
  dim.addEventListener("mouseleave", function () { if (!dimPinned) setDim(false); });
  dim.addEventListener("focus", function () { setDim(true); });
  dim.addEventListener("blur", function () { if (!dimPinned) setDim(false); });
  function togglePin() { touched = true; dimPinned = !dimPinned; setDim(dimPinned || true); if (!dimPinned) setDim(false); render(); }
  dim.addEventListener("click", togglePin);
  dim.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePin(); }
  });

  // --- first reveal when scrolled into view ---
  render();
  if ("IntersectionObserver" in window && !reduce) {
    fig.setAttribute("data-stage", "pre");
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); if (!touched) play(); else { stage = stage; render(); } }
    }, { threshold: 0.4 });
    io.observe(fig);
    // safety net: never leave the monogram hidden
    setTimeout(function () { if (fig.getAttribute("data-stage") === "pre") { if (touched) render(); else play(); } }, 4000);
  }
})();
