# Menghubungkan aplikasi Craft

Pasang aplikasi Craft yang diperlukan, lalu cukup jelaskan pekerjaanmu ke AWSM.
Installer AWSM menyiapkan connector untuk aplikasi yang ditemukan. Saat dipakai,
AWSM memakai dokumen yang sudah terhubung atau membuka Craft yang masih tertutup
dengan sambungan aktif, lalu memuat panduan yang sesuai. Pengguna tidak perlu
memilih port, memasang CLI terpisah, atau memanggil skills.

Connector ditemukan dari PATH, direktori instalasi umum, binary bawaan aplikasi,
atau cache AWSM. Jika belum tersedia, AWSM mengunduh arsip rilis resmi yang sesuai
dengan versi aplikasi yang diketahui dan memverifikasi SHA-256 sebelum memasangnya
di `~/.awsm/native`. Di Windows/Linux, arsip portable desktop dapat dipakai bila
berisi CLI native yang sesuai; dukungan ini bukan klaim sudah diuji di semua OS.
Penemuan connector tetap diikuti inspeksi dokumen melalui API native.

Setup tidak membuka semua Craft sekaligus. Saat koneksi diminta, hanya aplikasi
yang dipilih yang dibuka. Lock lokal bersama mencegah dua harness menyiapkan atau
meluncurkan Craft yang sama bersamaan. `AWSM_NATIVE_SETUP=0` / `setup --skip-native`
tersedia untuk pengelolaan manual; `--skip-native` hanya melewati tahap installer.

Aplikasi yang sudah berjalan tanpa koneksi tidak selalu dapat mengaktifkannya di
tengah sesi. AWSM tidak menutup atau mengganti dokumen itu: agent menawarkan satu
kali sambungkan ulang setelah pekerjaan disimpan/ditutup, kemudian AWSM menangani
peluncuran dan connector. Ini batas API native, bukan tugas pengguna untuk mencari
port atau mengedit konfigurasi. Bagian berikut untuk diagnosis/pengelolaan manual.

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


## MaterialCraft dan TextureCraft

Keduanya memakai aplikasi dengan control channel dan CLI `mcp --bridge PORT`,
bukan `--attach` atau `--connect`. Pasang CLI yang cocok dengan versi aplikasi;
GUI yang terpasang saja tidak berarti CLI sudah tersedia di PATH.
Set `AWSM_MATERIALCRAFT_ENDPOINT` / `AWSM_TEXTURECRAFT_ENDPOINT` bila endpoint tidak
terdeteksi dari proses aplikasi berflag `--control PORT` pada macOS/Linux.
AWSM tidak menebak port default atau membaca token rahasia ke respons; CLI native
menangani autentikasi. Status connected berarti transport MCP tersambung; gunakan
craft_prepare agar inspeksi dokumen native juga diverifikasi.

Semua pintu masuk (`craft_prepare`, `bridge_list` dengan connect, `bridge_call`)
memakai aturan visible yang sama. Untuk mode terpisah yang memang diminta,
konfigurasi bridge dapat menyatakan `"sessionMode":"headless"`. Native headless
file roots tetap perlu diatur sesuai provider. Mode sesi yang sudah terhubung tidak
diganti diam-diam; restart MCP untuk berpindah mode. Wrapper/custom CLI atau opsi
file roots memerlukan konfigurasi bridge eksplisit; AWSM tidak membuang opsi tersebut.

`craft_prepare` melaporkan diagnostik CLI/aplikasi macOS jika bisa diperiksa, tanpa
menginstal/meng-upgrade atau membuka ulang aplikasi. Ketidakcocokan versi adalah
peringatan kemampuan; skema tool provider yang tersambung tetap diperiksa.

Pada sesi attached, hasil edit muncul di dokumen aplikasi tersebut. Presence,
sorotan layer, selection, dan pointer bergantung pada kemampuan aplikasi native.
AWSM tidak membuat cursor palsu atau menggerakkan mouse untuk setiap command.
Material graph memakai panduan `awsm-materials`, sedangkan painting/baking memakai
`awsm-texturing`. Panduan dimuat otomatis pada persiapan dan sekali pada hasil
bridge per brief/provider. Original content, image dan error native dipertahankan.

Referensi provider: [MaterialCraft](https://github.com/storytold/materialcraft/blob/main/docs/control-protocol.md),
[TextureCraft](https://github.com/storytold/texturecraft/blob/main/docs/control-protocol.md).
