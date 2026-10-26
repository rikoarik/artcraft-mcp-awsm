---
name: awsm-prompt-to-prototype
description: Mengubah brief teks menjadi prototype web end-to-end: rencana layar dan state, aset relevan, implementasi interaktif, motion, preview, dan QA. Gunakan untuk permintaan “bikin prototype dari prompt”, UI lengkap, atau landing page interaktif.
---

# Prompt → prototype web

Skill ini mengorkestrasi pekerjaan agent coding; **bukan** generator UI otomatis dan **bukan** controller FigCraft. Utamakan stack dan brand proyek yang sudah ada; jangan melakukan scaffolding ulang yang merusak fitur existing.

## Brief → blueprint

1. Rangkum audiens, pekerjaan inti user, konten/brand, tujuan konversi, platform, teknologi yang sudah ada, dan deadline/lingkup. Ajukan pertanyaan hanya untuk keputusan yang mengubah arsitektur atau identitas; untuk celah kecil buat asumsi dan sebutkan.
2. Petakan 1–3 journey penting: entry → aksi → hasil. Buat daftar halaman/section, navigasi, data yang diperlukan, dan state `default / loading / empty / error / success`. Setiap CTA punya tujuan yang dapat diuji; jika backend tidak ada, jelaskan simulasi lokal, jangan mengarang penyimpanan data.
3. Tulis satu paragraf arah visual dari brief dan cek dengan `awsm-taste-ui` atau `awsm-antislop-ui`. Jangan memulai dengan hero-template, tiga kartu fitur, dan gradient hanya karena mudah.
4. Buat asset map: slot, query, rasio, lisensi. Pakai `awsm-assets` untuk foto/ikon dan `awsm-asset-lab` hanya untuk SVG sederhana. Jika tidak ada hasil yang relevan, gunakan placeholder yang jujur.

## Build → motion → verify

5. Implementasikan dalam framework proyek. Untuk greenfield kecil, HTML/CSS/JS bisa cukup; React hanya bila diminta atau proyek memang sudah memakainya. Pisahkan data copy, komponen, dan style; buat responsive berdasarkan kebutuhan konten.
6. Beri affordance, feedback form, keyboard/focus, alt, error yang jelas, dan reduced motion. Gunakan `awsm-motion-storyboard` untuk animasi fungsional. Tidak ada tombol mati atau konten tersembunyi jika JS gagal.
7. Jalankan build/test yang tersedia. Jika statis, panggil `serve({root:"folder-prototype"})` dan buka URL lokal; untuk framework gunakan dev server proyek. Ikuti `awsm-prototype-qa` dan `awsm-responsive-audit`: interaksi, console, mobile/tablet/desktop, serta revisi dari screenshot. `serve` hidup hanya saat proses MCP aktif.

## Handoff wajib

Berikan path, cara menjalankan, halaman/interaksi yang bekerja, URL preview hanya jika masih aktif, sumber & lisensi aset, hasil QA, batas backend/demo, dan daftar perbaikan bila masih ada. Jangan tulis “production-ready” tanpa verifikasi nyata.

**Contoh permintaan:** “Buat prototype booking studio dari brief ini, navigasi dan form bekerja, pakai foto berlisensi, motion minimal, lalu tunjukkan screenshot mobile.”

Jika output harus di kanvas FigCraft/Figma, hentikan asumsi web: pakai integrasi desain asli, inspeksi dokumen, dan verifikasi render di sana. `awsm-figcraft-handoff` membantu spesifikasi, bukan menggantikan tool kanvas.
