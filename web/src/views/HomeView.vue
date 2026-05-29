<script setup lang="ts">
import { computed } from 'vue'
import { useLatest, useStats } from '@/composables/useIndex'
import PackageList from '@/components/package/PackageList.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import AdBar from '@/components/layout/AdBar.vue'
import { config } from '@/config'

const { latest } = useLatest()
const { stats } = useStats()

const recentAdded = computed(() => latest.value?.added?.slice(0, 12) ?? [])
const recentUpdated = computed(() => latest.value?.updated?.slice(0, 12) ?? [])
</script>

<template>
  <section class="hero">
    <div class="container">
      <h1 class="hero__title">
        Discover C/C++ packages for
        <span class="hero__brand">Xmake</span>
      </h1>
      <p class="hero__desc">{{ config.site.description }}</p>
      <div class="hero__actions">
        <RouterLink class="btn btn--primary" :to="{ name: 'packages' }">Browse packages</RouterLink>
        <a class="btn" :href="config.site.docs" target="_blank" rel="noopener">Read the docs</a>
      </div>
      <p v-if="stats" class="hero__stats">
        Indexing <strong>{{ stats.total }}</strong> packages · last refresh
        {{ stats.generated_at.slice(0, 16).replace('T', ' ') }} UTC
      </p>
    </div>
  </section>

  <AdBar slot-name="home" />

  <section class="container feed">
    <header class="feed__header">
      <h2>Recently added</h2>
      <p v-if="latest" class="muted">in the past {{ latest.window_days }} days</p>
    </header>
    <LoadingState v-if="!latest" />
    <PackageList v-else-if="recentAdded.length" :packages="recentAdded" />
    <p v-else class="empty muted">No new packages in this window.</p>

    <header class="feed__header">
      <h2>Recently updated</h2>
      <p v-if="latest" class="muted">in the past {{ latest.window_days }} days</p>
    </header>
    <LoadingState v-if="!latest" />
    <PackageList v-else-if="recentUpdated.length" :packages="recentUpdated" />
    <p v-else class="empty muted">No updates in this window.</p>
  </section>
</template>

<style scoped>
.hero {
  /* Tighter top/bottom so the recent-added cards sit closer to the hero. */
  padding: var(--space-10) 0 var(--space-6);
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, var(--c-brand-soft), transparent 60%);
}
.hero__title {
  font-size: clamp(26px, 3.4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.hero__brand {
  background: linear-gradient(120deg, var(--c-brand-2) 30%, var(--c-brand-1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero__desc {
  margin: var(--space-3) auto 0;
  max-width: 640px;
  color: var(--c-text-2);
  font-size: 16px;
}
.hero__actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-5);
  flex-wrap: wrap;
}
.hero__stats {
  margin-top: var(--space-4);
  color: var(--c-text-3);
  font-size: 13px;
}

.btn {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  color: var(--c-text-1);
  font-weight: 500;
  background: var(--c-bg);
  transition: all var(--transition);
}
.btn:hover { border-color: var(--c-brand-3); color: var(--c-brand-3); }
.btn--primary {
  background: var(--c-brand-3);
  color: #fff;
  border-color: transparent;
}
.btn--primary:hover { background: var(--c-brand-2); color: #fff; }

/* Snug against the hero — the radial gradient already provides separation. */
.feed { margin-top: var(--space-5); }
.feed__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin: var(--space-6) 0 var(--space-3);
}
.feed__header:first-child { margin-top: 0; }
.feed__header h2 { font-size: 20px; }
.muted { color: var(--c-text-3); font-size: 13px; }
.empty { padding: var(--space-6) 0; }
</style>
