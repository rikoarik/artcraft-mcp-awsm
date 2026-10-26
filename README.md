# FigCraft MCP AWSM

Toolkit **MCP stdio + 13 skill yang dapat diedit** untuk mencari foto/ikon relevan, membuat SVG sederhana, lalu merancang, membangun, dan menguji prototype web bersama coding agent. Mendukung OpenCode V2, Claude Code, Codex, Google Antigravity CLI, Zed Agent, dan GitHub Copilot CLI. **Paket ini tidak mengendalikan kanvas FigCraft**; untuk desain di aplikasi FigCraft, sambungkan MCP FigCraft tersendiri.

## Lihat penggunaan dan hasilnya

[![Cuplikan walkthrough penggunaan MCP AWSM](demo/awsm-demo.gif)](demo/awsm-demo.mp4)

**[Putar video MP4 lengkap](demo/awsm-demo.mp4)** · [Lihat poster](demo/poster.png) · [Buka SVG yang dihasilkan](demo/example/coffee-card.svg) · [Buka halaman contoh](demo/example/index.html)

Demo menunjukkan panggilan MCP **nyata**: `palette` menghasilkan warna dari `#176F57`, `make_asset` menghasilkan [kartu Kopi Pagi 1200 × 630](demo/example/coffee-card.svg), dan `serve` membuka [halaman HTML contoh](demo/example/index.html) di localhost lalu memverifikasi respons 200. Video adalah walkthrough **berskrip dari hasil panggilan MCP**, bukan rekaman enam agent, bukan generasi website otomatis, dan bukan rekaman kanvas FigCraft. HTML contoh dibuat sebagai integrasi SVG, bukan output `make_asset`.

## Prasyarat dan instalasi

Butuh Node.js **18+**, `npx`, koneksi internet untuk instalasi dari GitHub (dan untuk pencarian foto/ikon), serta coding agent yang bisa menjalankan MCP **stdio lokal**. Jalankan perintah berikut **di direktori proyek tujuan**:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client all --source github:rikoarik/figcraft-mcp-awsm
```

Paket ini **belum dipublikasikan ke npm**. Argumen `--source` membuat konfigurasi MCP yang dihasilkan memakai `npx -y github:rikoarik/figcraft-mcp-awsm` alih-alih nama paket npm yang belum tersedia. Instalasi GitHub menjalankan `prepare` untuk mengompilasi TypeScript. Tinjau perubahan file konfigurasi dan persetujuan/trust yang diminta masing-masing client. `--client all` menulis konfigurasi proyek untuk lima client; untuk **Zed**, MCP ada di pengaturan user-level sehingga perlu langkah `--global` tersendiri (skill proyek tetap dipasang).

### Pilih client dan verifikasi

Ganti `NAMA` dengan nama di tabel; jalankan di root proyek yang akan dipakai agent:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client NAMA --source github:rikoarik/figcraft-mcp-awsm
```

| Client | Konfigurasi MCP proyek | Lokasi skill proyek | Cara mengecek |
| --- | --- | --- | --- |
| **OpenCode V2** (`opencode`) | `.opencode/opencode.json` → `mcp.servers.awsm` | `.opencode/skills/awsm-*/SKILL.md` | Buka ulang project, `/mcps`, pastikan `awsm` terhubung dan 7 tool tampil. |
| **Claude Code** (`claude`) | `.mcp.json` → `mcpServers.awsm` | `.claude/skills/awsm-*/SKILL.md` | Buka Claude di project, setujui server proyek, jalankan `/mcp`. |
| **Codex CLI/IDE** (`codex`) | `.codex/config.toml` → `[mcp_servers.awsm]` | `.agents/skills/awsm-*/SKILL.md` | Percayai project, cek `codex mcp list`, lalu coba panggil `palette`. |
| **Antigravity CLI** (`antigravity`) | `.agents/mcp_config.json` → `mcpServers.awsm` | `.agents/skills/awsm-*/SKILL.md` | Buka workspace dan periksa daftar MCP/tool agent; coba prompt di bawah. |
| **Zed Agent** (`zed`) | User settings, **hanya** saat `--global` | `.agents/skills/awsm-*/SKILL.md` | Settings → AI → MCP Servers, lalu cek tool pada Agent Zed (bukan external agent). |
| **GitHub Copilot CLI** (`copilot`) | `.github/mcp.json` → `mcpServers.awsm` | `.agents/skills/awsm-*/SKILL.md` | Buka repo tepercaya, cek `copilot mcp list` atau `/mcp`, lalu coba `palette`. |

Untuk Zed, jalankan **dua perintah** bila ingin skill hanya di project tetapi MCP tersedia di settings pribadi:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client zed --source github:rikoarik/figcraft-mcp-awsm
npx -y github:rikoarik/figcraft-mcp-awsm setup --client zed --global --skip-skills --source github:rikoarik/figcraft-mcp-awsm
```

Pada macOS settings Zed ada di `~/.zed/settings.json`, pada platform lain di `~/.config/zed/settings.json`. Mode Zed external agent/terminal bisa punya konfigurasi berbeda dari Zed Agent. Periksa dengan UI client, bukan hanya keberadaan file.

### Opsi installer dan kustomisasi skill

- `--client opencode|claude|codex|antigravity|zed|copilot|all` (default `opencode`).
- `--global` memasang MCP dan skill pada lokasi user-level: OpenCode `~/.config/opencode`, Claude `~/.claude.json` + `~/.claude/skills`, Codex `~/.codex/config.toml`, Antigravity `~/.gemini/config/mcp_config.json` + `~/.gemini/antigravity-cli/skills`, Zed settings seperti di atas, Copilot `~/.copilot/mcp-config.json`; skill bersama Codex/Copilot/Zed ada di `~/.agents/skills`. Tinjau konfigurasi global terlebih dahulu, khususnya sebelum `--client all --global`.
- `--skip-mcp` hanya menyalin skill; `--skip-skills` hanya mengatur MCP. `--force-skills` **menimpa folder skill bernama sama**; tanpa flag ini edit lokal di `SKILL.md` dipertahankan.
- `--source github:OWNER/REPO` atau nama paket jika kelak terbit di npm. Jangan pakai `npx my-awsm-mcp` saat ini.

Contoh mengubah workflow: buka `.agents/skills/awsm-taste-ui/SKILL.md` (atau `.opencode/skills/...`, `.claude/skills/...`), lalu tambah token brand, daftar larangan, checklist responsif, serta contoh output sesuai tim. Skill adalah Markdown dengan YAML frontmatter `name`/`description`; simpan ID folder dan nama skill agar mudah dipanggil. Saat upgrade, bandingkan versi upstream secara manual; jangan pakai `--force-skills` jika ingin mempertahankan modifikasi.

Installer menjaga konfigurasi lain dan melaporkan konflik bila entry `awsm` sudah ada dengan command berbeda; konflik **tidak** ditimpa. Ia tidak memigrasikan config lama secara otomatis. Setelah instalasi, restart/reload sesi agent bila skill atau tool belum muncul.

## Tutorial end-to-end: dari brief ke aset dan preview

Berikut alur yang bisa diulang di client mana pun setelah MCP terhubung. Nama tool bisa terlihat sebagai `palette` / `make_asset` atau berawalan `awsm_` sesuai UI client; yang penting adalah server **awsm**. Tool bukan prompt ke model gambar: `make_asset` membuat **template SVG tipografis**, bukan foto atau UI lengkap.

**1. Beri brief yang konkret kepada agent.** Misalnya:

```text
Gunakan awsm-taste-ui dan awsm-assets untuk halaman kedai kopi kecil bernama Kopi Pagi.
Tentukan hierarki visual dan satu palet dari #176F57. Cari foto interior yang relevan
beserta lisensinya, bukan foto acak. Buat kartu sosial judul "Kopi Pagi" dengan
subtitle "Ritual setiap hari". Simpan SVG lokal, buat halaman HTML sederhana yang
memakainya, preview, lalu periksa mobile dan reduced motion lewat awsm-prototype-qa.
Jika foto tidak bisa diverifikasi, gunakan placeholder berlabel; jangan mengarang lisensi.
```

**2. Minta warna dan hasilkan aset.** Agent dapat memanggil tool dengan argumen seperti berikut (objek JSON adalah *argumen tool*, bukan perintah terminal):

```js
palette({ "color": "#176F57", "scheme": "complete" })
make_asset({ "kind": "og-card", "title": "Kopi Pagi", "subtitle": "Ritual setiap hari", "label": "STUDIO KOPI", "colors": ["#122923", "#27614b", "#ddad65"], "dir": "./assets", "filename": "coffee-card.svg" })
```

`palette` memberi `base`, daftar swatch, dan `cssVars`; pilih peran warna berdasarkan kontras nyata, jangan pakai semua swatch. `make_asset` menulis file SVG dan **menolak menimpa file dengan nama sama**. Demo memakai folder sementara dan menyalin hasilnya ke [`demo/example/coffee-card.svg`](demo/example/coffee-card.svg) agar `npm run demo` dapat diulang.

**3. Jika butuh foto/ikon, lakukan pencarian terpisah.** Contoh argumen:

```js
find_images({ "query": "small coffee shop interior natural light", "provider": "openverse", "limit": 5 })
find_icons({ "query": "calendar", "prefix": "lucide", "limit": 5 })
get_icon({ "name": "lucide:calendar-days", "height": 24 })
```

Lihat halaman sumber, lisensi, kreator, atribusi, dan kecocokan crop sebelum memilih. Hasil Openverse difilter untuk penggunaan komersial tetapi **tetap wajib diverifikasi**. `download_asset({ "url": "https://.../photo.jpg", "dir": "./assets", "filename": "interior.jpg" })` menyimpan gambar raster yang dipilih, maksimal 10 MB dan tanpa overwrite; SVG eksternal tidak diterima. Pexels/Unsplash memerlukan `PEXELS_API_KEY`/`UNSPLASH_ACCESS_KEY` pada environment **proses MCP**; `picsum` hanyalah placeholder acak. Jangan tulis API key dalam repo atau percakapan.

**4. Implementasi dan preview.** Agent coding menyusun HTML/CSS/JS sesuai stack proyek, menggunakan aset lokal dan membuat interaksi yang benar-benar bekerja. Untuk folder **statis** dengan `index.html`:

```js
serve({ "root": "./demo/example" })
```

Buka `url` localhost yang dikembalikan. `serve({ "action": "stop" })` menghentikan preview. Server hanya hidup selama proses MCP berjalan dan bukan hosting/deployment; jangan sajikan folder berisi rahasia. Untuk Vite/Next/stack lain, pakai dev server project, bukan `serve` sebagai pengganti bundler. Cek mobile, desktop, keyboard, focus, status loading/error, console, dan `prefers-reduced-motion` sebelum handoff.

**5. Uji hasil yang sudah ada tanpa agent.** Unduh/clone repo, lalu dari root:

```sh
python3 -m http.server 8080 --directory demo/example
```

Buka `http://localhost:8080/`; berhentikan dengan Ctrl-C. Ini contoh halaman yang menampilkan SVG hasil MCP, **bukan** website yang dibuat otomatis oleh server. Untuk demo animasi/hasil panggilan yang sama, putar [MP4](demo/awsm-demo.mp4).

### Peta 13 skill

| Skill | Saat dipakai | Keluaran yang harus diperiksa |
| --- | --- | --- |
| [`awsm-taste-ui`](skills/awsm-taste-ui/SKILL.md) | Arah visual yang spesifik sebelum markup/redesign | Konsep, token, hirarki dan render mobile/desktop. |
| [`awsm-antislop-ui`](skills/awsm-antislop-ui/SKILL.md) | Audit UI yang terasa generik | Masalah → dampak → revisi, perbandingan sebelum/sesudah. |
| [`awsm-ui-ux-best-practices`](skills/awsm-ui-ux-best-practices/SKILL.md) | Alur, form, aksesibilitas, navigasi | Journey, friksi, rekomendasi dan cara verifikasi. |
| [`awsm-design-system`](skills/awsm-design-system/SKILL.md) | Token/komponen lintas banyak layar | Primitive → semantic → component, state dan contoh. |
| [`awsm-assets`](skills/awsm-assets/SKILL.md) | Foto dan ikon relevan | File, slot, sumber, kreator, lisensi/atribusi. |
| [`awsm-asset-lab`](skills/awsm-asset-lab/SKILL.md) | Kartu OG/banner/badge/placeholder | SVG, ukuran, warna, preview dan format target. |
| [`awsm-template-adapter`](skills/awsm-template-adapter/SKILL.md) | Menyesuaikan template berlisensi | Mapping keep/adapt/remove, asal dan QA. |
| [`awsm-prompt-to-prototype`](skills/awsm-prompt-to-prototype/SKILL.md) | Brief → prototype end-to-end | Blueprint journey, implementasi, aset dan hasil QA. |
| [`awsm-auto-prototype`](skills/awsm-auto-prototype/SKILL.md) | Membuat interaksi dan state yang hidup | Kontrol → aksi → feedback, bekerja/simulasi/terblokir. |
| [`awsm-motion-storyboard`](skills/awsm-motion-storyboard/SKILL.md) | Transisi atau microinteraction | Trigger, end state, reduced motion dan bukti. |
| [`awsm-responsive-audit`](skills/awsm-responsive-audit/SKILL.md) | Layout mobile/tablet/desktop bermasalah | Screenshot tiap viewport dan status tes ulang. |
| [`awsm-prototype-qa`](skills/awsm-prototype-qa/SKILL.md) | Sebelum menyerahkan prototype | Matriks journey, temuan terulang dan batas pengujian. |
| [`awsm-figcraft-handoff`](skills/awsm-figcraft-handoff/SKILL.md) | Handoff ke aplikasi FigCraft | Spesifikasi frame, tokens, aset dan gap interaksi. |

Sebut ID skill dalam prompt agar lebih mungkin dimuat oleh agent. Skill adalah **instruksi workflow**, bukan komponen yang otomatis membuat UI tanpa implementasi agent. Semua 13 file dapat disunting, memiliki langkah keputusan, validasi, contoh tugas, dan kriteria handoff; sesuaikan dengan produk serta kebijakan lisensi tim.

## Troubleshooting dan batasan

- **MCP tak terlihat:** pastikan project/konfigurasi yang benar, restart sesi, setujui project/server (Claude/Codex/Copilot), dan uji `npx -y github:rikoarik/figcraft-mcp-awsm` di shell. Perintah ini menjalankan server stdio, bukan halaman web; hentikan dengan Ctrl-C. Baca log stderr client jika gagal start. Di Zed, instal MCP `--global`.
- **Skill tak dimuat:** pastikan `SKILL.md` berada dalam subfolder lokasi client di tabel, valid frontmatter, lalu sebut ID di prompt. `--skip-skills` sengaja tidak menyalin skill.
- **Konflik `awsm` saat setup:** installer menjaga entry existing. Bandingkan konfigurasi manual, backup, lalu perbaiki entry yang salah dengan persetujuan; `--force-skills` hanya memengaruhi skill, **bukan MCP**.
- **Gambar/ikon kosong:** API publik dan jaringan bisa gagal; ubah query, cek key provider dan lisensi. Jangan mengganti pencarian relevan dengan `picsum` tanpa memberi label placeholder.
- **SVG tidak tampak di preview:** cek path relatif terhadap `index.html`, nama file, clipping teks panjang, serta konten folder yang diserve. OG card perlu konversi ke PNG jika platform sosial tidak menerima SVG.
- **Kode prototype atau FigCraft:** tujuh tool AWSM tidak mengedit project, membuat website, menghasilkan foto AI, mengendalikan kanvas FigCraft, atau melakukan deployment. Agent coding mengimplementasikan web; MCP FigCraft terpisah menangani dokumen desain. `serve` hanya server lokal statis.
- **Keamanan:** hanya hubungkan server lokal dari source yang dipercaya; jangan menaruh kredensial di konfigurasi yang di-commit. Tinjau berkas yang dibuat dan lisensi pihak ketiga sebelum publikasi.

## Pengembangan, tes, dan sumber

```sh
npm ci
npm test                     # build + smoke installer, 7 tool MCP, dan preview HTTP
npm audit --audit-level=high
npm pack --dry-run           # pastikan build, README, dan skills terkemas
npm run demo                 # regenerasi MP4, GIF, poster dan contoh SVG/HTML
```

`npm run demo` butuh **macOS Quick Look (`qlmanage`)**, `ffmpeg`, Python 3 + Pillow. Script melakukan panggilan MCP nyata di direktori sementara, merender SVG melalui Quick Look, lalu membuat frame/video; bukan rekaman layar agent. Source repo disertakan, build dihasilkan oleh `prepare` pada Git install. Untuk development lokal, `npm run build` lalu `node build/index.js` memulai server stdio; `node build/index.js setup --client opencode --source github:rikoarik/figcraft-mcp-awsm` tetap memasang *source GitHub* pada konfigurasi client.

Rujukan dokumentasi client: [OpenCode MCP](https://opencode.ai/v2/docs/mcp-servers) dan [skills](https://opencode.ai/v2/docs/skills) · [Claude Code MCP](https://code.claude.com/docs/en/mcp) · [Codex MCP](https://developers.openai.com/codex/mcp) · [Antigravity CLI migrasi MCP/skills](https://antigravity.google/docs/cli/gcli-migration.md) · [Zed MCP](https://zed.dev/docs/ai/mcp) · [Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers). Format skill mengikuti [Agent Skills Specification](https://agentskills.io/specification); [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) digunakan sebagai **referensi struktur saja**. Instruksi skill di paket ini ditulis orisinal; MIT untuk kode repo, sedangkan foto/ikon eksternal tunduk pada lisensi sumber masing-masing.
