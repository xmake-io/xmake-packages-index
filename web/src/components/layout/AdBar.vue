<script setup lang="ts">
// Slot-based ad bar. We mount both WWAds (CN) and CarbonAds (intl); each
// provider hides itself if it has no campaign to serve, so visitors see at
// most one ad even though we wire up both. Same providers as xmake-docs so
// when this site and xmake-docs share a domain, accounting stays unified.
//
// `slot-name` is forwarded into the WWAds element so multiple instances on a
// page (e.g. detail-page sidebar + global footer) don't collide.

import { onMounted, onUnmounted, ref } from 'vue'
import { config } from '@/config'

defineProps<{ slotName?: string; layout?: 'horizontal' | 'vertical' }>()

const container = ref<HTMLElement | null>(null)
let scriptEl: HTMLScriptElement | null = null

onMounted(() => {
  // WWAds expects `wwads-cn` elements to be present before the script scans the DOM.
  // We append the script after our element is mounted to guarantee detection.
  const existing = document.getElementById('wwads-script')
  if (existing) existing.remove()

  scriptEl = document.createElement('script')
  scriptEl.id = 'wwads-script'
  scriptEl.src = 'https://cdn.wwads.cn/js/makemoney.js'
  scriptEl.async = true
  scriptEl.charset = 'UTF-8'
  document.body.appendChild(scriptEl)

  // Carbon Ads: inject one script tag inside our placeholder. Carbon dedupes
  // by container, so we guard with isInitialized.
  const carbon = container.value?.querySelector('.carbon-slot')
  if (carbon && !carbon.hasChildNodes()) {
    const s = document.createElement('script')
    s.async = true
    s.src = `//cdn.carbonads.com/carbon.js?serve=${config.ads.carbon.code}&placement=${config.ads.carbon.placement}`
    s.id = '_carbonads_js'
    carbon.appendChild(s)
  }
})

onUnmounted(() => {
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.removeChild(scriptEl)
  }
})
</script>

<template>
  <aside class="ad-bar" :class="`ad-bar--${layout ?? 'horizontal'}`" ref="container">
    <div
      class="wwads-cn"
      :class="layout === 'vertical' ? 'wwads-vertical' : 'wwads-horizontal'"
      :data-id="config.ads.wwadsId"
      :data-slot="slotName"
    ></div>
    <div class="carbon-slot"></div>
  </aside>
</template>

<style scoped>
.ad-bar {
  margin: var(--space-6) auto;
  padding: 0 var(--space-6);
  max-width: var(--container-max);
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.ad-bar--vertical {
  flex-direction: column;
  align-items: stretch;
}

.wwads-cn {
  min-height: 90px;
  width: 100%;
}

/* Provider-injected anchors should never break our layout grid */
.ad-bar :deep(#carbonads) {
  max-width: 330px;
  width: 100%;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
}

@media (max-width: 640px) {
  .ad-bar { padding: 0 var(--space-4); }
}
</style>
