export function buildTexture(config) {
  const roughness = config.roughness ?? 0.5;
  const density = config.density ?? 0.5;
  const userGrain = config.grain ?? 0.4;

  const amount = Math.min(0.16, (0.02 + userGrain * 0.12) * (0.8 + density * 0.4));

  return {
    grain: {
      amount,
      // Step of the sampling grid — larger = softer, coarser grain.
      step: Math.max(2, Math.round(2 + roughness * 3))
    }
  };
}