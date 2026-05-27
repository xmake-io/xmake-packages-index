// Thin fetch wrappers around the static JSON dataset under /data/.
// We cache responses so navigating back to /packages doesn't re-download index.json.

import { dataUrl } from '@/config'
import type { IndexFile, LatestFile, PackageDetail, StatsFile } from '@/types'

const cache = new Map<string, unknown>()

async function fetchJson<T>(rel: string): Promise<T> {
  if (cache.has(rel)) return cache.get(rel) as T
  const res = await fetch(dataUrl(rel))
  if (!res.ok) throw new Error(`fetch ${rel}: ${res.status}`)
  const data = (await res.json()) as T
  cache.set(rel, data)
  return data
}

export const loadIndex = () => fetchJson<IndexFile>('index.json')
export const loadLatest = () => fetchJson<LatestFile>('latest.json')
export const loadStats = () => fetchJson<StatsFile>('stats.json')
export const loadPackage = (name: string) =>
  fetchJson<PackageDetail>(`packages/${encodeURIComponent(name)}.json`)
