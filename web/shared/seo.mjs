export function pageMeta(site, route, entry) {
  const path = route.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const addon = path.startsWith('/addons/')
  const detail = addon || path.startsWith('/packages/')
  const name = entry?.name || (detail ? decodeURIComponent(path.split('/').pop()) : '')
  const titles = { '/': site.title, '/packages': `C/C++ Packages · ${site.name}`, '/addons': `Xmake Addons · ${site.name}`, '/about': `About · ${site.name}` }
  const descriptions = { '/': site.description, '/packages': 'Browse C/C++ libraries and tools from xmake-repo. Find package versions, options, and Xmake integration examples.', '/addons': 'Explore Xmake plugins, rules, toolchains, templates, and modules. Find addon installation commands and source recipes.', '/about': 'Learn about the Xmake package index and how to contribute packages to xmake-repo.' }
  const known = detail || Object.hasOwn(titles, path)
  return {
    title: detail ? `${name} · ${addon ? 'Addons · ' : ''}${site.name}` : titles[path] || `Not found · ${site.name}`,
    description: entry?.description || (detail ? `Explore ${name} ${addon ? 'addon installation' : 'package versions and integration'} with Xmake.` : descriptions[path] || site.description),
    canonical: `${site.url.replace(/\/$/, '')}${path === '/' ? '/' : path + '/'}`,
    indexable: known,
  }
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]))
}

export function metadataHtml(meta, siteName) {
  const e = escapeHtml
  return `<title>${e(meta.title)}</title>
<meta name="description" content="${e(meta.description)}">
<link rel="canonical" href="${e(meta.canonical)}">
<meta name="robots" content="${meta.indexable ? 'index, follow' : 'noindex, follow'}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${e(siteName)}">
<meta property="og:title" content="${e(meta.title)}">
<meta property="og:description" content="${e(meta.description)}">
<meta property="og:url" content="${e(meta.canonical)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${e(meta.title)}">
<meta name="twitter:description" content="${e(meta.description)}">`
}
