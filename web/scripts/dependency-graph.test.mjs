import test from 'node:test'
import assert from 'node:assert/strict'
import { dependencyGraph } from '../shared/dependency-graph.mjs'
test('direct and transitive graphs keep root and directed edges, excluding unrelated packages', () => {
 const relations={a:[],b:['a'],c:['b'],d:['c'],unrelated:[]}
 const direct=dependencyGraph(relations,'b')
 assert.deepEqual(new Set(direct.nodes.map(n=>n.name)),new Set(['a','b','c']))
 assert.equal(direct.nodes.find(n=>n.name==='b').level,0)
 assert.ok(direct.nodes.find(n=>n.name==='a').level<0)
 assert.ok(direct.nodes.find(n=>n.name==='c').level>0)
 const full=dependencyGraph(relations,'b',true)
 assert.equal(full.nodes.length,4)
 assert.ok(full.edges.some(e=>e.source==='c'&&e.target==='d'))
})
test('cycles terminate, diamonds deduplicate and disconnected nodes remain usable', () => {
 const graph=dependencyGraph({a:['c'],b:['a'],c:['a','b']},'a',true)
 assert.equal(graph.nodes.length,3)
 assert.equal(new Set(graph.nodes.map(n=>n.name)).size,3)
 assert.equal(graph.edges.length,4)
 assert.equal(dependencyGraph({a:[]},'a').nodes.length,1)
 assert.equal(dependencyGraph({},'missing').nodes.length,0)
})
test('cycle detection marks only strongly connected nodes and links, including self loops', () => {
 const graph=dependencyGraph({a:['b'],b:['a','upstream'],upstream:[],downstream:['b'],self:['self']},'a',true)
 assert.deepEqual(new Set(graph.nodes.filter(n=>n.cyclic).map(n=>n.name)),new Set(['a','b']))
 assert.equal(graph.edges.filter(e=>e.cyclic).length,2)
 assert.equal(graph.cycleCount,1)
 const self=dependencyGraph({self:['self']},'self',true)
 assert.equal(self.cycleCount,1)
 assert.equal(self.edges[0].cyclic,true)
})
test('long chains are traversed iteratively without recursion overflow', () => {
 const relations=Object.fromEntries(Array.from({length:5000},(_,i)=>['p'+i,i?['p'+(i-1)]:[]]))
 const graph=dependencyGraph(relations,'p0',true)
 assert.equal(graph.nodes.length,5000)
 assert.equal(graph.cycleCount,0)
})
