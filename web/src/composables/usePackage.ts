// Per-name detail loader. Detail JSON is cached in @/lib/data so route revisits
// are instant; on first visit we surface loading/error state for the view.

import { ref, watch } from 'vue'
import { loadAddon, loadPackage } from '@/lib/data'
import type { PackageDetail } from '@/types'

export function usePackage(nameRef: () => string, loader = loadPackage) {
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
      pkg.value = await loader(n)
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  watch(nameRef, load, { immediate: true })
  return { pkg, loading, error }
}

// The addon documents have the same shape, they only live in another dataset.
export function useAddon(nameRef: () => string) {
  return usePackage(nameRef, loadAddon)
}
