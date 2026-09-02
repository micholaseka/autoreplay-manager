# Pedoman Implementasi

Gunakan clean code pada setiap fase berikutnya.

- Gunakan nama variabel, fungsi, dan kelas yang deskriptif serta konsisten.
- Satu fungsi menangani satu tanggung jawab yang jelas.
- Hindari baris kode panjang dan beberapa pernyataan dalam satu baris; format kode agar mudah dipindai dan ditinjau.
- Pisahkan konfigurasi, akses eksternal, logika bisnis, dan selector/UI ke modul yang sesuai.
- Tangani kegagalan secara eksplisit dengan pesan error yang jelas tanpa menghentikan akun lain yang tidak terkait.
- Tambahkan atau perbarui pengujian untuk perilaku baru yang dapat diuji tanpa kredensial atau layanan eksternal.
- Jalankan pemeriksaan sintaks, tes terkait, dan `git diff --check` sebelum menyatakan pekerjaan selesai.
- Jangan mengubah data sensitif, profil browser, atau perubahan pengguna yang tidak terkait tanpa persetujuan eksplisit.
