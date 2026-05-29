<script setup lang="ts">
// Carbon Ads slot — same code/placement as xmake-docs so accounting stays
// unified when this site and xmake-docs share a domain. Carbon's snippet
// renders inside whichever container its <script> tag is appended to, and
// hides itself entirely when no campaign is available.

import { onMounted, ref } from 'vue'
import { config } from '@/config'

defineProps<{ slotName?: string }>()

const container = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!container.value || container.value.hasChildNodes()) return
  const s = document.createElement('script')
  s.async = true
  s.id = '_carbonads_js'
  s.src = `//cdn.carbonads.com/carbon.js?serve=${config.ads.carbon.code}&placement=${config.ads.carbon.placement}`
  container.value.appendChild(s)
})
</script>

<template>
  <aside class="ad-bar">
    <div class="ad-bar__slot" ref="container" :data-slot="slotName"></div>
  </aside>
</template>

<style scoped>
.ad-bar {
  display: flex;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}

/* Carbon injects #carbonads inside our slot div. Style its DOM via :deep so
   the ad surface matches the rest of the site (dark mode friendly). */
.ad-bar__slot {
  width: 100%;
  max-width: 330px;
}

.ad-bar :deep(#carbonads) {
  width: 100%;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  overflow: hidden;
}
.ad-bar :deep(#carbonads a) { color: var(--c-text-1); text-decoration: none; }
.ad-bar :deep(#carbonads a:hover) { color: var(--c-brand-3); }
.ad-bar :deep(#carbonads .carbon-wrap) { display: flex; }
.ad-bar :deep(#carbonads .carbon-img) { display: block; margin: 0; flex-shrink: 0; }
.ad-bar :deep(#carbonads .carbon-img img) { display: block; }
.ad-bar :deep(#carbonads .carbon-text) {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--c-text-2);
}
.ad-bar :deep(#carbonads .carbon-poweredby) {
  display: block;
  padding: 6px 8px;
  background: var(--c-bg);
  color: var(--c-text-mute);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  border-top: 1px solid var(--c-border);
}
</style>
