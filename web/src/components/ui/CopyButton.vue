<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ text: string; label?: string }>()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
  } catch {
    // Older browser fallback — silently no-op rather than crashing the page.
    const ta = document.createElement('textarea')
    ta.value = props.text
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {}
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <button class="copy-btn" :aria-label="label ?? 'Copy'" @click.stop="copy">
    <svg v-if="!copied" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path fill="currentColor" d="M9 16.17 5.53 12.7a1 1 0 1 0-1.42 1.42l4.18 4.18a1 1 0 0 0 1.42 0L20.89 7.12a1 1 0 1 0-1.42-1.42L9 16.17Z"/>
    </svg>
    <span>{{ copied ? 'Copied' : (label ?? 'Copy') }}</span>
  </button>
</template>

<style scoped>
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
  background: var(--c-bg);
  color: var(--c-text-2);
  font-size: 12px;
  font-weight: 500;
  transition: all var(--transition);
}
.copy-btn:hover {
  border-color: var(--c-brand-3);
  color: var(--c-brand-3);
}
</style>
