<script setup lang="ts">
import { computed } from 'vue'
import { categories, categoryEntries, categoryRoute } from '../../shared/catalog.mjs'
import { useIndex, useAddons } from '@/composables/useIndex'
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs.vue'
const { index } = useIndex()
const { addons } = useAddons()
const rows = computed(() => categories.map(category => ({...category, count: (category.kind === 'addon' ? addons.value : index.value) ? categoryEntries(category, index.value?.packages ?? [], addons.value?.addons ?? []).length : undefined})))
</script>
<template>
 <main class="container categories"><PageBreadcrumbs /><h1>Package categories</h1><p class="intro">Find libraries, build tools, compiler toolchains and extensions for Xmake.</p>
 <div class="category-grid"><RouterLink v-for="category in rows" :key="category.slug" :to="categoryRoute(category.slug)" class="card category-card">
  <h2>{{ category.label }} <span>{{ category.count ?? '…' }}</span></h2><p>{{ category.description }}</p>
 </RouterLink></div></main>
</template>
<style scoped>
h1 { font-size: 28px; }.intro { color: var(--c-text-3); margin: 12px 0 24px; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,300px),1fr)); gap: 16px; }
.category-card { color: var(--c-text-1); }.category-card:hover { border-color: var(--c-brand-3); }h2 { font-size: 18px; }h2 span { color: var(--c-brand-3); font-size: 13px; margin-left: 8px; }p { color: var(--c-text-2); font-size: 14px; line-height: 1.7; }
</style>
