import test from 'node:test'
import assert from 'node:assert/strict'
import { pageMeta, metadataHtml } from '../shared/seo.mjs'
const site={name:'Xmake Packages',title:'Xmake Packages Index',description:'Browse C/C++ packages.',url:'https://packages.xmake.io'}
test('canonical URLs drop query filters and normalize trailing slash',()=>{
 assert.equal(pageMeta(site,'/packages?q=fmt').canonical,'https://packages.xmake.io/packages/')
 assert.equal(pageMeta(site,'/packages/').canonical,'https://packages.xmake.io/packages/')
 assert.equal(pageMeta(site,'/').canonical,'https://packages.xmake.io/')
})
test('packages and addons have distinct metadata and unknown routes are noindex',()=>{
 const entry={name:'fmt',description:'A formatting library for C++'}
 assert.match(pageMeta(site,'/packages/fmt',entry).title,/^fmt/)
 assert.match(pageMeta(site,'/addons/demo',{name:'demo'}).title,/Addon installation/)
 assert.ok(pageMeta(site,'/packages/fmt',entry).description.startsWith(entry.description))
 assert.equal(pageMeta(site,'/missing').indexable,false)
})
test('package data cannot inject tags or attributes into generated HTML',()=>{
 const html=metadataHtml(pageMeta(site,'/packages/fmt',{name:'<script>bad()</script>',description:'"/><script>bad()</script>&'}),site.name)
 assert.ok(!html.includes('<script>'))
 assert.ok(html.includes('&quot;'))
 assert.ok(html.includes('&lt;script&gt;'))
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1)
})
