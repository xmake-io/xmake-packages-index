<script setup lang="ts">
import { computed } from 'vue'
import CopyButton from './CopyButton.vue'
import { highlight } from '@/lib/highlight'

const props = defineProps<{ code: string; language?: string; title?: string }>()

// v-html is safe here: the highlighter pre-escapes any unrecognized language
// path, and `code` itself is generated from package metadata at build time
// (no user-controlled content).
const highlighted = computed(() => highlight(props.code, props.language))
</script>

<template>
  <div class="code-block">
    <div class="code-block__header">
      <span class="code-block__lang">{{ title ?? language ?? '' }}</span>
      <CopyButton :text="code" />
    </div>
    <pre><code class="hljs" v-html="highlighted" /></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--c-code-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  /* Inside flex / grid parents, declare a min-width so a long, unwrapped
     code line can scroll inside the block rather than expanding the page. */
  min-width: 0;
  max-width: 100%;
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
