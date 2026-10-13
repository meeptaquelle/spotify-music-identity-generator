<script setup>
import { computed, onMounted, ref } from "vue";
import SpotifyConnect from "../components/SpotifyConnect.vue";
import GenerationControls from "../components/GenerationControls.vue";
import ArtworkCanvas from "../components/ArtworkCanvas.vue";
import ArtworkMetadata from "../components/ArtworkMetadata.vue";
import ExportActions from "../components/ExportActions.vue";
import { useSpotify } from "../composables/useSpotify.js";
import { useArtwork } from "../composables/useArtwork.js";
import { buildSampleProfile } from "../services/spotify/sample.js";

const spotify = useSpotify();
const art = useArtwork();

const notice = ref("");
const errorMessage = computed(() => spotify.error.value || art.error.value);

function useSample() {
  art.setProfile(buildSampleProfile());
  notice.value = "Sample profile loaded. Connect Spotify to use your listening data.";
}

async function analyzeSpotify() {
  notice.value = "";
  try {
    const data = await spotify.loadProfile();
    art.setProfile(data);
    notice.value = "Artwork generated from available Spotify metadata.";
  } catch {
    /* spotify.error.value already holds the message */
  }
}

onMounted(async () => {
  const handled = await spotify.handleCallback();
  if (handled) await analyzeSpotify();
  else useSample();
});
</script>

<template>
  <main class="site-shell">
    <header class="topbar">
      <a class="wordmark" href="#" aria-label="Music Identity Generator home">
        <span class="wordmark-mark">M/</span>
        <span>MUSIC IDENTITY</span>
      </a>
      <span class="topbar-note">GENERATIVE ART EXPERIMENT / 001</span>
    </header>

    <section class="intro">
      <p class="eyebrow">YOUR LISTENING HABITS, REINTERPRETED</p>
      <h1>A portrait of<br /><em>your music taste.</em></h1>
      <p class="intro-copy">
        An abstract composition generated from the patterns, contrasts, and repetitions
        in your listening data.
      </p>
    </section>

    <SpotifyConnect
      :connected="spotify.connected.value"
      :display-name="spotify.displayName.value"
      :loading="spotify.loading.value"
      :error="spotify.error.value"
      :configured="spotify.isConfigured"
      @connect="spotify.connect"
      @disconnect="spotify.disconnect"
      @analyze="analyzeSpotify"
      @sample="useSample"
    />

    <p v-if="notice" class="notice-line">{{ notice }}</p>

    <section class="workspace">
      <div class="art-column">
        <div class="artwork-topline">
          <span class="eyebrow">GENERATED COMPOSITION</span>
          <span class="seed-label">SEED / {{ art.config.seed }}</span>
        </div>

        <ArtworkCanvas
          :composition="art.composition.value"
          :busy="art.generating.value"
          :error="art.error.value"
        />

        <ArtworkMetadata :profile="art.profile.value" :config="art.config" />

        <ExportActions :composition="art.composition.value" :config="art.config" />
      </div>

      <aside class="controls-column">
        <GenerationControls
          :config="art.config"
          :generating="art.generating.value"
          @generate="art.generate"
          @randomize="art.randomizeSeed"
        />

        <div class="method-note">
          <p class="eyebrow">HOW IT WORKS</p>
          <p>
            Music metadata informs the palette, visual density, geometry, and surface
            treatment. The artwork is generated locally in your browser.
          </p>
          <p class="muted">
            Audio features may be unavailable to some Spotify applications. Missing data
            is not treated as measured data.
          </p>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </aside>
    </section>

    <footer class="footer">
      <span>NO DATABASE. NO UPLOADED ARTWORK. JUST DATA AND ALGORITHMS.</span>
      <span>VUE 3 / CANVAS 2D</span>
    </footer>
  </main>
</template>