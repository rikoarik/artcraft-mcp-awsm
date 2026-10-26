---
name: Prototype QA
description: Memeriksa prototipe web sebelum serah: responsif, accessibility, navigasi, console error, lisensi foto/ikon, performa dasar, dan reduced motion. Dipakai setelah membuat atau mengubah UI/prototype.
---

# Prototype QA

1. Jalankan build/lint/test project bila tersedia. Jangan menganggap build sukses berarti UI ter-render.
2. Buka aplikasi dengan browser automation yang tersedia (mis. skill `agent-browser`), bukan hanya membaca HTML. Cek 360px, 768px, dan 1200px; screenshot setiap viewport, cek overflow, hierarki visual, clipping, dan teks panjang.
3. Jalankan interaksi utama: semua link, CTA, navigasi keyboard, form (kosong/valid/error). Pastikan tidak ada tombol mati.
4. Cek console dan network: error JS, gambar gagal load, font gagal load, CDN mati. Jika network tak tersedia, fallback harus mempertahankan konten penting.
5. Uji `prefers-reduced-motion: reduce`, focus-visible, kontras teks, label input, alt untuk gambar bermakna, dan target klik di mobile.
6. Pastikan atribusi dan lisensi untuk image/ikon yang dipilih dari pencarian. Jangan mengartikan filter 'commercial' sebagai izin tanpa atribusi.
7. Perbaiki masalah yang ditemukan dan ulangi tes yang relevan. Laporkan yang belum bisa diverifikasi secara eksplisit, jangan tulis 'tested' tanpa bukti.
