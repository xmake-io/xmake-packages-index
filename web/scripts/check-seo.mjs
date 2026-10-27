import fs from 'node:fs'
import { categories, categoryEntries, categoryPageSize } from '../shared/catalog.mjs'
import { quickUsage, snippetGroups, addonSnippetGroups } from '../shared/usage.mjs'
import { pageMeta, breadcrumbData, escapeHtml } from '../shared/seo.mjs'
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
const categoryPages=categories.reduce((sum,c)=>sum+Math.max(1,Math.ceil(categoryEntries(c,index.packages,addons).length/categoryPageSize)),0)
assert.equal(urls.length,index.packages.length+addons.length+5+categoryPages)
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

const addonNames=new Set(addons.map(a=>a.name))
const addonDetails=addons.map(a=>JSON.parse(fs.readFileSync(path.join(root,'public/data/addons',a.name+'.json'),'utf8')))
const addonRelations=JSON.parse(fs.readFileSync(path.join(dist,'data/addon-relations.json'),'utf8'))
assert.deepEqual(addonRelations,buildRelations(addonDetails))
const names=new Set(index.packages.map(p=>p.name))
const details=index.packages.map(p=>JSON.parse(fs.readFileSync(path.join(root,'public/data/packages',p.name+'.json'),'utf8')))
const relations=JSON.parse(fs.readFileSync(path.join(dist,'data/package-relations.json'),'utf8'))
assert.deepEqual(relations,buildRelations(details))
const base=(process.env.VITE_BASE || '/').replace(/\/$/,'')
const sitemapItems=[...sitemap.matchAll(/<url>(.*?)<\/url>/gs)].map(m=>m[1])
for(const [kind,entries] of [['packages',index.packages],['addons',addons]]) for(const entry of entries){
 const detail=JSON.parse(fs.readFileSync(path.join(root,'public/data',kind,entry.name+'.json'),'utf8'))
 const html=fs.readFileSync(path.join(dist,kind,entry.name,'index.html'),'utf8')
 assert.ok(html.includes(detailContent(detail,kind==='packages'?names:addonNames,kind==='packages'?relations[entry.name]:addonRelations[entry.name],route=>base+route,kind)),entry.name+' missing static details')
 const item=sitemapItems.find(item=>item.includes('/'+kind+'/'+encodeURIComponent(entry.name)+'/</loc>'))
 assert.ok(item,entry.name+' missing sitemap entry')
 const updated=lastModified(detail.updated_at)
 if(updated)assert.ok(item.includes('<lastmod>'+updated+'</lastmod>'),entry.name+' incorrect lastmod')
 else assert.ok(!item.includes('<lastmod>'),entry.name+' fabricated lastmod')
}
console.log('Verified static details, dependency relationships and source-based sitemap dates.')

for(const url of urls){
 const rel=decodeURIComponent(new URL(url).pathname).replace(/^\//,'')
 const html=fs.readFileSync(path.join(dist,rel,'index.html'),'utf8')
 if(rel){
  const schemas=[...html.matchAll(/<script id="page-breadcrumbs" type="application\/ld\+json">(.*?)<\/script>/gs)]
  assert.equal(schemas.length,1,url+' breadcrumb count')
  const schema=JSON.parse(schemas[0][1]);assert.equal(schema['@type'],'BreadcrumbList')
  assert.equal(schema.itemListElement.at(-1).item,url)
  for(const [i,item] of schema.itemListElement.entries()){
   assert.equal(item.position,i+1)
   assert.ok(urls.includes(item.item),item.item+' breadcrumb target missing')
  }
 }
}
for(const [kind,entries] of [['packages',details],['addons',addonDetails]]) for(const entry of entries){
 const html=fs.readFileSync(path.join(dist,kind,entry.name,'index.html'),'utf8')
 const meta=pageMeta(site,'/'+kind+'/'+encodeURIComponent(entry.name),entry)
 assert.ok(html.includes('<title>'+escapeHtml(meta.title)+'</title>'))
 const groups=kind==='addons'?addonSnippetGroups(entry):snippetGroups(entry)
 for(const group of groups)for(const snippet of group.snippets)assert.ok(html.includes(escapeHtml(snippet.code)),entry.name+' missing type-specific usage')
}
console.log('Verified category pages, typed usage, addon relationships and breadcrumb JSON-LD.')
