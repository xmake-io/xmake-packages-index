<script setup lang="ts">
import { computed } from 'vue'
import { useAddon } from '@/composables/usePackage'
import PackageMeta from '@/components/package/PackageMeta.vue'
import PackageVersions from '@/components/package/PackageVersions.vue'
import PackageUsage from '@/components/package/PackageUsage.vue'
import PackageDeps from '@/components/package/PackageDeps.vue'
import CodeBlock from '@/components/ui/CodeBlock.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { config } from '@/config'

const props = defineProps<{ name: string }>()
const { pkg: addon, loading, error } = useAddon(() => props.name)

// Deep-link to the recipe in the xmake-repo source tree. The addons live in
// their own top-level directory, next to the C/C++ packages.
const recipeUrl = computed(() => {
  const a = addon.value
  if (!a) return ''
  return `${config.site.github}/blob/master/addons/${a.letter}/${a.name}/xmake.lua`
})

// The one-line "give me this addon" snippet shown above the fold.
const quickInstall = computed(() => {
  const a = addon.value
  if (!a) return ''
  return a.latest_version
    ? `xmake addon --install "${a.name} ${a.latest_version}"`
    : `xmake addon --install ${a.name}`
})
</script>

<template>
  <div class="container detail">
    <LoadingState v-if="loading" />
    <div v-else-if="error" class="error">Failed to load addon: {{ error }}</div>
    <template v-else-if="addon">
      <header class="detail__head">
        <div>
          <p class="detail__crumb">
            <RouterLink :to="{ name: 'addons' }">Addons</RouterLink>
          </p>
          <h1>{{ addon.name }}</h1>
          <p v-if="addon.description" class="detail__desc">{{ addon.description }}</p>
        </div>
        <div class="detail__head-tags">
          <span v-if="addon.latest_version" class="chip chip--brand">{{ addon.latest_version }}</span>
          <span class="chip">addon</span>
        </div>
      </header>

      <section class="quick">
        <CodeBlock :code="quickInstall" language="bash" title="Install it" />
      </section>

      <div class="detail__grid">
        <section class="detail__section">
          <h2>Information</h2>
          <PackageMeta :pkg="addon" />
        </section>
        <section class="detail__section">
          <h2>Versions <span class="muted">({{ addon.versions.length }})</span></h2>
          <PackageVersions :versions="addon.versions" :latest="addon.latest_tag" />
        </section>
      </div>

      <section v-if="addon.deps && addon.deps.length" class="detail__section">
        <h2>Dependencies</h2>
        <p class="muted detail__hint">The other addons which this one needs.</p>
        <PackageDeps :deps="addon.deps" />
      </section>

      <section class="detail__section">
        <h2>Install &amp; use</h2>
        <PackageUsage :pkg="addon" addon />
      </section>

      <section v-if="addon.package_source" class="detail__section">
        <h2>Addon recipe <span class="muted">xmake.lua</span></h2>
        <p class="muted detail__hint">
          Verbatim source from xmake-repo.
          <a v-if="recipeUrl" :href="recipeUrl" target="_blank" rel="noopener">
            View on GitHub →
          </a>
        </p>
        <CodeBlock :code="addon.package_source" language="lua" title="xmake.lua" />
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
.detail__crumb { font-size: 13px; margin: 0 0 var(--space-2); }
.detail__desc { color: var(--c-text-2); margin: var(--space-3) 0 0; max-width: 720px; }
.detail__head-tags { display: inline-flex; gap: 6px; }

.detail { padding-top: var(--space-6); }
.quick { margin-bottom: var(--space-6); }

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
  margin: -6px 0 var(--space-4);
  font-size: 13px;
}

.detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-6);
}

.error {
  padding: var(--space-8) 0;
  color: var(--c-danger, #d9534f);
}
</style>
