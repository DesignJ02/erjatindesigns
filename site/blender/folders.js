/* "Beyond product design": two folders, each holding three preview sheets. Hovering (or tapping, or Enter/Space on) a
   folder moves it forward and the sheets rise out from behind it, one after another. The two folders work independently.
   Collections are data-driven: add an item to a list below (or to blender/tools.js) and it gets its own sheet slot
   (the first three show). Nothing is invented: Blender sheets use the real renders, tool sheets use the supplied previews. */
import { BLENDER } from "./data.js";
import { TOOLS } from "./tools.js";

const proj = (id) => BLENDER.projects.findIndex((p) => p.id === id);
const vid = (id) => BLENDER.videos.find((v) => v.id === id);

const COLLECTIONS = {
  blender: [
    { title: vid("bugatti").title, img: vid("bugatti").poster, video: vid("bugatti").src, note: "Watch the trailer" },
    { title: vid("volvo").title, img: vid("volvo").poster, video: vid("volvo").src, note: "Watch the ad" },
    { title: BLENDER.projects[proj("airpods")].title, img: BLENDER.projects[proj("airpods")].shots[0].thumb, open: proj("airpods"), note: BLENDER.projects[proj("airpods")].shots.length + " renders" },
    { title: BLENDER.projects[proj("lambo-wheel")].title, img: BLENDER.projects[proj("lambo-wheel")].shots[0].thumb, open: proj("lambo-wheel"), note: BLENDER.projects[proj("lambo-wheel")].shots.length + " renders" }
  ],
  tools: TOOLS.map((t) => ({ title: t.name, img: t.preview, href: t.href, bg: t.bg, fit: "contain", note: t.href ? "Open the tool" : "Link coming soon" }))
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hoverOK = window.matchMedia("(hover: hover) and (pointer: fine)");
const WIDTHS = [100, 96, 92, 88], GAP = 12, PEEK = 14, RATIO = 520 / 232;

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

document.querySelectorAll(".fd").forEach((fd) => {
  const key = fd.dataset.fd, list = (COLLECTIONS[key] || []).slice(0, 4);
  const ul = fd.querySelector(".fd-cards"), front = fd.querySelector(".fd-front"), back = fd.querySelector(".fd-back");
  ul.innerHTML = list.map((it, i) => {
    const body = (it.img ? '<img src="' + it.img + '" alt="" decoding="async"' + (it.fit ? ' class="contain"' : "") + ">" : "") + '<span class="fd-tag"><b>' + esc(it.title) + "</b><i>" + esc(it.note || "") + "</i></span>";
    const style = ' style="--w:' + WIDTHS[i] + '%' + (it.bg ? ";--bg:" + esc(it.bg) : "") + '"';
    if (it.video) return '<li class="fd-card"' + style + '><a class="fd-link" href="#blender" data-video="' + esc(it.video) + '" data-poster="' + esc(it.img) + '" data-title="' + esc(it.title) + '" aria-label="Play ' + esc(it.title) + '">' + body + '<span class="fd-play" aria-hidden="true"></span></a></li>';
    if (it.open != null) return '<li class="fd-card"' + style + '><a class="fd-link" href="#blender" data-open="' + it.open + '" aria-label="Open ' + esc(it.title) + '">' + body + "</a></li>";
    if (it.href) return '<li class="fd-card"' + style + '><a class="fd-link" href="' + esc(it.href) + '"' + (it.href.charAt(0) === "#" ? "" : ' target="_blank" rel="noopener"') + ' aria-label="' + esc(it.title) + '">' + body + "</a></li>";
    return '<li class="fd-card"' + style + '><div class="fd-link fd-off" aria-label="' + esc(it.title) + ', link coming soon">' + body + "</div></li>";
  }).join("");

  ul.addEventListener("click", (e) => {
    const v = e.target.closest("a[data-video]");
    if (v) { e.preventDefault(); playVideo(v); return; }
    const a = e.target.closest("a[data-open]");
    if (!a) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("bl:open", { detail: { index: +a.dataset.open, from: a } }));
  });

  /* geometry: where each sheet ends up, and where it waits behind the folder */
  function layout() {
    const W = fd.clientWidth, fh = Math.round(W / RATIO);
    const ch = Math.max(72, Math.min(124, Math.round(W * 0.215)));
    const n = list.length, stack = n * ch + (n - 1) * GAP;
    const H = stack + fh - 24;
    fd.style.height = H + "px";
    front.style.height = fh + "px";
    back.style.height = fh + "px"; back.style.bottom = Math.round(fh * 0.13) + "px";
    const bodyTop = H - fh + Math.round(fh * 0.19);
    ul.querySelectorAll(".fd-card").forEach((c, i) => {
      const top = i * (ch + GAP), wait = bodyTop - PEEK * (n - i);
      c.style.height = ch + "px"; c.style.top = top + "px";
      c.style.setProperty("--dy", wait - top + "px");
      c.style.zIndex = String(i + 1);
    });
    fd.style.setProperty("--fh", fh + "px");
    fd.style.setProperty("--gt", Math.round(ch / 2) + "px");
  }

  /* state */
  let timer = 0, pinned = false;
  const set = (on) => {
    fd.classList.toggle("on", on);
    front.setAttribute("aria-expanded", on ? "true" : "false");
    ul.querySelectorAll(".fd-card").forEach((c, i) => {
      c.style.setProperty("--d", (on ? i * 90 : (list.length - 1 - i) * 40) + "ms");
    });
  };
  fd.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && hoverOK.matches) { clearTimeout(timer); set(true); } });
  fd.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !pinned) { clearTimeout(timer); timer = setTimeout(() => set(false), 200); } });
  front.addEventListener("click", () => { if (fd.classList.contains("on") && pinned) { pinned = false; set(false); } else { pinned = true; set(true); } });
  fd.addEventListener("focusin", () => { clearTimeout(timer); set(true); });
  fd.addEventListener("focusout", (e) => { if (!fd.contains(e.relatedTarget) && !pinned && !fd.matches(":hover")) set(false); });
  document.addEventListener("pointerdown", (e) => { if (pinned && !fd.contains(e.target)) { pinned = false; set(false); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && fd.classList.contains("on")) { pinned = false; set(false); } });

  layout();
  set(false);
  window.addEventListener("resize", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  if (reduce) fd.classList.add("calm");
});
