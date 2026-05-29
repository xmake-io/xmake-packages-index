<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { config } from '@/config'

const router = useRouter()
const query = ref('')
const menuOpen = ref(false)

function onSearch() {
  router.push({ name: 'packages', query: query.value ? { q: query.value } : {} })
  menuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <RouterLink :to="{ name: 'home' }" class="brand">
        <span class="brand__logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <rect width="32" height="32" rx="6" fill="var(--c-brand-3)" />
            <path d="M8 11h16v3H8zM8 17h12v3H8zM8 23h8v3H8z" fill="#fff" />
          </svg>
        </span>
        <span class="brand__name">{{ config.site.name }}</span>
      </RouterLink>

      <form class="search" @submit.prevent="onSearch">
        <input
          v-model="query"
          type="search"
          placeholder="Search packages…"
          aria-label="Search packages"
        />
      </form>

      <nav class="nav" :class="{ 'nav--open': menuOpen }">
        <RouterLink :to="{ name: 'packages' }" @click="menuOpen = false">Packages</RouterLink>
        <RouterLink :to="{ name: 'about' }" @click="menuOpen = false">About</RouterLink>
        <a :href="config.site.docs" target="_blank" rel="noopener">Docs</a>
        <a :href="config.site.github" target="_blank" rel="noopener">GitHub</a>
      </nav>

      <div class="actions">
        <ThemeToggle />
        <button class="menu-toggle" aria-label="Toggle menu" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid var(--c-divider);
}

.app-header__inner {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--c-text-1);
  font-weight: 700;
  font-size: 17px;
}
.brand:hover { color: var(--c-text-1); }
.brand__logo { display: inline-flex; }

.search {
  flex: 1;
  max-width: 420px;
  margin: 0 var(--space-2);
}
.search input {
  width: 100%;
  height: 38px;
  padding: 0 var(--space-4);
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-1);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.search input:focus {
  border-color: var(--c-brand-3);
  box-shadow: 0 0 0 3px var(--c-brand-soft);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}
.nav a {
  color: var(--c-text-2);
  font-weight: 500;
}
.nav a.router-link-active,
.nav a:hover {
  color: var(--c-brand-3);
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.menu-toggle {
  display: none;
  background: none;
  border: 1px solid var(--c-border);
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}
.menu-toggle span {
  width: 16px;
  height: 2px;
  background: var(--c-text-2);
  border-radius: 1px;
}

@media (max-width: 860px) {
  .search { max-width: none; }
  .nav { display: none; }
  .menu-toggle { display: inline-flex; }
}

@media (max-width: 640px) {
  .brand__name { display: none; }
  .app-header__inner { gap: var(--space-2); }
  .search { margin: 0; }
}

@media (max-width: 480px) {
  /* Below ~iPhone SE width the search input takes too much room. Collapse
     it into the nav menu instead — users tap the burger to reach it. */
  .search { display: none; }
}

@media (max-width: 860px) {
  .nav--open {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    position: absolute;
    top: var(--header-h);
    left: 0;
    right: 0;
    padding: var(--space-2) var(--space-6);
    background: var(--c-bg);
    border-bottom: 1px solid var(--c-divider);
  }
  .nav--open a {
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--c-divider);
  }
  .nav--open a:last-child { border-bottom: none; }
}
</style>
