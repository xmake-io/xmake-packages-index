export interface Category { slug: string; label: string; kind: string; description: string }
export const categoryPageSize: number
export const categories: Category[]
export function packageKind(entry?: {kind?: string}): string
export function categoryFor(entry?: {kind?: string}): Category
export function categoryRoute(slug: string, page?: number): string
export function categoryFromRoute(route: string): { category: Category; page: number } | undefined
export function categoryEntries<T extends {name: string; kind?: string}>(category: Category, packages: T[], addons: T[]): T[]
