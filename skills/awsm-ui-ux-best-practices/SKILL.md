---
name: awsm-ui-ux-best-practices
description: Menerapkan dan meninjau usability serta aksesibilitas UI web: alur utama, navigasi, form, state error/loading/empty, keyboard, mobile, dan feedback. Gunakan saat merancang atau mereview pengalaman pengguna.
---

# UI/UX yang bisa dipakai orang nyata

## Mulai dari pekerjaan user

Tuliskan persona secara praktis (apa yang mereka coba lakukan, bukan stereotip demografis), entry point, aksi utama, hambatan, dan tanda keberhasilan. Buat jalur terpendek untuk tugas utama dan jalur pemulihan untuk gagal/kehabisan data. Prioritaskan arsitektur informasi sebelum menghias interface.

## Heuristik per area

- **Navigasi:** label sesuai kosakata user; status lokasi aktif jelas; back/close dapat diprediksi. Jangan menyembunyikan fitur penting hanya di hover.
- **Form:** label eksplisit, field order logis, contoh format bila perlu, validasi spesifik yang menunjuk field, pemulihan nilai setelah error. Tombol `Save` harus menghasilkan feedback `Saved`; tanpa backend nyata jangan klaim persisted.
- **State:** empty state menjelaskan mengapa kosong dan langkah berikutnya; loading punya indikator dan tidak melompat liar; success mengonfirmasi hasil; error memuat langkah perbaikan. Aksi destruktif butuh konfirmasi atau undo yang benar-benar bekerja.
- **Semantik:** heading berjenjang, landmark, link untuk navigasi dan button untuk aksi, alt untuk gambar bermakna. Uji keyboard dari awal sampai akhir, focus-visible dan escape untuk overlay.
- **Visual:** kontras teks/status, jangan sampaikan status hanya lewat warna, target sentuh nyaman, ukuran teks tetap terbaca pada zoom 200%, panjang baris wajar. Ikuti standar WCAG yang berlaku bila proyek punya target kepatuhan; jangan mengaku compliant tanpa audit formal.
- **Responsif:** uji 360px, 768px, 1200px, teks panjang, keyboard virtual dan landscape bila relevan. Prioritaskan konten untuk mobile daripada sekadar menumpuk grid.
- **Motion:** gunakan gerak untuk feedback/perubahan posisi; sediakan reduced motion dan jeda jika ada autoplay.

## Output audit

Tuliskan `journey | friksi | evidence | severity | rekomendasi | cara validasi`. Lakukan tes browser dan screenshot sebelum menyatakan masalah teratasi. Untuk implementasi lengkap rujuk `awsm-auto-prototype`; untuk QA akhir rujuk `awsm-prototype-qa`.

**Contoh:** “Review form checkout: pengguna sering bingung soal ongkir. Tunjukkan perbaikan urutan field, error, mobile keyboard, dan cara mengujinya.”
