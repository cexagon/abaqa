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
  /* huruf hijaiah: ukur kotak tinta tiap glyph, lalu besarkan yang kecil (ه ء) supaya tinggi visualnya mirip */
  var ARAB = {}, ARAB_N = 0;
  function measureArab() { ARAB = {}; measureList(D.hijaiah || []); measureList((window.TK2 || {}).harakat || []); ARAB_N++; }
  function measureList(list) {
    var f = getComputedStyle(document.body).getPropertyValue('--arab') || 'serif', rows = [];
    try {
      var c = document.createElement('canvas').getContext('2d'); c.font = '700 100px ' + f; c.direction = 'rtl';
      list.forEach(function (x) {
        var m = c.measureText(x.h), h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        if (h > 0 && w > 0) rows.push({ h: x.h, ih: h, iw: w, cy: (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 });
      });
    } catch (e) { return; }
    if (rows.length < 5) return;
    var med = function (a) { a = a.slice().sort(function (p, q) { return p - q; }); return a[a.length >> 1]; };
    var mv = med(rows.map(function (r) { return Math.sqrt(r.ih * r.iw); })), mh = med(rows.map(function (r) { return r.ih; })), mc = med(rows.map(function (r) { return r.cy; }));
    rows.forEach(function (r) {
      var sc = Math.min(1.4, Math.max(1, mv / Math.sqrt(r.ih * r.iw)));
      sc = Math.min(sc, 1.12 * mh / r.ih, 150 / r.iw);   /* jangan terlalu tinggi, jangan terlalu lebar untuk tile */
      sc = Math.max(.85, sc);
      ARAB[r.h] = { s: Math.round(sc * 100) / 100, y: Math.round((mc - r.cy) * sc) / 100 * -1 };
    });
  }
  function arabStyle(h) { var a = ARAB[h]; return a ? ' style="--gs:' + a.s + ';--gy:' + a.y + '"' : ''; }
  function applyArab() {
    measureArab();
    document.querySelectorAll('[data-ah]').forEach(function (e) { var a = ARAB[e.dataset.ah]; if (a) { e.style.setProperty('--gs', a.s); e.style.setProperty('--gy', a.y); } });
  }
  function icon(id) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- simpan ---------- */
  var S = { stars: 0, opened: {}, tahap: 1 };
  try { var raw = JSON.parse(localStorage.getItem(KEY)); if (raw && typeof raw === 'object') { S.stars = +raw.stars || 0; S.opened = raw.opened || {}; S.tahap = raw.tahap === 2 ? 2 : 1; } } catch (e) {}
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
      glyph: function (x) { return '<span class="arab" lang="ar" dir="rtl" data-ah="' + esc(x.h) + '"' + arabStyle(x.h) + '>' + esc(x.h) + '</span>'; }, label: function (x) { return 'Huruf ' + x.nama; },
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
  SEC.warna.wide = SEC.bentuk.wide = true;
  SEC.angka.count = true;

  /* ---------- Tahap 2: pelajaran lanjutan ---------- */
  var T2 = window.TK2 || {}, VOW = ['a', 'i', 'u', 'e', 'o'], BENDA = T2.benda || [];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function img(src, cls) { return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(src) + '" alt="">'; }
  var NUMW = { 0: 'nol' }; (D.angka || []).concat(T2.belas || []).forEach(function (x) { NUMW[x.n] = x.kata; });
  function numWord(n) { return NUMW[n] || String(n); }
  function hurufUcap(L) { var r = (D.huruf || []).filter(function (x) { return x.h === L; })[0]; return r ? r.ucap : L.toLowerCase(); }
  /* suku kata: konsonan tinta, vokal berwarna */
  function syl(t) { return '<span class="syl-t"><b>' + esc(t.slice(0, -1)) + '</b><i>' + esc(t.slice(-1)) + '</i></span>'; }
  function grp(n, g, gone) { var h = '<span class="r5">'; for (var i = 0; i < n; i++) { if (i && i % 5 === 0) h += '</span><span class="r5">'; h += '<span class="ob' + (gone && i >= n - gone ? ' gone' : '') + '">' + img(g) + '</span>'; } return '<span class="grp">' + h + '</span></span>'; }
  function sumRes(x) { return x.op === '+' ? x.a + x.b : x.a - x.b; }
  function sumSay(x) { return numWord(x.a) + (x.op === '+' ? ' tambah ' : ' kurang ') + numWord(x.b); }
  function sumVis(x) { return '<div class="sum">' + (x.op === '+' ? grp(x.a, x.gambar) + '<span class="op">+</span>' + grp(x.b, x.gambar) : grp(x.a, x.gambar, x.b)) + '</div>'; }
  function polaSeq(p, len) { var out = []; for (var i = 0; i < len; i++) out.push(p.benda[p.pola.charCodeAt(i % p.pola.length) - 65]); return out; }
  function polaRow(seq, q) { return '<div class="pola">' + seq.map(function (i) { return '<span class="ob">' + img(BENDA[i].gambar) + '</span>'; }).join('') + (q ? '<span class="ob q" aria-label="yang dicari">?</span>' : '') + '</div>'; }
  /* panggung: satu kelompok per satuan pola, boleh pindah baris di antara satuan tapi tidak di tengahnya */
  function polaUnits(p, len, q) {
    var s = polaSeq(p, len), u = p.pola.length, h = '', Qm = '<span class="ob q" aria-label="yang dicari">?</span>';
    for (var i = 0; i < s.length; i += u) { var part = s.slice(i, i + u); h += '<span class="pu">' + part.map(function (k) { return '<span class="ob">' + img(BENDA[k].gambar) + '</span>'; }).join('') + (q && i + u >= s.length && part.length < u ? Qm : '') + '</span>'; }
    if (q && s.length % u === 0) h += '<span class="pu">' + Qm + '</span>';
    return '<div class="pola units' + (q ? ' ask' : '') + '">' + h + '</div>';
  }
  function polaLen(p) { return p.pola.length <= 3 ? 6 : 8; }

  SEC.suku = {
    name: 'Suku Kata', say: 'Suku kata', list: T2.suku || [], tint: '#FFE0D0', hue: '#D84315', deep: '#A3300C', idle: 'huruf', tahap: 2,
    id: function (c) { return c; }, glyph: function (c) { return syl(c + 'a'); }, label: function (c) { return 'Suku kata ' + c + 'a sampai ' + c + 'o'; },
    speak: function (c) { var p = []; VOW.forEach(function (v, i) { if (i) p.push(250); p.push(c + v); }); return p; },
    stage: function (c) {
      return '<div class="st-glyph sm" aria-hidden="true">' + esc(c.toUpperCase()) + '<small>' + esc(c) + '</small></div><div class="syls">' +
        VOW.map(function (v) { return '<button class="syl" type="button" data-say="' + c + v + '">' + syl(c + v) + '</button>'; }).join('') + '</div>';
    },
    makeQ: function () {
      return shuffle(T2.suku).slice(0, 5).map(function (c) {
        var v = pick(VOW), t = c + v, set = {}, o = [];
        function add(x) { if (!set[x] && o.length < 4) { set[x] = 1; o.push(x); } }
        add(t);
        add(c + pick(VOW.filter(function (w) { return w !== v; })));
        add(pick(T2.suku.filter(function (k) { return k !== c; })) + v);
        while (o.length < 4) add(pick(T2.suku) + pick(VOW));
        return { ask: 'Mana ' + t + '?', choices: shuffle(o).map(function (x) { return { html: syl(x), label: 'Suku kata ' + x, ok: x === t }; }) };
      });
    }
  };
  SEC.kata = {
    name: 'Baca Kata', say: 'Baca kata', list: T2.kata || [], tint: '#ECE3FA', hue: '#6A45B0', deep: '#4B2F85', idle: 'gambar', tahap: 2, wide: true, qname: 'Susun',
    id: function (w) { return w.kata; }, glyph: function (w) { return img(w.gambar, 'tp'); }, tile: function (w) { return img(w.gambar, 'tp') + '<small>' + esc(w.kata) + '</small>'; },
    label: function (w) { return w.kata; },
    speak: function (w) { return [w.suku[0], 300, w.suku[1], 450, w.kata + '!']; },
    stage: function (w) {
      return '<div class="st-main">' + img(w.gambar, 'st-pic') + '</div><div class="syls">' +
        w.suku.map(function (t) { return '<button class="syl" type="button" data-say="' + t + '">' + syl(t) + '</button>'; }).join('<span class="plus" aria-hidden="true">+</span>') +
        '</div><div class="st-word">' + esc(w.kata) + '</div>';
    },
    makeQ: function () {
      var all = [].concat.apply([], (T2.kata || []).map(function (k) { return k.suku; }));
      return shuffle(T2.kata).slice(0, 5).map(function (w) {
        var set = {}, o = [];
        w.suku.forEach(function (t) { if (!set[t]) { set[t] = 1; o.push(t); } });
        var c0 = w.suku[0].slice(0, -1), v0 = w.suku[0].slice(-1);
        [c0 + pick(VOW.filter(function (x) { return x !== v0; }))].concat(shuffle(all)).forEach(function (t) { if (!set[t] && o.length < 4) { set[t] = 1; o.push(t); } });
        return { ask: 'Susun kata ' + w.kata, text: 'Susun katanya', seq: w.suku.slice(), win: w.kata,
          prompt: '<div class="qp-pic">' + img(w.gambar) + '</div><div class="slots">' + w.suku.map(function () { return '<span class="slot"></span>'; }).join('') + '</div>',
          choices: shuffle(o).map(function (t) { return { html: syl(t), label: 'Suku kata ' + t, v: t }; }) };
      });
    }
  };
  SEC.awal = {
    name: 'Huruf Awal', say: 'Huruf awal', list: T2.awal || [], tint: '#D3F1EC', hue: '#00796B', deep: '#00564C', idle: 'gambar', tahap: 2, wide: true, qname: 'Main',
    id: function (w) { return w.kata; }, glyph: function (w) { return img(w.gambar, 'tp'); }, tile: function (w) { return img(w.gambar, 'tp') + '<small>' + esc(w.kata) + '</small>'; },
    label: function (w) { return w.kata; },
    speak: function (w) { return [w.kata + '.', 450, 'Huruf awalnya, ' + hurufUcap(w.kata.charAt(0)) + '!']; },
    stage: function (w) {
      var L = w.kata.charAt(0);
      return '<div class="st-main"><div class="st-glyph" aria-hidden="true">' + esc(L) + '<small>' + esc(L.toLowerCase()) + '</small></div>' + img(w.gambar, 'st-pic') + '</div><div class="st-word">' + wordHL(w.kata) + '</div>';
    },
    makeQ: function () {
      var letters = (T2.awal || []).map(function (w) { return w.kata.charAt(0); });
      return shuffle(T2.awal).slice(0, 5).map(function (w) {
        var L = w.kata.charAt(0), o = [L];
        shuffle(letters).forEach(function (x) { if (o.indexOf(x) < 0 && o.length < 3) o.push(x); });
        return { ask: 'Ini ' + w.kata.toLowerCase() + '. Huruf awalnya apa?', text: 'Huruf awalnya apa?', prompt: '<div class="qp-pic">' + img(w.gambar) + '</div>',
          win: hurufUcap(L) + ', ' + w.kata.toLowerCase(), choices: shuffle(o).map(function (x) { return { html: esc(x), label: 'Huruf ' + x, ok: x === L }; }) };
      });
    }
  };
  SEC.belas = {
    name: 'Angka 11–20', say: 'Angka sebelas sampai dua puluh', list: T2.belas || [], tint: '#D8ECFB', hue: '#1565C0', deep: '#0D4A8F', idle: 'angka', tahap: 2, count: true,
    id: function (x) { return x.n; }, same: function (x) { return x.kata; },
    glyph: function (x) { return x.n; }, label: function (x) { return 'Angka ' + x.n; },
    speak: function (x) { return [cap(x.kata) + '!']; },
    ask: function (x) { return 'Mana angka ' + x.kata + '?'; }
  };
  SEC.hitung = {
    name: 'Tambah Kurang', say: 'Tambah dan kurang', list: T2.hitung || [], tint: '#FBDDE8', hue: '#C2185B', deep: '#8E1245', idle: 'kartu', tahap: 2, qname: 'Main',
    id: function (x) { return x.a + x.op + x.b; }, glyph: function (x) { return '<span class="eqt">' + x.a + '<i>' + x.op + '</i>' + x.b + '</span>'; },
    label: function (x) { return sumSay(x); },
    speak: function (x) { return [sumSay(x) + ',', 300, 'sama dengan ' + numWord(sumRes(x)) + '!']; },
    stage: function (x) { return sumVis(x) + '<div class="st-word eq">' + x.a + ' ' + x.op + ' ' + x.b + ' = <b>' + sumRes(x) + '</b></div>'; },
    makeQ: function () {
      var gs = shuffle((T2.hitung || []).map(function (x) { return x.gambar; })), out = [], seen = {};
      while (out.length < 5) {
        var i = out.length, x;
        if (i < 3) { var a = rnd(1, 6); x = { a: a, op: '+', b: rnd(1, Math.min(5, 10 - a)) }; }
        else { var a2 = rnd(3, 9); x = { a: a2, op: '−', b: rnd(1, Math.min(5, a2 - 1)) }; }
        var key = x.a + x.op + x.b; if (seen[key]) continue; seen[key] = 1;
        x.gambar = gs[i % gs.length];
        var r = sumRes(x), o = [r];
        shuffle([r - 2, r - 1, r + 1, r + 2]).forEach(function (n) { if (n >= 0 && n <= 10 && o.length < 3) o.push(n); });
        out.push({ ask: sumSay(x) + ', jadi berapa?', text: x.a + ' ' + x.op + ' ' + x.b + ' = ?', prompt: sumVis(x), win: sumSay(x) + ', sama dengan ' + numWord(r),
          choices: shuffle(o).map(function (n) { return { html: n, label: 'Angka ' + n, ok: n === r }; }) });
      }
      return out;
    }
  };
  SEC.pola = {
    name: 'Pola', say: 'Pola', list: T2.pola || [], tint: '#FFEFB8', hue: '#9A6F00', deep: '#6E4F00', idle: 'pola', tahap: 2, wide: true, qname: 'Main',
    id: function (p) { return p.pola; }, glyph: function (p) { return polaRow(polaSeq(p, 3)); }, label: function (p) { return 'Pola ' + polaSeq(p, p.pola.length).map(function (i) { return BENDA[i].nama; }).join(', '); },
    speak: function (p) { var o = []; polaSeq(p, polaLen(p)).forEach(function (i, j) { if (j) o.push(120); o.push(BENDA[i].nama); }); return o; },
    stage: function (p) { return polaUnits(p, polaLen(p)) + '<div class="st-word sm">' + polaSeq(p, p.pola.length).map(function (i) { return esc(BENDA[i].nama); }).join(', ') + ', …</div>'; },
    makeQ: function () {
      var types = ['AB', pick(['AAB', 'ABB']), 'ABC', 'AABB', 'ABCD'];
      return types.map(function (t) {
        var n = 0; t.split('').forEach(function (ch) { n = Math.max(n, ch.charCodeAt(0) - 64); });
        var p = { pola: t, benda: shuffle(BENDA.map(function (b, i) { return i; })).slice(0, n) };
        var shown = Math.max(5, 2 * t.length - 1), seq = polaSeq(p, shown + 1), ans = seq[shown], o = [ans];
        shuffle(p.benda).concat(shuffle(BENDA.map(function (b, i) { return i; }))).forEach(function (i) { if (o.indexOf(i) < 0 && o.length < 3) o.push(i); });
        return { ask: 'Apa selanjutnya?', prompt: polaUnits(p, shown, true), win: BENDA[ans].nama,
          choices: shuffle(o).map(function (i) { return { html: img(BENDA[i].gambar), label: BENDA[i].nama, ok: i === ans }; }) };
      });
    }
  };
  SEC.harakat = {
    name: 'A Ba Ta', say: 'A, ba, ta. Huruf hijaiah berharakat', list: T2.harakat || [], tint: '#DDEFCB', hue: '#2E7D32', deep: '#1F5C23', idle: 'huruf', tahap: 2,
    id: function (x) { return x.h; }, same: function (x) { return x.kunci || x.baca; },
    glyph: function (x) { return '<span class="arab" lang="ar" dir="rtl" data-ah="' + esc(x.h) + '"' + arabStyle(x.h) + '>' + esc(x.h) + '</span>'; }, label: function (x) { return 'Huruf ' + x.baca; },
    speak: function (x) { return [x.ucap || x.baca]; },
    ask: function (x) { return 'Mana ' + (x.ucap || x.baca) + '?'; }, text: function (x) { return 'Mana ' + x.baca + '?'; },
    stage: function (x) { return '<div class="st-glyph arab" lang="ar" dir="rtl" data-ah="' + esc(x.h) + '"' + arabStyle(x.h) + '>' + esc(x.h) + '</div><div class="st-word">' + esc(x.baca) + '</div>'; }
  };
  var ORDERS = { 1: ['huruf', 'angka', 'hijaiah', 'warna', 'bentuk'], 2: ['suku', 'kata', 'awal', 'belas', 'hitung', 'pola', 'harakat'] };
  Object.keys(SEC).forEach(function (k) { SEC[k].tahap = SEC[k].tahap || 1; });
  function tileColor(sec, i) { return COL[i % COL.length]; }

  /* ---------- menu ---------- */
  var MENU = {
    huruf: { c: '#E8742A', art: function () { var g = (D.huruf || [])[0]; return '<span class="big">Aa</span>' + (g ? '<img src="' + esc(g.gambar) + '" alt="">' : ''); } },
    angka: { c: '#1E7FD6', art: function () { var g = (D.angka || [])[2]; return '<span class="big">123</span>' + (g ? '' : ''); } },
    hijaiah: { c: '#3F8A30', art: function () { return '<span class="arab" lang="ar" dir="rtl">ب</span>'; } },
    warna: { c: '#C2185B', art: function () { return '<svg viewBox="0 0 130 120" aria-hidden="true"><circle cx="45" cy="45" r="36" fill="#E53935"/><circle cx="85" cy="45" r="36" fill="#FDD835" fill-opacity=".9"/><circle cx="65" cy="80" r="36" fill="#1E88E5" fill-opacity=".85"/></svg>'; } },
    bentuk: { c: '#A87B00', art: function () { return '<svg viewBox="0 0 130 120" aria-hidden="true"><circle cx="30" cy="35" r="24" fill="#E8742A"/><rect x="72" y="12" width="46" height="46" rx="5" fill="#1E88E5"/><path d="M65 108 L35 62 L95 62Z" fill="#3F8A30" stroke="#3F8A30" stroke-width="6" stroke-linejoin="round"/></svg>'; } },
    suku: { c: '#D84315', art: function () { return '<span class="big sy">' + syl('ba') + '</span>'; } },
    kata: { c: '#6A45B0', art: function () { return img('aset/closed-book.svg') + '<span class="mid">bu·ku</span>'; } },
    awal: { c: '#00796B', art: function () { return '<span class="big">K</span>' + img('aset/rabbit-face.svg'); } },
    belas: { c: '#1565C0', art: function () { return '<span class="big">20</span>'; } },
    hitung: { c: '#C2185B', art: function () { return '<span class="big">2+1</span>'; } },
    pola: { c: '#9A6F00', art: function () { return '<span class="pola mini">' + img('aset/red-apple.svg') + img('aset/banana.svg') + img('aset/red-apple.svg') + '<span class="q">?</span></span>'; } },
    harakat: { c: '#2E7D32', art: function () { return '<span class="arab" lang="ar" dir="rtl">بَ</span>'; } }
  };
  function nb(n) { return esc(n).replace(/ (A–Z|1–10|11–20)$/, '\u00a0<span class="nw">$1</span>'); }
  function buildMenu() {
    var ul = $('#menuCards'), t = S.tahap === 2 ? 2 : 1, list = ORDERS[t];
    ul.className = 'menu n' + list.length;
    ul.innerHTML = list.map(function (k) {
      return '<li><a class="m-card" href="#' + k + '" data-k="' + k + '" style="--mc:' + MENU[k].c + '"><span class="m-art">' + MENU[k].art() + '</span><span class="m-name">' + nb(SEC[k].name) + '</span></a></li>';
    }).join('');
    document.querySelectorAll('.tahap [data-t]').forEach(function (b) { b.setAttribute('aria-selected', +b.dataset.t === t ? 'true' : 'false'); });
    measureArab(); applyArab();
  }
  $('#menuCards').addEventListener('click', function (e) {
    var a = e.target.closest('.m-card'); if (a) say([SEC[a.dataset.k].say]);
  });
  document.querySelectorAll('.tahap [data-t]').forEach(function (b) {
    b.addEventListener('click', function () { var t = +b.dataset.t; if (S.tahap !== t) { S.tahap = t; save(); buildMenu(); } say(['Tahap ' + (t === 2 ? 'dua' : 'satu')]); });
  });

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
    var n = box.children.length, cs = getComputedStyle(box), ph = innerWidth <= 700, gx = ph ? 6 : 10, gy = ph ? 10 : 12, W = box.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0), H;
    box.style.columnGap = gx + 'px'; box.style.rowGap = gy + 'px';
    if (cs.flexGrow === '0') H = Math.max(180, Math.min(300, innerHeight * .28)); else { box.style.setProperty('--it', '40px'); H = box.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0); }
    var best = 0, fallback = 40;
    for (var s = 128; s >= 40; s -= 2) {
      var cols = Math.max(1, Math.floor((W + gx) / (s + gx))), rows = Math.ceil(n / cols);
      if (rows * (s + gy) - gy > H) continue;
      if (fallback === 40) fallback = s;
      /* hindari satu benda sendirian di baris terakhir */
      if (rows > 1 && n % cols === 1) continue;
      best = s; break;
    }
    if (!best) best = fallback;
    box.style.setProperty('--it', best + 'px');
  }
  /* papan: kolom seimbang (tanpa satu tile sendirian) dan, di tablet mendatar, tile terbesar yang muat tanpa gulir */
  var LAND = window.matchMedia ? matchMedia('(min-width: 701px) and (orientation: landscape)') : { matches: false };
  function fitBoard() {
    if (!cur || !board.children.length || sec.hidden) return;
    var n = cur.list.length, cs = getComputedStyle(board), gx = 10, gy = 14, k = cur.key, wide = !!cur.wide;
    var W = board.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    var H = board.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    var st = board.style, cols, rows;
    var tiles = board.children, t;
    if (LAND.matches) {
      var cap = 150;
      /* tata letak seimbang: tiap baris hampir sama banyak, baris pendek ditaruh di tengah (kolom ganda, tile mengambil 2 kolom) */
      var lay = function (s) {
        var c = Math.max(1, Math.floor((W + gx) / (s + gx))), r = Math.ceil(n / c), h = r * (s + gy) - gy;
        if (h > H || (r > 1 && Math.floor(n / r) < 2)) return null;
        return { c: c, r: r, fill: h / H };
      };
      var best = 0, info = null, s, g;
      for (s = cap; s >= 56; s -= 2) { info = lay(s); if (info) { best = s; break; } }
      if (!best) { best = 64; var c0 = Math.max(1, Math.floor((W + gx) / (best + gx))); info = { c: c0, r: Math.ceil(n / c0) }; }
      else if (info.fill < .6) {
        /* sedikit isi (mis. bentuk 7): besarkan melewati batas biasa sampai papan terisi >= 60% tinggi */
        for (s = cap + 2; s <= 200; s += 2) { g = lay(s); if (g && g.fill >= .6) { best = s; info = g; break; } }
      }
      var base = Math.floor(n / info.r), extra = n % info.r, idx = 0, row, k, j2;
      for (row = 0; row < info.r; row++) {
        k = base + (row < extra ? 1 : 0);
        for (j2 = 0; j2 < k && idx < n; j2++, idx++) { t = tiles[idx]; if (t) t.style.gridColumn = (1 + (info.c - k) + 2 * j2) + ' / span 2'; }
      }
      st.setProperty('--tile', best + 'px'); st.setProperty('--c2', info.c * 2); st.removeProperty('--cols'); st.removeProperty('--tmax');
      board.classList.remove('orphan');
      return;
    }
    for (t = 0; t < tiles.length; t++) tiles[t].style.gridColumn = '';
    st.removeProperty('--c2');
    var minT = innerWidth <= 700 ? (wide ? 112 : 72) : (wide ? 112 : 80);
    var c0 = Math.max(1, Math.floor((W + gx) / (minT + gx)));
    rows = Math.ceil(n / c0); cols = Math.ceil(n / rows);
    st.removeProperty('--tile'); st.setProperty('--cols', cols);
    /* tablet tegak: papan tidak menggulir, jadi batasi ukuran tile agar baris-barisnya muat di tinggi terkecil (panggung terbuka) */
    if (innerWidth > 700) { var frac = cur.count ? .205 : (cur.stage && k !== 'harakat' ? .36 : .41), padV = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0), tm = Math.min(104, Math.floor((innerHeight * frac - padV + gy) / rows - gy)); st.setProperty('--tmax', Math.max(64, tm) + 'px'); } else st.removeProperty('--tmax');
    board.classList.toggle('orphan', cols > 1 && n % cols === 1);
  }
  window.addEventListener('resize', function () { fitBoard(); fitItems(); checkMore(); });
  if (LAND.addEventListener) LAND.addEventListener('change', function () { fitBoard(); }); 

  function buildBoard() {
    board.innerHTML = cur.list.map(function (x, i) {
      var c = tileColor(cur.key, i), extra = (cur.key === 'warna' || cur.key === 'bentuk') ? '<small>' + esc(x.nama) + '</small>' : '';
      return '<button class="tile" type="button" role="listitem" aria-pressed="false" aria-label="' + esc(cur.label(x)) + '" data-i="' + i + '" style="--tc:' + c + '">' +
        (cur.tile ? cur.tile(x) : cur.glyph(x) + extra) + (seen(cur.key, cur.id(x)) ? '<svg class="seen" aria-hidden="true"><use href="#i-star"/></svg>' : '') + '</button>';
    }).join('');
    fitBoard(); checkMore();
  }
  board.addEventListener('click', function (e) { var t = e.target.closest('.tile'); if (t) select(+t.dataset.i, true); });

  function wordHL(w) { return '<b>' + esc(w.charAt(0)) + '</b>' + esc(w.slice(1)); }
  function renderStage() {
    var x = cur.list[sel], k = cur.key, h = '';
    stage.dataset.state = 'on';
    if (cur.stage) { body.innerHTML = cur.stage(x); return; }
    if (k === 'huruf') {
      h = '<div class="st-main"><div class="st-glyph" aria-hidden="true">' + esc(x.h) + '<small>' + esc(x.h.toLowerCase()) + '</small></div>' +
        '<img class="st-pic" src="' + esc(x.gambar) + '" alt="' + esc(x.kata) + '"></div><div class="st-word">' + wordHL(x.kata) + '</div>';
    } else if (cur.count) {
      var ims = '';
      for (var i = 0; i < x.n; i++) ims += '<button class="item" type="button" aria-label="Hitung"><img src="' + esc(x.gambar) + '" alt=""></button>';
      counted = 0;
      h = '<div class="st-main"><div class="st-glyph" aria-hidden="true">' + x.n + '</div></div><div class="items">' + ims + '</div><div class="st-word">' + esc(cap(x.kata)) + '</div>';
    } else if (k === 'hijaiah') {
      h = '<div class="st-glyph arab" lang="ar" dir="rtl" data-ah="' + esc(x.h) + '"' + arabStyle(x.h) + '>' + esc(x.h) + '</div><div class="st-word">' + esc(x.nama) + '</div>';
    } else if (k === 'warna') {
      h = '<div class="st-swatch" style="background:' + esc(x.hex) + '"><img src="' + esc(x.gambar) + '" alt=""></div><div class="st-word">' + esc(cap(x.nama)) + '</div>';
    } else {
      h = '<div class="st-main"><div class="st-shape" aria-hidden="true">' + x.svg + '</div>' + (x.contoh ? '<div class="st-eg"><img src="' + esc(x.contoh) + '" alt=""></div>' : '') + '</div><div class="st-word">' + esc(cap(x.nama)) + '</div>';
    }
    body.innerHTML = h;
    if (cur.count) fitItems();
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
  function repeat() { if (sel < 0) { say(['Ketuk satu ' + cur.idle + ', ya']); return; } var x = cur.list[sel]; if (cur.count) { counted = 0; resetItems(); } say(cur.speak(x)); }
  function resetItems() { body.querySelectorAll('.item').forEach(function (b) { b.classList.remove('on'); var m = b.querySelector('b'); if (m) m.remove(); }); }
  body.addEventListener('click', function (e) {
    var sb = e.target.closest('[data-say]');
    if (sb) { sb.classList.remove('hop'); void sb.offsetWidth; sb.classList.add('hop'); say([sb.dataset.say]); return; }
    var b = e.target.closest('.item');
    if (b && cur.count) {
      var x = cur.list[sel], all = body.querySelectorAll('.item');
      if (counted >= x.n) { counted = 0; resetItems(); }
      counted++;
      if (!b.classList.contains('on')) {
        /* ketukan ke-n selalu dihitung n, di benda mana pun yang diketuk */
        b.classList.add('on'); b.insertAdjacentHTML('beforeend', '<b>' + counted + '</b>');
      } else { counted--; }
      var word = numWord(counted);
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
  /* soal dari daftar: target unik, pengecoh tidak boleh punya ucap/nama sama dengan jawaban (mis. dua huruf "ha") */
  function listQs() {
    var pool = shuffle(cur.list), order = [], used = {};
    pool.forEach(function (x) { var s = cur.same(x); if (order.length < 5 && !used[s]) { used[s] = 1; order.push(x); } });
    return order.map(function (x) {
      var seenKeys = {}, others = []; seenKeys[cur.same(x)] = 1;
      shuffle(cur.list).forEach(function (y) { var s = cur.same(y); if (!seenKeys[s] && others.length < 3) { seenKeys[s] = 1; others.push(y); } });
      return { ask: cur.ask(x), text: cur.text ? cur.text(x) : null, choices: shuffle([x].concat(others)).map(function (y) { return { html: cur.glyph(y), label: cur.label(y), ok: y === x }; }) };
    });
  }
  function startQuiz() {
    var qs = cur.makeQ ? cur.makeQ() : listQs();
    Q = { qs: qs, i: 0, wrong: 0, lock: false, got: 0, pos: 0 };
    $('#celebrate').hidden = true;
    drawQStars();
    askQ(true);
  }
  function drawQStars() {
    var h = ''; for (var i = 0; i < 5; i++) h += '<svg class="' + (i < Q.got ? 'on' : '') + '"><use href="#i-star"/></svg>';
    $('#qStars').innerHTML = h;
  }
  function askQ(speak) {
    var q = Q.qs[Q.i], chs = $('#choices'), pr = $('#qPrompt');
    Q.q = q; Q.wrong = 0; Q.lock = false; Q.pos = 0; chs.classList.remove('hinting');
    $('#qText').textContent = q.text || q.ask;
    pr.innerHTML = q.prompt || ''; pr.hidden = !q.prompt; $('#quiz').classList.toggle('has-prompt', !!q.prompt);
    chs.dataset.n = q.choices.length;
    chs.innerHTML = q.choices.map(function (c, i) {
      return '<button class="ch" type="button" data-ok="' + (c.ok ? 1 : 0) + '" data-v="' + esc(c.v == null ? '' : c.v) + '" aria-label="' + esc(c.label) + '" style="--tc:' + COL[(i + Q.i) % COL.length] + '">' + c.html + '</button>';
    }).join('');
    if (q.seq) markSeq();
    nextSlot();
    if (speak !== false) say([q.ask]);
  }
  /* susun kata: tombol yang benar adalah suku kata berikutnya */
  function nextSlot() { var sl = $('#qPrompt').querySelectorAll('.slot'); sl.forEach(function (x, i) { x.classList.toggle('next', i === Q.pos); }); }
  function markSeq() { var need = Q.q.seq[Q.pos]; $('#choices').querySelectorAll('.ch').forEach(function (b) { b.dataset.ok = b.dataset.v === need ? '1' : '0'; }); }
  $('#qSay').addEventListener('click', function () { if (Q && Q.q) say([Q.q.ask]); });
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
    if (b.dataset.ok === '1' && Q.q.seq) {
      var slot = $('#qPrompt').querySelectorAll('.slot')[Q.pos];
      if (slot) { slot.innerHTML = b.innerHTML; slot.classList.add('on'); }
      Q.pos++; Q.wrong = 0; $('#choices').classList.remove('hinting');
      $('#choices').querySelectorAll('.hint').forEach(function (h) { h.classList.remove('hint'); });
      nextSlot();
      if (Q.pos < Q.q.seq.length) { markSeq(); say([b.dataset.v]); return; }
      $('#qPrompt').classList.add('done');
    }
    if (b.dataset.ok === '1') {
      Q.lock = true; Q.got++; S.stars++; save(); drawStars(); drawQStars();
      b.classList.remove('hint'); $('#choices').classList.remove('hinting'); if (!Q.q.seq) b.classList.add('good'); burst(b);
      var ready = 0, go = function () { if (++ready < 2) return; $('#qPrompt').classList.remove('done'); Q.i++; if (Q.i >= 5 || Q.i >= Q.qs.length) celebrate(); else askQ(true); };
      var pr = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      say(Q.q.win ? [Q.q.win + '!', 250, pr] : [pr], go);
      setTimeout(go, Q.q.win ? 2400 : 1300);
    } else {
      Q.wrong++;
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      setTimeout(function () { b.classList.remove('shake'); }, 700);
      var tgt = Q.wrong >= 2 ? $('#choices').querySelector('[data-ok="1"]') : null;
      if (tgt) { $('#choices').classList.add('hinting'); tgt.classList.add('hint'); say(['Coba lagi, ya', 300, Q.q.ask]); }
      else say(['Coba lagi, ya']);
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
    if (!SEC[k] || !SEC[k].list.length) { buildMenu(); $('#menu').hidden = false; sec.hidden = true; document.body.style.background = ''; document.title = 'Abaqa TK'; stopSay(); return; }
    var changed = !cur || cur.key !== k;
    $('#menu').hidden = true; sec.hidden = false;
    cur = SEC[k]; cur.key = k;
    sec.dataset.sec = k; sec.classList.toggle('wide', !!cur.wide);
    if (S.tahap !== cur.tahap) { S.tahap = cur.tahap; save(); }
    $('#modeQuiz').querySelector('span').textContent = cur.qname || 'Coba cari';
    $('#modeQuiz').querySelector('use').setAttribute('href', '#i-' + (cur.qname === 'Susun' ? 'puzzle' : cur.qname === 'Main' ? 'play' : 'search'));
    var st = sec.style; st.setProperty('--tint', cur.tint); st.setProperty('--hue', cur.hue); st.setProperty('--hue-deep', cur.deep);
    document.body.style.background = cur.tint;
    $('#secTitle').innerHTML = '<span class="t">' + nb(cur.name) + '</span>';
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

  /* dialog orang tua: isi bisa digulir, tombol Tutup selalu terlihat */
  (function () {
    var d = $('#ortu'), btn = $('#ortuClose'); if (!d || !btn) return;
    var box = document.createElement('div'); box.className = 'dlg-scroll';
    Array.prototype.slice.call(d.children).forEach(function (el) { if (el !== btn) box.appendChild(el); });
    d.insertBefore(box, btn);
  })();
  measureArab();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { applyArab(); }, function () {});
  $('#ortuH').setAttribute('tabindex', '-1');
  drawStars();
  /* untuk uji otomatis saja (?uji) */
  if (/[?&]uji\b/.test(location.search)) window.__TK = { SEC: SEC, use: function (k) { cur = SEC[k]; cur.key = k; } };
  $('#openOrtu').addEventListener('click', function () { var d = $('#ortu'); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); d.scrollTop = 0; try { $('#ortuH').focus({ preventScroll: true }); } catch (e) {} });
  $('#ortuClose').addEventListener('click', function () { $('#ortu').close(); });
  /* tombol kembali ke menu: hash kosong */
  sec.querySelector('.back').addEventListener('click', function (e) { e.preventDefault(); history.pushState(null, '', location.pathname + location.search); route(); });
  route();
})();
