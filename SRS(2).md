# 13. Pengembangan Sistem

Pengembangan sistem dilakukan dengan mempertahankan fitur yang sudah tersedia pada Moneyhist dan menambahkan fitur Monthly Budget.

Pengembangan mencakup:

* Penerapan AJAX pada dashboard.
* Penerapan AJAX pada manajemen transaksi.
* Penerapan AJAX pada filter transaksi.
* Penambahan fitur Monthly Budget.
* Pengelolaan budget berdasarkan pengguna.
* Integrasi budget dengan transaksi pengeluaran pengguna.

---

# 14. Functional Requirements Pengembangan

## FR-12 AJAX Dashboard

Sistem harus memastikan proses pada dashboard menggunakan AJAX.

Dashboard tetap menampilkan informasi keuangan pengguna yang sudah tersedia.

Dengan penggunaan AJAX:

1. Sistem mengirim request secara asynchronous.
2. Sistem mengambil data dashboard.
3. Sistem menerima hasil request.
4. Informasi dashboard diperbarui tanpa melakukan reload halaman secara penuh.

Dashboard tetap hanya menampilkan data pengguna yang sedang login.

---

## FR-13 AJAX Manajemen Transaksi

Sistem harus memastikan proses manajemen transaksi menggunakan AJAX.

Proses manajemen transaksi yang dilakukan melalui AJAX meliputi pengelolaan transaksi yang sudah tersedia pada sistem.

Dengan penggunaan AJAX:

1. Pengguna melakukan aksi pada transaksi.
2. Sistem mengirim request secara asynchronous.
3. Sistem memproses request.
4. Sistem mengembalikan hasil proses.
5. Tampilan transaksi diperbarui tanpa melakukan reload halaman secara penuh.

Transaksi tetap hanya dapat dikelola oleh pengguna yang memiliki transaksi tersebut.

---

## FR-14 AJAX Filter Transaksi

Sistem harus memastikan proses filter transaksi menggunakan AJAX.

Filter transaksi yang tersedia:

* Semua
* Pemasukan
* Pengeluaran

Ketika pengguna memilih filter:

1. Sistem mengambil pilihan filter pengguna.
2. Sistem mengirim request menggunakan AJAX.
3. Sistem memproses filter transaksi.
4. Sistem menampilkan hasil filter.
5. Halaman tidak melakukan reload secara penuh.

Hasil filter tetap hanya menampilkan transaksi milik pengguna yang sedang login.

---

# 15. Monthly Budget

## FR-15 Monthly Budget

Sistem harus menyediakan fitur Monthly Budget yang memungkinkan pengguna menentukan dan memantau anggaran pengeluaran berdasarkan bulan.

Monthly Budget digunakan untuk:

* Menentukan anggaran bulanan.
* Melihat anggaran berdasarkan bulan.
* Melihat total pengeluaran berdasarkan bulan.
* Melihat sisa anggaran.
* Memantau penggunaan anggaran.

Data budget hanya dapat diakses dan dikelola oleh pengguna yang membuat budget tersebut.

---

## FR-16 Set Budget

Sistem harus menyediakan fitur Set Budget untuk menentukan anggaran bulanan.

Pengguna dapat menentukan:

* Bulan.
* Tahun.
* Nominal anggaran.

Setelah pengguna menyimpan budget, sistem menyimpan anggaran tersebut untuk pengguna dan bulan yang dipilih.

Pengguna juga dapat mengubah nominal budget yang telah ditentukan.

Budget hanya dapat dibuat dan diubah oleh pengguna yang bersangkutan.

---

## FR-17 Budget Summary

Sistem harus menampilkan Budget Summary berdasarkan bulan yang dipilih pengguna.

Budget Summary minimal menampilkan:

* Anggaran.
* Total pengeluaran.
* Sisa anggaran.

Perhitungan sisa anggaran:

```text
Sisa Anggaran = Anggaran - Total Pengeluaran
```

Total pengeluaran yang digunakan dalam Budget Summary berasal dari transaksi pengeluaran pengguna pada bulan yang dipilih.

Contoh:

```text
Anggaran          Rp2.000.000
Total Pengeluaran Rp1.200.000
Sisa Anggaran       Rp800.000
```

---

## FR-18 Budget Indicator

Sistem harus menyediakan Budget Indicator untuk menampilkan status penggunaan anggaran.

Budget Indicator menunjukkan kondisi penggunaan budget berdasarkan perbandingan antara anggaran dan total pengeluaran.

Persentase penggunaan anggaran dihitung berdasarkan:

```text
Persentase Penggunaan =
(Total Pengeluaran / Anggaran) × 100%
```

Budget Indicator digunakan agar pengguna dapat mengetahui kondisi penggunaan anggaran pada bulan yang dipilih.

---

## FR-19 Monthly Budget Selection

Sistem harus menyediakan fitur untuk memilih dan melihat budget berdasarkan bulan.

Pengguna dapat memilih bulan yang ingin dilihat.

Setelah bulan dipilih, sistem menampilkan informasi budget pada bulan tersebut, meliputi:

* Anggaran.
* Total pengeluaran.
* Sisa anggaran.
* Budget Indicator.

Data yang ditampilkan harus sesuai dengan bulan yang dipilih oleh pengguna.

---

## FR-20 Authorization Monthly Budget

Sistem harus membatasi akses Monthly Budget berdasarkan pengguna yang sedang login.

Aturan:

1. Pengguna hanya dapat melihat budget miliknya sendiri.
2. Pengguna hanya dapat menentukan budget untuk dirinya sendiri.
3. Pengguna hanya dapat mengubah budget miliknya sendiri.
4. Pengguna tidak dapat melihat budget pengguna lain.
5. Pengguna tidak dapat mengubah budget pengguna lain.
6. Data pengeluaran yang digunakan untuk perhitungan budget hanya berasal dari transaksi pengguna yang bersangkutan.

---

## FR-21 Integrasi Budget dengan Transaksi Pengeluaran

Sistem harus menggunakan transaksi pengeluaran pengguna sebagai dasar pemantauan budget.

Total pengeluaran pada budget dihitung dari transaksi dengan jenis:

```text
Pengeluaran
```

yang dimiliki oleh pengguna dan berada pada bulan yang dipilih.

Contoh:

```text
Budget Januari     Rp2.000.000

Pengeluaran:
Makan              Rp500.000
Transport          Rp300.000
Belanja            Rp200.000

Total Pengeluaran  Rp1.000.000

Sisa Budget        Rp1.000.000
```

Budget tidak menggunakan transaksi pengeluaran milik pengguna lain dalam perhitungannya.

---

# 16. Alur Monthly Budget

## 16.1 Alur Set Budget

```text
User
  |
  v
Monthly Budget
  |
  v
Pilih Bulan
  |
  v
Masukkan Anggaran
  |
  v
Simpan Budget
  |
  v
Budget Tersimpan
```

Jika pengguna telah memiliki budget pada bulan tersebut, pengguna dapat mengubah nominal budget.

---

## 16.2 Alur Melihat Budget

```text
User
  |
  v
Monthly Budget
  |
  v
Pilih Bulan
  |
  v
Ambil Budget
  |
  v
Ambil Pengeluaran User
  |
  v
Budget Summary
  |
  +---- Anggaran
  |
  +---- Total Pengeluaran
  |
  +---- Sisa Anggaran
  |
  v
Budget Indicator
```

---

## 16.3 Alur Perhitungan Budget

```text
Anggaran
    +
Transaksi Pengeluaran User
    |
    v
Total Pengeluaran
    |
    v
Anggaran - Total Pengeluaran
    |
    v
Sisa Anggaran
    |
    v
Budget Indicator
```

---

# 17. Acceptance Criteria Pengembangan

Sistem dianggap memenuhi requirement pengembangan apabila:

* [ ] Dashboard menggunakan AJAX.
* [ ] Manajemen transaksi menggunakan AJAX.
* [ ] Filter transaksi menggunakan AJAX.
* [ ] Proses AJAX tidak melakukan reload halaman secara penuh.
* [ ] User dapat membuka fitur Monthly Budget.
* [ ] User dapat menentukan budget bulanan.
* [ ] User dapat mengubah budget bulanan.
* [ ] User dapat memilih bulan untuk melihat budget.
* [ ] Sistem menampilkan budget sesuai bulan yang dipilih.
* [ ] Sistem menampilkan total pengeluaran pada bulan yang dipilih.
* [ ] Sistem menampilkan sisa anggaran.
* [ ] Sistem menampilkan Budget Indicator.
* [ ] Total pengeluaran budget hanya berasal dari transaksi pengeluaran.
* [ ] Total pengeluaran budget hanya berasal dari transaksi milik user yang sedang login.
* [ ] User hanya dapat melihat budget miliknya sendiri.
* [ ] User hanya dapat mengelola budget miliknya sendiri.
* [ ] User tidak dapat mengakses budget pengguna lain.
* [ ] User tidak dapat mengubah budget pengguna lain.

# 18. Pembagian Tugas 4 Orang

Pembagian tugas dilakukan dengan membagi fitur existing dan pengembangan Monthly Budget secara seimbang. Setiap anggota mendapatkan bagian dari sistem existing dan bagian dari fitur baru agar beban pengerjaan relatif merata.

## 18.1 Anggota 1 – Dashboard & Budget Summary

Fokus pada dashboard dan tampilan ringkasan budget.

### Tugas

**Dashboard Existing**

* Memastikan dashboard tetap berjalan.
* Memastikan dashboard menggunakan AJAX.
* Menampilkan nama pengguna.
* Menampilkan total pemasukan.
* Menampilkan total pengeluaran.
* Menampilkan saldo.
* Menampilkan transaksi terbaru.

**Monthly Budget**

* Menampilkan Budget Summary.
* Menampilkan jumlah anggaran.
* Menampilkan total pengeluaran.
* Menampilkan sisa anggaran.
* Menghubungkan Budget Summary dengan data transaksi pengeluaran.
* Memastikan summary berubah sesuai bulan yang dipilih.

### Requirement yang dikerjakan

* FR-06 Dashboard
* FR-12 AJAX Dashboard
* FR-17 Budget Summary
* Bagian tampilan FR-19 Monthly Budget Selection

### Output

* Dashboard AJAX.
* Budget Summary.
* Tampilan informasi anggaran, pengeluaran, dan sisa anggaran.

---

## 18.2 Anggota 2 – Manajemen Transaksi & Integrasi Budget

Fokus pada pengelolaan transaksi dan hubungan transaksi pengeluaran dengan budget.

### Tugas

**Manajemen Transaksi Existing**

* Memastikan proses tambah transaksi menggunakan AJAX.
* Memastikan proses hapus transaksi menggunakan AJAX.
* Memastikan transaksi tetap terhubung dengan user yang sedang login.
* Memastikan transaksi pengguna lain tidak dapat dikelola.

**Monthly Budget**

* Menghubungkan transaksi pengeluaran dengan Monthly Budget.
* Mengambil transaksi pengeluaran berdasarkan user.
* Mengambil transaksi pengeluaran berdasarkan bulan yang dipilih.
* Menghitung total pengeluaran yang digunakan pada budget.
* Memastikan transaksi pengguna lain tidak masuk ke perhitungan budget.

### Requirement yang dikerjakan

* FR-07 Manajemen Transaksi
* FR-13 AJAX Manajemen Transaksi
* FR-20 Authorization Monthly Budget
* FR-21 Integrasi Budget dengan Transaksi Pengeluaran

### Output

* Manajemen transaksi AJAX.
* Data transaksi pengeluaran untuk budget.
* Integrasi transaksi dengan perhitungan budget.
* Authorization transaksi dan data budget yang digunakan.

---

## 18.3 Anggota 3 – Filter Transaksi & Monthly Budget

Fokus pada filter transaksi dan proses pemilihan bulan pada Monthly Budget.

### Tugas

**Filter Transaksi Existing**

* Memastikan filter menggunakan AJAX.
* Memastikan filter Semua berjalan.
* Memastikan filter Pemasukan berjalan.
* Memastikan filter Pengeluaran berjalan.
* Memastikan hasil filter hanya menampilkan transaksi user yang sedang login.

**Monthly Budget**

* Membuat Monthly Budget Selection.
* Menyediakan pilihan bulan.
* Menampilkan budget berdasarkan bulan yang dipilih.
* Mengambil informasi budget sesuai periode.
* Memastikan perubahan bulan memperbarui data budget.

### Requirement yang dikerjakan

* FR-09 Filter Transaksi
* FR-14 AJAX Filter Transaksi
* FR-15 Monthly Budget
* FR-19 Monthly Budget Selection

### Output

* Filter transaksi AJAX.
* Pemilihan bulan Monthly Budget.
* Tampilan budget berdasarkan bulan.
* Integrasi pemilihan bulan dengan data budget.

---

## 18.4 Anggota 4 – Set Budget & Budget Indicator

Fokus pada pengelolaan budget dan indikator penggunaan anggaran.

### Tugas

**Monthly Budget**

* Membuat fitur Set Budget.
* Menentukan nominal budget bulanan.
* Mengubah nominal budget.
* Memastikan budget tersimpan berdasarkan user dan bulan yang dipilih.

**Budget Indicator**

* Menghitung penggunaan budget.
* Menampilkan status penggunaan budget.
* Menghubungkan Budget Indicator dengan total pengeluaran.
* Memastikan indikator berubah sesuai kondisi budget.

### Requirement yang dikerjakan

* FR-16 Set Budget
* FR-18 Budget Indicator
* Bagian pengelolaan budget pada FR-15 Monthly Budget
* Bagian perubahan budget pada FR-16 Set Budget

### Output

* Form Set Budget.
* Fitur perubahan budget.
* Budget Indicator.
* Perhitungan penggunaan budget.

---

# 19. Pembagian Requirement

| Requirement                             | Anggota       |
| --------------------------------------- | ------------- |
| FR-06 Dashboard                         | Anggota 1     |
| FR-07 Manajemen Transaksi               | Anggota 2     |
| FR-09 Filter Transaksi                  | Anggota 3     |
| FR-12 AJAX Dashboard                    | Anggota 1     |
| FR-13 AJAX Manajemen Transaksi          | Anggota 2     |
| FR-14 AJAX Filter Transaksi             | Anggota 3     |
| FR-15 Monthly Budget                    | Anggota 3 & 4 |
| FR-16 Set Budget                        | Anggota 4     |
| FR-17 Budget Summary                    | Anggota 1     |
| FR-18 Budget Indicator                  | Anggota 4     |
| FR-19 Monthly Budget Selection          | Anggota 3     |
| FR-20 Authorization Monthly Budget      | Anggota 2     |
| FR-21 Integrasi Budget dengan Transaksi | Anggota 2     |

Pembagian FR-15 dan integrasi antarfitur dikerjakan bersama karena Monthly Budget membutuhkan hubungan antara pemilihan bulan, data budget, dan tampilan budget.

---

# 20. Pembagian Integrasi

Setelah masing-masing bagian selesai, seluruh fitur diintegrasikan menjadi satu sistem.

```text
                    User Login
                        |
                        v
                User yang Login
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      Dashboard     Transaksi      Monthly Budget
     Anggota 1      Anggota 2       Anggota 3 & 4
          |             |             |
          |             v             |
          |        Pengeluaran        |
          |             |             |
          +-------------+-------------+
                        |
                        v
                Budget Summary
                  Anggota 1
                        |
                        v
                Budget Indicator
                  Anggota 4
```

### Integrasi yang harus diuji

1. User login dapat mengakses dashboard.
2. Dashboard menampilkan data user yang sedang login.
3. Transaksi dapat ditambahkan melalui AJAX.
4. Transaksi dapat dihapus melalui AJAX.
5. Filter transaksi berjalan menggunakan AJAX.
6. User dapat menentukan budget bulanan.
7. User dapat mengubah budget bulanan.
8. User dapat memilih bulan untuk melihat budget.
9. Total pengeluaran berasal dari transaksi pengeluaran user.
10. Budget Summary menampilkan anggaran, total pengeluaran, dan sisa anggaran.
11. Budget Indicator menampilkan status penggunaan anggaran.
12. Data budget dan transaksi tidak dapat diakses oleh user lain.