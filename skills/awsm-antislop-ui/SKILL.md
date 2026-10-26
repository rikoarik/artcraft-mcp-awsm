---
name: awsm-antislop-ui
description: Mengaudit dan memperbaiki UI generik/AI-looking tanpa merusak brand atau perilaku; gunakan saat redesign, review tampilan, atau user meminta halaman “less AI”, lebih spesifik, dan tidak templated.
---

# Anti-slop: diagnosis → revisi → pembuktian

## Audit dengan bukti

Buka UI existing di browser dan ambil screenshot desktop/mobile, periksa copy dan interaksi. Catat temuan menurut dampaknya, bukan daftar larangan otomatis: repetisi kartu sama ukuran, hero gradient/warna tanpa alasan, ikon emoji, eyebrow di setiap section, tipografi tanpa hirarki, CTA umum, faux social proof, animasi fade massal, atau copy benefit-speak. Pola tersebut valid bila memang bagian identitas/tujuan; jangan ubah yang bekerja hanya karena mirip tren.

Buat ringkasan `masalah → dampak ke tugas user → solusi spesifik → risiko perubahan`. Prioritaskan satu area dominan (mis. hero tidak menjelaskan produk), kemudian pola sekunder. Jangan mereskin seluruh aplikasi jika request terbatas pada satu komponen.

## Rancang arah yang spesifik

1. Ambil subject matter dan bahasa user sebagai bahan visual; pilih tipe, ruang, warna, gambar, dan struktur yang terasa milik brand itu. Jangan mengganti satu template dengan template populer lain (mis. serif + cream + terracotta + label monospace).
2. Ganti copy abstrak dengan apa yang produk lakukan, untuk siapa, dan bukti yang benar-benar ada. Tombol menyatakan akibat klik. Hapus statistik/testimoni yang tidak bersumber.
3. Variasikan hierarchy berdasarkan kepentingan, bukan pola 'semua kartu'; beri ruang pada konten penting dan sederhanakan ornamen. Tetapkan radius/border/shadow hanya ketika memperjelas kelompok atau affordance.
4. Evaluasi aksesibilitas selama revisi: kontras, focus, semantik, responsive, dan reduced motion. Jangan membuat UI lebih unik tetapi kurang dapat digunakan.

## Bukti selesai

Bandingkan screenshot sebelum/sesudah pada ukuran yang sama. Uji navigasi dan fungsi semula untuk mencegah regresi; cek console. Serahkan daftar perubahan dan alasan, bagian brand yang dipertahankan, serta isu yang belum selesai. Jika tidak dapat render UI, katakan audit visual masih provisional.

**Contoh:** “Audit landing page SaaS ini; hilangkan kartu dan gradient generik, pertahankan warna dan flow checkout, tunjukkan before/after 360px dan 1200px.”
