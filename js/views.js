/* views.js — today, cards, quiz modes, and the session engine */
(function () {
  var MMS = window.MMS, Store = MMS.Store;
  var esc = MMS.esc;
  var V = MMS.views = {};

  function sample(arr, n) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a.slice(0, n);
  }
  MMS.sample = sample;

  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function ringHTML(value, goal, label, sub) {
    var r = 34, c = 2 * Math.PI * r;
    var p = Math.min(1, goal ? value / goal : 0);
    return '<svg class="ring" viewBox="0 0 84 84" role="img" aria-label="' + pct(value, goal) + '% of daily goal">' +
      '<circle class="track" cx="42" cy="42" r="' + r + '"></circle>' +
      '<circle class="val" cx="42" cy="42" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - p)).toFixed(1) + '"></circle>' +
      '<text x="42" y="44" text-anchor="middle" class="ring-label">' + (label || pct(value, goal) + '%') + '</text>' +
      '<text x="42" y="56" text-anchor="middle" class="ring-sub">' + esc(sub || 'TODAY') + '</text>' +
      '</svg>';
  }

  function header(title, sub) {
    return '<header class="screen-head"><h1>' + esc(title) + '</h1>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</header>';
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 11) return { hz: '早上好', en: 'Good morning' };
    if (h < 18) return { hz: '下午好', en: 'Good afternoon' };
    return { hz: '晚上好', en: 'Good evening' };
  }

  /* ================= TODAY ================= */
  V.today = function (main) {
    Store.sync();
    var st = Store.state;
    var due = Store.dueCards();
    var quota = Store.newQuota();
    var fresh = Store.newCards().slice(0, quota);
    var goal = st.settings.goal;
    var doneToday = st.daily.a;
    var done = st.daily.done;
    var g = greeting();
    var streak = st.streak.n || 0;

    var reviewSub = due.length ? (due.length + ' card' + (due.length === 1 ? '' : 's') + ' waiting') : 'Nothing due — come back tomorrow';
    var newSub = quota > 0 ? (quota + ' of 5 left today') : 'Daily new cards done';

    var tasks =
      '<div class="task"><div class="n ' + (due.length ? '' : 'done') + '">' + (due.length ? due.length : '✓') + '</div>' +
        '<div class="body"><b>Review</b><span>' + reviewSub + '</span></div></div>' +
      '<div class="task"><div class="n ' + (quota ? '' : 'done') + '">' + (quota ? quota : '✓') + '</div>' +
        '<div class="body"><b>New cards</b><span>' + newSub + '</span></div></div>' +
      '<div class="task"><div class="n ' + (done ? 'done' : '') + '">' + (done ? '✓' : '10') + '</div>' +
        '<div class="body"><b>Quiz</b><span>' + (done ? 'Finished for today' : 'Up to 10 questions on today’s words') + '</span></div></div>';

    main.innerHTML =
      '<section class="screen">' +
        '<div class="hero">' +
          '<div class="ring-wrap">' + ringHTML(doneToday, goal) + '</div>' +
          '<div style="min-width:0">' +
            '<h2>' + g.hz + ' <span class="hz" style="font-size:15px;color:#9fdcca">' + g.en + '</span></h2>' +
            '<p>' + doneToday + ' of ' + goal + ' answers today · ' + Store.masteredCount() + ' words mastered</p>' +
            '<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">' +
              '<span class="pill gold">🔥 ' + streak + '-day streak</span>' +
              (due.length ? '<span class="pill">' + due.length + ' due</span>' : '<span class="pill accent">all caught up</span>') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="section-title">Today’s plan</div>' +
        '<div class="stack">' + tasks + '</div>' +

        '<button class="btn btn-primary btn-block" id="startDaily">' + (done ? 'Extra practice' : 'Start today’s lesson') + '</button>' +
        '<p class="tiny muted center" style="margin-top:-6px">Reviews first, then 5 new cards, then a short quiz.</p>' +

        '<div class="section-title">Practice</div>' +
        '<div class="grid-2">' +
          '<button class="btn btn-ghost btn-col" data-go="#/tones"><span class="btn-ic">〰</span>Tone trainer</button>' +
          '<button class="btn btn-ghost btn-col" data-go="#/write"><span class="btn-ic">✍</span>Write characters</button>' +
          '<button class="btn btn-ghost btn-col" data-go="#/dialogues"><span class="btn-ic">💬</span>Dialogues</button>' +
          '<button class="btn btn-ghost btn-col" data-go="#/phrases"><span class="btn-ic">🧭</span>Phrasebook</button>' +
        '</div>' +

        '<div class="card flat">' +
          '<div class="row between"><b style="font-size:14px">Review queue</b><span class="pill">' + due.length + ' due</span></div>' +
          '<p class="small muted" style="margin-top:6px">Leitner boxes: a correct answer moves a card one box up (longer gap), a wrong answer sends it back to box 1.</p>' +
        '</div>' +
      '</section>';

    MMS.$('#startDaily', main).addEventListener('click', function () { startDaily(); });
    MMS.$$('[data-go]', main).forEach(function (b) {
      b.addEventListener('click', function () { MMS.go(b.getAttribute('data-go')); });
    });
  };

  function startDaily() {
    Store.sync();
    var due = Store.dueCards().slice(0, 20);
    var quota = Store.newQuota();
    var fresh = Store.newCards().slice(0, Math.min(5, quota));
    var ids = due.map(function (c) { return c.id; }).concat(fresh.map(function (c) { return c.id; }));

    if (!ids.length) {
      var pool = MMS_CARDS.filter(function (c) { return Store.box(c.id) > 0; });
      if (!pool.length) pool = MMS_CARDS;
      startQuiz({ type: 'meaning', items: sample(pool, 10), title: 'Practice quiz', daily: true, dailyFinal: true });
      return;
    }

    startFlash(ids, {
      title: 'Today’s lesson',
      daily: true,
      nextLabel: 'Start today’s quiz',
      onDone: function () {
        var cards = ids.map(function (id) { return MMS.cardById[id]; }).filter(Boolean);
        var qs = sample(cards, Math.min(10, cards.length));
        if (qs.length < 10) {
          var extra = sample(MMS_CARDS.filter(function (c) {
            return Store.box(c.id) > 0 && ids.indexOf(c.id) < 0;
          }), 10 - qs.length);
          qs = qs.concat(extra);
        }
        if (!qs.length) qs = sample(MMS_CARDS, 10);
        qs = sample(qs, Math.min(10, qs.length));
        startQuiz({ type: 'meaning', items: qs, title: 'Today’s quiz', daily: true, dailyFinal: true });
      }
    });
  }

  /* ================= CARDS ================= */
  V.cards = function (main) {
    Store.sync();
    var rows = MMS_SETS.map(function (s, i) {
      var total = MMS.cardsOfSet(s.id).length;
      var learned = Store.learnedCount(s.id);
      var due = Store.dueCards(s.id).length;
      var acc = Store.acc(s.id);
      return '<button class="set-row" data-set="' + s.id + '">' +
        '<div class="set-idx">' + (i + 1) + '</div>' +
        '<div class="set-body">' +
          '<div class="set-top"><b>' + esc(s.title) + '</b><span>' + learned + '/' + total + '</span></div>' +
          '<div class="bar thin"><i style="width:' + pct(learned, total) + '%"></i></div>' +
          '<div class="set-top" style="margin-top:2px"><span class="tiny">' + esc(s.tag) + '</span>' +
            '<span class="tiny">' + (due ? due + ' due' : (acc === null ? 'new' : acc + '% acc')) + '</span></div>' +
        '</div>' +
        '<span class="chev">›</span></button>';
    }).join('');

    main.innerHTML = '<section class="screen">' +
      header('Flashcards', '200 words in 10 sets · 20 cards each') +
      '<div class="card flat"><div class="row between"><div><b style="font-size:15px">' + Store.learnedCount() + ' of 200 seen</b>' +
        '<p class="small muted" style="margin-top:2px">' + Store.masteredCount() + ' mastered (box 5) · ' + Store.dueCount() + ' due now</p></div>' +
        '<div style="width:64px">' + ringHTML(Store.learnedCount(), 200, pct(Store.learnedCount(), 200) + '%', 'SEEN') + '</div></div></div>' +
      '<div class="list">' + rows + '</div>' +
      '<p class="tiny muted center">Tone numbers and tone names are always shown next to every syllable.</p></section>';

    MMS.$$('[data-set]', main).forEach(function (b) {
      b.addEventListener('click', function () { MMS.go('#/set/' + b.getAttribute('data-set')); });
    });
  };

  V.setDetail = function (main, setId) {
    Store.sync();
    var set = MMS.setById[setId];
    if (!set) { MMS.go('#/cards'); return; }
    var cards = MMS.cardsOfSet(setId);
    var due = Store.dueCards(setId);
    var fresh = Store.newCards(setId);
    var learned = Store.learnedCount(setId);

    var wordRows = cards.map(function (c) {
      var b = Store.box(c.id);
      return '<div class="phrase-row">' +
        '<div class="phrase-body"><div class="row" style="gap:8px"><span class="hanzi-md">' + esc(c.hz) + '</span>' +
          '<span class="pill ' + (b >= 5 ? 'accent' : '') + '">' + (b ? 'Box ' + b : 'New') + '</span></div>' +
          '<div class="phrase-py">' + esc(MMS.pinyin(c)) + ' · tones ' + c.syl.map(function (p) { return p[1]; }).join('-') + '</div>' +
          '<div class="phrase-en">' + esc(c.en) + '</div></div>' +
        '<button class="play-btn" data-say="' + esc(c.hz) + '" aria-label="Play ' + esc(c.hz) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9a4 4 0 010 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
      '</div>';
    }).join('');

    main.innerHTML = '<section class="screen">' +
      header(set.title, set.tag) +
      '<div class="grid-3">' +
        '<div class="stat"><b>' + learned + '</b><span>of ' + cards.length + ' seen</span></div>' +
        '<div class="stat"><b>' + due.length + '</b><span>due now</span></div>' +
        '<div class="stat"><b>' + (Store.acc(setId) === null ? '—' : Store.acc(setId) + '%') + '</b><span>accuracy</span></div>' +
      '</div>' +
      '<div class="stack">' +
        '<button class="btn btn-primary btn-block" id="reviewSet"' + (due.length ? '' : ' disabled') + '>Review due (' + due.length + ')</button>' +
        '<button class="btn btn-block" id="newSet"' + (fresh.length ? '' : ' disabled') + '>Learn new (' + Math.min(10, fresh.length) + ')</button>' +
        '<button class="btn btn-ghost btn-block" id="quizSet">Quiz this set</button>' +
      '</div>' +
      '<div class="section-title">Words</div>' +
      '<div class="card tight">' + wordRows + '</div></section>';

    MMS.$('#reviewSet', main).addEventListener('click', function () {
      if (!due.length) return;
      startFlash(due.slice(0, 20).map(function (c) { return c.id; }), { title: set.title + ' · review' });
    });
    MMS.$('#newSet', main).addEventListener('click', function () {
      if (!fresh.length) return;
      startFlash(fresh.slice(0, 10).map(function (c) { return c.id; }), { title: set.title + ' · new cards' });
    });
    MMS.$('#quizSet', main).addEventListener('click', function () {
      startQuiz({ type: 'meaning', items: sample(cards, 10), title: set.title + ' quiz' });
    });
  };

  /* ================= QUIZ HOME ================= */
  var MODES = [
    { id: 'meaning', title: 'Multiple choice', sub: 'Word + pinyin → pick the meaning', icon: 'A', audio: false },
    { id: 'char', title: 'Character recognition', sub: 'Characters only → pick the meaning', icon: '字', audio: false },
    { id: 'listen', title: 'Listening', sub: 'Hear the word → pick the meaning', icon: '♪', audio: true },
    { id: 'tone', title: 'Tone identification', sub: 'Hear one syllable → name its tone', icon: 'ˇ', audio: true },
    { id: 'type', title: 'Pinyin typing', sub: 'Type ni3hao3 style pinyin with tones', icon: '⌨', audio: false }
  ];

  V.quizHome = function (main) {
    var hasVoice = MMS.Audio.ok();
    var rows = MODES.map(function (m) {
      var locked = m.audio && !hasVoice;
      return '<button class="set-row" data-mode="' + m.id + '"' + (locked ? ' disabled style="opacity:.5"' : '') + '>' +
        '<div class="set-idx" style="font-family:var(--han)">' + m.icon + '</div>' +
        '<div class="set-body"><div class="set-top"><b>' + m.title + '</b>' +
          (m.audio ? '<span class="tiny">' + (locked ? 'no voice' : 'audio') + '</span>' : '') + '</div>' +
          '<span class="tiny muted">' + m.sub + '</span></div>' +
        '<span class="chev">›</span></button>';
    }).join('');

    main.innerHTML = '<section class="screen">' +
      header('Quiz modes', 'Ten questions per round · graded into your Leitner boxes') +
      (hasVoice ? '' : '<div class="card" style="border-color:#4a3327;background:#1b1510">' +
        '<b style="font-size:14px">Audio modes are off</b>' +
        '<p class="small muted" style="margin-top:4px">No Chinese voice was found on this device. Listening and tone identification need one. ' +
        '<button class="link" id="voiceInfo" style="background:none;border:0;padding:0;font:inherit;cursor:pointer">How to install a voice</button></p></div>') +
      '<div class="list">' + rows + '</div>' +
      '<div class="card flat"><p class="small muted">Typing answers accept <b>ni3hao3</b>, <b>nǐ hǎo</b> or <b>nv3</b> for ǚ. Neutral tone is 5 (0 also works).</p></div>' +
      '</section>';

    MMS.$$('[data-mode]', main).forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-mode');
        if (mode === 'tone' && !MMS.Audio.ok()) { MMS.voiceHelp(); return; }
        if (mode === 'listen' && !MMS.Audio.ok()) { MMS.voiceHelp(); return; }
        MMS.go('#/quiz/' + mode);
      });
    });
    var vi = MMS.$('#voiceInfo', main);
    if (vi) vi.addEventListener('click', MMS.voiceHelp);
  };

  V.quizScope = function (main, mode) {
    var m = MODES.filter(function (x) { return x.id === mode; })[0];
    if (!m) { MMS.go('#/quiz'); return; }

    if (mode === 'tone') {
      main.innerHTML = '<section class="screen">' + header('Tone identification', 'One syllable, five tone choices') +
        '<div class="card"><b style="font-size:15px">How this drill works</b>' +
        '<p class="small muted" style="margin-top:6px">A random single syllable is played from a pool of 65 words — including the classic mā / má / mǎ / mà set. ' +
        'Pick tone 1, 2, 3, 4 or neutral. Tone drills do not change your Leitner boxes.</p></div>' +
        '<button class="btn btn-primary btn-block" id="startTone">Start 10-question drill</button>' +
        '<button class="btn btn-ghost btn-block" id="toTrainer">Open the tone trainer first</button>' +
        '</section>';
      MMS.$('#startTone', main).addEventListener('click', function () { startQuizMode('tone', null); });
      MMS.$('#toTrainer', main).addEventListener('click', function () { MMS.go('#/tones'); });
      return;
    }

    var rows = MMS_SETS.map(function (s) {
      return '<button class="set-row" data-set="' + s.id + '"><div class="set-body" style="padding-left:2px">' +
        '<div class="set-top"><b>' + esc(s.title) + '</b><span class="tiny">' + MMS.cardsOfSet(s.id).length + ' cards</span></div></div>' +
        '<span class="chev">›</span></button>';
    }).join('');

    main.innerHTML = '<section class="screen">' + header(m.title, 'Choose what to practise') +
      '<button class="btn btn-primary btn-block" id="allSets">All 200 cards</button>' +
      '<div class="list">' + rows + '</div>' +
      '</section>';

    function go(setId) { startQuizMode(mode, setId); }
    MMS.$('#allSets', main).addEventListener('click', function () { go(null); });
    MMS.$$('[data-set]', main).forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-set')); });
    });
  };

  function startQuizMode(mode, setId) {
    if ((mode === 'listen' || mode === 'tone') && !MMS.requireVoice()) return;
    if (mode === 'tone') {
      var items = sample(MMS_TONE_POOL, 10).map(function (t, i) {
        return { id: 'tone-' + i, hz: t.hz, py: t.py, tone: t.tone, en: t.en };
      });
      startQuiz({ type: 'tone', items: items, title: 'Tone identification' });
      return;
    }
    var pool = scopeCards(setId);
    if (mode === 'listen') {
      pool = pool.filter(function (c) { return c.syl.length >= 1; });
    }
    var seen = pool.filter(function (c) { return Store.box(c.id) > 0; });
    var src = seen.length >= 10 ? seen : pool;
    var items = sample(src, Math.min(10, src.length));
    if (!items.length) { MMS.toast('No cards in this scope.'); return; }
    startQuiz({ type: mode, items: items, title: MMS.setById[setId] ? MMS.setById[setId].title : 'All cards' });
  }

  function scopeCards(setId) {
    return setId ? MMS.cardsOfSet(setId) : MMS_CARDS.slice();
  }

  /* ================= SESSION ================= */
  function startFlash(ids, opts) {
    opts = opts || {};
    MMS.App.session = {
      kind: 'flash',
      items: ids.map(function (id) { return MMS.cardById[id]; }).filter(Boolean),
      i: 0, correct: 0, wrong: 0, flipped: false,
      title: opts.title || 'Review', daily: !!opts.daily,
      nextLabel: opts.nextLabel || null,
      onDone: opts.onDone || null
    };
    MMS.go('#/session');
  }
  MMS.startFlash = startFlash;

  function startQuiz(opts) {
    MMS.App.session = {
      kind: 'quiz', type: opts.type, items: opts.items.slice(),
      i: 0, correct: 0, wrong: 0, missed: [],
      answered: false, choice: null, input: '', options: null, prepared: -1,
      title: opts.title || 'Quiz', daily: !!opts.daily,
      dailyFinal: !!opts.dailyFinal, onDone: opts.onDone || null
    };
    MMS.go('#/session');
  }
  MMS.startQuiz = startQuiz;

  V.session = function (main) {
    var s = MMS.App.session;
    if (!s || !s.items || !s.items.length) { MMS.go('#/today'); return; }

    if (s.i >= s.items.length) {
      if (!s.finished) {
        s.finished = true;
        if (s.dailyFinal) Store.markDailyDone();
        if (s.onDone) { var cb = s.onDone; s.onDone = null; cb(); }
        if (MMS.App.session !== s) return;
      }
      return summary(main, s);
    }

    if (s.kind === 'flash') return flashView(main, s);
    return quizView(main, s);
  };

  function exitBar(s) {
    return '<div class="q-head"><span>' + esc(s.title) + '</span>' +
      '<button class="btn btn-sm btn-ghost" id="quit" style="min-height:34px">Exit</button></div>';
  }

  function progressBar(s) {
    return '<div class="bar thin"><i style="width:' + pct(s.i, s.items.length) + '%"></i></div>';
  }

  function flashView(main, s) {
    var c = s.items[s.i];
    var box = Store.cs(c.id).box || 0;
    var nextUp = Math.min(5, box + 1);
    var goodLabel = box === 0 ? 'starts at box 1' : (box >= 5 ? 'stays in box 5' : 'box ' + box + ' → ' + nextUp);
    var body;

    if (!s.flipped) {
      body = '<div class="flash-card" id="cardTap">' +
        '<div class="hint">Tap the card to reveal</div>' +
        '<div class="hanzi-xl hz">' + esc(c.hz) + '</div>' +
        '<div class="hint" style="color:var(--muted-2)">' + esc(s.title) + '</div>' +
        '</div>';
    } else {
      body = '<div class="flash-card revealed" id="cardTap">' +
        '<div class="hanzi-md hz" style="color:#d8f3ea">' + esc(c.hz) + '</div>' +
        '<div class="py py-lg">' + esc(MMS.pinyin(c)) + '</div>' +
        MMS.toneChipsHTML(c) +
        '<div class="en" style="font-size:21px">' + esc(c.en) + '</div>' +
        (c.note ? '<p class="tiny muted" style="max-width:36ch">' + esc(c.note) + '</p>' : '') +
        '</div>';
    }

    main.innerHTML = '<section class="screen">' + exitBar(s) + progressBar(s) +
      '<div class="flash-meta"><span>Card ' + (s.i + 1) + ' of ' + s.items.length + '</span>' +
        '<span>' + (box ? 'Box ' + box : 'New card') + '</span></div>' +
      '<div class="flash-stage">' + body +
        '<div class="row" style="gap:8px">' +
          '<button class="btn btn-ghost btn-sm" id="sayCard" style="flex:0 0 auto">🔈 Hear it</button>' +
          '<span class="tiny muted">' + (s.daily ? 'Daily lesson · reviews first' : 'Self-graded review') + '</span>' +
        '</div>' +
        (s.flipped ?
          '<div class="grade-row">' +
            '<button class="grade-btn again" data-g="0"><b>Again</b><small>back to box 1</small></button>' +
            '<button class="grade-btn good" data-g="1"><b>Got it</b><small>' + goodLabel + '</small></button>' +
          '</div>' :
          '<button class="btn btn-primary btn-block" id="reveal">Show answer</button>') +
      '</div></section>';

    MMS.$('#quit', main).addEventListener('click', function () { MMS.go('#/today'); });

    function flip() {
      if (s.flipped) return;
      s.flipped = true;
      MMS.render();
    }
    if (!s.flipped) {
      MMS.$('#cardTap', main).addEventListener('click', flip);
      MMS.$('#reveal', main).addEventListener('click', flip);
    }
    MMS.$('#sayCard', main).addEventListener('click', function (e) {
      e.stopPropagation();
      MMS.speakCN(c.hz);
    });

    if (s.flipped) {
      MMS.$$('[data-g]', main).forEach(function (b) {
        b.addEventListener('click', function () { gradeFlash(s, b.getAttribute('data-g') === '1'); });
      });
    }

    MMS._keyHandler = function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!s.flipped) { e.preventDefault(); flip(); }
      } else if (s.flipped && (e.key === '1' || e.key === '2')) {
        gradeFlash(s, e.key === '2');
      }
    };
    document.addEventListener('keydown', MMS._keyHandler);
  }

  function gradeFlash(s, ok) {
    var c = s.items[s.i];
    Store.grade(c.id, ok);
    if (ok) s.correct++; else s.wrong++;
    var res = Store.cs(c.id).box;
    s.i++;
    s.flipped = false;
    if (ok) MMS.toast('Box ' + res + (res === 5 ? ' — mastered' : ''));
    MMS.render();
  }

  function buildOptions(item) {
    var opts = [item.en], used = {};
    used[item.en] = 1;
    var pools = [
      MMS_CARDS.filter(function (c) { return c.set === item.set; }),
      MMS_CARDS
    ];
    pools.forEach(function (pool) {
      var p = sample(pool, pool.length);
      for (var i = 0; i < p.length && opts.length < 4; i++) {
        if (!used[p[i].en]) { used[p[i].en] = 1; opts.push(p[i].en); }
      }
    });
    return sample(opts, opts.length);
  }

  function ensureQ(s) {
    if (s.prepared === s.i) return;
    s.prepared = s.i;
    s.answered = false;
    s.choice = null;
    s.input = '';
    var it = s.items[s.i];
    if (s.type === 'tone') s.options = [1, 2, 3, 4, 5];
    else if (s.type === 'type') s.options = null;
    else s.options = buildOptions(it);
  }

  function quizView(main, s) {
    ensureQ(s);
    var it = s.items[s.i];
    var correctVal = s.type === 'tone' ? it.tone : it.en;
    var prompt = '';

    if (s.type === 'meaning') {
      prompt = '<div class="q-prompt"><div class="hanzi-xl hz">' + esc(it.hz) + '</div>' +
        '<div class="py py-lg">' + esc(MMS.pinyin(it)) + '</div>' +
        '<div class="hint tiny muted">Pick the meaning</div></div>';
    } else if (s.type === 'char') {
      prompt = '<div class="q-prompt"><div class="hanzi-xl hz">' + esc(it.hz) + '</div>' +
        '<div class="hint tiny muted">Characters only — pick the meaning</div></div>';
    } else if (s.type === 'listen') {
      prompt = '<div class="q-prompt">' +
        '<button class="play-btn lg" id="playQ" aria-label="Play the word">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9a4 4 0 010 6M19 6.5a8 8 0 010 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
        '<div class="small muted">Tap to hear it again · pick the meaning</div></div>';
    } else if (s.type === 'tone') {
      prompt = '<div class="q-prompt">' +
        '<button class="play-btn lg" id="playQ" aria-label="Play the syllable">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9a4 4 0 010 6M19 6.5a8 8 0 010 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
        '<div class="small muted">Which tone did you hear?<br>1 ˉ high · 2 ˊ rising · 3 ˇ dipping · 4 ˋ falling · 5 · neutral</div></div>';
    } else {
      prompt = '<div class="q-prompt"><div class="hanzi-xl hz">' + esc(it.hz) + '</div>' +
        '<div class="small muted">' + esc(it.en) + '</div>' +
        '<div class="hint tiny muted">Type pinyin with tone numbers</div></div>';
    }

    var answerArea = '';
    if (s.type === 'type') {
      answerArea = '<form class="type-box" id="typeForm">' +
        '<input id="typeInput" value="' + esc(s.input || '') + '" placeholder="e.g. ni3hao3" autocomplete="off" autocapitalize="none" spellcheck="false"' +
        (s.answered ? ' disabled' : '') + '>' +
        (s.answered ? '' : '<button class="btn btn-primary" type="submit" style="min-width:96px">Check</button>') +
        '</form>';
    } else {
      var opts = s.options.map(function (o, idx) {
        var cls = 'opt', mark = '';
        var isCorrect = (s.type === 'tone') ? (o === correctVal) : (o === correctVal);
        var isChoice = (s.type === 'tone') ? (o === s.choice) : (o === s.choice);
        if (s.answered) {
          if (isCorrect) { cls += ' correct'; mark = '✓'; }
          else if (isChoice) { cls += ' wrong'; mark = '✕'; }
        }
        var label;
        if (s.type === 'tone') {
          var t = MMS.toneInfo(o);
          label = '<span class="tnum" style="font-weight:700;min-width:22px">' + t.n + '</span>' +
                  '<span class="tshape" style="font-size:18px">' + t.shape + '</span>' +
                  '<span>' + esc(t.name) + '</span>';
        } else {
          label = '<span>' + esc(o) + '</span>';
        }
        return '<button class="opt ' + cls + '" data-opt="' + idx + '"' + (s.answered ? ' disabled' : '') + '>' +
          label + '<span class="mark">' + mark + '</span></button>';
      }).join('');
      answerArea = '<div class="opts">' + opts + '</div>';
    }

    var fb = '';
    if (s.answered) {
      var ok = (s.type === 'tone') ? (s.choice === correctVal) : (s.choice === correctVal);
      if (s.type === 'type') ok = s.lastOK;
      fb = '<div class="feedback ' + (ok ? 'ok' : 'no') + '">' +
        '<div class="headline">' + (ok ? 'Correct' : 'Not quite') + '</div>' +
        '<div class="row" style="gap:10px;flex-wrap:wrap"><span class="hanzi-lg">' + esc(it.hz) + '</span>' +
          '<span class="py">' + esc(it.py || MMS.pinyin(it)) + '</span></div>' +
        (s.type === 'tone'
          ? '<div class="small muted">' + esc(it.en) + ' — ' + MMS.toneChipHTML(it.tone) + '</div>'
          : '<div class="small muted">' + esc(it.en) + '</div>' + MMS.toneChipsHTML(it)) +
        (s.type === 'type' ? '<div class="tiny muted">Answer: <b>' + esc(MMS.pinyin(it)) + '</b> · ' + esc(MMS.toneString(it)) + '</div>' : '') +
        '</div>' +
        '<button class="btn btn-primary btn-block" id="next" style="margin-top:4px">' +
          (s.i + 1 >= s.items.length ? 'See results' : 'Next') + '</button>';
    }

    main.innerHTML = '<section class="screen">' + exitBar(s) + progressBar(s) +
      '<div class="flash-meta"><span>' + (s.i + 1) + ' / ' + s.items.length + '</span>' +
      '<span>' + esc(modeLabel(s.type)) + '</span></div>' +
      prompt + answerArea + fb + '</section>';

    MMS.$('#quit', main).addEventListener('click', function () { MMS.go('#/today'); });

    var play = MMS.$('#playQ', main);
    if (play) {
      play.addEventListener('click', function () { MMS.speakCN(s.type === 'tone' ? it.hz : it.hz); });
      if (!s.answered && s.playedFor !== s.i && MMS.Audio.ok()) {
        s.playedFor = s.i;
        MMS.speakCN(it.hz);
      }
    }

    if (s.type === 'type' && !s.answered) {
      var form = MMS.$('#typeForm', main);
      var input = MMS.$('#typeInput', main);
      if (input) input.focus();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (s.answered) return;
        var val = input.value.trim();
        if (!val) { MMS.toast('Type an answer first.'); return; }
        s.input = val;
        var ok2 = MMS.typedOK(val, it);
        s.lastOK = ok2;
        s.answered = true;
        s.choice = val;
        Store.grade(it.id, ok2);
        if (ok2) s.correct++; else { s.wrong++; s.missed.push(it); }
        MMS.render();
      });
    }

    MMS.$$('[data-opt]', main).forEach(function (b) {
      b.addEventListener('click', function () {
        if (s.answered) return;
        var idx = Number(b.getAttribute('data-opt'));
        var val = s.options[idx];
        s.choice = val;
        s.answered = true;
        var ok3 = (s.type === 'tone') ? (val === it.tone) : (val === it.en);
        if (s.type === 'tone') {
          // tone drills are practice only — no Leitner grading
        } else {
          Store.grade(it.id, ok3);
        }
        if (ok3) s.correct++; else { s.wrong++; s.missed.push(it); }
        MMS.render();
      });
    });

    var next = MMS.$('#next', main);
    if (next) {
      next.addEventListener('click', function () {
        s.i++;
        s.prepared = -1;
        MMS.render();
      });
    }

    MMS._keyHandler = function (e) {
      if (!s.answered && s.options && /^[1-4]$/.test(e.key) && s.type !== 'tone') {
        var b = MMS.$$('[data-opt]', main)[Number(e.key) - 1];
        if (b) b.click();
      } else if (s.answered && (e.key === 'Enter' || e.key === ' ')) {
        var nb = MMS.$('#next', main);
        if (nb) { e.preventDefault(); nb.click(); }
      }
    };
    document.addEventListener('keydown', MMS._keyHandler);
  }

  function modeLabel(type) {
    return ({ meaning: 'Multiple choice', char: 'Character recognition', listen: 'Listening', tone: 'Tone identification', type: 'Pinyin typing' })[type] || '';
  }

  function summary(main, s) {
    var total = s.correct + s.wrong;
    var p = total ? Math.round((s.correct / total) * 100) : 0;
    var daily = Store.state.daily;
    var missed = (s.missed || []).slice(0, 6);

    main.innerHTML = '<section class="screen">' +
      '<div class="card" style="text-align:center;padding:24px 16px">' +
        '<div class="tiny" style="letter-spacing:.12em;text-transform:uppercase;color:var(--muted-2)">' + esc(s.title) + '</div>' +
        '<div style="font-size:44px;font-weight:700;letter-spacing:-1px;margin:6px 0">' + p + '%</div>' +
        '<p class="small muted">' + s.correct + ' correct · ' + s.wrong + ' to review</p>' +
        '<div class="bar" style="margin-top:12px"><i style="width:' + p + '%"></i></div>' +
        (s.daily ? '<p class="tiny" style="color:#9fe9ce;margin-top:12px">Today: ' + daily.a + ' answers · ' + Store.masteredCount() + ' words mastered</p>' : '') +
      '</div>' +
      (missed.length ? '<div class="card tight"><div class="section-title" style="margin-bottom:6px">Worth another look</div>' +
        missed.map(function (c) {
          return '<div class="phrase-row"><div class="phrase-body"><div class="phrase-hz">' + esc(c.hz) + '</div>' +
            '<div class="phrase-py">' + esc(c.py || MMS.pinyin(c)) + '</div>' +
            '<div class="phrase-en">' + esc(c.en) + '</div></div></div>';
        }).join('') + '</div>' : '') +
      '<div class="stack">' +
        '<button class="btn btn-primary btn-block" id="again">Practise again</button>' +
        '<button class="btn btn-ghost btn-block" id="home">Back to Today</button>' +
      '</div></section>';

    MMS.$('#home', main).addEventListener('click', function () { MMS.App.session = null; MMS.go('#/today'); });
    MMS.$('#again', main).addEventListener('click', function () {
      var ids = s.items.map(function (c) { return c.id; });
      if (s.kind === 'flash') startFlash(ids, { title: s.title, daily: s.daily });
      else startQuiz({ type: s.type, items: sample(s.items, s.items.length), title: s.title });
    });
  }

  MMS.views._startDaily = startDaily;
  MMS.views._startQuizMode = startQuizMode;
})();
