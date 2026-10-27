import { packageKind } from './catalog.mjs'
const quote = value => JSON.stringify(value)
export function quickUsage(pkg) {
 const spec = pkg.name + (pkg.latest_version ? ' ' + pkg.latest_version : '')
 if (packageKind(pkg) === 'addon') return { title: 'Install addon', language: 'bash', code: `xmake addon --install ${quote(spec)}` }
 if (packageKind(pkg) === 'binary') return { title: 'Install tool', language: 'bash', code: `xrepo install ${quote(spec)}` }
 return { title: 'Add to xmake.lua', language: 'lua', code: `add_requires(${quote(spec)})` }
}
export function snippetGroups(pkg) {
 const kind = packageKind(pkg)
 const name = pkg.name
 const spec = name + (pkg.latest_version ? ' ' + pkg.latest_version : '')
 const requirement = `add_requires(${quote(spec)})`
 const install = { id: 'xrepo', title: 'Install with xrepo', description: 'Install the package independently of a project and inspect its available configuration.', snippets: [
  {label:'install',language:'bash',code:`xrepo install ${quote(spec)}`},
  {label:'show info',language:'bash',code:`xrepo info ${quote(name)}`},
 ] }
 const environment = { id: 'env', title: 'Open a package environment', description: 'Open a shell with the environment exported by this package. Use the executable names documented by the package.', snippets:[{label:'enter shell',language:'bash',code:`xrepo env -b ${quote(spec)} shell`}] }
 let project
 if (kind === 'library') project = { id:'project',title:'Link a library to your target',description:'Declare the requirement, then attach the library to the target that uses it.',snippets:[{label:'xmake.lua',language:'lua',code:`${requirement}\n\ntarget("demo")\n    set_kind("binary")\n    add_files("src/*.cpp")\n    add_packages(${quote(name)})`}] }
 else if (kind === 'binary') project = { id:'project',title:'Declare a project tool',description:'This package provides executables, not a library to link. Declare it as a requirement and use xrepo env shell from the project directory to access its environment.',snippets:[{label:'xmake.lua',language:'lua',code:requirement},{label:'project environment',language:'bash',code:'xrepo env shell'}] }
 else if (kind === 'toolchain') project = { id:'project',title:'Bind a toolchain package',description:'Template: replace TOOLCHAIN_NAME with the matching Xmake toolchain name, which may differ from the package name (for example, emcc for emscripten). Apply this selection to a compatible target and platform; this is not an add_packages library link.',snippets:[{label:'xmake.lua — replace TOOLCHAIN_NAME',language:'lua',code:`${requirement}\n\n-- Replace TOOLCHAIN_NAME with the matching Xmake toolchain.\nset_toolchains(${quote('TOOLCHAIN_NAME@' + name)})`}] }
 else project = { id:'project',title:'Declare the requirement',description:'This package has recipe-specific behavior. Review its configuration and recipe before adding target-specific integration.',snippets:[{label:'xmake.lua',language:'lua',code:requirement}] }
 return [install, project, environment]
}

export function addonSnippetGroups(addon) {
  const name = addon.name
  const ver = addon.latest_version
  const withVer = ver ? `${name} ${ver}` : name
  const repo = addon.repository_url?.replace(/\.git$/, '')

  const fromSource = []
  if (repo) {
    const shortcut = repo.match(/^https:\/\/github\.com\/(.+)$/)
    if (shortcut) {
      fromSource.push({ label: 'from github', language: 'bash', code: `xmake addon --install github:${shortcut[1]}` })
    }
    fromSource.push({ label: 'from a local clone', language: 'bash', code: `xmake addon --install /path/to/${name}` })
  }

  const groups = [
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
