// Adds "Source" to the editor's Insert menu (Main text only). Type the source's Short name (or its title) from
// "Sources and useful links" under the Main text. It writes {{ref:Smith 2020}}; on the site it becomes a small
// number (in the order the sources are first used) that links to the source in the box under the text.
// The CMS puts it on its own line: the site joins it to the end of the paragraph above it.
// To put a number in the middle of a sentence, type {{ref:Smith 2020}} there by hand.
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;
  window.CMS.registerEditorComponent({
    id: 'source-ref',
    label: 'Source',
    fields: [{ name: 'key', label: 'Short name of the source (as written in the list)', widget: 'string', hint: 'Type the Short name exactly as in Sources and useful links under the Main text (e.g. Smith 2020), or its place in that list (1 = the first source). Not shown on the site.' }],
    pattern: /^\{\{ref:([^}]*)\}\}$/,
    fromBlock: function (m) { return { key: (m[1] || '').trim() }; },
    toBlock: function (o) { return '{{ref:' + String(o.key || '').replace(/[{}\n]/g, ' ').trim() + '}}'; },
    toPreview: function (o) { return '<p><sup style="color:#0b6fa4;font-weight:700">[' + (o.key || '?') + ']</sup></p>'; },
  });
})();
