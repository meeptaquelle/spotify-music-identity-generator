// Blend mode selection consistent with intensity. Used by composition.js.
export function blendFor(rng, config) {
  if (config.intensity > 0.7 && rng.chance(0.55)) return "multiply";
  if (config.intensity < 0.35) return "source-over";
  return rng.chance(0.35) ? "multiply" : "source-over";
}