export interface UsageEntry { name: string; kind?: string; latest_version?: string; repository_url?: string }
export interface Snippet { label: string; language: string; code: string }
export interface SnippetGroup { id: string; title: string; description: string; snippets: Snippet[] }
export function quickUsage(pkg: UsageEntry): { title: string; language: string; code: string }
export function snippetGroups(pkg: UsageEntry): SnippetGroup[]
export function addonSnippetGroups(pkg: UsageEntry): SnippetGroup[]
