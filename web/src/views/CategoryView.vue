<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { categoryFromRoute, categoryEntries, categoryPageSize, categoryRoute } from '../../shared/catalog.mjs'
import { useIndex, useAddons } from '@/composables/useIndex'
import { updatePageSeo } from '@/lib/seo'
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs.vue'
import PackageList from '@/components/package/PackageList.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import NotFoundView from './NotFoundView.vue'
const route = useRoute()
const { index, error } = useIndex()
const { addons, error: addonError } = useAddons()
const info = computed(() => categoryFromRoute(route.path.replace(/\/$/,'')))
const ready = computed(() => info.value?.category.kind === 'addon' ? !!addons.value : !!index.value)
const loadError = computed(() => info.value?.category.kind === 'addon' ? addonError.value : error.value)
const entries = computed(() => info.value ? categoryEntries(info.value.category,index.value?.packages ?? [],addons.value?.addons ?? []) : [])
const pages = computed(() => Math.max(1,Math.ceil(entries.value.length/categoryPageSize)))
const missing = computed(() => !info.value || (ready.value && info.value.page > pages.value))
const shown = computed(() => entries.value.slice(((info.value?.page || 1)-1)*categoryPageSize,(info.value?.page || 1)*categoryPageSize))
watchEffect(() => { if (missing.value) updatePageSeo('/404'); else updatePageSeo(route.path) })
</script>
<template>
 <NotFoundView v-if="missing" />
 <main v-else-if="info" class="container category"><PageBreadcrumbs /><h1>{{ info.category.label }}</h1><p class="intro">{{ info.category.description }}</p>
 <p v-if="loadError" role="alert">Could not load packages. Please reload to try again.</p><LoadingState v-else-if="!ready" />
 <template v-else><p class="count">{{ entries.length }} {{ info.category.kind === 'addon' ? 'addons' : 'packages' }} · Page {{ info.page }} of {{ pages }}</p><PackageList :packages="shown" />
 <nav class="category-pager" aria-label="Category pages"><RouterLink v-if="info.page > 1" :to="categoryRoute(info.category.slug,info.page-1)">← Previous</RouterLink><RouterLink v-if="info.page < pages" :to="categoryRoute(info.category.slug,info.page+1)">Next →</RouterLink></nav></template>
 </main>
</template>
<style scoped>
h1 { font-size: 28px; }.intro { color: var(--c-text-2); line-height: 1.7; max-width: 760px; margin: 12px 0 20px; }.count { font-size: 13px; color: var(--c-text-3); margin-bottom: 16px; }.category-pager { display:flex; justify-content:center; gap:24px; margin-top:24px; }
</style>
