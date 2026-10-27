export interface SeoEntry { name: string; description?: string; kind?: string }
export interface PageMeta { title: string; description: string; canonical: string; indexable: boolean; breadcrumbs: {name:string;path:string}[] }
export function pageMeta(site: {name: string; title: string; description: string; url: string}, route: string, entry?: SeoEntry): PageMeta;
export function escapeHtml(value: unknown): string;
export function metadataHtml(meta: PageMeta, siteName: string): string;
export function breadcrumbData(meta: PageMeta, siteUrl: string): object | undefined;
export function breadcrumbJson(meta: PageMeta, siteUrl: string): string;
