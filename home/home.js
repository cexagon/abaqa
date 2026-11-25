/* Beranda Abaqa: progres sederhana dari localStorage. Semua dibungkus try/catch, tanpa data tetap aman. */
(function () {
  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function set(card, html, cls) { var p = card.querySelector('[data-prog]'); if (p) { p.innerHTML = html; if (cls) p.className = 'prog ' + cls; } }

  document.querySelectorAll('[data-progress]').forEach(function (card) {
    try {
      var d = read(card.dataset.progress), total = +card.dataset.total || 21, n = 0;
      if (d && typeof d === 'object') Object.keys(d).forEach(function (k) { if (typeof d[k] === 'number') n++; });
      set(card, n ? 'Sudah dicoba <b>' + n + '</b> dari ' + total + ' latihan' : 'Belum ada latihan yang dicoba');
    } catch (e) { set(card, ''); }
  });

  try {
    var kb = document.querySelector('[data-kebun]'), D = read('kebun-hitung-v2');
    if (kb) {
      var stars = 0;
      if (D && D.stars) Object.keys(D.stars).forEach(function (k) { stars += +D.stars[k] || 0; });
      set(kb, D && (stars || D.unlocked > 1) ? 'Sampai bab <b>' + (+D.unlocked || 1) + '</b> dari 10, ' + stars + ' bintang' : 'Belum mulai, ayo kenalan dengan Kancil');
    }
  } catch (e) {}

  /* Lab Bu Canni: bila belum ada di server, tandai "segera hadir". Gagal jaringan (offline) dibiarkan. */
  try {
    var lab = document.querySelector('[data-lab]');
    if (lab) {
      var L = read('labBuCanni'), n = L && L.done ? L.done.length : 0;
      set(lab, n ? 'Sudah <b>' + n + '</b> dari 5 episode' : 'Belum mulai, ayo kenalan dengan Pipo');
      fetch(lab.getAttribute('href') + 'index.html', { method: 'HEAD', cache: 'no-store' }).then(function (r) {
        if (r.status === 404) {
          lab.setAttribute('aria-disabled', 'true');
          lab.removeAttribute('href');
          lab.setAttribute('role', 'link');
          lab.setAttribute('tabindex', '0');
          set(lab, '<b>Segera hadir</b>, sedang disiapkan', 'soon');
          lab.querySelector('.go').textContent = 'Segera hadir';
        }
      }).catch(function () {});
    }
  } catch (e) {}

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
  }
})();
