/* views2.js — tones, character writer, dialogues, phrasebook, progress, settings */
(function () {
  var MMS = window.MMS, Store = MMS.Store;
  var esc = MMS.esc;
  var V = MMS.views;
  var UI = MMS.App.ui = MMS.App.ui || { showPy: true, showEn: true, phraseGroup: 'all' };

  function header(title, sub) {
    return '<header class="screen-head"><h1>' + esc(title) + '</h1>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</header>';
  }
  function playSVG() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9a4 4 0 010 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }
  function playBtn(text, cls) {
    return '<button class="play-btn ' + (cls || '') + '" data-say="' + esc(text) + '" aria-label="Play audio">' + playSVG() + '</button>';
  }

  /* mini contour chart for one tone */
  function contourHTML(points, w, h, label) {
    w = w || 150; h = h || 96;
    var padL = 14, padR = 8, padT = 8, padB = 14;
    var innerW = w - padL - padR, innerH = h - padT - padB;
    function x(i) { return padL + (points.length === 1 ? innerW / 2 : innerW * (i / (points.length - 1))); }
    function y(p) { return padT + innerH * (1 - (p - 1) / 4); }
    var grid = '';
    for (var p = 1; p <= 5; p++) {
      grid += '<line class="grid" x1="' + padL + '" y1="' + y(p).toFixed(1) + '" x2="' + (w - padR) + '" y2="' + y(p).toFixed(1) + '"/>';
    }
    var d = points.map(function (pt, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(pt).toFixed(1); }).join(' ');
    var dots = points.map(function (pt, i) {
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(pt).toFixed(1) + '" r="2.6" fill="#5fd3ac"/>';
    }).join('');
    return '<svg class="contour" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Pitch contour: ' + esc(label || '') + '">' +
      grid +
      '<text class="axis" x="2" y="' + (y(5) + 3).toFixed(1) + '">5</text>' +
      '<text class="axis" x="2" y="' + (y(1) + 3).toFixed(1) + '">1</text>' +
      '<text class="axis" x="' + (w - padR - 2) + '" y="' + (h - 3) + '" text-anchor="end">time →</text>' +
      '<path class="curve" d="' + d + '"/>' + dots + '</svg>';
  }

  /* ================= TONES ================= */
  V.tones = function (main) {
    var has = MMS.Audio.ok();
    var cards = MMS_TONES.map(function (t) {
      return '<div class="tone-card">' +
        '<div class="tc-head"><b>Tone ' + t.n + ' ' + t.mark + '</b><span class="tc-shape" aria-hidden="true">' + t.shape + '</span></div>' +
        contourHTML(t.contour, 150, 96, 'tone ' + t.n) +
        '<div class="tiny muted"><b style="color:var(--text)">' + esc(t.name) + '</b> — ' + esc(t.hint) + '</div>' +
        '<button class="btn btn-sm btn-ghost" data-play-tone="' + t.n + '">Hear a sample</button>' +
        '</div>';
    }).join('');

    var pairs = MMS_MINIMAL_PAIRS.map(function (g) {
      return '<div class="card tight" style="margin-bottom:10px">' +
        '<div class="row between" style="margin-bottom:8px"><b style="font-size:14px">“' + esc(g.syllable) + '” in five tones</b>' +
        '<span class="tiny muted">same syllable, different pitch</span></div>' +
        g.items.map(function (it) {
          return '<div class="minpair"><div class="mp-left"><div class="mp-hz">' + esc(it.hz) + '</div>' +
            '<div class="mp-meta"><span class="small">' + esc(it.py) + ' · ' + esc(it.en) + '</span>' +
            MMS.toneChipHTML(it.tone) + '</div></div>' + playBtn(it.hz) + '</div>';
        }).join('') + '</div>';
    }).join('');

    main.innerHTML = '<section class="screen">' + header('Tone trainer', 'Mandarin has four tones plus a neutral tone. Pitch shape matters more than volume.') +
      (has ? '' : '<div class="card" style="border-color:#4a3327;background:#1b1510"><b style="font-size:14px">Audio is unavailable</b>' +
        '<p class="small muted" style="margin-top:4px">No Chinese voice is installed, so the listen-and-identify drill is off. The contours and minimal pairs still work.</p>' +
        '<button class="btn btn-sm btn-ghost" id="voiceInfo" style="margin-top:8px">How to install a voice</button></div>') +
      '<div class="section-title">Pitch contours (5 = high, 1 = low)</div>' +
      '<div class="tone-grid">' + cards + '</div>' +
      '<div class="section-title">Minimal pairs</div>' + pairs +
      '<div class="card flat"><div class="row between"><div><b style="font-size:15px">Listen and identify</b>' +
        '<p class="small muted" style="margin-top:2px">10 single syllables, five tone options</p></div>' +
        '<button class="btn btn-primary btn-sm" id="drill"' + (has ? '' : ' disabled') + '>Start</button></div></div>' +
      (has ? '' : '<p class="tiny muted center">A Chinese speech voice is required for the drill.</p>') +
      '</section>';

    MMS.$$('[data-play-tone]', main).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!MMS.requireVoice()) return;
        var map = {
          1: '妈', 2: '麻', 3: '马', 4: '骂', 5: '吗'
        };
        MMS.speakCN(map[Number(b.getAttribute('data-play-tone'))]);
      });
    });
    wireSayButtons(main);

    var drill = MMS.$('#drill', main);
    if (drill) drill.addEventListener('click', function () { V._startQuizMode('tone', null); });
    var vi = MMS.$('#voiceInfo', main);
    if (vi) vi.addEventListener('click', MMS.voiceHelp);
  };

  function wireSayButtons(root) {
    MMS.$$('[data-say]', root).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        MMS.speakCN(b.getAttribute('data-say'));
      });
    });
  }

  /* ================= CHARACTER WRITER ================= */
  var W = { idx: 0, drawn: [], animStart: null, showGuide: true, showOutline: false, size: 320, raf: 0, canvas: null, ctx: null };

  function currentChar() {
    var i = Math.max(0, Math.min(MMS_CHARS.length - 1, Store.state.writer.char || 0));
    return MMS_CHARS[i];
  }

  V.writer = function (main) {
    var idx = Math.max(0, Math.min(MMS_CHARS.length - 1, Store.state.writer.char || 0));
    var ch = MMS_CHARS[idx];
    Store.state.writer.char = idx;
    Store.save();
    W.idx = idx; W.drawn = []; W.animStart = null;

    var strip = MMS_CHARS.map(function (c, i) {
      return '<button class="char-chip ' + (i === idx ? 'on' : '') + '" data-char="' + i + '">' + c.hz + '</button>';
    }).join('');

    var strokePills = ch.strokes.map(function (s, i) {
      return '<span class="stroke-pill"><b>' + (i + 1) + '</b>' + esc(s.t) + '</span>';
    }).join('');

    main.innerHTML = '<section class="screen">' + header('Character writer', 'Trace with a finger or mouse. Strokes are numbered in writing order.') +
      '<div class="writer-wrap"><canvas id="wc" aria-label="Stroke practice canvas for ' + esc(ch.hz) + '"></canvas></div>' +
      '<div class="row between"><div><div class="row" style="gap:8px"><span class="hanzi-lg">' + ch.hz + '</span>' +
        '<div class="stack" style="gap:0"><span class="py">' + esc(ch.py) + '</span><span class="small muted">' + esc(ch.en) + '</span></div></div></div>' +
        '<span class="pill">' + ch.strokes.length + ' strokes</span></div>' +
      '<div class="writer-tools">' +
        '<button class="tool-btn" id="tAnim"><b>▶</b>Animate</button>' +
        '<button class="tool-btn" id="tClear"><b>✕</b>Clear</button>' +
        '<button class="tool-btn" id="tCheck"><b>✓</b>Check</button>' +
        '<button class="tool-btn ' + (W.showGuide ? 'on' : '') + '" id="tGuide"><b>1·2·3</b>Guide</button>' +
        '<button class="tool-btn ' + (W.showOutline ? 'on' : '') + '" id="tOutline"><b>字</b>Reference</button>' +
      '</div>' +
      '<div class="row" style="gap:8px"><button class="btn btn-ghost btn-sm" id="prevChar" style="flex:1">‹ Previous</button>' +
        '<button class="btn btn-ghost btn-sm" id="nextChar" style="flex:1">Next ›</button></div>' +
      '<div class="section-title">Stroke order</div>' +
      '<div class="stroke-list">' + strokePills + '</div>' +
      '<p class="stroke-note">The moving guide is a simplified skeleton of each stroke, not brush calligraphy: follow the numbers and directions. Tap “Reference” to lay the printed character behind your tracing.</p>' +
      '<div class="char-strip">' + strip + '</div></section>';

    var canvas = MMS.$('#wc', main);
    W.canvas = canvas;
    W.drawn = [];
    W.animStart = null;

    requestAnimationFrame(function () {
      setupCanvas(canvas);
      bindPointer(canvas);
      drawW();
    });

    function selectChar(i) {
      Store.state.writer.char = i;
      Store.save();
      MMS.render();
    }

    MMS.$$('[data-char]', main).forEach(function (b) {
      b.addEventListener('click', function () { selectChar(Number(b.getAttribute('data-char'))); });
    });
    MMS.$('#prevChar', main).addEventListener('click', function () { selectChar((idx - 1 + MMS_CHARS.length) % MMS_CHARS.length); });
    MMS.$('#nextChar', main).addEventListener('click', function () { selectChar((idx + 1) % MMS_CHARS.length); });

    MMS.$('#tClear', main).addEventListener('click', function () { W.drawn = []; drawW(); });
    MMS.$('#tGuide', main).addEventListener('click', function () {
      W.showGuide = !W.showGuide;
      this.classList.toggle('on', W.showGuide);
      drawW();
    });
    MMS.$('#tOutline', main).addEventListener('click', function () {
      W.showOutline = !W.showOutline;
      this.classList.toggle('on', W.showOutline);
      drawW();
    });
    MMS.$('#tAnim', main).addEventListener('click', function () {
      W.showGuide = true;
      var g = MMS.$('#tGuide', main); if (g) g.classList.add('on');
      W.animStart = performance.now();
      animate();
    });
    MMS.$('#tCheck', main).addEventListener('click', function () {
      var need = ch.strokes.length, got = W.drawn.length;
      if (!got) { MMS.toast('Draw the character first.'); return; }
      if (got === need) {
        MMS.toast('✓ ' + ch.hz + ' has ' + need + ' strokes — you drew ' + got + '.');
      } else {
        MMS.toast(ch.hz + ' needs ' + need + ' strokes; you drew ' + got + '. Watch the animate button.');
      }
    });
  };

  function setupCanvas(canvas) {    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var size = canvas.clientWidth || 320;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    W.size = size;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W.ctx = ctx;
  }

  function bindPointer(canvas) {
    var drawing = false;
    var stroke = null;

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (W.animStart != null) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      drawing = true;
      stroke = [pos(e)];
      W.drawn.push(stroke);
      drawW();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing || !stroke) return;
      var p = pos(e);
      var last = stroke[stroke.length - 1];
      if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) < 0.6) return;
      stroke.push(p);
      drawW();
    });
    function end() { drawing = false; stroke = null; }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', function () { if (drawing) end(); });
  }

  var GLYPH = { key: '', canvas: null };

  function glyphLayer(ch, size) {
    var key = ch + '@' + Math.round(size);
    if (GLYPH.key === key) return GLYPH;
    var N = 256;
    var oc = document.createElement('canvas');
    oc.width = oc.height = N;
    var o = oc.getContext('2d');
    o.fillStyle = '#e8f6f2';
    o.font = '200px "Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillText(ch, N / 2, N / 2);
    var d = o.getImageData(0, 0, N, N).data;
    var minX = N, minY = N, maxX = 0, maxY = 0;
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        if (d[(y * N + x) * 4 + 3] > 24) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) {
      GLYPH = { key: key, canvas: null };
      return GLYPH;
    }
    var w = maxX - minX + 1, h = maxY - minY + 1;
    // map the printed glyph onto the same footprint the stroke guide occupies
    var data = MMS_CHARS.filter(function (c) { return c.hz === ch; })[0];
    var bx0 = 14, by0 = 14, bx1 = 86, by1 = 86;
    if (data) {
      bx0 = 100; by0 = 100; bx1 = 0; by1 = 0;
      data.strokes.forEach(function (s) {
        s.pts.forEach(function (p) {
          if (p[0] < bx0) bx0 = p[0];
          if (p[0] > bx1) bx1 = p[0];
          if (p[1] < by0) by0 = p[1];
          if (p[1] > by1) by1 = p[1];
        });
      });
    }
    var tw = (bx1 - bx0) / 100 * size, th = (by1 - by0) / 100 * size;
    var sc = Math.min(tw / w, th / h);
    var dw = w * sc, dh = h * sc;
    GLYPH = {
      key: key, canvas: oc, sx: minX, sy: minY, sw: w, sh: h,
      rect: [bx0 / 100 * size + (tw - dw) / 2, by0 / 100 * size + (th - dh) / 2, dw, dh]
    };
    return GLYPH;
  }

  function drawW() {
    var ctx = W.ctx, size = W.size;
    if (!ctx) return;
    var ch = MMS_CHARS[W.idx];
    ctx.clearRect(0, 0, size, size);

    // background
    ctx.fillStyle = '#0c1114';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
    ctx.moveTo(0, 0); ctx.lineTo(size, size);
    ctx.moveTo(size, 0); ctx.lineTo(0, size);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

    // faint reference glyph, scaled so its ink fills the same box as the guide paths
    if (W.showOutline) {
      var gl = glyphLayer(ch.hz, size);
      if (gl.canvas) {
        ctx.save();
        ctx.globalAlpha = 0.17;
        ctx.drawImage(gl.canvas, gl.sx, gl.sy, gl.sw, gl.sh, gl.rect[0], gl.rect[1], gl.rect[2], gl.rect[3]);
        ctx.restore();
      }
    }

    // guides
    if (W.showGuide) {
      var N = ch.strokes.length;
      var placed = [];
      var progress = 1;
      if (W.animStart != null) {
        var elapsed = performance.now() - W.animStart;
        var per = 520;
        var total = N * per;
        progress = Math.min(1, elapsed / total);
        if (elapsed >= total) W.animStart = null;
      }
      ch.strokes.forEach(function (s, i) {
        var startFrac = i / N, endFrac = (i + 1) / N;
        var t = progress >= endFrac ? 1 : (progress <= startFrac ? 0 : (progress - startFrac) / (endFrac - startFrac));
        if (t <= 0) return;
        drawPolyline(ctx, s.pts, t, 'rgba(95,211,172,.13)', size * 0.034, size);
        drawPolyline(ctx, s.pts, t, 'rgba(95,211,172,.95)', Math.max(2.6, size * 0.009), size);
        // number badge at start (nudged so stacked starts stay readable)
        var p0 = s.pts[0];
        var R = Math.max(8, size * 0.026);
        var bx = p0[0] / 100 * size, by = p0[1] / 100 * size;
        placed.forEach(function (q) {
          if (Math.abs(q[0] - bx) < R * 1.6 && Math.abs(q[1] - by) < R * 1.6) by = q[1] + R * 1.7;
        });
        placed.push([bx, by]);
        bx = Math.min(size - R - 2, Math.max(R + 2, bx));
        by = Math.min(size - R - 2, Math.max(R + 2, by));
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,14,16,.92)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(95,211,172,.8)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.fillStyle = '#9fe9ce';
        ctx.font = '600 ' + Math.round(R * 1.05) + 'px ui-sans-serif,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), bx, by + 0.5);
        ctx.restore();
      });
    }

    // user strokes
    W.drawn.forEach(function (pts) {
      drawPolyline(ctx, pts, 1, '#f2f7f9', Math.max(3, size * 0.013), size);
    });
  }

  function drawPolyline(ctx, pts, t, color, width, size) {
    if (!pts.length) return;
    var path = t >= 1 ? pts : partial(pts, t);
    if (!path.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(path[0][0] / 100 * size, path[0][1] / 100 * size);
    for (var i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0] / 100 * size, path[i][1] / 100 * size);
    }
    ctx.stroke();
    ctx.restore();
  }

  function partial(pts, t) {
    if (pts.length === 1) return pts.slice();
    var segs = [], total = 0;
    for (var i = 1; i < pts.length; i++) {
      var L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segs.push(L); total += L;
    }
    var target = total * t, acc = 0, out = [pts[0]];
    for (var j = 0; j < segs.length; j++) {
      if (acc + segs[j] <= target) { out.push(pts[j + 1]); acc += segs[j]; }
      else {
        var r = segs[j] ? (target - acc) / segs[j] : 0;
        out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * r, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * r]);
        break;
      }
    }
    return out;
  }

  function animate() {
    drawW();
    if (W.animStart != null) W.raf = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', function () {
    if (W.canvas && document.body.contains(W.canvas)) {
      setupCanvas(W.canvas);
      drawW();
    }
  });

  /* ================= DIALOGUES ================= */
  V.dialogues = function (main) {
    var rows = MMS_DIALOGUES.map(function (d, i) {
      return '<button class="set-row" data-dlg="' + i + '"><div class="set-idx">' + (i + 1) + '</div>' +
        '<div class="set-body"><div class="set-top"><b>' + esc(d.title) + '</b><span class="tiny">' + d.lines.length + ' lines</span></div>' +
        '<span class="tiny muted">' + esc(d.sub) + '</span></div><span class="chev">›</span></button>';
    }).join('');
    main.innerHTML = '<section class="screen">' + header('Dialogues', 'Five everyday scenes · tap any line to hear it') +
      '<div class="list">' + rows + '</div>' +
      '<p class="tiny muted center">Pinyin and English can be hidden so you can test yourself.</p></section>';
    MMS.$$('[data-dlg]', main).forEach(function (b) {
      b.addEventListener('click', function () { MMS.go('#/dialogue/' + b.getAttribute('data-dlg')); });
    });
  };

  V.dialogue = function (main, idx) {
    var d = MMS_DIALOGUES[Number(idx)];
    if (!d) { MMS.go('#/dialogues'); return; }
    var lines = d.lines.map(function (l, i) {
      return '<div class="dlg-line"><div class="dlg-who">' + esc(l.who) + '</div>' +
        '<div class="dlg-body"><div class="dlg-hz">' + esc(l.hz) + '</div>' +
        (UI.showPy ? '<div class="dlg-py">' + esc(l.py) + '</div>' : '') +
        (UI.showEn ? '<div class="dlg-en">' + esc(l.en) + '</div>' : '') + '</div>' +
        '<div class="dlg-actions">' + playBtn(l.hz) + '</div></div>';
    }).join('');

    main.innerHTML = '<section class="screen">' + header(d.title, d.sub) +
      '<div class="row wrap" style="gap:8px">' +
        '<button class="btn btn-sm btn-ghost" id="playAll">▶ Play all</button>' +
        '<button class="filter-chip ' + (UI.showPy ? 'on' : '') + '" id="tPy">Pinyin</button>' +
        '<button class="filter-chip ' + (UI.showEn ? 'on' : '') + '" id="tEn">English</button>' +
      '</div>' +
      '<div class="card tight">' + lines + '</div>' +
      '<p class="tiny muted center">Playback uses the zh-CN voice at a slowed rate.</p></section>';

    wireSayButtons(main);
    MMS.$('#tPy', main).addEventListener('click', function () { UI.showPy = !UI.showPy; MMS.render(); });
    MMS.$('#tEn', main).addEventListener('click', function () { UI.showEn = !UI.showEn; MMS.render(); });
    MMS.$('#playAll', main).addEventListener('click', function () {
      if (!MMS.requireVoice()) return;
      var i = 0;
      function step() {
        if (i >= d.lines.length) return;
        var line = d.lines[i++];
        MMS.Audio.speak(line.hz);
        // wait roughly for the line, then continue
        setTimeout(step, Math.max(1600, line.hz.length * 480));
      }
      step();
    });
  };

  /* ================= PHRASEBOOK ================= */
  V.phrases = function (main) {
    var groups = window.MMS_PHRASE_GROUPS;
    var filter = UI.phraseGroup || 'all';
    var chips = '<button class="filter-chip ' + (filter === 'all' ? 'on' : '') + '" data-g="all">All</button>' +
      groups.map(function (g) {
        return '<button class="filter-chip ' + (filter === g.id ? 'on' : '') + '" data-g="' + g.id + '">' + esc(g.title) + '</button>';
      }).join('');

    var body = groups.filter(function (g) { return filter === 'all' || g.id === filter; }).map(function (g) {
      return '<div class="card tight" style="margin-bottom:10px"><div class="row between" style="margin-bottom:6px">' +
        '<b style="font-size:14px">' + esc(g.title) + '</b><span class="tiny muted">' + esc(g.sub) + '</span></div>' +
        g.items.map(function (p) {
          return '<div class="phrase-row"><div class="phrase-body">' +
            '<div class="phrase-hz">' + esc(p.hz) + '</div>' +
            '<div class="phrase-py">' + esc(p.py) + '</div>' +
            '<div class="phrase-en">' + esc(p.en) + '</div></div>' +
            playBtn(p.hz) + '</div>';
        }).join('') + '</div>';
    }).join('');

    main.innerHTML = '<section class="screen">' + header('Phrasebook', 'Survival lines grouped by situation') +
      '<div class="chips-scroll">' + chips + '</div>' + body + '</section>';

    MMS.$$('[data-g]', main).forEach(function (b) {
      b.addEventListener('click', function () { UI.phraseGroup = b.getAttribute('data-g'); MMS.render(); });
    });
    wireSayButtons(main);
  };

  /* ================= PROGRESS ================= */
  V.progress = function (main) {
    Store.sync();
    var st = Store.state;
    var goal = st.settings.goal;
    var done = st.daily.a;
    var dist = Store.boxDist();
    var maxD = Math.max.apply(null, dist) || 1;

    var cols = dist.map(function (n, i) {
      return '<div class="box-col"><div class="num">' + n + '</div>' +
        '<div class="fill" style="height:' + Math.max(3, Math.round((n / maxD) * 64)) + 'px"></div>' +
        '<div class="cap">' + (i === 0 ? 'new' : 'box ' + i) + '</div></div>';
    }).join('');

    var setBars = MMS_SETS.map(function (s) {
      var acc = Store.acc(s.id);
      var learned = Store.learnedCount(s.id);
      var total = MMS.cardsOfSet(s.id).length;
      return '<div class="meter-row"><div class="meter-head"><span>' + esc(s.title) + '</span>' +
        '<b>' + (acc === null ? '—' : acc + '%') + '</b></div>' +
        '<div class="bar thin"><i style="width:' + (acc || 0) + '%;opacity:' + (acc === null ? .25 : 1) + '"></i></div>' +
        '<span class="tiny" style="color:var(--muted-2)">' + learned + '/' + total + ' seen · ' + Store.dueCards(s.id).length + ' due</span></div>';
    }).join('');

    main.innerHTML = '<section class="screen">' + header('Progress', 'Everything is stored on this device') +
      '<div class="hero"><div class="ring-wrap">' +
        '<svg class="ring" viewBox="0 0 84 84"><circle class="track" cx="42" cy="42" r="34"></circle>' +
        '<circle class="val" cx="42" cy="42" r="34" stroke-dasharray="213.6" stroke-dashoffset="' +
        (213.6 * (1 - Math.min(1, goal ? done / goal : 0))).toFixed(1) + '"></circle>' +
        '<text x="42" y="44" text-anchor="middle" class="ring-label">' + Math.round(100 * Math.min(1, goal ? done / goal : 0)) + '%</text>' +
        '<text x="42" y="56" text-anchor="middle" class="ring-sub">GOAL</text></svg></div>' +
        '<div><h2>Daily goal</h2><p>' + done + ' of ' + goal + ' answers today</p>' +
        '<p class="tiny" style="margin-top:4px;color:#9fe9ce">' + Store.dueCount() + ' cards in the review queue</p></div></div>' +
      '<div class="grid-2">' +
        '<div class="stat"><b>' + (st.streak.n || 0) + '</b><span>day streak</span></div>' +
        '<div class="stat"><b>' + (st.streak.best || 0) + '</b><span>best streak</span></div>' +
        '<div class="stat"><b>' + Store.masteredCount() + '</b><span>mastered (box 5)</span></div>' +
        '<div class="stat"><b>' + (Store.acc() === null ? '—' : Store.acc() + '%') + '</b><span>overall accuracy</span></div>' +
      '</div>' +
      '<div class="card"><div class="row between" style="margin-bottom:6px"><b style="font-size:15px">Box distribution</b>' +
        '<span class="tiny muted">' + st.totals.a + ' answers all time</span></div>' +
        '<div class="box-dist">' + cols + '</div></div>' +
      '<div class="section-title">Accuracy by set</div>' +
      '<div class="card">' + setBars + '</div>' +
      '<div class="card flat"><div class="kv"><span>Cards seen</span><b>' + Store.learnedCount() + ' / 200</b></div>' +
        '<div class="kv"><span>Correct answers</span><b>' + st.totals.c + '</b></div>' +
        '<div class="kv"><span>Answers given</span><b>' + st.totals.a + '</b></div>' +
        '<div class="kv"><span>Last study day</span><b>' + (st.streak.last || '—') + '</b></div></div>' +
      '</section>';
  };

  /* ================= MORE / SETTINGS ================= */
  V.more = function (main) {
    var has = MMS.Audio.ok();
    main.innerHTML = '<section class="screen">' + header('More', 'Practice tools, audio and settings') +
      '<div class="list">' +
        '<button class="list-row" data-go="#/write"><div class="set-idx">✍</div><div class="list-main"><span class="t">Character writer</span><span class="s">20 characters · stroke order</span></div><span class="chev">›</span></button>' +
        '<button class="list-row" data-go="#/dialogues"><div class="set-idx">💬</div><div class="list-main"><span class="t">Dialogues</span><span class="s">5 scenes with line-by-line audio</span></div><span class="chev">›</span></button>' +
        '<button class="list-row" data-go="#/phrases"><div class="set-idx">🧭</div><div class="list-main"><span class="t">Phrasebook</span><span class="s">Restaurant, directions, hotel, emergency</span></div><span class="chev">›</span></button>' +
        '<button class="list-row" data-go="#/progress"><div class="set-idx">📊</div><div class="list-main"><span class="t">Progress</span><span class="s">Streak, accuracy, box distribution</span></div><span class="chev">›</span></button>' +
      '</div>' +

      '<div class="section-title">Audio</div>' +
      '<div class="card"><div class="row between"><div><b style="font-size:15px">Chinese voice</b>' +
        '<p class="small muted" style="margin-top:2px">' + esc(MMS.Audio.label()) + '</p></div>' +
        '<span class="pill ' + (has ? 'accent' : 'bad') + '">' + (has ? 'ready' : 'missing') + '</span></div>' +
        '<div class="row" style="gap:8px;margin-top:10px"><button class="btn btn-sm btn-ghost" id="checkVoice" style="flex:1">Check again</button>' +
        '<button class="btn btn-sm btn-ghost" id="voiceHelp" style="flex:1">Install help</button></div></div>' +

      '<div class="section-title">Settings</div>' +
      '<div class="card stack">' +
        '<label class="small muted" for="goalSel">Daily goal (answers)</label>' +
        '<select id="goalSel" class="btn" style="padding:0 12px">' +
          [10, 20, 30, 50].map(function (g) { return '<option value="' + g + '"' + (Store.state.settings.goal === g ? ' selected' : '') + '>' + g + ' answers</option>'; }).join('') +
        '</select>' +
        '<label class="small muted" for="rateRange" style="margin-top:6px">Speech speed — <b id="rateVal">' + Number(Store.state.settings.rate).toFixed(2) + '</b>×</label>' +
        '<input class="dial" type="range" id="rateRange" min="0.6" max="1.2" step="0.05" value="' + Store.state.settings.rate + '">' +
        '<button class="btn btn-ghost btn-sm" id="testVoice" style="margin-top:4px">Play test: 你好，我是中文语音</button>' +
      '</div>' +

      '<div class="card flat"><div class="row between"><div><b style="font-size:14px">Reset all progress</b>' +
        '<p class="tiny muted" style="margin-top:2px">Clears boxes, streak and stats on this device.</p></div>' +
        '<button class="btn btn-sm btn-danger" id="resetBtn">Reset</button></div></div>' +

      '<p class="tiny muted center">Mandarin Mastery Suite · offline · no account · no tracking<br>200 words · simplified characters · pinyin with tone numbers</p>' +
      '</section>';

    MMS.$$('[data-go]', main).forEach(function (b) {
      b.addEventListener('click', function () { MMS.go(b.getAttribute('data-go')); });
    });
    MMS.$('#checkVoice', main).addEventListener('click', function () {
      MMS.Audio.init();
      setTimeout(function () {
        MMS.toast(MMS.Audio.ok() ? 'Voice ready: ' + MMS.Audio.zh.name : 'Still no Chinese voice on this device.');
        MMS.render();
      }, 1000);
    });
    MMS.$('#voiceHelp', main).addEventListener('click', MMS.voiceHelp);
    MMS.$('#goalSel', main).addEventListener('change', function (e) {
      Store.state.settings.goal = Number(e.target.value);
      Store.save();
      MMS.toast('Daily goal set to ' + Store.state.settings.goal);
      MMS.render();
    });
    MMS.$('#rateRange', main).addEventListener('input', function (e) {
      Store.state.settings.rate = Number(e.target.value);
      Store.save();
      var v = MMS.$('#rateVal', main);
      if (v) v.textContent = Number(e.target.value).toFixed(2);
    });
    MMS.$('#testVoice', main).addEventListener('click', function () {
      MMS.speakCN('你好，我是中文语音');
    });
    MMS.$('#resetBtn', main).addEventListener('click', function () {
      MMS.modal({
        title: 'Reset everything?',
        html: '<p>This deletes your Leitner boxes, streak, daily goal progress and accuracy history on this device. It cannot be undone.</p>',
        actions: [
          { label: 'Cancel' },
          { label: 'Yes, reset', primary: true, onClick: function () {
            Store.reset();
            MMS.toast('Progress reset.');
            MMS.go('#/today');
          }}
        ]
      });
    });
  };

  V._startQuizMode = MMS.views._startQuizMode;
})();
