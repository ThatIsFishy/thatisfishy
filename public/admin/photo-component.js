// Adds a "Photo" button to the Main text editor.
// It asks for the photo, the photo description, the position, the size, the source and an optional credit,
// and writes the line that the site understands (see src/lib/remark-photos.mjs):
//   ![{left, medium, ai | | Credit} Photo description](/images/uploads/photo.jpg)
// The description is shown under the photo (and read out for people who cannot see it).
// The space between the two bars held a caption in older photos; it is not used any more.
// A photo always sits between two paragraphs (the text does not wrap around it).
// Older photos (center / left / right / small, without a size) open with the matching new choices.
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;

  var POSITIONS = { left: 'left', right: 'right', middle: 'middle', center: 'middle' };
  var SIZES = ['small', 'medium', 'large', 'full'];
  var SOURCES = ['own', 'ai', 'external'];

  window.CMS.registerEditorComponent({
    id: 'photo',
    label: 'Photo',
    fields: [
      { name: 'image', label: 'Photo', widget: 'image' },
      { name: 'alt', label: 'Photo description', widget: 'string', hint: 'What is in the photo. Shown under the photo (handwritten on the Fishy Stories), and read out for people who cannot see it.' },
      {
        name: 'pos', label: 'Position', widget: 'select', default: 'middle',
        options: [
          { label: 'Middle', value: 'middle' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
      },
      {
        name: 'size', label: 'Size', widget: 'select', default: 'full',
        options: [
          { label: 'Small (about 40% of the text width)', value: 'small' },
          { label: 'Medium (about 60%)', value: 'medium' },
          { label: 'Large (about 80%)', value: 'large' },
          { label: 'Full (the whole text width)', value: 'full' },
        ],
      },
      {
        name: 'source', label: 'Source of the photo', widget: 'select',
        options: [
          { label: 'My photo (green)', value: 'own' },
          { label: 'AI generated (blue)', value: 'ai' },
          { label: 'External source (orange)', value: 'external' },
        ],
      },
      { name: 'credit', label: 'Credit or link (optional)', widget: 'string', required: false, hint: 'Who made it, or a web address starting with https://. Shown under the caption, a bit smaller.' },
    ],
    pattern: /^!\[\{([^}|]*)(?:\|([^}]*))?\}\s*([^\]]*)\]\(([^)\s]+)\)$/,
    fromBlock: function (m) {
      var words = (m[1] || '').split(/[\s,]+/).filter(Boolean);
      var rest = (m[2] || '').split('|');
      var pos = 'middle', size = '', source = '';
      words.forEach(function (w) {
        if (POSITIONS[w]) pos = POSITIONS[w];
        else if (SIZES.indexOf(w) > -1) size = w;
        else if (SOURCES.indexOf(w) > -1) source = w;
      });
      if (!size) size = pos === 'left' || pos === 'right' ? 'medium' : 'full';
      return {
        pos: pos,
        size: size,
        source: source,
        credit: rest.slice(1).join('|').trim(),
        alt: (m[3] || '').trim(),
        image: m[4],
      };
    },
    toBlock: function (o) {
      var clean = function (s) { return String(s || '').replace(/[{}|\n]/g, ' ').trim(); };
      var words = [o.pos || 'middle', o.size || 'full', o.source].filter(Boolean).join(', ');
      var credit = clean(o.credit);
      var tail = credit ? ' | | ' + credit : '';
      return '![{' + words + tail + '} ' + String(o.alt || '').replace(/[\]\n]/g, ' ') + '](' + (o.image || '') + ')';
    },
    toPreview: function (o) {
      var w = { small: '40%', medium: '60%', large: '80%', full: '100%' }[o.size] || '100%';
      var m = o.pos === 'left' ? '0 auto 0 0' : o.pos === 'right' ? '0 0 0 auto' : '0 auto';
      return '<figure style="width:' + w + ';margin:' + m + '"><img src="' + (o.image || '') + '" alt="" style="max-width:100%">' +
        (o.alt ? '<figcaption>' + String(o.alt).replace(/</g, '&lt;') + '</figcaption>' : '') + '</figure>';
    },
  });
})();
