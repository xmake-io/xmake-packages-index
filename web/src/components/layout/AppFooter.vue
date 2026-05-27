<script setup lang="ts">
import { config } from '@/config'
import { useStats } from '@/composables/useIndex'

const { stats } = useStats()
</script>

<template>
  <footer class="app-footer">
    <div class="container app-footer__inner">
      <div class="muted">
        <span>{{ config.site.name }}</span>
        <span v-if="stats"> · {{ stats.total }} packages</span>
        <span v-if="stats"> · updated {{ stats.generated_at.slice(0, 10) }}</span>
      </div>
      <div class="links">
        <a :href="config.site.github" target="_blank" rel="noopener">xmake-repo</a>
        <a :href="config.site.indexRepo" target="_blank" rel="noopener">Site source</a>
        <a :href="config.site.docs" target="_blank" rel="noopener">Documentation</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--c-divider);
  padding: var(--space-6) 0;
  font-size: 13px;
  color: var(--c-text-3);
  margin-top: auto;
}
.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.muted { color: var(--c-text-3); }
.links {
  display: inline-flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.links a { color: var(--c-text-3); }
.links a:hover { color: var(--c-brand-3); }
</style>
