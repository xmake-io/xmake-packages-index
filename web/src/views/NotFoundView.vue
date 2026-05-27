<template>
  <div class="container nf">
    <h1>404</h1>
    <p>That page doesn't exist.</p>
    <RouterLink class="back" :to="{ name: 'home' }">← Back home</RouterLink>
  </div>
</template>

<style scoped>
.nf { text-align: center; padding: var(--space-16) 0; }
.nf h1 { font-size: 60px; margin: 0; color: var(--c-brand-3); }
.nf p { color: var(--c-text-2); margin: var(--space-4) 0; }
.back { color: var(--c-brand-3); }
</style>
