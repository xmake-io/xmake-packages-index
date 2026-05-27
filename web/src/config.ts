// Site-level config injected at build time from `../site.config.json` via Vite's `define`.
// Keep this as the single read point — components import from here, not the JSON directly.

declare const __SITE_CONFIG__: SiteConfig

export interface SiteConfig {
  site: {
    name: string
    title: string
    description: string
    url: string
    lang: string
    github: string
    indexRepo: string
    docs: string
  }
  ads: {
    wwadsId: string
    carbon: { code: string; placement: string }
  }
  ui: {
    brand: { primary: string; primaryLight: string; primaryDark: string }
    perPage: number
  }
}

export const config: SiteConfig = __SITE_CONFIG__

// Resolve a /data/* URL through the Vite base path so the site works under
// both a custom domain root and a sub-path (gh-pages project site).
export function dataUrl(relative: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + '/'
  return `${base}data/${relative.replace(/^\//, '')}`
}
