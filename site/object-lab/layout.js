/* Object Lab: where the board and the tray sit. Pure maths, no DOM.
   The board always occupies (0, 0) to (W, H) in image units. Wide screens put the tray to its right; narrow screens
   put it underneath. `scale` converts image units to CSS pixels for the container width that was measured. */

export const NARROW_BELOW = 520;

/* Compact on purpose: the board takes most of the frame and the tray is a loose pile beside or under it. */
export function computeLayout(containerW, jig) {
  const { W, H, cols } = jig;
  const narrow = containerW < NARROW_BELOW;
  if (narrow) {
    const gap = 0.04 * H, trayH = H * (0.3 + cols * 0.08);
    const FH = H + gap + trayH;
    return { mode: "narrow", FW: W, FH, scale: containerW / W, tray: { x: 0, y: H + gap, w: W, h: trayH }, bounds: { x: 0, y: 0, w: W, h: FH } };
  }
  const gap = 0.03 * W, trayW = W * (0.46 + cols * 0.03);
  const FW = W + gap + trayW;
  return { mode: "wide", FW, FH: H, scale: containerW / FW, tray: { x: W + gap, y: 0, w: trayW, h: H }, bounds: { x: 0, y: 0, w: FW, h: H } };
}

/* Keep a piece's cell origin inside the playable area (a tab may overhang by `pad * 0.3`). */
export function clampToBounds(x, y, jig, bounds) {
  const slack = jig.pad * 0.3;
  return {
    x: Math.min(Math.max(x, bounds.x - slack), bounds.x + bounds.w - jig.cw + slack),
    y: Math.min(Math.max(y, bounds.y - slack), bounds.y + bounds.h - jig.ch + slack)
  };
}
