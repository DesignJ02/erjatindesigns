/* Visitor pass: each case study you actually open punches its hole on the pass (kept in this browser only).
   Loaded on the homepage (renders the pass) and on the case studies (records the visit). */
(function () {
  "use strict";
  var KEY = "pass-visited", SEEN = "pass-seen", SLUGS = ["locearn", "competition-tracking", "kangaru", "datum"];
  function read(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var m = location.pathname.match(/\/work\/([a-z-]+)\.html$/);
  if (m && SLUGS.indexOf(m[1]) > -1) {
    var v = read(KEY);
    if (v.indexOf(m[1]) < 0) { v.push(m[1]); write(KEY, v); }
  }

  var pass = document.getElementById("pass");
  if (!pass) return;
  function render() {
    var visited = read(KEY), seen = read(SEEN), fresh = false;
    Array.prototype.forEach.call(pass.querySelectorAll(".pn"), function (a) {
      var slug = a.getAttribute("data-slug"), hit = visited.indexOf(slug) > -1, isNew = hit && seen.indexOf(slug) < 0;
      a.classList.toggle("hit", hit);
      a.classList.toggle("new", isNew);
      if (isNew) fresh = true;
    });
    var n = visited.filter(function (s) { return SLUGS.indexOf(s) > -1; }).length;
    var cnt = pass.querySelector(".cnt"), msg = document.getElementById("pass-msg");
    if (cnt) cnt.textContent = n + "/4";
    pass.classList.toggle("done", n === 4);
    if (msg) msg.textContent = n === 4 ? "Pass validated. You have seen the work. Let’s talk." : n === 0 ? "Visit each case study to punch your pass." : (4 - n) + " to go. Tap a hole to open its case study.";
    if (fresh) write(SEEN, visited);
  }
  render();
  window.addEventListener("pageshow", render);
  var stub = pass.querySelector(".stub");
  if (stub) stub.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stub.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  });
})();
