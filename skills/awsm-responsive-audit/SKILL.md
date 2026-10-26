---
name: awsm-responsive-audit
description: Menguji dan memperbaiki layout web pada mobile, tablet, desktop, zoom, dan konten panjang. Gunakan saat UI overflow, navigasi pecah, gambar crop buruk, atau sebelum handoff prototype responsive.
---

# Responsive audit yang tidak berhenti di tiga ukuran

## Audit awal

Tentukan viewport 360px, 768px, 1200px dan tambah ukuran intermediate saat terjadi perubahan layout; jika perlu 320px untuk target perangkat kecil. Set font scale/zoom 200% saat memungkinkan. Buat daftar konten ekstrem: nama panjang, error form, menu banyak item, gambar kosong/lambat, dan URL tak terpotong.

## Inspect → fix → recheck

1. Ambil screenshot tiap viewport dan scroll halaman penuh. Cek horizontal overflow, header/nav/tap targets, urutan baca, wrap judul, panjang baris, foto/crop, overlay teks, fixed/sticky element, footer, dan area yang tersembunyi di bawah keyboard mobile.
2. Jalankan journey yang sama pada mobile dan desktop; menu, search, form, modal, dan CTA bisa berubah perilaku karena viewport. Uji portrait/landscape bila flow kritis.
3. Perbaiki berdasarkan konten: `max-width`, fluid width dan spacing, image `object-fit` dengan fokus yang masuk akal, serta breakpoint saat komposisi benar-benar patah. Jangan menambahkan breakpoint untuk tiap ukuran device; prioritaskan hierarki dan konten.
4. Ulang screenshot pada ukuran yang gagal dan satu ukuran di antara breakpoint untuk mendeteksi regresi. Cek teks panjang dan zoom lagi setelah perbaikan.

## Hasil

Tulis tabel `viewport | masalah | bukti | perubahan | status ulang tes`. Sertakan path screenshot/URL preview dan daftar batas pengujian bila tidak ada browser/device. Jangan menyebut 'responsive' hanya karena CSS punya media query.

**Contoh:** “Halaman harga pecah di 390px. Audit mobile/tablet/desktop plus zoom 200%, perbaiki tabel dan screenshot ulang.”
