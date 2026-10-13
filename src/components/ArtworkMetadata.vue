<script setup>
import { computed } from "vue";

const props = defineProps({
  profile: Object,
  config: Object
});

const description = computed(() => {
  const f = props.profile?.features;
  if (!f) return "";
  const topGenre = props.profile.genreDistribution?.[0]?.genre || "mixed";
  const parts = [
    `Dominant ${topGenre} palette`,
    f.artistConcentration > 0.6 ? "high artist concentration" : "broad artist spread",
    f.trackDiversity > 0.8 ? "wide track diversity" : "moderate structural complexity"
  ];
  return parts.join(", ") + ".";
});

const unavailableText = computed(() => {
  const u = props.profile?.unavailable ?? [];
  if (!u.length) return "";
  return `Unavailable data: ${u.join(", ")}`;
});
</script>

<template>
  <section class="metadata">
    <div class="desc" v-if="description">{{ description }}</div>
    <div class="grid">
      <div><span>TRACKS</span><strong>{{ profile?.tracksCount ?? "—" }}</strong></div>
      <div><span>ARTISTS</span><strong>{{ profile?.artistsCount ?? "—" }}</strong></div>
      <div><span>GENRES</span><strong>{{ profile?.genreDistribution?.length ?? "—" }}</strong></div>
      <div><span>ARCHETYPE</span><strong>{{ profile?.features ? "auto" : "—" }}</strong></div>
      <div><span>SEED</span><strong>{{ config?.seed ?? "—" }}</strong></div>
    </div>
    <p v-if="unavailableText" class="unavailable">{{ unavailableText }}</p>
  </section>
</template>

<style scoped>
.metadata {
  border-bottom: 1px solid var(--line);
  padding: 20px 0;
  font-size: 12px;
}
.desc { color: var(--paper); margin-bottom: 16px; }
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.grid div { display: flex; flex-direction: column; gap: 8px; }
.grid span {
  font-family: "DM Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.13em;
  color: var(--muted);
}
.grid strong { font-size: 16px; font-weight: 500; }
.unavailable {
  color: var(--muted);
  font-size: 11px;
  margin-top: 16px;
}
@media (max-width: 480px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}
</style>