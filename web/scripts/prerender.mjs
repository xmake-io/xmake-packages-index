#!/usr/bin/env node
// Emit readable static content and metadata; Vue replaces the initial content
// with the interactive UI on mount. Both use the same package dataset.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pageMeta, metadataHtml, escapeHtml as e } from '../shared/seo.mjs'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(webRoot, 'dist')
const data = path.join(webRoot, 'public/data')
const { site } = JSON.parse(await fs.readFile(path.join(webRoot, '../site.config.json'), 'utf8'))
const base = (process.env.VITE_BASE || '/').replace(/\/$/, '')
const link = route => base + route
const shell = (await fs.readFile(path.join(dist, 'index.html'), 'utf8'))
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<meta\b(?=[^>]*(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)")[^>]*>/g, '')
  .replace(/<link\b(?=[^>]*rel="canonical")[^>]*>/g, '')
const packages = JSON.parse(await fs.readFile(path.join(data, 'index.json'), 'utf8')).packages
let addons = []
try { addons = JSON.parse(await fs.readFile(path.join(data, 'addons.json'), 'utf8')).addons || [] }
catch (err) { if (err.code !== 'ENOENT') throw err }
const urls = []
const nav = `<nav class="container" aria-label="Main navigation"><a href="${e(link('/'))}">Xmake Packages</a> · <a href="${e(link('/packages/'))}">Packages</a> · <a href="${e(link('/addons/'))}">Addons</a> · <a href="${e(site.docsHome)}">← Xmake Docs</a></nav>`
const docs = `<p><a href="${e(site.docs)}">Learn how to add and link packages with Xmake →</a></p>`
const entryPath = (kind, name) => {
  if (!name || name === '.' || name === '..' || !/^[a-z\d_+.-]+$/i.test(name)) throw new Error(`Invalid entry name: ${name}`)
  return `/${kind}/${encodeURIComponent(name)}`
}
const list = (entries, kind) => '<ul>' + entries.map(entry => `<li><a href="${e(link(entryPath(kind, entry.name) + '/'))}">${e(entry.name)}</a>${entry.description ? ' — ' + e(entry.description) : ''}</li>`).join('\n') + '</ul>'
async function emit(route, content, entry, notFound = false) {
  const meta = pageMeta(site, route, entry)
  if (notFound) meta.indexable = false
  const html = shell.replace('</head>', metadataHtml(meta, site.name) + '\n</head>')
    .replace(/<div id="app">[\s\S]*?<\/div>/, `<div id="app">${nav}<main class="container">${content}</main></div>`)
  const file = notFound ? path.join(dist, '404.html') : path.join(dist, decodeURIComponent(route).replace(/^\//, ''), 'index.html')
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, html)
  if (meta.indexable) urls.push(meta.canonical)
}
await emit('/', `<h1>Discover C/C++ packages for Xmake</h1><p>${e(site.description)}</p><p><a href="${e(link('/packages/'))}">Browse ${packages.length} packages</a> · <a href="${e(link('/addons/'))}">Browse addons</a></p>${docs}`)
await emit('/packages', `<h1>C/C++ Packages</h1><p>Browse packages from xmake-repo. Open a package for versions and integration instructions.</p>${docs}${list(packages, 'packages')}`)
await emit('/addons', `<h1>Xmake Addons</h1><p>Plugins, rules, toolchains, templates, and modules for Xmake.</p>${list(addons, 'addons')}`)
await emit('/about', `<h1>About Xmake Packages</h1><p>${e(site.description)}</p><p>This index is generated from <a href="${e(site.github)}">xmake-repo</a>.</p>${docs}`)
for (const [kind, entries] of [['packages', packages], ['addons', addons]]) {
  for (const entry of entries) {
    const route = entryPath(kind, entry.name)
    const spec = entry.name + (entry.latest_version ? ' ' + entry.latest_version : '')
    const command = kind === 'packages' ? `add_requires(${JSON.stringify(spec)})` : `xmake addon --install ${JSON.stringify(spec)}`
    await emit(route, `<p><a href="${e(link('/'+kind+'/'))}">${kind === 'packages' ? 'Packages' : 'Addons'}</a> / ${e(entry.name)}</p><h1>${e(entry.name)}</h1><p>${e(entry.description || '')}</p>${entry.latest_version ? `<p>Latest version: ${e(entry.latest_version)}</p>` : ''}<h2>${kind === 'packages' ? 'Add to xmake.lua' : 'Install addon'}</h2><pre><code>${e(command)}</code></pre>${kind === 'packages' ? docs : `<p><a href="${e(site.docsHome)}">Xmake documentation →</a></p>`}`, entry)
  }
}
await emit('/404', `<h1>Page not found</h1><p><a href="${e(link('/packages/'))}">Browse packages</a> or <a href="${e(site.docsHome)}">return to Xmake documentation</a>.</p>`, undefined, true)
await fs.writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `<url><loc>${e(url)}</loc></url>`).join('\n')}\n</urlset>\n`)
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url.replace(/\/$/, '')}/sitemap.xml\n`)
console.log(`prerender: emitted ${urls.length + 1} readable HTML pages, sitemap.xml and robots.txt`)
