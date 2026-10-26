// Iterative Kosaraju: no recursive call stack, including for long/cyclic chains.
export function cyclicComponents(relations) {
  const names = Object.keys(relations)
  const outgoing = new Map(names.map(name => [name, []]))
  for (const [target, parents] of Object.entries(relations)) {
    for (const parent of parents) if (outgoing.has(parent)) outgoing.get(parent).push(target)
  }
  const visited = new Set(), order = []
  for (const start of names) {
    if (visited.has(start)) continue
    visited.add(start)
    const stack = [[start, 0]]
    while (stack.length) {
      const frame = stack[stack.length - 1]
      const neighbors = outgoing.get(frame[0])
      if (frame[1] < neighbors.length) {
        const next = neighbors[frame[1]++]
        if (!visited.has(next)) { visited.add(next); stack.push([next, 0]) }
      } else { order.push(frame[0]); stack.pop() }
    }
  }
  const assigned = new Set(), cycles = new Map()
  let id = 0
  for (const start of order.reverse()) {
    if (assigned.has(start)) continue
    const group = [], stack = [start]
    assigned.add(start)
    while (stack.length) {
      const name = stack.pop()
      group.push(name)
      for (const next of relations[name] || []) {
        if (outgoing.has(next) && !assigned.has(next)) { assigned.add(next); stack.push(next) }
      }
    }
    if (group.length > 1 || (relations[start] || []).includes(start)) {
      for (const name of group) cycles.set(name, id)
      id++
    }
  }
  return cycles
}

// Lay out the selected package's incoming/outgoing dependency chains.
// Breadth-first traversal keeps cycles finite and each package appears once.
export function dependencyGraph(relations, current, full = false, vertical = false) {
  if (!Object.hasOwn(relations, current)) return { nodes: [], edges: [], cycleCount: 0, width: 480, height: 300 }
  const dependencies = Object.fromEntries(Object.keys(relations).map(name => [name, []]))
  for (const [dependency, parents] of Object.entries(relations)) {
    for (const parent of parents) if (Object.hasOwn(dependencies, parent)) dependencies[parent].push(dependency)
  }
  const cycles = cyclicComponents(relations)
  const levels = new Map([[current, 0]])
  function visit(adjacency, direction) {
    const visited = new Set([current])
    const queue = [[current, 0]]
    for (let i = 0; i < queue.length; i++) {
      const [name, depth] = queue[i]
      if (!full && depth >= 1) continue
      for (const next of adjacency[name] || []) {
        if (visited.has(next)) continue
        visited.add(next)
        if (!levels.has(next)) levels.set(next, direction * (depth + 1))
        queue.push([next, depth + 1])
      }
    }
  }
  visit(dependencies, 1)
  visit(relations, -1)
  const columns = new Map()
  for (const [name, level] of levels) {
    if (!columns.has(level)) columns.set(level, [])
    columns.get(level).push(name)
  }
  const min = Math.min(...columns.keys())
  const max = Math.max(...columns.keys())
  const horizontalHeight = Math.max(300, ...[...columns.values()].map(names => names.length * 58 + 64))
  const width = vertical ? Math.max(400, ...[...columns.values()].map(names => names.length * 210 + 40)) : (max - min) * 250 + 240
  const height = vertical ? (max - min) * 110 + 140 : horizontalHeight
  const nodes = [...columns.entries()].flatMap(([level, names]) => names.sort().map((name, i) => ({
    name, level, cyclic: cycles.has(name), x: vertical ? width / 2 + (i - (names.length - 1) / 2) * 210 : 120 + (level - min) * 250, y: vertical ? 70 + (level - min) * 110 : height / 2 + (i - (names.length - 1) / 2) * 58,
  })))
  const edges = []
  for (const [target, parents] of Object.entries(relations)) if (levels.has(target)) {
    for (const source of parents) if (levels.has(source)) edges.push({ source, target, cyclic: cycles.has(source) && cycles.get(source) === cycles.get(target) })
  }
  return { nodes, edges, cycleCount: new Set(nodes.filter(n => n.cyclic).map(n => cycles.get(n.name))).size, width, height }
}
