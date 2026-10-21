/* Run with:  node --test site/object-lab/ */
import test from "node:test";
import assert from "node:assert/strict";
import { buildJigsaw } from "./jigsaw.js";
import { createGame, drop, undo, reset, checkComplete, takeHint, placedCount, snapTolerance, retray, HINTS_PER_PUZZLE } from "./game.js";
import { computeLayout, clampToBounds } from "./layout.js";
import { PUZZLES, DIFFICULTIES, IMAGE_W, IMAGE_H, byId } from "./data.js";

const jig = (n = 4, seed = "radio") => buildJigsaw({ cols: n, rows: n, W: IMAGE_W, H: IMAGE_H, seed });
const tray = (j) => computeLayout(1200, j).tray;

test("each difficulty makes the right number of pieces", () => {
  Object.values(DIFFICULTIES).forEach((d) => assert.equal(buildJigsaw({ cols: d.cols, rows: d.rows, W: IMAGE_W, H: IMAGE_H, seed: "x" }).pieces.length, d.pieces));
});

test("geometry is deterministic for a seed and differs between seeds", () => {
  assert.deepEqual(jig(4, "a").pieces.map((p) => p.path), jig(4, "a").pieces.map((p) => p.path));
  assert.notDeepEqual(jig(4, "a").pieces.map((p) => p.path), jig(4, "b").pieces.map((p) => p.path));
});

test("neighbouring edges are the same curve traced in opposite directions", () => {
  const j = jig(5, "flange");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const p = j.pieces[r * 5 + c];
    if (c < 4) assert.deepEqual(p.edges.right, j.pieces[r * 5 + c + 1].edges.left.slice().reverse());
    if (r < 4) assert.deepEqual(p.edges.bottom, j.pieces[(r + 1) * 5 + c].edges.top.slice().reverse());
  }
});

test("a piece's edges join up end to end and border edges are straight", () => {
  const j = jig(3);
  j.pieces.forEach((p) => {
    const e = p.edges, last = (a) => a[a.length - 1];
    assert.deepEqual(last(e.top), e.right[0]); assert.deepEqual(last(e.right), e.bottom[0]);
    assert.deepEqual(last(e.bottom), e.left[0]); assert.deepEqual(last(e.left), e.top[0]);
    if (p.r === 0) assert.equal(e.top.length, 2);
    if (p.c === j.cols - 1) assert.equal(e.right.length, 2);
  });
});

test("every piece's cell origins tile the image exactly (so crops rebuild the photo)", () => {
  const j = jig(5);
  const xs = new Set(j.pieces.map((p) => p.x)), ys = new Set(j.pieces.map((p) => p.y));
  assert.equal(xs.size, 5); assert.equal(ys.size, 5);
  assert.ok(Math.abs(j.cw * 5 - IMAGE_W) < 1e-9 && Math.abs(j.ch * 5 - IMAGE_H) < 1e-9);
  j.pieces.forEach((p) => assert.ok(p.path.startsWith("M") && p.path.endsWith("Z")));
});

test("pieces snap only when close, and stay movable otherwise", () => {
  const j = jig(3), g = createGame(j, tray(j), "radio");
  const p = g.pieces[4], tol = snapTolerance(j);
  const far = drop(g, 4, { x: p.x, y: p.y }, { x: p.tx + tol * 1.5, y: p.ty });
  assert.equal(far, "moved"); assert.equal(g.pieces[4].placed, false);
  const near = drop(g, 4, { x: g.pieces[4].x, y: g.pieces[4].y }, { x: p.tx + tol * 0.5, y: p.ty - tol * 0.5 });
  assert.equal(near, "snapped"); assert.equal(g.pieces[4].placed, true);
  assert.equal(g.pieces[4].x, p.tx); assert.equal(g.pieces[4].y, p.ty);
  assert.equal(drop(g, 4, { x: 0, y: 0 }, { x: 0, y: 0 }), "ignored", "a placed piece is locked");
});

test("undo reverses the latest move or placement; reset restores the original scatter", () => {
  const j = jig(3), g = createGame(j, tray(j), "camera");
  const start = g.pieces.map((p) => [p.x, p.y]);
  const a = g.pieces[0], b = g.pieces[1];
  drop(g, 0, { x: a.x, y: a.y }, { x: a.x + 40, y: a.y + 40 });
  drop(g, 1, { x: b.x, y: b.y }, { x: b.tx, y: b.ty });
  assert.equal(placedCount(g), 1);
  undo(g); assert.equal(placedCount(g), 0); assert.deepEqual([g.pieces[1].x, g.pieces[1].y], start[1]);
  undo(g); assert.deepEqual([g.pieces[0].x, g.pieces[0].y], start[0]);
  assert.equal(undo(g), null);
  drop(g, 0, { x: a.x, y: a.y }, { x: a.tx, y: a.ty });
  reset(g);
  assert.deepEqual(g.pieces.map((p) => [p.x, p.y]), start); assert.equal(placedCount(g), 0); assert.equal(g.history.length, 0);
});

test("completion fires exactly once, on the last placement, and not before", () => {
  const j = jig(3), g = createGame(j, tray(j), "controller");
  let fired = 0;
  g.pieces.forEach((p, i) => {
    assert.equal(checkComplete(g), false);
    drop(g, i, { x: p.x, y: p.y }, { x: p.tx, y: p.ty });
    if (checkComplete(g)) fired++;
  });
  assert.equal(fired, 1); assert.equal(checkComplete(g), false); assert.equal(g.completed, true);
  assert.equal(undo(g), null, "undo is off once solved");
  reset(g); assert.equal(g.completed, false);
});

test("hints are limited, only pick unsolved pieces, and never change the board", () => {
  const j = jig(3), g = createGame(j, tray(j), "flange");
  const before = JSON.stringify(g.pieces);
  const seen = [];
  for (let i = 0; i < HINTS_PER_PUZZLE; i++) seen.push(takeHint(g));
  assert.ok(seen.every((id) => typeof id === "number"));
  assert.equal(takeHint(g), null);
  assert.equal(JSON.stringify(g.pieces), before);
  assert.equal(takeHint(createGame(j, tray(j), "z"), 99) === null, false, "an unknown preferred id falls back to a random open piece");
});

test("layout: wide puts the tray beside the board, narrow puts it below, and nothing overlaps", () => {
  const j = jig(4);
  const w = computeLayout(1200, j), n = computeLayout(390, j);
  assert.equal(w.mode, "wide"); assert.ok(w.tray.x >= j.W);
  assert.equal(n.mode, "narrow"); assert.ok(n.tray.y >= j.H);
  assert.ok(Math.abs(w.FW * w.scale - 1200) < 1e-6 && Math.abs(n.FW * n.scale - 390) < 1e-6);
  const c = clampToBounds(-9999, 99999, j, n.bounds);
  assert.ok(c.x >= -j.pad && c.y <= n.bounds.y + n.bounds.h);
});

test("changing layout keeps loose pieces inside the new tray and solved pieces on the board", () => {
  const j = jig(4), wide = computeLayout(1200, j), narrow = computeLayout(390, j);
  const g = createGame(j, wide.tray, "radio");
  const p0 = g.pieces[0]; drop(g, 0, { x: p0.x, y: p0.y }, { x: p0.tx, y: p0.ty });
  retray(g, wide.tray, narrow.tray);
  assert.equal(g.pieces[0].x, p0.tx);
  g.pieces.slice(1).forEach((p) => { assert.ok(p.x >= narrow.tray.x - 1 && p.x + j.cw <= narrow.tray.x + narrow.tray.w + 1); assert.ok(p.y >= narrow.tray.y - 1 && p.y + j.ch <= narrow.tray.y + narrow.tray.h + 1); });
});

test("puzzle config is complete: four objects, each with image, fact, why and source", () => {
  assert.equal(PUZZLES.length, 4);
  PUZZLES.forEach((p) => { ["name", "image", "alt", "principle", "insight"].forEach((k) => assert.ok(p[k], p.id + "." + k)); assert.ok(p.source.href.startsWith("https://")); assert.ok(p.credit.license); });
  assert.equal(byId("flange").name, "Mechanical Flange");
});
