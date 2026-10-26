import fs from 'node:fs'
import { buildRelations, detailContent, lastModified } from '../shared/package-content.mjs'
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

const names=new Set(index.packages.map(p=>p.name))
const details=index.packages.map(p=>JSON.parse(fs.readFileSync(path.join(root,'public/data/packages',p.name+'.json'),'utf8')))
const relations=JSON.parse(fs.readFileSync(path.join(dist,'data/package-relations.json'),'utf8'))
assert.deepEqual(relations,buildRelations(details))
const base=(process.env.VITE_BASE || '/').replace(/\/$/,'')
const sitemapItems=[...sitemap.matchAll(/<url>(.*?)<\/url>/gs)].map(m=>m[1])
for(const [kind,entries] of [['packages',index.packages],['addons',addons]]) for(const entry of entries){
 const detail=JSON.parse(fs.readFileSync(path.join(root,'public/data',kind,entry.name+'.json'),'utf8'))
 const html=fs.readFileSync(path.join(dist,kind,entry.name,'index.html'),'utf8')
 assert.ok(html.includes(detailContent(detail,names,kind==='packages'?relations[entry.name]:[],route=>base+route)),entry.name+' missing static details')
 const item=sitemapItems.find(item=>item.includes('/'+kind+'/'+encodeURIComponent(entry.name)+'/</loc>'))
 assert.ok(item,entry.name+' missing sitemap entry')
 const updated=lastModified(detail.updated_at)
 if(updated)assert.ok(item.includes('<lastmod>'+updated+'</lastmod>'),entry.name+' incorrect lastmod')
 else assert.ok(!item.includes('<lastmod>'),entry.name+' fabricated lastmod')
}
console.log('Verified static details, dependency relationships and source-based sitemap dates.')
