<script setup lang="ts">
import type { PackageDetail } from '@/types'
import { formatDate, licenseText } from '@/lib/format'

defineProps<{ pkg: PackageDetail }>()
</script>

<template>
  <dl class="meta">
    <template v-if="pkg.license">
      <dt>License</dt><dd>{{ licenseText(pkg.license) }}</dd>
    </template>
    <template v-if="pkg.homepage">
      <dt>Homepage</dt>
      <dd><a :href="pkg.homepage" target="_blank" rel="noopener">{{ pkg.homepage }}</a></dd>
    </template>
    <template v-if="pkg.repository_url">
      <dt>Repository</dt>
      <dd><a :href="pkg.repository_url" target="_blank" rel="noopener">{{ pkg.repository_url }}</a></dd>
    </template>
    <template v-if="pkg.download_url">
      <dt>Source archive</dt>
      <dd><a :href="pkg.download_url" target="_blank" rel="noopener">{{ pkg.download_url }}</a></dd>
    </template>
    <template v-if="pkg.added_at">
      <dt>Added</dt><dd>{{ formatDate(pkg.added_at) }}</dd>
    </template>
    <template v-if="pkg.updated_at">
      <dt>Updated</dt><dd>{{ formatDate(pkg.updated_at) }}</dd>
    </template>
    <template v-if="pkg.extsources && pkg.extsources.length">
      <dt>System</dt>
      <dd>
        <span v-for="e in pkg.extsources" :key="e" class="chip">{{ e }}</span>
      </dd>
    </template>
  </dl>
</template>

<style scoped>
.meta {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: var(--space-2) var(--space-4);
  margin: 0;
  font-size: 14px;
}
.meta dt {
  color: var(--c-text-3);
  font-weight: 500;
}
.meta dd {
  margin: 0;
  color: var(--c-text-1);
  word-break: break-word;
}
.meta dd a { color: var(--c-brand-3); }
.meta dd .chip { margin-right: 4px; }

@media (max-width: 640px) {
  .meta {
    grid-template-columns: 1fr;
    gap: 2px var(--space-2);
  }
  .meta dt { margin-top: var(--space-2); }
}
</style>
