/* "Beyond product design": two independent horizontal galleries (3D & Blender, Vibe-coded tools).
   Each gallery scrolls on its own: trackpad or shift + wheel, touch swipe, mouse drag, the arrow, or the keyboard on a focused card.
   The progress bar follows the real scroll position. Content is data-driven: add an entry below (or to blender/tools.js) and it
   becomes another card. Blender cards use the real renders and ad posters, tool cards use the supplied previews. Nothing is invented. */
import { BLENDER } from "./data.js";
import { TOOLS } from "./tools.js?v=12";

const proj = (id) => BLENDER.projects.findIndex((p) => p.id === id);
const vid = (id) => BLENDER.videos.find((v) => v.id === id);
const airpods = proj("airpods"), wheel = proj("lambo-wheel");

const GALLERIES = {
  blender: [
    { title: "Automotive studies", ref: "3D-001", img: vid("bugatti").poster, alt: "Bugatti Chiron trailer, still frame", video: vid("bugatti").src, label: "Play the Bugatti Chiron trailer" },
    { title: "Product visualisation", ref: "3D-002", img: BLENDER.projects[airpods].shots[0].thumb, alt: "AirPods Max render", open: airpods, label: "Open the AirPods Max renders" },
    { title: "Exploded views", ref: "3D-003", img: BLENDER.projects[wheel].shots[0].thumb, alt: "Lamborghini steering wheel render", open: wheel, label: "Open the Lamborghini steering wheel renders" },
    { title: "Volvo ad", ref: "3D-004", img: vid("volvo").poster, alt: "Volvo ad, still frame", video: vid("volvo").src, label: "Play the Volvo ad" }
  ],
  tools: TOOLS.map((t, i) => ({ title: t.name, ref: "TOOL-" + String(i + 1).padStart(3, "0"), img: t.preview, alt: t.name + " preview", href: t.href, bg: t.bg, fit: !t.cover, video: t.video, poster: t.poster, label: t.video ? "Play " + t.name : t.href ? "Open " + t.name : t.name + ", link coming soon" }))
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ARROW = '<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M3 9h11M10 4.5 14.5 9 10 13.5"/></svg>';

/* video dialog: the ads play in a plain dark viewer, closed with Esc, the button or a click outside */
const vdlg = document.getElementById("bl-vlb"), vel = document.getElementById("bl-vlb-v"), vcap = document.getElementById("bl-vlb-cap");
let vfrom = null;
function playVideo(a) {
  if (!vdlg || !vel) return;
  vfrom = a;
  vel.poster = a.dataset.poster; vel.src = a.dataset.video;
  vcap.textContent = a.dataset.title;
  vdlg.showModal();
  const p = vel.play(); if (p && p.catch) p.catch(() => {});
}
if (vdlg) {
  const stop = () => { vel.pause(); vel.removeAttribute("src"); vel.load(); if (vfrom) vfrom.focus(); };
  document.getElementById("bl-vlb-x").addEventListener("click", () => vdlg.close());
  vdlg.addEventListener("click", (e) => { if (e.target === vdlg || e.target.classList.contains("bl-stage")) vdlg.close(); });
  vdlg.addEventListener("close", stop);
}

function card(it) {
  const img = '<span class="gx-img"' + (it.bg ? ' style="--bgi:' + esc(it.bg) + '"' : "") + '><img src="' + esc(it.img) + '" alt="' + esc(it.alt) + '" width="800" height="400" loading="lazy" decoding="async" draggable="false"' + (it.fit ? ' class="fit"' : "") + ">" + (it.video ? '<span class="gx-play" aria-hidden="true"></span>' : "") + "</span>";
  const cap = '<span class="gx-cap"><b>' + esc(it.title) + "</b><i>" + esc(it.ref) + "</i></span>";
  const aria = ' aria-label="' + esc(it.label) + '"';
  if (it.video) return '<li class="gx-card"><a class="gx-link" draggable="false" href="#blender" data-video="' + esc(it.video) + '" data-poster="' + esc(it.poster || it.img) + '" data-title="' + esc(it.title) + '"' + aria + ">" + img + cap + "</a></li>";
  if (it.open != null) return '<li class="gx-card"><a class="gx-link" draggable="false" href="#blender" data-open="' + it.open + '"' + aria + ">" + img + cap + "</a></li>";
  if (it.href) return '<li class="gx-card"><a class="gx-link" draggable="false" href="' + esc(it.href) + '"' + (it.href.charAt(0) === "#" ? "" : ' target="_blank" rel="noopener"') + aria + ">" + img + cap + "</a></li>";
  return '<li class="gx-card"><div class="gx-link gx-off" title="Link coming soon">' + img + cap + "</div></li>";
}

document.querySelectorAll(".gx").forEach((gx) => {
  const key = gx.dataset.gx, list = GALLERIES[key] || [];
  const track = gx.querySelector(".gx-track"), bar = gx.querySelector(".gx-prog i");
  const next = gx.querySelector(".gx-btn.next"), prev = gx.querySelector(".gx-btn.prev");
  track.innerHTML = list.map(card).join("");

  /* progress and arrow state, from the real scroll position */
  let raf = 0;
  function sync() {
    raf = 0;
    const max = track.scrollWidth - track.clientWidth, pos = max > 1 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
    const w = max > 1 ? Math.max(8, (track.clientWidth / track.scrollWidth) * 100) : 100;
    bar.style.width = w + "%";
    bar.style.left = pos * (100 - w) + "%";
    next.disabled = !(max > 1) || track.scrollLeft >= max - 1;
    prev.disabled = track.scrollLeft <= 1;
  }
  const queue = () => { if (!raf) { raf = requestAnimationFrame(sync); setTimeout(() => { if (raf) { cancelAnimationFrame(raf); sync(); } }, 100); } };
  track.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  if (window.ResizeObserver) new ResizeObserver(queue).observe(track);
  sync();

  /* arrows: move by one card */
  const stepBy = (dir) => {
    const c = track.querySelector(".gx-card"); if (!c) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * (c.getBoundingClientRect().width + gap), behavior: reduce ? "auto" : "smooth" });
  };
  next.addEventListener("click", () => stepBy(1));
  prev.addEventListener("click", () => stepBy(-1));

  track.addEventListener("dragstart", (e) => e.preventDefault());   /* links and images must not start a native drag, it would cancel ours */
  /* mouse drag to scroll (touch uses native scrolling); a drag never counts as a click */
  let sx = 0, sl = 0, down = false, moved = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
  });
  track.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add("drag"); try { track.setPointerCapture(e.pointerId); } catch (err) { /* carry on without capture */ } }
    if (moved) track.scrollLeft = sl - dx;
  });
  const up = () => { down = false; track.classList.remove("drag"); };
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; } }, true);

  /* clicks: the ads open the video viewer, renders open the lightbox, tools open their page */
  track.addEventListener("click", (e) => {
    const v = e.target.closest("a[data-video]");
    if (v) { e.preventDefault(); playVideo(v); return; }
    const a = e.target.closest("a[data-open]");
    if (!a) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("bl:open", { detail: { index: +a.dataset.open, from: a } }));
  });

  /* a focused card scrolls fully into view (keyboard users tabbing along the gallery) */
  track.addEventListener("focusin", (e) => { const c = e.target.closest(".gx-card"); if (c) c.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" }); });
});
