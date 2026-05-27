<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ versions: string[]; latest?: string }>()

// We display newest-first, but the index stores oldest-first so callers can
// take versions[length-1] for the latest. Reverse a shallow copy.
const ordered = computed(() => [...props.versions].reverse())
</script>

<template>
  <ul v-if="ordered.length" class="versions">
    <li v-for="v in ordered" :key="v">
      <code>{{ v }}</code>
      <span v-if="v === latest" class="chip chip--brand">latest</span>
    </li>
  </ul>
  <p v-else class="muted">No versions declared.</p>
</template>

<style scoped>
.versions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-2);
}
.versions li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg-soft);
}
.versions code { background: transparent; padding: 0; font-size: 12.5px; }
.muted { color: var(--c-text-3); font-size: 14px; margin: 0; }
</style>
