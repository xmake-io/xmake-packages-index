// Lazy singleton loads of the JSON dataset. Each composable maintains its own
// error ref so a failed index.json doesn't suppress a working latest.json (the
// home page loads both; we don't want one taking down the other).

import { ref } from 'vue'
import { loadIndex, loadLatest, loadStats } from '@/lib/data'
import type { IndexFile, LatestFile, StatsFile } from '@/types'

const index = ref<IndexFile | null>(null)
const latest = ref<LatestFile | null>(null)
const stats = ref<StatsFile | null>(null)

const indexError = ref<string | null>(null)
const latestError = ref<string | null>(null)
const statsError = ref<string | null>(null)

let indexPromise: Promise<void> | null = null
let latestPromise: Promise<void> | null = null
let statsPromise: Promise<void> | null = null

export function useIndex() {
  if (!indexPromise) {
    indexPromise = loadIndex()
      .then((d) => {
        index.value = d
      })
      .catch((e) => {
        indexError.value = String(e)
        // Surface to the dev console too — easier to spot a 404 on data/index.json.
        console.error('[useIndex] failed to load index.json', e)
      })
  }
  return { index, error: indexError, ready: indexPromise }
}

export function useLatest() {
  if (!latestPromise) {
    latestPromise = loadLatest()
      .then((d) => {
        latest.value = d
      })
      .catch((e) => {
        latestError.value = String(e)
        console.error('[useLatest] failed to load latest.json', e)
      })
  }
  return { latest, error: latestError, ready: latestPromise }
}

export function useStats() {
  if (!statsPromise) {
    statsPromise = loadStats()
      .then((d) => {
        stats.value = d
      })
      .catch((e) => {
        statsError.value = String(e)
      })
  }
  return { stats, error: statsError, ready: statsPromise }
}
