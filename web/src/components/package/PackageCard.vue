<script setup lang="ts">
import { computed } from 'vue'
import type { PackageSummary } from '@/types'
import { licenseText, platformLabel, relativeTime, supportsAllPlatforms } from '@/lib/format'

const props = defineProps<{ pkg: PackageSummary }>()

// Defensive: a few packages historically serialized empty platform lists as
// {} (object) instead of [] (array); the listing must never crash on those.
const platforms = computed(() =>
  Array.isArray(props.pkg.platforms) ? props.pkg.platforms : [],
)

const license = computed(() => licenseText(props.pkg.license))

const allPlatforms = computed(() => supportsAllPlatforms(platforms.value))

// The home feed mixes packages and addons, they have their own detail pages,
// and an addon is marked as such — a package needs no badge, it is the default.
const isAddon = computed(() => props.pkg.kind === 'addon')
const route = computed(() => (isAddon.value ? 'addon-detail' : 'package-detail'))
</script>

<template>
  <RouterLink class="pkg-card card" :to="{ name: route, params: { name: pkg.name } }">
    <header class="pkg-card__head">
      <div class="pkg-card__identity">
        <h3 class="pkg-card__name" :title="pkg.name">{{ pkg.name }}</h3>
        <span v-if="license" class="chip badge-license" :title="'License: ' + license" :aria-label="'License: ' + license">{{ license }}</span>
        <span v-if="isAddon" class="badge-addon" title="An xmake addon, install it with `xmake addon`">
          addon
        </span>
      </div>
      <span v-if="pkg.latest_version" class="chip chip--brand">{{ pkg.latest_version }}</span>
    </header>
    <p v-if="pkg.description" class="pkg-card__desc">{{ pkg.description }}</p>
    <footer class="pkg-card__meta">
      <span v-if="allPlatforms" class="chip">All platforms</span>
      <template v-else>
        <span v-for="p in platforms" :key="p" class="chip">{{ platformLabel(p) }}</span>
      </template>
      <span class="pkg-card__time" v-if="pkg.updated_at">{{ relativeTime(pkg.updated_at) }}</span>
    </footer>
  </RouterLink>
</template>

<style scoped>
/* License metadata stays with the package identity, apart from platforms. */
.pkg-card__identity {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  min-width: 0;
}
.badge-license {
  max-width: 100%;
  background: var(--c-brand-soft);
  color: var(--c-brand-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-addon {
  flex: none;
  padding: 1px 7px;
  border-radius: var(--radius-sm, 4px);
  background: var(--c-brand-soft);
  color: var(--c-brand-3);
  border: 1px solid color-mix(in srgb, var(--c-brand-3) 35%, transparent);
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.02em;
  text-transform: lowercase;
}
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
  align-items: flex-start;
  gap: var(--space-2);
}
.pkg-card__head .chip--brand {
  flex-shrink: 0;
  max-width: 40%;
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pkg-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-1);
  margin: 0;
  max-width: 100%;
  /* Keep long names inside the identity column. */
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
