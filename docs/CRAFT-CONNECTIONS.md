# Menghubungkan aplikasi Craft

AWSM tidak memasang aplikasi Craft. Pasang aplikasi yang dibutuhkan dan pastikan
`figcraft-cli`, `solidcraft-cli`, atau `cadcraft-cli` tersedia di PATH proses AWSM.
Penemuan CLI bukan bukti bahwa dokumen yang terlihat sudah terhubung.

## Dokumen terbuka

- FigCraft: aplikasi harus menyediakan control channel, misalnya diluncurkan
  dengan `figcraft --control 7979`; bridge memakai `figcraft-cli mcp --attach 7979`.
  Aplikasi yang sudah terbuka tanpa control channel belum tentu bisa dihubungkan.
  Jangan restart/menutup pekerjaan yang belum disimpan secara otomatis.
- SolidCraft: AWSM dapat membaca catatan port aktif native atau memakai endpoint
  eksplisit. Koneksi attached memakai `solidcraft-cli mcp --connect 127.0.0.1:PORT`.
  Catatan port lama tetap bisa gagal jika aplikasi sudah ditutup.
- CADCraft: gunakan control channel aplikasi dan bridge
  `cadcraft-cli mcp --connect 127.0.0.1:PORT`. Mode MCP biasa memakai drawing headless.

Endpoint eksplisit dapat diberikan melalui `AWSM_FIGCRAFT_ENDPOINT`,
`AWSM_SOLIDCRAFT_ENDPOINT`, atau `AWSM_CADCRAFT_ENDPOINT` pada proses AWSM.
Nilainya berupa port atau `127.0.0.1:PORT`. Jika beberapa aplikasi cocok, pilih
endpoint yang dimaksud. AWSM tidak memindai seluruh port jaringan.

## Konfigurasi bridge eksplisit

Gabungkan entri berikut ke `.awsm/bridges.json` dari folder kerja AWSM; jangan
menimpa server lain. Port harus cocok dengan aplikasi yang memang sedang berjalan.

```json
{
  "version": 1,
  "servers": {
    "figcraft": {
      "command": "figcraft-cli",
      "args": ["mcp", "--attach", "7979"],
      "allowedTools": [
        "inspect_document", "get_node", "create_node", "set_properties",
        "list_commands", "batch", "run_command", "screenshot", "export", "save_file"
      ]
    }
  }
}
```

Sesuaikan tool dengan provider yang terpasang. `allowedTools` membatasi tool yang
boleh diteruskan; gunakan hanya perintah/provider tepercaya. Provider berjalan
dengan izin akun lokal. Batas akses file tetap diatur aplikasi native.
Untuk FigCraft attached, atur automation read/write roots pada aplikasinya,
bukan pada CLI attach. Jangan melemahkan pembatasan file untuk mengatasi error.

Jika AWSM dimulai dari folder lain, set `AWSM_BRIDGE_CONFIG` ke path absolut file
konfigurasi. Restart MCP setelah mengubah endpoint atau konfigurasi. Menjalankan
`mcp` tanpa attach/connect tidak menjamin memakai dokumen yang sedang terlihat.

## Alur agent

1. Selesaikan tujuan pekerjaan melalui `design_brief`; inspeksi read-only boleh
   dilakukan lebih dulu untuk menemukan target. Pilihan visual rutin ditangani agent.
2. Muat `design_guidance` sesuai tahap, lalu `craft_prepare` untuk sesi native.
3. Gunakan skema tool yang dikembalikan. Mutasi Craft melalui `bridge_call`
   memerlukan `briefId` yang sudah terselesaikan.
4. Verifikasi dokumen dan hasil native. Periksa ulang jika pengguna mengganti tab.
   Jangan mengulang mutasi yang timeout sebelum memeriksa apakah sudah diterapkan.

Desain FigCraft, drawing CAD, dan model 3D bisa menjadi hasil akhir masing-masing.
Pembuatan website membutuhkan permintaan website; keberadaan dokumen bukan izin
untuk melanjutkan ke alur lain. Untuk FigCraft ke 3D, baca referensi visual dan
rekonstruksi geometri yang relevan; tidak ada konversi 2D-ke-3D otomatis.

## Jika koneksi atau pemeriksaan gagal

- Tidak terdeteksi: periksa PATH proses AWSM, CLI, lokasi konfigurasi dan status MCP.
- Tidak bisa attach: periksa aplikasi/control channel dan endpoint yang sebenarnya.
- Izin file ditolak: gunakan tujuan yang diizinkan atau akses sempit yang sesuai;
  jangan otomatis mengaktifkan akses ke seluruh filesystem.
- Browser QA: `review_ui` memerlukan aplikasi localhost dan Playwright/Chromium
  di proyek tujuan. Context baru tidak mewarisi login browser pengguna; request
  eksternal dibatasi. Periksa autentikasi/aset yang terblokir sebelum menilai hasil.
- Harness lain: gateway ini memakai stdio lokal, bukan proxy HTTP/SSE. Periksa
  kemampuan harness; konfigurasi berhasil ditulis belum membuktikan tool tersedia.

Referensi teknis native: [FigCraft](https://github.com/storytold/figcraft/blob/main/docs/mcp.md),
[SolidCraft](https://github.com/tangency-labs/solidcraft/blob/main/docs/mcp.md),
[CADCraft](https://github.com/storytold/cadcraft/blob/main/docs/mcp.md).
