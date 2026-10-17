// erjatindesigns — Jatin Srivastava portfolio
(function () {
  "use strict";

  // ---- Fill these in. Empty values show "not set yet" in the picker. ----
  var CONFIG = {
    email: "jatinsri98@gmail.com",
    linkedin: "https://www.linkedin.com/in/jsri02/",
    whatsapp: "919971404680", // digits with country code
    resume: "https://drive.google.com/file/d/1y_MsUEoDnDtldZ2GRs9qJJg-fD_45Nbj/view?usp=drive_link",
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- greeting ----
  var h = new Date().getHours();
  var g = $("#greeting");
  if (g) g.textContent = "( Good " + (h < 12 ? "morning" : h < 18 ? "afternoon" : "evening") + " )";

  // ---- marquee ----
  var skills = ["Product Design", "0 → 1 Products", "B2B SaaS", "Mobile Experiences", "Design Systems", "UX Research", "Prototyping", "AdTech · Logistics · Health-tech"];
  var track = $("#marquee");
  if (track) {
    var html = skills.map(function (s) { return "<span>" + s + "</span>"; }).join("");
    track.innerHTML = html + html + html + html;
  }

  // ---- intro ----
  var intro = $("#intro");
  function runHero() {
    if (reduce || !window.gsap) {
      $$(".hero-name .l1 > span, .hero-name .l2 > span").forEach(function (s) { s.style.transform = "none"; });
      return;
    }
    gsap.to(".hero-name .l1 > span, .hero-name .l2 > span", { y: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 });
  }
  // the paper intro (intro.js) calls window.__runHero when it hands over to the page
  if (document.documentElement.classList.contains("intro-pending")) {
    window.__runHero = runHero;
  } else {
    runHero();
  }

  // ---- smooth scroll ----
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var el = id.length > 1 ? $(id) : document.body;
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -70 });
      else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      $("#nav").classList.remove("open");
    });
  });

  // ---- reveals ----
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$(".rv, .collage").forEach(function (el, i) { io.observe(el); });

  // ---- nav: active section, theme, menu ----
  var links = $$(".nav a[href^='#']");
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["work", "about", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

  var root = document.documentElement;
  $("#theme").addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") || "light";
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
  var menu = $("#menu");
  menu.addEventListener("click", function () {
    var open = $("#nav").classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
  });

  // ---- cursor + project preview ----
  var cur = $(".cursor");
  var prev = $("#preview");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && cur) {
    window.addEventListener("mousemove", function (e) {
      cur.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      if (prev.classList.contains("on")) prev.style.transform = "translate(" + (e.clientX + 24) + "px," + (e.clientY - 70) + "px)";
    });
    $$("a, button, .polaroid, .sticker, .note").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("link"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("link"); });
    });
    $$(".work-row").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        prev.style.setProperty("--c", getComputedStyle(row).getPropertyValue("--c"));
        prev.textContent = row.dataset.preview;
        prev.classList.add("on");
      });
      row.addEventListener("mouseleave", function () { prev.classList.remove("on"); });
    });
  }

  // ---- magnetic buttons ----
  if (fine && !reduce) {
    $$(".round, .ticket, .dt-btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = (e.clientX - r.left - r.width / 2) * 0.12 + "px " + (e.clientY - r.top - r.height / 2) * 0.12 + "px";
      });
      b.addEventListener("mouseleave", function () { b.style.translate = ""; });
    });
  }

  // ---- contact picker ----
  var modal = $("#modal");
  var lastFocus = null;
  function open(mode) {
    lastFocus = document.activeElement;
    var isResume = mode === "resume";
    $("#m-title").textContent = isResume ? "Get my resume" : "How should we talk?";
    $("#m-sub").textContent = isResume ? "Open it in a new tab, or reach out and I'll send it over." : "Pick how you'd like to reach me.";
    $('[data-channel="resume"]').hidden = !isResume;
    modal.classList.add("open");
    if (lenis) lenis.stop();
    $(".opt:not([hidden])", modal).focus();
  }
  function close() {
    modal.classList.remove("open");
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      /* "Resume" goes straight to the file; only "Contact" shows the channel picker */
      if (b.dataset.open === "resume" && CONFIG.resume) { window.open(CONFIG.resume, "_blank", "noopener"); return; }
      open(b.dataset.open);
    });
  });
  $("#m-close").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
    if (e.key === "Tab" && modal.classList.contains("open")) {
      var f = $$("button:not([hidden])", modal);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var urls = {
    email: function () { return CONFIG.email && "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Hello Jatin"); },
    linkedin: function () { return CONFIG.linkedin; },
    whatsapp: function () { return CONFIG.whatsapp && "https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent("Hi Jatin, I came across your portfolio and wanted to connect."); },
    resume: function () { return CONFIG.resume; },
  };
  $$("[data-channel]").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = urls[b.dataset.channel]();
      if (!url) { $("#m-sub").textContent = "That link isn't set up yet. Try another option."; return; }
      if (b.dataset.channel === "resume") { window.open(url, "_blank", "noopener"); }
      else window.open(url, "_blank", "noopener");
      close();
    });
  });
})();
