/* "Made for fun": the Blender gallery. Six projects as tiles, a lightbox to step through each project's renders,
   and two ads that load only when played. Content lives in data.js. */
import { BLENDER } from "./data.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lb = $("bl-lb");
if (lb) {
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
  window.addEventListener("bl:open", (e) => open(e.detail.index, 0, e.detail.from));
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
