<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AdBar from '@/components/layout/AdBar.vue'

const route = useRoute()
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <!-- Plain RouterView: wrapping lazy components in <Transition> caused
         blank renders when the async chunk hadn't resolved yet. Using
         :key forces a clean remount on every route change. -->
    <RouterView :key="route.fullPath" />
  </main>
  <AdBar slot-name="footer" />
  <AppFooter />
</template>

<style>
.app-main {
  flex: 1;
  /* Hero pages provide their own top padding; views without a hero get
     a smaller default so they don't feel floated. */
  padding: var(--space-3) 0 var(--space-10);
}
</style>
