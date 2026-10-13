import { reactive, ref, watch } from "vue";
import { generate } from "../engine/generate.js";
import { render } from "../engine/render.js";
import { extractMusicProfile } from "../analysis/feature-extraction.js";
import { DEFAULTS } from "../config/defaults.js";

export function useArtwork() {
  const profile = ref(null);        // analyzed MusicProfile
  const rawData = ref(null);        // original input (sample or Spotify)
  const composition = ref(null);
  const generating = ref(false);
  const error = ref("");

  const config = reactive({ ...DEFAULTS });

  let debounceTimer = null;

  function doGenerate() {
    if (!profile.value) return;
    generating.value = true;
    error.value = "";
    // Defer so the spinner can paint.
    requestAnimationFrame(() => {
      try {
        composition.value = generate(profile.value, { ...config });
      } catch (e) {
        console.error(e);
        error.value = e.message || "Generation failed.";
      } finally {
        generating.value = false;
      }
    });
  }

  function setProfile(data) {
    rawData.value = data;
    try {
      profile.value = extractMusicProfile(data);
    } catch (e) {
      console.error(e);
      error.value = e.message || "Profile analysis failed.";
      return;
    }
    doGenerate();
  }

  function randomizeSeed() {
    config.seed = Math.floor(Math.random() * 100000);
    doGenerate();
  }

  // Regenerate on any config change, debounced.
  watch(config, () => {
    if (!profile.value) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doGenerate, 120);
  });

  return {
    profile,
    rawData,
    composition,
    config,
    generating,
    error,
    setProfile,
    generate: doGenerate,
    randomizeSeed,
    render
  };
}