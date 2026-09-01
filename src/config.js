// config.js
// Ini "panel listrik utama" project. Semua file lain (accountManager,
// browserEngine, telegram, dll) ambil pengaturan dari sini — bukan
// baca .env sendiri-sendiri.

require("dotenv").config();
const path = require("path");

const config = {
  // Token & chat ID buat robot lapor ke Telegram kamu
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
  },

  // Lokasi file & folder penting
  paths: {
    accounts: path.join(__dirname, "..", "accounts.json"),
    profiles: path.join(__dirname, "..", "profiles"), // data login per akun
  },

  // Pengaturan robot cek inbox
  watcher: {
    // jeda antar putaran cek semua akun (dalam milidetik)
    cycleIntervalMs: 60_000, // 1 menit
  },
};

// Validasi dasar: kalau token Telegram belum diisi, kasih peringatan
// jelas dari awal — daripada error membingungkan di tengah jalan nanti.
function validateConfig() {
  const missing = [];
  if (!config.telegram.botToken) missing.push("TELEGRAM_BOT_TOKEN");
  if (!config.telegram.chatId) missing.push("TELEGRAM_CHAT_ID");

  if (missing.length > 0) {
    console.warn(
      `[config] Peringatan: ${missing.join(", ")} belum diisi di file .env`,
    );
  }
}

validateConfig();

module.exports = config;
