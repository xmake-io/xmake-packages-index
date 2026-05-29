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
  padding: var(--space-8) 0 var(--space-12);
}
</style>
