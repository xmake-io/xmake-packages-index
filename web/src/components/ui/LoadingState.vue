<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <div class="loading">
    <div class="spinner" aria-hidden="true"></div>
    <span>{{ message ?? 'Loading…' }}</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12) 0;
  color: var(--c-text-3);
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-brand-3);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
