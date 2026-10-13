<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { render } from "../engine/render.js";

const props = defineProps({
  composition: Object,
  busy: Boolean,
  error: String
});

const canvasRef = ref(null);
let observer = null;
let rafId = null;

function draw() {
  const canvas = canvasRef.value;
  if (!canvas || !props.composition) return;
  try {
    const size = props.composition.size;
    if (canvas.width !== size) canvas.width = size;
    if (canvas.height !== size) canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    render(ctx, props.composition, size);
  } catch (e) {
    console.error("[ArtworkCanvas]", e);
  }
}

function scheduleDraw() {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    rafId = null;
    draw();
  });
}

onMounted(async () => {
  await nextTick();
  scheduleDraw();
  if (canvasRef.value) {
    observer = new ResizeObserver(() => {
      // Resize only affects CSS layout; the internal buffer stays constant.
      // No redraw needed on resize. Hook kept for symmetry.
    });
    observer.observe(canvasRef.value);
  }
});

onBeforeUnmount(() => {
  if (rafId != null) cancelAnimationFrame(rafId);
  observer?.disconnect();
  observer = null;
});

watch(() => props.composition, scheduleDraw, { flush: "post" });
</script>

<template>
  <div class="artwork-frame">
    <canvas ref="canvasRef" aria-label="Generated abstract music artwork"></canvas>
    <div v-if="busy" class="overlay">Generating…</div>
    <div v-if="error" class="overlay error">{{ error }}</div>
  </div>
</template>

<style scoped>
.artwork-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #0a0a0a;
  border: 1px solid var(--line);
  overflow: hidden;
}
.artwork-frame canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: auto;
}
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  color: var(--paper);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.overlay.error { color: #ff8f8f; background: rgba(0, 0, 0, 0.78); }
</style>