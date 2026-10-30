/* Offline page. Pages load from the network as usual. Only when a page load fails because there is no connection does this
   serve the saved 404 drawing instead of the browser's own "no internet" screen. A real "not found" from the server is left alone. */
var CACHE = "offline-v1";
var OFFLINE = "/404.html";
var OWN = ["/404.html", "/notfound.css", "/notfound.js", "/favicon.ico"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    fetch(OFFLINE, { cache: "reload" }).then(function (res) {
      var copy = res.clone();
      return res.text().then(function (html) {
        /* keep the exact stylesheet and script versions the offline page asks for */
        var urls = [OFFLINE, "/favicon.ico"];
        (html.match(/\/notfound\.(?:css|js)\?v=\d+/g) || []).forEach(function (u) { urls.push(u); });
        return caches.open(CACHE).then(function (c) { c.put(OFFLINE, copy); return c.addAll(urls.filter(function (u) { return u !== OFFLINE; })); });
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(function () { return caches.match(OFFLINE); }));
    return;
  }
  if (OWN.indexOf(url.pathname) > -1) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req, { ignoreSearch: true }); })
    );
  }
});
