<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AdBar from '@/components/layout/AdBar.vue'
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <AdBar slot-name="footer" />
  <AppFooter />
</template>

<style>
.app-main {
  flex: 1;
  padding: var(--space-8) 0 var(--space-12);
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
