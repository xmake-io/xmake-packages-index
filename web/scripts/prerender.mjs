#!/usr/bin/env node
// Emit a real static HTML file at every route the SPA can navigate to.
//
//   dist/index.html            (existing — home)
//   dist/packages/index.html   (listing page)
//   dist/about/index.html
//   dist/packages/<name>/index.html   (one per package)
//   dist/404.html              (SPA fallback for unknown URLs)
//
// We don't render Vue components server-side — the page shell + JS bundle
// still hydrate the dynamic content. What we DO is:
//   - Make every URL resolve to a real file on disk (no SPA 404 trick).
//   - Per-page <title> + <meta description> so search engines and link
//     previews see the package name, not a generic "Xmake Packages".

import { promises as fs } from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const here = path.dirname(url.fileURLToPath(import.meta.url))
const webRoot = path.resolve(here, '..')
const distDir = path.join(webRoot, 'dist')
const dataDir = path.join(webRoot, 'public', 'data')

const siteCfg = JSON.parse(
  await fs.readFile(path.resolve(webRoot, '..', 'site.config.json'), 'utf8'),
)
const siteName = siteCfg.site.title

async function readIndex() {
  return fs.readFile(path.join(distDir, 'index.html'), 'utf8')
}

// Naive <title> / <meta description> rewriter. We could pull in a real HTML
// parser, but the shell is well-defined and tiny — string replacement is fine.
function withMeta(html, { title, description }) {
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  )
  return out
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
}
function escapeAttr(s) {
  return String(s).replace(/[&"<>]/g, (c) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[c])
}

async function writeRoute(routePath, html) {
  // "/" → dist/index.html ; "/packages" → dist/packages/index.html ; etc.
  const target =
    routePath === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, routePath.replace(/^\//, ''), 'index.html')
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, html)
}

async function main() {
  const shell = await readIndex()

  // Static routes
  await writeRoute('/', withMeta(shell, { title: siteName, description: siteCfg.site.description }))
  await writeRoute('/packages', withMeta(shell, {
    title: `Packages · ${siteName}`,
    description: 'Browse and search all xmake-repo packages.',
  }))
  await writeRoute('/about', withMeta(shell, {
    title: `About · ${siteName}`,
    description: 'About the xmake-repo package index.',
  }))

  // GitHub Pages serves dist/404.html on any unmatched URL — keep this as a
  // safety net for paths the SPA still owns (e.g. ?q= queries on /packages).
  await fs.writeFile(
    path.join(distDir, '404.html'),
    withMeta(shell, { title: `Not found · ${siteName}`, description: siteCfg.site.description }),
  )

  // Per-package routes from index.json
  const index = JSON.parse(await fs.readFile(path.join(dataDir, 'index.json'), 'utf8'))
  let count = 0
  for (const p of index.packages) {
    if (!p.name) continue
    const desc = (p.description || siteCfg.site.description).slice(0, 200)
    await writeRoute(
      `/packages/${p.name}`,
      withMeta(shell, { title: `${p.name} · ${siteName}`, description: desc }),
    )
    count++
  }
  console.log(`prerender: emitted ${count + 4} HTML files`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
