---
name: Generate Simple Assets
description: Buat grafis SVG berbasis teks (OG card, banner, badge monogram, placeholder) dan palet warna dari brief. Gunakan saat diminta asset sederhana orisinal atau pencarian gambar tidak cocok; bukan generator foto/ilustrasi AI.
---

# Asset SVG sederhana

1. Ambil warna brand yang ada. Jika tidak ada, pilih warna yang sesuai brief, lalu gunakan `awsm_palette` untuk alternatif warna; pilih berdasarkan kontras dan makna, bukan semua hasil sekaligus.
2. Gunakan `awsm_make_asset` untuk `og-card`, `banner`, `badge`, atau `placeholder`. Berikan judul ringkas; SVG tidak melakukan wrapping otomatis. Jangan pakai badge monogram sebagai klaim logo final.
3. Buka hasil dan cek tampilan, terutama apakah judul keluar dari kanvas atau kontras buruk. Jika gagal, pendekkan teks atau ubah palet, lalu render ulang.
4. Beri tahu user bahwa hasil ini SVG berbasis template dan teks, bukan image generation berbasis model AI. Untuk foto, gunakan `awsm-assets`. Untuk ilustrasi generatif, butuh provider generator gambar dan kredensial yang dikonfigurasi terpisah.
5. Untuk OG image, konversi SVG ke raster jika platform target membutuhkannya; uji preview kartu nyata sebelum rilis.
