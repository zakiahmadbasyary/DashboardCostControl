# Dokumen Pengujian Fungsional dan Keamanan Halaman Admin

## 1. Tujuan Pengujian

Dokumen ini digunakan sebagai panduan pengujian **halaman Admin Pusat** dan integrasinya dengan halaman admin setiap dashboard AgroMetric.

Arsitektur yang diuji:

- Dashboard publik dapat diakses tanpa login.
- Login dan autentikasi dikelola secara terpusat.
- **SUPER_ADMIN** dapat mengelola pengguna dan hak akses.
- **ADMIN** hanya dapat mengakses dashboard yang diberikan kepadanya.
- Halaman admin setiap dashboard digunakan untuk fungsi operasional seperti **Review Data** dan **Upload Data**.
- User management, role, permission, session, dan activity log dikelola secara terpusat sesuai implementasi aplikasi.

> Lakukan pengujian hanya pada aplikasi dan environment yang dimiliki atau diizinkan untuk diuji. Disarankan menggunakan development/staging dan backup data sebelum pengujian yang mengubah data.

---

# 2. Data dan Akun Uji

| Kode | Jenis Akun | Role | Contoh Hak Akses |
|---|---|---|---|
| U-01 | Super Admin | SUPER_ADMIN | Semua dashboard |
| U-02 | Admin WIP | ADMIN | WIP ACC |
| U-03 | Admin Terbatas | ADMIN | Dashboard tertentu |
| U-04 | Tanpa Login | - | Tidak ada |

Siapkan juga:

- file upload valid;
- file dengan format tidak valid;
- file dengan struktur/header tidak valid;
- file kosong;
- file berukuran melebihi batas;
- data uji untuk Review Data.

---

# 3. Pengujian Fungsional

## F-01 — Login Super Admin

**Langkah:**

1. Buka halaman login.
2. Masukkan kredensial Super Admin yang valid.
3. Lakukan login.

**Hasil yang diharapkan:**

- Login berhasil.
- User diarahkan ke halaman tujuan yang sesuai.
- Identitas user yang benar ditampilkan.
- Role SUPER_ADMIN dikenali dengan benar.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-02 — Tampilan Pusat Administrasi untuk Super Admin

**Langkah:**

1. Login sebagai SUPER_ADMIN.
2. Buka halaman Pusat Administrasi.

**Hasil yang diharapkan:**

Super Admin dapat melihat:

- informasi profil;
- ringkasan hak akses dashboard;
- Manajemen Pengguna;
- Manajemen Akses;
- Log Aktivitas;
- navigasi menuju seluruh dashboard.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-03 — Tampilan Pusat Administrasi untuk Admin Biasa

**Langkah:**

1. Login sebagai ADMIN.
2. Buka halaman Pusat Administrasi.

**Hasil yang diharapkan:**

Admin hanya melihat:

- informasi profil;
- hak akses dashboard miliknya;
- link menuju dashboard yang diizinkan;
- Log Aktivitas sesuai izin sistem.

Admin tidak boleh melihat:

- Manajemen Pengguna;
- Tambah Pengguna;
- pengaturan role pengguna lain;
- Manajemen Akses.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-04 — Menambahkan Pengguna oleh Super Admin

**Langkah:**

1. Login sebagai SUPER_ADMIN.
2. Buka Manajemen Pengguna.
3. Pilih Tambah Pengguna.
4. Isi data valid.
5. Simpan.

**Hasil yang diharapkan:**

- Pengguna berhasil dibuat.
- Data pengguna tampil pada daftar pengguna.
- Role awal sesuai data yang dipilih.
- Data duplikat ditangani sesuai aturan sistem.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-05 — Validasi Tambah Pengguna

Uji:

- field wajib kosong;
- format data tidak valid;
- data duplikat;
- input terlalu panjang;
- karakter khusus yang tidak valid.

**Hasil yang diharapkan:**

- Sistem menampilkan validasi yang jelas.
- Data tidak valid tidak tersimpan.
- Aplikasi tidak crash.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-06 — Pengaturan Hak Akses Dashboard

**Langkah:**

1. Login sebagai SUPER_ADMIN.
2. Pilih pengguna ADMIN.
3. Berikan akses ke dashboard tertentu.
4. Simpan perubahan.
5. Login menggunakan akun ADMIN tersebut.

**Hasil yang diharapkan:**

- Hak akses tersimpan.
- Dashboard yang diberikan akses dapat digunakan.
- Dashboard tanpa akses tetap ditolak.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-07 — Perubahan Hak Akses

**Langkah:**

1. Pilih ADMIN yang telah memiliki akses.
2. Tambahkan atau hapus akses dashboard.
3. Simpan.
4. Verifikasi kembali menggunakan akun ADMIN.

**Hasil yang diharapkan:**

- Perubahan hak akses diterapkan sesuai desain sistem.
- Hak akses baru tercermin setelah session diperbarui jika diperlukan oleh implementasi.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-08 — Admin Mengakses Dashboard yang Diizinkan

**Langkah:**

1. Login sebagai ADMIN.
2. Buka dashboard yang menjadi hak aksesnya.
3. Masuk ke halaman admin dashboard tersebut.

**Hasil yang diharapkan:**

- Akses diberikan.
- Halaman admin dapat digunakan.
- Fitur operasional yang diizinkan, seperti Review Data dan Upload Data, tersedia.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-09 — Admin Ditolak dari Dashboard yang Tidak Diizinkan

**Langkah:**

1. Login sebagai ADMIN.
2. Coba membuka dashboard yang tidak termasuk hak aksesnya.

**Hasil yang diharapkan:**

- Akses ditolak.
- Data sensitif tidak ditampilkan.
- User menerima respons yang sesuai.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-10 — Review Data

**Langkah:**

1. Login dengan akun yang memiliki akses.
2. Buka halaman admin dashboard.
3. Pilih Review Data.

**Hasil yang diharapkan:**

- Data berhasil dimuat.
- Data sesuai sumber dashboard.
- Filter/pencarian berjalan jika tersedia.
- User tidak dapat melihat data dashboard yang tidak menjadi hak aksesnya.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-11 — Upload Data Valid

**Langkah:**

1. Login dengan akun yang memiliki akses.
2. Buka Upload Data.
3. Pilih file valid.
4. Jalankan upload.

**Hasil yang diharapkan:**

- File diterima.
- Data divalidasi.
- Data diproses sesuai aturan aplikasi.
- Hasil proses ditampilkan.
- Data tersimpan atau diperbarui dengan benar.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-12 — Upload Data Tidak Valid

Uji:

- format file salah;
- struktur/header salah;
- file kosong;
- data tidak sesuai format;
- ukuran file melebihi batas.

**Hasil yang diharapkan:**

- File/data tidak valid ditolak.
- Pesan kesalahan jelas.
- Data lama tidak rusak.
- Tidak terjadi penyimpanan parsial yang tidak diinginkan.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-13 — Activity Log

Lakukan aktivitas seperti:

- login;
- tambah pengguna;
- perubahan hak akses;
- upload data.

**Hasil yang diharapkan:**

Jika aktivitas tersebut dicatat oleh sistem:

- aktivitas tercatat;
- identitas pelaku benar;
- waktu aktivitas benar;
- dashboard/fitur terkait benar;
- password, token, dan secret tidak tercatat.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## F-14 — Logout

**Langkah:**

1. Login.
2. Buka halaman admin.
3. Logout.
4. Coba kembali membuka halaman admin.

**Hasil yang diharapkan:**

- Logout berhasil.
- Session yang tidak lagi valid tidak dapat digunakan.
- Request baru ke halaman admin memerlukan autentikasi kembali.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

# 4. Pengujian Keamanan

## S-01 — Akses Halaman Admin Tanpa Login

**Langkah:**

1. Logout atau gunakan browser tanpa session.
2. Buka URL Admin Pusat atau halaman admin dashboard secara langsung.

**Hasil yang diharapkan:**

- Akses ditolak atau diarahkan ke login sesuai desain aplikasi.
- Data admin tidak ditampilkan.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-02 — Broken Access Control melalui URL

**Langkah:**

1. Login sebagai ADMIN biasa.
2. Coba membuka URL fitur khusus SUPER_ADMIN secara langsung.
3. Coba membuka URL dashboard yang tidak menjadi hak akses.

**Hasil yang diharapkan:**

- Server tetap menolak akses.
- Proteksi tidak hanya bergantung pada menu yang disembunyikan di frontend.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-03 — Proteksi API

Dengan akun ADMIN yang tidak memiliki izin, uji request ke endpoint sensitif yang tersedia, misalnya:

- manajemen pengguna;
- perubahan hak akses;
- upload;
- perubahan data.

Gunakan browser DevTools atau API testing tool pada environment yang diizinkan.

**Hasil yang diharapkan:**

- Request tanpa autentikasi ditolak.
- Request dengan role yang tidak sesuai ditolak.
- Endpoint memverifikasi authorization di sisi server.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-04 — Manipulasi Identitas dan Hak Akses

Jika request memiliki parameter seperti:

- userId;
- dashboardId;
- role;
- accessId;

uji perubahan nilai tersebut pada environment yang diizinkan.

**Hasil yang diharapkan:**

- User tidak dapat meningkatkan hak akses dengan mengubah data dari client.
- Server menentukan identitas dari session/token yang valid.
- Permission diverifikasi di sisi server.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-05 — Session Setelah Logout

**Langkah:**

1. Login.
2. Akses halaman admin.
3. Logout.
4. Tekan Back.
5. Refresh halaman atau lakukan request baru.

**Hasil yang diharapkan:**

- Cache halaman tidak dapat digunakan untuk melakukan aksi baru tanpa autentikasi valid.
- Request baru ke resource terlindungi ditolak jika session sudah tidak valid.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-06 — Session Kedaluwarsa

Jika aplikasi memiliki masa berlaku session:

1. Login.
2. Lakukan pengujian setelah session kedaluwarsa.
3. Coba melakukan aksi sensitif.

**Hasil yang diharapkan:**

- Aksi ditolak jika session sudah kedaluwarsa.
- User diminta autentikasi ulang sesuai desain sistem.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-07 — Validasi File Upload di Server

Coba mengirim:

- file dengan ekstensi tidak diizinkan;
- file dengan isi/struktur tidak sesuai;
- file kosong;
- file melebihi batas ukuran.

**Hasil yang diharapkan:**

- Validasi dilakukan di sisi server, bukan hanya frontend.
- File yang tidak valid tidak diproses sebagai data valid.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-08 — Validasi Input

Pada form yang tersedia, uji:

- field kosong;
- input sangat panjang;
- karakter khusus;
- nilai di luar format yang diharapkan.

**Hasil yang diharapkan:**

- Input divalidasi.
- Aplikasi tidak crash.
- Data tidak valid tidak menyebabkan perubahan yang tidak sah.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-09 — Information Disclosure

Uji kondisi error seperti:

- request tanpa autentikasi;
- input tidak valid;
- upload gagal;
- parameter salah.

**Hasil yang diharapkan:**

Response tidak membocorkan:

- password;
- token;
- API secret;
- connection string;
- kredensial database;
- environment variable;
- stack trace sensitif pada production.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

## S-10 — Role Tidak Dipercaya dari Frontend

Periksa bahwa perubahan tampilan atau data role di browser tidak dapat memberikan akses tambahan.

**Hasil yang diharapkan:**

- Menampilkan tombol Super Admin di frontend tidak otomatis memberikan akses.
- Backend tetap memverifikasi role dan permission.

**Status:** [ ] Pass [ ] Fail

**Catatan:**

---

# 5. Pemeriksaan Konfigurasi Keamanan

## C-01 — Environment Variables

Periksa:

- `.env.local` tidak berisi dalam repository Git;
- `.env.example` tidak berisi secret asli;
- credential database tidak dikirim ke client;
- secret server tidak menggunakan prefix `NEXT_PUBLIC_`.

**Status:** [ ] Pass [ ] Fail

---

## C-02 — Endpoint Sensitif

Untuk endpoint sensitif, pastikan terdapat:

```text
Authentication
+
Authorization
+
Input Validation
```

Periksa sesuai implementasi:

- tambah pengguna;
- edit pengguna;
- pengaturan role;
- pengaturan akses dashboard;
- upload data;
- update/hapus data.

**Status:** [ ] Pass [ ] Fail

---

## C-03 — Database User Terpusat

Pastikan:

- setiap dashboard tidak menjadi sumber utama user, role, atau hak akses;
- data user dikelola dari sistem pusat sesuai arsitektur;
- data bisnis dashboard tetap terpisah;
- credential database tidak terekspos ke frontend.

**Status:** [ ] Pass [ ] Fail

---

## C-04 — HTTPS dan Cookie/Session Produksi

Sebelum production, periksa:

- halaman login menggunakan HTTPS;
- halaman admin menggunakan HTTPS;
- konfigurasi cookie/session sesuai praktik keamanan;
- komunikasi antar layanan tidak mengekspos secret.

**Status:** [ ] Pass [ ] Fail

---

# 6. Ringkasan Hasil Pengujian

| ID | Kategori | Skenario | Status | Catatan |
|---|---|---|---|---|
| F-01 | Fungsional | Login Super Admin | | |
| F-02 | Fungsional | Tampilan Super Admin | | |
| F-03 | Fungsional | Tampilan Admin | | |
| F-04 | Fungsional | Tambah Pengguna | | |
| F-06 | Fungsional | Pengaturan Hak Akses | | |
| F-08 | Fungsional | Akses Dashboard Diizinkan | | |
| F-09 | Fungsional | Penolakan Dashboard Tidak Diizinkan | | |
| F-10 | Fungsional | Review Data | | |
| F-11 | Fungsional | Upload File Valid | | |
| F-12 | Fungsional | Upload File Tidak Valid | | |
| F-13 | Fungsional | Activity Log | | |
| F-14 | Fungsional | Logout | | |
| S-01 | Keamanan | Akses Tanpa Login | | |
| S-02 | Keamanan | Bypass URL | | |
| S-03 | Keamanan | Proteksi API | | |
| S-04 | Keamanan | Manipulasi Identitas/Akses | | |
| S-05 | Keamanan | Session Setelah Logout | | |
| S-07 | Keamanan | Validasi Upload | | |
| S-08 | Keamanan | Validasi Input | | |
| S-09 | Keamanan | Information Disclosure | | |
| S-10 | Keamanan | Role Tidak Dipercaya dari Frontend | | |

---

# 7. Kriteria Kelulusan

Halaman admin dinyatakan memenuhi hasil pengujian utama apabila:

1. Super Admin dapat login dan mengakses fitur administrasi penuh.
2. Admin biasa hanya melihat fitur sesuai role dan hak akses.
3. Admin biasa tidak dapat mengakses Manajemen Pengguna.
4. Admin biasa tidak dapat mengakses Manajemen Akses.
5. Hak akses dashboard diterapkan dengan benar.
6. Dashboard tanpa hak akses tidak dapat dibuka hanya dengan mengubah URL.
7. Endpoint sensitif memverifikasi authentication dan authorization.
8. Upload data valid berjalan dengan benar.
9. File/data tidak valid ditolak dengan aman.
10. Session tidak dapat digunakan untuk request baru setelah logout atau kedaluwarsa.
11. Error tidak membocorkan informasi sensitif.
12. Environment variable dan secret dikonfigurasi dengan aman.
13. Dashboard publik tetap dapat diakses tanpa login sesuai desain sistem.

---

# 8. Template Pencatatan Temuan

```text
ID Pengujian:
Judul Temuan:
Kategori: Fungsional / Keamanan
Deskripsi:
Langkah Reproduksi:
Hasil Aktual:
Hasil yang Diharapkan:
Tingkat Prioritas: Critical / High / Medium / Low
Komponen/Endpoint Terkait:
Bukti Pengujian:
Status Perbaikan:
Hasil Retest:
```

## Definisi Prioritas

**CRITICAL** — Memungkinkan bypass autentikasi, akses tanpa izin serius, atau kompromi data sensitif.

**HIGH** — Kontrol akses endpoint sensitif gagal atau terdapat kelemahan besar pada fitur penting.

**MEDIUM** — Masalah validasi, session, atau error handling dengan dampak terbatas.

**LOW** — Masalah minor, tampilan, atau pesan validasi yang tidak langsung memengaruhi keamanan atau fungsi utama.

---

# 9. Regression Testing

Setelah masalah diperbaiki:

1. Uji kembali skenario yang sebelumnya gagal.
2. Uji fitur yang terkait dengan perubahan.
3. Pastikan perbaikan tidak mengganggu role lain.
4. Pastikan hak akses dashboard tetap benar.
5. Pastikan dashboard publik tetap berjalan normal.
6. Catat hasil retest pada laporan pengujian.
