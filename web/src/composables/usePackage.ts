// Per-name detail loader. Detail JSON is cached in @/lib/data so route revisits
// are instant; on first visit we surface loading/error state for the view.

import { ref, watch } from 'vue'
import { loadPackage } from '@/lib/data'
import type { PackageDetail } from '@/types'

export function usePackage(nameRef: () => string) {
  const pkg = ref<PackageDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    const n = nameRef()
    if (!n) return
    loading.value = true
    error.value = null
    pkg.value = null
    try {
      pkg.value = await loadPackage(n)
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  watch(nameRef, load, { immediate: true })
  return { pkg, loading, error }
}
