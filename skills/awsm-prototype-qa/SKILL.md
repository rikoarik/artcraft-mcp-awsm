---
name: awsm-prototype-qa
description: Menguji prototype web yang baru dibuat atau diubah: interaksi, responsive, accessibility dasar, console/network, lisensi aset, dan reduced motion. Gunakan sebelum handoff UI/prototype, bukan hanya setelah build berhasil.
---

# QA prototype berbasis bukti

## Siapkan matriks

Dapatkan URL/local command dan daftar journey utama dari developer. Catat ukuran 360px, 768px, 1200px (tambahkan lebar lain saat layout patah), browser yang tersedia, serta state yang mungkin: default, loading, empty, error, success. Jangan menyatakan tes dilakukan jika browser/screenshot tidak tersedia.

## Eksekusi

1. Jalankan lint/build/test proyek bila ada. Build sukses hanya bukti kompilasi; tetap buka UI dengan browser automation. Untuk halaman statis, `serve` dapat memberi URL lokal, jangan serve folder yang mengandung rahasia.
2. Screenshot di setiap viewport dan periksa overflow, clipping, teks terlalu rapat/panjang, image crop, CTA tidak terlihat, sticky header, dan keyboard mobile jika memungkinkan. Baca gambar, bukan hanya status HTTP 200.
3. Jalankan setiap journey: menu buka/tutup, anchor, CTA, form kosong/valid/error, status submit, navigasi balik. Cek keyboard: Tab berurutan, focus terlihat, Enter/Space, Escape pada dialog/menu, dan label input. Jangan menganggap hover mewakili touch.
4. Periksa console dan network untuk exception JS, 404, gambar/font gagal load, mixed content. Jika ada pihak ketiga offline, pastikan fallback membuat fungsi inti tetap bisa dipahami.
5. Uji reduced motion dengan emulasi `prefers-reduced-motion: reduce`, zoom 200%, kontras teks/status, alt yang tepat, target klik yang nyaman, dan layout ketika teks panjang. Periksa sumber/lisensi/atribusi gambar ikon dari `awsm-assets`.
6. Perbaiki masalah kritis, ulangi tes pada viewport dan journey terdampak. Catat apa yang tidak bisa diverifikasi (mis. backend/real device).

## Format laporan

| Severity | Lokasi / viewport | Langkah reproduksi | Expected vs actual | Bukti | Perbaikan / status |
| --- | --- | --- | --- | --- | --- |

Tutup dengan ringkasan lulus/gagal per journey, command build/test, path screenshot, dan hal yang sengaja simulated. Blok handoff bila layar blank, CTA inti mati, data palsu diklaim tersimpan, atau aset melanggar lisensi.

**Contoh:** “QA halaman checkout 360–1200 px, form kosong dan valid, keyboard, console, serta reduced motion; berikan temuan yang bisa direproduksi.”
