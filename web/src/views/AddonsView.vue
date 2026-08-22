<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAddons } from '@/composables/useIndex'
import PackageList from '@/components/package/PackageList.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import CodeBlock from '@/components/ui/CodeBlock.vue'

type Sort = 'name' | 'updated' | 'added'

const route = useRoute()
const router = useRouter()
const { addons, error } = useAddons()

const query = ref<string>(String(route.query.q ?? ''))
const sort = ref<Sort>('name')
const initialSort = route.query.sort
if (initialSort === 'updated' || initialSort === 'added' || initialSort === 'name') {
  sort.value = initialSort
}

// Keep the URL shareable. Debounced for the same reason as the packages view:
// users type one keystroke at a time and we do not want a history entry each.
let syncTimer: ReturnType<typeof setTimeout> | null = null
watch([query, sort], () => {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    router.replace({
      name: 'addons',
      query: {
        ...(query.value ? { q: query.value } : {}),
        ...(sort.value !== 'name' ? { sort: sort.value } : {}),
      },
    })
  }, 250)
})

const filtered = computed(() => {
  const list = addons.value?.addons ?? []
  const q = query.value.trim().toLowerCase()
  const out = q
    ? list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description ?? '').toLowerCase().includes(q),
      )
    : [...list]
  if (sort.value === 'name') {
    out.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    const field = sort.value === 'added' ? 'added_at' : 'updated_at'
    out.sort((a, b) => (b[field] ?? '').localeCompare(a[field] ?? ''))
  }
  return out
})
</script>

<template>
  <div class="container addons">
    <header class="addons__head">
      <h1>Addons</h1>
      <p class="muted">
        Addons extend xmake itself with plugins, rules, toolchains, project templates and
        modules. They are installed once with <code>xmake addon</code>, or declared by a
        project and installed automatically.
      </p>
      <CodeBlock code="xmake addon --install <name>" language="bash" title="Install an addon" />
    </header>

    <div class="addons__toolbar">
      <input
        v-model="query"
        type="search"
        class="addons__search"
        placeholder="Search addons…"
        aria-label="Search addons"
      />
      <select v-model="sort" aria-label="Sort addons">
        <option value="name">Name</option>
        <option value="updated">Recently updated</option>
        <option value="added">Recently added</option>
      </select>
      <span v-if="addons" class="muted addons__count">
        {{ filtered.length }} / {{ addons.count }}
      </span>
    </div>

    <div v-if="error" class="error">Failed to load addons: {{ error }}</div>
    <LoadingState v-else-if="!addons" />
    <PackageList v-else-if="filtered.length" :packages="filtered" />
    <p v-else class="empty muted">No addon matches this search.</p>
  </div>
</template>

<style scoped>
.addons__head {
  padding: var(--space-8) 0 var(--space-5);
  max-width: 760px;
}
.addons__head h1 {
  font-size: 28px;
  margin: 0 0 var(--space-3);
}
.addons__head .muted {
  margin: 0 0 var(--space-4);
  color: var(--c-text-2);
}
.addons__head code {
  font-size: 0.92em;
}

.addons__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}
.addons__search {
  flex: 1;
  min-width: 220px;
  height: 38px;
  padding: 0 var(--space-4);
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-1);
  border-radius: var(--radius-md);
  outline: none;
}
.addons__search:focus {
  border-color: var(--c-brand-3);
  box-shadow: 0 0 0 3px var(--c-brand-soft);
}
.addons__toolbar select {
  height: 38px;
  padding: 0 var(--space-3);
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-1);
  border-radius: var(--radius-md);
}
.addons__count {
  font-size: 13px;
}

.empty {
  padding: var(--space-8) 0;
  text-align: center;
}
</style>
