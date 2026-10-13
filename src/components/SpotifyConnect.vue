<script setup>
defineProps({
  connected: Boolean,
  displayName: String,
  loading: Boolean,
  error: String,
  configured: Boolean
});
defineEmits(["connect", "disconnect", "analyze", "sample"]);
</script>

<template>
  <section class="spotify-panel">
    <div>
      <p class="eyebrow">YOUR LISTENING DATA</p>
      <h2 v-if="connected">{{ displayName || "Spotify connected" }}</h2>
      <h2 v-else>Music, translated</h2>
      <p class="muted">
        {{ connected
          ? "Using your available Spotify listening history."
          : "Connect Spotify or explore with sample data." }}
      </p>
    </div>

    <div class="button-row">
      <button v-if="!connected" :disabled="loading || !configured" @click="$emit('connect')">
        {{ loading ? "Connecting…" : "Connect Spotify" }}
      </button>
      <button v-else class="secondary" @click="$emit('disconnect')">Disconnect</button>

      <button v-if="connected" class="secondary" :disabled="loading" @click="$emit('analyze')">
        {{ loading ? "Analyzing…" : "Analyze again" }}
      </button>
      <button class="secondary" @click="$emit('sample')">Use sample data</button>
    </div>

    <p v-if="!configured" class="hint">
      Spotify client ID is not set. Add <code>VITE_SPOTIFY_CLIENT_ID</code> to
      <code>.env</code>, or use the sample profile above.
    </p>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<style scoped>
.spotify-panel {
  border: 1px solid var(--line);
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  margin-bottom: 45px;
}
.spotify-panel h2 { margin: 10px 0; font-size: 19px; font-weight: 500; }
.spotify-panel p { margin: 0; }
.button-row { display: flex; flex-wrap: wrap; gap: 8px; }
.hint { color: var(--muted); font-size: 11px; margin-top: 12px !important; }
.hint code { background: #1a1a1a; padding: 1px 5px; border-radius: 3px; }
.error { color: #ff8f8f; font-size: 12px; margin-top: 8px !important; }

@media (max-width: 850px) {
  .spotify-panel { flex-direction: column; align-items: flex-start; }
}
</style>