import { clamp01 } from "../utils/math.js";

// Music feature → bias on the visual config.
// Values are artistic design rules, not psychological claims.
const MAPPINGS = {
  energy:          { target: "intensity",    weight: 0.35 },
  danceability:    { target: "regularity",   weight: 0.30 },
  acousticness:    { target: "organicBias",  weight: 0.30 },
  valence:         { target: "temperature",  weight: 0.25 },
  genreDiversity:  { target: "colorFamilies",weight: 0.20 },
  artistConcentration: { target: "repetition", weight: 0.25 },
};

// Given extracted features + user config, return a config with mild biases applied.
export function applyMappings(config, features = {}) {
  const out = { ...config };
  const bias = (value, weight) =>
    value == null ? 0 : (clamp01(value) - 0.5) * 2 * weight;

  out.intensity   = clamp01((out.intensity ?? 0.5)   + bias(features.energy, MAPPINGS.energy.weight));
  out.distortion  = clamp01((out.distortion ?? 0.5)  + bias(features.energy, MAPPINGS.energy.weight) * 0.7);
  out.roughness   = clamp01((out.roughness ?? 0.5)   + bias(features.energy, MAPPINGS.energy.weight) * 0.6);
  out.density     = clamp01((out.density ?? 0.5)     + bias(features.danceability, MAPPINGS.danceability.weight));
  out.contrast    = clamp01((out.contrast ?? 0.5)    + bias(features.energy, 0.3));

  // Not surfaced as sliders, but consumed by the engine:
  out.temperature    = bias(features.valence, MAPPINGS.valence.weight);          // -0.5..0.5
  out.organicBias    = bias(features.acousticness, MAPPINGS.acousticness.weight); // -0.3..0.3
  out.regularity     = clamp01(0.5 + bias(features.danceability, MAPPINGS.danceability.weight));
  out.colorFamilies  = 2 + Math.round(bias(features.genreDiversity, MAPPINGS.genreDiversity.weight) * 3);
  out.repetition     = clamp01(0.4 + bias(features.artistConcentration, MAPPINGS.artistConcentration.weight));

  return out;
}