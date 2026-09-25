/* ============================================================
   THE DOLKAR HOTEL — shared site engine
   Smooth scroll, scroll reveals, cursor, page transitions,
   lightbox, swipe slider, booking widget, text overrides.
   ============================================================ */
(function () {
  'use strict';

  var D = window.DOLKAR;
  var html = document.documentElement;
  var editing = /[?&]edit\b/.test(location.search);
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = html.classList.contains('motion') && hasGsap && !editing;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!motion) html.classList.remove('motion', 'is-arriving', 'is-preloading');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function store(fn) { try { return fn(sessionStorage); } catch (e) { return null; } }

  /* ---------- small helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inr(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function wa(text) { return 'https://wa.me/' + D.hotel.whatsapp + '?text=' + encodeURIComponent(text); }
  function roomTitle(r) { return r.name + ' (' + r.variant + ')'; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var ICONS = {
    size: '<path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"/>',
    guests: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>',
    bed: '<path d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18v2M21 18v2M3 15h18M5 10V7.5A1.5 1.5 0 016.5 6h4A1.5 1.5 0 0112 7.5V10"/>',
    view: '<path d="M2 19l6.5-9 4 5.5 3-4L22 19z"/><circle cx="17" cy="6" r="2"/>',
    wifi: '<path d="M5 9a11 11 0 0114 0M8 12.5a6.5 6.5 0 018 0M11 16a2 2 0 012 0"/><circle cx="12" cy="19" r=".6" fill="currentColor"/>',
    shower: '<path d="M5 21V7a3 3 0 013-3h1a3 3 0 013 3v1M8 10.5h8M12 8v2.5M9.5 14v1M12 14v1M14.5 14v1M10.5 17.5v1M13.5 17.5v1"/>',
    water: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
    service: '<path d="M4 17h16M5 17a7 7 0 0114 0M12 8V6M10 6h4M3 20h18"/>',
    housekeeping: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5L8 8M16 16l2.5 2.5M18.5 5.5L16 8M8 16l-2.5 2.5"/>',
    toiletries: '<path d="M10 3h4v3h-4zM8 8a2 2 0 012-2h4a2 2 0 012 2v11a2 2 0 01-2 2h-4a2 2 0 01-2-2zM8 12h8"/>',
    parking: '<path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11M5 11h14a1 1 0 011 1v5a1 1 0 01-1 1h-1v2h-2v-2H7v2H5v-2H4a1 1 0 01-1-1v-5a1 1 0 011-1z"/><circle cx="7.5" cy="14.5" r=".8" fill="currentColor"/><circle cx="16.5" cy="14.5" r=".8" fill="currentColor"/>',
    laundry: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><circle cx="7.5" cy="6" r=".8" fill="currentColor"/>',
    events: '<path d="M5 4h14l-7 9v7M9 20h6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'arrow-up-right': '<path d="M7 17L17 7M8 7h9v9"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    pin: '<path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    chat: '<path d="M20 12a8 8 0 01-11.6 7.1L4 20l1-4.2A8 8 0 1120 12z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'
  };
  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.arrow) + '</svg>';
  }

  function roomImages(r) { return r.images.concat(D.sharedRoomImages || []); }
  function roomCard(r, i) {
    var n = roomImages(r).length;
    return '<a class="room-card" href="room.html?r=' + encodeURIComponent(r.slug) + '" data-cursor="View">' +
      '<div class="rc-media"><div class="rc-zoom"><img src="' + esc(r.images[0]) + '" alt="' + esc(roomTitle(r)) + '" loading="lazy"></div>' +
      (r.badge ? '<span class="rc-badge">' + esc(r.badge) + '</span>' : '') +
      '<span class="rc-count">' + n + ' photo' + (n > 1 ? 's' : '') + '</span></div>' +
      '<div class="rc-meta"><span>' + pad(i + 1) + '</span><span>' + esc(r.tier) + '</span></div>' +
      '<h3 class="rc-title">' + esc(r.name) + ' <em>' + esc(r.variant) + '</em></h3>' +
      '<div class="rc-foot"><span>From <b>' + inr(r.price) + '</b> / night</span>' +
      '<span class="rc-specs">' + r.size + ' ft² · ' + r.guests + ' guests</span>' +
      '<span class="rc-arrow">' + icon('arrow') + '</span></div></a>';
  }

  /* ---------- text overrides written by Edit Mode ---------- */
  function applyText(root) {
    var t = window.DOLKAR_TEXT || {};
    $$('[data-edit]', root).forEach(function (el) {
      var k = el.getAttribute('data-edit');
      if (Object.prototype.hasOwnProperty.call(t, k)) el.innerHTML = t[k];
    });
  }

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  function initLenis() {
    if (!motion || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollTo(target, opts) {
    opts = opts || {};
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: opts.offset || 0, duration: opts.immediate ? 0 : 1.4, immediate: !!opts.immediate });
    else el.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
  }
  function lockScroll(on) {
    if (lenis) { on ? lenis.stop() : lenis.start(); }
    document.body.style.overflow = on ? 'hidden' : '';
  }

  /* ---------- text splitting (words, optional chars) ---------- */
  function split(el, chars) {
    if (el._split) return el._split;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'sw';
            var i = document.createElement('span'); i.className = 'swi';
            if (chars) {
              part.split('').forEach(function (c) {
                var s = document.createElement('span'); s.className = 'sc'; s.textContent = c; i.appendChild(s);
              });
            } else i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && ch.tagName !== 'IMG') walk(ch);
      });
    }
    walk(el);
    el._split = chars ? $$('.sc', el) : $$('.swi', el);
    return el._split;
  }

  /* ---------- scroll reveals ---------- */
  function initReveals(root) {
    if (!motion) return;
    root = root || document;

    $$('[data-split]', root).forEach(function (el) {
      if (el.hasAttribute('data-intro')) return;
      var parts = split(el, el.getAttribute('data-split') === 'chars');
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(parts, { yPercent: 115 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    $$('[data-reveal]', root).forEach(function (el) {
      if (el.hasAttribute('data-intro')) return;
      var type = el.getAttribute('data-reveal');
      var st = { trigger: el, start: 'top 90%' };
      if (type === 'clip') {
        var img = $('img', el);
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: st });
        if (img) gsap.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.9, ease: 'expo.out', scrollTrigger: st });
      } else if (type === 'fade') {
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: 'power2.out', scrollTrigger: st });
      } else {
        gsap.fromTo(el, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: st });
      }
    });

    $$('[data-stagger]', root).forEach(function (el) {
      var kids = Array.prototype.slice.call(el.children);
      gsap.fromTo(kids, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    $$('[data-parallax]', root).forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      gsap.fromTo(el, { yPercent: -s * 100 }, {
        yPercent: s * 100, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    $$('[data-scrub-words]', root).forEach(function (el) {
      var words = split(el, false);
      gsap.fromTo(words, { opacity: 0.14 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true }
      });
    });

    $$('[data-count]', root).forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var digits = el.getAttribute('data-pad') ? 2 : 0;
      var o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: function () {
          var v = Math.round(o.v);
          el.textContent = digits ? pad(v) : v.toLocaleString('en-IN');
        }
      });
    });
  }

  /* ---------- nav: solid on scroll, hide on scroll-down, menu ---------- */
  function initNav() {
    var nav = $('#nav');
    if (!nav) return;
    var menu = $('#menu');
    var btn = $('.menu-btn', nav);
    var last = 0;
    function onScroll(y) {
      nav.classList.toggle('is-solid', y > 40);
      if (!html.classList.contains('menu-open')) {
        if (y > 320 && y > last + 4) nav.classList.add('is-hidden');
        else if (y < last - 4 || y < 320) nav.classList.remove('is-hidden');
      }
      last = y;
      var bar = $('.stickybar');
      if (bar) {
        var nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 500;
        bar.classList.toggle('is-visible', y > window.innerHeight * 0.7 && !nearEnd && !bar._hidden);
      }
    }
    if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
    else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
    onScroll(window.scrollY);

    function setMenu(open) {
      html.classList.toggle('menu-open', open);
      if (menu) menu.classList.toggle('is-open', open);
      if (btn) { btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
      if (menu) menu.setAttribute('aria-hidden', !open);
      lockScroll(open);
    }
    if (btn) btn.addEventListener('click', function () { setMenu(!html.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && html.classList.contains('menu-open')) setMenu(false); });
    Site.closeMenu = function () { if (html.classList.contains('menu-open')) setMenu(false); };
  }

  /* ---------- in-page anchors + cross-page transitions ---------- */
  function initLinks() {
    var curtain = $('.curtain');
    document.addEventListener('click', function (e) {
      if (editing) return;
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var url = new URL(a.getAttribute('href'), location.href);
      if (url.origin !== location.origin) return;
      var samePage = url.pathname === location.pathname && url.search === location.search;
      if (samePage && url.hash) {
        var target = document.getElementById(url.hash.slice(1));
        if (!target) return;
        e.preventDefault();
        Site.closeMenu && Site.closeMenu();
        setTimeout(function () { scrollTo(target); }, html.classList.contains('menu-open') ? 450 : 0);
        return;
      }
      if (samePage) return;
      if (!motion || !curtain) return;
      e.preventDefault();
      store(function (s) { s.setItem('dolkar-nav', '1'); });
      gsap.fromTo(curtain, { yPercent: 100 }, {
        yPercent: 0, duration: 0.8, ease: 'expo.inOut',
        onComplete: function () { location.href = url.href; }
      });
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted && curtain) { gsap.set(curtain, { yPercent: 100 }); html.classList.remove('is-arriving'); }
    });
  }

  /* ---------- cursor follower + magnetic buttons ---------- */
  function initCursor() {
    if (!motion || !finePointer) return;
    var c = document.createElement('div');
    c.className = 'cursor';
    c.innerHTML = '<span class="cursor-label"></span>';
    document.body.appendChild(c);
    var label = c.firstChild;
    var xTo = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3' });
    var yTo = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!c.classList.contains('is-on')) { gsap.set(c, { x: e.clientX, y: e.clientY }); c.classList.add('is-on'); }
      xTo(e.clientX); yTo(e.clientY);
    });
    document.addEventListener('mouseleave', function () { c.classList.remove('is-on'); });
    document.addEventListener('mouseover', function (e) {
      var l = e.target.closest('[data-cursor]');
      if (l) { label.textContent = l.getAttribute('data-cursor'); c.classList.add('is-label'); c.classList.remove('is-link'); return; }
      c.classList.remove('is-label');
      c.classList.toggle('is-link', !!e.target.closest('a, button, label, select, input, textarea, summary'));
    });

    $$('[data-magnetic]').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      var my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------- swipe slider (native scroll-snap + mouse drag) ---------- */
  function slider(track, opts) {
    opts = opts || {};
    var slides = Array.prototype.slice.call(track.children);
    var cur = 0;
    function offsetOf(i) { return slides[i].offsetLeft - slides[0].offsetLeft; }
    function indexNow() {
      var max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= max - 4) return slides.length - 1;
      var best = 0, bd = Infinity;
      slides.forEach(function (s, i) { var d = Math.abs(offsetOf(i) - track.scrollLeft); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function goTo(i, instant) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: offsetOf(i), behavior: instant ? 'auto' : 'smooth' });
      set(i);
    }
    function set(i) { if (i !== cur) { cur = i; opts.onChange && opts.onChange(i); } }
    track.addEventListener('scroll', function () { if (!drag.on) set(indexNow()); }, { passive: true });

    var drag = { on: false, moved: false, x: 0, left: 0 };
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag.on = true; drag.moved = false; drag.x = e.clientX; drag.left = track.scrollLeft;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag.on) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) drag.moved = true;
      track.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', function (e) {
      if (!drag.on) return;
      drag.on = false;
      track.classList.remove('is-drag');
      var dx = e.clientX - drag.x;
      var i = indexNow();
      if (dx < -60 && i <= cur) i = cur + 1;
      else if (dx > 60 && i >= cur) i = cur - 1;
      goTo(i);
    });
    track.addEventListener('click', function (e) { if (drag.moved) { e.preventDefault(); e.stopPropagation(); drag.moved = false; } }, true);
    $$('img', track).forEach(function (img) { img.draggable = false; });

    return {
      goTo: goTo,
      next: function () { goTo(cur + 1); },
      prev: function () { goTo(cur - 1); },
      get index() { return cur; },
      count: slides.length
    };
  }

  /* ---------- lightbox ---------- */
  var lb = null;
  function lightbox(images, start) {
    if (!lb) {
      var el = document.createElement('div');
      el.className = 'lb';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Photo viewer');
      el.setAttribute('data-lenis-prevent', '');
      el.innerHTML =
        '<div class="lb-top"><span class="lb-count"></span><button class="lb-close icon-btn" aria-label="Close">' + icon('close') + '</button></div>' +
        '<div class="lb-track"></div>' +
        '<button class="lb-nav lb-prev icon-btn" aria-label="Previous photo">' + icon('arrow-left') + '</button>' +
        '<button class="lb-nav lb-next icon-btn" aria-label="Next photo">' + icon('arrow') + '</button>' +
        '<p class="lb-caption"></p>';
      document.body.appendChild(el);
      lb = { el: el, track: $('.lb-track', el), count: $('.lb-count', el), cap: $('.lb-caption', el), last: null };
      function close() {
        el.classList.remove('is-open'); lockScroll(false);
        if (lb.last) lb.last.focus();
      }
      $('.lb-close', el).addEventListener('click', close);
      $('.lb-prev', el).addEventListener('click', function () { lb.s.prev(); });
      $('.lb-next', el).addEventListener('click', function () { lb.s.next(); });
      el.addEventListener('click', function (e) { if (e.target.classList.contains('lb-slide')) close(); });
      document.addEventListener('keydown', function (e) {
        if (!el.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') lb.s.next();
        if (e.key === 'ArrowLeft') lb.s.prev();
      });
    }
    lb.last = document.activeElement;
    var fresh = document.createElement('div');
    fresh.className = 'lb-track';
    lb.track.parentNode.replaceChild(fresh, lb.track);
    lb.track = fresh;
    lb.track.innerHTML = images.map(function (im) {
      return '<div class="lb-slide"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || '') + '"></div>';
    }).join('');
    function update(i) {
      lb.count.textContent = pad(i + 1) + ' / ' + pad(images.length);
      lb.cap.textContent = images[i].alt || '';
      lb.el.classList.toggle('is-single', images.length < 2);
    }
    lb.s = slider(lb.track, { onChange: update });
    lb.el.classList.add('is-open');
    lockScroll(true);
    requestAnimationFrame(function () { lb.s.goTo(start || 0, true); update(start || 0); $('.lb-close', lb.el).focus(); });
  }

  /* ---------- booking widget → WhatsApp ---------- */
  function parseDate(v) { if (!v) return null; var p = v.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function fmtDate(d) { return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function booking(container, opts) {
    opts = opts || {};
    var fixed = opts.room || null;
    var uid = 'bk' + Math.random().toString(36).slice(2, 7);
    var today = isoDate(new Date());
    var roomSelect = fixed ? '' :
      '<div class="bk-field bk-room"><label for="' + uid + '-room">Room</label><select id="' + uid + '-room" name="room">' +
      D.rooms.map(function (r) { return '<option value="' + r.slug + '">' + esc(roomTitle(r)) + ' — from ' + inr(r.price) + '</option>'; }).join('') +
      '</select></div>';
    container.innerHTML =
      '<form class="bk" novalidate>' + roomSelect +
      '<div class="bk-dates">' +
      '<div class="bk-field"><label for="' + uid + '-in">Check-in</label><input id="' + uid + '-in" type="date" name="in" min="' + today + '" required></div>' +
      '<div class="bk-field"><label for="' + uid + '-out">Check-out</label><input id="' + uid + '-out" type="date" name="out" min="' + today + '" required></div>' +
      '</div>' +
      '<div class="bk-field bk-guests"><span class="bk-label" id="' + uid + '-gl">Guests</span>' +
      '<div class="stepper" role="group" aria-labelledby="' + uid + '-gl"><button type="button" class="icon-btn" data-step="-1" aria-label="Fewer guests">' + icon('minus') + '</button>' +
      '<output name="guests" aria-live="polite">2</output>' +
      '<button type="button" class="icon-btn" data-step="1" aria-label="More guests">' + icon('plus') + '</button></div></div>' +
      '<div class="bk-field"><label for="' + uid + '-name">Your name</label><input id="' + uid + '-name" type="text" name="name" autocomplete="name" placeholder="Full name"></div>' +
      '<div class="bk-summary" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn--gold btn--block"><span>Request on WhatsApp</span>' + icon('arrow-up-right') + '</button>' +
      '<p class="bk-status" role="status"></p>' +
      '</form>';

    var f = $('form', container);
    var inEl = f.elements['in'], outEl = f.elements['out'], nameEl = f.elements['name'];
    var gOut = $('output', f), status = $('.bk-status', f), summary = $('.bk-summary', f);
    var guests = 2;

    function room() { return fixed || D.rooms.filter(function (r) { return r.slug === f.elements['room'].value; })[0]; }
    function nights() {
      var a = parseDate(inEl.value), b = parseDate(outEl.value);
      if (!a || !b) return 0;
      return Math.round((b - a) / 86400000);
    }
    function render() {
      var r = room();
      guests = Math.max(1, Math.min(r.guests, guests));
      gOut.textContent = guests;
      $('[data-step="-1"]', f).disabled = guests <= 1;
      $('[data-step="1"]', f).disabled = guests >= r.guests;
      var n = nights();
      summary.innerHTML = n > 0
        ? '<div class="bk-line"><span>' + inr(r.price) + ' × ' + n + ' night' + (n > 1 ? 's' : '') + '</span><strong>' + inr(r.price * n) + '</strong></div><small>Indicative starting rate — the team confirms your final price on WhatsApp.</small>'
        : '<div class="bk-line"><span>From</span><strong>' + inr(r.price) + ' <em>/ night</em></strong></div><small>Choose your dates to see an estimate.</small>';
    }
    inEl.addEventListener('change', function () {
      var a = parseDate(inEl.value);
      if (a) {
        var next = new Date(a); next.setDate(next.getDate() + 1);
        outEl.min = isoDate(next);
        var b = parseDate(outEl.value);
        if (!b || b <= a) outEl.value = isoDate(next);
      }
      render();
    });
    outEl.addEventListener('change', render);
    if (!fixed) f.elements['room'].addEventListener('change', render);
    $$('[data-step]', f).forEach(function (b) {
      b.addEventListener('click', function () { guests += +b.getAttribute('data-step'); render(); });
    });
    if (opts.select && !fixed) f.elements['room'].value = opts.select;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'bk-status';
      var n = nights();
      if (!inEl.value || !outEl.value || n < 1) {
        status.textContent = 'Please pick your check-in and check-out dates.';
        status.classList.add('is-error'); return;
      }
      var r = room();
      var lines = [
        "Hi, I'd like to book a stay at " + D.hotel.name + '.',
        '',
        'Room: ' + roomTitle(r),
        'Check-in: ' + fmtDate(parseDate(inEl.value)),
        'Check-out: ' + fmtDate(parseDate(outEl.value)) + ' (' + n + ' night' + (n > 1 ? 's' : '') + ')',
        'Guests: ' + guests
      ];
      if (nameEl.value.trim()) lines.push('Name: ' + nameEl.value.trim());
      window.open(wa(lines.join('\n')), '_blank', 'noopener');
      status.textContent = 'WhatsApp is opening — just hit send and the team will confirm availability.';
      status.classList.add('is-ok');
    });
    render();
    return { setRoom: function (slug) { if (!fixed) { f.elements['room'].value = slug; render(); } } };
  }

  /* ---------- booking drawer (home) ---------- */
  function initDrawer() {
    var drawer = $('#drawer');
    var api = null;
    if (drawer) api = booking($('.drawer-body', drawer));
    function open(slug) {
      if (!drawer) return;
      if (slug && api) api.setRoom(slug);
      drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
      lockScroll(true);
      setTimeout(function () { var f = $('select, input', drawer); f && f.focus(); }, 500);
    }
    function close() {
      if (!drawer) return;
      drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
      lockScroll(false);
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-open-booking]');
      if (t) {
        e.preventDefault();
        Site.closeMenu && Site.closeMenu();
        var card = $('#bookingCard');
        if (card) { scrollTo(card, { offset: -100 }); setTimeout(function () { var i = $('input', card); i && i.focus({ preventScroll: true }); }, 900); }
        else open(t.getAttribute('data-open-booking'));
      }
      if (e.target.closest('[data-close-drawer]')) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) close(); });
  }

  /* ---------- sticky mobile bar hides near given sections ---------- */
  function initStickyBar() {
    var bar = $('.stickybar');
    if (!bar || !('IntersectionObserver' in window)) return;
    var seen = new Set();
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { en.isIntersecting ? seen.add(en.target) : seen.delete(en.target); });
      bar._hidden = seen.size > 0;
      if (bar._hidden) bar.classList.remove('is-visible');
    });
    $$('[data-hide-stickybar]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- boot sequence ---------- */
  function start(intro) {
    applyText();
    initLenis();
    initNav();
    initLinks();
    initDrawer();
    initStickyBar();
    initCursor();
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    if (editing) {
      var s = document.createElement('script');
      s.src = 'assets/js/editor.js';
      document.body.appendChild(s);
    }

    if (!motion) { intro && intro(null); return; }

    initReveals();
    Site.afterReveals && Site.afterReveals();
    html.classList.add('motion-ready');

    function go() {
      ScrollTrigger.refresh();
      if (location.hash) {
        var t = document.getElementById(location.hash.slice(1));
        if (t) scrollTo(t, { immediate: true });
      }
      intro && intro(gsap.timeline());
    }

    var curtain = $('.curtain');
    var pre = $('.preloader');
    if (html.classList.contains('is-arriving') && curtain) {
      store(function (s) { s.removeItem('dolkar-nav'); });
      gsap.set(curtain, { yPercent: 0 });
      html.classList.remove('is-arriving');
      gsap.to(curtain, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.1, onStart: go });
    } else if (html.classList.contains('is-preloading') && pre) {
      store(function (s) { s.setItem('dolkar-seen', '1'); });
      lockScroll(true);
      var num = $('.pre-count', pre), bar = $('.pre-bar i', pre), o = { v: 0 };
      var tl = gsap.timeline();
      tl.from($('.pre-logo', pre), { autoAlpha: 0, y: 20, duration: 0.8, ease: 'expo.out' })
        .to(o, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(o.v); bar.style.transform = 'scaleX(' + o.v / 100 + ')'; } }, 0.1)
        .to(pre, { yPercent: -100, duration: 1, ease: 'expo.inOut', onStart: function () { lockScroll(false); go(); } }, '+=0.15')
        .add(function () { html.classList.remove('is-preloading'); pre.remove(); });
    } else {
      go();
    }
  }

  window.Site = {
    data: D, motion: motion, editing: editing,
    $: $, $$: $$, esc: esc, inr: inr, wa: wa, icon: icon, pad: pad, roomTitle: roomTitle,
    roomCard: roomCard, roomImages: roomImages,
    split: split, slider: slider, lightbox: lightbox, booking: booking,
    applyText: applyText, scrollTo: scrollTo, start: start,
    get lenis() { return lenis; }
  };
})();
