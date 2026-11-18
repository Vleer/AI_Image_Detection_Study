/* Placeholder stimulus generator.
   Draws simple flat-vector "scenes" for each of the four categories so the
   full study flow can be run before any real photography exists. Each bucket
   seed produces one scene; the three variants (real / chatgpt / gemini) are
   small perturbations of that same scene, mirroring how the real buckets hold
   three versions of one subject. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  var W = 1200, H = 800;

  /* --------------------------------------------------------------- utils */

  function el(tag, attrs, children) {
    var s = '<' + tag;
    for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      s += ' ' + k + '="' + String(attrs[k]).replace(/"/g, '&quot;') + '"';
    }
    if (children === undefined || children === null || children === '') return s + '/>';
    return s + '>' + children + '</' + tag + '>';
  }

  function hsl(h, s, l) {
    return 'hsl(' + ((h % 360) + 360) % 360 + ' ' + s + '% ' + l + '%)';
  }

  function linearGradient(id, stops, opts) {
    opts = opts || {};
    var body = stops.map(function (st) {
      return el('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] });
    }).join('');
    return el('linearGradient', {
      id: id,
      x1: opts.x1 || '0', y1: opts.y1 || '0',
      x2: opts.x2 || '0', y2: opts.y2 || '1'
    }, body);
  }

  function points(list) {
    return list.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
  }

  function range(n, fn) {
    var out = '';
    for (var i = 0; i < n; i++) out += fn(i);
    return out;
  }

  /* ------------------------------------------------------------- scenes */

  function drawFace(r, p) {
    var skinH = 20 + r() * 22;
    var skinL = 42 + r() * 34 + p.light * 6;
    var hairH = r() < .5 ? 25 + r() * 20 : 200 + r() * 90;
    var hairL = 12 + r() * 30;
    var bgH = p.hue;
    var cx = W / 2 + (r() - .5) * 90;
    var cy = H * 0.46 + (r() - .5) * 40;
    var rx = 150 + r() * 30, ry = 195 + r() * 30;
    var eyeY = cy - ry * 0.12;
    var eyeDx = rx * 0.42;
    var eyeR = 20 + r() * 6;
    var irisH = r.pick([25, 40, 120, 200, 210]);
    var glasses = r() < .28;
    var smile = 0.4 + r() * 1.2;

    var defs = el('defs', null,
      linearGradient('bg', [['0', hsl(bgH, 30 + p.sat * 10, 26 + p.light * 8)], ['1', hsl(bgH + 30, 26, 14)]]) +
      linearGradient('skin', [['0', hsl(skinH, 40 + p.sat * 8, skinL)], ['1', hsl(skinH - 6, 38, skinL - 12)]]) +
      el('radialGradient', { id: 'vig', cx: '.5', cy: '.45', r: '.75' },
        el('stop', { offset: '.55', 'stop-color': '#000', 'stop-opacity': '0' }) +
        el('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '.45' }))
    );

    var eye = function (dir) {
      var ex = cx + dir * eyeDx;
      return el('ellipse', { cx: ex, cy: eyeY, rx: eyeR * 1.5, ry: eyeR, fill: '#f6f2ee' }) +
        el('circle', { cx: ex + dir * 2, cy: eyeY, r: eyeR * 0.62, fill: hsl(irisH, 45, 34) }) +
        el('circle', { cx: ex + dir * 2, cy: eyeY, r: eyeR * 0.3, fill: '#12100f' }) +
        el('circle', { cx: ex + dir * 2 - 5, cy: eyeY - 6, r: eyeR * 0.15, fill: '#fff', opacity: '.9' }) +
        el('path', {
          d: 'M' + (ex - eyeR * 1.7) + ',' + (eyeY - eyeR * 1.9) +
             ' q' + (eyeR * 1.7) + ',' + (-eyeR * 0.75) + ' ' + (eyeR * 3.4) + ',0',
          stroke: hsl(hairH, 30, Math.max(10, hairL - 4)), 'stroke-width': 9,
          fill: 'none', 'stroke-linecap': 'round'
        });
    };

    return defs +
      el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
      // shoulders
      el('path', {
        d: 'M' + (cx - 330) + ',' + H + ' q' + 60 + ',' + (-210) + ' ' + 330 + ',' + (-210) +
           ' q' + 270 + ',0 ' + 330 + ',' + 210 + ' Z',
        fill: hsl(bgH + 180, 25 + p.sat * 12, 30 + p.light * 5)
      }) +
      // neck
      el('rect', { x: cx - 52, y: cy + ry * 0.55, width: 104, height: 170, rx: 40, fill: hsl(skinH - 4, 38, skinL - 14) }) +
      // ears
      el('ellipse', { cx: cx - rx * 0.97, cy: cy + 10, rx: 26, ry: 42, fill: hsl(skinH, 38, skinL - 6) }) +
      el('ellipse', { cx: cx + rx * 0.97, cy: cy + 10, rx: 26, ry: 42, fill: hsl(skinH, 38, skinL - 6) }) +
      // head
      el('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: 'url(#skin)' }) +
      // hair
      el('path', {
        d: 'M' + (cx - rx * 1.06) + ',' + (cy - ry * 0.1) +
           ' a' + (rx * 1.06) + ',' + (ry * 1.02) + ' 0 0 1 ' + (rx * 2.12) + ',0' +
           ' q' + (-rx * 0.25) + ',' + (-ry * 0.42) + ' ' + (-rx * 1.06) + ',' + (-ry * 0.34) +
           ' q' + (-rx * 0.8) + ',' + (-ry * 0.08) + ' ' + (-rx * 1.06) + ',' + (ry * 0.34) + ' Z',
        fill: hsl(hairH, 32, hairL)
      }) +
      eye(-1) + eye(1) +
      // nose
      el('path', {
        d: 'M' + cx + ',' + (cy + 8) + ' q' + 16 + ',' + 52 + ' ' + (-6) + ',' + 62,
        stroke: hsl(skinH - 8, 34, skinL - 18), 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round'
      }) +
      // mouth
      el('path', {
        d: 'M' + (cx - 52) + ',' + (cy + ry * 0.48) + ' q' + 52 + ',' + (26 * smile) + ' ' + 104 + ',0',
        stroke: hsl(5, 45, 42), 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round'
      }) +
      (glasses
        ? el('g', { fill: 'none', stroke: hsl(bgH + 200, 20, 78), 'stroke-width': 6, opacity: '.85' },
            el('circle', { cx: cx - eyeDx, cy: eyeY, r: eyeR * 1.9 }) +
            el('circle', { cx: cx + eyeDx, cy: eyeY, r: eyeR * 1.9 }) +
            el('path', { d: 'M' + (cx - eyeDx + eyeR * 1.9) + ',' + eyeY + ' H' + (cx + eyeDx - eyeR * 1.9) }))
        : '') +
      el('rect', { width: W, height: H, fill: 'url(#vig)' });
  }

  function drawLandscape(r, p) {
    var skyH = 190 + (r() - .5) * 60 + p.hue * 0.05;
    var golden = r() < .4;
    var horizon = H * (0.52 + r() * 0.14);
    var sunX = W * (0.15 + r() * 0.7);
    var sunY = horizon - 60 - r() * 200;
    var water = r() < .45;

    var defs = el('defs', null,
      linearGradient('sky', golden
        ? [['0', hsl(skyH + 20, 55, 32)], ['.55', hsl(28, 70, 58)], ['1', hsl(14, 78, 66)]]
        : [['0', hsl(skyH, 58 + p.sat * 8, 30 + p.light * 6)], ['1', hsl(skyH - 30, 45, 72)]]) +
      linearGradient('ground', [['0', hsl(110 + p.hue * .04, 32, 30)], ['1', hsl(120, 28, 14)]]) +
      linearGradient('water', [['0', hsl(skyH, 45, 46)], ['1', hsl(skyH + 10, 40, 26)]]) +
      el('radialGradient', { id: 'glow', cx: '.5', cy: '.5', r: '.5' },
        el('stop', { offset: '0', 'stop-color': '#fff6d8', 'stop-opacity': '.95' }) +
        el('stop', { offset: '1', 'stop-color': '#fff6d8', 'stop-opacity': '0' }))
    );

    function ridge(baseY, amp, segs, fill, op) {
      var pts = [[0, H]];
      for (var i = 0; i <= segs; i++) {
        var x = (W / segs) * i;
        var y = baseY - Math.abs(Math.sin(i * (1.1 + r() * .5)) * amp) - r() * amp * .5;
        pts.push([x, y]);
      }
      pts.push([W, H]);
      return el('polygon', { points: points(pts), fill: fill, opacity: op });
    }

    function tree(x, y, s, hue) {
      return el('g', null,
        el('rect', { x: x - 4 * s, y: y - 26 * s, width: 8 * s, height: 30 * s, fill: hsl(28, 30, 18) }) +
        el('polygon', { points: points([[x, y - 90 * s], [x - 30 * s, y - 18 * s], [x + 30 * s, y - 18 * s]]), fill: hsl(hue, 34, 22) }) +
        el('polygon', { points: points([[x, y - 116 * s], [x - 24 * s, y - 52 * s], [x + 24 * s, y - 52 * s]]), fill: hsl(hue, 36, 27) })
      );
    }

    function cloud(x, y, s, op) {
      return el('g', { opacity: op, fill: '#fff' },
        el('ellipse', { cx: x, cy: y, rx: 70 * s, ry: 26 * s }) +
        el('ellipse', { cx: x - 52 * s, cy: y + 10 * s, rx: 46 * s, ry: 20 * s }) +
        el('ellipse', { cx: x + 58 * s, cy: y + 8 * s, rx: 50 * s, ry: 22 * s }));
    }

    var trees = '';
    var nTrees = 3 + r.int(7);
    for (var i = 0; i < nTrees; i++) {
      var tx = r() * W;
      var ty = horizon + 40 + r() * (H - horizon - 40);
      var ts = 0.6 + (ty - horizon) / (H - horizon) * 1.3;
      trees += tree(tx, ty, ts, 120 + r() * 30);
    }

    return defs +
      el('rect', { width: W, height: H, fill: 'url(#sky)' }) +
      el('circle', { cx: sunX, cy: sunY, r: 190, fill: 'url(#glow)' }) +
      el('circle', { cx: sunX, cy: sunY, r: 42 + r() * 18, fill: golden ? '#ffe9a8' : '#fffdf2', opacity: '.95' }) +
      range(2 + r.int(4), function () { return cloud(r() * W, 60 + r() * (horizon - 140), .6 + r() * .9, .18 + r() * .35); }) +
      ridge(horizon + 10, 150 + r() * 90, 7, hsl(skyH - 10, 22, 44), '.55') +
      ridge(horizon + 30, 110 + r() * 70, 9, hsl(skyH - 20, 20, 32), '.8') +
      (water
        ? el('rect', { x: 0, y: horizon, width: W, height: H - horizon, fill: 'url(#water)' }) +
          range(9, function (i) {
            return el('rect', {
              x: r() * W * .8, y: horizon + 18 + i * ((H - horizon) / 10),
              width: 60 + r() * 220, height: 3, rx: 2, fill: '#fff', opacity: (.06 + r() * .12).toFixed(2)
            });
          })
        : el('rect', { x: 0, y: horizon, width: W, height: H - horizon, fill: 'url(#ground)' }) + trees) +
      el('rect', { width: W, height: H, fill: 'none' });
  }

  function drawInterior(r, p) {
    var wallH = 30 + r() * 30 + p.hue * 0.02;
    var wallL = 60 + r() * 22 + p.light * 5;
    var floorY = H * (0.62 + r() * 0.08);
    var sofaH = r.pick([210, 15, 150, 35, 265]);
    var winX = W * (0.06 + r() * 0.12);
    var winW = W * (0.22 + r() * 0.1);

    var defs = el('defs', null,
      linearGradient('wall', [['0', hsl(wallH, 16 + p.sat * 6, wallL)], ['1', hsl(wallH, 14, wallL - 14)]]) +
      linearGradient('floor', [['0', hsl(28, 34, 34)], ['1', hsl(26, 30, 22)]]) +
      linearGradient('win', [['0', hsl(200, 60, 78)], ['1', hsl(190, 45, 58)]]) +
      el('radialGradient', { id: 'lampglow', cx: '.5', cy: '.5', r: '.5' },
        el('stop', { offset: '0', 'stop-color': '#ffe6ae', 'stop-opacity': '.55' }) +
        el('stop', { offset: '1', 'stop-color': '#ffe6ae', 'stop-opacity': '0' }))
    );

    var lampX = W * (0.82 + r() * 0.08);

    return defs +
      el('rect', { width: W, height: H, fill: 'url(#wall)' }) +
      el('rect', { x: 0, y: floorY, width: W, height: H - floorY, fill: 'url(#floor)' }) +
      // floorboards
      range(7, function (i) {
        return el('path', {
          d: 'M' + (W * (i / 7) - 120) + ',' + H + ' L' + (W * 0.2 + W * 0.6 * (i / 7)) + ',' + floorY,
          stroke: '#000', 'stroke-width': 2, opacity: '.12', fill: 'none'
        });
      }) +
      // window
      el('g', null,
        el('rect', { x: winX, y: H * 0.12, width: winW, height: H * 0.42, rx: 6, fill: 'url(#win)' }) +
        el('rect', { x: winX, y: H * 0.12, width: winW, height: H * 0.42, rx: 6, fill: 'none', stroke: hsl(wallH, 10, 92), 'stroke-width': 12 }) +
        el('line', { x1: winX + winW / 2, y1: H * 0.12, x2: winX + winW / 2, y2: H * 0.54, stroke: hsl(wallH, 10, 92), 'stroke-width': 10 }) +
        el('line', { x1: winX, y1: H * 0.33, x2: winX + winW, y2: H * 0.33, stroke: hsl(wallH, 10, 92), 'stroke-width': 10 })
      ) +
      // wall art
      el('rect', { x: W * 0.56, y: H * 0.16, width: W * 0.16, height: H * 0.2, fill: hsl(wallH + 160, 30, 40), stroke: hsl(30, 25, 22), 'stroke-width': 10 }) +
      // rug
      el('ellipse', { cx: W * 0.5, cy: floorY + (H - floorY) * 0.62, rx: W * 0.3, ry: (H - floorY) * 0.36, fill: hsl(sofaH + 30, 24, 34), opacity: '.75' }) +
      // sofa
      el('g', null,
        el('rect', { x: W * 0.28, y: floorY - 150, width: W * 0.42, height: 120, rx: 22, fill: hsl(sofaH, 30 + p.sat * 8, 42) }) +
        el('rect', { x: W * 0.28, y: floorY - 60, width: W * 0.42, height: 62, rx: 18, fill: hsl(sofaH, 32, 34) }) +
        el('rect', { x: W * 0.265, y: floorY - 120, width: 42, height: 122, rx: 18, fill: hsl(sofaH, 28, 37) }) +
        el('rect', { x: W * 0.695, y: floorY - 120, width: 42, height: 122, rx: 18, fill: hsl(sofaH, 28, 37) }) +
        el('rect', { x: W * 0.33, y: floorY - 132, width: 82, height: 78, rx: 14, fill: hsl(sofaH + 40, 34, 52), transform: 'rotate(-8 ' + (W * 0.33 + 41) + ' ' + (floorY - 93) + ')' }) +
        el('rect', { x: W * 0.57, y: floorY - 132, width: 82, height: 78, rx: 14, fill: hsl(sofaH - 40, 30, 48), transform: 'rotate(7 ' + (W * 0.57 + 41) + ' ' + (floorY - 93) + ')' })
      ) +
      // plant
      el('g', null,
        el('path', { d: 'M' + (W * 0.16) + ',' + floorY + ' l30,90 h-84 Z', fill: hsl(20, 40, 42) }) +
        range(6, function (i) {
          var a = -110 + i * 26 + r() * 12;
          return el('ellipse', {
            cx: W * 0.145, cy: floorY - 70, rx: 15, ry: 62,
            fill: hsl(130 + r() * 25, 34, 26 + r() * 12),
            transform: 'rotate(' + a + ' ' + (W * 0.145) + ' ' + floorY + ')'
          });
        })
      ) +
      // floor lamp
      el('g', null,
        el('circle', { cx: lampX, cy: floorY - 300, r: 210, fill: 'url(#lampglow)' }) +
        el('rect', { x: lampX - 4, y: floorY - 300, width: 8, height: 300, fill: hsl(40, 15, 30) }) +
        el('ellipse', { cx: lampX, cy: floorY + 4, rx: 46, ry: 12, fill: hsl(40, 15, 26) }) +
        el('polygon', { points: points([[lampX - 62, floorY - 300], [lampX + 62, floorY - 300], [lampX + 42, floorY - 384], [lampX - 42, floorY - 384]]), fill: hsl(42, 55, 74) })
      ) +
      el('rect', { width: W, height: H, fill: '#000', opacity: (0.04 + r() * 0.06).toFixed(3) });
  }

  function drawObject(r, p) {
    var kind = r.int(4);
    var bgH = p.hue;
    var objH = (p.hue + 120 + r() * 160) % 360;
    var tableY = H * (0.68 + r() * 0.06);
    var cx = W / 2 + (r() - .5) * 120;

    var defs = el('defs', null,
      el('radialGradient', { id: 'bg', cx: '.5', cy: '.35', r: '.8' },
        el('stop', { offset: '0', 'stop-color': hsl(bgH, 22 + p.sat * 8, 46 + p.light * 6) }) +
        el('stop', { offset: '1', 'stop-color': hsl(bgH + 20, 20, 18) })) +
      linearGradient('table', [['0', hsl(30, 28, 40)], ['1', hsl(28, 26, 26)]]) +
      linearGradient('obj', [['0', hsl(objH, 48 + p.sat * 10, 58)], ['1', hsl(objH - 12, 44, 32)]],
        { x1: '0', y1: '0', x2: '1', y2: '1' })
    );

    var body;
    if (kind === 0) {          // vase
      var vh = 240 + r() * 120;
      body = el('path', {
        d: 'M' + (cx - 46) + ',' + (tableY - vh) +
           ' q' + (-14) + ',' + (vh * 0.34) + ' ' + 22 + ',' + (vh * 0.52) +
           ' q' + 26 + ',' + (vh * 0.2) + ' ' + 48 + ',0' +
           ' q' + 36 + ',' + (-vh * 0.18) + ' ' + 22 + ',' + (-vh * 0.52) + ' Z',
        fill: 'url(#obj)'
      }) + el('ellipse', { cx: cx, cy: tableY - vh, rx: 47, ry: 12, fill: hsl(objH, 40, 26) });
    } else if (kind === 1) {   // mug
      var mh = 170 + r() * 60;
      body = el('rect', { x: cx - 78, y: tableY - mh, width: 156, height: mh, rx: 16, fill: 'url(#obj)' }) +
        el('ellipse', { cx: cx, cy: tableY - mh, rx: 78, ry: 20, fill: hsl(objH, 30, 82) }) +
        el('path', {
          d: 'M' + (cx + 78) + ',' + (tableY - mh * 0.72) + ' q' + 76 + ',' + (mh * 0.22) + ' 0,' + (mh * 0.44),
          fill: 'none', stroke: hsl(objH, 44, 46), 'stroke-width': 26, 'stroke-linecap': 'round'
        });
    } else if (kind === 2) {   // stacked books
      body = range(3 + r.int(3), function (i) {
        var w = 230 - i * 22 + r() * 30, hgt = 34 + r() * 14;
        return el('rect', {
          x: cx - w / 2 + (r() - .5) * 26, y: tableY - (i + 1) * (hgt + 4),
          width: w, height: hgt, rx: 5,
          fill: hsl((objH + i * 48) % 360, 42, 40 + i * 5)
        });
      });
    } else {                   // chair
      body = el('g', null,
        el('rect', { x: cx - 110, y: tableY - 130, width: 220, height: 26, rx: 8, fill: 'url(#obj)' }) +
        el('rect', { x: cx - 106, y: tableY - 320, width: 26, height: 200, rx: 8, fill: hsl(objH, 40, 40) }) +
        el('rect', { x: cx + 80, y: tableY - 320, width: 26, height: 200, rx: 8, fill: hsl(objH, 40, 40) }) +
        el('rect', { x: cx - 106, y: tableY - 288, width: 212, height: 22, rx: 8, fill: hsl(objH, 44, 48) }) +
        el('rect', { x: cx - 96, y: tableY - 104, width: 20, height: 104, fill: hsl(objH, 36, 32) }) +
        el('rect', { x: cx + 76, y: tableY - 104, width: 20, height: 104, fill: hsl(objH, 36, 32) })
      );
    }

    return defs +
      el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
      el('rect', { x: 0, y: tableY, width: W, height: H - tableY, fill: 'url(#table)' }) +
      el('ellipse', { cx: cx + 20, cy: tableY + 14, rx: 200, ry: 26, fill: '#000', opacity: '.3' }) +
      body;
  }

  var PAINTERS = {
    faces: drawFace,
    landscape: drawLandscape,
    interior: drawInterior,
    object: drawObject
  };

  /* --------------------------------------------------------------- build */

  // Variants nudge palette/lighting slightly so the three versions of a bucket
  // look like the same scene rendered three ways.
  var VARIANT_TWEAK = {
    real:    { hue: 0,  sat: 0,   light: 0 },
    chatgpt: { hue: 14, sat: 0.8, light: 0.7 },
    gemini:  { hue: -12, sat: 0.5, light: 1.1 }
  };

  /**
   * @param {string} category one of faces|landscape|interior|object
   * @param {number|string} bucketSeed stable per bucket
   * @param {string} variant real|chatgpt|gemini
   * @returns {string} an SVG data URI
   */
  function makeImage(category, bucketSeed, variant) {
    var painter = PAINTERS[category] || drawObject;
    // Orientation: landscapes/interiors 3:2, faces/objects 2:3.
    var portrait = (category === 'faces' || category === 'object');
    W = portrait ? 800 : 1200;
    H = portrait ? 1200 : 800;

    // Same seed for all variants -> same underlying scene geometry.
    var r = RAI.rng.make('scene:' + category + ':' + bucketSeed);
    var base = r() * 360;
    var tweak = VARIANT_TWEAK[variant] || VARIANT_TWEAK.real;
    var p = { hue: base + tweak.hue, sat: tweak.sat, light: tweak.light };

    var inner = painter(r, p);
    if (portrait) {
      // Rotate the landscape scene to fill the portrait canvas.
      inner = '<g transform="translate(' + W + ',0) rotate(90)">' + inner + '</g>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
      inner +
      (RAI.config && RAI.config.debug
        ? el('text', { x: 18, y: 40, fill: '#fff', 'font-size': 28, 'font-family': 'monospace', opacity: '.85' },
            variant + ' #' + bucketSeed)
        : '') +
      '</svg>';

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  RAI.dummyImages = { make: makeImage, width: W, height: H };
})(window);
