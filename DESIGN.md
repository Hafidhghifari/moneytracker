# Moneyhist UI Baseline

Dokumen ini menetapkan baseline antarmuka Moneyhist, aplikasi web pencatat keuangan pribadi untuk mahasiswa. Screenshot dashboard yang diberikan menjadi referensi suasana visual: ringan, lapang, lembut, dan mudah dipindai. Nama, logo, maskot, teks, susunan persis, dan elemen merek dari gambar tidak digunakan.

## Arah visual

- **Karakter:** bersih, ramah, tenang, dan praktis. Keuangan harus terasa mudah dipahami, bukan seperti terminal akuntansi.
- **Tema awal:** light. Gunakan latar biru-abu pucat, permukaan putih, teks gelap, dan aksen biru yang tenang. Hijau hanya dipakai seperlunya untuk menandai pemasukan atau hasil positif.
- **Kepadatan:** rendah sampai sedang. Prioritaskan saldo, ringkasan, dan transaksi terbaru; hindari dashboard yang penuh widget.
- **Prinsip:** hierarki jelas, angka mudah dibandingkan, warna status konsisten, dan tidak mengandalkan warna saja untuk menyampaikan arti.

## Struktur dashboard

```text
┌──────────┬──────────────────────────────────────────────────────────┐
│ Sidebar  │ Topbar: lokasi halaman, rentang waktu, profil             │
│          ├──────────────────────────────────────────────────────────┤
│          │ Sapaan + ringkasan saldo       │ Aktivitas/pengingat      │
│          ├──────────────────────────────────────────────────────────┤
│          │ Saldo             Pemasukan           Pengeluaran         │
│          ├──────────────────────────────────────────────────────────┤
│          │ Transaksi terbaru               │ Tindakan cepat opsional │
└──────────┴──────────────────────────────────────────────────────────┘
```

- Area konten terpusat dengan lebar maksimum sekitar **1440 px** dan padding horizontal **32 px** pada desktop.
- Grid utama 12 kolom: konten utama 8 kolom dan rail samping 4 kolom bila ada informasi yang benar-benar berguna. Dashboard tidak harus mengisi semua ruang.
- Alur vertikal: header halaman, hero ringkas, metrik, lalu transaksi terbaru. Tabel penuh dan filter lanjutan ditempatkan di halaman riwayat.
- Jarak antarseksi **24–32 px**; hindari beberapa panel besar bertumpuk dengan kepadatan yang sama.

## Spacing, ukuran, dan bentuk

Gunakan skala dasar 4 px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

| Elemen | Baseline |
|---|---:|
| Tinggi topbar | 64 px |
| Lebar sidebar desktop | 76 px ikon saja atau 232 px berlabel; pilih satu mode konsisten |
| Padding kartu | 20–24 px |
| Jarak grid kartu | 16–20 px |
| Tinggi kontrol input/tombol | 40–44 px |
| Radius input dan tombol | 10 px |
| Radius kartu dan panel | 16 px |
| Radius chip/status | 999 px |

Gunakan satu keluarga radius: kontrol 10 px, panel 16 px, chip pill. Bayangan sangat tipis dan bernuansa biru-abu; gunakan border untuk pemisahan utama, bukan bayangan tebal.

## Tipografi

- Gunakan **Geist Sans** yang sudah tersedia melalui `next/font` di project. Jangan menambah font eksternal tanpa kebutuhan produk yang jelas.
- Teks isi 14–16 px, line-height 1.45–1.6. Label sekunder minimum 12 px dan jangan gunakan warna terlalu pucat.
- Judul halaman 24–30 px, semibold. Sapaan/heading hero 28–36 px, medium sampai semibold.
- Angka saldo 32–40 px, medium, dengan angka tabular (`font-variant-numeric: tabular-nums`). Nilai pada kartu metrik 22–28 px.
- Gunakan kapitalisasi kalimat untuk label. Hindari huruf kapital penuh, terlalu banyak bobot tebal, dan teks abu-abu kecil untuk informasi penting.
- Format uang dalam Rupiah dengan pemisah ribuan lokal (`id-ID`), misalnya `Rp 2.450.000`. Tampilkan tanda `+`/`−` secara konsisten bila membantu membedakan pemasukan dan pengeluaran.

## Palet warna

Nilai berikut adalah token awal. Pertahankan rasio kontras WCAG AA untuk teks dan kontrol.

| Token | Nilai | Penggunaan |
|---|---|---|
| `--background` | `#F3F6FA` | Latar utama |
| `--surface` | `#FFFFFF` | Kartu, menu, dialog |
| `--surface-muted` | `#EAF0F6` | Hover lembut, area input |
| `--foreground` | `#17212B` | Teks utama |
| `--muted-foreground` | `#667482` | Keterangan sekunder |
| `--border` | `#DFE6ED` | Garis batas dan divider |
| `--primary` | `#4C78B8` | Tombol utama, fokus, tautan aktif |
| `--primary-foreground` | `#FFFFFF` | Teks di atas warna utama |
| `--income` | `#2F8A68` | Pemasukan dan keadaan positif; gunakan terbatas pada label/indikator |
| `--expense` | `#B84B55` | Pengeluaran dan kesalahan |
| `--warning` | `#A66A16` | Peringatan yang memerlukan perhatian |
| `--info` | `#3C6F9C` | Informasi netral |

Warna pemasukan/pengeluaran adalah warna semantik, bukan aksen dekoratif. Hijau bukan warna utama aplikasi: jangan gunakan untuk latar besar, sidebar, hero, atau semua tombol. Sertakan label, ikon, atau tanda `+`/`−` agar makna tetap terbaca tanpa warna. Jangan memberi warna berbeda pada setiap kartu metrik hanya demi variasi.

Contoh peta ke CSS: definisikan token pada `:root` di `app/globals.css`, lalu petakan token yang digunakan Tailwind lewat `@theme inline` bila utility class dibutuhkan. Tema gelap dapat ditambahkan kemudian melalui pasangan token semantik yang sama, bukan mengganti warna per komponen.

## Halaman login dan register

Halaman autentikasi memakai bahasa visual dashboard yang sama, tetapi dengan komposisi lebih fokus dan minim gangguan. Pertahankan latar biru-abu pucat, bidang form putih, radius lembut, border tipis, dan aksen biru. Jangan memakai bidang hijau besar atau gradien hijau.

### Penempatan maskot kucing keberuntungan

- Tampilkan maskot kucing keberuntungan sebagai satu lapisan dekoratif yang mengambang di atas halaman aplikasi, bukan di dalam baris logo, form, atau kartu dashboard.
- Gunakan GIF transparan pada ukuran **64–96 px**, pertahankan rasio intrinsik, dan jangan beri latar kartu tersendiri. Maskot bergerak terus dengan kecepatan tetap; pantulkan komponen arah horizontal atau vertikal saat menyentuh tepi viewport, dan pantulkan keduanya saat menyentuh sudut. Jangan berhenti atau berpindah posisi secara mendadak.
- Maskot tidak menangkap klik atau fokus. Pada `prefers-reduced-motion`, tampilkan PNG statis di sudut kanan bawah dan jangan jalankan gerakan.
- Perlakukan maskot sebagai dekorasi dan sembunyikan dari pohon aksesibilitas; nama Moneyhist tetap disediakan oleh logo.
- Gunakan satu maskot yang sama di halaman login, register, dan dashboard.

- Letakkan logo/nama Moneyhist di bagian atas kartu atau kolom form dengan ruang lega. Gunakan logo produk sendiri bila tersedia; jangan mengambil logo atau maskot dari gambar referensi.
- Pada desktop, gunakan susunan dua kolom: sisi form yang cukup lebar dan panel visual biru pucat di sampingnya. Form tetap menjadi fokus. Hindari dekorasi atau teks promosi yang berlebihan.
- Pada layar kecil, hilangkan area pendamping dan tampilkan form satu kolom dengan padding 20–24 px. Konten harus muat tanpa scroll horizontal.
- Login berisi judul singkat, penjelasan opsional, field email dan password, kontrol tampil/sembunyikan password bila disediakan, tombol utama **Masuk**, lalu tautan ke register.
- Register berisi nama, email, dan password sesuai SRS, tombol utama **Buat akun**, lalu tautan ke login. Jangan menambahkan field atau pilihan autentikasi yang belum didukung sistem.
- Input memiliki label persisten, placeholder berupa contoh format bila perlu, tinggi 44–48 px, latar putih, border `--border`, dan fokus `--primary` yang jelas. Validasi diletakkan dekat field terkait.
- Tombol submit menggunakan biru `--primary` dengan teks putih. Hijau tidak digunakan untuk tombol utama. Tautan sekunder memakai biru yang cukup kontras.
- Kesalahan login/register harus spesifik dan mudah ditindaklanjuti tanpa membocorkan apakah kredensial sensitif tertentu terdaftar. Pertahankan isi field aman (misalnya email) ketika validasi gagal.
- Saat submit, cegah pengiriman ganda dan tampilkan status proses pada tombol. Setelah berhasil, berikan konfirmasi atau arahkan ke halaman sesuai alur autentikasi.
- Pastikan alur keyboard, fokus terlihat, label terkait dengan input, dan pesan status diumumkan dengan semantik yang sesuai.

## Sidebar dan topbar

### Sidebar

- Navigasi inti mengikuti kebutuhan produk: **Dashboard**, **Transaksi**, dan **Pengaturan**. Logout berada di area profil atau bagian bawah, bukan dicampur dengan navigasi utama.
- Item navigasi memiliki target klik minimum 40 × 40 px, ikon dari satu pustaka yang dipilih project, dan label yang jelas. State aktif memakai latar aksen lembut dan teks/ikon aksen; jangan hanya menandai dengan perubahan warna samar.
- Pada desktop, sidebar boleh tetap terlihat saat konten bergulir. Pada layar sempit, ubah menjadi drawer yang dapat dibuka dengan tombol menu atau navigasi bawah yang ringkas, bukan sidebar mini yang sulit disentuh.

### Topbar

- Tampilkan judul atau breadcrumb halaman di kiri. Aksi global yang relevan, seperti avatar/menu akun, berada di kanan.
- Hindari kolom pencarian, kalender, atau lonceng notifikasi permanen sampai ada fitur yang benar-benar membutuhkannya.
- Buat topbar setinggi sekitar 64 px dengan divider halus. Menu akun menyediakan identitas pengguna dan aksi logout.

## Hero dashboard

- Hero menyapa pengguna dengan nama yang tersedia dan memberi konteks singkat. Tidak perlu meniru maskot atau ilustrasi pada referensi.
- Fokus utama adalah **saldo** dan rentang waktu/arti nilai yang jelas. Saldo dihitung `total pemasukan - total pengeluaran` sesuai SRS.
- Sediakan satu aksi utama yang nyata, misalnya **Tambah transaksi**. Hindari tombol sekunder yang mengarah ke fitur belum tersedia.
- Bila menampilkan tanggal atau periode, gunakan format lokal Indonesia dan jelaskan periode agregasi. Jangan menyiratkan saldo atau proyeksi yang tidak didukung data.
- Ilustrasi bersifat opsional dan tidak boleh menurunkan keterbacaan angka.

## Notifikasi dan pesan aktivitas

- Kebutuhan inti SRS belum menetapkan pusat notifikasi. Karena itu, gunakan notifikasi sebagai pola umpan balik kontekstual (berhasil tambah, gagal simpan, sesi berakhir), bukan panel feed berisi aktivitas rekaan.
- Pesan sukses/error tampil dekat tindakan terkait atau sebagai toast yang dapat ditutup. Toast tidak menjadi satu-satunya tempat untuk pesan validasi penting.
- Toast memiliki ikon/teks yang menjelaskan keadaan, kontras cukup, dan durasi yang memberi waktu untuk dibaca. Kesalahan yang memerlukan tindakan tetap tampil sampai diperbaiki atau ditutup pengguna.
- Jika pusat notifikasi kelak ditambahkan, hanya tampilkan item yang bersumber dari kejadian produk nyata dan sediakan keadaan kosong.

## Kartu metrik

Tampilkan tiga ringkasan yang diwajibkan: **Saldo**, **Total pemasukan**, dan **Total pengeluaran**. Gunakan tiga kolom pada desktop lebar; pada tablet dapat menjadi dua kolom, dan pada ponsel satu kolom atau susunan saldo utama disusul dua metrik.

- Saldo paling menonjol secara tipografi, bukan karena panel paling berwarna.
- Pemasukan memakai penanda positif; pengeluaran memakai penanda negatif. Nilai selalu disertai label dan periode yang sama atau dinyatakan jelas.
- Jangan menciptakan persentase perubahan, grafik, target, atau metrik lain tanpa data historis dan rumus yang benar.
- Setiap kartu menggunakan permukaan putih, border lembut, padding konsisten, serta teks label dan nilai yang mudah dipindai.

## Transaksi terbaru

- Baris transaksi menampilkan deskripsi, tanggal, kategori/jenis jika tersedia, dan nominal.
- Pemasukan dan pengeluaran dibedakan dengan label serta tanda nominal; angka rata kanan dan menggunakan angka tabular.
- Batas awal dashboard adalah beberapa transaksi terbaru (misalnya 5), dengan tautan menuju riwayat lengkap.
- Aksi hapus harus memiliki label yang dapat dipahami, konfirmasi bila penghapusan sulit dibatalkan, dan feedback setelah selesai.
- Filter Semua, Pemasukan, Pengeluaran terutama milik halaman riwayat. Filter pada dashboard hanya ditambah bila alur nyata membutuhkannya.

## Aturan komponen

- **Tombol:** satu gaya primary per area aksi; secondary untuk aksi pendamping; destructive untuk penghapusan. Label berupa kata kerja jelas. State hover, active, focus-visible, dan disabled harus tersedia.
- **Input:** label tetap terlihat di luar placeholder, teks bantuan untuk format nominal, validasi dekat field, dan outline fokus yang jelas.
- **Card/panel:** gunakan untuk mengelompokkan informasi yang memang memiliki hubungan. Jangan membungkus setiap baris atau label ke dalam kartu tersendiri.
- **Ikon:** pilih satu pustaka ikon dan satu gaya stroke/ukuran untuk seluruh produk. Ikon dekoratif disembunyikan dari pembaca layar; ikon aksi diberi nama aksesibel.
- **Dialog/drawer:** fokus tetap berada di dalam saat terbuka, dapat ditutup dengan Escape jika aman, dan mengembalikan fokus ke pemicu.
- **Navigasi dan aksi:** gunakan elemen link untuk berpindah halaman dan button untuk melakukan aksi. Pastikan seluruh kontrol dapat digunakan dengan keyboard.
- **Aksesibilitas:** target sentuh sekitar 44 × 44 px, jangan mengandalkan hover, sediakan `:focus-visible`, semantik heading berurutan, dan `aria-live` untuk feedback asinkron.

## Responsif

- **≥ 1200 px:** sidebar desktop, hero dengan ruang lapang, tiga metrik sejajar, transaksi dan panel pendamping berbagi grid bila diperlukan.
- **768–1199 px:** sidebar dapat diringkas atau menjadi drawer; tiga metrik boleh membungkus menjadi 2 + 1; hilangkan panel samping yang tidak penting.
- **< 768 px:** satu kolom dengan padding 16 px; topbar ringkas; sidebar menjadi drawer/navigasi bawah; hero menumpuk; metrik satu kolom atau saldo utama plus dua ringkasan kompak; transaksi menjadi baris yang membungkus, bukan tabel horizontal yang memaksa scroll.
- Pada layar kecil, nominal tidak boleh terpotong. Deskripsi panjang boleh dua baris, tanggal dapat menjadi metadata sekunder.
- Gunakan tinggi berbasis konten dan `min-height: 100dvh` untuk shell layar penuh agar viewport mobile stabil.

## State yang harus dirancang

- **Loading:** skeleton mengikuti bentuk hero, metrik, dan daftar transaksi. Pertahankan dimensi akhir agar layout tidak meloncat.
- **Kosong:** jelaskan bahwa belum ada transaksi dan berikan CTA tambah transaksi. Angka ringkasan kosong tetap konsisten dan tidak membuat keadaan seolah error.
- **Error:** jelaskan apa yang gagal dan langkah berikutnya. Pertahankan filter/input pengguna bila memungkinkan; sediakan coba lagi untuk kegagalan jaringan.
- **Validasi:** tandai field yang bermasalah, beri deskripsi teks, dan jangan hanya mengandalkan border merah.
- **Success:** konfirmasi transaksi tersimpan dan perbarui ringkasan/daftar tanpa menghilangkan konteks halaman.
- **Disabled/submitting:** cegah submit ganda dan tampilkan progres pada kontrol yang sedang bekerja.
- **Focus/hover/active:** setiap kontrol interaktif memiliki state jelas dengan preferensi gerak yang tidak mengganggu.
- **Session berakhir:** jelaskan bahwa pengguna perlu masuk kembali; jangan tampilkan konten privat seolah masih aktif.

## Catatan implementasi

- Stack saat ini adalah Next.js App Router, React, TypeScript, Tailwind CSS v4, dan `next/font` Geist. Baseline ini tidak mewajibkan pustaka komponen baru.
- Simpan token global di `app/globals.css`; buat komponen kecil dan dapat digunakan ulang untuk `DashboardShell`, `Sidebar`, `Topbar`, `SummaryCard`, `TransactionList`, dan feedback form/toast.
- Pertahankan halaman dan komponen statis sebagai Server Components. Tambahkan `'use client'` hanya pada interaksi yang membutuhkannya, seperti drawer, form, filter, atau toast.
- Format mata uang dan tanggal melalui `Intl.NumberFormat('id-ID', ...)` serta `Intl.DateTimeFormat('id-ID', ...)`, bukan string yang dirakit manual.
- Data ringkasan harus berasal dari transaksi pengguna yang sedang login. Saldo, pemasukan, dan pengeluaran mengikuti rumus/domain SRS; jangan mengisi UI final dengan angka contoh yang menyerupai data nyata.
- Pastikan halaman transaksi dan komponen dashboard menampilkan filter/aksi hanya sesuai fitur yang tersedia. Semua perubahan dan penghapusan harus mengikuti kepemilikan data per pengguna.
- Hindari animasi dekoratif selain gerak maskot yang ditetapkan di atas. Gunakan transisi singkat untuk hover, drawer, atau feedback; patuhi `prefers-reduced-motion`.
- Metadata, bahasa dokumen (`lang="id"`), judul halaman, dan teks antarmuka harus memakai identitas Moneyhist, bukan starter template.

## Di luar baseline

Grafik analitik, notifikasi real-time, kategori kompleks, anggaran, ekspor, sinkronisasi bank, serta tema gelap bukan kebutuhan dalam SRS saat ini. Tambahkan hanya ketika requirement produk mendukungnya.
