// Generate copy-paste integration snippets for a package, grouped by the
// workflow a user is in (CLI install, xmake project, virtual env shell).
// Each group renders as its own card in PackageUsage so users can scan to the
// relevant section instead of guessing which of N unlabeled snippets to copy.

import type { AddonDetail, PackageDetail } from '@/types'

export interface Snippet {
  label: string
  language: string
  code: string
}

export interface SnippetGroup {
  id: string
  title: string
  description: string
  snippets: Snippet[]
}

export function snippetGroups(pkg: PackageDetail): SnippetGroup[] {
  const ver = pkg.latest_version
  const name = pkg.name
  const withVer = ver ? `${name} ${ver}` : name

  const xmakeProject = ver
    ? `add_requires("${name} ${ver}")\n\ntarget("demo")\n    set_kind("binary")\n    add_files("src/*.cpp")\n    add_packages("${name}")`
    : `add_requires("${name}")\n\ntarget("demo")\n    set_kind("binary")\n    add_files("src/*.cpp")\n    add_packages("${name}")`

  return [
    {
      id: 'xrepo',
      title: 'Install with xrepo',
      description:
        'Standalone CLI install, useful for one-off use or quick testing without a project.',
      snippets: [
        { label: 'install', language: 'bash', code: `xrepo install "${withVer}"` },
        { label: 'show info', language: 'bash', code: `xrepo info "${name}"` },
      ],
    },
    {
      id: 'xmake',
      title: 'Integrate in an xmake project',
      description:
        'Add the package as a project requirement in xmake.lua, then attach it to your target.',
      snippets: [{ label: 'xmake.lua', language: 'lua', code: xmakeProject }],
    },
    {
      id: 'env',
      title: 'Use in a virtual environment',
      description:
        'Drop into a shell with this package (and its dependencies) wired up on PATH.',
      snippets: [
        { label: 'enter shell', language: 'bash', code: `xrepo env -b "${withVer}" shell` },
      ],
    },
  ]
}

// Addons are not linked into a target — they extend xmake itself with plugins,
// rules, toolchains, templates and modules. So they have their own snippets:
// install them once with the CLI, or let a project pull them automatically.
export function addonSnippetGroups(addon: AddonDetail): SnippetGroup[] {
  const name = addon.name
  const ver = addon.latest_version
  const withVer = ver ? `${name} ${ver}` : name
  const repo = addon.repository_url?.replace(/\.git$/, '')

  const fromSource: Snippet[] = []
  if (repo) {
    const shortcut = repo.match(/^https:\/\/github\.com\/(.+)$/)
    if (shortcut) {
      fromSource.push({ label: 'from github', language: 'bash', code: `xmake addon --install github:${shortcut[1]}` })
    }
    fromSource.push({ label: 'from a local clone', language: 'bash', code: `xmake addon --install /path/to/${name}` })
  }

  const groups: SnippetGroup[] = [
    {
      id: 'install',
      title: 'Install the addon',
      description: 'Install it by name, xmake resolves it from the xmake-repo index.',
      snippets: [
        { label: 'install', language: 'bash', code: `xmake addon --install "${withVer}"` },
        { label: 'list installed', language: 'bash', code: 'xmake addon --list' },
        { label: 'remove', language: 'bash', code: `xmake addon --remove ${name}` },
      ],
    },
    {
      id: 'project',
      title: 'Use it in a project',
      description:
        'Declare it in xmake.lua, it is installed automatically when the project is loaded.',
      snippets: [
        { label: 'xmake.lua', language: 'lua', code: ver ? `add_addons("${name} ${ver}")` : `add_addons("${name}")` },
      ],
    },
  ]
  if (fromSource.length > 0) {
    groups.push({
      id: 'source',
      title: 'Install from the source',
      description: 'Useful to try a branch or to develop the addon itself.',
      snippets: fromSource,
    })
  }
  return groups
}
