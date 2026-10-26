---
name: awsm-motion-storyboard
description: Menyusun dan menerapkan motion prototype web untuk transisi layar, feedback kontrol, atau narasi scroll yang perlu orientasi, dengan reduced motion dan pengujian performa. Gunakan saat brief menyebut GSAP, motion, microinteraction, atau prototype animasi.
---

# Motion storyboard berbasis sebab-akibat

## Prioritaskan sinyal

Daftar peristiwa interaksi, bukan daftar elemen yang bisa digerakkan. Untuk tiap animasi tulis `trigger | before → after | properti | durasi relatif | kondisi berakhir | reduced-motion`. Klasifikasikan: feedback (klik/submit), orientasi (menu/modal), atau narasi konten. Jangan membuat seluruh section muncul terlambat hanya karena ada scroll.

## Aturan implementasi

1. Mulai dari native CSS transitions jika sederhana. Animasi `transform`/`opacity` lebih aman untuk performa dibanding layout/height/left yang memaksa reflow berulang. Semua perubahan state harus tetap jelas tanpa animasi.
2. Jika project sudah memakai GSAP/Motion, cek dokumentasi versi saat mengimplementasi. Ikat timeline ke lifecycle, bersihkan listener/ScrollTrigger saat keluar route, dan cegah trigger ganda setelah hot reload. Jangan memasang library berat hanya untuk satu fade.
3. Entrance punya waktu cepat dan end state yang dapat dicapai meskipun JS gagal. Jangan menyembunyikan judul/CTA di opacity 0 permanen. Hindari scroll-jacking, parallax cepat, gerak konstan, dan CTA yang berpindah saat diklik.
4. Untuk `prefers-reduced-motion: reduce`, matikan animasi non-esensial atau lakukan instant state change. Jangan menghapus konten atau feedback yang bergantung pada animasi. Pastikan keyboard focus tidak beradu dengan pergerakan elemen.

## Validasi

Rekam atau screenshot sebelum/sesudah state, tes pada mobile lambat dan reduced motion, cek clipping, layout shift, serta input latency. Jika video terlalu cepat untuk membaca konten, pendekkan atau hilangkan gerak. Serahkan storyboard dan daftar animasi yang berfungsi; jika hanya mockup statis, katakan tidak ada motion nyata.

**Contoh:** “Buat menu slide-in dan feedback submit untuk prototype booking; animasinya jangan mengganggu form atau pengguna reduced motion.”
