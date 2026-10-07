/* ============================================================
   Isometric property art.
   Each asset class gets a small 3D scene drawn as SVG, so cards
   look like objects rather than empty boxes until real photos
   arrive. Drop a photo path into a property's `image` field and
   the card uses that instead.
   ============================================================ */

window.JTArt = (function () {
  var COS = Math.cos(Math.PI / 6);
  var SIN = Math.sin(Math.PI / 6);
  var uid = 0;

  function project(x, y, z) {
    return [(x - y) * COS, (x + y) * SIN - z];
  }

  function pts(list) {
    return list.map(function (p) {
      var q = project(p[0], p[1], p[2]);
      return q[0].toFixed(1) + ',' + q[1].toFixed(1);
    }).join(' ');
  }

  /* One box: x, y = footprint origin; w (x-axis), d (y-axis), h (height). */
  function box(x, y, w, d, h, tone) {
    var t = tone || {};
    var top   = [[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]];
    var left  = [[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]];
    var right = [[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]];
    return '<polygon points="' + pts(left)  + '" fill="' + (t.left  || 'url(#L)') + '"/>' +
           '<polygon points="' + pts(right) + '" fill="' + (t.right || 'url(#R)') + '"/>' +
           '<polygon points="' + pts(top)   + '" fill="' + (t.top   || 'url(#T)') + '"/>';
  }

  /* Rows of windows on the two visible faces. */
  function windows(x, y, w, d, h, rows, cols) {
    var out = '';
    var gapZ = h / (rows + 1);
    for (var r = 1; r <= rows; r++) {
      var z = r * gapZ;
      for (var c = 0; c < cols; c++) {
        var fx = x + (w / cols) * (c + 0.25);
        out += '<polygon points="' + pts([[fx, y + d, z], [fx + w / cols * 0.5, y + d, z], [fx + w / cols * 0.5, y + d, z + gapZ * 0.45], [fx, y + d, z + gapZ * 0.45]]) + '" fill="rgba(170,215,255,.55)"/>';
      }
      for (var k = 0; k < Math.max(1, Math.round(cols * d / w)); k++) {
        var fy = y + (d / Math.max(1, Math.round(cols * d / w))) * (k + 0.25);
        var seg = d / Math.max(1, Math.round(cols * d / w)) * 0.5;
        out += '<polygon points="' + pts([[x + w, fy, z], [x + w, fy + seg, z], [x + w, fy + seg, z + gapZ * 0.45], [x + w, fy, z + gapZ * 0.45]]) + '" fill="rgba(120,170,255,.35)"/>';
      }
    }
    return out;
  }

  function gableHouse(x, y, w, d, h, roof) {
    var ridge = h + roof;
    var leftRoof  = [[x, y + d / 2, ridge], [x + w, y + d / 2, ridge], [x + w, y + d, h], [x, y + d, h]];
    var rightGable = [[x + w, y, h], [x + w, y + d, h], [x + w, y + d / 2, ridge]];
    return box(x, y, w, d, h) +
      '<polygon points="' + pts(rightGable) + '" fill="url(#R)"/>' +
      '<polygon points="' + pts(leftRoof) + '" fill="#ffb547"/>' +
      '<polygon points="' + pts([[x, y, h], [x + w, y, h], [x + w, y + d / 2, ridge], [x, y + d / 2, ridge]]) + '" fill="#ffcf7d"/>' +
      '<polygon points="' + pts([[x + w * .55, y + d, 0], [x + w * .8, y + d, 0], [x + w * .8, y + d, h * .6], [x + w * .55, y + d, h * .6]]) + '" fill="rgba(5,11,46,.55)"/>';
  }

  function ground(size) {
    return '<polygon points="' + pts([[-size * .1, -size * .1, 0], [size, -size * .1, 0], [size, size, 0], [-size * .1, size, 0]]) + '" fill="url(#G)" opacity=".9"/>';
  }

  var scenes = {
    medical: function () {
      return ground(120) +
        box(10, 30, 70, 40, 24) + windows(10, 30, 70, 40, 24, 1, 6) +
        box(20, 10, 40, 40, 78) + windows(20, 10, 40, 40, 78, 5, 3) +
        /* rooftop cross */
        box(34, 24, 12, 4, 92, { top: '#fff', left: '#e9f2ff', right: '#c7d7ff' }) +
        box(38, 20, 4, 12, 92, { top: '#fff', left: '#e9f2ff', right: '#c7d7ff' });
    },
    retail: function () {
      var out = ground(130) + box(0, 30, 110, 34, 26) + windows(0, 30, 110, 34, 26, 1, 7);
      for (var i = 0; i < 5; i++) {
        var ax = 4 + i * 21;
        out += '<polygon points="' + pts([[ax, 64, 20], [ax + 17, 64, 20], [ax + 17, 74, 14], [ax, 74, 14]]) + '" fill="' + (i % 2 ? '#ffb547' : '#5ee7ff') + '"/>';
      }
      return out + box(84, 2, 10, 10, 48, { top: '#ffb547', left: '#e0952d', right: '#c47c1c' });
    },
    business: function () {
      return ground(130) +
        box(0, 50, 50, 30, 30) + windows(0, 50, 50, 30, 30, 2, 4) +
        box(58, 50, 50, 30, 22) + windows(58, 50, 50, 30, 22, 1, 4) +
        box(10, 6, 44, 34, 40) + windows(10, 6, 44, 34, 40, 3, 4) +
        box(64, 6, 40, 34, 30) + windows(64, 6, 40, 34, 30, 2, 3);
    },
    homes: function () {
      return ground(130) +
        gableHouse(0, 50, 30, 28, 22, 14) +
        gableHouse(40, 50, 30, 28, 22, 14) +
        gableHouse(80, 50, 30, 28, 22, 14) +
        gableHouse(20, 6, 30, 28, 22, 14) +
        gableHouse(60, 6, 30, 28, 22, 14);
    },
    daycare: function () {
      return ground(120) +
        gableHouse(10, 20, 60, 40, 28, 18) +
        box(80, 60, 14, 14, 14, { top: '#5ee7ff', left: '#2bb8d8', right: '#1a8fb0' }) +
        box(80, 30, 14, 14, 22, { top: '#ffb547', left: '#e0952d', right: '#c47c1c' });
    }
  };

  /* Gas station: the canopy floats on four posts, so it is drawn at z = 34. */
  scenes.fuel = function () {
    function raised(x, y, w, d, h, z, tone) {
      var top   = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
      var left  = [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]];
      var right = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
      return '<polygon points="' + pts(left) + '" fill="' + tone.left + '"/>' +
             '<polygon points="' + pts(right) + '" fill="' + tone.right + '"/>' +
             '<polygon points="' + pts(top) + '" fill="' + tone.top + '"/>';
    }
    var amber = { top: '#ffcf7d', left: '#ffb547', right: '#e0952d' };
    return ground(120) +
      box(58, 6, 44, 34, 28) + windows(58, 6, 44, 34, 28, 1, 4) +
      box(6, 48, 4, 4, 34) + box(38, 48, 4, 4, 34) + box(6, 80, 4, 4, 34) + box(38, 80, 4, 4, 34) +
      box(16, 60, 8, 6, 14, { top: '#5ee7ff', left: '#2bb8d8', right: '#1a8fb0' }) +
      raised(0, 42, 50, 48, 6, 34, amber);
  };

  function defs(id) {
    return '<defs>' +
      '<linearGradient id="T' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb8ff"/><stop offset="1" stop-color="#6d8cff"/></linearGradient>' +
      '<linearGradient id="L' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d63ff"/><stop offset="1" stop-color="#1d3bd6"/></linearGradient>' +
      '<linearGradient id="R' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b33b8"/><stop offset="1" stop-color="#0b1a7a"/></linearGradient>' +
      '<radialGradient id="G' + id + '" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="rgba(94,231,255,.28)"/><stop offset="1" stop-color="rgba(94,231,255,0)"/></radialGradient>' +
      '</defs>';
  }

  /* Returns an <svg> string for a property type. */
  function render(type) {
    var id = 'a' + (++uid);
    var body = (scenes[type] || scenes.business)()
      .replace(/url\(#T\)/g, 'url(#T' + id + ')')
      .replace(/url\(#L\)/g, 'url(#L' + id + ')')
      .replace(/url\(#R\)/g, 'url(#R' + id + ')')
      .replace(/url\(#G\)/g, 'url(#G' + id + ')');
    return '<svg class="iso" viewBox="-120 -110 240 200" aria-hidden="true" focusable="false">' +
      defs(id) + '<g class="iso-g">' + body + '</g></svg>';
  }

  return { render: render };
})();
