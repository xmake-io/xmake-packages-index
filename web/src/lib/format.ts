// Display helpers — strictly pure, no Vue imports, easy to unit test.

export function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().slice(0, 10)
}

export function relativeTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return iso
  const diff = (Date.now() - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`
  return `${Math.floor(diff / (86400 * 365))}y ago`
}

export function licenseText(license?: string | string[]): string {
  if (!license) return ''
  return Array.isArray(license) ? license.join(', ') : license
}

export function platformLabel(plat: string): string {
  const map: Record<string, string> = {
    windows: 'Windows',
    linux: 'Linux',
    macosx: 'macOS',
    iphoneos: 'iOS',
    android: 'Android',
    mingw: 'MinGW',
    msys: 'MSYS',
    bsd: 'BSD',
    wasm: 'WASM',
    cross: 'Cross',
    harmony: 'HarmonyOS',
  }
  return map[plat] ?? plat
}
