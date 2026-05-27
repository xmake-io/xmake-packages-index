<script setup lang="ts">
import CopyButton from './CopyButton.vue'

defineProps<{ code: string; language?: string; title?: string }>()
</script>

<template>
  <div class="code-block">
    <div class="code-block__header">
      <span class="code-block__lang">{{ title ?? language ?? '' }}</span>
      <CopyButton :text="code" />
    </div>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--c-code-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px var(--space-3);
  border-bottom: 1px solid var(--c-border);
  background: var(--c-bg-soft);
}
.code-block__lang {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-text-3);
}
.code-block pre {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.55;
  color: var(--c-code-text);
  white-space: pre;
  overflow-x: auto;
}
.code-block code { background: transparent; padding: 0; }
</style>
