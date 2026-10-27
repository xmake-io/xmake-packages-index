<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { pageMeta } from '../../../shared/seo.mjs'
import { config } from '@/config'
const props = defineProps<{ entry?: {name: string; description?: string; kind?: string} }>()
const route = useRoute()
const crumbs = computed(() => pageMeta(config.site, route.path, props.entry).breadcrumbs)
</script>
<template>
 <nav v-if="crumbs.length" class="breadcrumbs" aria-label="Breadcrumb">
  <template v-for="(crumb, i) in crumbs" :key="crumb.path">
   <span v-if="i" aria-hidden="true">/</span>
   <span v-if="i === crumbs.length - 1" aria-current="page">{{ crumb.name }}</span>
   <RouterLink v-else :to="crumb.path">{{ crumb.name }}</RouterLink>
  </template>
 </nav>
</template>
<style scoped>
.breadcrumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 9px; font-size: 12px; color: var(--c-text-3); margin-bottom: 16px; overflow-wrap: anywhere; }
.breadcrumbs a { color: var(--c-text-2); }
.breadcrumbs a:hover { color: var(--c-brand-3); }
</style>
