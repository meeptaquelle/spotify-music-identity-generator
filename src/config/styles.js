// Style presets override the sliders when selected. `auto` uses the profile.
export const STYLES = {
  auto:      { label: "Auto (from profile)" },
  tectonic:  { label: "Tectonic",  intensity: 0.85, complexity: 0.65, roughness: 0.5,  distortion: 0.6 },
  field:     { label: "Field",     intensity: 0.25, complexity: 0.55, roughness: 0.25, distortion: 0.3 },
  grid:      { label: "Grid",      intensity: 0.7,  complexity: 0.7,  roughness: 0.35, distortion: 0.4 },
  organic:   { label: "Organic",   intensity: 0.45, complexity: 0.6,  roughness: 0.4,  distortion: 0.55 }
};

export const STYLE_LIST = Object.entries(STYLES).map(([id, s]) => ({ id, ...s }));