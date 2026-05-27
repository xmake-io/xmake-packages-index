<script setup lang="ts">
import PackageCard from './PackageCard.vue'
import type { PackageSummary } from '@/types'

defineProps<{ packages: PackageSummary[] }>()
</script>

<template>
  <div class="pkg-list">
    <PackageCard v-for="p in packages" :key="p.name" :pkg="p" />
  </div>
</template>

<style scoped>
.pkg-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
</style>
