/* Visitor statistics: Google Analytics 4 and Vercel Web Analytics, both skipped for the owner and for local previews.
   Your own visits are left out: open the site once with ?owner=1 in each browser you use and that browser is remembered as yours
   (turn it off again with ?owner=0). Local previews are never counted. */
(function () {
  "use strict";
  var ID = "G-9DJ6TTVKRR";
  var host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || /\.localhost$/.test(host)) return;
  try {
    var m = location.search.match(/[?&]owner=([01])/);
    if (m) {
      if (m[1] === "1") localStorage.setItem("owner", "1"); else localStorage.removeItem("owner");
      var clean = location.search.replace(/([?&])owner=[01]&?/, "$1").replace(/[?&]$/, "");
      if (history.replaceState) history.replaceState(null, "", location.pathname + clean + location.hash);
    }
    if (localStorage.getItem("owner") === "1") { window["ga-disable-" + ID] = true; return; }
  } catch (e) {}
  /* Vercel Web Analytics (counts visitors and page views; served by Vercel itself at /_vercel/insights/script.js) */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var v = document.createElement("script");
  v.defer = true;
  v.src = "/_vercel/insights/script.js";
  document.head.appendChild(v);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", ID);
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);
})();
