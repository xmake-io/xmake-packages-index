#!/usr/bin/env node
// Emit readable static content and metadata; Vue replaces the initial content
// with the interactive UI on mount. Both use the same package dataset.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pageMeta, metadataHtml, breadcrumbJson, escapeHtml as e } from '../shared/seo.mjs'

import { categories, categoryEntries, categoryPageSize, categoryRoute } from '../shared/catalog.mjs'
import { quickUsage, snippetGroups, addonSnippetGroups } from '../shared/usage.mjs'
import { detailContent, lastModified } from '../shared/package-content.mjs'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(webRoot, 'dist')
const data = path.join(webRoot, 'public/data')
const { site } = JSON.parse(await fs.readFile(path.join(webRoot, '../site.config.json'), 'utf8'))
const base = (process.env.VITE_BASE || '/').replace(/\/$/, '')
const link = route => base + route
const shell = (await fs.readFile(path.join(dist, 'index.html'), 'utf8'))
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<meta\b(?=[^>]*(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)")[^>]*>/g, '')
  .replace(/<script id="page-breadcrumbs"[\s\S]*?<\/script>/g, '')
  .replace(/<link\b(?=[^>]*rel="canonical")[^>]*>/g, '')
const packages = JSON.parse(await fs.readFile(path.join(data, 'index.json'), 'utf8')).packages
let addons = []
try { addons = JSON.parse(await fs.readFile(path.join(data, 'addons.json'), 'utf8')).addons || [] }
catch (err) { if (err.code !== 'ENOENT') throw err }
const relations = JSON.parse(await fs.readFile(path.join(data, 'package-relations.json'), 'utf8'))
const addonRelations = JSON.parse(await fs.readFile(path.join(data, 'addon-relations.json'), 'utf8'))
const addonNames = new Set(addons.map(a => a.name))
const packageNames = new Set(packages.map(p => p.name))
const urls = []
const nav = `<nav class="container" aria-label="Main navigation"><a href="${e(link('/'))}">Xmake Packages</a> · <a href="${e(link('/packages/'))}">Packages</a> · <a href="${e(link('/addons/'))}">Addons</a> · <a href="${e(link('/categories/'))}">Categories</a> · <a href="${e(site.docsHome)}">← Xmake Docs</a></nav>`
const docs = `<p><a href="${e(site.docs)}">Learn how to add and link packages with Xmake →</a></p>`
const entryPath = (kind, name) => {
  if (!name || name === '.' || name === '..' || !/^[a-z\d_+.-]+$/i.test(name)) throw new Error(`Invalid entry name: ${name}`)
  return `/${kind}/${encodeURIComponent(name)}`
}
const list = (entries, kind) => '<ul>' + entries.map(entry => `<li><a href="${e(link(entryPath(kind, entry.name) + '/'))}">${e(entry.name)}</a>${entry.description ? ' — ' + e(entry.description) : ''}</li>`).join('\n') + '</ul>'
async function emit(route, content, entry, notFound = false) {
  const meta = pageMeta(site, route, entry)
  if (notFound) meta.indexable = false
  const schema = breadcrumbJson(meta, site.url)
  const breadcrumb = meta.breadcrumbs.length ? `<nav aria-label="Breadcrumb">${meta.breadcrumbs.map((crumb,i) => i === meta.breadcrumbs.length - 1 ? `<span aria-current="page">${e(crumb.name)}</span>` : `<a href="${e(link(crumb.path === '/' ? '/' : crumb.path + '/'))}">${e(crumb.name)}</a>`).join(' / ')}</nav>` : ''
  const html = shell.replace('</head>', metadataHtml(meta, site.name) + (schema ? `<script id="page-breadcrumbs" type="application/ld+json">${schema}</script>` : '') + '\n</head>')
    .replace(/<div id="app">[\s\S]*?<\/div>/, `<div id="app">${nav}<main class="container">${breadcrumb}${content}</main></div>`)
  const file = notFound ? path.join(dist, '404.html') : path.join(dist, decodeURIComponent(route).replace(/^\//, ''), 'index.html')
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, html)
  if (meta.indexable) urls.push({ loc: meta.canonical, lastmod: lastModified(entry?.updated_at) })
}
await emit('/', `<h1>Discover C/C++ packages for Xmake</h1><p>${e(site.description)}</p><p><a href="${e(link('/packages/'))}">Browse ${packages.length} packages</a> · <a href="${e(link('/addons/'))}">Browse addons</a></p>${docs}`)
await emit('/packages', `<h1>C/C++ Packages</h1><p>Browse packages from xmake-repo. Open a package for versions and integration instructions.</p>${docs}${list(packages, 'packages')}`)
await emit('/addons', `<h1>Xmake Addons</h1><p>Plugins, rules, toolchains, templates, and modules for Xmake.</p>${list(addons, 'addons')}`)
await emit('/about', `<h1>About Xmake Packages</h1><p>${e(site.description)}</p><p>This index is generated from <a href="${e(site.github)}">xmake-repo</a>.</p>${docs}`)
await emit('/categories', `<h1>Package categories</h1><p>Find libraries, build tools, compiler toolchains and extensions for Xmake.</p><ul>${categories.map(category => `<li><a href="${e(link(categoryRoute(category.slug) + '/'))}">${e(category.label)}</a> — ${e(category.description)}</li>`).join('')}</ul>`)
for (const category of categories) {
 const entries = categoryEntries(category, packages, addons)
 const pages = Math.max(1, Math.ceil(entries.length / categoryPageSize))
 for (let page = 1; page <= pages; page++) {
   const pager = `<nav aria-label="Category pages">${page > 1 ? `<a href="${e(link(categoryRoute(category.slug, page - 1) + '/'))}">← Previous</a>` : ''} ${page < pages ? `<a href="${e(link(categoryRoute(category.slug, page + 1) + '/'))}">Next →</a>` : ''}</nav>`
   await emit(categoryRoute(category.slug, page), `<h1>${e(category.label)}</h1><p>${e(category.description)}</p><p>${entries.length} ${category.kind === 'addon' ? 'addons' : 'packages'} · Page ${page} of ${pages}</p>${list(entries.slice((page - 1) * categoryPageSize, page * categoryPageSize), category.kind === 'addon' ? 'addons' : 'packages')}${pager}`)
 }
}
for (const [kind, entries] of [['packages', packages], ['addons', addons]]) {
  for (const entry of entries) {
    const route = entryPath(kind, entry.name)
    const detail = JSON.parse(await fs.readFile(path.join(data, kind, entry.name + '.json'), 'utf8'))
    if (detail.name !== entry.name) throw new Error(`Detail mismatch: ${entry.name}`)
    const entryData = { ...entry, ...detail, ...(kind === 'addons' ? {kind:'addon'} : {}) }
    const extra = detailContent(detail, kind === 'addons' ? addonNames : packageNames, kind === 'packages' ? relations[entry.name] || [] : addonRelations[entry.name] || [], link, kind)
    const quick = quickUsage(entryData)
    const groups = kind === 'addons' ? addonSnippetGroups(entryData) : snippetGroups(entryData)
    const usage = groups.map(group => `<section><h2>${e(group.title)}</h2><p>${e(group.description)}</p>${group.snippets.map(snippet => `<h3>${e(snippet.label)}</h3><pre><code>${e(snippet.code)}</code></pre>`).join('')}</section>`).join('')
    const guide = kind === 'addons' ? `<p><a href="${e(site.docsHome + 'guide/extensions/addons/introduction.html')}">Learn how to use Xmake addons →</a></p>` : docs
    await emit(route, `<h1>${e(entry.name)}</h1><p>${e(detail.description || '')}</p>${entry.latest_version ? `<p>Latest version: ${e(entry.latest_version)}</p>` : ''}<h2>${e(quick.title)}</h2><pre><code>${e(quick.code)}</code></pre>${guide}${extra}${usage}`, entryData)
  }
}
await emit('/404', `<h1>Page not found</h1><p><a href="${e(link('/packages/'))}">Browse packages</a> or <a href="${e(site.docsHome)}">return to Xmake documentation</a>.</p>`, undefined, true)
await fs.writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `<url><loc>${e(url.loc)}</loc>${url.lastmod ? `<lastmod>${e(url.lastmod)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`)
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url.replace(/\/$/, '')}/sitemap.xml\n`)
console.log(`prerender: emitted ${urls.length + 1} readable HTML pages, sitemap.xml and robots.txt`)
