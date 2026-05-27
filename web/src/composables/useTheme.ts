// Module-scoped state so every component sees the same theme without prop drilling.
import { ref, watch } from 'vue'
import type { Theme } from '@/types'

const STORAGE_KEY = 'xmake-pkgs-theme'

function readInitial(): Theme {
  if (typeof document === 'undefined') return 'light'
  const cls = document.documentElement.classList.contains('dark')
  return cls ? 'dark' : 'light'
}

const theme = ref<Theme>(readInitial())

watch(theme, (val) => {
  document.documentElement.classList.toggle('dark', val === 'dark')
  document.documentElement.dataset.theme = val
  try {
    localStorage.setItem(STORAGE_KEY, val)
  } catch {}
})

export function useTheme() {
  const toggle = () => (theme.value = theme.value === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
