---
name: awsm-assets
description: Menemukan foto dan ikon relevan dari brief untuk halaman, dashboard, atau prototype; verifikasi lisensi, atribusi, konsistensi ikon, dan menyimpan aset lokal. Gunakan saat user meminta gambar, icon, visual dari prompt, atau aset untuk UI.
---

# Asset discovery dari prompt

## Input dan keputusan awal

Dapatkan konteks halaman, audiens, subjek, peran aset (hero, thumbnail, ilustrasi pendukung, kontrol), rasio, tone, lokasi pemakaian, dan batasan brand. Jika subjek spesifik belum jelas, turunkan 2–3 query dari konten nyata; jangan berasumsi 'modern' berarti gambar abstrak. Susun tabel kecil: slot → tujuan → query → rasio → kebutuhan lisensi. Bedakan gambar dekoratif dan yang mengandung informasi.

## Alur pencarian

1. Untuk foto, panggil `find_images` dengan `provider: "openverse"` dan query deskriptif, misalnya `"barista pouring espresso natural window light"`; default hasil hanya disaring untuk lisensi komersial. Cek `title`, `creator`, `license`, `attribution`, `page`, `width`, `height`; filter komersial **bukan** izin otomatis untuk semua penggunaan. Jika hasil tidak cocok, ubah subjek/perspektif/konteks dua kali sebelum pindah provider.
2. `pexels` dan `unsplash` hanya jika API key memang tersedia pada proses MCP; jangan meminta key di chat atau menulisnya di repo. `picsum` hanya placeholder acak, bukan pencarian relevan. Jika network gagal, pertahankan slot placeholder berlabel dan laporkan, jangan mengarang foto atau lisensi.
3. Untuk ikon, `find_icons` dengan kata kerja/objek yang benar (mis. `delivery truck`, `upload`), pilih satu family seperti `lucide`, kemudian `get_icon` untuk ikon yang dipakai. Cek lisensi family di halaman sumber Iconify, stroke/filled weight, viewBox, dan ukuran. Sesuaikan label aksesibilitas: ikon informatif diberi nama, ikon dekoratif disembunyikan dari assistive tech.
4. Pilih 1–3 kandidat per slot berdasarkan akurasi semantik, crop yang aman, resolusi, dan hak pakai; jangan sekadar paling cantik. `download_asset` hanya untuk raster dari URL yang dipilih; simpan dalam direktori proyek dengan nama jelas. Tool menolak SVG eksternal, file duplikat, dan berkas >10 MB. Untuk ikon SVG gunakan hasil `get_icon` dengan review markup, bukan `download_asset`.
5. Gunakan path lokal relatif dalam implementasi, alt bermakna untuk foto yang membawa informasi, `alt=""` untuk dekorasi. Jangan hotlink preview API di produk final.

## Ledger dan verifikasi

Catat `file | slot | halaman sumber | kreator | lisensi | teks atribusi | tanggal cek`. Bila lisensi mengharuskan atribusi, tempatkan kredit di tempat yang relevan. Lihat hasil rendered: wajah/objek tidak terpotong di mobile, kontras overlay cukup, file dan ikon benar-benar load. Jika tidak ada kandidat aman, gunakan `awsm-asset-lab` untuk placeholder grafis berlabel, bukan menyebutnya AI image generation.

**Handoff:** daftar pilihan, path file, lisensi/atribusi yang diverifikasi, aset yang belum ditemukan. Contoh permintaan: “Cari foto interior kedai kecil untuk hero 16:9 dan ikon reservasi; jangan pakai foto acak dan sertakan kredit.”

Jika targetnya FigCraft, impor via tools desain yang tersedia dan ikuti skill khusus FigCraft; MCP ini tidak memodifikasi kanvas.
