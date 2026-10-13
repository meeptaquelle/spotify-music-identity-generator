<script setup>
import { STYLE_LIST } from "../config/styles.js";

defineProps({
  config: { type: Object, required: true },
  generating: Boolean
});
defineEmits(["generate", "randomize"]);

const sliders = [
  ["complexity", "Complexity"],
  ["intensity", "Intensity"],
  ["density", "Density"],
  ["roughness", "Roughness"],
  ["distortion", "Distortion"],
  ["colorVariation", "Color variation"],
  ["contrast", "Contrast"],
  ["negativeSpace", "Negative space"],
  ["grain", "Grain"]
];
</script>

<template>
  <section class="controls">
    <div class="section-heading">
      <p class="eyebrow">COMPOSITION</p>
      <button class="secondary small" :disabled="generating" @click="$emit('generate')">
        {{ generating ? "…" : "Regenerate" }}
      </button>
    </div>

    <label class="field">
      <span>Style</span>
      <select v-model="config.style">
        <option v-for="s in STYLE_LIST" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>
    </label>

    <label v-for="[key, label] in sliders" :key="key" class="field">
      <span>
        <span>{{ label }}</span>
        <strong>{{ Math.round((config[key] ?? 0) * 100) }}%</strong>
      </span>
      <input
        type="range" min="0" max="1" step="0.01"
        v-model.number="config[key]"
      />
    </label>

    <div class="row">
      <label class="field grow">
        <span>Seed</span>
        <input type="number" v-model.number="config.seed" />
      </label>
      <button class="secondary small" @click="$emit('randomize')">↻</button>
    </div>
  </section>
</template>

<style scoped>
.controls { border: 1px solid var(--line); padding: 22px; }
.section-heading {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.field { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; font-size: 12px; }
.field > span {
  display: flex; justify-content: space-between; align-items: baseline;
  color: var(--muted); letter-spacing: 0.05em;
}
.field strong { font-family: "DM Mono", monospace; font-weight: 400; color: var(--paper); }
input[type="range"] { width: 100%; accent-color: var(--accent); }
select, input[type="number"] {
  width: 100%; background: #191919; color: var(--paper);
  border: 1px solid var(--line); padding: 10px; font: inherit;
}
.small { padding: 8px 12px; font-size: 11px; }
.row { display: flex; gap: 8px; align-items: flex-end; margin-top: 16px; }
.grow { flex: 1; margin: 0; }
</style>