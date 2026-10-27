<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import PackageRelationsList from './PackageRelationsList.vue'
import { dependencyGraph } from '../../../shared/dependency-graph.mjs'
const props = defineProps<{ name: string; relations: Record<string, string[]> }>()
const full = ref(false)
const vertical = ref(false)
const visibleLimit = ref(7)
const browserOpen = ref(false)
const graph = computed(() => dependencyGraph(props.relations, props.name, full.value, vertical.value, visibleLimit.value))
const byName = computed(() => new Map(graph.value.nodes.map(node => [node.name, node])))
const view = ref({ x: 0, y: 0, width: 900, height: 420 })
const svg = ref<SVGSVGElement>()
const selected = ref('')
const connected = computed(() => {
  const names = new Set([selected.value])
  for (const edge of graph.value.edges) {
    if (edge.source === selected.value) names.add(edge.target)
    if (edge.target === selected.value) names.add(edge.source)
  }
  return names
})
function fit() {
  view.value = { x: 0, y: 0, width: graph.value.width, height: graph.value.height }
}
function focusCurrent() {
  const node = byName.value.get(props.name)
  if (!node) return
  const width = Math.max(400, svg.value?.clientWidth || 900)
  const height = svg.value?.clientHeight || 420
  const x = graph.value.width > width ? Math.max(0, Math.min(graph.value.width - width, node.x - width / 2)) : (graph.value.width - width) / 2
  const y = graph.value.height > height ? Math.max(0, Math.min(graph.value.height - height, node.y - height / 2)) : (graph.value.height - height) / 2
  view.value = { x, y, width, height }
}
watch(() => props.name, () => { full.value = false; selected.value = ''; browserOpen.value = false })
watch([full, vertical, () => props.name], () => { visibleLimit.value = 7 })
function resetView() {
  if (graph.value.nodes.length > (vertical.value ? 7 : 18)) focusCurrent()
  else fit()
}
watch(graph, resetView, { immediate: true })
let observer: ResizeObserver | undefined
onMounted(() => {
  const update = () => { vertical.value = (svg.value?.clientWidth || 900) < 600; resetView() }
  update()
  observer = new ResizeObserver(update)
  if (svg.value) observer.observe(svg.value)
})
onBeforeUnmount(() => observer?.disconnect())
function zoom(factor: number) {
  const width = Math.max(240, Math.min(graph.value.width * 3, view.value.width * factor))
  const height = view.value.height * width / view.value.width
  view.value = { x: view.value.x + (view.value.width - width) / 2, y: view.value.y + (view.value.height - height) / 2, width, height }
}
function edgePath(source: string, target: string) {
  const a = byName.value.get(source)!, b = byName.value.get(target)!
  if (source === target) return `M ${a.x + 94} ${a.y - 5} C ${a.x + 160} ${a.y - 95}, ${a.x - 160} ${a.y - 95}, ${a.x - 100} ${a.y - 5}`
  if (vertical.value) {
    const forward = b.y > a.y
    const y1 = a.y + (forward ? 20 : -20), y2 = b.y + (forward ? -26 : 26)
    const bend = Math.max(32, Math.abs(y2 - y1) / 2)
    return `M ${a.x} ${y1} C ${a.x} ${y1 + (forward ? bend : -bend)}, ${b.x} ${y2 - (forward ? bend : -bend)}, ${b.x} ${y2}`
  }
  const forward = b.x > a.x
  const x1 = a.x + (forward ? 94 : -94), x2 = b.x + (forward ? -100 : 100)
  const bend = Math.max(50, Math.abs(x2 - x1) / 2)
  return `M ${x1} ${a.y} C ${x1 + (forward ? bend : -bend)} ${a.y}, ${x2 - (forward ? bend : -bend)} ${b.y}, ${x2} ${b.y}`
}
let drag: { x: number; y: number; vx: number; vy: number; scale: number } | undefined
function startDrag(event: PointerEvent) {
  if (event.button !== 0 || (event.target as Element).closest('a')) return
  const scale = svg.value?.getScreenCTM()?.a
  if (!scale) return
  svg.value?.focus()
  drag = { x: event.clientX, y: event.clientY, vx: view.value.x, vy: view.value.y, scale }
  svg.value?.setPointerCapture(event.pointerId)
}
function moveDrag(event: PointerEvent) {
  if (!drag) return
  view.value = { ...view.value, x: drag.vx - (event.clientX - drag.x) / drag.scale, y: drag.vy - (event.clientY - drag.y) / drag.scale }
}
function endDrag() { drag = undefined }
function onKeydown(event: KeyboardEvent) {
  if (event.target !== svg.value) return
  const delta = view.value.width / 8
  const offsets: Record<string, [number, number]> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }
  if (offsets[event.key]) {
    event.preventDefault()
    const [x, y] = offsets[event.key]
    view.value = { ...view.value, x: view.value.x + x, y: view.value.y + y }
  }
}
</script>
<template>
  <section class="dependency-graph" aria-label="Package dependency graph">
    <header class="graph-head">
      <div><h2>Dependency graph</h2><p>{{ vertical ? 'Dependents ↓ current package ↓ dependencies' : 'Dependents → current package → dependencies' }}</p></div>
      <div class="graph-modes" aria-label="Graph scope">
        <button :aria-pressed="!full" @click="full = false">Direct</button>
        <button :aria-pressed="full" @click="full = true">Include indirect</button>
      </div>
    </header>
    <p v-if="graph.cycleCount" class="graph-cycle-note" role="status">↻ {{ graph.cycleCount }} dependency cycle group{{ graph.cycleCount > 1 ? 's' : '' }} detected · amber nodes and dashed links mark cycles</p>
    <div class="graph-surface">
      <div class="graph-tools">
        <span aria-live="polite">{{ graph.nodes.length }} / {{ graph.total }} packages · {{ graph.edges.length }} links</span>
        <div>
          <button aria-label="Zoom out" @click="zoom(1.3)">−</button>
          <button aria-label="Zoom in" @click="zoom(1 / 1.3)">+</button>
          <button @click="fit">Fit visible</button>
          <button @click="focusCurrent">Locate {{ name }}</button>
        </div>
      </div>
      <svg ref="svg" class="graph-canvas" :viewBox="`${view.x} ${view.y} ${view.width} ${view.height}`" tabindex="0" role="group" :aria-label="`Dependency relationships for ${name}. Drag to pan or use arrow keys. Select a package to open its details.`" @pointerdown="startDrag" @pointermove="moveDrag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag" @keydown="onKeydown">
        <defs><marker id="dependency-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" /></marker><marker id="dependency-cycle-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="cycle-arrow" d="M 0 0 L 8 4 L 0 8 z" /></marker></defs>
        <g class="graph-edges" aria-hidden="true">
          <path v-for="edge in graph.edges" :key="edge.source + ':' + edge.target" :d="edgePath(edge.source, edge.target)" :marker-end="edge.cyclic ? 'url(#dependency-cycle-arrow)' : 'url(#dependency-arrow)'" :class="{ 'edge-cycle': edge.cyclic, 'edge-active': selected && (edge.source === selected || edge.target === selected), 'edge-muted': selected && edge.source !== selected && edge.target !== selected }" />
        </g>
        <RouterLink v-for="node in graph.nodes" :key="node.name" :to="{ name: 'package-detail', params: { name: node.name } }" custom v-slot="{ href, navigate }">
          <a :href="href" @click="navigate" class="graph-node" :class="{ 'node-current': node.name === name, 'node-cycle': node.cyclic, 'node-muted': selected && !connected.has(node.name) }" :transform="`translate(${node.x}, ${node.y})`" @mouseenter="selected = node.name" @mouseleave="selected = ''" @focus="selected = node.name" @blur="selected = ''" :aria-label="node.name + (node.name === name ? ', current package' : '') + (node.cyclic ? ', cyclic dependency' : '')">
            <title>{{ node.name }}{{ node.name === name ? ' — current package' : '' }}{{ node.cyclic ? ' — cyclic dependency' : '' }}</title>
            <rect x="-94" y="-20" width="188" height="40" rx="10" />
            <circle v-if="node.name === name" cx="-77" cy="0" r="3" />
            <text text-anchor="middle" dominant-baseline="central">{{ node.name.length > 23 ? node.name.slice(0, 21) + '…' : node.name }}</text>
          </a>
        </RouterLink>
      </svg>
      <p class="graph-hint">{{ graph.edges.length ? 'Drag to explore · select a package to open its details' : 'No indexed dependency relationships for this package.' }}</p>
    </div>
    <div v-if="graph.total > 7" class="graph-expand">
      <span>{{ graph.total - graph.nodes.length }} packages not shown</span>
      <button v-if="graph.nodes.length < graph.total && visibleLimit < 61" @click="visibleLimit = Math.min(61, visibleLimit + (vertical ? 6 : 12))">Show {{ Math.min(vertical ? 6 : 12, graph.total - graph.nodes.length, 61 - visibleLimit) }} more</button>
      <button v-if="visibleLimit > 7" @click="visibleLimit = 7">Collapse</button>
      <button :aria-expanded="browserOpen" @click="browserOpen = !browserOpen">{{ browserOpen ? 'Hide package list' : 'Find any related package' }}</button>
    </div>
    <PackageRelationsList v-if="browserOpen" :names="graph.related" :reset-key="name + full" label="Find related packages" />
    <p v-if="graph.total > 61" class="graph-note">The graph shows up to 60 related packages at a time. Search the complete list or open a package to explore its connections.</p>
    <p class="graph-note">{{ full ? 'Includes indirect relationships; expand to see more nodes.' : 'Shows direct dependents and dependencies.' }} Based on indexed recipes; requirements may vary by platform and configuration.</p>
  </section>
</template>
<style scoped>
.dependency-graph { --graph-cycle: #a56b16; --graph-cycle-soft: #fff5e3; margin: var(--space-8) 0; }
.graph-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
h2 { font-size: 17px; margin: 0 0 5px; }
.graph-head p, .graph-note, .graph-hint { color: var(--c-text-3); font-size: 12px; margin: 0; }
.graph-modes { display: flex; padding: 3px; border: 1px solid var(--c-border); border-radius: 9px; background: var(--c-bg-soft); }
button { border: 0; background: transparent; color: var(--c-text-2); padding: 7px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; }
button:hover { color: var(--c-brand-3); background: var(--c-brand-soft); }
button:focus-visible, .graph-canvas:focus-visible { outline: 2px solid var(--c-brand-3); outline-offset: 2px; }
.graph-modes button[aria-pressed="true"] { background: var(--c-bg); color: var(--c-brand-3); box-shadow: 0 1px 4px rgb(0 0 0 / 8%); }
.graph-surface { border: 1px solid var(--c-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--c-bg-soft); }
.graph-tools { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--c-divider); background: var(--c-bg); }
.graph-tools > span { font-size: 12px; color: var(--c-text-3); }
.graph-tools > div { display: flex; flex-wrap: wrap; }
.graph-canvas { display: block; width: 100%; height: 420px; touch-action: none; cursor: grab; background-image: radial-gradient(var(--c-border) 0.7px, transparent 0.7px); background-size: 18px 18px; }
.graph-canvas:active { cursor: grabbing; }
.graph-edges path { fill: none; stroke: var(--c-text-mute); stroke-width: 1.3; opacity: .45; }
.graph-edges .edge-active { stroke: var(--c-brand-3); opacity: 1; stroke-width: 2; }
.graph-edges .edge-muted { opacity: .12; }
marker path { fill: var(--c-text-mute); }
.graph-node { cursor: pointer; }
.graph-node rect { fill: var(--c-bg); stroke: var(--c-border); filter: drop-shadow(0 2px 3px rgb(0 0 0 / 5%)); }
.graph-node text { fill: var(--c-text-2); font-size: 12px; font-family: var(--font-mono); pointer-events: none; }
.graph-node:hover rect, .graph-node:focus rect { stroke: var(--c-brand-3); stroke-width: 2; }
.graph-node:focus { outline: none; }
.node-current rect { fill: var(--c-brand-soft); stroke: var(--c-brand-3); stroke-width: 2; }
.node-current text, .node-current circle { fill: var(--c-brand-3); font-weight: 600; }
.node-muted { opacity: .3; }
.graph-hint { text-align: center; padding: 10px; }
.graph-expand { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 10px; font-size: 12px; color: var(--c-text-3); }
.graph-expand button { background: var(--c-brand-soft); color: var(--c-brand-3); }
.graph-note { margin-top: 9px; line-height: 1.6; }
@media (max-width: 640px) { .graph-canvas { height: 360px; } .graph-node text { font-size: 13px; } .graph-tools { padding: 8px; } button { padding: 8px; } }
</style>

<style scoped>
:global(html.dark .dependency-graph) { --graph-cycle: #dfb56f; --graph-cycle-soft: #332b1e; }
.graph-cycle-note { color: var(--graph-cycle); background: var(--graph-cycle-soft); font-size: 12px; line-height: 1.6; padding: 9px 12px; border-radius: 8px; margin: 0 0 10px; }
.graph-edges .edge-cycle { stroke: var(--graph-cycle); stroke-dasharray: 5 3; opacity: .85; }
.graph-edges .edge-cycle.edge-muted { opacity: .25; }
marker .cycle-arrow { fill: var(--graph-cycle); }
.node-cycle rect { stroke: var(--graph-cycle); stroke-width: 2; fill: var(--graph-cycle-soft); }
.node-cycle.node-current rect { fill: var(--c-brand-soft); stroke-width: 3; }
</style>
