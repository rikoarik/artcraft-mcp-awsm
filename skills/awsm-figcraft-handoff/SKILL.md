---
name: awsm-figcraft-handoff
description: Siapkan assets, spesifikasi, dan handoff dari prototype web ke FigCraft ketika user meminta hasil di kanvas FigCraft.
---

# FigCraft handoff

MCP paket ini **tidak mengedit kanvas FigCraft**. Jika ada koneksi FigCraft resmi, gunakan workflow dan tool aplikasi tersebut setelah inspeksi dokumen. Jangan mengaku halaman web otomatis berubah menjadi desain FigCraft.

1. Siapkan struktur frame, ukuran, aset berlisensi, type/spacing/color tokens dan state yang perlu direpresentasikan.
2. Jika tool FigCraft tersedia, inspeksi dokumen terlebih dahulu dan ikuti instruksi desain khusus FigCraft; buat node lewat tool FigCraft, bukan `awsm_serve`.
3. Verifikasi hasil di rendered PNG dan catat interaksi yang hanya ada di prototype kode vs di FigCraft.
4. Jika tool tidak tersedia, beri handoff tekstual/aset dan nyatakan batasnya.
