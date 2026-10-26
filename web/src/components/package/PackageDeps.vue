<script setup lang="ts">
import { computed } from 'vue'
import { useIndex } from '@/composables/useIndex'
const { index } = useIndex()
const names = computed(() => new Set(index.value?.packages.map(p => p.name) ?? []))
const dependencyName = (spec: string) => spec.trim().split(/\s+/)[0]
defineProps<{ deps: string[] }>()
</script>

<template>
  <div v-if="deps && deps.length" class="deps">
    <template v-for="d in deps" :key="d">
    <RouterLink
      v-if="names.has(dependencyName(d))"
      class="chip"
      :to="{ name: 'package-detail', params: { name: dependencyName(d) } }"
    >{{ d }}</RouterLink>
    <span v-else class="chip">{{ d }}</span>
    </template>
  </div>
  <p v-else class="muted">No dependencies declared.</p>
</template>

<style scoped>
.deps { display: flex; flex-wrap: wrap; gap: 6px; }
.deps .chip { text-decoration: none; max-width: 100%; overflow-wrap: anywhere; }
.deps .chip:hover { background: var(--c-brand-soft); color: var(--c-brand-3); }
.muted { color: var(--c-text-3); font-size: 14px; margin: 0; }
</style>
