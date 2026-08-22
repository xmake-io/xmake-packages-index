// Shape of the JSON the indexer writes into web/public/data/.
// Keep in sync with indexer/lib/package_info.lua (the producer of these docs).

export interface PackageSummary {
  name: string
  description?: string
  license?: string | string[]
  // "addon" for the xmake addons, the recipe kind otherwise. The listing uses
  // it to link a summary to the right detail page.
  kind?: string
  latest_version?: string
  letter: string
  platforms: string[]
  added_at?: string
  updated_at?: string
}

export interface PackageConfig {
  name: string
  description?: string
  default?: unknown
  type?: string
  values?: unknown[]
}

export interface PackageDetail {
  name: string
  alias?: string | string[]
  description?: string
  homepage?: string
  license?: string | string[]
  kind?: string
  latest_version?: string
  latest_tag?: string
  versions: string[]
  urls: string[]
  repository_url?: string
  download_url?: string
  configs: PackageConfig[]
  deps: string[]
  extsources: string[]
  platforms: Record<string, string[]>
  letter: string
  added_at?: string
  updated_at?: string
  package_source?: string
}

export interface IndexFile {
  generated_at: string
  count: number
  packages: PackageSummary[]
}

// The addons of xmake-repo (addons/<letter>/<name>), they are installed with
// `xmake addon --install` and provide plugins, rules, toolchains, templates
// and modules. Their documents have the same shape as the package ones.
export type AddonSummary = PackageSummary
export type AddonDetail = PackageDetail

export interface AddonsFile {
  generated_at: string
  count: number
  addons: AddonSummary[]
}

export interface LatestFile {
  generated_at: string
  window_days: number
  added: PackageSummary[]
  updated: PackageSummary[]
}

export interface StatsFile {
  generated_at: string
  total: number
  addons?: number
  skipped: number
}

export type Theme = 'light' | 'dark'
