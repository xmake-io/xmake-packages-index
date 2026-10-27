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
test('large fan-in stays bounded while every related name remains discoverable', () => {
 const users=Array.from({length:2000},(_,i)=>'package'+String(i).padStart(4,'0'))
 const relations=Object.fromEntries([['cmake',users],...users.map(name=>[name,[]])])
 const small=dependencyGraph(relations,'cmake',false,false,13)
 assert.equal(small.nodes.length,13)
 assert.equal(small.edges.length,12)
 assert.equal(small.total,2001)
 assert.equal(small.related.length,2000)
 const expanded=dependencyGraph(relations,'cmake',true,false,61)
 assert.equal(expanded.nodes.length,61)
 assert.ok(small.nodes.every(n=>expanded.nodes.some(x=>x.name===n.name)))
 assert.equal(dependencyGraph(relations,'cmake',false,true,7).nodes.length,7)
})
test('cycle membership is retained when the visible graph is capped', () => {
 const graph=dependencyGraph({a:['b'],b:['a','c'],c:[]},'a',true,false,2)
 assert.equal(graph.nodes.length,2)
 assert.equal(graph.edges.filter(e=>e.cyclic).length,2)
 assert.equal(graph.cycleCount,1)
})
test('mobile fan-in uses two columns with non-overlapping nodes inside its bounds', () => {
 const users=['a','b','c','d','e','f']
 const relations=Object.fromEntries([['cmake',users],...users.map(n=>[n,[]])])
 const graph=dependencyGraph(relations,'cmake',false,true,7)
 for(const node of graph.nodes){
  assert.ok(node.x>=94&&node.x+94<=graph.width)
  assert.ok(node.y>=20&&node.y+20<=graph.height)
 }
 for(let i=0;i<graph.nodes.length;i++) for(let j=i+1;j<graph.nodes.length;j++){
  const a=graph.nodes[i],b=graph.nodes[j]
  assert.ok(Math.abs(a.x-b.x)>=188||Math.abs(a.y-b.y)>=40)
 }
})
