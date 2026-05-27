// Lazy singleton load of index.json — every component that wants the full
// package list calls useIndex() and shares the same promise.

import { ref } from 'vue'
import { loadIndex, loadLatest, loadStats } from '@/lib/data'
import type { IndexFile, LatestFile, StatsFile } from '@/types'

const index = ref<IndexFile | null>(null)
const latest = ref<LatestFile | null>(null)
const stats = ref<StatsFile | null>(null)
const error = ref<string | null>(null)

let indexPromise: Promise<void> | null = null
let latestPromise: Promise<void> | null = null
let statsPromise: Promise<void> | null = null

function track<T>(p: Promise<T>): Promise<T> {
  return p.catch((e) => {
    error.value = String(e)
    throw e
  })
}

export function useIndex() {
  if (!indexPromise) {
    indexPromise = track(loadIndex()).then((d) => {
      index.value = d
    })
  }
  return { index, error, ready: indexPromise }
}

export function useLatest() {
  if (!latestPromise) {
    latestPromise = track(loadLatest()).then((d) => {
      latest.value = d
    })
  }
  return { latest, error, ready: latestPromise }
}

export function useStats() {
  if (!statsPromise) {
    statsPromise = track(loadStats()).then((d) => {
      stats.value = d
    })
  }
  return { stats, error, ready: statsPromise }
}
