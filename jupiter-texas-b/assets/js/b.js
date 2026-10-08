/* ============================================================
   JUPITER TEXAS · OPTION B: behaviour for every page.
   Plain JS, no libraries, so the site works opened from a folder.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (err) { return null; } return null; }

  /* ---------- page transitions ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('entering'); }); });
  window.addEventListener('pageshow', function () { root.classList.remove('leaving', 'entering'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var href = a.getAttribute('href');
    if (a.target || /^(https?:|mailto:|tel:|#)/.test(href)) return;
    var here = location.pathname.split('/').pop() || 'index.html';
    if (href.split('#')[0] === here) return;
    e.preventDefault();
    root.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 320);
  });

  /* ---------- top bar ---------- */
  var bar = $('.bar');
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var open = document.body.classList.contains('menu-open');
    bar.classList.toggle('solid', y > 12);
    if (!open) {
      if (y > lastY + 6 && y > 420) bar.classList.add('hide');
      else if (y < lastY - 6 || y < 160) bar.classList.remove('hide');
    }
    document.body.classList.toggle('bar-hidden', bar.classList.contains('hide'));
    scrubs();
    if (tabSync) tabSync();
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- full-screen menu ---------- */
  var menuBtn = $('.menu-btn');
  var menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) { bar.classList.remove('hide'); setTimeout(function () { var f = $('.m-group a', menu); if (f) f.focus({ preventScroll: true }); }, 300); }
  }
  menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
  var peekBox = $('.menu-peek');
  var peekImg = peekBox && $('img', peekBox);
  var swapTimer;
  $$('.m-group a').forEach(function (a) {
    function show() {
      var src = a.getAttribute('data-img');
      if (!peekImg || peekImg.getAttribute('src') === src) return;
      peekBox.classList.add('swap');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(function () { peekImg.src = src; peekBox.classList.remove('swap'); }, 220);
    }
    a.addEventListener('mouseenter', show);
    a.addEventListener('focus', show);
  });

  /* ---------- reveals ---------- */
  $$('.rv').forEach(function (el) {
    if (el.style.getPropertyValue('--d')) return;
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
    el.style.setProperty('--d', Math.min(sibs.indexOf(el) * 0.07, 0.35) + 's');
  });
  var watch = $$('.rv, .lines, .orbits, .net');
  if (reduce || !('IntersectionObserver' in window)) watch.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    watch.forEach(function (el) { io.observe(el); });
  }

  /* ---------- scroll-linked images ---------- */
  var heroWin = $('.hero-window');
  var strips = $$('[data-scrub]');
  var drifts = reduce ? [] : $$('[data-drift]');
  function scrubs() {
    var vh = window.innerHeight;
    if (heroWin && !reduce) {
      var start = heroWin.offsetTop - bar.offsetHeight;
      heroWin.style.setProperty('--p', clamp(window.scrollY / Math.max(start, 1), 0, 1).toFixed(4));
    }
    if (!reduce) strips.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var t = clamp((vh - r.top) / (vh + r.height) / 0.7, 0, 1);
      img.style.setProperty('--s', (1.14 - 0.14 * t).toFixed(4));
    });
    drifts.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      img.style.transform = 'translate3d(0,' + (p * -14).toFixed(2) + '%,0)';
    });
  }

  /* ---------- home hero slides ---------- */
  var slides = $$('.hs');
  if (slides.length) {
    var ticks = $$('.ticks button');
    var cur = 0;
    var timer = null;
    var show = function (n) {
      n = (n + slides.length) % slides.length;
      if (n === cur) return;
      var prev = slides[cur];
      prev.classList.remove('on'); prev.classList.add('out'); prev.setAttribute('aria-hidden', 'true');
      setTimeout(function () { prev.classList.remove('out'); }, 900);
      cur = n;
      slides[cur].classList.add('on'); slides[cur].setAttribute('aria-hidden', 'false');
      ticks.forEach(function (t, k) { t.classList.remove('on'); t.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
      void ticks[cur].offsetWidth;
      ticks[cur].classList.add('on');
    };
    var play = function () { if (reduce) return; clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 6500); };
    ticks.forEach(function (t, k) { t.addEventListener('click', function () { show(k); play(); }); });
    if (!reduce) {
      slides[0].classList.remove('on');
      void slides[0].offsetWidth;
      requestAnimationFrame(function () { requestAnimationFrame(function () { slides[0].classList.add('on'); }); });
    }
    play();
  }

  /* ---------- video: poster first, plays on click ---------- */
  $$('.film').forEach(function (box) {
    var b = $('.film-play', box);
    var v = $('video', box);
    if (!b || !v) return;
    b.addEventListener('click', function () { box.classList.add('playing'); v.controls = true; v.play(); });
  });

  /* ---------- cursor-following photo preview ---------- */
  var peek = $('.peek');
  if (peek && fine && !reduce) {
    var pimg = $('img', peek);
    var tx = 0, ty = 0, x = 0, y = 0, raf = null;
    var loop = function () {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      peek.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(loop) : null;
    };
    var aim = function (e) {
      var w = peek.offsetWidth, h = peek.offsetHeight;
      tx = clamp(e.clientX + 28, 12, window.innerWidth - w - 12);
      ty = clamp(e.clientY - h / 2, 12, window.innerHeight - h - 12);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    $$('[data-peek]').forEach(function (el) {
      var active = function () { return !el.classList.contains('lot') || el.closest('.ledger'); };
      el.addEventListener('mouseenter', function (e) {
        if (!active()) return;
        pimg.src = el.getAttribute('data-peek');
        if (!peek.classList.contains('on')) { x = tx = clamp(e.clientX + 28, 12, window.innerWidth - 352); y = ty = e.clientY - 128; }
        aim(e);
        peek.classList.add('on');
      });
      el.addEventListener('mousemove', function (e) { if (active()) aim(e); });
      el.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
    });
    window.addEventListener('scroll', function () { peek.classList.remove('on'); }, { passive: true });
  }

  /* ---------- sliding indicators ---------- */
  function slide(knob, el, inset) {
    if (!knob || !el) return;
    knob.style.width = el.offsetWidth + 'px';
    knob.style.transform = 'translateX(' + (el.offsetLeft - (inset || 0)) + 'px)';
  }

  /* ---------- gallery / list switch ---------- */
  var views = $$('.views');
  var lots = $$('[data-lots]');
  function setView(mode, animate) {
    lots.forEach(function (l) {
      l.classList.toggle('ledger', mode === 'ledger');
      if (animate && !reduce) { l.classList.remove('swap'); void l.offsetWidth; l.classList.add('swap'); setTimeout(function () { l.classList.remove('swap'); }, 700); }
    });
    views.forEach(function (v) {
      $$('button', v).forEach(function (b) {
        var on = b.getAttribute('data-view') === mode;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) slide($('.views-knob', v), b);
      });
    });
    if (peek) peek.classList.remove('on');
  }
  if (views.length) {
    views.forEach(function (v) { $$('button', v).forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view'), true); store('jt-view', b.getAttribute('data-view')); }); }); });
    var saved = store('jt-view');
    setView(saved === 'ledger' ? 'ledger' : 'gallery', false);
  }

  /* ---------- portfolio section tabs ---------- */
  var tabSync = null;
  var tabs = $$('.tabs a');
  var tabBar = $('.tabs-bar');
  if (tabs.length) {
    var mark = function (i) { tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); }); slide(tabBar, tabs[i]); };
    var secs = tabs.map(function (t) { return document.getElementById(t.getAttribute('href').slice(1)); });
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        secs[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        history.replaceState(null, '', '#' + secs[i].id);
      });
    });
    var lastTab = -1;
    tabSync = function () {
      var line = window.innerHeight * 0.4;
      var i = 0;
      secs.forEach(function (sec, k) { if (sec.getBoundingClientRect().top <= line) i = k; });
      if (i !== lastTab) { lastTab = i; mark(i); }
    };
    tabSync();
  }

  function relayout() {
    views.forEach(function (v) { slide($('.views-knob', v), $('button.on', v)); });
    var on = $('.tabs a.on');
    if (on) slide(tabBar, on);
    drawNet();
  }
  window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  /* ---------- who we are: sticky story ---------- */
  var chaps = $$('.chap');
  var frames = $$('.story-frame img');
  if (chaps.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = Number(en.target.getAttribute('data-i'));
        chaps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
        frames.forEach(function (f, k) { f.classList.toggle('on', k === i); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    chaps.forEach(function (c) { sio.observe(c); });
    chaps[0].classList.add('on');
  }

  /* ---------- strategy: network lines ---------- */
  var net = $('.net');
  function drawNet() {
    if (!net) return;
    var svg = $('.net-lines', net);
    var hub = $('.net-hub', net);
    if (getComputedStyle(svg).display === 'none') return;
    var nr = net.getBoundingClientRect();
    var hr = hub.getBoundingClientRect();
    var hx = hr.left - nr.left + hr.width / 2;
    var hy = hr.top - nr.top + hr.height / 2;
    var rad = hr.width / 2 + 40;
    var paths = $$('.nd', net).map(function (n) {
      var r = n.getBoundingClientRect();
      var left = n.classList.contains('nd-l');
      var sx = (left ? r.right : r.left) - nr.left;
      var sy = r.top - nr.top + r.height / 2;
      var ang = Math.atan2(sy - hy, sx - hx);
      var ex = hx + Math.cos(ang) * rad;
      var ey = hy + Math.sin(ang) * rad;
      var mx = (sx + ex) / 2;
      return '<path d="M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + sy.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + ey.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '"/>';
    });
    svg.setAttribute('viewBox', '0 0 ' + nr.width.toFixed(0) + ' ' + nr.height.toFixed(0));
    svg.innerHTML = paths.join('');
    $$('path', svg).forEach(function (p) { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 'px'); });
  }
  drawNet();

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
