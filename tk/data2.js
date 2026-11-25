// Abaqa TK Tahap 2: pelajaran lanjutan. Gambar: Microsoft Fluent Emoji (MIT).
// Dasar: CP Fase Fondasi (pramembaca, pramenulis, pramatematika) dan STPPA usia 5-6 tahun
// (membilang, lambang bilangan, pola ABCD-ABCD). Membaca permulaan memakai metode suku kata
// (KV lalu KV-KV). Hijaiah berharakat fathah mengikuti urutan Iqro jilid 1.
window.TK2 = {
  /* suku kata KV: satu keluarga konsonan per tile */
  suku: ["b", "c", "d", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "w", "y"],

  /* kata dua suku kata terbuka (KV-KV), gambar jelas, tidak ada di Tahap 1 */
  kata: [
    {"kata": "buku", "suku": ["bu", "ku"], "gambar": "aset/closed-book.svg"},
    {"kata": "bola", "suku": ["bo", "la"], "gambar": "aset/soccer-ball.svg"},
    {"kata": "topi", "suku": ["to", "pi"], "gambar": "aset/billed-cap.svg"},
    {"kata": "roti", "suku": ["ro", "ti"], "gambar": "aset/bread.svg"},
    {"kata": "sapi", "suku": ["sa", "pi"], "gambar": "aset/cow.svg"},
    {"kata": "kuda", "suku": ["ku", "da"], "gambar": "aset/horse.svg"},
    {"kata": "mata", "suku": ["ma", "ta"], "gambar": "aset/eye.svg"},
    {"kata": "gigi", "suku": ["gi", "gi"], "gambar": "aset/tooth.svg"},
    {"kata": "dasi", "suku": ["da", "si"], "gambar": "aset/necktie.svg"},
    {"kata": "batu", "suku": ["ba", "tu"], "gambar": "aset/rock.svg"},
    {"kata": "madu", "suku": ["ma", "du"], "gambar": "aset/honey-pot.svg"},
    {"kata": "nasi", "suku": ["na", "si"], "gambar": "aset/cooked-rice.svg"},
    {"kata": "pita", "suku": ["pi", "ta"], "gambar": "aset/ribbon.svg"},
    {"kata": "baju", "suku": ["ba", "ju"], "gambar": "aset/t-shirt.svg"},
    {"kata": "palu", "suku": ["pa", "lu"], "gambar": "aset/hammer.svg"},
    {"kata": "kado", "suku": ["ka", "do"], "gambar": "aset/wrapped-gift.svg"},
    {"kata": "dadu", "suku": ["da", "du"], "gambar": "aset/game-die.svg"},
    {"kata": "roda", "suku": ["ro", "da"], "gambar": "aset/wheel.svg"}
  ],

  /* huruf awal: gambar baru, satu per huruf */
  awal: [
    {"kata": "Anggur", "gambar": "aset/grapes.svg"},
    {"kata": "Balon", "gambar": "aset/balloon.svg"},
    {"kata": "Cokelat", "gambar": "aset/chocolate-bar.svg"},
    {"kata": "Daun", "gambar": "aset/maple-leaf.svg"},
    {"kata": "Es krim", "gambar": "aset/soft-ice-cream.svg"},
    {"kata": "Gurita", "gambar": "aset/octopus.svg"},
    {"kata": "Helikopter", "gambar": "aset/helicopter.svg"},
    {"kata": "Jamur", "gambar": "aset/mushroom.svg"},
    {"kata": "Kelinci", "gambar": "aset/rabbit-face.svg"},
    {"kata": "Lemon", "gambar": "aset/lemon.svg"},
    {"kata": "Matahari", "gambar": "aset/sun.svg"},
    {"kata": "Payung", "gambar": "aset/umbrella.svg"},
    {"kata": "Roket", "gambar": "aset/rocket.svg"},
    {"kata": "Semangka", "gambar": "aset/watermelon.svg"},
    {"kata": "Tikus", "gambar": "aset/mouse-face.svg"},
    {"kata": "Ular", "gambar": "aset/snake.svg"}
  ],

  /* angka 11-20: sepuluh dulu, lalu sisanya */
  belas: [
    {"n": 11, "kata": "sebelas", "gambar": "aset/cookie.svg"},
    {"n": 12, "kata": "dua belas", "gambar": "aset/lollipop.svg"},
    {"n": 13, "kata": "tiga belas", "gambar": "aset/seedling.svg"},
    {"n": 14, "kata": "empat belas", "gambar": "aset/snail.svg"},
    {"n": 15, "kata": "lima belas", "gambar": "aset/turtle.svg"},
    {"n": 16, "kata": "enam belas", "gambar": "aset/kite.svg"},
    {"n": 17, "kata": "tujuh belas", "gambar": "aset/pencil.svg"},
    {"n": 18, "kata": "delapan belas", "gambar": "aset/doughnut.svg"},
    {"n": 19, "kata": "sembilan belas", "gambar": "aset/sunflower.svg"},
    {"n": 20, "kata": "dua puluh", "gambar": "aset/spiral-shell.svg"}
  ],

  /* tambah dan kurang dengan benda, hasil paling banyak 10 */
  hitung: [
    {"a": 1, "op": "+", "b": 1, "gambar": "aset/red-apple.svg"},
    {"a": 2, "op": "+", "b": 1, "gambar": "aset/strawberry.svg"},
    {"a": 2, "op": "+", "b": 2, "gambar": "aset/tangerine.svg"},
    {"a": 3, "op": "+", "b": 2, "gambar": "aset/cherries.svg"},
    {"a": 4, "op": "+", "b": 2, "gambar": "aset/lemon.svg"},
    {"a": 3, "op": "+", "b": 4, "gambar": "aset/peach.svg"},
    {"a": 5, "op": "+", "b": 3, "gambar": "aset/pear.svg"},
    {"a": 5, "op": "+", "b": 5, "gambar": "aset/star.svg"},
    {"a": 3, "op": "−", "b": 1, "gambar": "aset/balloon.svg"},
    {"a": 4, "op": "−", "b": 2, "gambar": "aset/cupcake.svg"},
    {"a": 5, "op": "−", "b": 1, "gambar": "aset/fish.svg"},
    {"a": 6, "op": "−", "b": 3, "gambar": "aset/cookie.svg"},
    {"a": 8, "op": "−", "b": 2, "gambar": "aset/butterfly.svg"},
    {"a": 10, "op": "−", "b": 4, "gambar": "aset/duck.svg"}
  ],

  /* benda untuk pola: nama harus berbeda satu sama lain */
  benda: [
    {"nama": "apel", "gambar": "aset/red-apple.svg"},
    {"nama": "pisang", "gambar": "aset/banana.svg"},
    {"nama": "jeruk", "gambar": "aset/tangerine.svg"},
    {"nama": "anggur", "gambar": "aset/grapes.svg"},
    {"nama": "stroberi", "gambar": "aset/strawberry.svg"},
    {"nama": "semangka", "gambar": "aset/watermelon.svg"},
    {"nama": "lemon", "gambar": "aset/lemon.svg"},
    {"nama": "ceri", "gambar": "aset/cherries.svg"}
  ],
  /* pola: urutan satuan, huruf = indeks benda */
  pola: [
    {"pola": "AB", "benda": [0, 1]},
    {"pola": "AAB", "benda": [2, 3]},
    {"pola": "ABB", "benda": [4, 6]},
    {"pola": "ABC", "benda": [0, 2, 3]},
    {"pola": "AABB", "benda": [5, 7]},
    {"pola": "ABCD", "benda": [1, 4, 3, 2]}
  ],

  /* hijaiah berharakat fathah, urutan Iqro jilid 1. "ucap" untuk suara, "kunci" menyamakan bunyi yang
     terdengar sama di suara tablet (a/'a, ha/ha, sa/tsa, za/dza/zho, ka/kho/qo) supaya tidak muncul bersama di kuis. */
  harakat: [
    {"h": "أَ", "baca": "a", "kunci": "a"},
    {"h": "بَ", "baca": "ba"},
    {"h": "تَ", "baca": "ta"},
    {"h": "ثَ", "baca": "tsa", "kunci": "s"},
    {"h": "جَ", "baca": "ja"},
    {"h": "حَ", "baca": "ha", "kunci": "ha"},
    {"h": "خَ", "baca": "kho", "kunci": "k"},
    {"h": "دَ", "baca": "da"},
    {"h": "ذَ", "baca": "dza", "kunci": "z"},
    {"h": "رَ", "baca": "ro"},
    {"h": "زَ", "baca": "za", "kunci": "z"},
    {"h": "سَ", "baca": "sa", "kunci": "s"},
    {"h": "شَ", "baca": "sya"},
    {"h": "صَ", "baca": "sho"},
    {"h": "ضَ", "baca": "dho"},
    {"h": "طَ", "baca": "tho"},
    {"h": "ظَ", "baca": "zho", "kunci": "z"},
    {"h": "عَ", "baca": "'a", "ucap": "a", "kunci": "a"},
    {"h": "غَ", "baca": "gho"},
    {"h": "فَ", "baca": "fa"},
    {"h": "قَ", "baca": "qo", "ucap": "ko", "kunci": "k"},
    {"h": "كَ", "baca": "ka", "kunci": "k"},
    {"h": "لَ", "baca": "la"},
    {"h": "مَ", "baca": "ma"},
    {"h": "نَ", "baca": "na"},
    {"h": "وَ", "baca": "wa"},
    {"h": "هَ", "baca": "ha", "kunci": "ha"},
    {"h": "يَ", "baca": "ya"}
  ]
};
