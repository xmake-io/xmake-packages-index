<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PackageDeps from './PackageDeps.vue'
const props = defineProps<{ names: string[]; resetKey: string; label: string; addon?: boolean }>()
const query = ref('')
const page = ref(0)
const pageSize = 12
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.names.filter(name => name.toLowerCase().includes(q)) : props.names
})
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() => filtered.value.slice(page.value * pageSize, (page.value + 1) * pageSize))
watch(query, () => { page.value = 0 })
watch(() => props.resetKey, () => { query.value = ''; page.value = 0 })
watch(pages, total => { page.value = Math.min(page.value, total - 1) })
</script>
<template>
  <div class="relations-list">
    <input v-if="names.length > pageSize" v-model="query" type="search" :aria-label="label" :placeholder="label + '…'" />
    <PackageDeps v-if="visible.length" :deps="visible" :addon="addon" />
    <p v-else class="empty" role="status">No matching packages.</p>
    <nav v-if="names.length > pageSize" class="relations-pages" :aria-label="label + ' pagination'">
      <span aria-live="polite">{{ filtered.length ? page * pageSize + 1 : 0 }}–{{ Math.min((page + 1) * pageSize, filtered.length) }} / {{ filtered.length }}</span>
      <button :disabled="page === 0" @click="page--">Previous</button>
      <button :disabled="page + 1 >= pages" @click="page++">Next</button>
    </nav>
  </div>
</template>
<style scoped>
.relations-list { margin-top: 12px; }
input { width: 100%; max-width: 360px; box-sizing: border-box; padding: 9px 12px; margin-bottom: 12px; border: 1px solid var(--c-border); border-radius: var(--radius-md); background: var(--c-bg-soft); color: var(--c-text-1); font: inherit; font-size: 13px; }
input:focus-visible, button:focus-visible { outline: 2px solid var(--c-brand-3); outline-offset: 2px; }
.relations-pages { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; color: var(--c-text-3); font-size: 12px; }
.relations-pages span { margin-right: auto; }
button { border: 1px solid var(--c-border); border-radius: var(--radius-sm); background: var(--c-bg); color: var(--c-text-2); padding: 7px 10px; cursor: pointer; }
button:hover:not(:disabled) { color: var(--c-brand-3); border-color: var(--c-brand-3); }
button:disabled { opacity: .4; cursor: default; }
.empty { font-size: 13px; color: var(--c-text-3); }
</style>
