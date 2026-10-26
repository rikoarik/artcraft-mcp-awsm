---
name: Find Visual Assets
description: Cari ikon SVG dan foto yang relevan dari prompt desain untuk web/prototype; cek lisensi dan atribusi, simpan file lokal, lalu gunakan satu keluarga ikon secara konsisten.
---

# Cari visual dari prompt

1. Uraikan kebutuhan tiap section: subjek, konteks, rasio/ukuran, mood, dan apakah foto harus menggambarkan objek spesifik. Gunakan kata kunci Inggris yang deskriptif saat pencarian kurang tepat.
2. Untuk ikon, panggil `awsm_find_icons` dengan query subjek. Pilih satu keluarga Iconify yang konsisten; panggil `awsm_get_icon` untuk SVG yang benar-benar dipilih. Periksa lisensi keluarga ikon dari sumbernya sebelum dipublikasikan.
3. Untuk foto, panggil `awsm_find_images` (Openverse default; Pexels/Unsplash jika API key tersedia). Pilih berdasarkan relevansi **dan** lisensi. Openverse hanya menyaring lisensi komersial, bukan menghapus kewajiban atribusi atau verifikasi hak. Picsum hanya untuk placeholder; fotonya tidak terkait query.
4. Simpan foto final dengan `awsm_download_asset` ke folder project. Ingat nama file, sumber, kreator, tautan, dan lisensi di dokumentasi proyek atau caption/credits jika diwajibkan. Jangan hotlink URL preview.
5. Jika hasil pencarian tidak relevan setelah dua variasi query, gunakan `awsm-asset-lab` untuk SVG sederhana; jelaskan bahwa itu aset grafis berbasis teks, bukan ilustrasi/foto yang dihasilkan AI.

Jika dipakai dalam FigCraft, ikuti workflow skill FigCraft dan impor asset melalui tools aplikasi yang benar; tool MCP paket ini tidak otomatis mengubah dokumen FigCraft.
