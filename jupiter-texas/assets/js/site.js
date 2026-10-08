/* ============================================================
   JUPITER TEXAS — behaviour for every page
   No libraries: plain JS so the site also works opened
   straight from a folder.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- header: solid after the hero, hides while reading down ---------- */
  var head = $('.head');
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (head) {
      head.classList.toggle('is-solid', y > 40);
      if (!document.body.classList.contains('menu-open')) {
        if (y > lastY + 6 && y > 520) head.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 160) head.classList.remove('is-hidden');
      }
    }
    parallax();
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- menu: glide rule, dropdowns, mobile sheet ---------- */
  var list = $('.menu-main');
  var rule = $('.menu-rule');
  if (list && rule) {
    var items = $$('.menu-main > li > a, .menu-main > li > button');
    var current = $('.menu-main > li.is-current > a, .menu-main > li.is-current > button');
    var place = function (el) {
      if (!el) { rule.style.opacity = '0'; return; }
      var r = el.getBoundingClientRect(), lr = list.getBoundingClientRect();
      rule.style.opacity = '1';
      rule.style.width = (r.width - 32) + 'px';
      rule.style.transform = 'translateX(' + (r.left - lr.left + 16) + 'px)';
    };
    items.forEach(function (el) { el.addEventListener('mouseenter', function () { place(el); }); });
    list.addEventListener('mouseleave', function () { place(current); });
    window.addEventListener('resize', function () { place(current); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(current); });
    place(current);
  }
  $$('.has-drop').forEach(function (li) {
    var btn = $('button', li);
    var set = function (open) { li.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.addEventListener('click', function () { set(!li.classList.contains('is-open')); });
    li.addEventListener('mouseleave', function () { set(false); });
    li.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) set(false); });
  });
  var burger = $('.burger');
  if (burger) {
    var setMenu = function (open) {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      $('#sheet-menu').setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open && head) head.classList.remove('is-hidden');
    };
    burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    $$('#sheet-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------- scroll reveals ---------- */
  var reveal = $$('.rv, .clip');
  if (reduce || !('IntersectionObserver' in window)) reveal.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  }

  /* ---------- parallax: images drift slower than the page ---------- */
  var drifting = reduce ? [] : $$('[data-drift]');
  function parallax() {
    var vh = window.innerHeight;
    drifting.forEach(function (img) {
      var box = img.parentElement.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      var p = (box.top + box.height / 2 - vh / 2) / (vh + box.height); /* -0.5 .. 0.5 */
      var amt = parseFloat(img.getAttribute('data-drift')) || 12;
      var extra = img.hasAttribute('data-zoom') ? ' scale(' + (1.12 - Math.min(0.12, Math.max(0, -p) * 0.24)).toFixed(4) + ')' : '';
      img.style.transform = 'translate3d(0,' + (p * amt).toFixed(2) + '%,0)' + extra;
    });
  }

  /* ---------- home hero slides ---------- */
  var slides = $$('.slide');
  if (slides.length) {
    var dots = $$('.hero-dots button');
    var idx = 0, timer = null;
    var show = function (n) {
      slides[idx].classList.remove('on'); slides[idx].classList.add('off');
      var prev = slides[idx];
      setTimeout(function () { prev.classList.remove('off'); }, 800);
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('on');
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k === idx ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === idx); d.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
    };
    var start = function () { if (!reduce) { clearInterval(timer); timer = setInterval(function () { show(idx + 1); }, 6500); } };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); start(); }); });
    $$('[data-slide]').forEach(function (b) { b.addEventListener('click', function () { show(idx + Number(b.getAttribute('data-slide'))); start(); }); });
    if (!reduce) { slides[0].classList.remove('on'); void slides[0].offsetWidth; requestAnimationFrame(function () { requestAnimationFrame(function () { slides[0].classList.add('on'); }); }); }
    start();
  }

  /* ---------- video: poster first, plays on click ---------- */
  $$('.video').forEach(function (box) {
    var btn = $('.video-play', box), vid = $('video', box);
    if (!btn || !vid) return;
    btn.addEventListener('click', function () { box.classList.add('is-playing'); vid.controls = true; vid.play(); });
  });

  /* ---------- horizontal rows: arrows, drag, progress ---------- */
  $$('[data-hrow]').forEach(function (wrap) {
    var row = $('.hrow', wrap), bar = $('.hrow-progress i', wrap);
    var prev = $('[data-prev]', wrap), next = $('[data-next]', wrap);
    var stepBy = function (d) { var c = $('.prop', row); var w = c ? c.getBoundingClientRect().width + 24 : 400; row.scrollBy({ left: d * w, behavior: reduce ? 'auto' : 'smooth' }); };
    var sync = function () {
      var max = row.scrollWidth - row.clientWidth;
      var p = max > 0 ? row.scrollLeft / max : 0;
      if (bar) bar.style.transform = 'scaleX(' + Math.max(0.06, p).toFixed(4) + ')';
      if (prev) prev.disabled = row.scrollLeft < 4;
      if (next) next.disabled = row.scrollLeft > max - 4;
    };
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    row.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    if (fine) {
      var down = false, sx = 0, sl = 0, moved = 0;
      row.addEventListener('pointerdown', function (e) { down = true; moved = 0; sx = e.clientX; sl = row.scrollLeft; });
      window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.abs(dx); if (moved > 4) row.classList.add('dragging'); row.scrollLeft = sl - dx; });
      window.addEventListener('pointerup', function () { if (!down) return; down = false; row.classList.remove('dragging'); });
    }
  });

  /* ---------- section jump bar (Portfolio) ---------- */
  var jumps = $$('.jump a');
  if (jumps.length && 'IntersectionObserver' in window) {
    var targets = jumps.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var jio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = targets.indexOf(e.target);
        jumps.forEach(function (a, k) { a.classList.toggle('on', k === i); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { if (t) jio.observe(t); });
  }

  /* ---------- FAQ: accordion + search ---------- */
  $$('.faq-item').forEach(function (item) {
    var q = $('.faq-q', item);
    q.addEventListener('click', function () {
      var open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  var search = $('#faq-search');
  if (search) {
    search.addEventListener('input', function () {
      var term = search.value.trim().toLowerCase(), shown = 0;
      $$('.faq-item').forEach(function (item) {
        var hit = !term || item.textContent.toLowerCase().indexOf(term) > -1;
        item.style.display = hit ? '' : 'none';
        if (hit) shown += 1;
        if (term && hit) { item.classList.add('open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
      });
      $('.faq-empty').style.display = shown ? 'none' : 'block';
    });
  }

  /* ---------- forms: hand the details to the visitor's email app ---------- */
  $$('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = $$('input', form).map(function (i) { return i.getAttribute('data-label') + ': ' + i.value; });
      var subject = form.getAttribute('data-subject');
      window.location.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    });
  });

  /* ---------- newsletter pop-up (Who We Are), once per visit ---------- */
  var pop = $('#newsletter');
  if (pop) {
    var seen = false;
    try { seen = sessionStorage.getItem('jt-newsletter') === '1'; } catch (err) { seen = false; }
    var close = function () { pop.classList.remove('on'); pop.setAttribute('aria-hidden', 'true'); try { sessionStorage.setItem('jt-newsletter', '1'); } catch (err) { /* private mode */ } };
    if (!seen) setTimeout(function () { pop.classList.add('on'); pop.setAttribute('aria-hidden', 'false'); }, 3500);
    $$('[data-close]', pop).forEach(function (b) { b.addEventListener('click', close); });
    pop.addEventListener('click', function (e) { if (e.target === pop) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  onScroll();
})();
