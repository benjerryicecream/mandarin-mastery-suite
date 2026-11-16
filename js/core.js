/* core.js — utilities, pinyin, storage, audio, UI primitives */
(function () {
  var MMS = window.MMS = window.MMS || {};

  /* ---------------- DOM helpers ---------------- */
  MMS.$ = function (sel, root) { return (root || document).querySelector(sel); };
  MMS.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  MMS.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  MMS.go = function (hash) { if (location.hash === hash) { MMS.render(); } else { location.hash = hash; } };

  /* ---------------- pinyin ---------------- */
  var MARKS = {
    a: ['ā', 'á', 'ǎ', 'à'], e: ['ē', 'é', 'ě', 'è'], i: ['ī', 'í', 'ǐ', 'ì'],
    o: ['ō', 'ó', 'ǒ', 'ò'], u: ['ū', 'ú', 'ǔ', 'ù'], 'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
  };

  MMS.markOf = function (syl, tone) {
    var s = String(syl).toLowerCase().replace(/v/g, 'ü').replace(/u:/g, 'ü');
    if (!tone || tone === 5) return s;
    var idx = -1;
    if (s.indexOf('a') >= 0) idx = s.indexOf('a');
    else if (s.indexOf('o') >= 0) idx = s.indexOf('o');
    else if (s.indexOf('e') >= 0) idx = s.indexOf('e');
    else if (s.indexOf('iu') >= 0) idx = s.indexOf('iu') + 1;
    else if (s.indexOf('ui') >= 0) idx = s.indexOf('ui') + 1;
    else {
      for (var i = s.length - 1; i >= 0; i--) {
        if ('iuü'.indexOf(s[i]) >= 0) { idx = i; break; }
      }
    }
    if (idx < 0) return s;
    var v = s[idx], m = (MARKS[v] || [])[tone - 1];
    return m ? s.slice(0, idx) + m + s.slice(idx + 1) : s;
  };

  MMS.pinyin = function (card) {
    if (!card || !card.syl) return '';
    var out = '';
    card.syl.forEach(function (p, i) {
      var py = MMS.markOf(p[0], p[1]);
      if (i > 0 && /^[aoe]/.test(String(p[0]))) out += "'";
      out += py;
    });
    return out;
  };

  MMS.toneString = function (card) {
    return card.syl.map(function (p) { return String(p[0]).replace(/ü/g, 'v').replace(/u:/g, 'v') + (p[1] || 5); }).join('');
  };

  MMS.toneStringAlt = function (card) {
    return card.syl.map(function (p) { return String(p[0]).replace(/ü/g, 'v').replace(/u:/g, 'v') + (p[1] === 5 ? 0 : (p[1] || 5)); }).join('');
  };

  function flatNorm(s) {
    return String(s).toLowerCase()
      .replace(/[’'`\s\-·.]/g, '')
      .replace(/u:/g, 'ü');
  }
  MMS.typedOK = function (input, card) {
    var a = flatNorm(input).replace(/v/g, 'ü');
    var b = flatNorm(MMS.pinyin(card));
    if (a && a === b) return true;
    var numNorm = String(input).toLowerCase().replace(/[’'`\s\-·.]/g, '').replace(/u:/g, 'v').replace(/ü/g, 'v');
    if (numNorm === MMS.toneString(card) || numNorm === MMS.toneStringAlt(card)) return true;
    var alts = card.alt || [];
    for (var i = 0; i < alts.length; i++) {
      if (flatNorm(input).replace(/v/g, 'ü') === flatNorm(alts[i]).replace(/v/g, 'ü')) return true;
      if (numNorm === String(alts[i]).toLowerCase().replace(/[’'`\s\-·.]/g, '').replace(/u:/g, 'v').replace(/ü/g, 'v')) return true;
    }
    return false;
  };

  /* ---------------- dates ---------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  MMS.dayKey = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  MMS.addDays = function (key, n) {
    var p = key.split('-').map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2]);
    dt.setDate(dt.getDate() + n);
    return MMS.dayKey(dt);
  };

  /* ---------------- card index ---------------- */
  MMS.cardById = {};
  (window.MMS_CARDS || []).forEach(function (c) { MMS.cardById[c.id] = c; });
  MMS.setById = {};
  (window.MMS_SETS || []).forEach(function (s) { MMS.setById[s.id] = s; });
  MMS.cardsOfSet = function (id) {
    return (window.MMS_CARDS || []).filter(function (c) { return c.set === id; });
  };

  /* ---------------- store ---------------- */
  var KEY = 'mms.v1';
  var BOX_DAYS = { 1: 0, 2: 1, 3: 2, 4: 4, 5: 8 };

  function blank() {
    return {
      v: 1,
      cards: {},
      totals: { a: 0, c: 0 },
      perSet: {},
      streak: { n: 0, best: 0, last: null },
      daily: { key: null, a: 0, new: 0, quiz: 0, done: false },
      settings: { goal: 20, rate: 0.85 },
      writer: { char: 0 },
      flags: {}
    };
  }

  var Store = MMS.Store = {
    state: blank(),
    today: function () { return MMS.dayKey(); },
    load: function () {
      var raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
      if (!raw) { this.state = blank(); this.sync(); return; }
      try {
        var s = JSON.parse(raw);
        var d = blank();
        this.state = {
          v: 1,
          cards: s.cards || {},
          totals: s.totals || d.totals,
          perSet: s.perSet || {},
          streak: s.streak || d.streak,
          daily: s.daily || d.daily,
          settings: Object.assign(d.settings, s.settings || {}),
          writer: s.writer || d.writer,
          flags: s.flags || {}
        };
      } catch (e) {
        this.state = blank();
      }
      this.sync();
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); }
      catch (e) {
        if (!this._warned) { this._warned = true; MMS.toast('Progress could not be saved (storage blocked).'); }
      }
    },
    sync: function () {
      var t = this.today();
      if (!this.state.daily || this.state.daily.key !== t) {
        this.state.daily = { key: t, a: 0, new: 0, quiz: 0, done: false };
      }
      // a streak survives only if the last study day is today or yesterday
      var s = this.state.streak;
      if (s.last && s.last !== t && s.last !== MMS.addDays(t, -1)) s.n = 0;
    },
    cs: function (id) {
      var c = this.state.cards[id];
      if (!c) {
        c = { box: 0, seen: 0, ok: 0, bad: 0, due: null, last: null };
        this.state.cards[id] = c;
      }
      return c;
    },
    box: function (id) { return this.cs(id).box || 0; },
    isDue: function (id) {
      var c = this.cs(id);
      if (!c.box) return false;
      return !c.due || c.due <= this.today();
    },
    dueCards: function (setId) {
      var t = this.today(), self = this;
      return (window.MMS_CARDS || []).filter(function (c) {
        if (setId && c.set !== setId) return false;
        var st = self.cs(c.id);
        return st.box >= 1 && (!st.due || st.due <= t);
      }).sort(function (a, b) {
        var A = self.cs(a.id), B = self.cs(b.id);
        return (A.box - B.box) || String(A.due).localeCompare(String(B.due)) || (a.order - b.order);
      });
    },
    newCards: function (setId) {
      var self = this;
      return (window.MMS_CARDS || []).filter(function (c) {
        if (setId && c.set !== setId) return false;
        return !self.cs(c.id).box;
      });
    },
    learnedCount: function (setId) {
      var self = this;
      return (window.MMS_CARDS || []).filter(function (c) {
        return (!setId || c.set === setId) && self.cs(c.id).box > 0;
      }).length;
    },
    masteredCount: function () {
      var self = this;
      return (window.MMS_CARDS || []).filter(function (c) { return self.cs(c.id).box >= 5; }).length;
    },
    boxDist: function () {
      var d = [0, 0, 0, 0, 0, 0], self = this;
      (window.MMS_CARDS || []).forEach(function (c) { d[Math.max(0, self.cs(c.id).box)]++; });
      return d; // index 0 = new, 1-5 = box 1-5
    },
    acc: function (setId) {
      var a = 0, c = 0;
      if (setId) {
        var s = this.state.perSet[setId] || { a: 0, c: 0 };
        a = s.a; c = s.c;
      } else { a = this.state.totals.a; c = this.state.totals.c; }
      return a ? Math.round((c / a) * 100) : null;
    },
    grade: function (id, ok) {
      var st = this.state, self = this;
      this.sync();
      var c = this.cs(id), card = MMS.cardById[id];
      var from = c.box || 0;
      c.seen++;
      c.last = this.today();
      if (ok) { c.ok++; c.box = Math.min(5, from + 1); }
      else { c.bad++; c.box = 1; }
      c.due = MMS.addDays(this.today(), BOX_DAYS[c.box]);

      st.totals.a++;
      if (ok) st.totals.c++;

      var sid = card ? card.set : 'other';
      if (!st.perSet[sid]) st.perSet[sid] = { a: 0, c: 0 };
      st.perSet[sid].a++;
      if (ok) st.perSet[sid].c++;

      st.daily.a++;
      if (!from) st.daily.new++;

      if (st.streak.last !== this.today()) {
        st.streak.n = (st.streak.last === MMS.addDays(this.today(), -1)) ? (st.streak.n + 1) : 1;
        st.streak.best = Math.max(st.streak.best || 0, st.streak.n);
        st.streak.last = this.today();
      }
      self.save();
      return { from: from, to: c.box };
    },
    markDailyDone: function () {
      this.sync();
      this.state.daily.done = true;
      this.state.daily.quiz++;
      this.save();
    },
    newQuota: function () {
      this.sync();
      return Math.max(0, 5 - (this.state.daily.new || 0));
    },
    dueCount: function () { return this.dueCards().length; },
    reset: function () {
      this.state = blank();
      this.sync();
      this.save();
    }
  };

  /* ---------------- audio ---------------- */
  var Audio = MMS.Audio = {
    supported: typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined',
    voices: [],
    zh: null,
    checked: false,
    init: function () {
      if (!this.supported) { this.checked = true; return; }
      var self = this;
      var load = function () {
        try { self.voices = window.speechSynthesis.getVoices() || []; } catch (e) { self.voices = []; }
        self.pick();
      };
      load();
      try { window.speechSynthesis.addEventListener('voiceschanged', load); } catch (e) {}
      setTimeout(load, 400);
      setTimeout(load, 1400);
    },
    pick: function () {
      var best = null;
      for (var i = 0; i < this.voices.length; i++) {
        var v = this.voices[i];
        var lang = (v.lang || '').toLowerCase().replace('_', '-');
        var name = v.name || '';
        if (lang.indexOf('zh') === 0 || lang.indexOf('cmn') === 0) {
          if (!best) best = v;
          if (/CN|Hans|简体/i.test(v.lang + name)) { best = v; break; }
        } else if (!best && /Chinese|Mandarin|普通话|中文|Huihui|Yaoyao|Tingting|Xiaoxiao|Yunxi|Kangkang/i.test(name)) {
          best = v;
        }
      }
      var changed = (!!best !== !!this.zh);
      this.zh = best;
      this.checked = true;
      if (changed) {
        document.dispatchEvent(new CustomEvent('mms:voicechange', { detail: { has: !!best } }));
        var dot = document.getElementById('audioDot');
        if (dot) dot.className = 'audio-dot ' + (best ? 'ok' : 'none');
      }
    },
    ok: function () { return !!this.zh; },
    label: function () {
      if (!this.supported) return 'No speech support';
      return this.zh ? ('Chinese voice: ' + this.zh.name) : 'No Chinese voice installed';
    },
    speak: function (text, opts) {
      opts = opts || {};
      if (!this.supported) return false;
      if (!this.zh) return false;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        u.voice = this.zh;
        u.rate = opts.rate || Store.state.settings.rate || 0.85;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) { return false; }
    },
    stop: function () {
      if (this.supported) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    }
  };

  /* ---------------- UI primitives ---------------- */
  var toastTimer = null;
  MMS.toast = function (msg, ms) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, ms || 2200);
  };

  MMS.closeModal = function () {
    var root = document.getElementById('modalRoot');
    if (root) root.innerHTML = '';
  };

  MMS.modal = function (opts) {
    var root = document.getElementById('modalRoot');
    if (!root) return;
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + MMS.esc(opts.title || 'Dialog') + '">' +
        '<h2>' + MMS.esc(opts.title || '') + '</h2>' +
        '<div class="modal-body">' + (opts.html || '') + '</div>' +
        '<div class="modal-actions"></div>' +
      '</div>';
    var actions = back.querySelector('.modal-actions');
    (opts.actions || [{ label: 'Close' }]).forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + (a.primary ? 'btn-primary' : 'btn-ghost') + ' btn-block';
      b.textContent = a.label;
      b.addEventListener('click', function () {
        if (a.onClick) a.onClick();
        if (a.keepOpen !== true) MMS.closeModal();
      });
      actions.appendChild(b);
    });
    if (opts.dismissible !== false) {
      back.addEventListener('click', function (e) { if (e.target === back) MMS.closeModal(); });
    }
    root.innerHTML = '';
    root.appendChild(back);
  };

  MMS.voiceHelp = function () {
    MMS.modal({
      title: 'No Chinese voice on this device',
      html:
        '<p>This app speaks Chinese with your browser’s built-in speech voice. Right now the browser only reports non-Chinese voices, ' +
        'so listening exercises and tone playback are switched off. Everything else — flashcards, quizzes, stroke practice, dialogues — still works.</p>' +
        '<p class="small" style="margin-top:4px"><b>Windows:</b> Settings → Time &amp; Language → Language &amp; region → Add a language → 中文(简体) → tick “Speech”. Then restart the browser.</p>' +
        '<p class="small"><b>Android:</b> Settings → System → Languages &amp; input → Text-to-speech output → install a Chinese voice (e.g. Google 普通话).</p>' +
        '<p class="small"><b>iPhone / iPad:</b> Settings → Accessibility → Spoken Content → Voices → Chinese (China) → download a voice.</p>' +
        '<p class="small"><b>macOS:</b> System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → 中文（中国大陆）.</p>',
      actions: [
        { label: 'Check again', onClick: function () {
          Audio.init();
          setTimeout(function () {
            if (Audio.ok()) {
              MMS.toast('Chinese voice found: ' + Audio.zh.name);
              MMS.closeModal();
              MMS.render();
            } else {
              MMS.toast('Still no Chinese voice — install the speech pack, then restart the browser.');
            }
          }, 1000);
        }, keepOpen: true },
        { label: 'Continue without audio', primary: true }
      ]
    });
  };

  MMS.requireVoice = function () {
    if (!Audio.supported) {
      MMS.modal({
        title: 'Speech not available',
        html: '<p>This browser does not support the Web Speech API, so audio playback cannot work here. ' +
              'Try Chrome, Edge or Safari. All reading and writing features still work.</p>',
        actions: [{ label: 'OK', primary: true }]
      });
      return false;
    }
    if (!Audio.zh) { MMS.voiceHelp(); return false; }
    return true;
  };

  MMS.speakCN = function (text, opts) {
    if (!MMS.requireVoice()) return false;
    var ok = Audio.speak(text, opts);
    if (!ok) MMS.toast('Audio could not start.');
    return ok;
  };

  /* tone UI helpers */
  MMS.toneInfo = function (n) {
    return (window.MMS_TONES || []).filter(function (t) { return t.n === (n || 5); })[0] || window.MMS_TONES[4];
  };
  MMS.toneChipHTML = function (n) {
    var t = MMS.toneInfo(n);
    return '<span class="tone-chip" title="Tone ' + t.n + ' — ' + MMS.esc(t.name) + '">' +
      '<span class="tshape" aria-hidden="true">' + t.shape + '</span>' +
      '<span class="tnum">Tone ' + t.n + '</span>' +
      '<span class="tname">' + MMS.esc(t.name) + '</span></span>';
  };
  MMS.toneChipsHTML = function (card) {
    return '<div class="tone-chips">' + card.syl.map(function (p) { return MMS.toneChipHTML(p[1]); }).join('') + '</div>';
  };

  /* ---------------- app shell state ---------------- */
  MMS.App = { session: null };

  MMS.App.go = MMS.go;
})();
