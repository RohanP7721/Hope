/* ============================================================
   JUPITER TEXAS — behaviour
   Motion is kept to three places: the hero drawing that draws
   itself once, the navigation, and the portfolio gallery that
   moves sideways as you scroll. Everything else is still.
   ============================================================ */

(function () {
  'use strict';

  var D = window.JT;
  var Art = window.JTArt;
  var page = document.documentElement.getAttribute('data-page');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var activeFilter = 'all';


  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function byId(id) { return D.properties.filter(function (p) { return p.id === id; })[0]; }

  /* ---------------- links from content.js ---------------- */
  function wireLinks() {
    $$('[data-link]').forEach(function (a) {
      var url = D.links[a.getAttribute('data-link')];
      if (url) a.setAttribute('href', url);
    });
  }

  /* ---------------- navigation ---------------- */
  function initNav() {
    var nav = $('.nav');
    if (!nav) return;
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 8);
      if (!document.body.classList.contains('menu-open')) {
        if (y > lastY + 6 && y > 480) nav.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 120) nav.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* the blue rule: rests under the current page, follows the pointer */
    var list = $('.nav-links', nav);
    var rule = $('.nav-rule', nav);
    if (list && rule) {
      var targets = $$('.nav-links > li > a, .nav-drop-btn', nav);
      var current = $('.nav-links a[aria-current="page"]', nav);
      var place = function (el) {
        if (!el) { rule.style.opacity = '0'; return; }
        var r = el.getBoundingClientRect();
        var lr = list.getBoundingClientRect();
        rule.style.opacity = '1';
        rule.style.width = (r.width - 28) + 'px';
        rule.style.transform = 'translateX(' + (r.left - lr.left + 14) + 'px)';
      };
      targets.forEach(function (el) { el.addEventListener('mouseenter', function () { place(el); }); });
      list.addEventListener('mouseleave', function () { place(current); });
      window.addEventListener('resize', function () { place(current); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(current); });
      place(current);
    }

    /* dropdown: hover on desktop, click and keyboard everywhere */
    $$('.has-drop', nav).forEach(function (li) {
      var btn = $('.nav-drop-btn', li);
      var set = function (open) { li.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
      btn.addEventListener('click', function () { set(!li.classList.contains('is-open')); });
      li.addEventListener('mouseleave', function () { set(false); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
      document.addEventListener('click', function (e) { if (!li.contains(e.target)) set(false); });
    });

    /* mobile menu */
    var burger = $('.burger');
    var menu = $('#menu');
    if (burger && menu) {
      var setMenu = function (open) {
        document.body.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open) nav.classList.remove('is-hidden');
      };
      burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
      });
      window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });
    }
  }

  function whenVisible(el, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { fn(); io.disconnect(); }
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(el);
  }

  /* ---------------- drawings ---------------- */
  function fillPlates() {
    $$('[data-plate]').forEach(function (el) {
      el.innerHTML = Art.render(el.getAttribute('data-plate'), { draw: el.hasAttribute('data-draw') });
    });
  }

  /* Draw the hero plate line by line, back to front. */
  function drawHero() {
    var svg = $('.hero-plate .plate');
    if (!svg) return;
    if (reduceMotion) { svg.classList.remove('is-drawing'); return; }
    var lines = $$('.ln:not(.site)', svg);
    var n = lines.length;
    lines.forEach(function (el, i) { el.style.setProperty('--d', (i / n * 1.6).toFixed(3) + 's'); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { svg.classList.add('go'); }); });
  }

  /* ---------------- property card ---------------- */
  function plateFor(p) {
    return p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' : Art.render(p.type);
  }

  function statsFor(p) {
    var rows = [];
    if (p.price) rows.push(['Purchase Price', p.price, '']);
    if (p.cashOnCash) rows.push(['Projected Annual Cash On Cash*', p.cashOnCash, '']);
    if (p.forecast) rows.push(['Forecasted Annual Return*', p.forecast, 'hi']);
    if (!rows.length) return '<p class="stats-none">Figures for this property are shared on request.</p>';
    return '<dl class="stats">' + rows.map(function (r) {
      return '<div><dt>' + r[0] + '</dt><dd class="' + r[2] + '">' + esc(r[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }

  function cardHTML(p) {
    return '<button class="card" type="button" data-id="' + p.id + '" data-type="' + p.type + '" aria-label="' + esc(p.name + ', ' + p.place) + '. View details">' +
      '<span class="card-plate">' + plateFor(p) + '<span class="card-type">' + esc(D.typeLabels[p.type]) + '</span></span>' +
      '<span class="card-body">' +
        '<span><h3>' + esc(p.name) + '</h3><span class="place">' + esc(p.place) + '</span></span>' +
        statsFor(p) +
      '</span>' +
    '</button>';
  }

  /* ---------------- horizontal track with arrow buttons ---------------- */
  function bindTrack(track, prev, next) {
    var step = function (dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 24 : 360;
      track.scrollBy({ left: w * dir, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------------- pinned horizontal scroll (desktop) ---------------- */
  function pinHorizontal(pinEl, track, onProgress) {
    if (!hasGsap || reduceMotion) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.matchMedia().add('(min-width: 901px)', function () {
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          pin: true,
          start: 'top top',
          end: function () { return '+=' + distance(); },
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (self) { onProgress(self.progress); }
        }
      });
      return function () { tween.kill(); track.style.transform = ''; };
    });
  }

  /* ---------------- detail sheet ---------------- */
  var sheet = null, current = null, lastFocus = null;

  function visibleList() {
    return D.properties.filter(function (p) { return activeFilter === 'all' || p.type === activeFilter; });
  }

  function fillSheet(p) {
    var list = visibleList();
    var i = list.indexOf(p);
    current = p;
    $('.sheet-plate', sheet).innerHTML = plateFor(p);
    $('.sheet-type', sheet).textContent = D.typeLabels[p.type] + ', ' + (i + 1) + ' of ' + list.length;
    $('.sheet-name', sheet).textContent = p.name;
    $('.sheet-place', sheet).textContent = p.place;
    $('.sheet-stats', sheet).innerHTML = statsFor(p);
    history.replaceState(null, '', '#' + p.id);
  }

  function openSheet(id) {
    var p = byId(id);
    if (!sheet || !p || typeof sheet.showModal !== 'function') return;
    if (visibleList().indexOf(p) === -1) activeFilter = 'all';
    lastFocus = document.activeElement;
    fillSheet(p);
    if (!sheet.open) sheet.showModal();
  }

  function stepSheet(dir) {
    var list = visibleList();
    var i = list.indexOf(current);
    fillSheet(list[(i + dir + list.length) % list.length]);
  }

  function initSheet() {
    sheet = $('#sheet');
    if (!sheet) return;
    $('.sheet-close', sheet).addEventListener('click', function () { sheet.close(); });
    sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') stepSheet(1);
      if (e.key === 'ArrowLeft') stepSheet(-1);
    });
    sheet.addEventListener('close', function () {
      history.replaceState(null, '', location.pathname + location.search);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    });
    $$('[data-step]', sheet).forEach(function (b) {
      b.addEventListener('click', function () { stepSheet(Number(b.getAttribute('data-step'))); });
    });
    var fromHash = function () {
      var id = location.hash.slice(1);
      if (id && byId(id)) openSheet(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ============================================================
     HOME
     ============================================================ */
  function initHome() {
    drawHero();

    /* return meters fill when seen */
    var meters = $$('.returns .meter i');
    if (!reduceMotion) meters.forEach(function (m) { m.style.setProperty('--p', 0); });
    whenVisible($('.returns-figs'), function () {
      meters.forEach(function (m, i) { setTimeout(function () { m.style.setProperty('--p', 1); }, i * 200); });
    });

    /* 1 of 200 */
    var dots = $('.dots');
    if (dots) {
      var html = '';
      for (var i = 0; i < 200; i++) html += '<i' + (i === 137 ? ' class="pick"' : '') + '></i>';
      dots.innerHTML = html;
    }

    /* portfolio track */
    var track = $('#teaser');
    if (track) {
      track.innerHTML = D.properties.map(cardHTML).join('');
      $$('.card', track).forEach(function (c) {
        c.addEventListener('click', function () { location.href = 'portfolio.html#' + c.getAttribute('data-id'); });
      });
      bindTrack(track, $('[data-prev]'), $('[data-next]'));
    }
  }

  /* ============================================================
     PORTFOLIO
     ============================================================ */
  function initPortfolio() {
    var list = D.properties;
    var track = $('#gallery-track');
    var end = $('.gallery-end');
    var rows = $('#rows');
    var hudNow = $('#hud-now');
    var hudTotal = $('#hud-total');
    var hudBar = $('.hud .meter i');

    $$('[data-count="properties"]').forEach(function (el) { el.textContent = pad(list.length); });

    /* gallery cards (snap would keep the end card selected when
       cards are inserted before it, so reset the track) */
    end.insertAdjacentHTML('beforebegin', list.map(cardHTML).join(''));
    track.scrollLeft = 0;
    requestAnimationFrame(function () { track.scrollLeft = 0; });

    /* list rows */
    rows.innerHTML = list.map(function (p, i) {
      return '<button class="row" type="button" data-id="' + p.id + '" data-type="' + p.type + '">' +
        '<span class="row-n">' + pad(i + 1) + '</span>' +
        '<span class="row-name">' + esc(p.name) + '</span>' +
        '<span class="row-place muted">' + esc(p.place) + '</span>' +
        '<span class="row-type muted">' + esc(D.typeLabels[p.type]) + '</span>' +
        '<span class="fig-cell">' + esc(p.price || '—') + '</span>' +
        '<span class="fig-cell hi">' + esc(p.forecast || '—') + '</span>' +
      '</button>';
    }).join('');

    $$('.card, .row', document).forEach(function (el) {
      if (!el.getAttribute('data-id')) return;
      el.addEventListener('click', function () { openSheet(el.getAttribute('data-id')); });
    });

    /* progress readout */
    var setHud = function (progress) {
      var n = $$('.card:not(.is-out)', track).length;
      hudBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
      hudNow.textContent = pad(Math.min(n, Math.round(progress * (n - 1)) + 1));
    };
    track.addEventListener('scroll', function () {
      var max = track.scrollWidth - track.clientWidth;
      if (max > 0) setHud(track.scrollLeft / max);
    }, { passive: true });

    /* segmented filter */
    var seg = $('.seg');
    var thumb = $('.seg-thumb');
    var types = [];
    list.forEach(function (p) { if (types.indexOf(p.type) === -1) types.push(p.type); });
    seg.insertAdjacentHTML('beforeend',
      '<button type="button" data-filter="all" aria-pressed="true">All<span>' + list.length + '</span></button>' +
      types.map(function (t) {
        var n = list.filter(function (p) { return p.type === t; }).length;
        return '<button type="button" data-filter="' + t + '" aria-pressed="false">' + esc(D.typeLabels[t]) + '<span>' + n + '</span></button>';
      }).join(''));

    var moveThumb = function () {
      var on = $('button[aria-pressed="true"]', seg);
      thumb.style.width = on.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)';
    };
    var applyFilter = function (type) {
      activeFilter = type;
      $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === type ? 'true' : 'false'); });
      moveThumb();
      var shown = 0;
      $$('.card', track).concat($$('.row', rows)).forEach(function (el) {
        var out = type !== 'all' && el.getAttribute('data-type') !== type;
        el.classList.toggle('is-out', out);
        if (!out && el.classList.contains('card')) shown += 1;
      });
      hudTotal.textContent = pad(shown);
      track.scrollLeft = 0;
      setHud(0);
      if (hasGsap) window.ScrollTrigger.refresh();
    };
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) applyFilter(b.getAttribute('data-filter'));
    });
    hudTotal.textContent = pad(list.length);
    moveThumb();
    window.addEventListener('resize', moveThumb);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveThumb);

    /* gallery / list */
    $$('.views button').forEach(function (b) {
      b.addEventListener('click', function () {
        var listView = b.getAttribute('data-view') === 'list';
        document.body.classList.toggle('view-list', listView);
        $$('.views button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (hasGsap) window.ScrollTrigger.refresh();
      });
    });

    pinHorizontal($('.gallery-pin'), track, setHud);
    initSheet();
  }

  /* ---------------- boot ---------------- */
  wireLinks();
  fillPlates();
  initNav();
  if (page === 'home') initHome();
  if (page === 'portfolio') initPortfolio();
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (hasGsap) window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
