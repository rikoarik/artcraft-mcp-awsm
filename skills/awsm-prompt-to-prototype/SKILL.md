---
name: awsm-prompt-to-prototype
description: Mengubah brief atau prompt desain menjadi prototipe web interaktif lengkap: petakan layar dan state, cari ikon/foto relevan, buat visual bila perlu, implementasi responsive, motion aksesibel, lalu preview dan QA. Gunakan saat diminta membuat prototype end-to-end dari teks.
---

# Prompt → prototype

Skill ini mengorkestrasi `awsm-assets`, `awsm-asset-lab`, `awsm-auto-prototype`, dan `awsm-prototype-qa`. Ini **instruksi untuk agent**, bukan generator gambar AI atau controller aplikasi desain. Jangan mengklaim preview otomatis bila belum dijalankan.

1. **Brief:** tulis satu kalimat untuk audiens, tugas utama, tone, platform, dan batasan. Jika brief menyebut desain brand, pertahankan aset/tokens yang sudah ada. Pilih satu konsep visual spesifik, bukan template generik.
2. **Blueprint:** tentukan halaman/layar, navigasi, state penting (empty, loading, error), interaksi (click, toggle, menu, form), viewport target. Tanyakan hanya keputusan yang sungguh memblokir.
3. **Asset map:** untuk tiap section tentukan gambar yang dibutuhkan dan kata kunci pencarian dari prompt; cari `awsm_find_images` dan `awsm_find_icons`, cek lisensi, download dengan `awsm_download_asset`. Jangan tempatkan foto acak bila subjeknya substantif. Jika tidak ada foto yang pas, gunakan SVG teks eksplisit dari `awsm_make_asset` dan label sebagai placeholder, bukan pura-pura image generation AI.
4. **Build:** pakai stack project yang sudah ada; untuk greenfield cepat, HTML/CSS/JS sederhana. Ikuti skill `awsm-auto-prototype` untuk gerak yang relevan dan reduced motion. Buat navigasi/form punya fungsi nyata, bukan dead buttons. Pisahkan style dari content agar mudah diganti.
5. **Preview:** jalankan `awsm_serve` jika hasilnya statis; untuk framework gunakan dev server project. Buka di browser dan jalankan `awsm-prototype-qa` sebelum selesai.
6. **Handoff:** beri path project, URL preview bila server masih berjalan, catatan lisensi aset, dan fitur yang sengaja belum dibuat.

Jika target adalah FigCraft/Figma, bukan kode web, **jangan** gunakan `awsm_serve` sebagai pengganti integrasi. Pakai tools resmi desain yang tersedia, skill desain khusus aplikasi itu, dan verifikasi di kanvasnya.
