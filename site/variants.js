// Shared behaviour for the LocEarn layout variations
(function () {
  "use strict";
  // lightbox
  var lb = document.getElementById("lb");
  if (lb) {
    var im = lb.querySelector("img");
    document.querySelectorAll(".shot img, .shots img").forEach(function (i) {
      i.addEventListener("click", function () { im.src = i.src; im.alt = i.alt; lb.hidden = false; });
    });
    lb.addEventListener("click", function () { lb.hidden = true; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.hidden = true; });
  }
  // reading progress
  var bar = document.getElementById("pg");
  if (bar) {
    var upd = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    };
    addEventListener("scroll", upd, { passive: true });
    upd();
  }
  // scroll-spy for the sticky contents (variation A)
  var links = document.querySelectorAll("[data-spy]");
  if (links.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("on", l.dataset.spy === en.target.id); });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach(function (l) { var t = document.getElementById(l.dataset.spy); if (t) spy.observe(t); });
  }
  // smooth in-page links for the contents list
  links.forEach(function (l) {
    l.addEventListener("click", function (e) {
      var t = document.getElementById(l.dataset.spy);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  });
})();
