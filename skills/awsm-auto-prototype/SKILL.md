---
name: awsm-auto-prototype
description: Mengimplementasikan prototype web interaktif dan motion sesuai stack proyek dari layar/brief yang sudah dipetakan. Gunakan untuk navigasi klik, menu, form, transisi state, serta preview prototype dengan reduced motion.
---

# Prototype hidup, bukan screenshot klik-palsu

## Kontrak interaksi

Sebelum coding, tulis tabel `kontrol | tindakan | perubahan state | umpan balik | keyboard | fallback`. Untuk contoh form reservasi: input wajib → validasi → loading → konfirmasi; tanpa backend, data tidak boleh diklaim tersimpan. Tautan harus punya target yang ada; CTA eksternal boleh membuka URL yang benar atau diberi label belum tersedia, jangan dead button.

## Implementasi sesuai konteks

- Inspeksi dependencies dan pola project; gunakan komponen/router/state yang sudah ada. Greenfield kecil bisa HTML/CSS/JS progresif. Jangan menambahkan React/GSAP hanya untuk satu tombol.
- Pertahankan konten dasar tanpa JS sebisa mungkin. Pakai elemen native (`button`, `a`, `form`) dan event yang mendukung click/touch/keyboard; gunakan ARIA hanya jika semantik native belum cukup.
- Rancang empty/error/loading, input tidak valid, teks panjang, dan ukuran layar kecil. Untuk aset ikuti `awsm-assets`; jangan blokir alur karena API foto tidak tersedia.

## Motion yang mempunyai sebab

1. Pilih transisi yang menunjukkan apa yang berubah: menu terbuka, item masuk, submit diproses. Definisikan trigger, durasi relatif, easing, end state. Animasi CSS transform/opacity sering cukup.
2. Bila memilih GSAP atau Motion, periksa dokumentasi library dan versinya sebelum memakai API spesifik. Bersihkan listener/timeline saat unmount; hindari layout thrash dan animasi pada setiap elemen hanya untuk dekorasi.
3. Dukung `prefers-reduced-motion: reduce`: matikan gerak non-esensial; status tetap terlihat. Konten utama tidak boleh invisible permanen jika JS gagal. Focus-visible tidak diganti sekadar hover.

## Preview dan acceptance

Gunakan `serve` hanya untuk folder HTML statis yang aman; server ini bukan deployment. Untuk app framework jalankan dev server. Buka browser pada mobile dan desktop, jalankan alur utama, cek error JS/network, uji tab/enter/escape dan reduced motion; rujuk `awsm-prototype-qa`. Serahkan daftar interaksi dengan status `working / simulated / blocked` dan bukti screenshot, bukan klaim umum.

**Contoh:** “Dari tiga wireframe ini, buat navigasi dan booking form yang benar-benar berubah state, animasi menu singkat, dan screenshot 360px.”
