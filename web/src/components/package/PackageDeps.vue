<script setup lang="ts">
defineProps<{ deps: string[] }>()
</script>

<template>
  <div v-if="deps && deps.length" class="deps">
    <RouterLink
      v-for="d in deps"
      :key="d"
      class="chip"
      :to="{ name: 'package-detail', params: { name: d.replace(/\s.*$/, '') } }"
    >{{ d }}</RouterLink>
  </div>
  <p v-else class="muted">No dependencies declared.</p>
</template>

<style scoped>
.deps { display: flex; flex-wrap: wrap; gap: 6px; }
.deps .chip { text-decoration: none; }
.deps .chip:hover { background: var(--c-brand-soft); color: var(--c-brand-3); }
.muted { color: var(--c-text-3); font-size: 14px; margin: 0; }
</style>
