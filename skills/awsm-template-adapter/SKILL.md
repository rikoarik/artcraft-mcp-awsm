---
name: awsm-template-adapter
description: Mengadaptasi template UI yang tersedia secara legal menjadi prototype sesuai brief dan brand, bukan menyalin desain acak. Gunakan ketika user menunjuk template/repo existing atau meminta mulai dari template.
---

# Dari template ke produk yang benar-benar cocok

## Seleksi sumber

Inspeksi template yang diberikan user lebih dulu: struktur, framework/version, dependencies, dokumentasi, lisensi, assets, komponen, dan feature flags. Bila user meminta mencari template online, pilih kandidat dengan lisensi jelas serta kesesuaian stack; jangan menyalin repo atau mengunduh konten berhak cipta tanpa izin. Catat sumber, lisensi, dan atribusi yang dibutuhkan. Jika tidak ada kandidat aman, susun layout baru dari prinsip umum, bukan clone pixel.

## Mapping

Buat tabel `slot template → kebutuhan brief → keep/adapt/remove → risiko`. Tentukan apa yang tetap: navigasi, komponen aksesibel, typography tokens, routes; apa yang dibuang: dummy CTA, fake testimonials, lorem ipsum, gambar stok tidak relevan. Tentukan state yang hilang (loading/empty/error), lalu set acceptance untuk fungsi tiap section.

## Adaptasi bertahap

1. Jalankan template as-is dan screenshot desktop/mobile; catat broken build, dependensi, dan konten placeholder sebelum mengubahnya.
2. Terapkan brand existing melalui token warna/type/spacing; jangan sekadar mengganti warna gradient. Ubah copy berdasarkan produk dan tambahkan foto/ikon lewat `awsm-assets` dengan ledger lisensi.
3. Sambungkan navigasi dan CTA ke tujuan nyata. Untuk data palsu/simulasi, labelkan jelas. Pertahankan arsitektur proyek bila masuk akal; jangan membuang state atau test yang masih dipakai.
4. Uji layout dan fungsi setelah tiap batch perubahan. Periksa konflik CSS, keyboard, responsive, dan reduced motion. Ikuti `awsm-prototype-qa` sebelum handoff.

## Handoff

Berikan link/versi sumber, atribusi/lisensi, bagian yang dipakai, perubahan visual/fungsi, hasil QA, dan area yang masih warisan template. Jangan mengklaim 100% desain orisinal bila basisnya karya pihak lain.

**Contoh:** “Pakai template landing page yang sudah ada di repo ini, sesuaikan untuk klinik gigi tanpa menghilangkan form booking, lalu cek lisensi foto.”
