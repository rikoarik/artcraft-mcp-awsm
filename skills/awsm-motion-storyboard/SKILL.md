---
name: awsm-motion-storyboard
description: Rancang motion prototype web yang komunikatif untuk transisi, feedback, dan narasi scroll, termasuk reduced motion dan performa.
---

# Motion storyboard

1. Buat daftar interaksi dan state yang butuh gerak; tiap animasi harus menjelaskan sebab-akibat, perubahan lokasi, atau feedback.
2. Tulis trigger, elemen, durasi, easing, serta end state. Hanya animasikan opacity/transform jika memungkinkan; hindari animasi layout yang berat.
3. Entrance jangan menghalangi konten. Hindari scroll-jacking, autoplay berlebihan, atau gerak yang tidak bisa dihentikan.
4. Tambahkan jalur `prefers-reduced-motion: reduce` dengan konten tetap terbaca dan status tetap jelas.
5. Implementasi sesuai stack yang ada; kalau membutuhkan library (GSAP/Motion), cek docs versi dan bundle. Uji di mobile nyata/browser.
