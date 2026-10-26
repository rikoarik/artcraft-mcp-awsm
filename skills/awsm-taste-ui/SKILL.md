---
name: awsm-taste-ui
description: Menentukan arah visual dan membangun UI web yang khas sebelum memilih layout, warna, tipografi, dan imagery. Gunakan untuk landing page, dashboard, komponen, redesign, atau permintaan agar tampilan lebih berkarakter dan tidak templated.
---

# Taste UI: keputusan visual yang bisa dibela

## Baca konteks, bukan moodboard generik

Identifikasi produk, audiens, tugas utama, bahasa brand, konten nyata, platform, dan constraint aksesibilitas. Jika ini redesign, screenshot UI sekarang dan tandai pola yang perlu dipertahankan (brand, alur, komponen yang sudah dikenali). Jangan mencabut identitas existing hanya agar tampak baru. Jika brief kabur, tawarkan satu interpretasi spesifik dan tandai asumsi.

## Buat konsep sebelum markup

Tuliskan 3 opsi singkat yang benar-benar berbeda **bila** user meminta eksplorasi; jika tidak, pilih satu arah dan jelaskan: perasaan yang dibutuhkan, elemen dominan, material visual, serta kenapa cocok dengan subjek. Tetapkan token awal: 4–6 warna bernama (bukan hanya accent), keluarga huruf dengan peran display/body dan fallback, scale spacing, radius, dan aturan gambar. Jangan otomatis memilih Inter/sistem atau combo serif-cream-terracotta; font dan warna boleh sederhana jika alasannya kuat.

Gambar ASCII wireframe untuk layar penting: apa yang dilihat pertama, urutan baca, lokasi aksi, dan kontras antara section. Pilih **satu** gestur visual yang memorable—typography, imagery, rhythm, data view, atau interaksi—dan tenangkan sekitarnya. Tidak semua informasi perlu kartu; gunakan border/nomor/kicker hanya bila mengkodekan informasi.

## Implementasi & kritik

1. Tulis copy nyata dan spesifik; CTA menyebut hasil tindakan. Jangan fabrikasi metrik/testimoni. Bila memerlukan foto/ikon, ikuti `awsm-assets` dan simpan lisensinya.
2. Terapkan hirarki tipografi (judul, pendukung, body, metadata), panjang baris yang nyaman, kontras dan whitespace fungsional. Atur mobile berdasarkan prioritas konten, bukan mengecilkan seluruh desktop.
3. Motion hanya untuk feedback atau orientasi; `awsm-motion-storyboard` menangani rincian. Reduced motion, fokus terlihat, dan state error/empty tetap bagian dari desain.
4. Render dan screenshot 360px serta desktop; lihat apa yang benar-benar terlihat, terutama fold, crop, wrap dan alignment. Kritik desain terhadap brief: sebut 2 keputusan yang membantu dan 1 yang perlu dikurangi. Revisi sebelum handoff.

## Format hasil

Berikan konsep satu paragraf, token inti, wireframe ringkas bila diminta, screenshot/path hasil, serta alasan tiap keputusan yang tidak generik. Jangan mengklaim 'premium' tanpa bukti tampilan atau fungsi.

**Contoh:** “Rancang katalog toko alat tulis kecil yang terasa seperti rak arsip nyata, bukan template SaaS; pertahankan logo existing, jelaskan sistem tipe dan mobile layout.”

Prinsip skill ini ditulis orisinal; jika belajar dari template/repo lain, dokumentasikan sumber dan jangan menyalin kode/asset tanpa memenuhi lisensi.
