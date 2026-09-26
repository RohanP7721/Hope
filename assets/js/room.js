(function () {
  'use strict';
  var S = window.Site, D = S.data, $ = S.$, $$ = S.$$, esc = S.esc, icon = S.icon, pad = S.pad;

  var slug = new URLSearchParams(location.search).get('r');
  var idx = -1;
  D.rooms.forEach(function (r, i) { if (r.slug === slug) idx = i; });
  if (idx < 0) { location.replace('index.html#rooms'); return; }
  var r = D.rooms[idx];
  var title = S.roomTitle(r);
  var k = 'room.' + r.slug + '.';

  document.title = title + ' — The Dolkar Hotel, Gangtok';
  var md = $('meta[name="description"]');
  if (md) md.setAttribute('content', r.summary + ' From ' + S.inr(r.price) + ' per night at The Dolkar Hotel, Gangtok.');

  /* ---------- header ---------- */
  $('#rpLabel').innerHTML = 'Room ' + pad(idx + 1) + ' / ' + pad(D.rooms.length) + ' · <span data-edit="' + k + 'tier">' + esc(r.tier) + '</span>';
  var h1 = $('#rpTitle');
  h1.innerHTML = '<span data-edit="' + k + 'name">' + esc(r.name) + '</span> <em data-edit="' + k + 'variant">' + esc(r.variant) + '</em>';
  h1.setAttribute('data-intro', '');
  $('#rpPrice').innerHTML = (r.badge ? '<span class="rp-badge" data-edit="' + k + 'badge">' + esc(r.badge) + '</span>' : '') +
    '<span class="rp-from">From</span><b>' + S.inr(r.price) + '</b><span class="rp-per">per night</span>';

  /* ---------- gallery ---------- */
  $('#rpPrev').innerHTML = icon('arrow-left');
  $('#rpNext').innerHTML = icon('arrow');
  $('#rpExpand').insertAdjacentHTML('beforeend', icon('expand'));
  $('.rp-back-ico').innerHTML = icon('arrow-left');

  function buildGallery(files) {
    var imgs = files.map(function (src, i) { return { src: src, alt: title + ' — photo ' + (i + 1) }; });
    var gal = $('.rp-gallery');
    gal.hidden = !imgs.length;
    gal.classList.toggle('is-single', imgs.length < 2);
    var trackEl = $('#rpTrack');
    trackEl.innerHTML = imgs.map(function (im, i) {
      return '<button class="rp-slide" data-i="' + i + '" data-cursor="Expand" aria-label="View photo ' + (i + 1) + ' full screen">' +
        '<img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '"' + (i > 1 ? ' loading="lazy"' : '') + '></button>';
    }).join('');
    $('#rpThumbs').innerHTML = imgs.map(function (im, i) {
      return '<button class="rp-thumb' + (i === 0 ? ' is-active' : '') + '" data-i="' + i + '" aria-label="Show photo ' + (i + 1) + '"><img src="' + esc(im.src) + '" alt="" loading="lazy"></button>';
    }).join('');
    $('#rpAll').textContent = pad(imgs.length);
    function edges(i) {
      $('#rpPrev').disabled = i <= 0;
      $('#rpNext').disabled = i >= imgs.length - 1;
    }

    var thumbs = $$('.rp-thumb');
    function onChange(i) {
      $('#rpNow').textContent = pad(i + 1);
      $('#rpBarFill').style.transform = 'scaleX(' + (i + 1) / imgs.length + ')';
      thumbs.forEach(function (t, n) { t.classList.toggle('is-active', n === i); });
      edges(i);
      var t = thumbs[i];
      if (t) t.parentNode.scrollTo({ left: t.offsetLeft - t.parentNode.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
    }
    var sl = S.slider(trackEl, { onChange: onChange });
    onChange(0);
    $('#rpPrev').addEventListener('click', sl.prev);
    $('#rpNext').addEventListener('click', sl.next);
    $('#rpExpand').addEventListener('click', function () { S.lightbox(imgs, sl.index); });
    trackEl.addEventListener('click', function (e) {
      var s = e.target.closest('.rp-slide');
      if (s) S.lightbox(imgs, +s.getAttribute('data-i'));
    });
    $('#rpThumbs').addEventListener('click', function (e) {
      var t = e.target.closest('.rp-thumb');
      if (t) sl.goTo(+t.getAttribute('data-i'));
    });
    gal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); sl.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); sl.prev(); }
    });
  }

  /* ---------- details ---------- */
  $('#rpSpecs').innerHTML = [
    ['size', r.size + '<small> ft²</small>', 'Floor space', ''],
    ['guests', r.guests + '', 'Guests', ''],
    ['bed', esc(r.beds), 'Bedding', 'beds'],
    ['view', esc(r.view), 'Outlook', 'view']
  ].map(function (s) {
    return '<div class="spec"><span class="spec-icon">' + icon(s[0]) + '</span><strong' + (s[3] ? ' data-edit="' + k + s[3] + '"' : '') + '>' + s[1] + '</strong>' +
      '<small data-edit="room.spec.' + s[0] + '">' + s[2] + '</small></div>';
  }).join('');
  $('#rpLede').innerHTML = esc(r.summary);
  $('#rpLede').setAttribute('data-edit', k + 'summary');
  $('#rpDesc').innerHTML = esc(r.description);
  $('#rpDesc').setAttribute('data-edit', k + 'description');

  $('#rpAmen').innerHTML = (r.amenities || []).map(function (a, i) {
    var p = a.split(':');
    var name = p.length > 1 ? p.shift() : 'arrow';
    return '<li><span class="ra-icon">' + icon(name) + '</span><span data-edit="' + k + 'amen.' + i + '">' + esc(p.join(':')) + '</span></li>';
  }).join('');

  $('#rpPolicies').innerHTML = (D.policies || []).map(function (p, i) {
    return '<details class="acc"' + (i === 0 ? ' open' : '') + '><summary><span data-edit="policy.' + i + '.title">' + esc(p.title) + '</span><i>' + icon('plus') + '</i></summary>' +
      '<div class="acc-body"><p data-edit="policy.' + i + '.text">' + esc(p.text) + '</p></div></details>';
  }).join('');

  /* ---------- booking ---------- */
  $('#bcPrice').innerHTML = '<b>' + S.inr(r.price) + '</b> <span>/ night, starting</span>';
  $('#sbPrice').innerHTML = esc(r.variant) + ' · <b>' + S.inr(r.price) + '</b>';
  S.booking($('#bcForm'), { room: r });

  /* ---------- other rooms ---------- */
  var others = $('#othersTrack');
  others.innerHTML = D.rooms.map(function (o, i) { return o.slug === r.slug ? '' : S.roomCard(o, i); }).join('');
  S.hydrateRoomCards(others);
  $('#oPrev').innerHTML = icon('arrow-left');
  $('#oNext').innerHTML = icon('arrow');
  function step(dir) {
    var card = $('.room-card', others);
    others.scrollBy({ left: dir * (card ? card.offsetWidth + 24 : 400), behavior: 'smooth' });
  }
  $('#oPrev').addEventListener('click', function () { step(-1); });
  $('#oNext').addEventListener('click', function () { step(1); });

  /* ---------- motion ---------- */
  S.afterReveals = function () {
    if (S.lite) return;
    gsap.fromTo('.rp-others .room-card', { x: 120, autoAlpha: 0 }, {
      x: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '#othersTrack', start: 'top 85%' }
    });
    gsap.fromTo('.f-word span', { yPercent: 45 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
    });
  };

  function intro(tl) {
    if (!tl) return;
    if (S.lite) {
      gsap.set(h1, { autoAlpha: 1 });
      tl.fromTo([h1, '.rp-slide', '.rp-ui', '.rp-thumbs'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power1.out', stagger: 0.08 });
      return;
    }
    var words = S.split(h1, false);
    gsap.set(h1, { autoAlpha: 1 });
    tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.07 }, 0.05)
      .fromTo('.rp-slide', { x: 140, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.5, ease: 'expo.out', stagger: 0.08 }, 0.2)
      .fromTo('.rp-slide img', { scale: 1.2 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.2)
      .fromTo(['.rp-ui', '.rp-thumbs'], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.6);
  }

  S.roomPhotos(r).then(function (p) {
    buildGallery(p.all);
    S.start(intro);
  }, function () { buildGallery([]); S.start(intro); });
})();
