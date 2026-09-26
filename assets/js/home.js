(function () {
  'use strict';
  var S = window.Site, D = S.data, $ = S.$, $$ = S.$$, esc = S.esc, icon = S.icon, pad = S.pad;

  /* ---------- render from data.js ---------- */
  var track = $('#roomsTrack');
  track.innerHTML = D.rooms.map(function (r, i) { return S.roomCard(r, i); }).join('') +
    '<div class="room-card room-card--cta">' +
      '<span class="label">Not sure?</span>' +
      '<h3 data-edit="home.rooms.ctaTitle">Tell us who\'s coming — we\'ll <em>pick the room.</em></h3>' +
      '<a class="btn btn--light" target="_blank" rel="noopener" href="' + S.wa("Hi, I'm planning a stay at The Dolkar Hotel and would love help choosing a room.") + '"><span>Ask on WhatsApp</span>' + icon('arrow-up-right') + '</a>' +
    '</div>';
  $('.rp-total').textContent = pad(D.rooms.length);

  var speeds = [0.06, 0.1, 0.08, 0.11];
  $('#diningCollage').innerHTML = D.restaurantImages.slice(0, 4).map(function (src, i) {
    return '<figure class="dc dc' + (i + 1) + '" data-reveal="clip" data-tilt><img src="' + esc(src) + '" alt="Dishes at Taste of Tibet" loading="lazy" data-parallax="' + speeds[i] + '"></figure>';
  }).join('');

  $('#amenGrid').innerHTML = D.amenities.map(function (a, i) {
    return '<div class="amen-item"><div class="amen-top"><span class="amen-icon">' + icon(a.icon) + '</span><span class="amen-no">' + pad(i + 1) + '</span></div>' +
      '<h3 data-edit="amen.' + i + '.title">' + esc(a.title) + '</h3><p data-edit="amen.' + i + '.text">' + esc(a.text) + '</p></div>';
  }).join('');

  var gallery = [];
  function renderGallery(files) {
    var caps = D.galleryCaptions || [];
    gallery = files.map(function (src, i) { return { src: src, alt: caps[i] || 'The Dolkar Hotel — photo ' + (i + 1) }; });
    var cols = [[], [], []];
    gallery.forEach(function (g, i) { cols[i % 3].push({ g: g, i: i }); });
    $('#galleryCols').innerHTML = cols.map(function (col, ci) {
      return '<div class="g-col g-col' + (ci + 1) + '">' + col.map(function (o) {
        return '<button class="g-item" data-index="' + o.i + '" data-cursor="Open" data-reveal data-tilt aria-label="Open photo: ' + esc(o.g.alt) + '">' +
          '<img src="' + esc(o.g.src) + '" alt="' + esc(o.g.alt) + '" loading="lazy"><span class="g-cap">' + esc(o.g.alt) + '</span></button>';
      }).join('') + '</div>';
    }).join('');
    $('#gallery').hidden = !gallery.length;
  }
  $('#galleryCols').addEventListener('click', function (e) {
    var b = e.target.closest('.g-item');
    if (b) S.lightbox(gallery, +b.getAttribute('data-index'));
  });
  $('#galleryAll').addEventListener('click', function () { if (gallery.length) S.lightbox(gallery, 0); });

  var H = D.hotel;
  $('#contactList').innerHTML = [
    ['pin', 'Find us', H.address, H.mapsUrl, true],
    ['phone', 'Call', H.phones.join('  ·  '), 'tel:' + H.phones[0].replace(/\s/g, ''), false],
    ['mail', 'Email', H.email, 'mailto:' + H.email, false],
    ['chat', 'WhatsApp', 'Message the front desk', S.wa("Hi, I'd like to enquire about staying at The Dolkar Hotel."), true]
  ].map(function (c) {
    return '<li><a href="' + esc(c[3]) + '"' + (c[4] ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="c-icon">' + icon(c[0]) + '</span><span class="c-text"><small>' + c[1] + '</small>' + esc(c[2]) + '</span>' +
      '<span class="c-go">' + icon('arrow-up-right') + '</span></a></li>';
  }).join('');

  $('#reserveBtn').href = S.wa("Hi, I'd like to reserve a table at Taste of Tibet.");
  $('#menuPdf').href = H.menuPdf;
  $$('[data-close-drawer].icon-btn, #vPrev, #vNext').forEach(function (b) {
    b.innerHTML = icon(b.id === 'vPrev' ? 'arrow-left' : b.id === 'vNext' ? 'arrow' : 'close');
  });
  var minPrice = Math.min.apply(null, D.rooms.map(function (r) { return r.price; }));
  $('.stickybar b').textContent = S.inr(minPrice);

  /* ---------- live "open now" for dinner (IST) ---------- */
  (function () {
    var el = $('#openStatus');
    var h = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(new Date());
    var o = H.dinnerOpen, c = H.dinnerClose;
    if (h >= o && h < c) { el.textContent = 'Open now'; el.classList.add('is-open'); }
    else el.textContent = h < o ? 'Opens tonight' : 'Opens tomorrow';
  })();

  /* ---------- testimonials ---------- */
  (function () {
    var stage = $('#voiceStage'), dots = $('#vDots');
    var T = D.testimonials, cur = 0, timer = null, paused = false;
    stage.innerHTML = T.map(function (t, i) {
      return '<figure class="v-quote" aria-hidden="' + (i ? 'true' : 'false') + '"><blockquote data-edit="voice.' + i + '.quote">' + esc(t.quote) + '</blockquote>' +
        '<figcaption data-edit="voice.' + i + '.by">' + esc(t.by) + '</figcaption></figure>';
    }).join('');
    dots.innerHTML = T.map(function (t, i) { return '<button aria-label="Quote ' + (i + 1) + '"><i></i></button>'; }).join('');
    var qs = $$('.v-quote', stage), ds = $$('button', dots);
    function show(i) {
      cur = (i + T.length) % T.length;
      qs.forEach(function (q, k) { q.classList.toggle('is-active', k === cur); q.setAttribute('aria-hidden', k !== cur); });
      ds.forEach(function (d, k) { d.classList.toggle('is-active', k === cur); });
      clearTimeout(timer);
      if (!S.editing) timer = setTimeout(function () { if (!paused) show(cur + 1); else show(cur); }, 7000);
    }
    ds.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });
    $('#vPrev').addEventListener('click', function () { show(cur - 1); });
    $('#vNext').addEventListener('click', function () { show(cur + 1); });
    var sec = $('.voices');
    sec.addEventListener('mouseenter', function () { paused = true; sec.classList.add('is-paused'); });
    sec.addEventListener('mouseleave', function () { paused = false; sec.classList.remove('is-paused'); });
    show(0);
  })();

  /* ---------- enquiry form → WhatsApp ---------- */
  (function () {
    var f = $('#enquiryForm'), st = $('#formStatus');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      st.className = 'f-status';
      var v = function (n) { return (f.elements[n].value || '').trim(); };
      if (!v('name')) { st.textContent = 'Please add your name so the team knows who to reply to.'; st.classList.add('is-error'); f.elements.name.focus(); return; }
      var reason = (f.querySelector('input[name="reason"]:checked') || {}).value || 'General enquiry';
      var lines = ["Hi, I'd like to enquire about The Dolkar Hotel.", '', 'Enquiry: ' + reason, 'Name: ' + v('name')];
      if (v('phone')) lines.push('Phone: ' + v('phone'));
      if (v('email')) lines.push('Email: ' + v('email'));
      if (v('message')) lines.push('Message: ' + v('message'));
      window.open(S.wa(lines.join('\n')), '_blank', 'noopener');
      st.textContent = 'WhatsApp is opening — send the pre-filled message to complete your enquiry.';
      st.classList.add('is-ok');
    });
  })();

  /* ---------- rooms progress on touch/scroll (non-pinned) ---------- */
  var now = $('.rp-now'), bar = $('.rp-bar i');
  function setProgress(p) {
    var n = D.rooms.length;
    bar.style.transform = 'scaleX(' + Math.max(0.02, p) + ')';
    now.textContent = pad(Math.min(n, Math.floor(p * n) + 1));
  }
  track.addEventListener('scroll', function () {
    if (track.classList.contains('is-pinned')) return;
    var max = track.scrollWidth - track.clientWidth;
    setProgress(max > 0 ? track.scrollLeft / max : 0);
  }, { passive: true });
  setProgress(0);

  /* ---------- motion-only scroll choreography ---------- */
  S.afterReveals = function () {
    if (S.lite) return;
    var mm = gsap.matchMedia();

    mm.add('(min-width: 1025px)', function () {
      track.classList.add('is-pinned');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '.rooms-pin', pin: true, start: 'top top',
          end: function () { return '+=' + dist(); },
          scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: function (self) { setProgress(self.progress); }
        }
      });
      $$('.rc-zoom', track).forEach(function (z) {
        gsap.fromTo(z, { xPercent: -7 }, {
          xPercent: 7, ease: 'none',
          scrollTrigger: { trigger: z.closest('.room-card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
        });
      });
      gsap.fromTo('.room-card', { x: 160, autoAlpha: 0 }, {
        x: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '#rooms', start: 'top 65%' }
      });

      var cols = $$('.g-col');
      [[60, -60], [180, -140], [20, -100]].forEach(function (r, i) {
        if (cols[i]) gsap.fromTo(cols[i], { y: r[0] }, { y: r[1], ease: 'none', scrollTrigger: { trigger: '#gallery', start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      return function () { track.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'transform' }); };
    });

    mm.add('(max-width: 1024px)', function () {
      gsap.fromTo('.room-card', { y: 50, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '#roomsTrack', start: 'top 85%' }
      });
    });

    // hero parallax + fade
    gsap.to('.hero-media img', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-inner', { yPercent: -10, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // ticker: speeds up with scroll velocity and follows scroll direction
    var tick = gsap.to('.ticker-track', { xPercent: -50, repeat: -1, duration: 38, ease: 'none' });
    var speed = 1, target = 1, dir = 1;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) { dir = self.direction; target = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 250, 7)); }
    });
    gsap.ticker.add(function () {
      target += (dir - target) * 0.04;
      speed += (target - speed) * 0.12;
      tick.timeScale(speed);
    });

    // restaurant: widen into full-bleed, giant marquee drifts with scroll
    gsap.fromTo('.dining', { clipPath: 'inset(0% 3% 0% 3% round 36px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.dining', start: 'top bottom', end: 'top 15%', scrub: true }
    });
    gsap.fromTo('.dm-track', { xPercent: 5 }, {
      xPercent: -38, ease: 'none',
      scrollTrigger: { trigger: '.dining', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.fromTo('.gallery', { clipPath: 'inset(0% 3% 0% 3% round 36px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'top 15%', scrub: true }
    });

    // footer wordmark rises
    gsap.fromTo('.f-word span', { yPercent: 45 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
    });
  };

  /* ---------- hero intro ---------- */
  function intro(tl) {
    popup();
    if (!tl) return;
    if (S.lite) {
      gsap.set('.hero-title', { autoAlpha: 1 });
      tl.fromTo(['.hero-title', '.hero-meta', '.hero-side', '.hero-scroll', '.ticker'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power1.out', stagger: 0.1 });
      return;
    }
    var chars = S.split($('.ht-name'), true);
    var the = S.split($('.ht-the'), false);
    gsap.set('.hero-title', { autoAlpha: 1 });
    tl.fromTo('.hero-media img', { scale: 1.28 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
      .fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.06 }, 0.15)
      .fromTo(the, { yPercent: 115 }, { yPercent: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .fromTo(['.hero-meta', '.hero-side', '.hero-scroll', '.ticker'], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1 }, 0.7);
  }

  /* ---------- pop-up: shows assets/images/pop-up/01.jpg once per visit ---------- */
  function popup() {
    if (S.editing) return;
    var KEY = 'dolkar-popup-seen';
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
    S.discover('assets/images/pop-up').then(function (files) {
      if (!files.length) return;
      var img = new Image();
      img.onload = function () { setTimeout(show, 2000); };
      img.src = files[0];
      function busy() {
        return document.documentElement.classList.contains('menu-open') ||
          document.querySelector('.drawer.is-open, .lb.is-open, .preloader');
      }
      function show() {
        if (busy()) { setTimeout(show, 2000); return; }
        try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
        var link = S.wa("Hi, I saw the offer on your website and I'd like to know more.");
        var el = document.createElement('div');
        el.className = 'popup';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Announcement');
        el.innerHTML =
          '<div class="popup-scrim"></div>' +
          '<div class="popup-card">' +
            '<button class="popup-close icon-btn" aria-label="Close">' + icon('close') + '</button>' +
            '<a class="popup-img" href="' + link + '" target="_blank" rel="noopener"><img src="' + esc(files[0]) + '" alt="Current offer at The Dolkar Hotel"></a>' +
            '<a class="btn btn--gold btn--block" href="' + link + '" target="_blank" rel="noopener"><span>Message us on WhatsApp</span>' + icon('arrow-up-right') + '</a>' +
          '</div>';
        document.body.appendChild(el);
        var last = document.activeElement;
        function close() {
          el.classList.remove('is-open');
          document.removeEventListener('keydown', onKey);
          if (S.lenis) S.lenis.start();
          setTimeout(function () { el.remove(); if (last && last.focus) last.focus(); }, 500);
        }
        function onKey(e) { if (e.key === 'Escape') close(); }
        $('.popup-close', el).addEventListener('click', close);
        $('.popup-scrim', el).addEventListener('click', close);
        $$('a', el).forEach(function (a) { a.addEventListener('click', close); });
        document.addEventListener('keydown', onKey);
        if (S.lenis) S.lenis.stop();
        requestAnimationFrame(function () { el.classList.add('is-open'); $('.popup-close', el).focus(); });
      }
    });
  }

  S.discover('assets/images/gallery').then(function (files) {
    renderGallery(files);
    S.start(intro);
    S.hydrateRoomCards(track);
  }, function () { S.start(intro); S.hydrateRoomCards(track); });
})();
