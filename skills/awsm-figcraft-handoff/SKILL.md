---
name: awsm-figcraft-handoff
description: Menyiapkan handoff aset, token, ukuran frame, dan state prototype web untuk pekerjaan di FigCraft; gunakan ketika hasil diminta di kanvas FigCraft dan jelaskan bahwa MCP AWSM sendiri tidak mengedit dokumen desain.
---

# Handoff prototype → FigCraft

## Batas kemampuan

Tool MCP kit AWSM menyediakan pencarian aset, SVG sederhana, palet dan preview web. Ia **tidak** membuat frame/node, mengimpor aset, menyimpan dokumen, atau mengatur prototype FigCraft. Gunakan tools MCP FigCraft yang terhubung secara terpisah dan instruksi desain FigCraft yang berlaku. Jika koneksi tidak ada, berikan handoff spesifikasi; jangan mengaku telah mendesain di kanvas.

## Paket spesifikasi

1. Dari brief/prototype kode, daftar layar/frame, ukuran target, struktur hierarki, komponen, state (default/hover/focus/loading/error/success), dan tautan alur interaksi. Bedakan bagian yang benar-benar berfungsi di web dan representasi statis di FigCraft.
2. Ekspor tokens yang dipakai: warna hex dengan peran semantik, typography family/size/weight/line-height, grid/spacing, radius dan variants. Sertakan contoh pengukuran (mis. jarak header–hero) agar reproduksi tidak mengandalkan tebak-tebakan.
3. Siapkan path asset lokal dengan sumber, kreator, lisensi, rasio dan crop yang disarankan. Aset dari `awsm-assets` tidak otomatis masuk FigCraft; gunakan import yang disediakan aplikasi. Jangan menempel SVG asing tanpa review.
4. Jika tool FigCraft tersedia, inspeksi dokumen sebelum edit, ikuti workflow desain aplikasi, lalu buat frame/layer dengan tool tersebut. Verifikasi hasil dengan rendered PNG; cek hierarki, alignment, warna, teks dan asset setelah import. Jangan ganti dokumen user tanpa persetujuan/scope yang jelas.
5. Catat gap: interaksi backend/JS, motion, kondisi yang hanya ada di prototype kode, dan item yang perlu dibuat manual. Jika tidak bisa mengakses app, beri tabel frame + token + asset, bukan klaim selesai.

**Contoh:** “Tolong bawa landing page prototype ini ke FigCraft; siapkan frame desktop/mobile dan jelaskan state form mana yang belum ada di desain.”
