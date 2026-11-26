import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkPhotos from './remark-photos.mjs';
import remarkRefs from './remark-refs.mjs';

export type Label = CollectionEntry<'labels'>;
export type Guide = CollectionEntry<'guides'>;
export type GalleryLabel = CollectionEntry<'galleryLabels'>;
export type GalleryEntry = CollectionEntry<'gallery'>;

// All labels, in the order you set in the CMS (then A to Z).
export async function getLabels(): Promise<Label[]> {
  const labels = await getCollection('labels');
  return labels.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

// The labels that one article has, in menu order.
// A label that was deleted is simply skipped, so deleting a label never breaks the site.
export function labelsOf(guide: Guide, labels: Label[]): Label[] {
  const ids = guide.data.labels;
  return labels.filter((l) => ids.includes(l.id));
}

// The Gallery has its own labels (a separate list in the CMS), in menu order.
export async function getGalleryLabels(): Promise<GalleryLabel[]> {
  const labels = await getCollection('galleryLabels');
  return labels.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}
// The labels one gallery entry has (a deleted label is skipped).
export function galleryLabelsOf(entry: GalleryEntry, labels: GalleryLabel[]): GalleryLabel[] {
  return labels.filter((l) => entry.data.labels.includes(l.id));
}
export const hasGalleryLabel = (entry: GalleryEntry, labelId: string) => entry.data.labels.includes(labelId);

// Does this article carry this label?
export function hasLabel(guide: Guide, labelId: string): boolean {
  return guide.data.labels.includes(labelId);
}

// The old fixed colour names, translated to colours. New labels store a colour code like #1596e0 directly.
const OLD_COLORS: Record<string, string> = {
  ocean: '#1596e0', sea: '#1aa37a', sun: '#f2a900', violet: '#7a5cf0',
  coral: '#ff6b4a', pink: '#e8509a', teal: '#0fa3b1', orange: '#f07d1a',
};
// The colour of a label, always as a colour code.
export function colorOf(label?: Label | GalleryLabel): string {
  const c = label?.data.color ?? '';
  return OLD_COLORS[c] ?? (/^#[0-9a-f]{3,8}$/i.test(c) ? c : '#1596e0');
}

// Dates as "18 Nov 2026"
export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// The notices for the home page panel, newest first (empty list = panel stays hidden).
export async function getNotices() {
  const items = await getCollection('notices');
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// A page text from the CMS (src/content/pages/<id>.md), ready to show.
// "Content" is the Main text (the body); hasBody says whether anything was written there.
export async function getPage(id: string) {
  const entry: any = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing page: src/content/pages/${id}.md`);
  const { Content, headings } = await render(entry);
  return { data: entry.data, Content, headings, hasBody: Boolean(entry.body?.trim()), body: String(entry.body ?? '') };
}

// Pages that have their own file in src/pages (they are not made by [page].astro).
export const BUILT_IN = ['home', 'knowledge-center', 'fishy-stories', 'gallery', 'shops', 'contact', 'rating-system'];
// Addresses a new page may not take, because the site already uses them.
export const RESERVED = ['admin', 'images', 'pagefind', '_astro', 'favicon', 'sitemap', 'robots', 'search', 'thanks', 'shop-finder'];

// Where each built-in page lives.
const HREF: Record<string, string> = { home: '/', shops: '/shop-finder/' };
export const hrefOf = (id: string) => HREF[id] ?? `/${id}/`;

// All pages with their link, menu and position.
export async function getAllPages() {
  return (await getCollection('pages')).map((e) => ({ id: e.id, title: e.data.title, href: hrefOf(e.id), menu: e.data.menu, position: e.data.position, footerPosition: e.data.footerPosition }));
}

// The new pages made in the CMS (everything that is not built in).
export async function getNewPages() {
  return (await getAllPages()).filter((e) => !BUILT_IN.includes(e.id) && !RESERVED.includes(e.id));
}

// Which notice card to show for the whole page: 'empty' (Nothing here yet) or nothing.
// A whole page is never "Coming soon" any more: an old "coming" setting, the old switch and the
// Shop Finder / Rating System switches all show "Nothing here yet".
// "fallback" is used only while the page has never been saved with the new notice selection.
export function noticeOf(data: { notice?: string; comingSoon?: boolean }, fallback?: 'coming' | 'empty'): 'coming' | 'empty' | undefined {
  if (data.notice === 'coming' || data.notice === 'empty') return 'empty';
  if (data.notice === 'none') return undefined;
  return data.comingSoon || fallback ? 'empty' : undefined;
}

// Gallery entries in the order you set in the CMS (1 first), newest first when the order is equal.
export async function getGallery() {
  const items = await getCollection('gallery');
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title));
}

// ----- The heading photo (the "Heading photo" group in the CMS) -----
export type Cover = { image: string; alt: string; source?: 'own' | 'ai' | 'external'; credit?: string; intro?: string; body?: string };
// The heading photo of a page, article, story or label, or nothing when no photo is picked.
// An empty alt text falls back to the title.
export function coverOf(data: any): Cover | undefined {
  const c = data?.cover;
  if (!c?.image) return undefined;
  return { ...c, alt: c.alt || data.title || data.name || '' };
}
// The photo's own main text, turned into HTML (same rules as the Main text).
let md: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;
export async function coverBodyHtml(cover?: Cover): Promise<string> {
  const text = cover?.body?.trim();
  if (!text) return '';
  md ??= await createMarkdownProcessor({ remarkPlugins: [remarkRefs, remarkPhotos] });
  return (await md.render(text)).code;
}

// "In progress": the Main text has at least one inserted Coming soon / Nothing here yet card
// (the Insert buttons write {{notice:coming}} or {{notice:empty}}).
export const hasTextNotice = (body?: string) => /\{\{notice:(coming|empty)\b/.test(body ?? '');

// ----- The introduction text (written with the same kind of editor as the Main text) -----
// As HTML for the heading of a page (headings, bold, italic, links and lists work).
let introMd: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;
export async function introHtml(text?: string): Promise<string> {
  const t = String(text ?? '').trim();
  if (!t) return '';
  introMd ??= await createMarkdownProcessor({ remarkPlugins: [remarkRefs] });   // removes source markers
  return (await introMd.render(t)).code;
}
// As plain text, for the cards, search engines and share previews (no #, *, link addresses).
// The whole text is used, all paragraphs.
export function plainText(text?: string): string {
  return String(text ?? '')
    .replace(/\{\{ref:[^}]*\}\}/g, '')              // source markers
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')            // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')         // [text](link) -> text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')              // headings
    .replace(/^\s{0,3}>\s?/gm, '')                   // quotes
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')           // list markers
    .replace(/(\*\*|__|\*|_|`)/g, '')                // bold, italic, code
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}
