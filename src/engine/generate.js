import { RNG } from "../utils/seededRandom.js";
import { compose } from "./composition.js";
import { applyMappings } from "../config/mappings.js";
import { clampConfig } from "../config/defaults.js";

/**
 * Public entry point.
 * Pure: (profile, userConfig) → composition.
 * Deterministic: same inputs → same output.
 */
export function generate(profile, userConfig) {
  if (!profile) throw new Error("generate(): profile is required");

  const baseConfig = clampConfig(userConfig);
  const config = applyMappings(baseConfig, profile.features ?? {});

  const seedKey = `${config.seed}|${profile.seedSalt ?? ""}|${config.style}`;
  const rng = new RNG(seedKey);

  return compose(rng, config, profile.features ?? {});
}