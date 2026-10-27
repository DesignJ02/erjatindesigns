/* Crosshair pointer on every page (mouse only). The native pointer is hidden only after the crosshair has started tracking,
   and it comes back whenever the crosshair can't be shown, so the pointer is never lost. */
(function () {
  "use strict";
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var html = document.documentElement;
  var cur = document.querySelector(".cursor");
  if (!cur) {
    cur = document.createElement("div");
    cur.className = "cursor";
    cur.setAttribute("aria-hidden", "true");
    document.body.appendChild(cur);
  }
  if (!cur.querySelector("i")) cur.appendChild(document.createElement("i"));   /* the ring that opens over clickable things */
  var on = false;
  function move(e) {
    cur.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    cur.classList.remove("off");
    if (!on) { on = true; html.classList.add("xh"); }
  }
  window.addEventListener("mousemove", move, { passive: true });
  document.addEventListener("mouseleave", function () { cur.classList.add("off"); });
  document.addEventListener("mouseenter", function () { cur.classList.remove("off"); });
  document.addEventListener("mouseover", function (e) {
    var t = e.target.closest && e.target.closest("a, button, [role='button'], summary, label, .work-row, .dr-row, .chip, .bl-tile, .lap-play, [class*='card'], .lx-opt, .lx-dc, .lx-js, .dt-q, .cx-cmp");
    cur.classList.toggle("link", !!t);
  }, { passive: true });
})();
