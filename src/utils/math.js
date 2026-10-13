export const TAU = Math.PI * 2;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const clamp01 = (v) => clamp(v, 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const mapRange = (v, a, b, c, d) => c + ((v - a) / (b - a || 1)) * (d - c);

// Hue-safe interpolation (shortest path around the circle).
export function mixHue(a, b, t) {
  const d = ((b - a + 540) % 360) - 180;
  return (a + d * t + 360) % 360;
}

// HSL/HSLA → CSS string. Alpha defaults to 1.
export function hsl(h, s, l, a = 1) {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100);
  const ll = clamp(l, 0, 100);
  return a >= 1
    ? `hsl(${hh.toFixed(2)}, ${ss.toFixed(2)}%, ${ll.toFixed(2)}%)`
    : `hsla(${hh.toFixed(2)}, ${ss.toFixed(2)}%, ${ll.toFixed(2)}%, ${a.toFixed(3)})`;
}

export function dedupePoints(points, eps = 0.5) {
  const out = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > eps) out.push(p);
  }
  return out;
}