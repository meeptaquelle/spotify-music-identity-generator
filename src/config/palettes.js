import { hsl } from "../utils/math.js";

// Build a palette from a profile + archetype. Not hardcoded swatches.
export function derivePalette(features, archetype) {
  const dH = features.dominantGenreHue ?? 220;
  const sH = features.secondaryGenreHue ?? (dH + 40) % 360;
  const temp = features.temperature ?? 0;      // -0.5..0.5
  const energy = features.energy ?? 0.5;
  const acousticness = features.acousticness ?? 0.4;

  const shift = (h) => (h + temp * 25 + 360) % 360;

  const families = {
    tectonic: [
      { h: shift(dH),                  s: 68 + energy * 20, l: 26, w: 0.42 },
      { h: shift((dH + 30) % 360),     s: 45,               l: 18, w: 0.28 },
      { h: shift(sH),                  s: 30,               l: 55, w: 0.20 },
      { h: shift((dH + 180) % 360),    s: 55,               l: 40, w: 0.10 }
    ],
    field: [
      { h: shift(dH),                  s: 30 + acousticness * 25, l: 74, w: 0.40 },
      { h: shift((dH + 20) % 360),     s: 40,                     l: 62, w: 0.28 },
      { h: shift((dH - 30 + 360) % 360), s: 22,                   l: 86, w: 0.20 },
      { h: shift(sH),                  s: 35,                     l: 52, w: 0.12 }
    ],
    grid: [
      { h: shift(dH),                  s: 82,               l: 45, w: 0.38 },
      { h: shift((dH + 60) % 360),     s: 72,               l: 55, w: 0.28 },
      { h: shift(sH),                  s: 60,               l: 38, w: 0.22 },
      { h: shift((dH + 300) % 360),    s: 40,               l: 78, w: 0.12 }
    ],
    organic: [
      { h: shift(dH),                  s: 42,               l: 44, w: 0.36 },
      { h: shift((dH + 25) % 360),     s: 30,               l: 60, w: 0.28 },
      { h: shift(sH),                  s: 50,               l: 34, w: 0.22 },
      { h: shift((dH - 40 + 360) % 360), s: 22,             l: 78, w: 0.14 }
    ]
  };

  const family = families[archetype] ?? families.organic;
  return family.map((c) => ({
    ...c,
    css: hsl(c.h, c.s, c.l, 1),
    withAlpha: (a) => hsl(c.h, c.s, c.l, a)
  }));
}

export function backgroundFor(features, archetype, palette) {
  const temp = features.temperature ?? 0;
  const light = archetype === "field" ? 90
              : archetype === "tectonic" ? 10
              : 18;
  const h = (palette[0]?.h ?? 220) + temp * 10;
  return hsl(h, 12, light, 1);
}