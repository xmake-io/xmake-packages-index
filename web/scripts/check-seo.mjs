import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const dist=path.join(root,'dist')
const site=JSON.parse(fs.readFileSync(path.join(root,'../site.config.json'),'utf8')).site
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8')
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])
assert.equal(new Set(urls).size,urls.length)
const index=JSON.parse(fs.readFileSync(path.join(root,'public/data/index.json'),'utf8'))
let addons=[]
try{addons=JSON.parse(fs.readFileSync(path.join(root,'public/data/addons.json'),'utf8')).addons||[]}catch(e){if(e.code!=='ENOENT')throw e}
assert.equal(urls.length,index.packages.length+addons.length+4)
for(const url of urls){
 const relative=decodeURIComponent(new URL(url).pathname).replace(/^\//,'')
 const html=fs.readFileSync(path.join(dist,relative,'index.html'),'utf8')
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1,url)
 assert.ok(html.includes(`rel="canonical" href="${url}"`),url)
 assert.ok(html.includes('<h1>'),url+' missing static heading')
 assert.ok(html.includes(`href="${site.docsHome}"`),url+' missing docs home')
 assert.ok(!html.includes('noindex'),url)
 if(relative.startsWith('packages/')&&relative!=='packages/')assert.ok(html.includes('add_requires('),url+' missing usage')
}
const missing=fs.readFileSync(path.join(dist,'404.html'),'utf8')
assert.ok(missing.includes('noindex, follow'))
assert.ok(!sitemap.includes('/404'))
assert.ok(fs.readFileSync(path.join(dist,'robots.txt'),'utf8').includes(site.url+'/sitemap.xml'))
console.log(`Verified ${urls.length} indexable pages: static content, canonical URLs, docs links, sitemap and robots.`)
