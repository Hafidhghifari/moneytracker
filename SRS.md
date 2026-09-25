# Software Requirements Specification (SRS)
# Moneyhist - Personal Expense Tracker

## 1. Pendahuluan

### 1.1 Nama Sistem
Moneyhist

### 1.2 Deskripsi Sistem
Moneyhist adalah aplikasi web sederhana untuk membantu mahasiswa mengelola keuangan pribadi.

Pengguna dapat membuat akun, login, melihat kondisi keuangan, mencatat transaksi pemasukan dan pengeluaran, menghapus transaksi, serta memfilter transaksi berdasarkan jenisnya.

Setiap transaksi terhubung dengan akun pengguna yang sedang login sehingga pengguna hanya dapat melihat dan mengelola data keuangannya sendiri.

### 1.3 Tujuan Sistem

Sistem dibuat untuk:

1. Membantu mahasiswa mencatat pemasukan dan pengeluaran.
2. Menampilkan kondisi keuangan pengguna secara sederhana.
3. Menyimpan riwayat transaksi pengguna.
4. Membatasi akses data berdasarkan akun pengguna.
5. Menyediakan autentikasi menggunakan email dan password.
6. Mempertahankan informasi autentikasi pengguna selama session masih berlaku.
7. Menyediakan preferensi pengguna yang dapat disimpan.
8. Memudahkan pengguna menambah dan menghapus transaksi.

---

# 2. Ruang Lingkup Sistem

Moneyhist memiliki fitur utama:

- Register
- Login
- Session
- Cookies
- Authorization
- Dashboard
- Manajemen transaksi
- Filter transaksi
- Logout
- Penyimpanan preferensi pengguna

Sistem ditujukan untuk penggunaan keuangan pribadi sederhana, bukan untuk sistem perbankan atau transaksi keuangan secara langsung.

---

# 3. Aktor Sistem

## 3.1 Pengguna

Pengguna adalah mahasiswa yang telah memiliki atau membuat akun pada sistem.

Pengguna dapat:

- Membuat akun.
- Login.
- Melihat dashboard.
- Melihat saldo.
- Melihat total pemasukan.
- Melihat total pengeluaran.
- Melihat transaksi terbaru.
- Menambahkan transaksi.
- Menghapus transaksi miliknya.
- Memfilter transaksi.
- Menyimpan preferensi.
- Logout.

---

# 4. Functional Requirements

## FR-01 Register

Sistem harus menyediakan halaman register.

Pengguna dapat membuat akun menggunakan:

- Nama
- Email
- Password

Ketentuan:

1. Email harus memiliki format yang valid.
2. Email harus unik.
3. Password wajib diisi.
4. Sistem menyimpan data akun setelah proses register berhasil.
5. Sistem menolak pendaftaran jika email sudah digunakan.

---

## FR-02 Login

Sistem harus menyediakan halaman login.

Pengguna login menggunakan:

- Email
- Password

Jika data benar:

- Sistem membuat session pengguna.
- Sistem mengarahkan pengguna ke dashboard.

Jika data salah:

- Sistem menampilkan pesan kesalahan.
- Pengguna tidak dapat masuk ke dashboard.

---

## FR-03 Session

Sistem harus menggunakan session untuk mempertahankan status login pengguna.

Selama session masih berlaku:

- Pengguna tidak perlu login kembali pada setiap halaman.
- Sistem dapat mengetahui pengguna yang sedang login.

Jika session berakhir:

- Pengguna harus melakukan login kembali.

---

## FR-04 Cookies

Sistem harus menggunakan cookies untuk menyimpan minimal satu informasi yang berkaitan dengan pengguna.

Contoh:

- Preferensi tampilan pengguna.
- Preferensi filter transaksi.
- Preferensi tema.

Cookies tidak boleh digunakan untuk menyimpan password pengguna.

---

## FR-05 Authorization

Sistem harus membatasi akses data berdasarkan pengguna yang sedang login.

Aturan:

1. Pengguna hanya dapat melihat transaksi miliknya sendiri.
2. Pengguna hanya dapat menambahkan transaksi ke akunnya sendiri.
3. Pengguna hanya dapat menghapus transaksi miliknya sendiri.
4. Pengguna tidak dapat mengakses transaksi milik pengguna lain dengan memanipulasi URL atau request.
5. Halaman yang membutuhkan login tidak dapat diakses oleh pengguna yang belum login.

---

## FR-06 Dashboard

Setelah login, pengguna diarahkan ke halaman dashboard.

Dashboard minimal menampilkan:

- Nama pengguna.
- Total pemasukan.
- Total pengeluaran.
- Saldo.
- Transaksi terbaru.

### Perhitungan saldo

Saldo dihitung dengan rumus:

    Saldo = Total Pemasukan - Total Pengeluaran

Dashboard hanya menampilkan data milik pengguna yang sedang login.

---

## FR-07 Manajemen Transaksi

Pengguna dapat mengelola transaksi melalui dashboard.

Setiap transaksi minimal memiliki:

- ID transaksi
- User ID
- Jenis transaksi
- Nominal
- Deskripsi
- Tanggal transaksi

Jenis transaksi terdiri dari:

- Pemasukan
- Pengeluaran

### Menambah Transaksi

Pengguna dapat menambahkan transaksi baru.

Sistem harus:

1. Menerima data transaksi.
2. Memvalidasi data.
3. Menghubungkan transaksi dengan user yang sedang login.
4. Menyimpan transaksi ke database.
5. Menampilkan transaksi setelah berhasil disimpan.

### Menghapus Transaksi

Pengguna dapat menghapus transaksi miliknya.

Sistem harus memastikan bahwa transaksi yang dihapus benar-benar dimiliki oleh pengguna yang sedang login.

---

## FR-08 Riwayat Transaksi

Pengguna dapat melihat riwayat transaksi.

Riwayat hanya menampilkan transaksi milik pengguna yang sedang login.

Informasi minimal:

| Data | Keterangan |
|---|---|
| Tanggal | Tanggal transaksi |
| Jenis | Pemasukan/Pengeluaran |
| Deskripsi | Keterangan transaksi |
| Nominal | Jumlah uang |

---

## FR-09 Filter Transaksi

Sistem menyediakan filter transaksi berdasarkan jenis.

Pilihan filter:

- Semua
- Pemasukan
- Pengeluaran

Jika pengguna memilih:

### Semua
Sistem menampilkan seluruh transaksi milik pengguna.

### Pemasukan
Sistem hanya menampilkan transaksi dengan jenis pemasukan.

### Pengeluaran
Sistem hanya menampilkan transaksi dengan jenis pengeluaran.

---

## FR-10 Preferensi Pengguna

Sistem harus menyediakan minimal satu preferensi yang dapat disimpan.

Contoh preferensi:

- Tema tampilan.
- Filter transaksi terakhir.
- Tampilan dashboard.

Preferensi harus terhubung dengan pengguna yang bersangkutan.

---

## FR-11 Logout

Pengguna dapat melakukan logout.

Ketika logout:

1. Session pengguna harus dihapus/dinyatakan tidak berlaku.
2. Pengguna diarahkan ke halaman login.
3. Pengguna tidak dapat mengakses halaman yang membutuhkan autentikasi tanpa login kembali.

---

# 5. Non-Functional Requirements

## NFR-01 Security

Sistem harus menjaga keamanan data pengguna.

Minimal:

- Password tidak disimpan dalam bentuk plaintext.
- Password disimpan menggunakan hashing.
- Session digunakan untuk autentikasi.
- Authorization diterapkan pada data transaksi.
- Pengguna tidak dapat mengakses data pengguna lain.

---

## NFR-02 Usability

Sistem harus mudah digunakan oleh mahasiswa.

Antarmuka minimal menyediakan:

- Navigasi yang jelas.
- Form transaksi yang sederhana.
- Informasi saldo yang mudah dipahami.
- Riwayat transaksi yang mudah dibaca.

---

## NFR-03 Performance

Sistem harus dapat menampilkan dashboard dan transaksi pengguna dalam waktu yang wajar pada kondisi jaringan normal.

---

## NFR-04 Data Integrity

Setiap transaksi harus memiliki hubungan dengan satu pengguna.

Relasi:

    User 1 ---- N Transaction

Artinya satu pengguna dapat memiliki banyak transaksi.

---

# 6. Data Requirements

## 6.1 Tabel Users

| Field | Tipe | Keterangan |
|---|---|---|
| id | Integer | Primary Key |
| name | String | Nama pengguna |
| email | String | Email pengguna, unique |
| password | String | Password yang telah di-hash |
| preference | String | Preferensi pengguna |

---

## 6.2 Tabel Transactions

| Field | Tipe | Keterangan |
|---|---|---|
| id | Integer | Primary Key |
| user_id | Integer | Foreign Key ke Users |
| type | String | income/expense |
| amount | Decimal | Nominal transaksi |
| description | String | Deskripsi transaksi |
| transaction_date | Date | Tanggal transaksi |

Relasi:

    Users.id -> Transactions.user_id

Setiap transaksi harus memiliki `user_id`.

---

# 7. Alur Sistem

## 7.1 Alur Register

    User
      |
      v
    Register
      |
      v
    Input Nama, Email, Password
      |
      v
    Validasi
      |
      +---- Tidak Valid ----> Tampilkan Error
      |
      v
    Simpan User
      |
      v
    Login

---

## 7.2 Alur Login

    User
      |
      v
    Login
      |
      v
    Email + Password
      |
      v
    Validasi
      |
      +---- Salah ----> Error
      |
      v
    Buat Session
      |
      v
    Dashboard

---

## 7.3 Alur Transaksi

    Dashboard
        |
        +---- Tambah Transaksi
        |          |
        |          v
        |      Validasi
        |          |
        |          v
        |      Simpan Transaksi
        |
        +---- Hapus Transaksi
        |          |
        |          v
        |      Cek Authorization
        |          |
        |          v
        |      Hapus Transaksi
        |
        +---- Filter Transaksi
                   |
                   v
              Tampilkan Data

---

# 8. Business Rules

## BR-01

Email pengguna harus unik.

## BR-02

Pengguna harus login untuk mengakses dashboard.

## BR-03

Setiap transaksi harus memiliki user_id.

## BR-04

Pengguna hanya dapat melihat transaksi miliknya.

## BR-05

Pengguna hanya dapat menghapus transaksi miliknya.

## BR-06

Saldo dihitung berdasarkan seluruh transaksi pengguna.

    Saldo = Pemasukan - Pengeluaran

## BR-07

Transaksi dengan jenis `income` dihitung sebagai pemasukan.

## BR-08

Transaksi dengan jenis `expense` dihitung sebagai pengeluaran.

## BR-09

Password tidak boleh disimpan sebagai plaintext.

---

# 9. Halaman Sistem

Sistem minimal memiliki halaman:

1. Register
2. Login
3. Dashboard
4. Tambah Transaksi
5. Riwayat Transaksi
6. Logout

Filter transaksi dapat berada pada halaman Riwayat Transaksi atau Dashboard.

---

# 10. Pembagian Tugas 4 Orang

## Anggota 1 - Authentication & User

Fokus pada akun dan autentikasi.

Tugas:

- Register
- Login
- Logout
- Session
- Cookies
- Password hashing
- Validasi email dan password
- Data user
- Authorization dasar

Output:

- Halaman register
- Halaman login
- Sistem session
- Sistem logout
- Sistem cookies

---

## Anggota 2 - Database & Transaction Backend

Fokus pada database dan pengelolaan transaksi.

Tugas:

- Membuat database
- Membuat tabel Users
- Membuat tabel Transactions
- Relasi User → Transactions
- Menambahkan transaksi
- Menghapus transaksi
- Validasi `user_id`
- Query transaksi berdasarkan user yang login

Output:

- Database
- Model/database logic
- API/route transaksi jika menggunakan backend API
- CRUD transaksi yang diperlukan

---

## Anggota 3 - Dashboard & Financial Summary

Fokus pada tampilan kondisi keuangan pengguna.

Tugas:

- Dashboard
- Menampilkan nama pengguna
- Total pemasukan
- Total pengeluaran
- Perhitungan saldo
- Transaksi terbaru
- Integrasi data transaksi ke dashboard

Output:

- Halaman dashboard
- Komponen summary keuangan
- Komponen transaksi terbaru

---

## Anggota 4 - Transaction UI & Filter

Fokus pada antarmuka transaksi.

Tugas:

- Form tambah transaksi
- Halaman riwayat transaksi
- Filter pemasukan
- Filter pengeluaran
- Filter semua transaksi
- Tombol hapus transaksi
- Integrasi dengan backend transaksi
- Menampilkan pesan berhasil/gagal

Output:

- Form transaksi
- Riwayat transaksi
- Filter transaksi
- UI delete transaksi

---

# 11. Pembagian Integrasi

Setelah setiap anggota selesai, seluruh bagian diintegrasikan:

    Anggota 1
    Authentication
         |
         v
    User yang sedang login
         |
         +-------------------+
         |                   |
         v                   v
    Anggota 2             Anggota 3
    Transactions          Dashboard
         |                   |
         +---------+---------+
                   |
                   v
               Anggota 4
             Transaction UI
             + Filter

---

# 12. Acceptance Criteria

Sistem dianggap memenuhi requirement apabila:

- [ ] User dapat melakukan register.
- [ ] User dapat melakukan login menggunakan email dan password.
- [ ] Password tersimpan secara aman menggunakan hashing.
- [ ] Session dibuat setelah login.
- [ ] Halaman dashboard membutuhkan login.
- [ ] Nama user tampil di dashboard.
- [ ] Total pemasukan dapat ditampilkan.
- [ ] Total pengeluaran dapat ditampilkan.
- [ ] Saldo dapat dihitung.
- [ ] User dapat menambahkan transaksi.
- [ ] User dapat menghapus transaksi.
- [ ] User dapat melihat riwayat transaksi.
- [ ] User dapat memfilter transaksi berdasarkan pemasukan/pengeluaran.
- [ ] Setiap transaksi terhubung dengan user yang membuatnya.
- [ ] User A tidak dapat melihat transaksi User B.
- [ ] User A tidak dapat menghapus transaksi User B.
- [ ] Sistem menggunakan cookies.
- [ ] Sistem menyimpan minimal satu preferensi user.
- [ ] User dapat logout.
- [ ] Setelah logout, session tidak dapat digunakan untuk mengakses dashboard.