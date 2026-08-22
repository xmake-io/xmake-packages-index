<script setup lang="ts">
import { computed } from 'vue'
import type { PackageDetail } from '@/types'
import { addonSnippetGroups, snippetGroups } from '@/lib/usage'
import CodeBlock from '@/components/ui/CodeBlock.vue'

// The addons are installed with `xmake addon`, not with `add_requires`,
// so they get their own snippets, @see @/lib/usage
const props = defineProps<{ pkg: PackageDetail; addon?: boolean }>()
const groups = computed(() =>
  props.addon ? addonSnippetGroups(props.pkg) : snippetGroups(props.pkg),
)
</script>

<template>
  <div class="usage">
    <section v-for="g in groups" :key="g.id" class="usage__group">
      <header class="usage__head">
        <h3 class="usage__title">{{ g.title }}</h3>
        <p class="usage__desc">{{ g.description }}</p>
      </header>
      <div class="usage__snippets">
        <CodeBlock
          v-for="s in g.snippets"
          :key="s.label"
          :code="s.code"
          :language="s.language"
          :title="s.label"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.usage {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.usage__group {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5) var(--space-5);
  background: var(--c-bg-elv);
}

.usage__head { margin-bottom: var(--space-3); }
.usage__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--c-text-1);
}
.usage__desc {
  margin: 4px 0 0;
  color: var(--c-text-3);
  font-size: 13px;
  line-height: 1.55;
}

.usage__snippets {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
