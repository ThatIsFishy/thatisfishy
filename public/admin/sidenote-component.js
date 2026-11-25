// Adds "Side note" to the editor's Insert menu (Main text).
// A side note is a short text with a coloured line on the left. It writes:
//   {{note:yellow|justify}}
//   your text (bold, italic, links and lists work; empty lines make new paragraphs)
//   {{/note}}
// which the site turns into the side note.
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;
  var COLOURS = { yellow: '#ffd23f', green: '#1aa37a', orange: '#ff6b4a', blue: '#0a6aa6' };
  window.CMS.registerEditorComponent({
    id: 'side-note',
    label: 'Side note',
    fields: [
      {
        name: 'colour', label: 'Colour of the line', widget: 'select', default: 'yellow',
        options: [
          { label: 'Yellow: tip or remark', value: 'yellow' },
          { label: 'Green: good to know', value: 'green' },
          { label: 'Orange: warning', value: 'orange' },
          { label: 'Blue: information', value: 'blue' },
        ],
      },
      {
        name: 'align', label: 'Alignment', widget: 'select', default: 'justify',
        options: [
          { label: 'Justify (like all other text)', value: 'justify' },
          { label: 'Left', value: 'left' },
          { label: 'Centre', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
      { name: 'text', label: 'Text', widget: 'text', hint: 'Bold (**word**), italic (*word*), links ([text](https://…)) and lists work. Leave an empty line for a new paragraph.' },
    ],
    pattern: /^\{\{note:(yellow|green|orange|blue)\|(justify|left|center|right)\}\}\n+([\s\S]*?)\n+\{\{\/note\}\}$/,
    fromBlock: function (m) { return { colour: m[1], align: m[2], text: m[3] }; },
    toBlock: function (o) {
      var c = COLOURS[o.colour] ? o.colour : 'yellow';
      var a = ['justify', 'left', 'center', 'right'].indexOf(o.align) >= 0 ? o.align : 'justify';
      return '{{note:' + c + '|' + a + '}}\n\n' + String(o.text || '').trim() + '\n\n{{/note}}';
    },
    toPreview: function (o) {
      var c = COLOURS[o.colour] || COLOURS.yellow;
      return '<div style="border-left:4px solid ' + c + ';padding:.2rem 1rem;color:#4a6580;text-align:' + (o.align || 'justify') + '">' + String(o.text || '').replace(/</g, '&lt;') + '</div>';
    },
  });
})();
