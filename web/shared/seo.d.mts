export interface PageMeta { title: string; description: string; canonical: string; indexable: boolean }
export function pageMeta(site: {name: string; title: string; description: string; url: string}, route: string, entry?: {name: string; description?: string}): PageMeta;
export function escapeHtml(value: unknown): string;
export function metadataHtml(meta: PageMeta, siteName: string): string;
