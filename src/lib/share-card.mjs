// Share pictures: the picture WhatsApp, Facebook etc. show when someone shares a page that has no heading photo.
// Made by the site itself at every publish (see astro.config.mjs), so new pages and new titles always get one.
//   - Home page: the fish, "That Is Fishy", the slogan, the line with a bubble and the web address.
//   - Other pages: the fish (with an article's first label next to it), the page title (max. 2 lines), "That Is Fishy".
// The logo is public/logo.svg: change that file and every picture follows at the next publish.
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const SLOGAN = 'Beauty goes beyond the aquascape.';
const W = 1200, H = 630;
const BG = '#e8f4fb', INK = '#0b2a4a', WATER = '#0a6aa6', MUTED = '#4a6a85';

const font = (pkg, file) => fs.readFileSync(path.join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));
let fonts;
const getFonts = () => (fonts ??= [
  { name: 'Oswald', data: font('oswald', 'oswald-latin-700-normal.woff'), weight: 700, style: 'normal' },
  { name: 'Oswald', data: font('oswald', 'oswald-latin-500-normal.woff'), weight: 500, style: 'normal' },
  { name: 'Lora', data: font('lora', 'lora-latin-400-normal.woff'), weight: 400, style: 'normal' },
]);
let fish;
const getFish = () => (fish ??= 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(process.cwd(), 'public/logo.svg')).toString('base64'));

const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) } });
const img = (src, size) => ({ type: 'img', props: { src, width: size * 1.25, height: size, style: { width: size * 1.25, height: size } } });   // the logo is 5 : 4

// Mix a colour with white / ink (like the labels on the site)
const mix = (hex, pct, base) => {
  const p = (c) => { const s = c.replace('#', ''); const f = s.length === 3 ? s.split('').map((x) => x + x).join('') : s.slice(0, 6); return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)); };
  const a = p(hex), b = p(base);
  return '#' + a.map((x, i) => Math.round(x * pct + b[i] * (1 - pct)).toString(16).padStart(2, '0')).join('');
};

const bubble = (x, y, s) => h('div', { position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, border: `3px solid ${WATER}`, opacity: 0.35 },
  h('div', { position: 'absolute', right: s * 0.2, top: s * 0.2, width: s * 0.18, height: s * 0.18, borderRadius: s, background: WATER }));
const BUBBLES = [[80, 90, 46], [70, 430, 28], [1040, 80, 34], [1100, 330, 58], [1130, 470, 22], [60, 250, 18], [1150, 250, 16], [900, 150, 14]];

// The line with a bubble (golden ratio, like on the site) and the web address under it
const bottom = () => [
  h('div', { position: 'absolute', left: 120, right: 120, bottom: 92, alignItems: 'center' },
    h('div', { flexGrow: 0.618, height: 3, background: WATER, opacity: 0.45, borderRadius: 2 }),
    h('div', { position: 'relative', width: 30, height: 30, margin: '0 18px', borderRadius: 30, border: `3.5px solid ${WATER}` },
      h('div', { position: 'absolute', right: 4.5, top: 4.5, width: 6.5, height: 6.5, borderRadius: 7, background: WATER })),
    h('div', { flexGrow: 1, height: 3, background: WATER, opacity: 0.45, borderRadius: 2 })),
  h('div', { position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald', fontWeight: 500, fontSize: 24, letterSpacing: 2, color: WATER }, 'THATISFISHY.COM'),
];

function home() {
  return h('div', { width: W, height: H, background: BG, position: 'relative' },
    ...BUBBLES.map(([x, y, s]) => bubble(x, y, s)),
    // the name exactly in the middle, the fish above it, the slogan below it
    h('div', { position: 'absolute', left: 0, right: 0, bottom: H / 2 + 66, justifyContent: 'center' }, img(getFish(), 180)),
    h('div', { position: 'absolute', left: 0, right: 0, top: H / 2 - 70, height: 140, alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 108, color: INK }, 'That Is Fishy'),
    h('div', { position: 'absolute', left: 0, right: 0, top: H / 2 + 66, justifyContent: 'center', fontFamily: 'Lora', fontSize: 38, color: MUTED }, SLOGAN),
    ...bottom());
}

function page(title, label) {
  const pill = label?.name
    ? h('div', { marginLeft: 18, padding: '4px 22px', borderRadius: 99, border: `2px solid ${mix(label.color, 0.5, '#ffffff')}`, background: mix(label.color, 0.16, '#ffffff'), color: mix(label.color, 0.4, INK), fontFamily: 'Oswald', fontWeight: 500, fontSize: 30 }, label.name)
    : null;
  return h('div', { width: W, height: H, background: BG, position: 'relative' },
    ...BUBBLES.map(([x, y, s]) => bubble(x, y, s)),
    h('div', { position: 'absolute', left: 150, right: 150, top: 30, bottom: 110, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
      h('div', { alignItems: 'center', marginBottom: 14 }, img(getFish(), 110), pill),
      h('div', { display: 'block', maxWidth: 900, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 84, lineHeight: 1.2, paddingBottom: 6, color: INK, lineClamp: 2 }, title),   // max. 2 lines, then …
      h('div', { marginTop: 10, fontFamily: 'Oswald', fontWeight: 500, fontSize: 34, letterSpacing: 1, color: WATER }, 'That Is Fishy')),
    ...bottom());
}

// card: { title?: string, label?: { name, color } }. No title = the home page picture. Returns PNG bytes.
export async function shareCard(card = {}) {
  const svg = await satori(card.title ? page(card.title, card.label) : home(), { width: W, height: H, fonts: getFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
}
