<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { config } from '@/config'
import { useIndex } from '@/composables/useIndex'
import { searchPackages } from '@/lib/search'

const router = useRouter()
const route = useRoute()
const { index, error } = useIndex()
const query = ref('')
const menuOpen = ref(false)

const searchOpen = ref(false)
const activeMatch = ref(-1)
const term = computed(() => query.value.trim().toLowerCase())
const matches = computed(() => term.value ? searchPackages(index.value?.packages ?? [], term.value).slice(0, 8) : [])
const showMatches = computed(() => searchOpen.value && !!term.value)
watch(query, () => { activeMatch.value = -1 })
watch(() => route.fullPath, () => { searchOpen.value = false })
function closeSearch(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) searchOpen.value = false
}
function onKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Escape') { searchOpen.value = false; activeMatch.value = -1 }
  if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.value.length) {
    event.preventDefault()
    searchOpen.value = true
    activeMatch.value = activeMatch.value < 0 ? (event.key === 'ArrowDown' ? 0 : matches.value.length - 1) : (activeMatch.value + (event.key === 'ArrowDown' ? 1 : -1) + matches.value.length) % matches.value.length
    requestAnimationFrame(() => document.getElementById(`package-match-${activeMatch.value}`)?.scrollIntoView({ block: 'nearest' }))
  }
  if (event.key === 'Enter' && showMatches.value && activeMatch.value >= 0) {
    event.preventDefault()
    const pkg = matches.value[activeMatch.value]
    router.push({ name: 'package-detail', params: { name: pkg.name } })
    searchOpen.value = false
  }
}
function onSearch() {
  searchOpen.value = false
  router.push({ name: 'packages', query: query.value.trim() ? { q: query.value.trim() } : {} })
  menuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <RouterLink :to="{ name: 'home' }" class="brand">
        <img class="brand__logo" src="/logo.svg" alt="" width="28" height="28" />
        <span class="brand__name">{{ config.site.name }}</span>
      </RouterLink>

      <form class="search" @submit.prevent="onSearch" @focusout="closeSearch">
        <input
          v-model="query"
          type="search"
          placeholder="Search packages…"
          aria-label="Search packages"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-expanded="showMatches"
          aria-controls="package-search-results"
          :aria-activedescendant="showMatches && activeMatch >= 0 ? `package-match-${activeMatch}` : undefined"
          @focus="searchOpen = true"
          @input="searchOpen = true"
          @keydown="onKeydown"
        />
        <div v-if="showMatches" class="search__dropdown">
          <ul id="package-search-results" role="listbox" aria-label="Matching packages">
            <li v-for="(pkg, i) in matches" :id="`package-match-${i}`" :key="pkg.name" role="option" :aria-selected="activeMatch === i">
              <RouterLink :to="{ name: 'package-detail', params: { name: pkg.name } }" :class="{ 'search__match--active': activeMatch === i }" tabindex="-1" @mousedown.prevent @click="searchOpen = false; menuOpen = false">
                <span class="search__info"><span class="search__name">{{ pkg.name }}</span><span v-if="pkg.description" class="search__description">{{ pkg.description }}</span></span><span v-if="pkg.latest_version" class="search__version">{{ pkg.latest_version }}</span>
              </RouterLink>
            </li>
          </ul>
          <p v-if="!matches.length" class="search__status" role="status">{{ error ? 'Suggestions unavailable. Press Enter to search.' : !index ? 'Loading packages…' : 'No matching packages.' }}</p>
          <button type="submit" class="search__all">View all search results →</button>
        </div>
      </form>

      <a class="docs-home" :href="config.site.docsHome" aria-label="Back to Xmake documentation">← Xmake Docs</a>

      <nav id="site-navigation" class="nav" :class="{ 'nav--open': menuOpen }">
        <RouterLink :to="{ name: 'packages' }" @click="menuOpen = false">Packages</RouterLink>
        <RouterLink :to="{ name: 'addons' }" @click="menuOpen = false">Addons</RouterLink>
        <RouterLink :to="{ name: 'about' }" @click="menuOpen = false">About</RouterLink>
        <a :href="config.site.docs" target="_blank" rel="noopener">Package guide</a>
        <a :href="config.site.github" target="_blank" rel="noopener">GitHub</a>
      </nav>

      <div class="actions">
        <ThemeToggle />
        <button class="menu-toggle" aria-label="Toggle menu" :aria-expanded="menuOpen" aria-controls="site-navigation" @click="menuOpen = !menuOpen">
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
.brand__logo {
  display: inline-block;
  width: 28px;
  height: 28px;
  /* The SVG is square; let the browser scale gracefully on hi-DPI displays. */
  object-fit: contain;
}

.search {
  position: relative;
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

.search__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  min-width: 240px;
  padding: 6px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background: var(--c-bg);
  box-shadow: 0 12px 32px rgb(0 0 0 / 12%);
  max-height: min(440px, 60dvh);
  overflow-y: auto;
}
.search__dropdown ul { list-style: none; padding: 0; margin: 0; }
.search__dropdown a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  color: var(--c-text-1);
  font-size: 13px;
}
.search__dropdown a > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.search__dropdown a:hover, .search__dropdown .search__match--active { background: var(--c-brand-soft); color: var(--c-brand-3); }
.search__info { flex: 1; min-width: 0; }
.search__name { display: block; font-weight: 600; }
.search__description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 3px; color: var(--c-text-3); font-size: 12px; line-height: 1.5; }
.search__version { align-self: flex-start; margin-top: 2px; color: var(--c-text-3); font-size: 11px; overflow-wrap: anywhere; max-width: 40%; }
.search__status { padding: 9px 10px; margin: 0; font-size: 13px; color: var(--c-text-3); }
.search__all { width: 100%; padding: 10px; text-align: left; background: none; border: 0; border-top: 1px solid var(--c-divider); color: var(--c-brand-3); font-size: 12px; }

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

.docs-home { white-space: nowrap; font-size: 13px; font-weight: 600; }
.docs-home:focus-visible { outline: 2px solid var(--c-brand-3); outline-offset: 4px; }

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
  .search { max-width: none; min-width: 0; }
  .nav { display: none; }
  .menu-toggle { display: inline-flex; }
}

@media (max-width: 640px) {
  .brand__name { display: none; }
  .app-header__inner { gap: var(--space-2); }
  .docs-home { margin-left: auto; }
  .search { margin: 0; }
}

@media (max-width: 480px) {
  .app-header__inner { height: auto; min-height: var(--header-h); flex-wrap: wrap; padding-top: 12px; padding-bottom: 12px; }
  .search { order: 4; flex-basis: 100%; }
  .search__dropdown { min-width: 0; }
  .app-header__inner .nav--open { top: 100%; }
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
