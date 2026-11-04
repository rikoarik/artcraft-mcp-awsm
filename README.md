# AWSM

**Satu MCP untuk desain, 3D, dan implementasi website—sesuai yang kamu minta.**

AWSM menghubungkan coding agent dengan **FigCraft** untuk desain editable,
**SolidCraft** untuk model 3D, dan **CADCraft** untuk gambar teknik 2D.
Tersedia juga panduan desain, pencarian aset, font, ikon, dan pemeriksaan UI.
Berjalan lokal, tanpa VPS.

Cukup jelaskan produk dan hasil yang diinginkan. Agent menangani riset referensi,
warna, font, ikon, aset, serta motion yang relevan. Pertanyaan hanya untuk hal
penting yang belum jelas, seperti fungsi produk atau dokumen tujuan.

**Desain saja tetap desain. 3D saja tetap 3D. Website dibuat ketika diminta.**

## Pasang AWSM

Butuh Node.js 18+ dan `npx`; disarankan Node LTS yang masih didukung.
Aplikasi Craft dipasang terpisah, hanya yang diperlukan untuk pekerjaanmu.

Jalankan dari folder proyek; ganti `codex` sesuai tabel harness di bawah:

```bash
npx -y github:rikoarik/artcraft-mcp-awsm setup \
  --client codex --source github:rikoarik/artcraft-mcp-awsm
```

Restart atau reconnect MCP di agent, lalu periksa koneksi **awsm**.
Installer memasang skill inti; panduan spesialis dimuat sesuai kebutuhan.
Paket dipasang dari GitHub, bukan paket npm bernama `my-awsm-mcp`.

### Prompt pemasangan per harness

Salin prompt yang sesuai ke agent yang bisa menjalankan perintah lokal.

| Harness | Prompt |
| --- | --- |
| Codex | Pasang AWSM MCP dari `github:rikoarik/artcraft-mcp-awsm` untuk Codex di proyek ini. Gunakan installer `setup --client codex --source github:rikoarik/artcraft-mcp-awsm`. Pertahankan konfigurasi lain dan periksa koneksinya. |
| Claude Code | Pasang AWSM MCP dari `github:rikoarik/artcraft-mcp-awsm` untuk Claude Code di proyek ini. Gunakan installer `setup --client claude --source github:rikoarik/artcraft-mcp-awsm`. Pertahankan konfigurasi lain dan periksa koneksinya. |
| OpenCode | Pasang AWSM MCP dari `github:rikoarik/artcraft-mcp-awsm` untuk OpenCode di proyek ini. Gunakan installer `setup --client opencode --source github:rikoarik/artcraft-mcp-awsm`. Pertahankan konfigurasi lain dan periksa koneksinya. |
| Antigravity | Pasang AWSM MCP dari `github:rikoarik/artcraft-mcp-awsm` untuk Antigravity di proyek ini. Gunakan installer `setup --client antigravity --source github:rikoarik/artcraft-mcp-awsm`. Pertahankan konfigurasi lain dan periksa koneksinya. |
| GitHub Copilot CLI | Pasang AWSM MCP dari `github:rikoarik/artcraft-mcp-awsm` untuk Copilot CLI di proyek ini. Gunakan installer `setup --client copilot --source github:rikoarik/artcraft-mcp-awsm`. Pertahankan konfigurasi lain dan periksa koneksinya. |
| Zed | Pasang AWSM MCP dari `github:rikoarik/artcraft-mcp-awsm` untuk Zed. Gunakan installer `setup --client zed --global --source github:rikoarik/artcraft-mcp-awsm` karena konfigurasi MCP Zed berada di tingkat pengguna. Pertahankan konfigurasi lain dan periksa koneksinya. |

**Prompt pemasangan semua harness yang didukung:**

```text
Pasang AWSM MCP dari github:rikoarik/artcraft-mcp-awsm untuk seluruh
harness yang didukung installer. Jalankan setup --client all dengan
--source github:rikoarik/artcraft-mcp-awsm dari folder proyek ini.
Tangani koneksi Zed secara terpisah dengan --client zed --global.
Pertahankan konfigurasi MCP dan skill yang sudah ada. Jika ada entri
AWSM lama, gunakan --upgrade-config hanya untuk entri milik AWSM.
Periksa koneksi pada harness yang tersedia dan laporkan yang belum
bisa diverifikasi. Jangan menganggap konfigurasi tertulis berarti
koneksi sudah berhasil. Jelaskan jika harness perlu direstart.
```

Enam harness di atas memiliki dukungan installer. Untuk harness lain, pastikan
mendukung **MCP lokal melalui stdio** dan ikuti konfigurasi native harness tersebut.
**ChatGPT bukan target installer ini**; pemasangan di Codex tidak otomatis
menghubungkan AWSM ke aplikasi ChatGPT. Dukungan installer juga tidak menjamin
kecepatan atau perilaku identik di semua model. [Hasil uji harness](docs/HARNESS-QA.md).

## Contoh prompt penggunaan

Ganti produk dan nama dokumen/folder sesuai kebutuhan. Tidak perlu menyebut nama
skill atau memilih font, warna, dan ikon satu per satu.

### FigCraft saja

```text
Gunakan AWSM untuk mendesain dashboard pengelolaan invoice di dokumen
FigCraft yang sedang terbuka. Buat alur daftar, detail, dan edit
beserta komponen serta state pentingnya. Cari referensi yang relevan,
tentukan arah visualnya, lalu periksa hasil render. Kerjakan sebagai
desain editable di FigCraft saja, tanpa membuat website.
```

### FigCraft → 3D

```text
Gunakan gambar konsep speaker di dokumen FigCraft yang sedang terbuka
sebagai referensi untuk membuat model 3D editable di SolidCraft.
Periksa bentuk, proporsi, material, dan detailnya. Bedakan ukuran yang
terlihat di referensi dengan perkiraan; tanyakan jika ukuran fungsional
penting belum tersedia. Simpan model ke folder proyek yang saya tunjuk
dan tampilkan preview. Hasil akhirnya model 3D, tanpa membuat website.
```

Ini rekonstruksi berdasarkan referensi, bukan konversi otomatis layer 2D menjadi
geometri 3D. Desain UI tidak otomatis memiliki bentuk 3D yang bisa dikonversi.

### FigCraft → website

```text
Gunakan AWSM untuk mengimplementasikan desain FigCraft yang sedang
terbuka menjadi website di folder proyek ini. Pertahankan identitas
visualnya, gunakan komponen dan teknologi proyek yang sudah ada,
dan ekspor hanya aset yang diperlukan. Buat teks serta kontrol
sebagai UI sungguhan. Pastikan responsif dan periksa alur utamanya.
```

### FigCraft + 3D → website

```text
Gunakan desain landing page di FigCraft dan model produk yang sedang
terbuka di SolidCraft untuk membuat website di folder proyek ini.
Integrasikan model sebagai 3D interaktif dengan motion scroll yang
menjelaskan produk. Riset referensi dan susun transisi tiap bagian;
gunakan React Bits hanya jika cocok dengan desain dan stack proyek.
Sediakan tampilan mobile, poster saat loading/gagal, serta reduced
motion. Implementasikan di website sebenarnya dan periksa hasilnya.
```

Belum punya model? Tambahkan: “Buat modelnya di SolidCraft dari referensi produk
terlebih dahulu.” Preview 3D di FigCraft berupa **gambar 2D**; model editable tetap
di SolidCraft. Ekspor OBJ/PNG perlu integrasi web dan pemeriksaan material/performa.

## Menggunakan dokumen yang terbuka

CLI Craft harus tersedia di `PATH`, dan aplikasi harus menyediakan koneksi kontrol.
AWSM memprioritaskan sesi yang bisa diverifikasi; koneksi aplikasi gagal tidak
boleh diam-diam diganti dokumen headless. Jangan menutup pekerjaan yang belum disimpan.
Lihat [panduan koneksi](docs/CRAFT-CONNECTIONS.md) jika sesi belum ditemukan.

Untuk memperbarui instalasi, ulangi perintah pemasangan dengan `--upgrade-config`,
lalu restart MCP. Pembaruan tidak masuk ke sesi yang masih berjalan.

## Pengembangan

```bash
npm ci
npm test
```

Pengujian otomatis tidak menggantikan inspeksi visual atau pengujian di setiap
harness. [Catatan skill dan pengujian](docs/SKILL-REVIEW-FIXES.md) ·
[Laporkan masalah](https://github.com/rikoarik/artcraft-mcp-awsm/issues) · [Lisensi MIT](LICENSE)
