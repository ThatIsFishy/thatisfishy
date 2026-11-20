export const SITE_NAME = 'That Is Fishy';
export const SITE_URL = 'https://thatisfishy.com';
export const TAGLINE = 'Learning the aquarium hobby, out loud.';

// The first year of the site. The footer shows "2026", then "2026 – 2027" and so on.
export const START_YEAR = 2026;

// ----- Switches (change true/false, commit, and the site updates) -----
// false = Shops disappears from the menu and the page sends visitors to the home page.
export const SHOW_SHOPS = true;
// true = the Shops page says "Coming soon" instead of showing the list.
export const SHOPS_COMING_SOON = true;

// ----- Topics (labels) in the order they appear in the menu -----
export const TOPICS = ['Basics', 'Plants', 'Fish', 'Water', 'Equipment', 'Problems'];

// Turns a topic like "Water" into a web-friendly label like "water".
export const topicSlug = (t: string) =>
  t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
