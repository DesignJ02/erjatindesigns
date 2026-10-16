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
  var ease = function (t) { return t * t * (3 - 2 * t); };
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    folds.forEach(function (f) {
      var top = f.act.getBoundingClientRect().top;
      var p = (vh * 0.9 - top) / (vh * 0.5);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      p = Math.round(ease(p) * 500) / 500;
      if (p === f.last) return;
      f.last = p;
      if (p >= 1) { f.fold.style.transform = ""; f.fold.style.willChange = ""; f.fold.style.setProperty("--fp", 0); f.fold.classList.remove("folding"); return; }
      f.fold.classList.add("folding");
      f.fold.style.willChange = "transform";
      f.fold.style.transform = "perspective(2400px) rotateX(" + (80 * (1 - p)).toFixed(2) + "deg)";
      f.fold.style.setProperty("--fp", (1 - p).toFixed(3));
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  update();
})();
