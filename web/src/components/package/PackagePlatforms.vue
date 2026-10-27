<script setup lang="ts">
import type { PackageDetail } from '@/types'
import { platformLabel } from '@/lib/format'
import { computed } from 'vue'
import CollapsibleList from '../ui/CollapsibleList.vue'

const props = defineProps<{ pkg: PackageDetail }>()

const rows = computed(() => {
  const out: Array<{ plat: string; archs: string[] }> = []
  const plats = Object.keys(props.pkg.platforms ?? {}).sort()
  for (const p of plats) out.push({ plat: p, archs: Array.isArray(props.pkg.platforms[p]) ? props.pkg.platforms[p] : [] })
  return out
})
</script>

<template>
  <CollapsibleList v-if="rows.length" :count="rows.length" :limit="4" :reset-key="pkg.name" label="platforms" v-slot="{ visibleCount }">
  <div class="plats">
    <div v-for="row in rows.slice(0, visibleCount)" :key="row.plat" class="plats__row">
      <span class="chip chip--brand">{{ platformLabel(row.plat) }}</span>
      <CollapsibleList :count="row.archs.length" :limit="6" :reset-key="pkg.name" label="architectures" v-slot="{ visibleCount: archCount }">
      <div class="plats__archs">
        <span v-for="a in row.archs.slice(0, archCount)" :key="a" class="chip">{{ a }}</span>
      </div>
      </CollapsibleList>
    </div>
  </div>
  </CollapsibleList>
  <p v-else class="muted">No platform information available.</p>
</template>

<style scoped>
.plats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.plats__row {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}
.plats__archs { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.muted { color: var(--c-text-3); font-size: 14px; margin: 0; }
</style>
