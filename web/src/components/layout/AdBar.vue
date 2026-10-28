<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { config } from '@/config'
import { registerCarbonSlot } from '@/lib/carbonAds'
const props = defineProps<{ slotName?: string; mobileFooter?: boolean }>()
const route = useRoute()
const router = useRouter()
const container = ref<HTMLElement | null>(null)
let slot: ReturnType<typeof registerCarbonSlot> | undefined
onMounted(async () => {
  await router.isReady()
  if (container.value) slot = registerCarbonSlot(container.value, {
    ...config.ads.carbon, path: route.path, minWidth: props.mobileFooter ? 0 : 1200,
  })
})
watch(() => route.path, path => slot?.update(path), { flush: 'post' })
onBeforeUnmount(() => slot?.dispose())
</script>

<template>
  <aside class="ad-bar" :class="{ 'ad-bar--mobile-footer': mobileFooter }" aria-label="Advertisement">
    <div class="ad-bar__slot" ref="container" :data-slot="slotName"></div>
  </aside>
</template>

<style scoped>
/* Narrow vertical layout for the left sidebar — image on top, copy below,
   "ethical ad" badge as a footer strip. Width is controlled entirely by
   the sidebar container so this works just as well in a 230px or 260px
   column without any extra media queries. */
.ad-bar {
  width: 100%;
}

.ad-bar__slot {
  width: 100%;
}

.ad-bar :deep(#carbonads) {
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
  flex-direction: column;
  align-items: stretch;
}
.ad-bar :deep(#carbonads .carbon-img) {
  margin: 0;
  line-height: 0;
}
.ad-bar :deep(#carbonads .carbon-img img) {
  display: block;
  width: 100%;
  height: auto;
}
.ad-bar :deep(#carbonads .carbon-text) {
  display: block;
  padding: var(--space-3) var(--space-3) var(--space-2);
  font-size: 13px;
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

/* Use a compact, in-flow card below the package content on narrow screens. */
.ad-bar--mobile-footer { display: none; }
@media (max-width: 1199px) {
  .ad-bar--mobile-footer {
    display: block;
    max-width: 400px;
    margin: var(--space-8) auto 0;
  }
  .ad-bar--mobile-footer :deep(#carbonads .carbon-wrap) {
    flex-direction: row;
    align-items: center;
  }
  .ad-bar--mobile-footer :deep(#carbonads .carbon-img) { flex: 0 0 130px; }
  .ad-bar--mobile-footer :deep(#carbonads .carbon-img img) { width: 130px; height: auto; }
  .ad-bar--mobile-footer :deep(#carbonads .carbon-text) { min-width: 0; padding: var(--space-3); }
}
</style>
