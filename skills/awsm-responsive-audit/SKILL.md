---
name: awsm-responsive-audit
description: Audit responsive layout dan kualitas visual prototype pada mobile, tablet, desktop, dan zoom tinggi sebelum handoff.
---

# Responsive audit

1. Ambil screenshot pada 360px, 768px, dan 1200px serta satu viewport di antaranya; tambah 200% zoom bila mungkin.
2. Periksa overflow horizontal, header/nav, gambar dan crop, type wraps, jarak CTA, tap target, serta teks panjang.
3. Uji keyboard mobile dan orientasi landscape untuk form/menu. Pastikan konten inti tidak terhalang fixed elements.
4. Ubah CSS dengan solusi konten-first: fluid widths dan breakpoints saat layout benar-benar patah, bukan per perangkat.
5. Ambil ulang screenshot; laporkan hasil dan masalah yang tersisa. Jangan klaim lulus tanpa render.
