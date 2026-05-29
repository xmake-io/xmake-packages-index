<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AdBar from '@/components/layout/AdBar.vue'

const route = useRoute()

// Home page is full-bleed (hero radial gradient, marketing-style); it would
// look cramped with a sidebar squeezing it. Everywhere else gets a sticky
// left rail for the Carbon ad — same general pattern as xmake-docs.
const showSidebar = computed(() => route.name !== 'home')
</script>

<template>
  <AppHeader />
  <div class="app-shell" :class="{ 'app-shell--with-sidebar': showSidebar }">
    <aside v-if="showSidebar" class="app-sidebar">
      <AdBar slot-name="sidebar" />
    </aside>
    <main class="app-main">
      <!-- :key uses `route.path` (not `fullPath`) so navigating between routes
           remounts the view but typing into a filter input — which only
           updates the query string — keeps the input focused. -->
      <RouterView :key="route.path" />
    </main>
  </div>
  <AppFooter />
</template>

<style>
/* Default: single column. Each view still owns its own .container for
   padding and max-width, so the layout is identical to before. */
.app-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding: var(--space-8) 0 var(--space-12);
  min-width: 0;
}

/* Three-column grid: sidebar | main | mirror-spacer. The empty spacer on
   the right mirrors the sidebar width so the main content column ends up
   visually centered inside the viewport instead of sitting awkwardly off
   to the right of the sidebar. Wider shell + narrower rails give a
   comfortable ~900px reading column on a 1440 viewport. */
.app-shell--with-sidebar {
  --sidebar-w: 200px;
  display: grid;
  grid-template-columns: var(--sidebar-w) minmax(0, 1fr) var(--sidebar-w);
  column-gap: var(--space-8);
  align-items: flex-start;
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-3) var(--space-6) var(--space-10);
  width: 100%;
}

.app-shell--with-sidebar .app-main {
  padding: 0;
  /* min-width: 0 prevents long code lines / urls from blowing out the grid
     track when their natural width exceeds the column. */
  min-width: 0;
}

.app-sidebar {
  /* Narrow rail — matches the natural width of a Carbon ad image (~200px)
     so the card doesn't waste horizontal real estate. */
  width: var(--sidebar-w);
  position: sticky;
  top: calc(var(--header-h) + var(--space-4));
}

/* Tablet / narrow-laptop: drop the rails before the main column gets
   squeezed below ~720px (where code blocks start to scroll horizontally). */
@media (max-width: 1199px) {
  .app-sidebar { display: none; }
  .app-shell--with-sidebar {
    display: block;
    padding: 0;
    max-width: none;
  }
  .app-shell--with-sidebar .app-main {
    padding: var(--space-8) 0 var(--space-12);
  }
}

/* Phones: align vertical rhythm with the home page (no-sidebar branch
   above already uses the same paddings on phones, this just makes sure
   the with-sidebar branch matches when it falls back to single column). */
@media (max-width: 640px) {
  .app-shell--with-sidebar .app-main {
    padding: var(--space-5) 0 var(--space-10);
  }
}
</style>
