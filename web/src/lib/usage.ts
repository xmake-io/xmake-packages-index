// Generate copy-paste snippets for installing/integrating a package.
// Kept separate so the snippet templates can evolve without touching components.

import type { PackageDetail } from '@/types'

export interface Snippet {
  label: string
  language: string
  code: string
}

export function snippetsFor(pkg: PackageDetail): Snippet[] {
  const ver = pkg.latest_version
  const name = pkg.name
  const withVer = ver ? `${name} ${ver}` : name

  return [
    {
      label: 'xrepo install',
      language: 'bash',
      code: `xrepo install "${withVer}"`,
    },
    {
      label: 'xmake.lua',
      language: 'lua',
      code: ver
        ? `add_requires("${name} ${ver}")\n\ntarget("demo")\n    set_kind("binary")\n    add_files("src/*.cpp")\n    add_packages("${name}")`
        : `add_requires("${name}")\n\ntarget("demo")\n    set_kind("binary")\n    add_files("src/*.cpp")\n    add_packages("${name}")`,
    },
    {
      label: 'xrepo env shell',
      language: 'bash',
      code: `xrepo env -b "${withVer}" shell`,
    },
  ]
}
