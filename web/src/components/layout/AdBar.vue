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
/* Horizontal banner layout: the slot fills the site container, the Carbon
   image sits on the left, ad copy expands to fill remaining space, and the
   "ethical ad" badge tucks into the top-right. Falls back to a stacked
   layout on narrow viewports where the horizontal arrangement would crush
   the copy. */
.ad-bar {
  display: flex;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}

.ad-bar__slot {
  width: 100%;
  max-width: var(--container-max);
}

.ad-bar :deep(#carbonads) {
  position: relative;
  width: 100%;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  transition: border-color var(--transition);
}
.ad-bar :deep(#carbonads:hover) { border-color: var(--c-brand-3); }
.ad-bar :deep(#carbonads a) { color: var(--c-text-1); text-decoration: none; }
.ad-bar :deep(#carbonads a:hover) { color: var(--c-brand-3); }

.ad-bar :deep(#carbonads .carbon-wrap) {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 10px var(--space-4);
}
.ad-bar :deep(#carbonads .carbon-img) {
  flex-shrink: 0;
  margin: 0;
  line-height: 0;
}
.ad-bar :deep(#carbonads .carbon-img img) {
  display: block;
  border-radius: var(--radius-sm);
}
.ad-bar :deep(#carbonads .carbon-text) {
  flex: 1;
  padding: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-text-2);
  /* Leave room on the right for the absolutely-positioned poweredby badge. */
  padding-right: 96px;
}

.ad-bar :deep(#carbonads .carbon-poweredby) {
  position: absolute;
  top: 8px;
  right: 10px;
  padding: 3px 8px;
  background: var(--c-bg);
  color: var(--c-text-mute);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
}

@media (max-width: 640px) {
  .ad-bar :deep(#carbonads .carbon-wrap) {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-3);
  }
  .ad-bar :deep(#carbonads .carbon-text) {
    padding-right: 0;
  }
  .ad-bar :deep(#carbonads .carbon-poweredby) {
    position: static;
    margin-top: var(--space-2);
  }
}
</style>
