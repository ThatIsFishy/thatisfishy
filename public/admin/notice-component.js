// Adds "Coming soon" and "Nothing here yet" to the editor's Insert menu.
// Use one at the end of a long text to show that it continues later. It writes
// {{notice:coming}} or {{notice:empty}} (with the message after a bar, if you add one), which the site turns into the card.
(function () {
  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') return;
  function make(id, label, kind) {
    window.CMS.registerEditorComponent({
      id: id,
      label: label,
      fields: [{ name: 'message', label: 'Message (optional)', widget: 'string', required: false }],
      pattern: new RegExp('^\\{\\{notice:' + kind + '(?:\\|([^}]*))?\\}\\}$'),
      fromBlock: function (m) { return { message: (m[1] || '').trim() }; },
      toBlock: function (o) { return '{{notice:' + kind + (o.message ? '|' + o.message.replace(/[}\n]/g, ' ') : '') + '}}'; },
      toPreview: function (o) { return '<p style="text-align:center"><b>' + label + '</b><br>' + (o.message || '') + '</p>'; },
    });
  }
  make('notice-coming', 'Coming soon', 'coming');
  make('notice-empty', 'Nothing here yet', 'empty');
})();
