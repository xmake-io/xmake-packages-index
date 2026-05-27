<script setup lang="ts">
import { computed } from 'vue'
import type { PackageDetail } from '@/types'
import { snippetsFor } from '@/lib/usage'
import CodeBlock from '@/components/ui/CodeBlock.vue'

const props = defineProps<{ pkg: PackageDetail }>()
const snippets = computed(() => snippetsFor(props.pkg))
</script>

<template>
  <div class="usage">
    <CodeBlock
      v-for="s in snippets"
      :key="s.label"
      :code="s.code"
      :language="s.language"
      :title="s.label"
    />
  </div>
</template>

<style scoped>
.usage {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
