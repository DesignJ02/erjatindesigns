/* Object Lab: the interface. Screens, rendering, pointer and keyboard input, timer, reveal and PNG export.
   All puzzle rules live in game.js, geometry in jigsaw.js, layout maths in layout.js and content in data.js. */
import { PUZZLES, DIFFICULTIES, DEFAULT_DIFFICULTY, IMAGE_W, IMAGE_H, byId } from "./data.js";
import { buildJigsaw } from "./jigsaw.js";
import { computeLayout, clampToBounds } from "./layout.js";
import { createGame, drop, undo, reset, checkComplete, takeHint, placedCount, isNear, snapTolerance, retray, HINTS_PER_PUZZLE } from "./game.js";

const $ = (id) => document.getElementById(id);
const SVGNS = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const root = $("object-lab");

const S = {
  difficulty: DEFAULT_DIFFICULTY, puzzle: null, jig: null, game: null, layout: null, img: null,
  scale: 1, zTop: 20, selected: null, drag: null,
  acc: 0, since: 0, running: false, started: false, paused: false, solved: false, tickId: 0,
  hintTimer: 0, resetArm: 0, els: [], cells: [], unlocked: new Set()
};

/* ---------- small helpers ---------- */
function loadUnlocked() { try { JSON.parse(sessionStorage.getItem("ol-unlocked") || "[]").forEach((id) => byId(id) && S.unlocked.add(id)); } catch (e) { /* private mode: keep it in memory */ } }
function saveUnlocked() { try { sessionStorage.setItem("ol-unlocked", JSON.stringify([...S.unlocked])); } catch (e) { /* ignore */ } }
function say(msg) { const n = $("ol-live"); if (!n) return; n.textContent = ""; setTimeout(() => { n.textContent = msg; }, 30); }
function clock(ms) { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
function longTime(ms) { const s = Math.round(ms / 1000), m = Math.floor(s / 60); return m ? m + " min " + (s % 60) + " s" : s + " s"; }
function svg(tag, attrs) { const n = document.createElementNS(SVGNS, tag); Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k])); return n; }
function h(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function show(name) {
  root.dataset.screen = name;
  ["intro", "play", "done"].forEach((x) => { $("ol-" + x).hidden = x !== name; });
  $("ol-stats").hidden = name !== "play";
  $("ol-ctx").textContent = name === "intro" ? DIFFICULTIES[S.difficulty].label + " / " + PUZZLES.length + " objects" : S.puzzle ? S.puzzle.name + " / " + DIFFICULTIES[S.difficulty].label : "";
  root.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
  const t = $({ intro: "ol-title", play: "ol-ctx", done: "ol-done-title" }[name]); if (t) t.focus({ preventScroll: true });
}

/* ---------- images: cover-crop every photo to the 4:3 board once, then reuse it for pieces, hint and download ---------- */
const imageCache = new Map();
function loadBoardImage(p) {
  if (imageCache.has(p.id)) return imageCache.get(p.id);
  const job = new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"); c.width = IMAGE_W; c.height = IMAGE_H;
      const k = Math.max(IMAGE_W / im.naturalWidth, IMAGE_H / im.naturalHeight);
      const w = im.naturalWidth * k, hh = im.naturalHeight * k;
      const ctx = c.getContext("2d"); ctx.imageSmoothingQuality = "high";
      ctx.drawImage(im, (IMAGE_W - w) / 2, (IMAGE_H - hh) / 2, w, hh);
      c.toBlob((b) => b ? resolve({ canvas: c, url: URL.createObjectURL(b) }) : reject(new Error("blob")), "image/jpeg", 0.92);
    };
    im.onerror = () => reject(new Error("image"));
    im.src = p.image;
  });
  imageCache.set(p.id, job);
  job.catch(() => imageCache.delete(p.id));
  return job;
}

/* ---------- A. intro ---------- */
function renderIntro() {
  const d = DIFFICULTIES[S.difficulty];
  const seg = $("ol-diff");
  if (!seg.children.length) Object.values(DIFFICULTIES).forEach((x) => {
    const id = "ol-d-" + x.id;
    const wrap = h("span", "ol-seg-opt");
    wrap.innerHTML = '<input type="radio" name="ol-diff" id="' + id + '" value="' + x.id + '"' + (x.id === S.difficulty ? " checked" : "") + '><label for="' + id + '"><b>' + x.label + "</b><span>" + x.pieces + " pieces</span></label>";
    seg.appendChild(wrap);
  });
  const cards = $("ol-cards"); cards.innerHTML = "";
  PUZZLES.forEach((p) => {
    const done = S.unlocked.has(p.id);
    const b = h("button", "ol-thumb");
    b.type = "button";
    b.innerHTML = '<span class="ol-thumb-img"><img src="' + p.image + '" alt="" loading="lazy" decoding="async" width="400" height="300">' + (done ? '<i class="ol-badge">Unlocked</i>' : "") + "</span>" +
      "<b>" + esc(p.name) + "</b><small>" + d.pieces + " pieces / " + d.minutes + "</small>";
    b.setAttribute("aria-label", "Play " + p.name + ", " + d.label + ", " + d.pieces + " pieces, about " + d.minutes + (done ? ", unlocked" : ""));
    b.addEventListener("click", () => startPuzzle(p.id));
    cards.appendChild(b);
  });
}

/* the usable width inside the frame, which is what the board is scaled to */
function availWidth() { const w = $("ol-fieldwrap"), cs = getComputedStyle(w); return Math.max(240, w.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)); }

/* ---------- C. play ---------- */
async function startPuzzle(id) {
  const p = byId(id), d = DIFFICULTIES[S.difficulty];
  stopClock();
  S.puzzle = p; S.solved = false; S.started = false; S.paused = false; S.acc = 0; S.selected = null; S.drag = null;
  $("ol-timer").textContent = "00:00";
  $("ol-pause-screen").hidden = true; $("ol-field").innerHTML = "";
  show("play");
  $("ol-loading").hidden = false; $("ol-loading").textContent = "Preparing pieces…";
  try {
    S.img = await loadBoardImage(p);
  } catch (e) {
    $("ol-loading").innerHTML = "The photo could not be loaded. <button type=\"button\" class=\"ol-link\" id=\"ol-retry\">Try again</button>";
    $("ol-retry").addEventListener("click", () => startPuzzle(id));
    return;
  }
  $("ol-loading").hidden = true;
  S.jig = buildJigsaw({ cols: d.cols, rows: d.rows, W: IMAGE_W, H: IMAGE_H, seed: p.id + ":" + d.id });
  const w = availWidth(); S.lastW = w;
  S.layout = computeLayout(w, S.jig);
  S.game = createGame(S.jig, S.layout.tray, p.id + ":" + d.id);
  buildField();
  applyLayout();
  syncUI();
  say(p.name + " puzzle ready. " + d.pieces + " pieces.");
}

function buildField() {
  const f = $("ol-field"), j = S.jig, g = S.game;
  f.innerHTML = ""; f.className = "ol-field"; S.els = []; S.cells = [];
  const tray = h("div", "ol-tray"); tray.innerHTML = "<span>Pieces</span>"; f.appendChild(tray);
  const board = h("div", "ol-board");
  const ref = h("img", "ol-refimg"); ref.src = S.img.url; ref.alt = ""; ref.setAttribute("aria-hidden", "true"); board.appendChild(ref);
  const slots = svg("svg", { class: "ol-slots", viewBox: "0 0 " + j.W + " " + j.H, "aria-hidden": "true" });
  const g1 = svg("g"); j.pieces.forEach((p) => g1.appendChild(svg("path", { d: p.path, class: "slot" }))); slots.appendChild(g1);
  slots.appendChild(svg("path", { d: "M0 0", class: "ghost", id: "ol-ghost" }));
  board.appendChild(slots);
  j.pieces.forEach((p) => {                                /* board squares: the keyboard route for placing a picked-up piece */
    const c = h("button", "ol-cell"); c.type = "button"; c.tabIndex = -1;
    c.setAttribute("aria-label", "Board square, row " + (p.r + 1) + ", column " + (p.c + 1));
    c.addEventListener("click", () => placeSelectedAt(p));
    board.appendChild(c); S.cells.push(c);
  });
  f.appendChild(board);
  S.boardEl = board; S.trayEl = tray; S.refEl = ref;
  const refOn = $("ol-ref").getAttribute("aria-pressed") === "true"; board.classList.toggle("show-ref", refOn);
  g.pieces.forEach((p) => {
    const jp = j.pieces[p.id];
    const el = h("div", "ol-piece"); el.dataset.id = p.id; el.tabIndex = 0; el.setAttribute("role", "button");
    el.innerHTML = '<svg viewBox="' + (jp.x - j.pad) + " " + (jp.y - j.pad) + " " + (j.cw + 2 * j.pad) + " " + (j.ch + 2 * j.pad) + '" focusable="false" aria-hidden="true">' +
      '<defs><clipPath id="ol-clip-' + p.id + '"><path d="' + jp.path + '"/></clipPath></defs>' +
      '<g clip-path="url(#ol-clip-' + p.id + ')"><image href="' + S.img.url + '" x="0" y="0" width="' + IMAGE_W + '" height="' + IMAGE_H + '" preserveAspectRatio="none"/></g>' +
      '<path class="edge" d="' + jp.path + '" vector-effect="non-scaling-stroke"/></svg>';
    wirePiece(el, p);
    f.appendChild(el); S.els[p.id] = el;
  });
}

function pieceLabel(p) { return "Piece " + (p.id + 1) + " of " + S.jig.count + (p.placed ? ", placed" : ", not placed yet"); }

function place(el, p, animate) {
  const s = S.scale, pad = S.jig.pad;
  el.style.transform = "translate(" + (p.x - pad) * s + "px," + (p.y - pad) * s + "px)";
  el.style.zIndex = p.placed ? 2 : p.z;
  el.classList.toggle("is-placed", p.placed);
  el.classList.toggle("snap", !!animate && !reduceMotion.matches);
  el.tabIndex = p.placed ? -1 : 0;
  el.setAttribute("aria-label", pieceLabel(p));
  el.setAttribute("aria-disabled", p.placed ? "true" : "false");
  if (!el.dataset.sized || el.dataset.sized !== String(s)) {
    el.style.width = (S.jig.cw + 2 * pad) * s + "px"; el.style.height = (S.jig.ch + 2 * pad) * s + "px"; el.dataset.sized = String(s);
  }
}

function applyLayout() {
  const L = S.layout, f = $("ol-field"), j = S.jig;
  S.scale = L.scale;
  f.style.width = L.FW * S.scale + "px"; f.style.height = L.FH * S.scale + "px";
  const b = S.boardEl; b.style.width = j.W * S.scale + "px"; b.style.height = j.H * S.scale + "px";
  const t = S.trayEl; t.style.left = L.tray.x * S.scale + "px"; t.style.top = L.tray.y * S.scale + "px"; t.style.width = L.tray.w * S.scale + "px"; t.style.height = L.tray.h * S.scale + "px";
  S.cells.forEach((c, i) => { const p = j.pieces[i]; c.style.left = p.x * S.scale + "px"; c.style.top = p.y * S.scale + "px"; c.style.width = j.cw * S.scale + "px"; c.style.height = j.ch * S.scale + "px"; });
  S.game.pieces.forEach((p) => place(S.els[p.id], p, false));
  f.classList.toggle("is-narrow", L.mode === "narrow");
}

function onResize() {
  if (!S.game || $("ol-play").hidden) return;
  const w = availWidth();
  if (Math.abs(w - (S.lastW || 0)) < 1) return;
  S.lastW = w;
  const next = computeLayout(w, S.jig);
  if (next.mode !== S.layout.mode) retray(S.game, S.layout.tray, next.tray);
  S.layout = next;
  applyLayout();
}

/* ---------- input: pointer (mouse, touch, pen) ---------- */
function wirePiece(el, p) {
  el.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (S.paused || p.placed || S.game.completed) return;
    e.preventDefault();
    startClock();
    S.drag = { id: p.id, pid: e.pointerId, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
    p.z = ++S.zTop; el.style.zIndex = p.z; el.classList.add("is-drag"); el.classList.remove("snap", "miss");
    el.focus({ preventScroll: true });
  });
  el.addEventListener("pointermove", (e) => {
    const d = S.drag; if (!d || d.pid !== e.pointerId || d.id !== p.id) return;
    const pos = clampToBounds(d.ox + (e.clientX - d.sx) / S.scale, d.oy + (e.clientY - d.sy) / S.scale, S.jig, S.layout.bounds);
    p.x = pos.x; p.y = pos.y; d.moved = true;
    place(el, p, false); updateGhost(p);
  });
  const end = (e) => {
    const d = S.drag; if (!d || d.pid !== e.pointerId || d.id !== p.id) return;
    S.drag = null; el.classList.remove("is-drag");
    try { el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    clearGhost();
    if (e.type === "pointercancel") { p.x = d.ox; p.y = d.oy; place(el, p, true); return; }
    commitDrop(p, { x: d.ox, y: d.oy }, { x: p.x, y: p.y });
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  el.addEventListener("lostpointercapture", (e) => { if (S.drag && S.drag.id === p.id && S.drag.pid === e.pointerId) end({ type: "pointercancel", pointerId: e.pointerId }); });
  el.addEventListener("keydown", (e) => onPieceKey(e, p, el));
}

function commitDrop(p, from, to) {
  const el = S.els[p.id];
  const result = drop(S.game, p.id, from, to);
  place(el, p, result === "snapped");
  if (result === "snapped") {
    say("Piece placed. " + placedCount(S.game) + " of " + S.jig.count + " pieces placed.");
    el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    if (S.selected === p.id) clearSelection();
  } else if (result === "moved") {
    const cx = p.x + S.jig.cw / 2, cy = p.y + S.jig.ch / 2;
    if (cx > 0 && cx < S.jig.W && cy > 0 && cy < S.jig.H) { el.classList.remove("miss"); void el.offsetWidth; el.classList.add("miss"); say("That piece does not fit there."); }
  }
  syncUI();
  if (checkComplete(S.game)) onComplete();
}

function updateGhost(p) {
  const ghost = $("ol-ghost"), j = S.jig;
  const near = isNear(S.game, p, 2.6), snap = isNear(S.game, p, 1);
  if (!near) { clearGhost(); return; }
  ghost.setAttribute("d", j.pieces[p.id].path);
  ghost.setAttribute("class", "ghost on " + (snap ? "snap" : "near"));
}
function clearGhost() { const g = $("ol-ghost"); if (g && !S.hintTimer) g.setAttribute("class", "ghost"); }

/* ---------- input: keyboard alternative ---------- */
function clearSelection() {
  if (S.selected != null && S.els[S.selected]) { S.els[S.selected].classList.remove("is-selected"); S.els[S.selected].setAttribute("aria-pressed", "false"); }
  S.selected = null;
  S.cells.forEach((c) => { c.tabIndex = -1; });
  $("ol-field").classList.remove("has-selection");
}
function onPieceKey(e, p, el) {
  if (S.paused || p.placed || S.game.completed) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (S.selected === p.id) { clearSelection(); say("Piece put down."); return; }
    clearSelection(); startClock();
    S.selected = p.id; el.classList.add("is-selected"); el.setAttribute("aria-pressed", "true");
    p.z = ++S.zTop; el.style.zIndex = p.z;
    S.cells.forEach((c) => { c.tabIndex = 0; });
    $("ol-field").classList.add("has-selection");
    say("Piece " + (p.id + 1) + " picked up. Arrow keys move it. Tab to a board square and press Enter to place it there.");
  } else if (e.key === "Escape" && S.selected === p.id) {
    e.preventDefault(); clearSelection(); say("Piece put down.");
  } else if (S.selected === p.id && e.key.startsWith("Arrow")) {
    e.preventDefault();
    const step = (e.shiftKey ? 8 : 28) / S.scale, dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0, dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
    const from = { x: p.x, y: p.y }, to = clampToBounds(p.x + dx, p.y + dy, S.jig, S.layout.bounds);
    commitDrop(p, from, to);
    if (p.placed) { el.focus(); }
  }
}
function placeSelectedAt(slot) {
  if (S.selected == null || S.paused) return;
  const p = S.game.pieces[S.selected];
  commitDrop(p, { x: p.x, y: p.y }, { x: slot.x, y: slot.y });
  if (!p.placed) { say("Piece " + (p.id + 1) + " does not belong in that square."); S.els[p.id].focus(); }
  else { const next = S.game.pieces.find((q) => !q.placed); if (next) S.els[next.id].focus(); else $("ol-undo").focus(); }
  if (p.placed) clearSelection();
}

/* ---------- toolbar ---------- */
function syncUI() {
  const g = S.game, n = placedCount(g), total = S.jig.count;
  $("ol-progress").textContent = n + " of " + total + " pieces";
  $("ol-meter").style.width = (n / total) * 100 + "%";
  const undoBtn = $("ol-undo"); undoBtn.disabled = !g.history.length || g.completed;
  const hint = $("ol-hint"); hint.textContent = "Hint (" + g.hintsLeft + ")"; hint.disabled = g.hintsLeft <= 0 || g.completed;
  hint.title = g.hintsLeft <= 0 ? "No hints left. The Reference button shows the whole picture." : "Highlight where one piece goes";
  $("ol-reset").disabled = !g.history.length && !g.completed;
  ["ol-ref", "ol-pause"].forEach((id) => { $(id).disabled = g.completed; });
}

function toggleReference() {
  const b = $("ol-ref"), on = b.getAttribute("aria-pressed") !== "true";
  b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Hide reference" : "Reference";
  if (S.boardEl) S.boardEl.classList.toggle("show-ref", on);
}

function useHint() {
  const id = takeHint(S.game, S.selected);
  if (id == null) { say("No hints left. Try the reference image."); return; }
  const p = S.game.pieces[id], el = S.els[id], ghost = $("ol-ghost");
  ghost.setAttribute("d", S.jig.pieces[id].path); ghost.setAttribute("class", "ghost on hint");
  el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint");
  clearTimeout(S.hintTimer);
  S.hintTimer = setTimeout(() => { S.hintTimer = 0; ghost.setAttribute("class", "ghost"); el.classList.remove("hint"); }, 3200);
  say("Hint: the highlighted piece belongs in the outlined spot on the board.");
  syncUI();
}

function doUndo() {
  const h2 = undo(S.game);
  if (!h2) return;
  const p = S.game.pieces[h2.id]; place(S.els[h2.id], p, true);
  S.els[h2.id].classList.remove("pop");
  say("Undid the last move. " + placedCount(S.game) + " of " + S.jig.count + " pieces placed.");
  syncUI();
}

function doReset() {
  const b = $("ol-reset");
  if (!S.solved && (S.game.history.length > 0) && !S.resetArm) {
    S.resetArm = setTimeout(() => { S.resetArm = 0; b.textContent = "Reset"; }, 3000);
    b.textContent = "Confirm reset?"; say("Press Reset again to start over."); return;
  }
  clearTimeout(S.resetArm); S.resetArm = 0; b.textContent = "Reset";
  clearSelection(); reset(S.game);
  S.solved = false; $("ol-field").classList.remove("is-done", "celebrate");
  S.game.pieces.forEach((p) => place(S.els[p.id], p, true));
  S.acc = 0; S.started = false; stopClock(); $("ol-timer").textContent = "00:00";
  syncUI(); say("Puzzle reset to its starting scatter.");
}

/* ---------- timer ---------- */
function startClock() {
  if (S.running || S.solved || S.paused) return;
  S.started = true; S.running = true; S.since = performance.now();
  S.tickId = setInterval(tick, 250);
}
function elapsed() { return S.acc + (S.running ? performance.now() - S.since : 0); }
function tick() { $("ol-timer").textContent = clock(elapsed()); }
function stopClock() { if (S.running) { S.acc += performance.now() - S.since; S.running = false; } clearInterval(S.tickId); S.tickId = 0; tick(); }

function setPaused(on) {
  if (S.solved) return;
  S.paused = on;
  if (on) { stopClock(); clearSelection(); } else if (S.started) startClock();
  $("ol-pause").textContent = on ? "Resume" : "Pause";
  $("ol-pause-screen").hidden = !on;
  $("ol-field").inert = on; $("ol-field").style.visibility = on ? "hidden" : "";
  if (on) $("ol-resume").focus(); else $("ol-pause").focus();
}

/* ---------- completion and reveal ---------- */
function onComplete() {
  S.solved = true; stopClock(); clearSelection(); clearGhost();
  S.unlocked.add(S.puzzle.id); saveUnlocked();
  const f = $("ol-field"); f.classList.add("is-done"); if (!reduceMotion.matches) f.classList.add("celebrate");
  say(S.puzzle.name + " complete in " + longTime(S.acc) + ".");
  syncUI();
  setTimeout(showDone, reduceMotion.matches ? 150 : 1300);
}

function showDone() {
  if (!S.solved || root.dataset.screen !== "play") return;
  const p = S.puzzle;
  const img = $("ol-done-img"); img.src = S.img.url; img.alt = p.alt;
  $("ol-done-credit").innerHTML = "Photo: <a href=\"" + p.credit.href + "\" target=\"_blank\" rel=\"noopener\">" + esc(p.credit.by) + "</a>, " + esc(p.credit.license) + ", via Wikimedia Commons";
  $("ol-done-title").textContent = p.name;
  $("ol-done-principle").textContent = p.principle;
  $("ol-done-insight").textContent = p.insight;
  const src = $("ol-done-src"); src.textContent = p.source.label; src.href = p.source.href;
  $("ol-dl-msg").textContent = "";
  show("done");
}

function nextObject() {
  const i = PUZZLES.findIndex((x) => x.id === S.puzzle.id);
  const order = PUZZLES.slice(i + 1).concat(PUZZLES.slice(0, i));
  const next = order.find((x) => !S.unlocked.has(x.id)) || order[0];
  startPuzzle(next.id);
}

function downloadPNG() {
  const msg = $("ol-dl-msg"), p = S.puzzle;
  const fail = () => { msg.textContent = "Could not create the image. Right-click the picture to save it instead."; };
  try {
    const band = 96, c = document.createElement("canvas"); c.width = IMAGE_W; c.height = IMAGE_H + band;
    const x = c.getContext("2d");
    x.drawImage(S.img.canvas, 0, 0);
    x.fillStyle = "#fafafa"; x.fillRect(0, IMAGE_H, IMAGE_W, band);
    x.fillStyle = "#2b2a28"; x.font = "700 34px \"General Sans\", Arial, sans-serif"; x.textBaseline = "middle"; x.fillText(p.name, 40, IMAGE_H + band / 2);
    x.font = "500 20px \"DM Mono\", monospace"; x.textAlign = "right"; x.fillStyle = "#5e5a51";
    x.fillText("OBJECT LAB  /  PHOTO: " + p.credit.by.toUpperCase().slice(0, 30), IMAGE_W - 40, IMAGE_H + band / 2);
    c.toBlob((b) => {
      if (!b) { fail(); return; }
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "object-lab-" + p.id + ".png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      msg.textContent = "Saved.";
    }, "image/png");
  } catch (e) { fail(); }
}

/* ---------- navigation between screens ---------- */
function goIntro() { stopClock(); S.game = null; $("ol-field").innerHTML = ""; renderIntro(); show("intro"); }

function wire() {
  $("ol-diff").addEventListener("change", (e) => { if (!e.target.value) return; S.difficulty = e.target.value; renderIntro(); $("ol-ctx").textContent = DIFFICULTIES[S.difficulty].label + " / " + PUZZLES.length + " objects"; });
  $("ol-start").addEventListener("click", () => { const p = PUZZLES.find((x) => !S.unlocked.has(x.id)) || PUZZLES[0]; startPuzzle(p.id); });
  $("ol-ref").addEventListener("click", toggleReference);
  $("ol-hint").addEventListener("click", useHint);
  $("ol-undo").addEventListener("click", doUndo);
  $("ol-reset").addEventListener("click", doReset);
  $("ol-pause").addEventListener("click", () => setPaused(!S.paused));
  $("ol-resume").addEventListener("click", () => setPaused(false));
  $("ol-back").addEventListener("click", goIntro);
  $("ol-next").addEventListener("click", nextObject);
  $("ol-replay").addEventListener("click", () => startPuzzle(S.puzzle.id));
  $("ol-dl").addEventListener("click", downloadPNG);
  document.addEventListener("visibilitychange", () => { if (document.hidden && S.game && S.running) setPaused(true); });
  if ("ResizeObserver" in window) new ResizeObserver(() => requestAnimationFrame(onResize)).observe($("ol-fieldwrap"));
  else window.addEventListener("resize", onResize);
}

loadUnlocked();
renderIntro();
show("intro");
wire();


