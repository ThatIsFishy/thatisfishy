// Turns photo lines in articles into nicely positioned figures.
//
// In the CMS you insert a photo as usual. To position it, add a layout word:
//   - in the "title" of the image (if the CMS dialog has that field), or
//   - at the very start of the alt text, between curly brackets: {left} Red shrimp on moss
//
// Layout words:  left | right | center | small
//   left / right  the photo sits at the side and the text wraps around it
//   center        the photo sits in the middle on its own line (this is the default)
//   small         a smaller photo in the middle
// Add a caption after a bar:  {left | My first shrimp}   or   title: left | My first shrimp
//
// Two or more photos in the SAME paragraph (one directly under the other, no empty line)
// are shown side by side in one row.

const LAYOUTS = ['left', 'right', 'center', 'small'];

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Reads "left | caption" into { layout, caption }
function parseToken(raw) {
  const [first, ...rest] = String(raw ?? '').split('|');
  const word = first.trim().toLowerCase();
  const isLayout = LAYOUTS.includes(word);
  const caption = (isLayout ? rest.join('|') : [first, ...rest].join('|')).trim();
  return { layout: isLayout ? word : 'center', caption };
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

const imgTag = (p) =>
  `<img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">`;

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

export default function remarkPhotos() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
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
