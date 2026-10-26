import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRelations, detailContent, lastModified } from '../shared/package-content.mjs'
test('relationships normalize versions, deduplicate, and omit absent references while preserving self cycles', () => {
 const result=buildRelations([{name:'a',deps:['b >=1','b','missing','a']},{name:'b',deps:{}},{name:'c',deps:['b']}])
 assert.deepEqual(result,{a:['a'],b:['a','c'],c:[]})
})
test('detail renderer preserves false defaults and escapes content and unknown dependencies', () => {
 const html=detailContent({name:'a',license:'MIT',platforms:{linux:['x86_64']},configs:[{name:'<script>',default:false}],deps:['b >=1','missing'],versions:['1']},new Set(['b']),['b'],x=>x)
 assert.ok(html.includes('Default: false'))
 assert.ok(html.includes('&lt;script&gt;'))
 assert.ok(!html.includes('<script>'))
 assert.ok(html.includes('href="/packages/b/"'))
 assert.ok(!html.includes('href="/packages/missing/"'))
 assert.ok(html.includes('Used by (1)'))
 assert.doesNotThrow(()=>detailContent({configs:{},deps:{},versions:{},license:{}},new Set(),[],x=>x))
})
test('lastmod derives only from valid source dates', () => {
 assert.equal(lastModified('2026-02-28T11:04:40+08:00'),'2026-02-28T03:04:40.000Z')
 assert.equal(lastModified(undefined),undefined)
 assert.equal(lastModified('bad'),undefined)
})
