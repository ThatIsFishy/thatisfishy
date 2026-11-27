// Adds "Source" to the editor's Insert menu (Main text only). It is an INLINE piece: it sits inside the sentence,
// right where the cursor is, and shows as a small chip like [Smith 2020]. Click the chip to change it.
// It writes {{ref:Smith 2020}} (the Short name from "Sources and useful links" under the Main text, or its place
// in that list: {{ref:1}} = the first source). On the site it becomes a small number (in the order the sources are
// first used) that links to the source in the box under the text.
// Inline so the CMS can open it again after saving (a block piece can only stand on its own line).
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;
  var ask = function (current) {
    var answer = window.prompt('Short name of the source, as written in "Sources and useful links" (or its place in the list: 1 = the first source):', current || '');
    if (answer === null) return null;                       // cancelled
    answer = String(answer).replace(/[{}\n]/g, ' ').trim();
    return answer ? { key: answer } : null;
  };
  window.CMS.registerEditorComponent({
    id: 'source-ref',
    label: 'Source',
    type: 'inline',
    pattern: /\{\{ref:([^}]*)\}\}/,
    fromInline: function (m) { return { key: (m[1] || '').trim() }; },
    toInline: function (o) { return '{{ref:' + String((o && o.key) || '').replace(/[{}\n]/g, ' ').trim() + '}}'; },
    toPreview: function (o) { return '<sup style="color:#0b6fa4;font-weight:700">[' + String((o && o.key) || '?').replace(/</g, '&lt;') + ']</sup>'; },
    onInsert: function () { return ask(''); },
    onEdit: function (e) { return ask(e && e.data ? e.data.key : ''); },
  });
})();
