// Turns photo lines in articles into nicely positioned figures with a source label.
//
// In the CMS use the "Photo" button in the editor toolbar: it has drop-downs for the layout and the
// source. Under the hood it writes this, which you can also type by hand:
//
//   ![{left, ai | My caption} Description of the photo](/images/uploads/photo.jpg)
//
// Between the curly brackets, separated by commas:
//   layout:  left | right | center | small
//     left / right  the photo sits at the side and the text wraps around it
//     center        the photo sits in the middle on its own line (the default)
//     small         a smaller photo in the middle
//   source:  own | ai | external      (my photo, AI generated, external source)
//   Then, after a bar |, an optional caption.
// The same text may also be put in the image "title" instead of the curly brackets.
//
// Two or more photos in the SAME paragraph (one directly under the other, no empty line)
// are shown side by side in one row.

const LAYOUTS = ['left', 'right', 'center', 'small'];
const SOURCES = { own: 'My photo', ai: 'AI generated', external: 'External source' };

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Reads "left, ai | caption" into { layout, source, caption }
function parseToken(raw) {
  const text = String(raw ?? '');
  const bar = text.indexOf('|');
  const wordsPart = bar === -1 ? text : text.slice(0, bar);
  const words = wordsPart.split(/[\s,]+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
  const known = words.every((w) => LAYOUTS.includes(w) || w in SOURCES);
  if (!known) return { layout: 'center', source: '', caption: text.trim() };
  return {
    layout: words.find((w) => LAYOUTS.includes(w)) ?? 'center',
    source: words.find((w) => w in SOURCES) ?? '',
    caption: bar === -1 ? '' : text.slice(bar + 1).trim(),
  };
}

// Finds the layout token for one image node: the title wins, else a {…} prefix in the alt text.
function describe(img) {
  let alt = img.alt ?? '';
  let token = img.title ?? '';
  const m = alt.match(/^\s*\{([^}]*)\}\s*/);
  if (m) {
    if (!token) token = m[1];
    alt = alt.slice(m[0].length);
  }
  return { src: img.url, alt, ...parseToken(token) };
}

const badge = (p) =>
  p.source ? `<span class="src src-${p.source}" data-pagefind-ignore><svg class="bub srcb" aria-hidden="true"><use href="#bub"></use></svg>${SOURCES[p.source]}</span>` : '';

// The photo with its source label on top
const imgTag = (p) =>
  `<span class="imgwrap" data-src="${p.source}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">${badge(p)}</span>`;

function figure(p) {
  const cap = p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : '';
  return `<figure class="photo photo-${p.layout}">${imgTag(p)}${cap}</figure>`;
}

function row(list) {
  const items = list
    .map((p) => `<figure>${imgTag(p)}${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</figure>`)
    .join('');
  return `<div class="photo-row" style="--n:${list.length}">${items}</div>`;
}

// Section breaks. A line with only --- (or ***) gives three bubbles. The editor's Section break button
// writes {{break:three}} or {{break:line}} on its own line, which gives three bubbles or a line with one bubble.
const BUB = '<svg class="bub{c}" aria-hidden="true"><use href="#bub"></use></svg>';
const brk3 = () => `<div class="brk3" aria-hidden="true">${BUB.replace('{c}', ' sm')}${BUB.replace('{c}', ' lg')}${BUB.replace('{c}', '')}</div>`;
const brk1 = () => `<div class="brk1" aria-hidden="true"><span class="ln ln1"></span>${BUB.replace('{c}', ' lg')}<span class="ln ln2"></span></div>`;

// A notice card inside the text: {{notice:coming}} or {{notice:empty}}, optionally with a message after a bar:
// {{notice:coming|The rest of this article follows soon.}}  (written by the editor's Insert buttons)
const NOTICE = {
  coming: ['Coming soon', 'The rest of this is not ready yet. Check back soon.'],
  empty: ['Nothing here yet', 'There is nothing here yet. Check back soon.'],
};
const LOGO = {
  coming: '<svg class="nlogo" width="190" height="190" aria-hidden="true" focusable="false"><use href="#nl-base" width="100%" height="100%"></use></svg>',
  empty: '<svg class="nlogo" width="219" height="190" aria-hidden="true" focusable="false"><use href="#nl-curtain" width="100%" height="100%"></use></svg>',
};
// Inside the Main text it is always "Coming soon" (an older {{notice:empty}} is shown as Coming soon too).
const notice = (_kind, message) =>
  `<div class="card empty-card coming-card">${LOGO.coming}<h3>${NOTICE.coming[0]}</h3><p>${esc(message || NOTICE.coming[1])}</p></div>`;

// A notice or break marker may also end up inside a sentence (for example "Main{{notice:coming}}",
// when it was inserted without an empty line). Such a paragraph is split: the text before it,
// the card or line, and the text after it.
const MARKER = /\{\{(?:notice:(coming|empty)(?:\|([^}]*))?|break:(three|line))\}\}/g;
const markerHtml = (m) => (m[3] ? (m[3] === 'line' ? brk1() : brk3()) : notice(m[1], (m[2] || '').trim()));
function splitMarkers(par) {
  const kids = par.children ?? [];
  if (!kids.some((k) => k.type === 'text' && /\{\{(?:notice|break):/.test(k.value))) return null;
  const out = [];
  let cur = [];
  const flush = () => {
    // drop empty text and line breaks at the start and end of a piece
    while (cur.length && ((cur[0].type === 'text' && !cur[0].value.trim()) || cur[0].type === 'break')) cur.shift();
    while (cur.length && ((cur.at(-1).type === 'text' && !cur.at(-1).value.trim()) || cur.at(-1).type === 'break')) cur.pop();
    if (cur.length) out.push({ type: 'paragraph', children: cur });
    cur = [];
  };
  for (const k of kids) {
    if (k.type !== 'text') { cur.push(k); continue; }
    let last = 0;
    for (const m of k.value.matchAll(MARKER)) {
      if (m.index > last) cur.push({ type: 'text', value: k.value.slice(last, m.index) });
      flush();
      out.push({ type: 'html', value: markerHtml(m) });
      last = m.index + m[0].length;
    }
    if (last < k.value.length) cur.push({ type: 'text', value: k.value.slice(last) });
  }
  flush();
  return out;
}

// A side note (Insert > Side note): {{note:yellow|justify}} … {{/note}}, each marker on its own line.
// Colours: yellow, green, orange, blue. Alignment: justify, left, center, right.
// Everything between the two markers is normal Main text (bold, links, lists, more paragraphs).
const NOTE_START = /^\{\{note:(yellow|green|orange|blue)(?:\|(justify|left|center|right))?\}\}$/;
const NOTE_END = /^\{\{\/note\}\}$/;
const onlyText = (n) => n.type === 'paragraph' && n.children?.length === 1 && n.children[0].type === 'text' ? n.children[0].value.trim() : null;
function wrapNotes(children) {
  const out = [];
  let open = false;
  for (const child of children) {
    const t = onlyText(child);
    const m = t && t.match(NOTE_START);
    if (m) {
      if (open) out.push({ type: 'html', value: '</div>' });
      out.push({ type: 'html', value: `<div class="sidenote" data-c="${m[1]}" data-a="${m[2] || 'justify'}">` });
      open = true;
      continue;
    }
    if (t && NOTE_END.test(t)) {
      if (open) { out.push({ type: 'html', value: '</div>' }); open = false; }
      continue;
    }
    out.push(child);
  }
  if (open) out.push({ type: 'html', value: '</div>' });   // a forgotten {{/note}} closes at the end
  return out;
}

export default function remarkPhotos() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = wrapNotes(node.children).flatMap((child) => {
        if (child.type === 'paragraph') {
          const parts = splitMarkers(child);
          if (parts) return parts.map((p) => { if (p.type === 'paragraph') walk(p); return p; });
        }
        if (child.type === 'thematicBreak') return { type: 'html', value: brk3() };
        if (child.type === 'paragraph' && child.children?.length === 1 && child.children[0].type === 'text') {
          const text = child.children[0].value.trim();
          const m = text.match(/^\{\{break:(three|line)\}\}$/);
          if (m) return { type: 'html', value: m[1] === 'line' ? brk1() : brk3() };
          const n = text.match(/^\{\{notice:(coming|empty)(?:\|([^}]*))?\}\}$/);
          if (n) return { type: 'html', value: notice(n[1], (n[2] || '').trim()) };
        }
        if (child.type === 'paragraph') {
          const kids = child.children ?? [];
          const images = kids.filter((k) => k.type === 'image');
          const onlyImages =
            images.length > 0 &&
            kids.every((k) => k.type === 'image' || (k.type === 'text' && !k.value.trim()) || k.type === 'break');
          if (onlyImages) {
            const parts = images.map(describe);
            return { type: 'html', value: parts.length === 1 ? figure(parts[0]) : row(parts) };
          }
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
