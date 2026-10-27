<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadRelations } from '@/lib/data'
import PackageRelationsList from './PackageRelationsList.vue'
import PackageDependencyGraph from './PackageDependencyGraph.vue'
const props = defineProps<{ name: string }>()
const relations = ref<Record<string, string[]>>({})
const dependents = computed(() => relations.value[props.name] ?? [])
onMounted(async () => {
  try { relations.value = await loadRelations() }
  catch (error) { console.warn('Could not load package relationships', error) }
})
</script>
<template>
  <section v-if="dependents.length" class="dependents">
    <h2>Used by <span>({{ dependents.length }})</span></h2>
    <p>Packages declaring this dependency; requirements can vary by platform and configuration.</p>
    <PackageRelationsList :names="dependents" :reset-key="name" label="Search dependent packages" />
  </section>
  <PackageDependencyGraph v-if="Object.hasOwn(relations, name)" :name="name" :relations="relations" />
</template>
<style scoped>
.dependents { margin: var(--space-8) 0; }
h2 { font-size: 17px; margin-bottom: var(--space-4); }
h2 span, p { color: var(--c-text-3); font-weight: 400; font-size: 13px; }
p { margin-bottom: var(--space-3); }
summary { color: var(--c-brand-3); cursor: pointer; margin: var(--space-3) 0; }
</style>
