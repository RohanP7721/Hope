/* Edit Mode — open any page with ?edit in the URL (e.g. index.html?edit).
   Click any outlined text to change it. Drafts are kept in this browser;
   "Download content.js" produces the file that makes the edits live for everyone. */
(function () {
  'use strict';
  var KEY = 'dolkarTextDraft_v2';
  var draft = {};
  try { draft = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch (e) {} update(); }

  document.documentElement.classList.add('is-editing');
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-edit]'));
  els.forEach(function (el) {
    var key = el.getAttribute('data-edit');
    if (Object.prototype.hasOwnProperty.call(draft, key)) el.innerHTML = draft[key];
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'true');
    el.addEventListener('input', function () {
      draft[key] = el.innerHTML.trim();
      els.forEach(function (o) { if (o !== el && o.getAttribute('data-edit') === key) o.innerHTML = draft[key]; });
      save();
    });
    el.addEventListener('paste', function (e) {
      e.preventDefault();
      document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
    });
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('.edit-panel')) return;
    if (e.target.closest('[contenteditable="true"]')) e.preventDefault();
  }, true);

  var panel = document.createElement('div');
  panel.className = 'edit-panel';
  panel.innerHTML =
    '<strong>Edit Mode</strong>' +
    '<p>Click any outlined text to change it. Changes are saved as drafts in this browser.</p>' +
    '<p class="edit-count"></p>' +
    '<button type="button" class="edit-primary" data-act="download">Download content.js</button>' +
    '<button type="button" data-act="discard">Discard my drafts</button>' +
    '<button type="button" data-act="exit">Exit Edit Mode</button>' +
    '<p class="edit-help">To publish: replace <code>assets/js/content.js</code> on your host with the downloaded file. Photos, prices and rooms live in <code>assets/js/data.js</code>.</p>';
  document.body.appendChild(panel);

  function update() {
    var n = Object.keys(draft).length;
    panel.querySelector('.edit-count').textContent = n ? n + ' unpublished change' + (n > 1 ? 's' : '') : 'No unpublished changes yet.';
  }
  update();

  panel.addEventListener('click', function (e) {
    var act = e.target.getAttribute('data-act');
    if (act === 'download') {
      var merged = Object.assign({}, window.DOLKAR_TEXT || {}, draft);
      var body = '/* Text edits made in Edit Mode (open any page with ?edit at the end of the URL).\n' +
        '   Edit Mode downloads a new version of this file — replace this one with it. */\n' +
        'window.DOLKAR_TEXT = ' + JSON.stringify(merged, null, 2) + ';\n';
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([body], { type: 'text/javascript' }));
      a.download = 'content.js';
      document.body.appendChild(a); a.click(); a.remove();
    }
    if (act === 'discard' && window.confirm('Discard all unpublished text drafts in this browser?')) {
      try { localStorage.removeItem(KEY); } catch (err) {}
      location.reload();
    }
    if (act === 'exit') {
      location.href = location.pathname + location.search.replace(/[?&]edit\b(=[^&]*)?/, '').replace(/^&/, '?') + location.hash;
    }
  });
})();
