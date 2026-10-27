<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadRelations, loadAddonRelations } from '@/lib/data'
import PackageRelationsList from './PackageRelationsList.vue'
import PackageDependencyGraph from './PackageDependencyGraph.vue'
const props = defineProps<{ name: string; addon?: boolean }>()
const relations = ref<Record<string, string[]>>({})
const dependents = computed(() => relations.value[props.name] ?? [])
onMounted(async () => {
  try { relations.value = await (props.addon ? loadAddonRelations() : loadRelations()) }
  catch (error) { console.warn('Could not load package relationships', error) }
})
</script>
<template>
  <section v-if="dependents.length || (addon && Object.hasOwn(relations, name))" class="dependents">
    <h2>Used by <span>({{ dependents.length }})</span></h2>
    <p>{{ addon ? 'Addons declaring this dependency.' : 'Packages declaring this dependency; requirements can vary by platform and configuration.' }}</p>
    <PackageRelationsList v-if="dependents.length" :names="dependents" :reset-key="name" :label="addon ? 'Search dependent addons' : 'Search dependent packages'" :addon="addon" />
    <p v-else>No indexed addons depend on this addon.</p>
  </section>
  <PackageDependencyGraph v-if="Object.hasOwn(relations, name)" :name="name" :relations="relations" :addon="addon" />
</template>
<style scoped>
.dependents { margin: var(--space-8) 0; }
h2 { font-size: 17px; margin-bottom: var(--space-4); }
h2 span, p { color: var(--c-text-3); font-weight: 400; font-size: 13px; }
p { margin-bottom: var(--space-3); }
summary { color: var(--c-brand-3); cursor: pointer; margin: var(--space-3) 0; }
</style>
