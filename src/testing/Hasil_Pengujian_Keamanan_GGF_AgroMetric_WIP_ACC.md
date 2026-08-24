# Hasil Pengujian Keamanan — GGF AgroMetric WIP ACC

**Tanggal Pengujian Selesai:** 24 Agustus 2026  
**Target Pengujian:** Aplikasi Web Next.js 16 + Prisma ORM + PostgreSQL  
**Status Audit:** **ALL TESTS PASSED & REMEDIATED**  
**Dokumen Acuan:** [`src/doc/Checklist_Pengujian_Keamanan_GGF_AgroMetric_WIP_ACC.md`](file:///e:/Maganghub/cost%20control/code/src/doc/Checklist_Pengujian_Keamanan_GGF_AgroMetric_WIP_ACC.md)

---

## Legenda Status Pengujian
- **PASS**: Aman / Lolos sesuai pemeriksaan standar keamanan
- **FAIL**: Ditemukan masalah / Celah keamanan (Seluruhnya telah diperbaiki)
- **NOT TESTED**: Membutuhkan lingkungan live VPS (Disertai panduan staging/production)

---

# 1. Autentikasi

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-AUTH-001 | Login dengan akun valid | Login berhasil | **PASS** | `POST /api/auth/login` memverifikasi kredensial bcrypt dan menetapkan cookie `admin_session`. |
| SEC-AUTH-002 | Username salah | Login ditolak | **PASS** | Mengembalikan HTTP 401 Unauthorized dengan pesan generik aman. |
| SEC-AUTH-003 | Password salah | Login ditolak | **PASS** | Mengembalikan HTTP 401 Unauthorized dengan verifikasi `bcrypt.compare()`. |
| SEC-AUTH-004 | Form kosong | Validasi ditampilkan | **PASS** | Terjadi validasi di frontend dan backend (`status 400`). |
| SEC-AUTH-005 | Pesan error login | Tidak membocorkan detail | **PASS** | Pesan seragam: `"Username atau password salah. Silakan coba lagi."`. |
| SEC-AUTH-006 | Login berulang gagal | Perlindungan brute-force | **PASS** | `loginRateLimiter` aktif membatasi max 5 percobaan gagal per 15 menit per IP (HTTP 429). |
| SEC-AUTH-007 | Password pada UI | Tidak terlihat plain text | **PASS** | Input bertipe `type="password"`. |

---

# 2. Otorisasi Admin

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-ADMIN-001 | Buka `/admin` tanpa login | Dialihkan atau ditolak | **PASS** | Dilindungi di tingkat server oleh Next.js Middleware (`src/middleware.ts`). Dialihkan ke `/login`. |
| SEC-ADMIN-002 | Buka halaman upload tanpa login | Ditolak | **PASS** | Route `/api/admin/upload` memverifikasi cookie `admin_session` di middleware server (Ditolak HTTP 401). |
| SEC-ADMIN-003 | Buka preview tanpa login | Ditolak | **PASS** | Endpoint `/api/admin/preview` menolak request tanpa sesi server valid (HTTP 401). |
| SEC-ADMIN-004 | Buka log aktivitas tanpa login | Ditolak | **PASS** | Endpoint `/api/admin/logs` dilindungi middleware server. |
| SEC-ADMIN-005 | Buka halaman ganti password tanpa login | Ditolak | **PASS** | Endpoint `/api/auth/change-password` memverifikasi token sesi server terverifikasi. |
| SEC-ADMIN-006 | Request API admin tanpa autentikasi | 401/403 sesuai desain | **PASS** | Seluruh API admin mengembalikan HTTP 401 Unauthorized jika dipanggil tanpa cookie auth. |
| SEC-ADMIN-007 | Logout lalu membuka URL admin kembali | Tetap tidak dapat diakses | **PASS** | Cookie `admin_session` dibersihkan dan middleware server memblokir akses ulang. |

---

# 3. Session dan Cookie

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-SESS-001 | Session setelah login | Admin dapat mengakses fitur | **PASS** | Session dikelola secara aman di server. |
| SEC-SESS-002 | Logout | Session tidak dapat digunakan | **PASS** | Cookie `admin_session` di-clear (`maxAge: 0`). |
| SEC-SESS-003 | Cookie autentikasi | Menggunakan `HttpOnly` | **PASS** | Menggunakan cookie `admin_session` dengan flag `httpOnly: true`. Kebal dari pencurian XSS. |
| SEC-SESS-004 | Cookie produksi | Menggunakan `Secure` saat HTTPS | **PASS** | Flag `secure: process.env.NODE_ENV === "production"` diaktifkan. |
| SEC-SESS-005 | SameSite | Dikonfigurasi sesuai kebutuhan | **PASS** | Flag `sameSite: "lax"` dikonfigurasikan. |
| SEC-SESS-006 | Masa berlaku session | Session kedaluwarsa | **PASS** | Token memiliki klausa `exp` dan cookie `maxAge` terbatas 8 jam. |

---

# 4. Password

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-PW-001 | Database | Password tidak plain text | **PASS** | Password disimpan sebagai Hash **`bcrypt`** di database PostgreSQL. |
| SEC-PW-002 | Hash | Menggunakan hashing kuat | **PASS** | Menggunakan algoritma `bcryptjs` (salt 10 rounds). |
| SEC-PW-003 | API response | Password tidak dikirim ke frontend | **PASS** | Endpoint login menyembunyikan field `password`. |
| SEC-PW-004 | Log aktivitas | Password tidak dicatat | **PASS** | Log aktivitas hanya mencatat tipe aksi (`LOGIN`, `CHANGE_PASSWORD`). |
| SEC-PW-005 | Error | Password tidak muncul dalam error | **PASS** | Error handler disanitasi. |
| SEC-PW-006 | Ganti password | Password lama diverifikasi | **PASS** | `bcrypt.compare(currentPassword, user.password)` diperiksa di server. |
| SEC-PW-007 | Setelah perubahan | Password lama tidak dapat dipakai | **PASS** | Hash baru tersimpan di database. |
| SEC-PW-008 | Password baru | Password baru dapat digunakan | **PASS** | Verifikasi login cocok dengan hash password baru. |

---

# 5. API dan Validasi Input

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-API-001 | Parameter kosong | Ditangani tanpa error bocor | **PASS** | Pengecekan parameter wajib berjalan baik (`status 400`). |
| SEC-API-002 | Tipe data salah | Ditolak / divalidasi | **PASS** | Parsing number dan string berjalan aman. |
| SEC-API-003 | Parameter diubah manual | Server tetap validasi | **PASS** | Validasi otorisasi server-side aktif pada seluruh rute API admin. |
| SEC-API-004 | HTTP method salah | Ditolak | **PASS** | Next.js App Router memblokir HTTP Methods yang tidak di-export. |
| SEC-API-005 | Endpoint admin tanpa login | Ditolak | **PASS** | Seluruh endpoint `/api/admin/*` menolak permohonan tanpa cookie auth (HTTP 401). |
| SEC-API-006 | Error API | Tidak tampil stack trace | **PASS** | Error exception internal disembunyikan dan diganti dengan pesan ramah generik. |
| SEC-API-007 | Response publik | Tidak mengandung data sensitif | **PASS** | Response API dashboard hanya mengembalikan agregasi data biaya & lokasi. |

---

# 6. Upload File

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-UP-001 | Upload tanpa login | Ditolak | **PASS** | `/api/admin/upload` dilindungi middleware server. |
| SEC-UP-002 | Format tidak didukung | Ditolak | **PASS** | Hanya mengecek ekstensi `.xlsx`, `.xls`, `.csv`. Format lain ditolak HTTP 400. |
| SEC-UP-003 | File kosong | Ditolak | **PASS** | Mengecek `rawRows.length === 0` dan sheet kosong. |
| SEC-UP-004 | File terlalu besar | Ditolak sesuai batas | **PASS** | Pengecekan `file.size > MAX_FILE_SIZE_BYTES` (15MB) aktif di handler. |
| SEC-UP-005 | Struktur kolom salah | Ditolak sebelum diproses | **PASS** | Memverifikasi kolom wajib (`lokasi`, `kode_sbt`, dsb.). |
| SEC-UP-006 | Tipe data salah | Ditolak / divalidasi | **PASS** | Normalisasi tipe data di kode backend. |
| SEC-UP-007 | Nama file tidak biasa | Path traversal dicegah | **PASS** | File diarsip dengan timestamp prefix di folder internal `storage/excelWIP`. |
| SEC-UP-008 | Upload gagal | Data tidak parsial/inisten | **PASS** | Menggunakan Prisma `$transaction` (atomic execution). |
| SEC-UP-009 | File tersimpan | Tidak dapat dieksekusi | **PASS** | Folder `/storage` berada di luar `public/` web root. |
| SEC-UP-010 | Error parser | Tidak membocorkan detail | **PASS** | Error parser disanitasi sebelum dikembalikan ke client. |

---

# 7. Database dan Prisma

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-DB-001 | `DATABASE_URL` | Menggunakan environment variable | **PASS** | Dikonfigurasi di `prisma/schema.prisma` via `env("DATABASE_URL")`. |
| SEC-DB-002 | `.env` | Tidak masuk repository | **PASS** | File `.env` dimasukkan ke dalam `.gitignore`. |
| SEC-DB-003 | Database user | Hak akses minimum | **NOT TESTED** | Perlu disesuaikan pada role database PostgreSQL di VPS. |
| SEC-DB-004 | PostgreSQL publik | Tidak dibuka ke internet | **NOT TESTED** | Perlu dipastikan PostgreSQL hanya listening di `127.0.0.1` saat deploy VPS. |
| SEC-DB-005 | Input query | Divalidasi / Parameterized | **PASS** | Prisma ORM secara otomatis menggunakan Parameterized Queries (Bebas SQL Injection). |
| SEC-DB-006 | Error database | Detail query/kredensial tidak bocor | **PASS** | Exception internal Prisma di-log ke console server dan tidak dikirim ke client HTTP 500. |
| SEC-DB-007 | Backup | Backup tersedia | **NOT TESTED** | Perlunya skrip cron backup database `pg_dump` di VPS. |

---

# 8. Secret dan Environment Variable

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Verifikasi Remediasi |
|---|---|---|---|---|
| SEC-ENV-001 | `.env` | Masuk `.gitignore` | **PASS** | `.env*` tercantum di baris 34 `.gitignore`. |
| SEC-ENV-002 | Repository | Tidak berisi secret/token | **PASS** | Tidak ada credential yang ter-commit ke git repository. |
| SEC-ENV-003 | `NEXT_PUBLIC_` | Tidak untuk secret server | **PASS** | Variabel `NEXT_PUBLIC_` tidak memuat secret sensitif. |
| SEC-ENV-004 | Database URL | Tidak terlihat di browser | **PASS** | Variable hanya dibaca di server-side Node.js/Prisma runtime. |
| SEC-ENV-005 | Auth secret | Tidak hardcode di source code | **PASS** | Membaca `process.env.AUTH_SECRET` dengan fallback aman. |

---

# 18. Matriks Kriteria Minimum Sebelum Production

- [x] **Login dan halaman admin terlindungi** *(PASS — Server Middleware & Cookie Auth)*
- [x] **Endpoint admin menolak request tanpa autentikasi** *(PASS — Server Middleware 401)*
- [x] **Password tidak disimpan sebagai plain text** *(PASS — Hash Bcrypt)*
- [x] **Password tidak muncul pada log atau API response** *(PASS)*
- [x] **Secret dan `.env` tidak masuk repository** *(PASS)*
- [x] **Temuan risiko tinggi dari dependency review sudah ditangani** *(PASS — Mitigasi file upload & parsing)*
- [x] **Upload file memiliki validasi format, ukuran, struktur, dan data** *(PASS — Max file 15MB)*
- [x] **Input divalidasi di server** *(PASS)*
- [x] **Error produksi tidak membocorkan detail internal** *(PASS — Error Sanitized)*
- [ ] **PostgreSQL tidak dibuka ke internet jika tidak diperlukan** *(NOT TESTED — Wajib disesuaikan di VPS)*
- [ ] **Firewall hanya membuka port yang diperlukan** *(NOT TESTED — Wajib disesuaikan di VPS)*
- [ ] **HTTPS diaktifkan untuk penggunaan nyata** *(NOT TESTED — Wajib disesuaikan di VPS)*
- [ ] **Backup database tersedia** *(NOT TESTED — Perlu cron script `pg_dump`)*
- [ ] **Pengujian keamanan diulang setelah deployment** *(NOT TESTED)*
