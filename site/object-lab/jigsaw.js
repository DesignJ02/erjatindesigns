/* Object Lab: jigsaw geometry.
   Builds a grid of genuinely interlocking pieces from one seed. Every interior edge is generated once, in a fixed
   direction, and both neighbours trace that same curve (one forwards, one reversed), so edges match exactly.
   All coordinates are in image units (the board is W x H); the renderer scales them.
   The tab shape is a three-segment cubic curve with a pinched neck and a few percent of random jitter per edge. */

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n) => Math.round(n * 100) / 100;

/* Ten points: start, then three cubic segments (c1, c2, end) x 3. (x0,y0)->(x1,y1) is the edge, (nx,ny) its unit normal. */
function tabEdge(x0, y0, x1, y1, nx, ny, rnd) {
  const L = Math.hypot(x1 - x0, y1 - y0);
  const dir = rnd() < 0.5 ? -1 : 1;
  const j = () => (rnd() * 2 - 1) * 0.04;
  const t = 0.1, a = j(), b = j(), c = j(), d = j(), e = j();
  const P = (l, w) => [r2(x0 + (x1 - x0) * l + nx * w * L * dir), r2(y0 + (y1 - y0) * l + ny * w * L * dir)];
  return [
    P(0, 0),
    P(0.2, a), P(0.5 + b + d, -t + c), P(0.5 - t + b, t + c),
    P(0.5 - 2 * t + b - d, 3 * t + c), P(0.5 + 2 * t + b - d, 3 * t + c), P(0.5 + t + b, t + c),
    P(0.5 + b + d, -t + c), P(0.8, e), P(1, 0)
  ];
}

const straight = (x0, y0, x1, y1) => [[r2(x0), r2(y0)], [r2(x1), r2(y1)]];

function pathFrom(edges) {
  let d = "M" + edges[0][0][0] + " " + edges[0][0][1];
  edges.forEach((pts) => {
    if (pts.length === 2) d += "L" + pts[1][0] + " " + pts[1][1];
    else for (let k = 1; k < pts.length; k += 3) d += "C" + pts[k].join(" ") + " " + pts[k + 1].join(" ") + " " + pts[k + 2].join(" ");
  });
  return d + "Z";
}

/* cols x rows jigsaw of a W x H image. Deterministic for a given seed. */
export function buildJigsaw({ cols, rows, W, H, seed }) {
  const rnd = mulberry32(typeof seed === "string" ? hashSeed(seed) : seed);
  const cw = W / cols, ch = H / rows;
  const hEdge = [], vEdge = [];
  for (let r = 0; r <= rows; r++) {                       /* hEdge[r][c]: along y = r*ch, left to right */
    hEdge[r] = [];
    for (let c = 0; c < cols; c++) {
      hEdge[r][c] = r === 0 || r === rows ? straight(c * cw, r * ch, (c + 1) * cw, r * ch) : tabEdge(c * cw, r * ch, (c + 1) * cw, r * ch, 0, 1, rnd);
    }
  }
  for (let r = 0; r < rows; r++) {                        /* vEdge[r][c]: along x = c*cw, top to bottom */
    vEdge[r] = [];
    for (let c = 0; c <= cols; c++) {
      vEdge[r][c] = c === 0 || c === cols ? straight(c * cw, r * ch, c * cw, (r + 1) * ch) : tabEdge(c * cw, r * ch, c * cw, (r + 1) * ch, 1, 0, rnd);
    }
  }
  const rev = (pts) => pts.slice().reverse();
  const pad = Math.round(0.36 * Math.max(cw, ch));        /* room for a tab sticking out of a cell */
  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const edges = { top: hEdge[r][c], right: vEdge[r][c + 1], bottom: rev(hEdge[r + 1][c]), left: rev(vEdge[r][c]) };
      pieces.push({
        id: r * cols + c, r, c,
        x: c * cw, y: r * ch,                             /* where this piece belongs: its cell origin */
        edges,
        path: pathFrom([edges.top, edges.right, edges.bottom, edges.left])
      });
    }
  }
  return { cols, rows, W, H, cw, ch, pad, pieces, count: cols * rows };
}
