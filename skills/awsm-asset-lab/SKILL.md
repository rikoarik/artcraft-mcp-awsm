---
name: awsm-asset-lab
description: Membuat kartu OG, banner, badge monogram, dan placeholder SVG berbasis teks dari brief serta palet warna. Gunakan untuk aset sederhana orisinal ketika foto tidak tepat atau user meminta kartu sosial; bukan generator foto AI atau logo final.
---

# Asset lab: SVG template yang bisa diedit

## Sebelum membuat

Tentukan aset untuk apa, ukuran dan platform, judul/subjudul pendek, warna brand (hex), lokasi output, dan batasan lisensi. Jika input mencakup logo/foto/ilustrasi kompleks, jelaskan bahwa `make_asset` hanya membuat template SVG berbasis teks dan tawarkan pendekatan yang sesuai. Untuk materi sosial, tentukan safe area dan preview platform; rasio OG card bawaan 1200×630, banner 1600×500, badge 512×512, placeholder 800×600.

## Workflow

1. Audit warna existing terlebih dahulu. Jika tidak ada, pilih warna berdasarkan konteks; `palette({color:"#176F57",scheme:"complete"})` memberi variasi hue/tint/shade, bukan bukti aksesibilitas. Periksa kontras aktual untuk teks kecil dan besar. Jangan menerapkan semua swatch sekaligus.
2. Tulis copy pendek: satu gagasan utama, subjudul pendukung, label hanya bila berguna. `make_asset` tidak melakukan wrapping otomatis; judul panjang dapat keluar kanvas. Hindari menaruh statistik atau kutipan tanpa sumber.
3. Panggil `make_asset` dengan `kind`, `title`, `subtitle`, `label`, `colors` (hingga tiga hex), dan `dir`/`filename`. Gunakan `og-card` untuk berbagi tautan, `banner` untuk strip hero, `badge` untuk monogram sementara, `placeholder` untuk slot yang belum diisi. Tool menolak nama SVG yang sudah ada; ganti filename untuk revisi dan jangan hapus aset pengguna tanpa izin.
4. Buka hasil dengan renderer SVG/browser. Cek clipping, penggantian font, keterbacaan di skala thumbnail, kontras, dan panjang teks. Bila gagal, pendekkan teks atau ubah palette/dimensi dan buat revisi baru; jangan mengaku selesai hanya karena file tersimpan.
5. Untuk Open Graph, uji platform tujuan; konversi ke PNG jika platform memerlukan raster. Simpan sumber `.svg`, catat varian, dan sertakan contoh penggunaan (`<img src="assets/card.svg" alt="...">`). SVG kartu bukan otomatis thumbnail sosial universal.

## Batas & keluaran

Jangan menyebut badge sebagai identitas logo final, atau grafis template sebagai “AI-generated photo”. Tidak ada model gambar di paket ini. Handoff harus berisi path, jenis, dimensi, warna, preview, dan catatan format target. Bila user meminta foto relevan, alihkan ke `awsm-assets`.

**Contoh:** “Buat OG card untuk Kopi Pagi berjudul singkat dalam hijau gelap, tampilkan preview, lalu beri file SVG dan warna yang dipakai.”
