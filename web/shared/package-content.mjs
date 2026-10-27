import { escapeHtml as e } from './seo.mjs'
export const array = value => Array.isArray(value) ? value : []
export const dependencyName = spec => String(spec).trim().split(/\s+/)[0]
export const validName = name => typeof name === 'string' && /^[a-z\d_+.-]+$/i.test(name) && name !== '.' && name !== '..'
export function lastModified(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return undefined
  return new Date(value).toISOString()
}
export function buildRelations(details) {
  const names = new Set(details.map(p => p.name))
  const reverse = new Map(details.map(p => [p.name, new Set()]))
  for (const pkg of details) for (const spec of array(pkg.deps)) {
    const name = dependencyName(spec)
    if (names.has(name)) reverse.get(name).add(pkg.name)
  }
  return Object.fromEntries([...reverse].sort(([a], [b]) => a.localeCompare(b)).map(([name, deps]) => [name, [...deps].sort()]))
}
export function detailContent(pkg, names, dependents, link, kind = 'packages') {
  const section = (title, body) => `<section><h2>${title}</h2>${body}</section>`
  const packageLink = (name, label = name) => names.has(name) ? `<a href="${e(link('/' + kind + '/' + encodeURIComponent(name) + '/'))}">${e(label)}</a>` : e(label)
  const value = v => v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
  const info = [['License', array(pkg.license).length ? pkg.license.join(', ') : typeof pkg.license === 'string' ? pkg.license : ''], ['Kind', pkg.kind], ['Recipe updated', lastModified(pkg.updated_at)]]
  let html = section('Information', '<dl>' + info.filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${e(v)}</dd>`).join('') + '</dl>')
  const platforms = pkg.platforms && !Array.isArray(pkg.platforms) ? Object.entries(pkg.platforms) : []
  html += section('Platforms', platforms.length ? '<ul>' + platforms.map(([plat, arches]) => `<li>${e(plat)}${array(arches).length ? ': ' + e(arches.join(', ')) : ''}</li>`).join('') + '</ul>' : '<p>No platform information available.</p>')
  html += section('Options', array(pkg.configs).length ? '<dl>' + pkg.configs.map(c => `<dt><code>${e(c.name)}</code></dt><dd>${e(c.description || '')}${c.type ? ` · Type: ${e(c.type)}` : ''}${c.default !== undefined ? ` · Default: ${e(value(c.default))}` : ''}${array(c.values).length ? ` · Values: ${e(c.values.map(value).join(', '))}` : ''}</dd>`).join('') + '</dl>' : '<p>No configurable options.</p>')
  html += section('Versions', array(pkg.versions).length ? '<ul>' + pkg.versions.map(v => `<li>${e(v)}</li>`).join('') + '</ul>' : '<p>No versions listed.</p>')
  html += section('Dependencies', array(pkg.deps).length ? '<ul>' + pkg.deps.map(d => `<li>${packageLink(dependencyName(d), d)}</li>`).join('') + '</ul>' : '<p>No dependencies declared.</p>')
  if (dependents.length) html += section(`Used by (${dependents.length})`, '<p>' + (kind === 'addons' ? 'Addons declaring this dependency.' : 'Packages declaring this dependency; requirements can vary by platform and configuration.') + '</p><ul>' + dependents.slice(0, 12).map(d => `<li>${packageLink(d)}</li>`).join('') + '</ul>' + (dependents.length > 12 ? `<details><summary>Show ${dependents.length - 12} more</summary><ul>${dependents.slice(12).map(d => `<li>${packageLink(d)}</li>`).join('')}</ul></details>` : ''))
  return html
}
