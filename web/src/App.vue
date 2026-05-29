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
    <!-- :key uses `route.path` (not `fullPath`) so navigating between routes
         remounts the view but typing into a filter input — which only
         updates the query string — keeps the input focused. -->
    <RouterView :key="route.path" />
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
