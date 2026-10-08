/* ============================================================
   HOME — scroll animation
   1. Hero: headline rises in on load; the photo opens out to
      full width and settles as you scroll past it.
   2. Smart Real Estate: the photo on the left stays put and
      changes as Buy, Value Add and Manage, Sell pass by.
   3. Portfolio sentence lights up word by word as you read.
   4. "2X" grows into place.
   Everything shows at once with reduced motion or no JS.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var hasGsap = !!(gsap && window.ScrollTrigger);

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- reveals: .rise and .clip ---------- */
  function initReveals() {
    var items = $$('.rise, .clip');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 1. hero ---------- */
  function initHero() {
    if (reduceMotion || !hasGsap) return;
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.from('.h-hero h1 .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
    gsap.from('.h-hero .intro-fade', { opacity: 0, y: 24, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.4 });

    var frame = $('.h-hero-media .ph');
    gsap.fromTo(frame,
      { clipPath: 'inset(0% 7% 0% 7% round 28px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top 85%', end: 'top 25%', scrub: true } });
    gsap.fromTo($('img', frame),
      { scale: 1.18 },
      { scale: 1, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- 2. stages ---------- */
  function initStages() {
    var stages = $$('.stage');
    var frames = $$('.stages-frame .ph');
    var dots = $$('.stages-dots i');
    if (!stages.length || !('IntersectionObserver' in window)) return;
    var set = function (i) {
      stages.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      frames.forEach(function (f, k) { f.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) set(stages.indexOf(en.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    stages.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 3. word-by-word statement ---------- */
  function initWords() {
    var el = $('[data-words]');
    if (!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    var spans = $$('.w', el);
    if (reduceMotion || !hasGsap) { spans.forEach(function (s) { s.classList.add('lit'); }); return; }
    window.ScrollTrigger.create({
      trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * spans.length);
        spans.forEach(function (s, i) { s.classList.toggle('lit', i < n); });
      }
    });
  }

  /* ---------- 4. 2X ---------- */
  function initTarget() {
    if (reduceMotion || !hasGsap) return;
    gsap.fromTo('.h-target .big',
      { scale: 0.55, opacity: 0.15 },
      { scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.h-target', start: 'top 90%', end: 'center 55%', scrub: true } });
  }

  initReveals();
  initHero();
  initStages();
  initWords();
  initTarget();
  if (hasGsap) window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
