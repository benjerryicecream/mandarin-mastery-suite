/* app.js — routing, shell, boot */
(function () {
  var MMS = window.MMS, Store = MMS.Store, V = MMS.views;

  var TABS = ['today', 'cards', 'quiz', 'tones', 'more'];

  function parse() {
    var h = String(location.hash || '').replace(/^#/, '');
    return h.split('/').filter(Boolean);
  }

  function tabFor(parts) {
    var p = parts[0] || 'today';
    if (p === 'set' || p === 'cards') return 'cards';
    if (p === 'quiz') return 'quiz';
    if (p === 'tones') return 'tones';
    if (p === 'today') return 'today';
    if (p === 'session') return '';
    return 'more';
  }

  function setTab(name) {
    MMS.$$('#tabbar a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-tab') === name);
      if (a.getAttribute('data-tab') === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  MMS.render = function () {
    var main = document.getElementById('main');
    if (!main) return;
    if (MMS._keyHandler) {
      document.removeEventListener('keydown', MMS._keyHandler);
      MMS._keyHandler = null;
    }

    var parts = parse();
    var route = '/' + parts.join('/');
    var changed = route !== MMS._lastRoute;
    var y = window.scrollY;

    if (changed) MMS.Audio.stop();
    main.innerHTML = '';

    var p0 = parts[0] || 'today';
    if (p0 === 'today') V.today(main);
    else if (p0 === 'cards') V.cards(main);
    else if (p0 === 'set') V.setDetail(main, parts[1]);
    else if (p0 === 'quiz') {
      if (parts[1]) V.quizScope(main, parts[1]);
      else V.quizHome(main);
    }
    else if (p0 === 'session') V.session(main);
    else if (p0 === 'tones') V.tones(main);
    else if (p0 === 'write') V.writer(main);
    else if (p0 === 'dialogues') V.dialogues(main);
    else if (p0 === 'dialogue') V.dialogue(main, parts[1]);
    else if (p0 === 'phrases') V.phrases(main);
    else if (p0 === 'progress') V.progress(main);
    else if (p0 === 'more') V.more(main);
    else { location.hash = '#/today'; return; }

    var back = document.getElementById('backBtn');
    if (back) {
      var isTab = parts.length <= 1 && TABS.indexOf(p0) >= 0;
      back.hidden = isTab;
    }
    setTab(tabFor(parts));
    document.body.classList.toggle('session-mode', p0 === 'session');

    if (changed) window.scrollTo(0, 0);
    else window.scrollTo(0, y);

    if (main.querySelector('.feedback') && !changed) {
      var fb = main.querySelector('.feedback');
      try { fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }

    MMS._lastRoute = route;
  };

  function boot() {
    Store.load();
    MMS.Audio.init();

    var dot = document.getElementById('audioDot');
    if (dot) dot.className = 'audio-dot ' + (MMS.Audio.ok() ? 'ok' : 'none');

    document.addEventListener('mms:voicechange', function (e) {
      var d = document.getElementById('audioDot');
      if (d) d.className = 'audio-dot ' + (e.detail && e.detail.has ? 'ok' : 'none');
      // a voice arrived or vanished while the app is open: refresh the screen that shows the state
      if (!MMS.App.session && document.getElementById('main') && MMS._lastRoute) MMS.render();
    });

    document.getElementById('backBtn').addEventListener('click', function () {
      if (history.length > 1) history.back();
      else location.hash = '#/today';
    });

    document.getElementById('audioBtn').addEventListener('click', function () {
      if (MMS.Audio.ok()) {
        MMS.modal({
          title: 'Chinese voice ready',
          html: '<p>' + MMS.esc(MMS.Audio.zh.name) + ' · ' + MMS.esc(MMS.Audio.zh.lang) + '</p>' +
                '<p class="small">Every Chinese word in the app is spoken with this voice. If it sounds robotic, install a better Chinese voice in your system settings.</p>',
          actions: [
            { label: 'Play a sample', onClick: function () { MMS.speakCN('你好，很高兴认识你。'); }, keepOpen: true },
            { label: 'Close', primary: true }
          ]
        });
      } else {
        MMS.voiceHelp();
      }
    });

    window.addEventListener('hashchange', MMS.render);
    if (!location.hash) location.hash = '#/today';
    MMS.render();

    // first-run audio check (after voices have had a moment to load)
    setTimeout(function () {
      if (!Store.state.flags.voiceIntro) {
        Store.state.flags.voiceIntro = true;
        Store.save();
        if (!MMS.Audio.ok()) MMS.voiceHelp();
      }
      var d = document.getElementById('audioDot');
      if (d) d.className = 'audio-dot ' + (MMS.Audio.ok() ? 'ok' : 'none');
    }, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
