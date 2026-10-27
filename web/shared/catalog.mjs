export const categoryPageSize = 48
export const categories = [
  { slug: 'libraries', label: 'Libraries', kind: 'library', description: 'C and C++ libraries from xmake-repo. Browse versions, configuration options, dependencies and target integration with add_requires and add_packages.' },
  { slug: 'tools', label: 'Build tools', kind: 'binary', description: 'Executable tools from xmake-repo. Install tools with xrepo, declare project requirements and run commands in a package environment.' },
  { slug: 'toolchains', label: 'Toolchains', kind: 'toolchain', description: 'Compiler and SDK packages for Xmake. Browse available toolchains, install requirements and configure a matching toolchain for your target platform.' },
  { slug: 'addons', label: 'Addons', kind: 'addon', description: 'Extensions for Xmake: commands, rules, toolchains, templates and Lua modules. Install with xmake addon or declare project extensions with add_addons.' },
  { slug: 'other', label: 'Other packages', kind: 'other', description: 'Phony and other package types from xmake-repo. Review recipe-specific setup, configuration options and dependencies.' },
]
export function packageKind(entry) { return !entry?.kind || entry.kind === 'library' ? 'library' : ['binary','toolchain','addon'].includes(entry.kind) ? entry.kind : 'other' }
export function categoryFor(entry) { return categories.find(c => c.kind === packageKind(entry)) }
export function categoryRoute(slug, page = 1) { return `/categories/${slug}${page > 1 ? `/page/${page}` : ''}` }
export function categoryFromRoute(route) {
 const match = route.match(/^\/categories\/([^/]+)(?:\/page\/([1-9]\d*))?$/)
 const category = match && categories.find(c => c.slug === match[1])
 return category ? { category, page: Number(match[2] || 1) } : undefined
}
export function categoryEntries(category, packages, addons) {
 return (category.kind === 'addon' ? addons : packages.filter(p => packageKind(p) === category.kind)).slice().sort((a,b) => a.name.localeCompare(b.name))
}
