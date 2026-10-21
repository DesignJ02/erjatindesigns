/* Object Lab: puzzle state. Pure logic, no DOM, so it can be unit tested in Node.
   Positions are the piece's cell origin in image units; a piece is solved when its origin equals (tx, ty). */
import { mulberry32, hashSeed } from "./jigsaw.js";

export const SNAP_FRACTION = 0.32;                        /* snap distance as a share of the smaller cell side */
export const HINTS_PER_PUZZLE = 3;

export function snapTolerance(jig) { return Math.min(jig.cw, jig.ch) * SNAP_FRACTION; }

/* u, v in 0..1 pick a spot inside a tray rect so the cell stays fully inside it. */
function fromFraction(f, jig, rect) {
  return { x: rect.x + f.u * Math.max(0, rect.w - jig.cw), y: rect.y + f.v * Math.max(0, rect.h - jig.ch) };
}
function toFraction(x, y, jig, rect) {
  const cl = (n) => Math.min(1, Math.max(0, n));
  return { u: cl((x - rect.x) / Math.max(1, rect.w - jig.cw)), v: cl((y - rect.y) / Math.max(1, rect.h - jig.ch)) };
}

export function createGame(jig, trayRect, seed) {
  const rnd = mulberry32(hashSeed(seed + ":" + jig.cols));
  const order = jig.pieces.map((p) => p.id);
  for (let i = order.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [order[i], order[k]] = [order[k], order[i]]; }
  /* jittered grid over the tray, so the scatter looks loose but covers the whole tray instead of clumping */
  const n = order.length, aspect = trayRect.w / Math.max(1, trayRect.h);
  const gc = Math.max(1, Math.round(Math.sqrt(n * aspect))), gr = Math.ceil(n / gc);
  const jit = () => (rnd() - 0.5) * 0.7;
  const pieces = jig.pieces.map((p) => {
    const slot = order.indexOf(p.id), col = slot % gc, row = Math.floor(slot / gc);
    const spread = (i, k) => (k > 1 ? Math.min(1, Math.max(0, ((i + 0.5 + jit()) / k - 0.5 / k) / (1 - 1 / k))) : 0.5);
    const f = { u: spread(col, gc), v: spread(row, gr) };
    const pos = fromFraction(f, jig, trayRect);
    return { id: p.id, r: p.r, c: p.c, tx: p.x, ty: p.y, x: pos.x, y: pos.y, placed: false, z: order.indexOf(p.id) + 1 };
  });
  const game = {
    jig, pieces, history: [], completed: false, hintsLeft: HINTS_PER_PUZZLE, rnd,
    initial: pieces.map((p) => ({ id: p.id, x: p.x, y: p.y, z: p.z }))
  };
  return game;
}

export const placedCount = (g) => g.pieces.filter((p) => p.placed).length;
export const distanceToTarget = (p) => Math.hypot(p.x - p.tx, p.y - p.ty);
export const isNear = (g, p, factor) => !p.placed && distanceToTarget(p) <= snapTolerance(g.jig) * factor;

/* Drop a piece. `from` is where the drag began (for Undo). Returns "snapped", "moved" or "ignored". */
export function drop(g, id, from, to) {
  const p = g.pieces[id];
  if (!p || p.placed || g.completed) return "ignored";
  p.x = to.x; p.y = to.y;
  let result = "moved";
  if (distanceToTarget(p) <= snapTolerance(g.jig)) { p.x = p.tx; p.y = p.ty; p.placed = true; result = "snapped"; }
  if (Math.hypot(from.x - p.x, from.y - p.y) > 0.5 || result === "snapped") g.history.push({ id, from: { x: from.x, y: from.y, placed: false } });
  return result;
}

/* Returns true exactly once: on the drop that places the last piece. */
export function checkComplete(g) {
  if (g.completed || !g.pieces.every((p) => p.placed)) return false;
  g.completed = true;
  return true;
}

export function undo(g) {
  if (g.completed) return null;
  const h = g.history.pop();
  if (!h) return null;
  const p = g.pieces[h.id];
  p.x = h.from.x; p.y = h.from.y; p.placed = h.from.placed;
  return h;
}

export function reset(g) {
  g.initial.forEach((s) => { const p = g.pieces[s.id]; p.x = s.x; p.y = s.y; p.z = s.z; p.placed = false; });
  g.history = []; g.completed = false; g.hintsLeft = HINTS_PER_PUZZLE;
}

/* Hints never block progress: when they run out the player still has the reference image. */
export function takeHint(g, preferId) {
  if (g.hintsLeft <= 0 || g.completed) return null;
  const open = g.pieces.filter((p) => !p.placed);
  if (!open.length) return null;
  const pick = (preferId != null && open.find((p) => p.id === preferId)) || open[Math.floor(g.rnd() * open.length)];
  g.hintsLeft--;
  return pick.id;
}

/* The layout changed (rotated tablet, resized window): move loose pieces, the starting scatter and Undo targets
   to the same relative spot in the new tray. Solved pieces stay on the board. */
export function retray(g, oldRect, newRect) {
  const map = (x, y) => { const f = toFraction(x, y, g.jig, oldRect); return fromFraction(f, g.jig, newRect); };
  g.pieces.forEach((p) => { if (!p.placed) { const m = map(p.x, p.y); p.x = m.x; p.y = m.y; } });
  g.initial.forEach((s) => { const m = map(s.x, s.y); s.x = m.x; s.y = m.y; });
  g.history.forEach((h) => { const m = map(h.from.x, h.from.y); h.from.x = m.x; h.from.y = m.y; });
}
