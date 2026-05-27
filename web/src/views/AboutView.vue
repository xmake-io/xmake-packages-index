<script setup lang="ts">
import { config } from '@/config'
import { useStats } from '@/composables/useIndex'

const { stats } = useStats()
</script>

<template>
  <div class="container about">
    <h1>About</h1>
    <p>
      {{ config.site.name }} is an automatically generated, browsable index of
      C/C++ packages from the
      <a :href="config.site.github" target="_blank" rel="noopener">xmake-repo</a>
      repository. The index is rebuilt hourly via GitHub Actions; the site itself
      is a static Vue application.
    </p>

    <h2>How it works</h2>
    <ol>
      <li>
        A scheduled GitHub Action clones <code>xmake-repo</code> and runs
        <code>xmake l indexer/build.lua</code>, which loads every package
        through xmake's official loader and emits a JSON dataset.
      </li>
      <li>
        The Vue site fetches the dataset at runtime — no database, no API.
        Search and filtering happen client-side.
      </li>
      <li>
        The site is deployed to GitHub Pages (or any static host) as the action's
        final step.
      </li>
    </ol>

    <h2>Stats</h2>
    <p v-if="stats">
      Tracking <strong>{{ stats.total }}</strong> packages. Last refresh:
      <code>{{ stats.generated_at }}</code>.
    </p>

    <h2>Contribute</h2>
    <p>
      To submit or update a package, open a pull request against the
      <a :href="config.site.github" target="_blank" rel="noopener">xmake-repo</a>
      repository. Site improvements live in
      <a :href="config.site.indexRepo" target="_blank" rel="noopener">{{ config.site.indexRepo }}</a>.
    </p>
  </div>
</template>

<style scoped>
.about h1 { font-size: 28px; margin-bottom: var(--space-4); }
.about h2 {
  font-size: 18px;
  margin: var(--space-8) 0 var(--space-3);
}
.about p, .about li {
  color: var(--c-text-2);
  line-height: 1.7;
}
.about ol { padding-left: var(--space-5); }
.about code { font-size: 0.9em; }
</style>
