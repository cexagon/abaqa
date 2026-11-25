/* Abaqa TK: suara dulu, gambar besar, tanpa hukuman. Data dari window.TK (data.js). */
(function () {
  'use strict';
  var D = window.TK || {};
  var KEY = 'abaqa-tk';
  var COL = ['#D9651B', '#3F8A30', '#1E7FD6', '#8E24AA', '#D32F2F', '#A87B00'];
  var PRAISE = ['Hebat!', 'Pintar!', 'Masyaallah, benar!', 'Bagus sekali!'];
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function icon(id) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- simpan ---------- */
  var S = { stars: 0, opened: {} };
  try { var raw = JSON.parse(localStorage.getItem(KEY)); if (raw && typeof raw === 'object') { S.stars = +raw.stars || 0; S.opened = raw.opened || {}; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function seen(sec, id) { return !!(S.opened[sec] && S.opened[sec][id]); }
  function markSeen(sec, id) { (S.opened[sec] = S.opened[sec] || {})[id] = 1; save(); }
  function drawStars() { document.querySelectorAll('.chip.stars b').forEach(function (b) { b.textContent = S.stars; }); }

  /* ---------- suara ---------- */
  var synth = window.speechSynthesis || null, voice = null, token = 0, timer = null;
  function pickVoice() {
    try {
      var vs = synth ? synth.getVoices() : [];
      voice = null;
      for (var i = 0; i < vs.length; i++) if (/^id([-_]|$)/i.test(vs[i].lang)) { voice = vs[i]; break; }
    } catch (e) { voice = null; }
  }
  if (synth) { pickVoice(); try { synth.addEventListener('voiceschanged', pickVoice); } catch (e) { synth.onvoiceschanged = pickVoice; } }
  function stopSay() { token++; clearTimeout(timer); try { if (synth) synth.cancel(); } catch (e) {} }
  /* parts: teks (diucapkan) atau angka (jeda ms). done dipanggil setelah semua selesai. */
  function say(parts, done) {
    stopSay();
    var my = token, i = 0;
    function next() {
      if (my !== token) return;
      if (i >= parts.length) { if (done) done(); return; }
      var p = parts[i++];
      if (typeof p === 'number') { timer = setTimeout(next, p); return; }
      var finished = false;
      function fin() { if (finished || my !== token) return; finished = true; clearTimeout(timer); next(); }
      try {
        if (!synth || typeof SpeechSynthesisUtterance === 'undefined') throw 0;
        var u = new SpeechSynthesisUtterance(p);
        u.lang = 'id-ID'; u.rate = 0.85; u.pitch = 1.1;
        if (voice) u.voice = voice;
        u.onend = fin; u.onerror = fin;
        synth.speak(u);
        timer = setTimeout(fin, 1500 + p.length * 130);
      } catch (e) { timer = setTimeout(fin, 500); }
    }
    next();
  }

  /* ---------- bagian ---------- */
  var arabIdx = 0;
  var SEC = {
    huruf: {
      name: 'Huruf A–Z', say: 'Huruf', list: D.huruf || [], tint: '#FFE3C2', hue: '#E8742A', deep: '#B8501A', idle: 'huruf',
      id: function (x) { return x.h; }, same: function (x) { return x.ucap; },
      glyph: function (x) { return esc(x.h); }, label: function (x) { return 'Huruf ' + x.h; },
      speak: function (x) { return [x.ucap, 700, x.ucap + ', ' + x.kata.toLowerCase() + '!']; },
      ask: function (x) { return 'Mana huruf ' + x.ucap + '?'; }
    },
    angka: {
      name: 'Angka 1–10', say: 'Angka', list: D.angka || [], tint: '#D8ECFB', hue: '#1E7FD6', deep: '#145CA0', idle: 'angka',
      id: function (x) { return x.n; }, same: function (x) { return x.kata; },
      glyph: function (x) { return x.n; }, label: function (x) { return 'Angka ' + x.n; },
      speak: function (x) { return [cap(x.kata) + '!']; },
      ask: function (x) { return 'Mana angka ' + x.kata + '?'; }
    },
    hijaiah: {
      name: 'Huruf Hijaiah', say: 'Huruf hijaiah', list: D.hijaiah || [], tint: '#DDEFCB', hue: '#3F8A30', deep: '#2F6E24', idle: 'huruf',
      id: function (x) { return x.h; }, same: function (x) { return x.ucap || x.nama; },
      glyph: function (x) { return '<span class="arab" lang="ar" dir="rtl">' + esc(x.h) + '</span>'; }, label: function (x) { return 'Huruf ' + x.nama; },
      speak: function (x) { return [x.ucap || x.nama]; },
      ask: function (x) { return 'Mana huruf ' + (x.ucap || x.nama) + '?'; }
    },
    warna: {
      name: 'Warna', say: 'Warna', list: D.warna || [], tint: '#FBD9E6', hue: '#C2185B', deep: '#8E1245', idle: 'warna',
      id: function (x) { return x.nama; }, same: function (x) { return x.nama; },
      glyph: function (x) { return '<span class="sw" style="background:' + esc(x.hex) + '"></span>'; }, label: function (x) { return 'Warna ' + x.nama; },
      speak: function (x) { return [cap(x.nama) + '!']; },
      ask: function (x) { return 'Mana warna ' + x.nama + '?'; }
    },
    bentuk: {
      name: 'Bentuk', say: 'Bentuk', list: D.bentuk || [], tint: '#FFEFB0', hue: '#A87B00', deep: '#7A5800', idle: 'bentuk',
      id: function (x) { return x.nama; }, same: function (x) { return x.nama; },
      glyph: function (x) { return x.svg.replace('<svg', '<svg class="sh" aria-hidden="true"'); }, label: function (x) { return 'Bentuk ' + x.nama; },
      speak: function (x) { return [cap(x.nama) + '!']; },
      ask: function (x) { return 'Mana bentuk ' + x.nama + '?'; }
    }
  };
  var ORDER = ['huruf', 'angka', 'hijaiah', 'warna', 'bentuk'];
  function tileColor(sec, i) { return COL[i % COL.length]; }

  /* ---------- menu ---------- */
  var MENU = {
    huruf: { c: '#E8742A', art: function () { var g = (D.huruf || [])[0]; return '<span class="big">Aa</span>' + (g ? '<img src="' + esc(g.gambar) + '" alt="">' : ''); } },
    angka: { c: '#1E7FD6', art: function () { var g = (D.angka || [])[2]; return '<span class="big">123</span>' + (g ? '' : ''); } },
    hijaiah: { c: '#3F8A30', art: function () { return '<span class="arab" lang="ar" dir="rtl">ب</span>'; } },
    warna: { c: '#C2185B', art: function () { return '<svg viewBox="0 0 130 120" aria-hidden="true"><circle cx="45" cy="45" r="36" fill="#E53935"/><circle cx="85" cy="45" r="36" fill="#FDD835" fill-opacity=".9"/><circle cx="65" cy="80" r="36" fill="#1E88E5" fill-opacity=".85"/></svg>'; } },
    bentuk: { c: '#A87B00', art: function () { return '<svg viewBox="0 0 130 120" aria-hidden="true"><circle cx="30" cy="35" r="24" fill="#E8742A"/><rect x="72" y="12" width="46" height="46" rx="5" fill="#1E88E5"/><path d="M65 108 L35 62 L95 62Z" fill="#3F8A30" stroke="#3F8A30" stroke-width="6" stroke-linejoin="round"/></svg>'; } }
  };
  function buildMenu() {
    var ul = $('#menuCards');
    ul.innerHTML = ORDER.map(function (k) {
      return '<li><a class="m-card" href="#' + k + '" data-k="' + k + '" style="--mc:' + MENU[k].c + '"><span class="m-art">' + MENU[k].art() + '</span><span class="m-name">' + esc(SEC[k].name).replace(/ (A–Z|1–10)$/, '\u00a0$1') + '</span></a></li>';
    }).join('');
    ul.addEventListener('click', function (e) {
      var a = e.target.closest('.m-card'); if (a) say([SEC[a.dataset.k].say]);
    });
  }

  /* ---------- bagian: papan + panggung ---------- */
  var cur = null, sel = -1, counted = 0;
  var sec = $('#sec'), stage = $('#stage'), body = $('#stBody'), board = $('#board');
  /* papan dibungkus supaya ada isyarat "masih ada di bawah" */
  var wrap = document.createElement('div'); wrap.className = 'board-wrap';
  board.parentNode.insertBefore(wrap, board); wrap.appendChild(board);
  var fade = document.createElement('div'); fade.className = 'board-fade'; fade.setAttribute('aria-hidden', 'true'); fade.innerHTML = icon('next'); wrap.appendChild(fade);
  function checkMore() { wrap.classList.toggle('more', board.scrollHeight - board.clientHeight - board.scrollTop > 6); }
  board.addEventListener('scroll', checkMore, { passive: true });
  /* ukuran benda hitung: terbesar yang muat rapi di ruang yang ada, tanpa menimpa angka */
  function fitItems() {
    var box = body.querySelector('.items'); if (!box) return;
    var n = box.children.length, cs = getComputedStyle(box), W = box.clientWidth - 16, gx = 10, gy = 12, H;
    if (cs.flexGrow === '0') H = Math.max(180, Math.min(300, innerHeight * .28)); else { box.style.setProperty('--it', '40px'); H = box.clientHeight - 12; }
    var best = 0, fallback = 40;
    for (var s = 128; s >= 40; s -= 4) {
      var cols = Math.max(1, Math.floor((W + gx) / (s + gx))), rows = Math.ceil(n / cols);
      if (rows * (s + gy) - gy > H) continue;
      if (!fallback || fallback === 40) fallback = s;
      /* hindari satu benda sendirian di baris terakhir */
      if (rows > 1 && n % cols === 1) continue;
      best = s; break;
    }
    if (!best) best = fallback;
    box.style.setProperty('--it', best + 'px');
  }
  window.addEventListener('resize', function () { fitItems(); checkMore(); });

  function buildBoard() {
    board.innerHTML = cur.list.map(function (x, i) {
      var c = tileColor(cur.key, i), extra = (cur.key === 'warna' || cur.key === 'bentuk') ? '<small>' + esc(x.nama) + '</small>' : '';
      return '<button class="tile" type="button" role="listitem" aria-pressed="false" aria-label="' + esc(cur.label(x)) + '" data-i="' + i + '" style="--tc:' + c + '">' +
        cur.glyph(x) + extra + (seen(cur.key, cur.id(x)) ? '<svg class="seen" aria-hidden="true"><use href="#i-star"/></svg>' : '') + '</button>';
    }).join('');
    checkMore();
  }
  board.addEventListener('click', function (e) { var t = e.target.closest('.tile'); if (t) select(+t.dataset.i, true); });

  function wordHL(w) { return '<b>' + esc(w.charAt(0)) + '</b>' + esc(w.slice(1)); }
  function renderStage() {
    var x = cur.list[sel], k = cur.key, h = '';
    stage.dataset.state = 'on';
    if (k === 'huruf') {
      h = '<div class="st-main"><div class="st-glyph" aria-hidden="true">' + esc(x.h) + '<small>' + esc(x.h.toLowerCase()) + '</small></div>' +
        '<img class="st-pic" src="' + esc(x.gambar) + '" alt="' + esc(x.kata) + '"></div><div class="st-word">' + wordHL(x.kata) + '</div>';
    } else if (k === 'angka') {
      var ims = '';
      for (var i = 0; i < x.n; i++) ims += '<button class="item" type="button" aria-label="Hitung"><img src="' + esc(x.gambar) + '" alt=""></button>';
      counted = 0;
      h = '<div class="st-main"><div class="st-glyph" aria-hidden="true">' + x.n + '</div></div><div class="items">' + ims + '</div><div class="st-word">' + esc(cap(x.kata)) + '</div>';
    } else if (k === 'hijaiah') {
      h = '<div class="st-glyph arab" lang="ar" dir="rtl">' + esc(x.h) + '</div><div class="st-word">' + esc(x.nama) + '</div>';
    } else if (k === 'warna') {
      h = '<div class="st-swatch" style="background:' + esc(x.hex) + '"><img src="' + esc(x.gambar) + '" alt=""></div><div class="st-word">' + esc(cap(x.nama)) + '</div>';
    } else {
      h = '<div class="st-main"><div class="st-shape" aria-hidden="true">' + x.svg + '</div>' + (x.contoh ? '<div class="st-eg"><img src="' + esc(x.contoh) + '" alt=""></div>' : '') + '</div><div class="st-word">' + esc(cap(x.nama)) + '</div>';
    }
    body.innerHTML = h;
    if (k === 'angka') fitItems();
  }
  function renderIdle() {
    stage.dataset.state = 'idle';
    var g = '../home/kancil.svg';
    body.innerHTML = '<div class="st-idle"><img src="' + g + '" alt=""><p>' + icon('hand') + 'Ketuk satu ' + cur.idle + '</p></div>';
  }
  function select(i, speak) {
    var n = cur.list.length; if (!n) return;
    sel = (i + n) % n;
    var x = cur.list[sel];
    board.querySelectorAll('.tile').forEach(function (t, j) { t.setAttribute('aria-pressed', j === sel ? 'true' : 'false'); });
    var t = board.children[sel];
    if (t) {
      if (!t.querySelector('.seen') && !seen(cur.key, cur.id(x))) t.insertAdjacentHTML('beforeend', '<svg class="seen" aria-hidden="true"><use href="#i-star"/></svg>');
      try { t.scrollIntoView({ block: 'nearest' }); } catch (e) {}
    }
    markSeen(cur.key, cur.id(x));
    renderStage();
    if (speak !== false) say(cur.speak(x));
  }
  function repeat() { if (sel < 0) { say(['Ketuk satu ' + cur.idle + ', ya']); return; } var x = cur.list[sel]; if (cur.key === 'angka') { counted = 0; resetItems(); } say(cur.speak(x)); }
  function resetItems() { body.querySelectorAll('.item').forEach(function (b) { b.classList.remove('on'); var m = b.querySelector('b'); if (m) m.remove(); }); }
  body.addEventListener('click', function (e) {
    var b = e.target.closest('.item');
    if (b && cur.key === 'angka') {
      var x = cur.list[sel], all = body.querySelectorAll('.item');
      if (counted >= x.n) { counted = 0; resetItems(); }
      counted++;
      if (!b.classList.contains('on')) {
        /* ketukan ke-n selalu dihitung n, di benda mana pun yang diketuk */
        b.classList.add('on'); b.insertAdjacentHTML('beforeend', '<b>' + counted + '</b>');
      } else { counted--; }
      var word = (D.angka[counted - 1] || x).kata;
      say(counted >= x.n ? [word, 350, 'Jadi, ' + x.kata + '!'] : [word]);
      void all; return;
    }
    repeat();
  });
  $('#stSay').addEventListener('click', repeat);
  $('#stPrev').addEventListener('click', function () { select(sel - 1, true); });
  $('#stNext').addEventListener('click', function () { select(sel + 1, true); });
  $('#stageClose').addEventListener('click', function () { sel = -1; board.querySelectorAll('.tile').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); }); renderIdle(); stopSay(); });

  /* ---------- kuis ---------- */
  var Q = null;
  function startQuiz() {
    var pool = shuffle(cur.list), order = [], used = {};
    pool.forEach(function (x) { var s = cur.same(x); if (order.length < 5 && !used[s]) { used[s] = 1; order.push(x); } });
    Q = { order: order, i: 0, wrong: 0, lock: false, got: 0 };
    $('#celebrate').hidden = true;
    drawQStars();
    askQ(true);
  }
  function drawQStars() {
    var h = ''; for (var i = 0; i < 5; i++) h += '<svg class="' + (i < Q.got ? 'on' : '') + '"><use href="#i-star"/></svg>';
    $('#qStars').innerHTML = h;
  }
  function askQ(speak) {
    var x = Q.order[Q.i], key = cur.same(x);
    Q.wrong = 0; Q.lock = false; Q.target = x;
    /* pengecoh: tidak boleh punya ucap/nama sama dengan jawaban (mis. dua huruf "ha") dan tidak saling sama */
    var seenKeys = {}; seenKeys[key] = 1;
    var others = [];
    shuffle(cur.list).forEach(function (y) { var s = cur.same(y); if (!seenKeys[s] && others.length < 3) { seenKeys[s] = 1; others.push(y); } });
    var ch = shuffle([x].concat(others));
    $('#qText').textContent = cur.ask(x);
    $('#choices').innerHTML = ch.map(function (y, i) {
      return '<button class="ch" type="button" data-ok="' + (y === x ? 1 : 0) + '" aria-label="' + esc(cur.label(y)) + '" style="--tc:' + COL[(i + Q.i) % COL.length] + '">' + cur.glyph(y) + '</button>';
    }).join('');
    if (speak !== false) say([cur.ask(x)]);
  }
  $('#qSay').addEventListener('click', function () { if (Q) say([cur.ask(Q.target)]); });
  function burst(el) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 14; i++) {
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), a = Math.random() * 6.28, d = 90 + Math.random() * 90;
      s.setAttribute('class', 'conf'); s.setAttribute('viewBox', '0 0 24 24');
      s.style.cssText = 'left:' + (cx - 11) + 'px;top:' + (cy - 11) + 'px;--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px;--k:' + COL[i % COL.length];
      s.innerHTML = '<use href="#i-star"/>';
      document.body.appendChild(s);
      (function (n) { setTimeout(function () { n.remove(); }, 1000); })(s);
    }
  }
  $('#choices').addEventListener('click', function (e) {
    var b = e.target.closest('.ch'); if (!b || !Q || Q.lock) return;
    if (b.dataset.ok === '1') {
      Q.lock = true; Q.got++; S.stars++; save(); drawStars(); drawQStars();
      b.classList.remove('hint'); b.classList.add('good'); burst(b);
      var ready = 0, go = function () { if (++ready < 2) return; Q.i++; if (Q.i >= 5 || Q.i >= Q.order.length) celebrate(); else askQ(true); };
      say([PRAISE[Math.floor(Math.random() * PRAISE.length)]], go);
      setTimeout(go, 1300);
    } else {
      Q.wrong++;
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      setTimeout(function () { b.classList.remove('shake'); }, 700);
      say(['Coba lagi, ya']);
      if (Q.wrong >= 2) { var g = $('#choices').querySelector('[data-ok="1"]'); if (g) g.classList.add('hint'); }
    }
  });
  function celebrate() {
    var h = ''; for (var i = 0; i < 5; i++) h += '<svg style="--n:' + i + '"><use href="#i-star"/></svg>';
    $('#celStars').innerHTML = h; $('#celebrate').hidden = false;
    say(['Hebat sekali!']);
  }
  $('#celAgain').addEventListener('click', startQuiz);

  /* ---------- rute ---------- */
  function route() {
    var parts = location.hash.replace(/^#/, '').split('/'), k = parts[0], quiz = parts[1] === 'cari';
    if (!SEC[k] || !SEC[k].list.length) { $('#menu').hidden = false; sec.hidden = true; document.body.style.background = ''; document.title = 'Abaqa TK'; stopSay(); return; }
    var changed = !cur || cur.key !== k;
    $('#menu').hidden = true; sec.hidden = false;
    cur = SEC[k]; cur.key = k;
    sec.dataset.sec = k;
    var st = sec.style; st.setProperty('--tint', cur.tint); st.setProperty('--hue', cur.hue); st.setProperty('--hue-deep', cur.deep);
    document.body.style.background = cur.tint;
    $('#secTitle').innerHTML = '<span class="t">' + esc(cur.name).replace(/ (A–Z|1–10)$/, '\u00a0$1') + '</span>';
    $('#modeLearn').href = '#' + k; $('#modeQuiz').href = '#' + k + '/cari'; $('#celDone').href = '#' + k;
    $('#modeLearn').setAttribute('aria-current', quiz ? 'false' : 'page'); $('#modeQuiz').setAttribute('aria-current', quiz ? 'page' : 'false');
    $('#learn').hidden = quiz; $('#quiz').hidden = !quiz;
    if (!quiz) { if (changed || !board.children.length) { buildBoard(); sel = -1; } renderIdle(); sel = -1; board.querySelectorAll('.tile').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); }); }
    else startQuiz();
    cur._last = k;
    checkMore(); setTimeout(checkMore, 60);
    window.scrollTo(0, 0);
  }
  /* judul bagian: tampil di layar lebar; ikon cukup di ponsel */
  window.addEventListener('hashchange', route);

  $('#ortuH').setAttribute('tabindex', '-1');
  buildMenu(); drawStars();
  $('#openOrtu').addEventListener('click', function () { var d = $('#ortu'); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); d.scrollTop = 0; try { $('#ortuH').focus({ preventScroll: true }); } catch (e) {} });
  $('#ortuClose').addEventListener('click', function () { $('#ortu').close(); });
  /* tombol kembali ke menu: hash kosong */
  sec.querySelector('.back').addEventListener('click', function (e) { e.preventDefault(); history.pushState(null, '', location.pathname + location.search); route(); });
  route();
})();
