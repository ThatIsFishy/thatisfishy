export const SITE_NAME = 'That Is Fishy';
export const SITE_URL = 'https://thatisfishy.com';
export const TAGLINE = 'Learning the aquarium hobby, out loud.';

// Turns a topic name like "Water" into a web-friendly label like "water".
export const topicSlug = (t: string) =>
  t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
