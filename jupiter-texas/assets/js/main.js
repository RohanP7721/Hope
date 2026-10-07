/* ============================================================
   JUPITER TEXAS — behaviour
   Shared: nav, smooth scroll, reveals, tilt cards, sheet.
   Home: hero intro, planet parallax, return bars, 1:200 dots,
         pinned process strip, portfolio teaser.
   Portfolio: filters, pinned gallery / swipe, ledger view,
         cursor preview, detail sheet with deep links.
   ============================================================ */

(function () {
  'use strict';

  var D = window.JT;
  var Art = window.JTArt;
  var doc = document.documentElement;
  var page = doc.getAttribute('data-page');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;

  var ICON = {
    arrow: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
    pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 14.5s5-4.6 5-8.5a5 5 0 1 0-10 0c0 3.9 5 8.5 5 8.5Z"/><circle cx="8" cy="6" r="1.8"/></svg>'
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- links from content.js ---------------- */
  /* Any element with data-link="key" gets its href from JT.links,
     so every page shares one source of truth for URLs. */
  function wireLinks() {
    $$('[data-link]').forEach(function (a) {
      var url = D.links[a.getAttribute('data-link')];
      if (!url) return;
      a.setAttribute('href', url);
      if (/^https?:/.test(url) && url.indexOf(location.host || '__none__') === -1) {
        a.setAttribute('rel', 'noopener');
      }
    });
  }

  /* ---------------- smooth scroll ---------------- */
  function initSmoothScroll() {
    if (reduceMotion || !window.Lenis || !finePointer) return;
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    if (hasGsap) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
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
      nav.classList.toggle('is-scrolled', y > 40);
      var goingDown = y > lastY + 4;
      var goingUp = y < lastY - 4;
      if (goingDown && y > 320 && !document.body.classList.contains('menu-open')) nav.classList.add('is-hidden');
      else if (goingUp || y < 120) nav.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* gliding hover highlight */
    var list = $('.nav-links', nav);
    var glide = $('.nav-glide', nav);
    if (list && glide) {
      $$('.nav-links > li > a, .nav-links > li > .nav-drop-btn', nav).forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          var r = el.getBoundingClientRect();
          var lr = list.getBoundingClientRect();
          glide.style.width = r.width + 'px';
          glide.style.transform = 'translate(' + (r.left - lr.left) + 'px,' + (r.top - lr.top) + 'px)';
        });
      });
    }

    /* dropdown: click / keyboard for touch + a11y */
    $$('.has-drop', nav).forEach(function (li) {
      var btn = $('.nav-drop-btn', li);
      btn.addEventListener('click', function () {
        var open = li.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      li.addEventListener('mouseleave', function () { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      $$('.has-drop.is-open').forEach(function (li) { if (!li.contains(e.target)) li.classList.remove('is-open'); });
    });

    /* mobile menu */
    var burger = $('.burger');
    var menu = $('#menu');
    if (burger && menu) {
      function setMenu(open) {
        document.body.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open) { nav.classList.remove('is-hidden'); if (lenis) lenis.stop(); }
        else if (lenis) lenis.start();
      }
      burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
      window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });
    }
  }

  /* ---------------- buttons: glow follows the cursor ---------------- */
  function initButtons() {
    if (!finePointer) return;
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn');
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------------- reveals ---------------- */
  function initReveals() {
    var items = $$('.rv');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  function whenVisible(el, fn, margin) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { fn(); io.disconnect(); }
    }, { rootMargin: margin || '0px 0px -15% 0px' });
    io.observe(el);
  }

  /* ---------------- headline intro ---------------- */
  function introHeadline(sel) {
    var spans = $$(sel + ' .line > span');
    if (!spans.length || reduceMotion || !hasGsap) return;
    window.gsap.from(spans, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.09, delay: 0.15 });
    window.gsap.from($$('.intro-fade'), { opacity: 0, y: 24, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.45 });
  }

  /* ---------------- tilt cards ---------------- */
  function bindTilt(card) {
    if (!finePointer || reduceMotion) return;
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - py) * 12).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------------- property card markup ---------------- */
  function artFor(p) {
    return p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' : Art.render(p.type);
  }

  function statsFor(p, cls) {
    var rows = [];
    if (p.price) rows.push(['Purchase Price', p.price, '']);
    if (p.cashOnCash) rows.push(['Projected Annual Cash On Cash*', p.cashOnCash, '']);
    if (p.forecast) rows.push(['Forecasted Annual Return*', p.forecast, 'hot']);
    if (!rows.length) return '';
    return '<dl class="stats ' + (cls || '') + '" style="grid-template-columns:repeat(' + rows.length + ',1fr)">' +
      rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd class="' + r[2] + '">' + esc(r[1]) + '</dd></div>'; }).join('') +
      '</dl>';
  }

  function cardHTML(p, i) {
    return '<button class="card" type="button" data-id="' + p.id + '" data-type="' + p.type + '" aria-label="' + esc(p.name + ', ' + p.place) + ' — view details">' +
      '<span class="card-type">' + esc(D.typeLabels[p.type] || p.type) + '</span>' +
      '<span class="card-idx">' + pad(i + 1) + '</span>' +
      '<span class="card-art">' + artFor(p) + '</span>' +
      '<span class="card-body">' +
        '<span><h3>' + esc(p.name) + '</h3><span class="card-place">' + ICON.pin + esc(p.place) + '</span></span>' +
        statsFor(p) +
        '<span class="card-open">View details <span class="arr">→</span></span>' +
      '</span>' +
    '</button>';
  }

  /* ---------------- detail sheet ---------------- */
  var sheet, sheetList = [], sheetIndex = 0, lastFocus = null;

  function initSheet(list) {
    sheet = $('#sheet');
    if (!sheet || typeof sheet.showModal !== 'function') return;
    sheetList = list;
    $('.sheet-close', sheet).addEventListener('click', closeSheet);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
    sheet.addEventListener('close', function () {
      if (lenis) lenis.start();
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  function fillSheet(p) {
    var idx = sheetList.indexOf(p);
    $('.sheet-art', sheet).innerHTML = artFor(p);
    $('.sheet-type', sheet).textContent = (D.typeLabels[p.type] || p.type) + ' · ' + pad(idx + 1) + ' / ' + pad(sheetList.length);
    $('.sheet-name', sheet).textContent = p.name;
    $('.sheet-place', sheet).innerHTML = ICON.pin + esc(p.place);
    $('.sheet-stats', sheet).innerHTML = statsFor(p) || '<p class="fine">Figures for this property are shared on request.</p>';
    sheetIndex = idx;
  }

  function openSheet(id) {
    if (!sheet || typeof sheet.showModal !== 'function') return;
    var p = sheetList.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    lastFocus = document.activeElement;
    fillSheet(p);
    if (!sheet.open) sheet.showModal();
    if (lenis) lenis.stop();
    history.replaceState(null, '', '#' + p.id);
  }

  function closeSheet() { if (sheet && sheet.open) sheet.close(); }

  function step(dir) {
    var visible = sheetList.filter(function (p) { return !activeFilter || activeFilter === 'all' || p.type === activeFilter; });
    var cur = visible.indexOf(sheetList[sheetIndex]);
    var next = visible[(cur + dir + visible.length) % visible.length];
    if (next) { fillSheet(next); history.replaceState(null, '', '#' + next.id); }
  }

  /* ---------------- pinned horizontal scroll ---------------- */
  /* Vertical scroll drives a horizontal track. Desktop only;
     touch screens get a native swipe track from the CSS. */
  function pinHorizontal(section, pinEl, track, progressBar, onUpdate) {
    if (!hasGsap || reduceMotion) return null;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          pin: pinEl,
          start: 'top top',
          end: function () { return '+=' + distance(); },
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (progressBar) progressBar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
            if (onUpdate) onUpdate(self.progress);
          }
        }
      });
      return function () { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); track.style.transform = ''; };
    });
    return mm;
  }

  /* ============================================================
     HOME
     ============================================================ */
  function initHome() {
    introHeadline('.hero h1');

    /* planet follows the pointer a little */
    var tilt = $('.planet-tilt');
    if (tilt && finePointer && !reduceMotion) {
      window.addEventListener('pointermove', function (e) {
        var x = e.clientX / window.innerWidth - 0.5;
        var y = e.clientY / window.innerHeight - 0.5;
        tilt.style.transform = 'rotateY(' + (x * 18).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg)';
      }, { passive: true });
    }
    if (hasGsap && !reduceMotion) {
      window.gsap.to('.planet-stage', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      window.gsap.to('.hero-copy', { yPercent: -10, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* asset class art */
    $$('[data-art]').forEach(function (el) { el.innerHTML = Art.render(el.getAttribute('data-art')); });

    /* return bars grow when seen */
    $$('.bar').forEach(function (b) { b.querySelector('.bar-fill').style.setProperty('--p', reduceMotion ? 1 : 0); });
    whenVisible($('.bars'), function () {
      $$('.bar-fill').forEach(function (f, i) { setTimeout(function () { f.style.setProperty('--p', 1); }, i * 250); });
    });

    /* 1 : 200 */
    var dots = $('.dots');
    if (dots) {
      var html = '';
      for (var i = 0; i < 200; i++) html += '<i></i>';
      dots.innerHTML = html;
      var cells = dots.children;
      whenVisible(dots, function () {
        if (reduceMotion) { cells[137].classList.add('pick'); return; }
        var n = 0;
        var scan = setInterval(function () {
          cells[n].style.background = 'rgba(255,255,255,.4)';
          (function (c) { setTimeout(function () { c.style.background = ''; }, 260); })(cells[n]);
          n += 1;
          if (n > 137) { clearInterval(scan); cells[137].classList.add('pick'); }
        }, 9);
      });
    }

    /* process strip */
    var proc = $('#process');
    if (proc) pinHorizontal(proc, $('.hscroll-pin', proc), $('.hscroll-track', proc), $('.hscroll-progress i', proc));

    /* portfolio teaser */
    var teaser = $('#teaser-track');
    if (teaser) {
      teaser.innerHTML = D.properties.map(cardHTML).join('');
      $$('.card', teaser).forEach(function (c) {
        bindTilt(c);
        c.addEventListener('click', function () { location.href = 'portfolio.html#' + c.getAttribute('data-id'); });
      });
      $$('[data-scroll]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var card = teaser.querySelector('.card');
          var w = card ? card.getBoundingClientRect().width + 20 : 400;
          teaser.scrollBy({ left: w * Number(btn.getAttribute('data-scroll')), behavior: reduceMotion ? 'auto' : 'smooth' });
        });
      });
    }
  }

  /* ============================================================
     PORTFOLIO
     ============================================================ */
  var activeFilter = 'all';

  function initPortfolio() {
    introHeadline('.p-hero h1');
    var list = D.properties;
    var track = $('#gallery-track');
    var ledger = $('#ledger-rows');
    var end = $('.gallery-end');

    /* counts */
    $$('[data-count="properties"]').forEach(function (el) { el.textContent = pad(list.length); });

    /* gallery cards. Snap keeps the end card "selected" when cards are
       inserted before it, so the swipe track is reset to the start. */
    end.insertAdjacentHTML('beforebegin', list.map(cardHTML).join(''));
    track.scrollLeft = 0;
    requestAnimationFrame(function () { track.scrollLeft = 0; });
    $$('.card', track).forEach(function (c) {
      bindTilt(c);
      c.addEventListener('click', function () { openSheet(c.getAttribute('data-id')); });
    });

    /* ledger rows */
    ledger.innerHTML = list.map(function (p, i) {
      return '<button class="ledger-row" type="button" data-id="' + p.id + '" data-type="' + p.type + '">' +
        '<span class="n">' + pad(i + 1) + '</span>' +
        '<span class="nm">' + esc(p.name) + '</span>' +
        '<span class="pl">' + esc(p.place) + '</span>' +
        '<span class="ty">' + esc(D.typeLabels[p.type]) + '</span>' +
        '<span class="v">' + esc(p.price || '—') + '</span>' +
        '<span class="v f">' + esc(p.forecast || '—') + '</span>' +
        '<span class="go">' + ICON.arrow + '</span>' +
      '</button>';
    }).join('');
    $$('.ledger-row:not(.is-head)', ledger).forEach(function (r) {
      r.addEventListener('click', function () { openSheet(r.getAttribute('data-id')); });
    });

    /* cursor-following preview on the ledger */
    var peek = $('.cursor-peek');
    if (peek && finePointer && !reduceMotion) {
      var px = 0, py = 0, cx = 0, cy = 0, raf = null;
      var loop = function () {
        cx += (px - cx) * 0.18; cy += (py - cy) * 0.18;
        peek.style.left = cx + 'px'; peek.style.top = cy + 'px';
        raf = requestAnimationFrame(loop);
      };
      $$('.ledger-row:not(.is-head)', ledger).forEach(function (r) {
        var p = list.filter(function (x) { return x.id === r.getAttribute('data-id'); })[0];
        r.addEventListener('pointerenter', function (e) {
          peek.innerHTML = artFor(p);
          px = cx = e.clientX + 170; py = cy = e.clientY;
          peek.classList.add('is-on');
          if (!raf) loop();
        });
        r.addEventListener('pointermove', function (e) { px = e.clientX + 170; py = e.clientY; });
        r.addEventListener('pointerleave', function () { peek.classList.remove('is-on'); });
      });
      ledger.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); raf = null; });
    }

    /* filters */
    var filterList = $('.filter-list');
    var glide = $('.filter-glide');
    var types = [];
    list.forEach(function (p) { if (types.indexOf(p.type) === -1) types.push(p.type); });
    filterList.insertAdjacentHTML('beforeend',
      '<button class="filter" type="button" data-filter="all" aria-pressed="true">All <sup>' + list.length + '</sup></button>' +
      types.map(function (t) {
        var n = list.filter(function (p) { return p.type === t; }).length;
        return '<button class="filter" type="button" data-filter="' + t + '" aria-pressed="false">' + esc(D.typeLabels[t]) + ' <sup>' + n + '</sup></button>';
      }).join(''));

    function moveGlide(btn) {
      glide.style.width = btn.offsetWidth + 'px';
      glide.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
    }
    function applyFilter(type) {
      activeFilter = type;
      var shown = 0;
      $$('.filter', filterList).forEach(function (b) {
        var on = b.getAttribute('data-filter') === type;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) moveGlide(b);
      });
      $$('.card', track).concat($$('.ledger-row:not(.is-head)', ledger)).forEach(function (el) {
        var out = type !== 'all' && el.getAttribute('data-type') !== type;
        el.classList.toggle('is-out', out);
        if (!out && el.classList.contains('card')) shown += 1;
      });
      $('#hud-total').textContent = pad(shown);
      if (hasGsap) {
        window.ScrollTrigger.refresh();
        if (!reduceMotion) window.gsap.fromTo($$('.card:not(.is-out)', track), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 });
      }
      track.scrollTo && track.scrollTo({ left: 0 });
    }
    filterList.addEventListener('click', function (e) {
      var b = e.target.closest('.filter');
      if (b) applyFilter(b.getAttribute('data-filter'));
    });
    requestAnimationFrame(function () { moveGlide($('.filter[aria-pressed="true"]', filterList)); });
    window.addEventListener('resize', function () { moveGlide($('.filter[aria-pressed="true"]', filterList)); });
    $('#hud-total').textContent = pad(list.length);

    /* view toggle */
    $$('.view-toggle button').forEach(function (b) {
      b.addEventListener('click', function () {
        var view = b.getAttribute('data-view');
        document.body.classList.toggle('view-list', view === 'list');
        $$('.view-toggle button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (hasGsap) window.ScrollTrigger.refresh();
      });
    });

    /* pinned gallery on desktop */
    var gallery = $('#gallery');
    var hudBar = $('.gallery-hud .bar-track i');
    var hudNow = $('#hud-now');
    pinHorizontal(gallery, $('.gallery-pin', gallery), track, hudBar, function (prog) {
      var n = $$('.card:not(.is-out)', track).length;
      hudNow.textContent = pad(Math.min(n, Math.max(1, Math.round(prog * (n - 1)) + 1)));
    });
    /* touch: update the HUD from native scroll */
    track.addEventListener('scroll', function () {
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      var prog = track.scrollLeft / max;
      hudBar.style.transform = 'scaleX(' + prog.toFixed(4) + ')';
      var n = $$('.card:not(.is-out)', track).length;
      hudNow.textContent = pad(Math.min(n, Math.round(prog * (n - 1)) + 1));
    }, { passive: true });

    /* opportunity art */
    $$('[data-art]').forEach(function (el) { el.innerHTML = Art.render(el.getAttribute('data-art')); });

    /* detail sheet + deep links (#gaylord etc.) */
    initSheet(list);
    $$('[data-sheet-step]').forEach(function (b) {
      b.addEventListener('click', function () { step(Number(b.getAttribute('data-sheet-step'))); });
    });
    function fromHash() {
      var id = location.hash.slice(1);
      if (id && list.some(function (p) { return p.id === id; })) openSheet(id);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------------- boot ---------------- */
  wireLinks();
  initSmoothScroll();
  initNav();
  initButtons();
  if (page === 'home') initHome();
  if (page === 'portfolio') initPortfolio();
  initReveals();
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (hasGsap) window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
