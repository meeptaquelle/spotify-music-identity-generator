<script setup>
import { ref } from "vue";
import { downloadSquare } from "../export/png.js";
import { downloadStory } from "../export/instagramStory.js";
import { canShareFiles, shareFile } from "../export/share.js";

const props = defineProps({
  composition: Object,
  config: Object
});

const busy = ref(false);
const error = ref("");

async function downloadArtwork() {
  if (!props.composition) return;
  busy.value = true; error.value = "";
  try {
    await downloadSquare(props.composition, `music-identity-${props.config?.seed ?? "seed"}.png`);
  } catch (e) { error.value = e.message; }
  finally { busy.value = false; }
}

async function downloadStoryImage() {
  if (!props.composition) return;
  busy.value = true; error.value = "";
  try {
    await downloadStory(props.composition, {
      seed: props.config?.seed,
      profile: props.profile
    });
  } catch (e) { error.value = e.message; }
  finally { busy.value = false; }
}

async function shareStory() {
  if (!props.composition) return;
  busy.value = true; error.value = "";
  try {
    const blob = await exportStoryBlob();
    const file = new File([blob], `music-identity-story-${props.config?.seed}.png`, { type: "image/png" });
    await shareFile(file, { title: "My Music Identity" });
  } catch (e) { error.value = e.message; }
  finally { busy.value = false; }
}

// Local helper to avoid circular import mess
async function exportStoryBlob() {
  const mod = await import("../export/instagramStory.js");
  return mod.storyBlob(props.composition, { seed: props.config?.seed });
}
</script>

<template>
  <section class="export-actions">
    <button :disabled="busy || !composition" @click="downloadArtwork">Download artwork</button>
    <button class="secondary" :disabled="busy || !composition" @click="downloadStoryImage">
      Instagram Story format
    </button>
    <button
      v-if="canShareFiles()"
      class="secondary"
      :disabled="busy || !composition"
      @click="shareStory"
    >Share…</button>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<style scoped>
.export-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.error { width: 100%; color: #ff8f8f; font-size: 12px; margin-top: 6px; }
@media (max-width: 480px) {
  .export-actions button { flex: 1 1 100%; }
}
</style>