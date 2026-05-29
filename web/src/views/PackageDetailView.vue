<script setup lang="ts">
import { computed } from 'vue'
import { usePackage } from '@/composables/usePackage'
import PackageMeta from '@/components/package/PackageMeta.vue'
import PackagePlatforms from '@/components/package/PackagePlatforms.vue'
import PackageConfigs from '@/components/package/PackageConfigs.vue'
import PackageVersions from '@/components/package/PackageVersions.vue'
import PackageUsage from '@/components/package/PackageUsage.vue'
import PackageDeps from '@/components/package/PackageDeps.vue'
import CodeBlock from '@/components/ui/CodeBlock.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { config } from '@/config'

const props = defineProps<{ name: string }>()
const { pkg, loading, error } = usePackage(() => props.name)

const aliasText = computed(() => {
  const a = pkg.value?.alias
  if (!a) return ''
  return Array.isArray(a) ? a.join(', ') : a
})

// Deep-link to the package's xmake.lua in the xmake-repo source tree so users
// can review history, raise issues, or send PRs without leaving the page.
const recipeUrl = computed(() => {
  const p = pkg.value
  if (!p) return ''
  return `${config.site.github}/blob/master/packages/${p.letter}/${p.name}/xmake.lua`
})

// The one-line "give me the import" snippet shown above the fold. We pin the
// version when available so the copied line is reproducible; otherwise we
// fall back to the bare name so old packages without versions still work.
const quickRequire = computed(() => {
  const p = pkg.value
  if (!p) return ''
  return p.latest_version
    ? `add_requires("${p.name} ${p.latest_version}")`
    : `add_requires("${p.name}")`
})
</script>

<template>
  <div class="container detail">
    <LoadingState v-if="loading" />
    <div v-else-if="error" class="error">Failed to load package: {{ error }}</div>
    <template v-else-if="pkg">
      <header class="detail__head">
        <div>
          <h1>{{ pkg.name }}</h1>
          <p v-if="aliasText" class="muted">alias: {{ aliasText }}</p>
          <p v-if="pkg.description" class="detail__desc">{{ pkg.description }}</p>
        </div>
        <div class="detail__head-tags">
          <span v-if="pkg.latest_version" class="chip chip--brand">{{ pkg.latest_version }}</span>
          <span v-if="pkg.kind" class="chip">{{ pkg.kind }}</span>
        </div>
      </header>

      <!-- Hero copy-the-import line. Most visitors land here knowing exactly
           what they want: the single add_requires call for their xmake.lua. -->
      <section class="quick">
        <CodeBlock :code="quickRequire" language="lua" title="Add to xmake.lua" />
      </section>

      <div class="detail__grid">
        <section class="detail__section">
          <h2>Information</h2>
          <PackageMeta :pkg="pkg" />
        </section>
        <section class="detail__section">
          <h2>Platforms</h2>
          <PackagePlatforms :pkg="pkg" />
        </section>
      </div>

      <section class="detail__section">
        <h2>Options</h2>
        <PackageConfigs :configs="pkg.configs" />
      </section>

      <div class="detail__grid">
        <section class="detail__section">
          <h2>Versions <span class="muted">({{ pkg.versions.length }})</span></h2>
          <PackageVersions :versions="pkg.versions" :latest="pkg.latest_tag" />
        </section>
        <section class="detail__section">
          <h2>Dependencies</h2>
          <PackageDeps :deps="pkg.deps" />
        </section>
      </div>

      <section v-if="pkg.package_source" class="detail__section">
        <h2>Package recipe <span class="muted">xmake.lua</span></h2>
        <p class="muted detail__hint">
          Verbatim source from xmake-repo.
          <a v-if="recipeUrl" :href="recipeUrl" target="_blank" rel="noopener">
            View on GitHub →
          </a>
        </p>
        <CodeBlock :code="pkg.package_source" language="lua" title="xmake.lua" />
      </section>

      <section class="detail__section">
        <h2>Install &amp; integrate</h2>
        <p class="muted detail__hint">Walkthroughs for the three common workflows.</p>
        <PackageUsage :pkg="pkg" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.detail__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--c-divider);
}
.detail__head h1 { font-size: 30px; margin: 0; }
.detail__head .muted { font-size: 13px; color: var(--c-text-3); margin: 4px 0 0; }
.detail__desc { color: var(--c-text-2); margin: var(--space-3) 0 0; max-width: 720px; }
.detail__head-tags { display: inline-flex; gap: 6px; }

.detail__section {
  margin: var(--space-8) 0;
}
.detail__section h2 {
  font-size: 17px;
  margin-bottom: var(--space-4);
  color: var(--c-text-1);
}
.detail__section h2 .muted {
  font-size: 13px;
  color: var(--c-text-3);
  font-weight: 400;
  margin-left: 6px;
}
.detail__hint {
  color: var(--c-text-3);
  font-size: 13px;
  margin: 0 0 var(--space-3);
}
.detail__hint a { color: var(--c-brand-3); margin-left: 4px; }

/* The quick-import snippet sits between the page head and the rest of the
   detail body. Pad it lightly so it feels distinct without competing with
   the more substantial sections that follow. */
.quick { margin: 0 0 var(--space-8); }

.detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}
.detail__grid .detail__section { margin: var(--space-6) 0; }

@media (max-width: 720px) {
  .detail__grid { grid-template-columns: 1fr; gap: 0; }
  .detail__head { flex-direction: column; }
}

.error { color: #c0392b; padding: var(--space-6) 0; }
</style>
