import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildRelations, validName } from '../shared/package-content.mjs'
const data = new URL('../public/data/', import.meta.url)
const { packages } = JSON.parse(await fs.readFile(new URL('index.json', data), 'utf8'))
const details = []
for (const pkg of packages) {
  if (!validName(pkg.name)) throw new Error(`Invalid package name: ${pkg.name}`)
  const detail = JSON.parse(await fs.readFile(new URL(`packages/${pkg.name}.json`, data), 'utf8'))
  if (detail.name !== pkg.name) throw new Error(`Package data mismatch: ${pkg.name}`)
  details.push(detail)
}
await fs.writeFile(new URL('package-relations.json', data), JSON.stringify(buildRelations(details)))
console.log(`Generated dependency relationships for ${details.length} packages in ${fileURLToPath(data)}`)
