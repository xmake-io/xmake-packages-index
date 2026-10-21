import type { PackageSummary } from '@/types'

const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

// Restricted Damerau–Levenshtein distance also handles adjacent swapped letters.
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  let beforePrevious = previous
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        row[j] = Math.min(row[j], beforePrevious[j - 2] + 1)
      }
    }
    beforePrevious = previous
    previous = row
  }
  return previous[b.length]
}

function nameScore(name: string, term: string): number {
  if (name === term) return 1000
  if (name.startsWith(term)) return 850 + term.length / name.length * 50
  if (name.includes(term)) return 700 + term.length / name.length * 50
  const compactName = normalize(name)
  const compactTerm = normalize(term)
  if (!compactTerm) return 0
  if (compactName === compactTerm) return 950
  if (compactName.includes(compactTerm)) return 650 + compactTerm.length / compactName.length * 50
  // Short inputs should not produce a long list of unrelated typo matches.
  if (compactTerm.length < 3) return 0
  const tolerance = compactTerm.length >= 6 ? 2 : 1
  if (Math.abs(compactName.length - compactTerm.length) <= tolerance) {
    const edits = distance(compactName, compactTerm)
    if (edits <= tolerance) return 550 - edits * 60
  }
  let cursor = 0
  let first = -1
  let last = -1
  for (let i = 0; i < compactName.length && cursor < compactTerm.length; i++) {
    if (compactName[i] === compactTerm[cursor]) {
      if (first < 0) first = i
      last = i
      cursor++
    }
  }
  const span = last - first + 1
  if (cursor === compactTerm.length && span <= compactTerm.length * 2) {
    return 300 + compactTerm.length / span * 100 - first
  }
  return 0
}

export function searchPackages(packages: PackageSummary[], query: string): PackageSummary[] {
  const term = query.trim().toLowerCase()
  if (!term) return packages
  const words = term.split(/\s+/)
  return packages.map(pkg => {
    const name = pkg.name.toLowerCase()
    const description = (pkg.description ?? '').toLowerCase()
    let score = nameScore(name, term)
    const wordScores = words.map(word => nameScore(name, word) || (description.includes(word) ? 100 : 0))
    if (wordScores.every(Boolean)) score = Math.max(score, wordScores.reduce((a, b) => a + b, 0) / words.length)
    return { pkg, score }
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.pkg.name.localeCompare(b.pkg.name))
    .map(item => item.pkg)
}
