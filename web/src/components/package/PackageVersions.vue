<script setup lang="ts">
import { computed } from 'vue'
import CollapsibleList from '../ui/CollapsibleList.vue'

const props = defineProps<{ versions: string[]; latest?: string }>()

// We display newest-first, but the index stores oldest-first so callers can
// take versions[length-1] for the latest. Reverse a shallow copy.
const ordered = computed(() => [...(Array.isArray(props.versions) ? props.versions : [])].reverse())
</script>

<template>
  <CollapsibleList v-if="ordered.length" :count="ordered.length" :limit="8" :reset-key="versions" label="versions" v-slot="{ visibleCount }">
  <ul class="versions">
    <li v-for="v in ordered.slice(0, visibleCount)" :key="v">
      <code>{{ v }}</code>
      <span v-if="v === latest" class="chip chip--brand">latest</span>
    </li>
  </ul>
  </CollapsibleList>
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
.versions li { min-width: 0; flex-wrap: wrap; }
.versions code { overflow-wrap: anywhere; background: transparent; padding: 0; font-size: 12.5px; }
.muted { color: var(--c-text-3); font-size: 14px; margin: 0; }
</style>
