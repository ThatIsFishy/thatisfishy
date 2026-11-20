import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';

export type Label = CollectionEntry<'labels'>;
export type Guide = CollectionEntry<'guides'>;

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
export function colorOf(label?: Label): string {
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
export async function getPage(id: string) {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing page text: src/content/pages/${id}.md`);
  const { Content } = await render(entry);
  return { data: entry.data, Content };
}

// Gallery entries in the order you set in the CMS (1 first), newest first when the order is equal.
export async function getGallery() {
  const items = await getCollection('gallery');
  return items.sort((a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf());
}
