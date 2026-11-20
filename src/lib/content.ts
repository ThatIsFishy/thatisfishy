import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';

export type Label = CollectionEntry<'labels'>;
export type Guide = CollectionEntry<'guides'>;

// All labels, in the order you set in the CMS (then A to Z).
export async function getLabels(): Promise<Label[]> {
  const labels = await getCollection('labels');
  return labels.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

// The labels that one article has, in menu order.
export function labelsOf(guide: Guide, labels: Label[]): Label[] {
  const ids = guide.data.labels.map((l) => l.id);
  return labels.filter((l) => ids.includes(l.id));
}

// Does this article carry this label?
export function hasLabel(guide: Guide, labelId: string): boolean {
  return guide.data.labels.some((l) => l.id === labelId);
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
