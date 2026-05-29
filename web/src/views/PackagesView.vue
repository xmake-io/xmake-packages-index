<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIndex } from '@/composables/useIndex'
import PackageList from '@/components/package/PackageList.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { licenseText, platformLabel } from '@/lib/format'
import { config } from '@/config'

type Sort = 'name' | 'updated' | 'added'

const route = useRoute()
const router = useRouter()
const { index, error: indexError } = useIndex()

const query = ref<string>(String(route.query.q ?? ''))
const page = ref<number>(Number(route.query.page ?? 1) || 1)
const letter = ref<string>(String(route.query.letter ?? ''))
const platform = ref<string>(String(route.query.platform ?? ''))
const license = ref<string>(String(route.query.license ?? ''))
const sort = ref<Sort>('name')
const initialSort = route.query.sort
if (initialSort === 'updated' || initialSort === 'added' || initialSort === 'name') {
  sort.value = initialSort
}

// Keep the URL in sync so users can share/bookmark filtered views.
watch([query, page, letter, platform, license, sort], () => {
  router.replace({
    name: 'packages',
    query: {
      ...(query.value ? { q: query.value } : {}),
      ...(letter.value ? { letter: letter.value } : {}),
      ...(platform.value ? { platform: platform.value } : {}),
      ...(license.value ? { license: license.value } : {}),
      ...(sort.value !== 'name' ? { sort: sort.value } : {}),
      ...(page.value > 1 ? { page: page.value } : {}),
    },
  })
})

// Any filter change resets to page 1; preserve scroll only on explicit page navigation.
watch([query, letter, platform, license, sort], () => {
  page.value = 1
})

// Build the option lists from the dataset itself so we don't hard-code values
// that drift over time. `platforms` is defensively coerced to an array — empty
// Lua tables can serialize as `{}` rather than `[]`, and a single bad entry
// would otherwise crash the whole listing with a `for...of` TypeError.
function plats(p: { platforms: unknown }): string[] {
  return Array.isArray(p.platforms) ? (p.platforms as string[]) : []
}

const platformOptions = computed(() => {
  if (!index.value) return []
  const set = new Set<string>()
  for (const p of index.value.packages) for (const plat of plats(p)) set.add(plat)
  return [...set].sort()
})

const licenseOptions = computed(() => {
  if (!index.value) return []
  const counts = new Map<string, number>()
  for (const p of index.value.packages) {
    const lic = licenseText(p.license)
    if (!lic) continue
    counts.set(lic, (counts.get(lic) ?? 0) + 1)
  }
  // Surface the most common licenses first — long tail still searchable via "Other".
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)
})

const filtered = computed(() => {
  if (!index.value) return []
  let list = index.value.packages
  if (letter.value) list = list.filter((p) => p.letter === letter.value)
  if (platform.value) list = list.filter((p) => plats(p).includes(platform.value))
  if (license.value) list = list.filter((p) => licenseText(p.license) === license.value)
  const q = query.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q),
    )
  }
  const sorted = [...list]
  if (sort.value === 'updated') {
    sorted.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
  } else if (sort.value === 'added') {
    sorted.sort((a, b) => (b.added_at ?? '').localeCompare(a.added_at ?? ''))
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
  return sorted
})

const perPage = config.ui.perPage
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paged = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const letters = '#abcdefghijklmnopqrstuvwxyz0123456789'.split('')

function resetFilters() {
  query.value = ''
  letter.value = ''
  platform.value = ''
  license.value = ''
  sort.value = 'name'
}

const hasFilters = computed(
  () => query.value || letter.value || platform.value || license.value || sort.value !== 'name',
)
</script>

<template>
  <div class="container packages">
    <header class="packages__head">
      <h1>Packages</h1>
      <p v-if="index" class="muted">
        {{ filtered.length }} / {{ index.count }} matched
      </p>
    </header>

    <div class="filters">
      <input
        v-model="query"
        type="search"
        placeholder="Search by name or description…"
        aria-label="Search packages"
      />

      <div class="filters__row">
        <label class="filters__group">
          <span>Platform</span>
          <select v-model="platform" aria-label="Filter by platform">
            <option value="">Any</option>
            <option v-for="p in platformOptions" :key="p" :value="p">{{ platformLabel(p) }}</option>
          </select>
        </label>

        <label class="filters__group">
          <span>License</span>
          <select v-model="license" aria-label="Filter by license">
            <option value="">Any</option>
            <option v-for="l in licenseOptions" :key="l" :value="l">{{ l }}</option>
          </select>
        </label>

        <label class="filters__group">
          <span>Sort</span>
          <select v-model="sort" aria-label="Sort packages">
            <option value="name">Name</option>
            <option value="updated">Recently updated</option>
            <option value="added">Recently added</option>
          </select>
        </label>

        <button v-if="hasFilters" class="filters__reset" @click="resetFilters">Reset</button>
      </div>

      <div class="letters">
        <button
          v-for="l in letters"
          :key="l || 'all'"
          class="letters__btn"
          :class="{ active: letter === l }"
          @click="letter = letter === l ? '' : l"
        >{{ l }}</button>
      </div>
    </div>

    <div v-if="indexError" class="error">
      Couldn't load <code>/data/index.json</code> — {{ indexError }}.
      <br />
      <small>Run <code>./build.sh --data-only</code> (or <code>./run.sh --refresh</code>) to regenerate the dataset.</small>
    </div>
    <LoadingState v-else-if="!index" />
    <template v-else>
      <PackageList v-if="paged.length" :packages="paged" />
      <p v-else class="empty muted">No packages match your filters.</p>

      <nav v-if="totalPages > 1" class="pager" aria-label="Pagination">
        <button :disabled="page <= 1" @click="page--">‹ Prev</button>
        <span class="pager__info">Page {{ page }} of {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++">Next ›</button>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.packages__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.packages__head h1 { font-size: 28px; }
.muted { color: var(--c-text-3); font-size: 13px; }

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.filters input[type="search"] {
  height: 42px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 0 var(--space-4);
  background: var(--c-bg-soft);
  color: var(--c-text-1);
  outline: none;
}
.filters input[type="search"]:focus {
  border-color: var(--c-brand-3);
  box-shadow: 0 0 0 3px var(--c-brand-soft);
}

.filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: flex-end;
}
.filters__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--c-text-3);
}
.filters__group select {
  height: 34px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 0 var(--space-2);
  background: var(--c-bg);
  color: var(--c-text-1);
  font: inherit;
  min-width: 140px;
}
.filters__group select:focus {
  outline: none;
  border-color: var(--c-brand-3);
  box-shadow: 0 0 0 3px var(--c-brand-soft);
}
.filters__reset {
  height: 34px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  background: var(--c-bg);
  color: var(--c-text-2);
  font-size: 13px;
}
.filters__reset:hover { border-color: var(--c-brand-3); color: var(--c-brand-3); }
.letters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.letters__btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
  background: var(--c-bg);
  color: var(--c-text-2);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.letters__btn:hover { border-color: var(--c-brand-3); color: var(--c-brand-3); }
.letters__btn.active {
  background: var(--c-brand-3);
  border-color: var(--c-brand-3);
  color: #fff;
}

.empty { padding: var(--space-12) 0; text-align: center; }

.error {
  padding: var(--space-4) var(--space-5);
  border: 1px solid #f5c2c0;
  background: #fff5f5;
  color: #c0392b;
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.55;
}
.error small { color: var(--c-text-3); }
.error code { background: rgba(0,0,0,0.04); }
:global(.dark) .error { background: rgba(192, 57, 43, 0.08); border-color: rgba(192, 57, 43, 0.4); color: #f8b4ad; }

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
}
.pager button {
  height: 36px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  background: var(--c-bg);
  color: var(--c-text-1);
  font-size: 14px;
}
.pager button:hover:not(:disabled) {
  border-color: var(--c-brand-3);
  color: var(--c-brand-3);
}
.pager button:disabled { opacity: 0.4; cursor: not-allowed; }
.pager__info { color: var(--c-text-3); font-size: 13px; }
</style>
