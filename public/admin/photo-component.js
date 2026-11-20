// Adds a "Photo" button to the article editor.
// It asks for the photo, a description, the layout, the source and an optional caption,
// and writes the line that the site understands (see src/lib/remark-photos.mjs):
//   ![{left, ai | My caption} Description](/images/uploads/photo.jpg)
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;

  window.CMS.registerEditorComponent({
    id: 'photo',
    label: 'Photo',
    fields: [
      { name: 'image', label: 'Photo', widget: 'image' },
      { name: 'alt', label: 'What is in the photo (description)', widget: 'string' },
      {
        name: 'layout', label: 'Position', widget: 'select', default: 'center',
        options: [
          { label: 'Middle', value: 'center' },
          { label: 'Left, text wraps around', value: 'left' },
          { label: 'Right, text wraps around', value: 'right' },
          { label: 'Small, in the middle', value: 'small' },
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
      { name: 'caption', label: 'Caption (optional)', widget: 'string', required: false },
    ],
    pattern: /^!\[\{([^}|]*)(?:\|([^}]*))?\}\s*([^\]]*)\]\(([^)\s]+)\)$/,
    fromBlock: function (m) {
      var words = (m[1] || '').split(/[\s,]+/).filter(Boolean);
      var layouts = ['left', 'right', 'center', 'small'];
      var sources = ['own', 'ai', 'external'];
      return {
        layout: words.filter(function (w) { return layouts.indexOf(w) > -1; })[0] || 'center',
        source: words.filter(function (w) { return sources.indexOf(w) > -1; })[0] || '',
        caption: (m[2] || '').trim(),
        alt: (m[3] || '').trim(),
        image: m[4],
      };
    },
    toBlock: function (o) {
      var words = [o.layout || 'center', o.source].filter(Boolean).join(', ');
      var caption = o.caption ? ' | ' + o.caption : '';
      return '![{' + words + caption + '} ' + (o.alt || '') + '](' + (o.image || '') + ')';
    },
    toPreview: function (o) {
      return '<img src="' + (o.image || '') + '" alt="' + (o.alt || '') + '" style="max-width:100%">';
    },
  });
})();
