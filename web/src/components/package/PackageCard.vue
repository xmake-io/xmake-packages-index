<script setup lang="ts">
import type { PackageSummary } from '@/types'
import { licenseText, platformLabel, relativeTime } from '@/lib/format'

defineProps<{ pkg: PackageSummary }>()
</script>

<template>
  <RouterLink class="pkg-card card" :to="{ name: 'package-detail', params: { name: pkg.name } }">
    <header class="pkg-card__head">
      <h3 class="pkg-card__name">{{ pkg.name }}</h3>
      <span v-if="pkg.latest_version" class="chip chip--brand">{{ pkg.latest_version }}</span>
    </header>
    <p v-if="pkg.description" class="pkg-card__desc">{{ pkg.description }}</p>
    <footer class="pkg-card__meta">
      <span v-if="pkg.license" class="chip">{{ licenseText(pkg.license) }}</span>
      <span v-for="p in pkg.platforms" :key="p" class="chip">{{ platformLabel(p) }}</span>
      <span class="pkg-card__time" v-if="pkg.updated_at">{{ relativeTime(pkg.updated_at) }}</span>
    </footer>
  </RouterLink>
</template>

<style scoped>
.pkg-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  text-decoration: none;
  color: inherit;
}
.pkg-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}
.pkg-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-1);
  margin: 0;
  /* Long package names should ellipsize, not push the version chip off-card */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.pkg-card__desc {
  margin: 0;
  font-size: 13.5px;
  color: var(--c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}
.pkg-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.pkg-card__time {
  font-size: 12px;
  color: var(--c-text-mute);
  margin-left: auto;
}
</style>
