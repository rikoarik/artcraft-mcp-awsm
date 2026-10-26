---
name: awsm-design-system
description: Membangun atau merapikan sistem token dan komponen UI reusable untuk banyak layar: color roles, type/spacing, state, dark mode, dan dokumentasi. Gunakan ketika proyek membutuhkan konsistensi lintas layar, bukan untuk sekadar satu kartu.
---

# Design system pragmatis

## Scope

Audit produk: jumlah layar, komponen berulang, brand tokens existing, CSS conventions, dan kebutuhan tema. Untuk satu halaman kecil, dokumentasikan tokens sederhana tanpa membuat library komponen besar. Jika sistem sudah ada, perluas secara kompatibel; jangan mengubah nama semantic token tanpa migrasi.

## Tiga lapis token

1. **Primitive:** nilai mentah seperti `green-700`, type sizes, spacing scale, radius. Ini bukan API komponen; namanya boleh deskriptif nilai.
2. **Semantic:** peran `surface`, `text-primary`, `border-subtle`, `action-primary`, `danger`, `focus-ring`. Petakan ke primitive per light/dark mode; jangan pakai merah untuk satu-satunya indikator error.
3. **Component:** hanya bila komponen butuh override stabil, mis. `button-primary-bg`, `input-error-border`. Hindari token per satu detail yang tak punya reuse.

Buat spesifikasi type roles (display/title/body/label), density/spacing dan breakpoint berdasarkan isi. Untuk setiap komponen, jelaskan anatomy, variant, default/hover/focus/disabled/loading/error, keyboard behavior, responsive, dan peraturan copy. Periksa contrast semua state termasuk disabled yang tetap harus bisa dikenali.

## Implementasi & validasi

- Sesuaikan dengan stack/style project; buat contoh penggunaan yang berjalan, jangan sekadar tabel token. Jika ada generator/theme library, baca versi dokumentasi sebelum mengubah API.
- Uji minimal satu form, navigasi, dan alert pada mobile/desktop, teks panjang, zoom 200%, serta mode gelap bila didukung. Screenshot bagian penting; pastikan tokens semantic benar-benar dipakai, bukan nilai hardcode paralel.
- Handoff sebagai file tokens + tabel mapping lama→baru + contoh komponen + keputusan aksesibilitas dan item yang belum dicakup.

**Contoh:** “Satukan 4 layar admin yang sekarang punya tiga shade hijau dan enam bentuk button menjadi token reusable, tanpa mengubah brand.”
