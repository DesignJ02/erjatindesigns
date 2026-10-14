// Exploded-view portrait: hover (mouse), tap (touch/pen) or Enter/Space (keyboard) opens the layers.
(function () {
  "use strict";
  var xp = document.getElementById("xp");
  if (!xp) return;
  var stage = xp.querySelector(".xp-stage");
  var hit = xp.querySelector(".xp-hit");
  var open = false;
  var lastType = "mouse";

  function set(v) {
    if (open === v) return;
    open = v;
    xp.classList.toggle("is-open", open);
    stage.setAttribute("aria-pressed", String(open));
  }

  // remember how the visitor is pointing, so a mouse click doesn't fight the hover state
  window.addEventListener("pointerdown", function (e) { lastType = e.pointerType || "mouse"; }, true);

  // mouse: opens when the pointer reaches the portrait, closes when it leaves the whole drawing
  hit.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") set(true); });
  xp.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") set(false); });

  // touch / pen / keyboard-activated click: toggle
  stage.addEventListener("click", function () {
    if (lastType === "mouse" && !stage.matches(":focus-visible")) return;
    set(!open);
  });
  stage.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lastType = "key"; set(!open); }
    else if (e.key === "Escape") { set(false); }
  });

  // tapping elsewhere closes it on touch devices
  document.addEventListener("pointerdown", function (e) {
    if (open && e.pointerType !== "mouse" && !xp.contains(e.target)) set(false);
  });
})();
