<script setup lang="ts">
import { computed, ref, watch } from 'vue'
const props = defineProps<{ count: number; limit: number; label: string; resetKey?: unknown }>()
const expanded = ref(false)
const visibleCount = computed(() => expanded.value ? props.count : Math.min(props.limit, props.count))
watch(() => props.resetKey, () => { expanded.value = false })
</script>
<template>
  <div class="collapsible-list">
    <slot :visible-count="visibleCount" />
    <button v-if="count > limit" type="button" class="list-toggle" :aria-expanded="expanded" @click="expanded = !expanded">
      {{ expanded ? `Show fewer ${label}` : `Show all ${count} ${label}` }}
      <span aria-hidden="true">{{ expanded ? '↑' : '↓' }}</span>
    </button>
  </div>
</template>
<style scoped>
.collapsible-list { min-width: 0; max-width: 100%; }
.list-toggle { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 10px; border: 1px solid transparent; border-radius: var(--radius-sm); background: var(--c-brand-soft); color: var(--c-brand-3); font: inherit; font-size: 12px; cursor: pointer; }
.list-toggle:hover { border-color: var(--c-brand-3); }
.list-toggle:focus-visible { outline: 2px solid var(--c-brand-3); outline-offset: 2px; }
@media (max-width: 640px) { .list-toggle { min-height: 36px; } }
</style>
