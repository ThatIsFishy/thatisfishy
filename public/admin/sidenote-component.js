// Adds "Side note" to the editor's Insert menu (Main text).
// A side note is a short text with a coloured line on the left and a soft background in the same colour
// (on the Fishy Stories it is a sticky note). It writes:
//   {{note:yellow|justify|full}}
//   your text (bold, italic and links work)
//   {{br}}
//   a new paragraph ({{br}} stands for an empty line you typed)
//   {{/note}}
// as ONE block without empty lines: the editor can only open a block again when it has no empty lines inside.
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
      {
        name: 'pos', label: 'Position', widget: 'select', default: 'full',
        options: [
          { label: 'Full width', value: 'full' },
          { label: 'Left (half the width)', value: 'left' },
          { label: 'Middle (half the width)', value: 'middle' },
          { label: 'Right (half the width)', value: 'right' },
        ],
      },
      { name: 'text', label: 'Text', widget: 'text', hint: 'Bold (**word**), italic (*word*) and links ([text](https://…)) work. Leave an empty line for a new paragraph.' },
    ],
    // [\s\S] tells the CMS that a note spans several lines; the (?!{{/note}}) part stops each note at its OWN end,
    // so two notes in a row never merge into one.
    pattern: /^\{\{note:(yellow|green|orange|blue)\|(justify|left|center|right)(?:\|(left|right|middle|full))?\}\}\n((?:(?!\{\{\/note\}\})[\s\S])*?)\n\{\{\/note\}\}(?=\n|$)/,
    fromBlock: function (m) {
      var text = String(m[4] || '').replace(/\n$/, '').split('\n').map(function (l) { return l.trim() === '{{br}}' ? '' : l.replace(/^\\([-*+#>]|\d+\.)/, '$1'); }).join('\n');
      return { colour: m[1], align: m[2], pos: m[3] || 'full', text: text };
    },
    toBlock: function (o) {
      var c = COLOURS[o.colour] ? o.colour : 'yellow';
      var a = ['justify', 'left', 'center', 'right'].indexOf(o.align) >= 0 ? o.align : 'justify';
      var p = ['left', 'right', 'middle', 'full'].indexOf(o.pos) >= 0 ? o.pos : 'full';
      // no empty lines inside (an empty line becomes {{br}}); a line starting like a list or heading is escaped
      var lines = String(o.text || '').replace(/\r/g, '').trim().split(/\n\s*\n+/).map(function (par) {
        return par.split('\n').map(function (l) { return l.trim().replace(/^([-*+#>]|\d+\.)(?=\s)/, '\\$1'); }).filter(Boolean).join('\n');
      }).filter(Boolean);
      return '{{note:' + c + '|' + a + '|' + p + '}}\n' + (lines.join('\n{{br}}\n') || ' ') + '\n{{/note}}';
    },
    toPreview: function (o) {
      var c = COLOURS[o.colour] || COLOURS.yellow;
      var w = o.pos && o.pos !== 'full' ? 'width:50%;' + (o.pos === 'right' ? 'margin-left:auto;' : o.pos === 'middle' ? 'margin:0 auto;' : '') : '';
      return '<div style="' + w + 'border-left:4px solid ' + c + ';background:' + c + '22;padding:.5rem 1rem;color:#0b2a4a;text-align:' + (o.align || 'justify') + '">' + String(o.text || '').replace(/</g, '&lt;') + '</div>';
    },
  });
})();
