/* ============================================================
   Architectural line drawings.
   Each asset class is drawn as an axonometric plate, like an
   architect's presentation sheet: white faces, one deep-blue
   line weight, a dashed site boundary. Faces are filled white
   so hidden lines drop out naturally.
   Every outline carries pathLength="1" so a drawing can be
   "drawn in" with a single stroke-dashoffset transition.
   Drop a photo path into a property's `image` field and the
   site uses that instead.
   ============================================================ */

window.JTArt = (function () {
  var COS = Math.cos(Math.PI / 6);
  var SIN = Math.sin(Math.PI / 6);
  var FACE = { top: '#ffffff', left: '#f3f5fb', right: '#e6ebf7' };
  var TINT = { top: '#eef2fd', left: '#e3e9fa', right: '#d6def5' };

  function project(x, y, z) { return [(x - y) * COS, (x + y) * SIN - z]; }

  function pts(list) {
    return list.map(function (p) {
      var q = project(p[0], p[1], p[2]);
      return q[0].toFixed(1) + ',' + q[1].toFixed(1);
    }).join(' ');
  }

  function poly(list, fill, cls) {
    return '<polygon class="' + (cls || 'ln') + '" pathLength="1" points="' + pts(list) + '" fill="' + fill + '"/>';
  }

  function line(a, b, cls) {
    var p = project(a[0], a[1], a[2]);
    var q = project(b[0], b[1], b[2]);
    return '<line class="' + (cls || 'ln') + '" pathLength="1" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>';
  }

  /* A box standing at height z0 (0 = on the ground). */
  function box(x, y, w, d, h, tone, z0) {
    var t = tone || FACE;
    var z = z0 || 0;
    return poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], t.left) +
           poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], t.right) +
           poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], t.top);
  }

  /* Window bands: thin lines across the two visible faces. */
  function floors(x, y, w, d, h, count) {
    var out = '';
    for (var i = 1; i < count; i++) {
      var z = (h / count) * i;
      out += line([x + 3, y + d, z], [x + w - 3, y + d, z], 'ln fine');
      out += line([x + w, y + 3, z], [x + w, y + d - 3, z], 'ln fine');
    }
    return out;
  }

  /* Vertical mullions on the front faces. */
  function mullions(x, y, w, d, h, cols) {
    var out = '';
    for (var i = 1; i < cols; i++) {
      var fx = x + (w / cols) * i;
      out += line([fx, y + d, 2], [fx, y + d, h - 2], 'ln fine');
    }
    var rows = Math.max(1, Math.round(cols * d / w));
    for (var k = 1; k < rows; k++) {
      var fy = y + (d / rows) * k;
      out += line([x + w, fy, 2], [x + w, fy, h - 2], 'ln fine');
    }
    return out;
  }

  function house(x, y, w, d, h, roof) {
    var r = h + roof;
    return box(x, y, w, d, h) +
      poly([[x + w, y, h], [x + w, y + d, h], [x + w, y + d / 2, r]], FACE.right) +
      poly([[x, y, h], [x + w, y, h], [x + w, y + d / 2, r], [x, y + d / 2, r]], TINT.top) +
      poly([[x, y + d / 2, r], [x + w, y + d / 2, r], [x + w, y + d, h], [x, y + d, h]], TINT.left) +
      poly([[x + w * .58, y + d, 0], [x + w * .8, y + d, 0], [x + w * .8, y + d, h * .62], [x + w * .58, y + d, h * .62]], '#ffffff');
  }

  function tree(x, y, size) {
    var s = size || 1;
    var c = project(x, y, 18 * s);
    return line([x, y, 0], [x, y, 12 * s]) +
      '<circle class="ln" pathLength="1" cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="' + (7 * s).toFixed(1) + '" fill="#ffffff"/>';
  }

  function site(x0, y0, x1, y1) {
    return poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'none', 'ln site');
  }

  var scenes = {
    medical: function () {
      return site(-6, -4, 104, 92) +
        box(20, 8, 42, 40, 84) + floors(20, 8, 42, 40, 84, 7) +
        box(36, 26, 12, 4, 8, TINT, 84) + box(40, 22, 4, 12, 8, TINT, 84) +
        box(6, 34, 76, 40, 22) + mullions(6, 34, 76, 40, 22, 8) +
        tree(92, 82, .8);
    },
    retail: function () {
      var out = site(-6, -4, 122, 84) + box(96, 2, 10, 10, 50, TINT) + box(2, 28, 112, 36, 26) + mullions(2, 28, 112, 36, 26, 8);
      for (var i = 0; i < 6; i++) {
        var ax = 6 + i * 18;
        out += poly([[ax, 64, 20], [ax + 14, 64, 20], [ax + 14, 72, 15], [ax, 72, 15]], TINT.top);
      }
      return out + tree(12, 80, .8) + tree(108, 78, .8);
    },
    business: function () {
      return site(-6, -6, 116, 90) +
        box(8, 4, 46, 34, 42) + floors(8, 4, 46, 34, 42, 4) +
        box(64, 4, 42, 34, 32) + floors(64, 4, 42, 34, 32, 3) +
        box(0, 50, 50, 30, 30) + floors(0, 50, 50, 30, 30, 3) +
        box(58, 50, 50, 30, 22) + floors(58, 50, 50, 30, 22, 2);
    },
    fuel: function () {
      return site(-8, -2, 106, 96) +
        box(58, 6, 44, 34, 28) + mullions(58, 6, 44, 34, 28, 4) +
        box(6, 48, 3, 3, 34) + box(40, 48, 3, 3, 34) + box(6, 80, 3, 3, 34) + box(40, 80, 3, 3, 34) +
        box(18, 60, 8, 6, 14, TINT) +
        box(0, 42, 50, 48, 5, TINT, 34);
    },
    homes: function () {
      return site(-6, -4, 116, 88) +
        tree(100, 18, .8) +
        house(20, 6, 30, 28, 22, 14) + house(60, 6, 30, 28, 22, 14) +
        house(0, 50, 30, 28, 22, 14) + house(40, 50, 30, 28, 22, 14) + house(80, 50, 30, 28, 22, 14);
    },
    daycare: function () {
      return site(-6, -4, 108, 84) +
        tree(92, 10, .8) +
        house(8, 18, 62, 42, 26, 18) +
        box(80, 30, 14, 14, 18) + box(80, 58, 14, 14, 10, TINT) +
        tree(20, 74, .8);
    },
    /* The hero plate: one site holding every asset class. */
    hero: function () {
      return site(-20, -20, 236, 196) +
        line([-20, 88, 0], [236, 88, 0], 'ln site') + line([108, -20, 0], [108, 196, 0], 'ln site') +
        /* medical tower, back left */
        box(18, -6, 40, 38, 118) + floors(18, -6, 40, 38, 118, 10) +
        box(34, 10, 10, 4, 8, TINT, 118) + box(37, 7, 4, 10, 8, TINT, 118) +
        box(6, 14, 70, 34, 22) + mullions(6, 14, 70, 34, 22, 7) +
        /* business park, back right */
        box(128, -6, 46, 34, 46) + floors(128, -6, 46, 34, 46, 4) +
        box(184, -6, 40, 34, 32) + floors(184, -6, 40, 34, 32, 3) +
        box(128, 40, 96, 34, 22) + mullions(128, 40, 96, 34, 22, 8) +
        /* retail strip, front left */
        box(0, 104, 96, 34, 24) + mullions(0, 104, 96, 34, 24, 7) +
        poly([[4, 138, 18], [92, 138, 18], [92, 146, 13], [4, 146, 13]], TINT.top) +
        /* homes, front right */
        house(124, 108, 26, 24, 20, 12) + house(160, 108, 26, 24, 20, 12) + house(196, 108, 26, 24, 20, 12) +
        house(142, 150, 26, 24, 20, 12) + house(178, 150, 26, 24, 20, 12) +
        tree(4, 172) + tree(30, 180) + tree(60, 176) + tree(226, 182, .9) + tree(112, 186, .8);
    }
  };

  var VIEW = {
    hero: '-198 -136 428 362'
  };

  /* Returns an <svg> string for a property type. */
  function render(type, opts) {
    var o = opts || {};
    var scene = scenes[type] || scenes.business;
    return '<svg class="plate' + (o.draw ? ' is-drawing' : '') + '" viewBox="' + (VIEW[type] || '-120 -102 240 212') + '" aria-hidden="true" focusable="false">' +
      '<g>' + scene() + '</g></svg>';
  }

  return { render: render };
})();
