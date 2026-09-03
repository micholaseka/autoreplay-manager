// src/selectors.js
// ✅ TERVERIFIKASI dari DevTools asli (www.facebook.com/marketplace/inbox/)
// Struktur 1 percakapan:
//   div[data-visualcompletion="ignore-dynamic"]
//     └─ div[aria-disabled="false"]  ← [avatar] [nama · produk, preview] [waktu]
// ⚠️ TIDAK memakai role="link"/"row" (terbukti 0 elemen di inbox desktop!)
// ⚠️ Kedua atribut ada di DUA elemen berbeda (ayah & anak) — jangan digabung
//    dalam satu selector!
// Bukti: 2 query Console berbeda = 20 elemen, cocok dengan tampilan layar.
// Jika UI berubah → verifikasi ulang via DevTools/codegen.

module.exports = {
  login: ['input[name="email"]', 'input[name="pass"]', 'button[name="login"]'],

  // ✅ TERBUKTI via testing/selectors.test.js (angka mengikuti kondisi nyata)
  unreadConversation: [
    '[aria-label*="belum dibaca" i]',
    '[aria-label*="unread" i]',
  ],

  // ✅ PEMBUNGKUS 1 PERCAKAPAN — terbukti 20 elemen via Console DevTools
  conversationContainer: [
    'div[data-visualcompletion="ignore-dynamic"] > div[aria-disabled]', // presisi
    'div[aria-disabled="false"]', // cadangan, lebih longgar
  ],
};
