import { config } from '@/config'
import { pageMeta } from '../../shared/seo.mjs'

export function updatePageSeo(path: string, entry?: {name: string; description?: string}) {
  const meta = pageMeta(config.site, path, entry)
  document.title = meta.title
  const tags: [string, string, string][] = [
    ['name', 'description', meta.description], ['name', 'robots', meta.indexable ? 'index, follow' : 'noindex, follow'],
    ['property', 'og:type', 'website'], ['property', 'og:site_name', config.site.name],
    ['property', 'og:title', meta.title], ['property', 'og:description', meta.description], ['property', 'og:url', meta.canonical],
    ['name', 'twitter:card', 'summary'], ['name', 'twitter:title', meta.title], ['name', 'twitter:description', meta.description]
  ]
  for (const [attribute, key, value] of tags) {
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, key); document.head.append(tag) }
    tag.content = value
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
  canonical.href = meta.canonical
}
