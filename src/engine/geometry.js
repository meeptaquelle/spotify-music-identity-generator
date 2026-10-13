import { TAU } from "../utils/math.js";

export function roughBlob(rng, cx, cy, radius, opts = {}) {
  const {
    points = 14,
    roughness = 0.4,
    irregularity = 0.6,
    squash = 1,
    basePhase = rng.range(0, TAU)
  } = opts;

  const f1 = 2 + Math.floor(rng.range(0, 3));
  const f2 = 4 + Math.floor(rng.range(0, 5));
  const n1 = (a) => Math.sin(a * f1 + basePhase) * radius * roughness * 0.32;
  const n2 = (a) => Math.sin(a * f2 + basePhase * 1.7) * radius * roughness * 0.18 * irregularity;

  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * TAU + basePhase;
    const r = radius + n1(a) + n2(a) + rng.gauss(0, radius * 0.02 * irregularity);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash]);
  }
  return pts;
}

export function angularPlate(rng, cx, cy, size, opts = {}) {
  const { axis = rng.range(0, TAU), vertices = 6, jitter = 0.35 } = opts;
  const perp = axis + Math.PI / 2;
  const pts = [];
  for (let i = 0; i < vertices; i++) {
    const t = i / vertices;
    const along = (t - 0.5) * size;
    const across = rng.gauss(0, size * jitter * 0.5);
    pts.push([
      cx + Math.cos(axis) * along + Math.cos(perp) * across,
      cy + Math.sin(axis) * along + Math.sin(perp) * across
    ]);
  }
  return pts;
}

export function directionalStroke(rng, cx, cy, length, angle, opts = {}) {
  const { segments = 7, curvature = 0.5 } = opts;
  const pts = [];
  let a = angle, x = cx, y = cy;
  const step = length / segments;
  for (let i = 0; i <= segments; i++) {
    pts.push([x, y]);
    a += rng.gauss(0, curvature * 0.5);
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
  }
  return pts;
}

export function modularCells(rng, width, height, cols, rows, jitter = 0.06) {
  const cells = [];
  const cw = width / cols;
  const ch = height / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells.push({
        cx: (x + 0.5) * cw + rng.gauss(0, jitter * cw),
        cy: (y + 0.5) * ch + rng.gauss(0, jitter * ch),
        w: cw, h: ch
      });
    }
  }
  return cells;
}

export function goldenSpiralPoints(count, cx, cy, maxR) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const r = Math.sqrt(t) * maxR;
    const a = i * phi;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

export function roughenEdges(points, rng, amount) {
  return points.map(([x, y]) => [x + rng.gauss(0, amount), y + rng.gauss(0, amount)]);
}