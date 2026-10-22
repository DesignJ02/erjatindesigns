/* "Made for fun": the Blender gallery. Six projects as tiles, a lightbox to step through each project's renders,
   and two ads that load only when played. Content lives in data.js. */
import { BLENDER } from "./data.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const grid = $("bl-grid"), vids = $("bl-videos"), lb = $("bl-lb");
if (grid && vids && lb) {
  /* ---- videos: a poster until played, then a normal video with controls and sound ---- */
  BLENDER.videos.forEach((v) => {
    const f = document.createElement("figure");
    f.className = "bl-vid";
    f.innerHTML = '<button type="button" class="bl-play" aria-label="Play ' + esc(v.title) + '"><img src="' + v.poster + '" alt="" loading="lazy" decoding="async" width="1280" height="720"><i class="bl-btn" aria-hidden="true"></i></button><figcaption>' + esc(v.title) + "</figcaption>";
    f.querySelector("button").addEventListener("click", () => {
      vids.querySelectorAll("video").forEach((o) => o.pause());
      const el = document.createElement("video");
      el.src = v.src; el.poster = v.poster; el.controls = true; el.autoplay = true; el.playsInline = true; el.preload = "auto";
      el.setAttribute("aria-label", v.title);
      f.querySelector("button").replaceWith(el);
      el.play().catch(() => {});
    });
    vids.appendChild(f);
  });

  /* ---- project tiles ---- */
  BLENDER.projects.forEach((p, pi) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "bl-tile";
    b.innerHTML = '<span class="bl-tile-img"><img src="' + p.shots[0].thumb + '" alt="" loading="lazy" decoding="async" width="800" height="450"></span><span class="bl-tile-t"><b>' + esc(p.title) + "</b><small>" + p.shots.length + (p.shots.length === 1 ? " render" : " renders") + "</small></span>";
    b.setAttribute("aria-label", "Open " + p.title + ", " + p.shots.length + " renders");
    b.addEventListener("click", () => open(pi, 0, b));
    grid.appendChild(b);
  });

  /* ---- lightbox ---- */
  let pi = 0, si = 0, opener = null;
  const img = $("bl-lb-img"), cap = $("bl-lb-cap"), prev = $("bl-prev"), next = $("bl-next");
  function show() {
    const p = BLENDER.projects[pi], s = p.shots[si];
    img.src = s.src; img.alt = p.title + ", render " + (si + 1) + " of " + p.shots.length;
    cap.textContent = p.title + "  /  " + (si + 1) + " of " + p.shots.length;
    const many = p.shots.length > 1; prev.hidden = next.hidden = !many;
    [(si + 1) % p.shots.length, (si - 1 + p.shots.length) % p.shots.length].forEach((k) => { const i = new Image(); i.src = p.shots[k].src; });
  }
  function open(p, s, from) { pi = p; si = s; opener = from; show(); lb.showModal(); }
  const step = (d) => { const n = BLENDER.projects[pi].shots.length; si = (si + d + n) % n; show(); };
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  $("bl-close").addEventListener("click", () => lb.close());
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("bl-stage")) lb.close(); });
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); });
  lb.addEventListener("close", () => { img.removeAttribute("src"); if (opener) opener.focus(); });
  /* swipe on touch screens */
  let x0 = null;
  img.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  img.addEventListener("pointerup", (e) => { if (x0 != null && Math.abs(e.clientX - x0) > 50) step(e.clientX < x0 ? 1 : -1); x0 = null; });
}
