import test from 'node:test'
import assert from 'node:assert/strict'
import { categories, categoryEntries, categoryFor, categoryFromRoute } from '../shared/catalog.mjs'
import { quickUsage, snippetGroups, addonSnippetGroups } from '../shared/usage.mjs'
import { pageMeta, breadcrumbJson } from '../shared/seo.mjs'
import { buildRelations, detailContent } from '../shared/package-content.mjs'
const site={name:'Xmake Packages',title:'Packages',description:'Packages',url:'https://packages.xmake.io'}
test('all package types are classified without treating addons as libraries',()=>{
 const packages=[{name:'fmt'},{name:'cmake',kind:'binary'},{name:'llvm',kind:'toolchain'},{name:'virtual',kind:'phony'}]
 const addons=[{name:'llvm',kind:'addon'}]
 assert.equal(categories.flatMap(c=>categoryEntries(c,packages,addons)).length,5)
 assert.equal(categoryFor(addons[0]).slug,'addons')
 assert.equal(categoryFromRoute('/categories/nope'),undefined)
 assert.equal(categoryFromRoute('/categories/libraries/page/0'),undefined)
 assert.equal(categoryFromRoute('/categories/libraries/page/2').page,2)
})
test('library, tool, toolchain and addon snippets use different integration APIs',()=>{
 const code=kind=>snippetGroups({name:'demo',kind,latest_version:'1.2'}).flatMap(g=>g.snippets.map(s=>s.code)).join('\n')
 assert.match(code('library'),/add_packages\("demo"\)/)
 assert.ok(!code('binary').includes('add_packages('))
 assert.match(code('binary'),/xrepo env shell/)
 assert.ok(!code('toolchain').includes('add_packages('))
 assert.match(code('toolchain'),/set_toolchains\("TOOLCHAIN_NAME@demo"\)/)
 assert.match(quickUsage({name:'cmake',kind:'binary'}).code,/^xrepo install/)
 const addon=addonSnippetGroups({name:'demo',kind:'addon'}).flatMap(g=>g.snippets.map(s=>s.code)).join('\n')
 assert.match(addon,/add_addons\("demo"\)/)
 assert.ok(!addon.includes('add_packages(')&&!addon.includes('add_requires('))
})
test('metadata and breadcrumbs follow type and escape embedded JSON safely',()=>{
 for(const kind of ['library','binary','toolchain','addon']){
  const path=(kind==='addon'?'/addons/':'/packages/')+'demo'
  const entry={name:'demo',kind,description:'Useful software.'}
  const meta=pageMeta(site,path,entry)
  assert.equal(meta.breadcrumbs[2].path,'/categories/'+categoryFor(entry).slug)
  const schema=JSON.parse(breadcrumbJson(meta,site.url))
  assert.equal(schema.itemListElement.at(-1).item,meta.canonical)
 }
 const name='</script><img src=x>'
 const json=breadcrumbJson(pageMeta(site,'/packages/demo',{name}),site.url)
 assert.ok(!json.includes('<'))
 assert.equal(JSON.parse(json).itemListElement.at(-1).name,name)
})
test('addon dependency links remain in the addon namespace even with package name collisions',()=>{
 const relations=buildRelations([{name:'first',deps:['shared']},{name:'shared',deps:[]}])
 assert.deepEqual(relations.shared,['first'])
 const html=detailContent({name:'first',deps:['shared']},new Set(['shared']),[],p=>p,'addons')
 assert.ok(html.includes('/addons/shared/'))
 assert.ok(!html.includes('/packages/shared/'))
})
