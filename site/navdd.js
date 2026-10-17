/* Contact dropdown: the nav's "Contact" item opens a small channel list instead of scrolling to the footer.
   Without JavaScript the link still jumps to #contact. Works on the homepage nav and on the case-study pages. */
(function () {
  "use strict";
  var EMAIL = "jatinsri98@gmail.com";
  var LINKEDIN = "https://www.linkedin.com/in/jsri02/";
  var WA = "919971404680";

  var link = Array.prototype.filter.call(document.querySelectorAll(".nav a"), function (a) { return /(^|#)contact$/.test(a.getAttribute("href") || ""); })[0];
  if (!link) return;
  var nav = link.closest(".nav");
  var ico = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 7l8.5 6.5L20.5 7"/></svg>',
    in: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M8 10.5V16M8 7.8v.1M11.5 16v-3.2c0-1.4 1-2.3 2.2-2.3s2.1.9 2.1 2.3V16M11.5 10.5V16"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4.2A8 8 0 1 1 8.3 19z"/><path d="M9.3 8.8c.2 2.6 3.1 5.5 5.8 5.9l1-1.2-2-1-.9.8c-.8-.4-1.5-1.1-1.9-1.9l.8-.9-1-2z"/></svg>'
  };
  var dd = document.createElement("div");
  dd.className = "nav-dd";
  dd.id = "nav-dd";
  dd.setAttribute("role", "menu");
  dd.hidden = true;
  dd.innerHTML =
    '<p class="dd-cap">Contact &middot; choose a channel</p>' +
    '<div class="dd-row"><a role="menuitem" class="dd-main" href="mailto:' + EMAIL + '?subject=' + encodeURIComponent("Hello Jatin") + '">' + ico.mail + '<span><b>Email</b><em>' + EMAIL + '</em></span><i aria-hidden="true">&nearr;</i></a>' +
    '<button type="button" class="dd-copy" aria-label="Copy email address">Copy</button></div>' +
    '<div class="dd-row"><a role="menuitem" class="dd-main" href="' + LINKEDIN + '" target="_blank" rel="noopener">' + ico.in + '<span><b>LinkedIn</b><em>/in/jsri02</em></span><i aria-hidden="true">&nearr;</i></a></div>' +
    '<div class="dd-row"><a role="menuitem" class="dd-main" href="https://wa.me/' + WA + '?text=' + encodeURIComponent("Hi Jatin, I came across your portfolio and wanted to connect.") + '" target="_blank" rel="noopener">' + ico.wa + '<span><b>WhatsApp</b><em>+91 99714 04680</em></span><i aria-hidden="true">&nearr;</i></a></div>';
  document.body.appendChild(dd);

  link.setAttribute("aria-haspopup", "menu");
  link.setAttribute("aria-expanded", "false");
  link.setAttribute("aria-controls", "nav-dd");
  link.classList.add("has-dd");

  function place() {                                   /* fixed under the Contact item, kept inside the viewport */
    var w = dd.offsetWidth || 300, lb = link.getBoundingClientRect(), bar = (link.closest("header") || nav).getBoundingClientRect();
    var left = Math.min(Math.max(12, lb.left), window.innerWidth - w - 12);
    dd.style.left = left + "px";
    dd.style.top = (bar.bottom + 10) + "px";
    dd.style.setProperty("--ax", Math.round(lb.left + lb.width / 2 - left) + "px");
  }
  function open() {
    dd.hidden = false;
    place();
    requestAnimationFrame(function () { dd.classList.add("on"); });
    link.setAttribute("aria-expanded", "true");
  }
  function close(focus) {
    dd.classList.remove("on");
    link.setAttribute("aria-expanded", "false");
    setTimeout(function () { if (!dd.classList.contains("on")) dd.hidden = true; }, 160);
    if (focus) link.focus();
  }
  function toggle() { if (dd.classList.contains("on")) close(); else open(); }

  /* capture phase: stop the page's own "scroll to #contact" handler from running */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".nav a");
    if (a === link) { e.preventDefault(); e.stopImmediatePropagation(); toggle(); return; }
    if (dd.classList.contains("on") && !dd.contains(e.target)) close();
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && dd.classList.contains("on")) close(true);
  });
  window.addEventListener("resize", function () { if (dd.classList.contains("on")) place(); });
  window.addEventListener("scroll", function () { if (dd.classList.contains("on") && true) close(); }, { passive: true });

  var copy = dd.querySelector(".dd-copy");
  copy.addEventListener("click", function () {
    var done = function (ok) {
      copy.textContent = ok ? "Copied" : "Press Ctrl+C";
      copy.classList.toggle("ok", ok);
      setTimeout(function () { copy.textContent = "Copy"; copy.classList.remove("ok"); }, 1500);
    };
    try { navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); }); } catch (err) { done(false); }
  });
})();
