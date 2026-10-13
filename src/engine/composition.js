import {
  roughBlob, angularPlate, directionalStroke, modularCells,
  goldenSpiralPoints, roughenEdges
} from "./geometry.js";
import { derivePalette, backgroundFor } from "../config/palettes.js";
import { blendFor } from "./effects.js";
import { buildTexture } from "./texture.js";

export function compose(rng, config, features) {
  const size = config.size;
  const archetype = chooseArchetype(features, config.style);
  const palette = derivePalette(features, archetype);
  const background = backgroundFor(features, archetype, palette);
  const texture = buildTexture(config);

  const layers = [];

  if (archetype === "tectonic")      buildTectonic(rng, layers, config, features, palette, size);
  else if (archetype === "field")    buildField(rng, layers, config, features, palette, size);
  else if (archetype === "grid")     buildGrid(rng, layers, config, features, palette, size);
  else                                buildOrganic(rng, layers, config, features, palette, size);

  return {
    archetype,
    size,
    background,
    palette,
    layers,
    texture,
    meta: { layerCount: layers.length }
  };
}

function chooseArchetype(features, forced) {
  if (forced && forced !== "auto") return forced;
  const energy = features.energy ?? 0.5;
  const entropy = features.entropy ?? 0.5;
  const diversity = features.diversity ?? 0.5;
  if (energy > 0.62 && diversity < 0.55) return "tectonic";
  if (energy < 0.42 && entropy > 0.55)   return "field";
  if (entropy > 0.60 && diversity > 0.60) return "grid";
  return "organic";
}

/* ------------------------------ TECTONIC ------------------------------ */
function buildTectonic(rng, layers, config, features, palette, size) {
  const axis = rng.range(-Math.PI / 5, Math.PI / 5) + Math.PI * 0.15;
  const plateCount = 3 + Math.floor(rng.range(0, 2.9));
  const seeds = [];

  for (let i = 0; i < plateCount; i++) {
    const t = i / Math.max(1, plateCount - 1);
    const along = (t - 0.5) * size * 0.75;
    const across = rng.gauss(0, size * 0.12);
    const cx = size / 2 + Math.cos(axis) * along + Math.cos(axis + Math.PI / 2) * across;
    const cy = size / 2 + Math.sin(axis) * along + Math.sin(axis + Math.PI / 2) * across;
    const plateSize = size * (0.45 + rng.range(-0.1, 0.15));
    const pts = angularPlate(rng, cx, cy, plateSize, {
      axis,
      vertices: 5 + Math.floor(rng.range(0, 3)),
      jitter: 0.4 + config.distortion * 0.4
    });
    seeds.push({ cx, cy, pts });
  }

  seeds.forEach((s, i) => {
    const color = palette[i % palette.length];
    layers.push({
      kind: "plate",
      points: s.pts,
      fill: color.css,
      blend: i === 0 ? "multiply" : blendFor(rng, config),
      alpha: 0.85 + rng.range(-0.1, 0.1)
    });
  });

  const strokeCount = 8 + Math.floor(config.complexity * 16);
  for (let i = 0; i < strokeCount; i++) {
    const cx = rng.range(size * 0.05, size * 0.95);
    const cy = rng.range(size * 0.05, size * 0.95);
    const len = size * rng.range(0.1, 0.4);
    const a = axis + rng.gauss(0, 0.5);
    const pts = directionalStroke(rng, cx, cy, len, a, {
      segments: 5 + Math.floor(rng.range(0, 4)),
      curvature: 0.2 + config.roughness * 0.5
    });
    layers.push({
      kind: "stroke",
      points: pts,
      color: palette[palette.length - 1].withAlpha(0.55 + rng.range(-0.2, 0.3)),
      width: size * rng.range(0.0015, 0.004)
    });
  }

  const fragCount = 10 + Math.floor(config.intensity * 20);
  for (let i = 0; i < fragCount; i++) {
    const seed = seeds[Math.floor(rng.next() * seeds.length)];
    const [px, py] = seed.pts[Math.floor(rng.next() * seed.pts.length)];
    const off = rng.range(-size * 0.03, size * 0.03);
    const pts = angularPlate(rng, px + off, py + off, size * rng.range(0.03, 0.09), {
      axis: rng.range(0, Math.PI * 2),
      vertices: 3 + Math.floor(rng.range(0, 3)),
      jitter: 0.5
    });
    layers.push({
      kind: "fragment",
      points: roughenEdges(pts, rng, size * 0.004),
      fill: palette[(i + 1) % palette.length].withAlpha(0.5 + rng.range(0, 0.4)),
      blend: "multiply"
    });
  }
}

/* -------------------------------- FIELD -------------------------------- */
function buildField(rng, layers, config, features, palette, size) {
  const massCount = 6 + Math.floor(rng.range(0, 4));
  const anchor = goldenSpiralPoints(massCount, size / 2, size / 2, size * 0.38);

  anchor.forEach(([cx, cy], i) => {
    const r = size * rng.range(0.18, 0.38);
    const pts = roughBlob(rng, cx, cy, r, {
      points: 18,
      roughness: 0.25 + config.roughness * 0.4,
      irregularity: config.distortion * 0.7,
      squash: 1 + rng.range(-0.15, 0.15)
    });
    layers.push({
      kind: "mass",
      points: pts,
      fill: palette[i % palette.length].withAlpha(0.6 + rng.range(-0.15, 0.2)),
      blend: i < 2 ? "multiply" : "source-over",
      soft: true
    });
  });

  const radiateAnchor = anchor[Math.floor(rng.next() * anchor.length)];
  const radiateCount = 14 + Math.floor(config.density * 22);
  for (let i = 0; i < radiateCount; i++) {
    const a = rng.range(0, Math.PI * 2);
    const len = size * rng.range(0.15, 0.35);
    const pts = directionalStroke(rng, radiateAnchor[0], radiateAnchor[1], len, a, {
      segments: 6, curvature: 0.15
    });
    layers.push({
      kind: "stroke",
      points: pts,
      color: palette[palette.length - 1].withAlpha(0.25 + rng.range(0, 0.25)),
      width: size * rng.range(0.0008, 0.002),
      blend: "multiply"
    });
  }

  const accents = 8 + Math.floor(rng.range(0, 8));
  for (let i = 0; i < accents; i++) {
    layers.push({
      kind: "dot",
      cx: rng.range(size * 0.15, size * 0.85),
      cy: rng.range(size * 0.15, size * 0.85),
      r: size * rng.range(0.015, 0.04),
      fill: palette[0].withAlpha(0.7 + rng.range(-0.2, 0.2)),
      blend: "screen"
    });
  }
}

/* --------------------------------- GRID -------------------------------- */
function buildGrid(rng, layers, config, features, palette, size) {
  const cols = 5 + Math.floor(rng.range(0, 3));
  const rows = cols;
  const cells = modularCells(rng, size, size, cols, rows, 0.05);
  const accent = Math.floor(rng.next() * cells.length);

  cells.forEach((cell, i) => {
    if (i === accent) {
      const pts = roughBlob(rng, cell.cx, cell.cy, size * 0.28, {
        points: 14, roughness: 0.4, irregularity: 0.6
      });
      layers.push({
        kind: "mass",
        points: pts,
        fill: palette[0].withAlpha(0.92),
        blend: "multiply"
      });
      return;
    }

    if (rng.next() < 0.12) {
      const a = rng.range(0, Math.PI * 2);
      const pts = directionalStroke(rng, cell.cx, cell.cy, size * 0.12, a, {
        segments: 3, curvature: 0.3
      });
      layers.push({
        kind: "stroke",
        points: pts,
        color: palette[1].withAlpha(0.8),
        width: size * rng.range(0.003, 0.006)
      });
      return;
    }

    const inset = cell.w * rng.range(0.06, 0.2);
    layers.push({
      kind: "cell",
      x: cell.cx - cell.w / 2 + inset,
      y: cell.cy - cell.h / 2 + inset,
      w: cell.w - inset * 2,
      h: cell.h - inset * 2,
      fill: palette[i % palette.length].withAlpha(0.35 + rng.range(0, 0.4)),
      blend: rng.chance(0.4) ? "multiply" : "source-over",
      hatched: rng.chance(0.25) && config.roughness > 0.3,
      hatchAngle: rng.range(0, Math.PI)
    });
  });
}

/* ------------------------------- ORGANIC ------------------------------- */
function buildOrganic(rng, layers, config, features, palette, size) {
  const anchors = goldenSpiralPoints(5, size / 2, size / 2, size * 0.32);

  anchors.forEach(([cx, cy], i) => {
    const r = size * rng.range(0.12, 0.24);
    const pts = roughBlob(rng, cx, cy, r, {
      points: 16,
      roughness: 0.35 + config.roughness * 0.4,
      irregularity: config.distortion * 0.8,
      squash: 1 + rng.range(-0.25, 0.25)
    });
    layers.push({
      kind: "mass",
      points: pts,
      fill: palette[i % palette.length].withAlpha(0.7 + rng.range(-0.15, 0.2)),
      blend: i % 2 === 0 ? "multiply" : "source-over",
      soft: true
    });

    const kids = 3 + Math.floor(rng.range(0, 4));
    for (let k = 0; k < kids; k++) {
      const a = rng.range(0, Math.PI * 2);
      const d = r * rng.range(0.9, 1.6);
      const kx = cx + Math.cos(a) * d;
      const ky = cy + Math.sin(a) * d;
      const kr = r * rng.range(0.15, 0.4);
      const kpts = roughBlob(rng, kx, ky, kr, {
        points: 12, roughness: 0.5, irregularity: 0.7
      });
      layers.push({
        kind: "mass",
        points: kpts,
        fill: palette[(i + k) % palette.length].withAlpha(0.6 + rng.range(0, 0.3)),
        blend: "multiply",
        soft: true
      });
    }
  });
}