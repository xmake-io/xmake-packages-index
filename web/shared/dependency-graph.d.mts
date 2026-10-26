export interface GraphNode { name: string; level: number; cyclic: boolean; x: number; y: number }
export function dependencyGraph(relations: Record<string, string[]>, current: string, full?: boolean, vertical?: boolean): {
 nodes: GraphNode[]; edges: {source: string; target: string; cyclic: boolean}[]; cycleCount: number; width: number; height: number
}
export function cyclicComponents(relations: Record<string, string[]>): Map<string, number>
