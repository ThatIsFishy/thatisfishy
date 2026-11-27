// "Sources and useful links" (only for the Main text).
//
// In the CMS each page has a list "Sources and useful links" under the Main text. In the Main text a source is
// marked with Insert > Source (or typed by hand anywhere in a sentence): {{ref:Smith 2020}}
// The text after "ref:" is the source's Short name (or its title, or its place in the list: 1 = the first).
// The site turns the marker into a small number:
//   - numbers are given in the order the sources are FIRST used in the Main text (the first one is 1);
//   - the same source used again keeps its number;
//   - a marker on its own line (Insert puts it there) joins the end of the paragraph above it;
//   - a marker that matches no source shows nothing.
// At the end of the Main text comes a box that opens and closes, with the numbered sources first and the sources
// without a number under them (heading: the page's "Heading for the useful links", or "More on this topic").
// Markers in any other text (Introduction, photo texts, notes) are simply removed.

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const MARK = /\{\{ref:([^}]*)\}\}/g;
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const filled = (r) => ['short', 'author', 'authors', 'title', 'source', 'published', 'summary', 'note', 'link'].some((k) => String(r?.[k] ?? '').trim());

function finder(refs) {
  return (key) => {
    const k = norm(key);
    if (!k) return -1;
    // A number (1, 2, 3…, also "1.") means that place in the list: 1 = the first source.
    const num = k.match(/^(\d+)\.?$/);
    if (num) { const n = Number(num[1]) - 1; return n >= 0 && n < refs.length ? n : -1; }
    let i = refs.findIndex((r) => norm(r.short) === k);
    if (i < 0) i = refs.findIndex((r) => norm(r.title) === k);
    if (i < 0 && k.length >= 3) i = refs.findIndex((r) => norm(r.title).startsWith(k));
    return i;
  };
}

const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const short = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);

// One line of the list: Smith J, Brown K (2020). Title. Journal. link ↗ — and his note below.
function entry(r) {
  const who = [r.author, r.authors].map((s) => String(s ?? '').trim()).filter(Boolean).join(', ');
  const when = String(r.published ?? '').trim();
  const title = String(r.title ?? '').trim();
  const link = String(r.link ?? '').trim();
  const parts = [];
  if (who || when) parts.push(`<span class="ref-who">${esc(who)}${when ? ` (${esc(when)})` : ''}.</span>`);
  if (title) parts.push(link ? `<a class="ref-title" href="${esc(link)}" target="_blank" rel="noopener">${esc(title)}</a>.` : `<span class="ref-title">${esc(title)}</span>.`);
  if (String(r.source ?? '').trim()) parts.push(`<i class="ref-source">${esc(r.source.trim())}</i>.`);
  if (link && !title) parts.push(`<a class="ref-link" href="${esc(link)}" target="_blank" rel="noopener">${esc(host(link))} ↗</a>`);
  else if (link) parts.push(`<a class="ref-link" href="${esc(link)}" target="_blank" rel="noopener" aria-label="Open the source">↗</a>`);
  const note = String(r.note ?? '').trim() ? `<span class="ref-note">${esc(r.note.trim())}</span>` : '';
  return `<span class="ref-text">${parts.join(' ')}${note}</span>`;
}

// What the small box shows when hovering (or tapping) a number.
function tip(r) {
  const title = String(r.title ?? '').trim() || String(r.short ?? '').trim() || host(String(r.link ?? ''));
  const first = String(r.author ?? '').trim();
  const who = first ? first + (String(r.authors ?? '').trim() ? ' et al.' : '') : '';
  const when = String(r.published ?? '').trim();
  const sum = String(r.summary ?? '').trim();
  return `<span class="ref-tip-title">${esc(title)}</span>`
    + (sum ? `<span class="ref-tip-text">${esc(short(sum, 170))}</span>` : '')
    + (who || when ? `<span class="ref-tip-meta">${esc([who, when].filter(Boolean).join(' · '))}</span>` : '');
}

function box(refs, order, heading) {
  const numbered = order.map((i, n) => `<li id="ref-${n + 1}" class="ref-item"><span class="ref-n">${n + 1}</span>${entry(refs[i])}<a class="ref-back" href="#cite-${n + 1}" aria-label="Back to the text" title="Back to the text">↩</a><template class="ref-tip-src">${tip(refs[i])}</template></li>`).join('');
  const rest = refs.map((r, i) => ({ r, i })).filter(({ r, i }) => !order.includes(i) && filled(r));
  const useful = rest.map(({ r }) => `<li class="ref-item ref-plain">${entry(r)}</li>`).join('');
  const count = order.length + rest.length;
  return `<details class="refs" id="sources" data-refs data-pagefind-ignore>`
    + `<summary class="refs-bar"><svg class="refs-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 12h5"/></g></svg>`
    + `<span class="refs-label">Sources and useful links</span><span class="refs-count">${count}</span><span class="refs-arrow" aria-hidden="true"></span></summary>`
    + `<div class="refs-body">`
    + (numbered ? `<ol class="refs-list">${numbered}</ol>` : '')
    + (useful ? `<h4 class="refs-sub">${esc(heading || 'More on this topic')}</h4><ul class="refs-list refs-useful">${useful}</ul>` : '')
    + `</div></details>`;
}

export default function remarkRefs() {
  return (tree, file) => {
    const fm = file?.data?.astro?.frontmatter;
    const refs = Array.isArray(fm?.references) ? fm.references.filter((r) => r && typeof r === 'object') : [];
    const find = finder(refs);
    const order = [];   // index in the list, in order of first use
    const uses = {};    // how many times each number is used (for the ids)

    const sup = (key) => {
      const i = find(key);
      if (i < 0 || !refs.length) return null;
      if (!order.includes(i)) order.push(i);
      const n = order.indexOf(i) + 1;
      uses[n] = (uses[n] ?? 0) + 1;
      const id = uses[n] === 1 ? `cite-${n}` : `cite-${n}-${uses[n]}`;
      return { type: 'html', value: `<sup class="ref"><a href="#ref-${n}" id="${id}" data-ref="${n}" aria-label="Source ${n}">${n}</a></sup>` };
    };

    // Replace markers inside text, in reading order.
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.flatMap((k) => {
        if (k.type === 'text' && k.value.includes('{{ref:')) {
          const out = [];
          let last = 0;
          for (const m of k.value.matchAll(MARK)) {
            if (m.index > last) out.push({ type: 'text', value: k.value.slice(last, m.index) });
            const s = sup(m[1]);
            if (s) out.push(s);
            last = m.index + m[0].length;
          }
          if (last < k.value.length) out.push({ type: 'text', value: k.value.slice(last) });
          return out;
        }
        walk(k);
        return [k];
      });
    };

    // A paragraph with only markers (Insert puts each on its own line) joins the paragraph above it.
    const join = (node) => {
      if (!node.children) return;
      const out = [];
      for (const k of node.children) {
        const onlyRefs = k.type === 'paragraph' && k.children?.length && k.children.every((c) => (c.type === 'text' && !c.value.replace(MARK, '').trim()) || c.type === 'break');
        const prev = out.at(-1);
        if (onlyRefs && k.children.some((c) => c.type === 'text' && c.value.includes('{{ref:'))) {
          const marks = k.children.filter((c) => c.type === 'text').map((c) => c.value.trim()).join('');
          if (prev?.type === 'paragraph') { prev.children.push({ type: 'text', value: marks }); continue; }
          if (prev?.type === 'list' || prev?.type === 'blockquote') {
            let last = prev; while (last.children?.length && last.children.at(-1).type !== 'paragraph') last = last.children.at(-1);
            const p = last.type === 'paragraph' ? last : null;
            if (p) { p.children.push({ type: 'text', value: marks }); continue; }
          }
        }
        join(k);
        out.push(k);
      }
      node.children = out.filter((k) => !(k.type === 'paragraph' && k.children?.every((c) => c.type === 'text' && !c.value.replace(MARK, '').trim())));
    };

    join(tree);
    walk(tree);
    const hasUseful = refs.some((r, i) => !order.includes(i) && filled(r));
    if (order.length || hasUseful) tree.children.push({ type: 'html', value: box(refs, order, String(fm?.useful_heading ?? '').trim()) });
  };
}
