<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggle"
  >
    <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 14a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm9-7a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM5 11a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2h1Zm12.95-6.95a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.7-.71a1 1 0 0 1 1.42 0ZM7.17 17.83a1 1 0 0 1 0 1.41l-.7.71a1 1 0 1 1-1.42-1.41l.71-.71a1 1 0 0 1 1.41 0Zm10.78 0a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.7a1 1 0 0 1 0-1.42ZM7.17 6.17a1 1 0 0 1-1.41 0l-.71-.7a1 1 0 0 1 1.42-1.42l.7.71a1 1 0 0 1 0 1.41Z"
      />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21 13.06A8.96 8.96 0 0 1 11 21a9 9 0 0 1-1.06-17.94 1 1 0 0 1 1.05 1.38A7 7 0 0 0 19.56 12a1 1 0 0 1 1.44 1.06Z"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: transparent;
  border: 1px solid var(--c-border);
  color: var(--c-text-2);
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}
.theme-toggle:hover {
  color: var(--c-brand-3);
  border-color: var(--c-brand-3);
}
</style>
