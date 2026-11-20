export const SITE_NAME = 'That Is Fishy';
export const SITE_URL = 'https://thatisfishy.com';
export const TAGLINE = 'Learning the aquarium hobby, out loud.';

// The first year of the site. The footer shows "2026", then "2026 – 2027" and so on.
export const START_YEAR = 2026;

// ----- Switches (change true/false, commit, and the site updates) -----
// false = Shop Finder disappears from the menu and the page sends visitors to the home page.
export const SHOW_SHOPS = true;
// true = the Shop Finder page says "Coming soon" instead of showing the list.
export const SHOPS_COMING_SOON = true;

// ----- Gallery -----
// How many of the newest photos the home page shows (one row of 4).
export const HOME_GALLERY_COUNT = 4;

// ----- Photo sources: the three labels shown on photos -----
export const SOURCES = {
  own: 'My photo',
  ai: 'AI generated',
  external: 'External source',
} as const;
export type Source = keyof typeof SOURCES;
