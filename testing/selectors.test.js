// testing/selectors.test.js
// Uji semua selector: jangan percaya, BUKTIKAN.
// Jalankan: node testing/selectors.test.js
const { chromium } = require("playwright");
const selectors = require("../src/selectors");

(async () => {
  const context = await chromium.launchPersistentContext("./profiles/akun1", {
    headless: false,
    viewport: null,
  });

  const page = context.pages()[0] || (await context.newPage());

  await page.goto("https://www.facebook.com/marketplace/inbox/", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });

  console.log("Menunggu 5 detik agar Facebook selesai render...");
  await page.waitForTimeout(5000);

  console.log("");
  console.log("=== 1. UJI SELECTOR UNREAD ===");
  console.log("");

  for (const sel of selectors.unreadConversation) {
    const count = await page.locator(sel).count();
    const status = count > 0 ? "KENA  [OK]" : "gak ada  [X]";
    console.log(status + "  (" + count + " elemen)  -> " + sel);
  }

  console.log("");
  console.log("=== 2. TOTAL ELEMEN PERCAKAPAN ===");
  console.log("");

  const totalChat = await page
    .locator('div[role="row"], div[role="link"]')
    .count();
  console.log("Total elemen role=link/row di halaman: " + totalChat);

  console.log("");
  console.log("=== 3. UJI SELECTOR CONVERSATION CONTAINER ===");
  console.log("(pembungkus 1 percakapan - dipakai inboxWatcher)");

  if (selectors.conversationContainer) {
    for (const sel of selectors.conversationContainer) {
      const count = await page.locator(sel).count();
      const status = count > 0 ? "KENA  [OK]" : "gak ada  [X]";
      console.log(status + "  (" + count + " elemen)  -> " + sel);
    }
  } else {
    console.log("PERINGATAN: selectors.conversationContainer BELUM ADA!");
    console.log("inboxWatcher akan error! Tambahkan di src/selectors.js");
  }

  console.log("");
  console.log("=== 4. UJI SELECTOR LOGIN ===");
  console.log("");

  for (const sel of selectors.login) {
    const count = await page.locator(sel).count();
    const status = count > 0 ? "KENA" : "gak ada";
    console.log(
      status +
        "  (" +
        count +
        " elemen)  -> " +
        sel +
        "   (wajar kalau 0, karena kamu sudah login)",
    );
  }

  console.log("");
  console.log("URL sekarang: " + page.url());
  console.log("");
  console.log("CARA BACA HASIL:");
  console.log("- Selector unread yang KENA = petamu benar");
  console.log("- Bandingkan angkanya dengan titik biru unread di layar");
  console.log("- Total chat harus LEBIH BANYAK dari unread (sehat)");
  console.log("");
  console.log("Browser dibiarkan terbuka. Tekan Ctrl+C untuk keluar.");
})();
