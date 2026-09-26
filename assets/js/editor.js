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

  function pages() {
    var here = location.pathname.split('/').pop() + location.search;
    var list = [['index.html?edit', 'Home page']];
    ((window.DOLKAR && window.DOLKAR.rooms) || []).forEach(function (r) {
      list.push(['room.html?r=' + r.slug + '&edit', 'Room: ' + (window.Site ? Site.roomTitle(r) : r.name)]);
    });
    return list.map(function (o) {
      var sel = here === o[0] || (o[0] === 'index.html?edit' && /^(index\.html)?\?edit/.test(here)) ? ' selected' : '';
      return '<option value="' + o[0] + '"' + sel + '>' + o[1] + '</option>';
    }).join('');
  }
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
    '<button type="button" class="edit-title" data-act="toggle" aria-expanded="true">Edit Mode <span>— tap to hide</span></button>' +
    '<p>Click any outlined text to change it. Changes are saved as drafts in this browser.</p>' +
    '<label class="edit-page">Page to edit<select data-act="page">' + pages() + '</select></label>' +
    '<p class="edit-count"></p>' +
    '<button type="button" class="edit-primary" data-act="download">Download content.js</button>' +
    '<button type="button" data-act="discard">Discard my drafts</button>' +
    '<button type="button" data-act="exit">Exit Edit Mode</button>' +
    '<p class="edit-help">To publish: put the downloaded <code>content.js</code> into <code>assets/js/</code> (replace the old one), then upload the folder again. Prices live in <code>assets/js/data.js</code>; photos live in the image folders.</p>';
  document.body.appendChild(panel);
  panel.querySelector('select').addEventListener('change', function (e) { location.href = e.target.value; });

  function update() {
    var n = Object.keys(draft).length;
    panel.querySelector('.edit-count').textContent = n ? n + ' unpublished change' + (n > 1 ? 's' : '') : 'No unpublished changes yet.';
  }
  update();

  panel.addEventListener('click', function (e) {
    var act = e.target.closest('[data-act]') && e.target.closest('[data-act]').getAttribute('data-act');
    if (act === 'toggle') {
      var min = panel.classList.toggle('is-min');
      var t = panel.querySelector('.edit-title');
      t.setAttribute('aria-expanded', !min);
      t.querySelector('span').textContent = min ? '— tap to show' : '— tap to hide';
    }
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
      var hash = location.hash === '#edit' ? '' : location.hash;
      location.href = location.pathname + location.search.replace(/[?&]edit\b(=[^&]*)?/, '').replace(/^&/, '?') + hash;
    }
  });
})();
