<script setup lang="ts">
import type { PackageConfig } from '@/types'

defineProps<{ configs: PackageConfig[] }>()

function defaultText(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

function valuesText(v: unknown): string {
  if (!Array.isArray(v) || v.length === 0) return ''
  return v.map(String).join(' | ')
}
</script>

<template>
  <div v-if="configs && configs.length" class="cfg-table">
    <div class="cfg-table__row cfg-table__row--head">
      <span>Name</span><span>Type</span><span>Default</span><span>Values</span><span>Description</span>
    </div>
    <div v-for="c in configs" :key="c.name" class="cfg-table__row">
      <code>{{ c.name }}</code>
      <span>{{ c.type ?? '' }}</span>
      <span>{{ defaultText(c.default) }}</span>
      <span>{{ valuesText(c.values) }}</span>
      <span>{{ c.description ?? '' }}</span>
    </div>
  </div>
  <p v-else class="muted">No configurable options.</p>
</template>

<style scoped>
.cfg-table {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  font-size: 13.5px;
}
.cfg-table__row {
  display: grid;
  grid-template-columns: 160px 80px 100px 160px 1fr;
  padding: 10px var(--space-3);
  gap: var(--space-3);
  border-top: 1px solid var(--c-border);
  align-items: baseline;
}
.cfg-table__row:first-child { border-top: none; }
.cfg-table__row--head {
  background: var(--c-bg-soft);
  color: var(--c-text-3);
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cfg-table__row code { font-family: var(--font-mono); }
.muted { color: var(--c-text-3); font-size: 14px; margin: 0; }

@media (max-width: 720px) {
  .cfg-table__row { grid-template-columns: 1fr 1fr; }
  .cfg-table__row--head { display: none; }
  .cfg-table__row > :nth-child(odd)::before { display: block; color: var(--c-text-3); font-size: 11px; text-transform: uppercase; }
}
</style>
