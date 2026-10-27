import { categoryFor, categoryFromRoute, categoryRoute, packageKind } from './catalog.mjs'

export function pageMeta(site, route, entry) {
  const path = route.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const addon = /^\/addons\/[^/]+$/.test(path)
  const detail = addon || /^\/packages\/[^/]+$/.test(path)
  const name = entry?.name || (detail ? decodeURIComponent(path.split('/').pop()) : '')
  const categoryPage = categoryFromRoute(path)
  const titles = { '/': site.title, '/packages': `C/C++ Packages · ${site.name}`, '/addons': `Xmake Addons · ${site.name}`, '/categories': `Package categories · ${site.name}`, '/about': `About · ${site.name}` }
  const descriptions = { '/': site.description, '/packages': 'Browse C/C++ libraries and tools from xmake-repo. Find package versions, options, and Xmake integration examples.', '/addons': 'Explore Xmake plugins, rules, toolchains, templates, and modules. Find addon installation commands and source recipes.', '/categories': 'Browse Xmake libraries, executable tools, compiler toolchains, addons and other packages by type.', '/about': 'Learn about the Xmake package index and how to contribute packages to xmake-repo.' }
  const kind = addon ? 'addon' : packageKind(entry)
  const actions = {library:'Library installation and linking', binary:'Tool installation and usage', toolchain:'Toolchain installation and setup', addon:'Addon installation and project setup', other:'Package installation and configuration'}
  const summaries = {library:'Install and link this library with Xmake. Browse versions, options and dependencies.',binary:'Install this tool with xrepo and use its package environment. Browse versions and dependencies.',toolchain:'Install this toolchain package and configure it with Xmake. Browse platforms, options and dependencies.',addon:'Install this Xmake addon and declare it with add_addons. Browse versions, addon dependencies and project setup.',other:'Install and configure this package with Xmake. Review its recipe and dependencies.'}
  const known = detail || !!categoryPage || Object.hasOwn(titles, path)
  const canonical = `${site.url.replace(/\/$/, '')}${path === '/' ? '/' : path + '/'}`
  const crumbs = [{name:'Home',path:'/'}]
  if (detail) {
    const category = categoryFor(addon ? {kind:'addon'} : entry)
    crumbs.push({name:'Categories',path:'/categories'}, {name:category.label,path:categoryRoute(category.slug)}, {name,path})
  } else if (categoryPage) {
    crumbs.push({name:'Categories',path:'/categories'}, {name:categoryPage.category.label,path:categoryRoute(categoryPage.category.slug)})
    if (categoryPage.page > 1) crumbs.push({name:`Page ${categoryPage.page}`,path})
  } else if (path !== '/' && known) crumbs.push({name: path === '/categories' ? 'Categories' : path === '/addons' ? 'Addons' : path === '/packages' ? 'Packages' : 'About',path})
  const description = detail ? `${entry?.description ? entry.description.trim() + (/[.!?]$/.test(entry.description.trim()) ? ' ' : '. ') : name + '. '}${summaries[kind]}` : categoryPage ? categoryPage.category.description : descriptions[path] || site.description
  return {
    title: detail ? `${name} — ${actions[kind]} · ${site.name}` : categoryPage ? `${categoryPage.category.label}${categoryPage.page > 1 ? ` — Page ${categoryPage.page}` : ''} · ${site.name}` : titles[path] || `Not found · ${site.name}`,
    description, canonical, indexable: known, breadcrumbs: known && path !== '/' ? crumbs : [],
  }
}

export function breadcrumbData(meta, siteUrl) {
  if (meta.breadcrumbs.length < 2) return undefined
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: meta.breadcrumbs.map((crumb, i) => ({'@type':'ListItem',position:i+1,name:crumb.name,item:siteUrl.replace(/\/$/,'') + (crumb.path === '/' ? '/' : crumb.path.replace(/\/$/,'') + '/')})) }
}
export function breadcrumbJson(meta, siteUrl) {
  const data = breadcrumbData(meta, siteUrl)
  return data ? JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') : ''
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
