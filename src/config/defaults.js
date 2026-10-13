export const DEFAULTS = {
  // Canonical internal render size. All composition geometry is generated
  // against this; exports scale up via ctx.scale().
  size: 1200,

  seed: 12345,

  // 'auto' | 'tectonic' | 'field' | 'grid' | 'organic'
  style: "auto",

  // 0..1 sliders
  complexity: 0.6,
  intensity: 0.55,
  density: 0.55,
  roughness: 0.4,
  distortion: 0.45,
  colorVariation: 0.5,
  contrast: 0.55,
  negativeSpace: 0.3,
  grain: 0.4
};

export function clampConfig(config) {
  const c = { ...config };
  const bounded = [
    "complexity", "intensity", "density", "roughness", "distortion",
    "colorVariation", "contrast", "negativeSpace", "grain"
  ];
  for (const k of bounded) {
    const v = Number(c[k]);
    c[k] = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.5;
  }
  c.seed = Number.isFinite(Number(c.seed)) ? (Number(c.seed) | 0) : 12345;
  return c;
}