# AutoReply Manager

Deteksi inbox Facebook Marketplace melalui browser persistent, lalu kirim notifikasi ke Telegram. Pengiriman balasan belum diimplementasikan; Fase 1 hanya mendeteksi inbox agar kontrol manusia tetap ada.

## Menjalankan

```bash
npm install
cp .env.example .env
cp accounts.example.json accounts.json
npm start
```

Isi `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` di `.env`, serta daftar akun pada `accounts.json`. Saat pertama kali dijalankan, browser akan terbuka untuk login manual. Data login setiap akun disimpan terpisah di `profiles/<id>` dan tidak dilacak Git.

Gunakan `HEADLESS=true npm start` hanya setelah sesi login sudah tersimpan.

## Pemeriksaan

```bash
npm test
npm run test:accounts
```

`npm run test:accounts` memvalidasi konfigurasi akun tanpa membuka browser. Tekan `Ctrl+C` saat aplikasi berjalan untuk menutup semua browser dengan aman.

## Status Fase 1

- Validasi `accounts.json`, termasuk ID/username ganda.
- Context Chromium persistent per akun dengan jendela tidak dikunci ukurannya.
- Navigasi ke Marketplace Inbox dan deteksi login yang perlu diperbarui.
- Deteksi selector unread dasar serta notifikasi Telegram tanpa spam untuk status yang sama.

Selector Facebook ada di `src/selectors.js` dan tetap perlu diverifikasi di setiap akun menggunakan Playwright codegen sebelum dipakai di skala besar.
