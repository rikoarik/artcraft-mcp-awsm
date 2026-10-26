---
name: awsm-auto-prototype
description: Implementasikan prototipe web interaktif dari prompt atau desain: navigasi/state berfungsi, responsif, animasi CSS/GSAP/Framer Motion yang bermakna dan reduced-motion, lalu preview dan uji di browser.
---

# Prototype hidup dengan motion

1. Pilih stack yang sudah dipakai project. Untuk greenfield kecil, HTML/CSS/JS tanpa build step cukup; jangan memaksa React. Jika memasang GSAP atau Motion, cek dokumentasi versi dan dependensi project sebelum menulis API spesifik. Motion tidak wajib menambah library.
2. Definisikan state dan interaksi yang akan diuji: perpindahan layar, menu, hover/focus, validasi form, empty/error. Hindari CTA yang tidak melakukan apa-apa.
3. Temukan aset relevan lewat `awsm-assets`; gunakan placeholder hanya selama draft. Bentuk visual harus mengikuti brief, bukan otomatis gradient, kartu seragam, font default, dan animasi fade massal.
4. Animasi untuk orientasi dan feedback: entrance satu kali, respons hover/press singkat, transisi state. Prioritaskan transform dan opacity, hindari layout thrashing. Jangan sembunyikan konten penting sebelum JS berjalan; gunakan progressive enhancement.
5. Hormati `prefers-reduced-motion: reduce`: kurangi atau hilangkan animasi non-esensial. Sertakan focus-visible dan dukungan keyboard. Jika memakai GSAP, gunakan matchMedia atau guard media query yang setara; jika memakai CSS, sediakan aturan media reduce.
6. Preview HTML statis dengan `awsm_serve`; aplikasi framework memakai dev server masing-masing. Browser QA wajib dengan `awsm-prototype-qa`. URL localhost hanya hidup selama server MCP tersebut aktif; jangan klaim deployed.
