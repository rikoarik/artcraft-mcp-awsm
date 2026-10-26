# my-awsm-mcp

MCP server untuk mencari ikon/foto, membuat SVG sederhana, memilih palet warna, dan preview prototipe web. Paket ini juga berisi **5 skill OpenCode** yang memandu agent mengubah prompt menjadi prototype responsive dengan motion dan QA.

> Status: kode siap diuji lokal, **belum dipublikasi di npm**. Instruksi `npx` dari npm di bawah berlaku setelah paket dipublish. Server ini bukan image-generation AI dan belum terintegrasi langsung dengan kanvas FigCraft/Figma.

## Instalasi

Prasyarat: Node.js 18+, npm, OpenCode V2 untuk pemasangan skill otomatis. Dari checkout ini:

```sh
npm install
npm test
node build/index.js setup                 # pasang untuk project aktif
# atau: node build/index.js setup --global # pasang untuk semua project OpenCode
```

Sesudah rilis npm, pengguna cukup:

```sh
npx -y my-awsm-mcp@latest setup --global
opencode mcp list
```

Installer menambahkan `mcp.servers.awsm` ke `opencode.json`, menyalin skill ke direktori `skills/`, dan menjaga config JSONC berkomentar. Skill existing tidak ditimpa; server bernama `awsm` dengan config berbeda juga tidak ditimpa. OpenCode V2 otomatis memuat ulang config. Untuk pemasangan dari GitHub setelah repo terbit:

```sh
npx -y github:OWNER/my-awsm-mcp setup --global --source github:OWNER/my-awsm-mcp
```

Tanpa `--source`, konfigurasi koneksi akan memakai paket npm `my-awsm-mcp` — belum bisa dipakai sebelum dipublish. Instalasi lokal developer dari checkout menuliskan command yang sama, bukan otomatis menghubungkan file lokal; untuk mencoba tanpa npm, gunakan konfigurasi manual di bawah.

### Konfigurasi manual OpenCode V2

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "awsm": {
        "type": "local",
        "command": ["npx", "-y", "my-awsm-mcp@latest"],
        "environment": {
          "PEXELS_API_KEY": "{env:PEXELS_API_KEY}",
          "UNSPLASH_ACCESS_KEY": "{env:UNSPLASH_ACCESS_KEY}"
        }
      }
    }
  }
}
```

Hapus `environment` jika tidak memakai Pexels/Unsplash. Untuk mencoba checkout lokal, ganti `command` menjadi `["node", "/path/absolut/my-awsm-mcp/build/index.js"]`. Jangan simpan API key langsung di config. OpenCode V2 default mengelompokkan MCP tools di Code Mode; nama efektifnya `awsm_find_icons`, dst.

MCP stdio portabel ke client lain yang mendukung stdio, tetapi **setup otomatis dan skill discovery saat ini khusus OpenCode**. Untuk client lain, konfigurasi command MCP dan skill menurut dokumentasi client tersebut; API provider/model bukan ditangani paket ini.

## Kemampuan nyata

| MCP tool | Fungsi |
| --- | --- |
| `find_icons` | Cari ikon dari Iconify; pilih satu keluarga yang konsisten. |
| `get_icon` | Ambil markup SVG ikon pilihan. |
| `find_images` | Cari foto Openverse (tanpa key), Pexels/Unsplash (butuh API key), atau Picsum (foto placeholder acak, bukan hasil relevan). |
| `download_asset` | Unduh raster image ke folder lokal, maksimum 10 MB; menolak SVG eksternal dan file dengan nama sama. |
| `make_asset` | Buat SVG template berbasis teks: OG card, banner, monogram, placeholder. **Bukan generator gambar AI**. |
| `palette` | Hasilkan alternatif warna dan CSS variables dari satu hex. |
| `serve` | Preview file statis lewat localhost (`127.0.0.1`), selama server MCP aktif. Bukan deployment. |

Foto dari Openverse tetap perlu dicek lisensi dan kewajiban atribusinya; filter `commercial` tidak berarti bebas kredit. Iconify punya lisensi per keluarga ikon. Pencarian memerlukan koneksi internet.

### 5 skill yang terpasang

- `awsm-assets` — ambil keyword dari prompt, temukan dan simpan ikon/foto relevan beserta lisensi.
- `awsm-asset-lab` — buat grafis SVG teks dan palet ketika perlu aset sederhana orisinal.
- `awsm-prompt-to-prototype` — orkestrasi brief → peta layar → aset → implementasi → preview.
- `awsm-auto-prototype` — interaksi dan motion aksesibel, sesuai stack project.
- `awsm-prototype-qa` — cek viewport, browser console, reduced motion, navigasi, lisensi.

Skill adalah panduan agent, bukan proses yang menghasilkan prototype tanpa agent coding. Ubah skill per project di `.opencode/skills/<id>/SKILL.md`, atau global di `~/.config/opencode/skills/<id>/SKILL.md`. Installer men-skip skill yang sudah ada agar custom user aman; `--force-skills` menimpa skill sehingga gunakan dengan hati-hati. OpenCode memakai path sebagai ID, dan project skill bisa mengoverride global skill.

## Pengembangan dan uji

```sh
npm ci
npm test                    # build + setup JSON/JSONC + MCP client/tool + localhost preview
npm audit --audit-level=high
npm pack --dry-run          # cek isi paket sebelum rilis
```

Stdio memakai stdout untuk JSON-RPC; log server ke stderr. Unit smoke test tidak memerlukan API key foto. Tes live jaringan/licensing visual perlu dilakukan terpisah sebelum rilis.

## Publikasi

1. Review versi, nama paket, dan metadata repository sebelum publish.
2. Login npm (`npm login`), cek nama masih tersedia, jalankan `npm publish`.
3. Dari mesin bersih, coba `npx -y my-awsm-mcp@latest setup --global`, lalu `opencode mcp list` dan satu panggilan tool.

Lihat repository GitHub untuk source dan panduan; npm harus dipublish secara terpisah agar instalasi `npx my-awsm-mcp` bekerja.

Lisensi: MIT. Sumber foto/ikon memiliki lisensi masing-masing, terpisah dari lisensi kode paket.
