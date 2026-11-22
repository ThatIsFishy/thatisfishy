// Adds a "Section break" button to the editor (Insert → Section break).
// Three bubbles = a section ends here. Line with one bubble = a stronger break.
// It writes {{break:three}} or {{break:line}} on its own line, which the site turns into the bubbles.
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;
  window.CMS.registerEditorComponent({
    id: 'section-break',
    label: 'Section break',
    fields: [
      {
        name: 'style', label: 'Style', widget: 'select', default: 'three',
        options: [
          { label: 'Three bubbles (a section ends here)', value: 'three' },
          { label: 'Line with one bubble (a stronger break)', value: 'line' },
        ],
      },
    ],
    pattern: /^\{\{break:(three|line)\}\}$/,
    fromBlock: function (m) { return { style: m[1] }; },
    toBlock: function (o) { return '{{break:' + (o.style === 'line' ? 'line' : 'three') + '}}'; },
    toPreview: function (o) { return o.style === 'line' ? '<hr>' : '<p style="text-align:center">○ ○ ○</p>'; },
  });
})();
