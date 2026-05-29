// Generate copy-paste integration snippets for a package, grouped by the
// workflow a user is in (CLI install, xmake project, virtual env shell).
// Each group renders as its own card in PackageUsage so users can scan to the
// relevant section instead of guessing which of N unlabeled snippets to copy.

import type { PackageDetail } from '@/types'

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
