/* ============================================================
   JUPITER TEXAS · OPTION C: behaviour for every page.
   Plain JS, no libraries, so the site works opened from a folder.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- header: hairline once the page moves ---------- */
  var hd = $('.hd');
  var tabSync = null;
  function onScroll() {
    hd.classList.toggle('scrolled', window.scrollY > 8);
    if (tabSync) tabSync();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- dropdowns: hover on desktop, click/keyboard everywhere ---------- */
  var subs = $$('.has-sub');
  function closeAll(except) {
    subs.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('open');
      $('button', li).setAttribute('aria-expanded', 'false');
    });
  }
  subs.forEach(function (li) {
    var b = $('button', li);
    b.addEventListener('click', function () {
      var open = !li.classList.contains('open');
      closeAll(li);
      li.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    li.addEventListener('mouseleave', function () { li.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-sub')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  /* ---------- mobile drawer ---------- */
  var burger = $('.burger');
  var drawer = $('#drawer');
  function setDrawer(open) {
    document.body.classList.toggle('drawer-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) setTimeout(function () { $('.dr-x').focus(); }, 50);
  }
  burger.addEventListener('click', function () { setDrawer(true); });
  $('.dr-x').addEventListener('click', function () { setDrawer(false); burger.focus(); });
  drawer.addEventListener('click', function (e) { if (e.target === drawer) setDrawer(false); });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) { setDrawer(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) setDrawer(false); });

  /* ---------- reveals ---------- */
  $$('.rv').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
    el.style.setProperty('--d', Math.min(sibs.indexOf(el) % 6 * 0.06, 0.3) + 's');
  });
  var rv = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ---------- home hero: two messages, gentle crossfade ---------- */
  var slides = $$('.slide');
  if (slides.length) {
    var dots = $$('.dots button');
    var cur = 0;
    var timer = null;
    var show = function (n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    };
    var play = function () { if (reduce) return; clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 6500); };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); play(); }); });
    play();
  }

  /* ---------- video: poster first, plays on click ---------- */
  $$('.video').forEach(function (box) {
    var b = $('button.play', box);
    var v = $('video', box);
    if (!b || !v) return;
    b.addEventListener('click', function () { box.classList.add('playing'); v.controls = true; v.play(); });
  });

  /* ---------- portfolio: tabs follow the scroll ---------- */
  var tabs = $$('.tabs a');
  if (tabs.length) {
    var secs = tabs.map(function (t) { return document.getElementById(t.getAttribute('href').slice(1)); });
    var last = -1;
    tabSync = function () {
      var line = window.innerHeight * 0.35;
      var i = 0;
      secs.forEach(function (s, k) { if (s.getBoundingClientRect().top <= line) i = k; });
      if (i === last) return;
      last = i;
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
    };
  }

  /* ---------- FAQ: accordion + search ---------- */
  $$('.qa').forEach(function (qa) {
    var b = $('button', qa);
    b.addEventListener('click', function () {
      var open = !qa.classList.contains('open');
      qa.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  var search = $('#faq-search');
  if (search) {
    search.addEventListener('input', function () {
      var term = search.value.trim().toLowerCase();
      var shown = 0;
      $$('.qa').forEach(function (qa) {
        var hit = !term || qa.textContent.toLowerCase().indexOf(term) > -1;
        qa.style.display = hit ? '' : 'none';
        if (hit) shown += 1;
        if (term && hit) { qa.classList.add('open'); $('button', qa).setAttribute('aria-expanded', 'true'); }
      });
      $('.faq-none').style.display = shown ? 'none' : 'block';
    });
  }

  /* ---------- forms: hand the details to the visitor's email app ---------- */
  $$('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var body = $$('input', form).map(function (i) { return i.getAttribute('data-label') + ': ' + i.value; }).join('\n');
      location.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(form.getAttribute('data-subject')) + '&body=' + encodeURIComponent(body);
    });
  });

  /* ---------- newsletter card (Who We Are), once per visit ---------- */
  var note = $('#newsletter');
  if (note) {
    var seen = false;
    try { seen = sessionStorage.getItem('jt-newsletter') === '1'; } catch (err) { seen = false; }
    var close = function () { note.classList.remove('on'); note.setAttribute('aria-hidden', 'true'); try { sessionStorage.setItem('jt-newsletter', '1'); } catch (err) { /* private mode */ } };
    if (!seen) setTimeout(function () { note.classList.add('on'); note.setAttribute('aria-hidden', 'false'); }, 3500);
    $$('[data-close]', note).forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && note.classList.contains('on')) close(); });
  }

  onScroll();
})();
