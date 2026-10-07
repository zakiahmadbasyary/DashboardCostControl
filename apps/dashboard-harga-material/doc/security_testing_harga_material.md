# Security Testing — Proyek Harga Material

## 1. Informasi Dokumen

| Item | Keterangan |
|---|---|
| Nama Proyek | Harga Material |
| Jenis Pengujian | Security Testing |
| Fokus | Keamanan aplikasi web, API, database, autentikasi, otorisasi, dan input data |
| Sumber Data | `mastersheet` dan `bahan_material` |
| Referensi | OWASP Web Security Testing Guide (WSTG) dan OWASP Top 10 |

---

## 2. Tujuan

Security testing dilakukan untuk memastikan sistem Harga Material dapat:

1. Melindungi data harga material dari akses yang tidak sah.
2. Memastikan hanya pengguna yang memiliki hak akses dapat menggunakan fitur tertentu.
3. Mencegah manipulasi parameter dan data.
4. Mencegah SQL Injection dan XSS.
5. Melindungi API dari akses tanpa autentikasi.
6. Menjaga integritas data database.
7. Memastikan proses import Excel tidak menjadi celah keamanan.
8. Melindungi informasi sensitif seperti credential, token, dan konfigurasi database.
9. Memastikan session/token dikelola dengan aman.
10. Menangani error tanpa membocorkan informasi internal.

---

## 3. Ruang Lingkup

```text
Frontend
   │
   ├── Login / Authentication
   ├── Authorization
   ├── Filter Group
   ├── Filter Material
   ├── Grafik
   ├── Tabel
   └── Import Excel
        │
        ▼
Backend / API
   │
   ├── Authentication
   ├── Authorization
   ├── Validation
   ├── API Endpoint
   ├── SQL Query
   └── Business Logic
        │
        ▼
Database
   │
   ├── mastersheet
   └── bahan_material
```

---

# 4. Authentication Testing

## ST-AUTH-01 — Login dengan Credential Valid

**Langkah:**
1. Buka halaman login.
2. Masukkan username dan password valid.
3. Klik Login.
4. Periksa response dan halaman setelah login.

**Expected Result:**
- Login berhasil.
- User diarahkan ke dashboard.
- Token/session dibuat dengan aman.
- Credential tidak ditampilkan.

**Status:** `Pass / Fail`

---

## ST-AUTH-02 — Password Salah

**Langkah:**
1. Masukkan username valid.
2. Masukkan password salah.
3. Klik Login.

**Expected Result:**
- Login ditolak.
- Tidak ada informasi password yang benar.
- Tidak ada informasi database/internal system.

**Status:** `Pass / Fail`

---

## ST-AUTH-03 — Username Tidak Terdaftar

**Expected Result:**
- Login ditolak.
- Tidak terjadi error server.
- Sistem tidak membocorkan informasi internal.

**Status:** `Pass / Fail`

---

## ST-AUTH-04 — Brute Force Protection

Lakukan percobaan login gagal berulang kali.

**Expected Result:**
- Terdapat rate limiting, temporary lock, CAPTCHA, atau mekanisme perlindungan lainnya.

**Status:** `Pass / Fail / N/A`

---

# 5. Authorization Testing

## ST-AUTHZ-01 — Akses Dashboard Tanpa Login

**Langkah:**
1. Logout.
2. Akses URL dashboard Harga Material secara langsung.

**Expected Result:**

```text
401 Unauthorized
```

atau diarahkan ke halaman login.

**Status:** `Pass / Fail`

---

## ST-AUTHZ-02 — API Tanpa Token

Contoh:

```http
GET /api/material
```

Kirim request tanpa authentication token.

**Expected Result:**

```text
401 Unauthorized
```

**Status:** `Pass / Fail`

---

## ST-AUTHZ-03 — Token Tidak Valid

Uji token:
- Salah.
- Diubah.
- Expired.

**Expected Result:** Request ditolak.

**Status:** `Pass / Fail`

---

## ST-AUTHZ-04 — Role Tidak Sesuai

Login dengan role tertentu lalu akses fitur yang hanya diperbolehkan untuk role lain.

**Expected Result:**

```text
403 Forbidden
```

atau mekanisme authorization yang sesuai.

**Status:** `Pass / Fail / N/A`

---

# 6. IDOR / Broken Access Control

## ST-ACCESS-01 — Manipulasi ID

Jika endpoint menggunakan ID:

```text
/api/bahan-material/123
```

ubah menjadi:

```text
/api/bahan-material/124
```

**Tujuan:** Memastikan pengguna tidak dapat mengakses data yang bukan haknya hanya dengan mengganti ID.

**Expected Result:** Server melakukan pengecekan authorization.

**Status:** `Pass / Fail / N/A`

---

# 7. Input Validation

Semua input pengguna harus divalidasi oleh **backend**, bukan hanya frontend.

Input yang perlu diuji:

- Group
- Material
- ID
- Query parameter
- Pagination
- Sorting
- Search
- Data import

---

# 8. SQL Injection Testing

## ST-SQL-01 — SQL Injection pada Material

Contoh input pengujian:

```text
' OR '1'='1
```

atau:

```text
' OR 1=1 --
```

**Expected Result:**
- Input diperlakukan sebagai string biasa atau ditolak.
- Tidak muncul error SQL.
- Tidak ada data tambahan yang terbuka.

**Status:** `Pass / Fail`

---

## ST-SQL-02 — SQL Injection pada Group

Lakukan pengujian serupa pada filter `group`.

**Expected Result:** Tidak terjadi perubahan query SQL dan tidak ada data yang terbuka secara tidak sah.

**Status:** `Pass / Fail`

---

# 9. XSS Testing

## ST-XSS-01 — Stored XSS

Jika terdapat input data/import material, gunakan payload pengujian:

```html
<script>alert('XSS')</script>
```

**Expected Result:** Payload tidak dieksekusi sebagai JavaScript.

**Status:** `Pass / Fail / N/A`

---

## ST-XSS-02 — Reflected XSS

Uji parameter URL/search/filter dengan input HTML/JavaScript.

**Expected Result:** Input ditampilkan sebagai teks biasa dan tidak dieksekusi.

**Status:** `Pass / Fail`

---

# 10. API Security Testing

Setiap endpoint API harus diuji terhadap:

- Authentication
- Authorization
- Input validation
- HTTP method
- Parameter manipulation
- Rate limiting
- Error handling

| Pengujian | Expected |
|---|---|
| Tanpa token | 401 |
| Token invalid | 401 |
| Role tidak sesuai | 403 |
| Parameter invalid | 400 |
| ID tidak ditemukan | 404 |
| Request valid | 200 |

---

# 11. HTTP Method Testing

Jika endpoint hanya membutuhkan:

```http
GET /api/material
```

uji juga:

```http
POST /api/material
PUT /api/material
DELETE /api/material
```

**Expected Result:**

Method yang tidak diizinkan ditolak, misalnya:

```text
405 Method Not Allowed
```

**Status:** `Pass / Fail`

---

# 12. Excel Import Security Testing

Jika sistem menyediakan upload/import Excel, lakukan pengujian berikut.

## ST-FILE-01 — File Extension

Uji:

```text
.xlsx
.xls
.csv
.txt
.exe
.php
.js
.html
```

**Expected Result:** Hanya format yang memang dibutuhkan yang diterima.

---

## ST-FILE-02 — File Berukuran Besar

Upload file yang melebihi batas ukuran.

**Expected Result:** Upload ditolak.

---

## ST-FILE-03 — Data Excel Tidak Valid

Uji:

- Price berupa teks.
- Price Unit berupa teks.
- Price Unit = 0.
- Material kosong.
- Tanggal `update` tidak valid.
- Data duplikat.
- Formula Excel tidak sesuai.

**Expected Result:** Data divalidasi sebelum disimpan.

---

## ST-FILE-04 — Formula Injection

Uji nilai Excel yang diawali:

```text
=
+
-
@
```

Contoh:

```text
=CMD(...)
```

**Expected Result:** Data diperlakukan sebagai data biasa dan tidak menyebabkan eksekusi perintah.

---

## ST-FILE-05 — Nama File Berbahaya

Contoh:

```text
../../material.xlsx
```

**Expected Result:** Sistem aman dari path traversal.

---

# 13. Path Traversal

Jika sistem menyimpan file berdasarkan nama/path dari pengguna, uji input seperti:

```text
../../../../etc/passwd
```

**Expected Result:** Sistem tidak dapat membaca atau menulis file di luar direktori yang diizinkan.

**Status:** `Pass / Fail / N/A`

---

# 14. Sensitive Information Exposure

Periksa frontend dan backend.

Jangan sampai credential atau secret berada pada frontend, seperti:

```text
DATABASE_URL
DB_PASSWORD
JWT_SECRET
API_SECRET
PRIVATE_KEY
```

Error response juga tidak boleh menampilkan:

- Stack trace.
- Query SQL.
- Password database.
- Environment variable.
- File path internal.
- Secret/token.

---

# 15. Environment Variable

Credential harus disimpan melalui environment variable.

Contoh:

```env
DATABASE_URL=...
JWT_SECRET=...
```

Jangan menulis credential langsung di source code.

File berikut tidak boleh terpublikasi:

```text
.env
.env.local
.env.production
```

---

# 16. Token / Session Security

Jika aplikasi menggunakan JWT/session, periksa:

- Token memiliki expiration.
- Token tidak mudah ditebak.
- Token tidak ditampilkan pada UI.
- Token tidak dikirim melalui HTTP biasa.
- Token lama tidak dapat digunakan setelah logout jika mekanisme aplikasi mengharuskan invalidasi.

Untuk cookie-based session, periksa:

```text
HttpOnly
Secure
SameSite
```

---

# 17. HTTPS Testing

Production harus menggunakan HTTPS.

Akses:

```text
http://domain
```

**Expected Result:** Diarahkan ke:

```text
https://domain
```

Credential tidak boleh dikirim melalui HTTP.

---

# 18. Security Headers

Periksa response header:

```text
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Strict-Transport-Security
```

**Expected Result:** Header keamanan diterapkan sesuai kebutuhan aplikasi.

---

# 19. CORS Testing

Periksa konfigurasi CORS API.

**Tujuan:** Memastikan API tidak menerima request dari origin yang tidak dipercaya jika tidak diperlukan.

**Expected Result:** Origin yang tidak diizinkan ditolak.

**Status:** `Pass / Fail`

---

# 20. Error Handling

## ST-ERR-01 — Input Invalid

Contoh:

```text
price=abc
price_unit=xyz
```

**Expected Result:**

```text
400 Bad Request
```

dan tidak ada stack trace atau informasi sensitif.

**Status:** `Pass / Fail`

---

# 21. Data Integrity Testing

Relasi:

```text
mastersheet.material
        ↓
bahan_material.material
```

Coba memasukkan `bahan_material.material` yang tidak terdapat di `mastersheet`.

**Expected Result:** Data ditolak karena foreign key tidak valid.

**Status:** `Pass / Fail`

---

# 22. Pengujian Nilai Harga

Kolom:

```text
price
price_unit
nilai
```

| Kondisi | Expected |
|---|---|
| Price valid | Diterima |
| Price negatif | Ditolak / ditangani |
| Price kosong | Ditolak / NULL sesuai aturan |
| Price Unit valid | Diterima |
| Price Unit = 0 | Ditolak |
| Price Unit negatif | Ditolak |
| Nilai | Sesuai `price / price_unit` |

---

# 23. Rate Limiting

Endpoint sensitif yang perlu diuji:

- Login
- API harga material
- API pencarian material
- API import

Jika request melebihi batas, sistem sebaiknya memberikan:

```text
429 Too Many Requests
```

atau mekanisme pembatasan yang sesuai.

---

# 24. Database Security

Periksa:

- Database tidak dapat diakses langsung dari internet jika tidak diperlukan.
- User database memiliki privilege minimum.
- Password database kuat.
- Port database tidak terbuka untuk publik jika tidak diperlukan.
- Application user tidak memiliki privilege berlebihan.
- Backup database memiliki perlindungan akses.
- Credential database menggunakan environment variable.

---

# 25. Logging Security

Aktivitas yang dapat dicatat:

- Login berhasil.
- Login gagal.
- Logout.
- Import data.
- Perubahan data.
- Request yang ditolak.
- Error keamanan.

Log **tidak boleh menyimpan**:

```text
Password
JWT Secret
API Secret
Token lengkap
Credential database
```

---

# 26. Security Testing Checklist

| ID | Pengujian | Expected Result | Status |
|---|---|---|---|
| ST-AUTH-01 | Login valid | Login berhasil | PASS |
| ST-AUTH-02 | Password salah | Login ditolak | PASS |
| ST-AUTH-03 | User tidak terdaftar | Login ditolak | PASS |
| ST-AUTH-04 | Brute force | Ada proteksi | PASS |
| ST-AUTHZ-01 | Dashboard tanpa login | Ditolak | PASS |
| ST-AUTHZ-02 | API tanpa token | 401 | PASS |
| ST-AUTHZ-03 | Token invalid | Ditolak | PASS |
| ST-AUTHZ-04 | Role tidak sesuai | 403 | PASS |
| ST-ACCESS-01 | Manipulasi ID | Akses ditolak | PASS |
| ST-SQL-01 | SQL Injection Material | Tidak dieksekusi | PASS |
| ST-SQL-02 | SQL Injection Group | Tidak dieksekusi | PASS |
| ST-XSS-01 | Stored XSS | Tidak dieksekusi | PASS |
| ST-XSS-02 | Reflected XSS | Tidak dieksekusi | PASS |
| ST-FILE-01 | Extension file | Hanya format valid | PASS |
| ST-FILE-02 | File besar | Ditolak | PASS |
| ST-FILE-03 | Data Excel invalid | Ditolak/divalidasi | PASS |
| ST-FILE-04 | Formula injection | Tidak dieksekusi | PASS |
| ST-FILE-05 | Nama file berbahaya | Aman | PASS |
| ST-ERR-01 | Error handling | Tidak bocor informasi | PASS |
| ST-DB-01 | Foreign key | Integritas terjaga | PASS |
| ST-HTTPS-01 | HTTPS | Koneksi aman | PASS |
| ST-CORS-01 | CORS | Origin tidak sah ditolak | PASS |
| ST-RATE-01 | Rate limiting | Request dibatasi | PASS |

---

# 27. Klasifikasi Temuan

## Critical

Contoh:

- Pengambilalihan sistem.
- Akses database penuh.
- Kebocoran data dalam skala besar.
- Remote Code Execution.

## High

Contoh:

- Bypass authentication.
- Bypass authorization.
- SQL Injection yang dapat membaca/mengubah data.
- Akses data tanpa izin.

## Medium

Contoh:

- Kebocoran informasi terbatas.
- XSS dengan dampak tertentu.
- Konfigurasi keamanan yang lemah.

## Low

Contoh:

- Informasi error terlalu detail namun tidak mengandung credential.
- Header keamanan tertentu belum lengkap.

---

# 28. Format Laporan Temuan

| Field | Isi |
|---|---|
| ID Temuan | SEC-001 |
| Judul | Contoh: API dapat diakses tanpa authentication |
| Severity | Critical / High / Medium / Low |
| Endpoint | Endpoint terdampak |
| Deskripsi | Penjelasan masalah |
| Langkah Reproduksi | Cara menghasilkan masalah |
| Expected Result | Hasil seharusnya |
| Actual Result | Hasil ditemukan |
| Dampak | Risiko terhadap sistem |
| Bukti | Screenshot / response / log |
| Rekomendasi | Solusi |
| Status | Open / Fixed / Retest / Closed |

---

# 29. Contoh Laporan Temuan

## SEC-001 — API Dapat Diakses Tanpa Authentication

**Severity:** High

**Endpoint:**

```text
GET /api/bahan-material
```

**Deskripsi:**

Endpoint dapat diakses tanpa authentication token.

**Langkah Reproduksi:**

1. Logout dari aplikasi.
2. Buka Postman.
3. Kirim request ke endpoint.
4. Jangan masukkan Authorization header.

**Expected Result:**

```text
401 Unauthorized
```

**Actual Result:**

```text
200 OK
```

**Dampak:**

Pengguna yang tidak terautentikasi dapat memperoleh data harga material.

**Rekomendasi:**

Tambahkan middleware authentication pada endpoint dan validasi token sebelum request diproses.

**Status:** `Open`

---

# 30. Kriteria Keamanan Minimum

Proyek Harga Material dinyatakan memenuhi keamanan minimum apabila:

- [x] Authentication diterapkan.
- [x] Authorization diterapkan.
- [x] API tidak dapat diakses tanpa hak akses.
- [x] SQL Injection tidak ditemukan.
- [x] XSS tidak ditemukan.
- [x] IDOR/Broken Access Control tidak ditemukan.
- [x] Input divalidasi di backend.
- [x] Import Excel memiliki validasi.
- [x] Formula injection ditangani.
- [x] Secret tidak berada di frontend.
- [x] HTTPS digunakan pada production.
- [x] Error tidak membocorkan informasi sensitif.
- [x] Foreign key menjaga integritas data.
- [x] Rate limiting diterapkan pada endpoint sensitif.
- [x] Database tidak terbuka secara tidak perlu ke internet.
- [x] Tidak terdapat temuan Critical atau High yang belum diperbaiki.

---

# 31. Alur Security Testing

```text
             Aplikasi Harga Material
                       │
                       ▼
              Authentication Test
                       │
                       ▼
               Authorization Test
                       │
                       ▼
                API Security Test
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
     Input Testing             Access Testing
          │                         │
          ├── SQL Injection         ├── IDOR
          ├── XSS                   ├── Role
          └── Validation            └── Token
          │
          ▼
        Excel Import Testing
          │
          ▼
      Database Security Test
          │
          ▼
      Configuration Testing
          │
          ▼
       Dokumentasi Temuan
          │
          ▼
       Perbaikan Sistem
          │
          ▼
          Retest
```

---

# 32. Catatan Pengujian

Security testing dilakukan hanya pada sistem, server, API, dan data yang memiliki izin untuk diuji.

Pengujian yang berpotensi menyebabkan perubahan atau kerusakan data sebaiknya dilakukan terlebih dahulu pada environment:

```text
Development / Staging
```

Untuk production, prioritaskan pengujian non-destruktif seperti:

- Authentication.
- Authorization.
- Security headers.
- Input validation.
- API access control.
- Token validation.
- Error handling.
- Configuration review.
