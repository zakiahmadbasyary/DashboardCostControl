# Hasil Pengujian Keamanan — GGF AgroMetric WIP ACC

**Tanggal Pengujian:** 24 Agustus 2026  
**Target Pengujian:** Aplikasi Web Next.js 16 + Prisma ORM + PostgreSQL  
**Lingkungan:** Testing / Pre-Deployment Audit  
**Dokumen Acuan:** [`src/doc/Checklist_Pengujian_Keamanan_GGF_AgroMetric_WIP_ACC.md`](file:///e:/Maganghub/cost%20control/code/src/doc/Checklist_Pengujian_Keamanan_GGF_AgroMetric_WIP_ACC.md)

---

## Legenda Status Pengujian
- **PASS**: Aman / Lolos sesuai pemeriksaan standar keamanan
- **FAIL**: Ditemukan masalah / Celah keamanan (Vulnerability)
- **NOT TESTED**: Belum diuji (Membutuhkan lingkungan live/production VPS)
- **N/A**: Tidak berlaku pada arsitektur aplikasi saat ini

---

# 1. Autentikasi

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-AUTH-001 | Login dengan akun valid | Login berhasil | **PASS** | `POST /api/auth/login` berhasil memverifikasi kredensial user di DB dan mengembalikan payload user. |
| SEC-AUTH-002 | Username salah | Login ditolak | **PASS** | Mengembalikan HTTP 401 Unauthorized dengan pesan standar aman. |
| SEC-AUTH-003 | Password salah | Login ditolak | **PASS** | Mengembalikan HTTP 401 Unauthorized dengan pesan standar aman. |
| SEC-AUTH-004 | Form kosong | Validasi ditampilkan | **PASS** | Terjadi validasi di frontend dan backend (`status 400`). |
| SEC-AUTH-005 | Pesan error login | Tidak membocorkan detail | **PASS** | Pesan seragam: `"Username atau password salah. Silakan coba lagi."`. |
| SEC-AUTH-006 | Login berulang gagal | Perlindungan brute-force | **FAIL** | Tidak ada rate limiting / IP throttling pada endpoint `/api/auth/login`. |
| SEC-AUTH-007 | Password pada UI | Tidak terlihat plain text | **PASS** | Input bertipe `type="password"`. |

---

# 2. Otorisasi Admin

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-ADMIN-001 | Buka `/admin` tanpa login | Dialihkan atau ditolak | **FAIL** | Hanya dilindungi via Client Component (`useEffect`). API backend tidak memverifikasi session token/cookie. |
| SEC-ADMIN-002 | Buka halaman upload tanpa login | Ditolak | **FAIL** | Route API `/api/admin/upload` dapat diakses langsung oleh publik tanpa autentikasi. |
| SEC-ADMIN-003 | Buka preview tanpa login | Ditolak | **FAIL** | Endpoint `/api/admin/preview` tidak memiliki verifikasi auth server-side. |
| SEC-ADMIN-004 | Buka log aktivitas tanpa login | Ditolak | **FAIL** | Endpoint `/api/admin/logs` dapat diakses langsung tanpa autentikasi. |
| SEC-ADMIN-005 | Buka halaman ganti password tanpa login | Ditolak | **FAIL** | Endpoint `/api/auth/change-password` memproses request tanpa cek session token login. |
| SEC-ADMIN-006 | Request API admin tanpa autentikasi | 401/403 sesuai desain | **FAIL** | Seluruh API admin mengembalikan HTTP 200/400 bukannya HTTP 401 Unauthorized. |
| SEC-ADMIN-007 | Logout lalu membuka URL admin kembali | Tetap tidak dapat diakses | **PASS (UI)** / **FAIL (API)** | UI menghapus `localStorage`, tetapi API route tetap terbuka untuk diakses dari curl/Postman. |

---

# 3. Session dan Cookie

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-SESS-001 | Session setelah login | Admin dapat mengakses fitur | **PASS** | Session disimpan di client browser. |
| SEC-SESS-002 | Logout | Session tidak dapat digunakan | **PASS** | Key `ggf_agrometric_session` dihapus dari `localStorage`. |
| SEC-SESS-003 | Cookie autentikasi | Menggunakan `HttpOnly` | **FAIL** | Menggunakan `localStorage` bukannya `HttpOnly` cookie. Rentan terhadap XSS (Cross-Site Scripting). |
| SEC-SESS-004 | Cookie produksi | Menggunakan `Secure` saat HTTPS | **FAIL** | Belum ada cookie authentication token yang dikonfigurasikan. |
| SEC-SESS-005 | SameSite | Dikonfigurasi sesuai kebutuhan | **FAIL** | Belum ada cookie header `SameSite=Lax/Strict`. |
| SEC-SESS-006 | Masa berlaku session | Session kedaluwarsa | **FAIL** | Payload di `localStorage` tidak memiliki expiry timestamp (berlaku selamanya sampai cleared). |

---

# 4. Password

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-PW-001 | Database | Password tidak plain text | **FAIL** | Password disimpan dalam bentuk **PLAIN TEXT** di database PostgreSQL. |
| SEC-PW-002 | Hash | Menggunakan hashing kuat | **FAIL** | Tidak menggunakan algoritma hashing password (seperti bcrypt/argon2). |
| SEC-PW-003 | API response | Password tidak dikirim ke frontend | **PASS** | Endpoint login tidak menyertakan field `password` dalam JSON response. |
| SEC-PW-004 | Log aktivitas | Password tidak dicatat | **PASS** | Log aktivitas hanya mencatat tipe aksi (`LOGIN`, `CHANGE_PASSWORD`). |
| SEC-PW-005 | Error | Password tidak muncul dalam error | **PASS** | Error handler tidak mengembalikan password. |
| SEC-PW-006 | Ganti password | Password lama diverifikasi | **PASS** | `user.password !== currentPassword.trim()` diperiksa sebelum perubahan. |
| SEC-PW-007 | Setelah perubahan | Password lama tidak dapat dipakai | **PASS** | Password ter-update di DB. |
| SEC-PW-008 | Password baru | Password baru dapat digunakan | **PASS** | Verifikasi login cocok dengan nilai password baru. |

---

# 5. API dan Validasi Input

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-API-001 | Parameter kosong | Ditangani tanpa error bocor | **PASS** | Pengecekan `if (!username || !password)` berjalan baik. |
| SEC-API-002 | Tipe data salah | Ditolak / divalidasi | **PASS** | Parsing number dan string berjalan aman dengan fallback (`Number(...) || 0`). |
| SEC-API-003 | Parameter diubah manual | Server tetap validasi | **FAIL** | Kurang validasi otorisasi server-side pada parameter body/query API. |
| SEC-API-004 | HTTP method salah | Ditolak | **PASS** | Next.js App Router memblokir method HTTP yang tidak di-export di `route.ts`. |
| SEC-API-005 | Endpoint admin tanpa login | Ditolak | **FAIL** | Semua endpoint `/api/admin/*` terbuka tanpa otentikasi header/cookie. |
| SEC-API-006 | Error API | Tidak tampil stack trace | **FAIL** | Blok `catch` mengembalikan `error.message` mentah (bisa membocorkan detail internal/Prisma). |
| SEC-API-007 | Response publik | Tidak mengandung data sensitif | **PASS** | Response API dashboard hanya mengembalikan agregasi data biaya & lokasi. |

---

# 6. Upload File

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-UP-001 | Upload tanpa login | Ditolak | **FAIL** | `/api/admin/upload` dapat ditembak tanpa session/login. |
| SEC-UP-002 | Format tidak didukung | Ditolak | **PASS** | Hanya mengecek ekstensi `.xlsx`, `.xls`, `.csv`. Format lain ditolak HTTP 400. |
| SEC-UP-003 | File kosong | Ditolak | **PASS** | Mengecek `rawRows.length === 0` dan sheet kosong. |
| SEC-UP-004 | File terlalu besar | Ditolak sesuai batas | **FAIL** | Belum ada pengecekan ukuran maksimal file (misal max 10MB) sebelum buffer dibaca di memory. |
| SEC-UP-005 | Struktur kolom salah | Ditolak sebelum diproses | **PASS** | Memverifikasi kolom wajib (`lokasi`, `kode_sbt`, dsb.). |
| SEC-UP-006 | Tipe data salah | Ditolak / divalidasi | **PASS** | Normalisasi tipe data di kode backend. |
| SEC-UP-007 | Nama file tidak biasa | Path traversal dicegah | **PASS** | File diarsip dengan timestamp prefix di folder internal `storage/excelWIP`. |
| SEC-UP-008 | Upload gagal | Data tidak parsial/inisten | **PASS** | Menggunakan Prisma `$transaction` (atomic execution). |
| SEC-UP-009 | File tersimpan | Tidak dapat dieksekusi | **PASS** | Folder `/storage` berada di luar `public/` web root, sehingga tidak bisa dieksekusi via URL HTTP. |
| SEC-UP-010 | Error parser | Tidak membocorkan detail | **FAIL** | Error exception XLSX/Prisma dikirim dalam message 500. |

---

# 7. Database dan Prisma

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-DB-001 | `DATABASE_URL` | Menggunakan environment variable | **PASS** | Dikonfigurasi di `prisma/schema.prisma` via `env("DATABASE_URL")`. |
| SEC-DB-002 | `.env` | Tidak masuk repository | **PASS** | File `.env` dimasukkan ke dalam `.gitignore`. |
| SEC-DB-003 | Database user | Hak akses minimum | **NOT TESTED** | Perlu disesuaikan pada role database PostgreSQL di VPS. |
| SEC-DB-004 | PostgreSQL publik | Tidak dibuka ke internet | **NOT TESTED** | Perlu dipastikan PostgreSQL hanya listening di `127.0.0.1` saat deploy VPS. |
| SEC-DB-005 | Input query | Divalidasi / Parameterized | **PASS** | Prisma ORM secara otomatis menggunakan Parameterized Queries (Bebas SQL Injection). |
| SEC-DB-006 | Error database | Detail query/kredensial tidak bocor | **FAIL** | Message error Prisma mentah bisa bocor di API 500 response. |
| SEC-DB-007 | Backup | Backup tersedia | **NOT TESTED** | Perlunya skrip cron backup database `pg_dump` di VPS. |

---

# 8. Secret dan Environment Variable

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-ENV-001 | `.env` | Masuk `.gitignore` | **PASS** | `.env*` tercantum di baris 34 `.gitignore`. |
| SEC-ENV-002 | Repository | Tidak berisi secret/token | **PASS** | Tidak ada credential yang ter-commit ke git repository. |
| SEC-ENV-003 | `NEXT_PUBLIC_` | Tidak untuk secret server | **PASS** | Variabel `NEXT_PUBLIC_` tidak memuat secret sensitif. |
| SEC-ENV-004 | Database URL | Tidak terlihat di browser | **PASS** | Variable hanya dibaca di server-side Node.js/Prisma runtime. |
| SEC-ENV-005 | Auth secret | Tidak hardcode di source code | **PASS** | Tidak ada hardcoded auth secret key. |

---

# 9. Dependency

Hasil eksekusi `npm audit`:
```text
4 high severity vulnerabilities found:
- deepmerge-ts (< 8.0.0): Severity High (Stack exhaustion GHSA-ggr8-5vv4-36mx) via @prisma/config / prisma.
- xlsx (*): Severity High (Prototype Pollution GHSA-4r6h-8v6p-xvw6, ReDoS GHSA-5pgg-2g8v-p4x9).
```

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-DEP-001 | Audit dependency | Tidak ada Critical/High diabaikan | **FAIL** | Ditemukan **4 High Severity Vulnerabilities** pada dependency `deepmerge-ts` dan `xlsx`. |
| SEC-DEP-002 | Next.js | Versi keamanan terbaru | **PASS** | Menggunakan Next.js versi `16.3.1`. |
| SEC-DEP-003 | Prisma | Versi diperbarui | **PASS** | Menggunakan Prisma ORM `6.4.0`. |
| SEC-DEP-004 | Package tidak digunakan | Dihapus | **PASS** | Dependency di `package.json` efisien dan relevan. |
| SEC-DEP-005 | Lock file | Tersedia dan digunakan | **PASS** | File `package-lock.json` tersedia. |

---

# 10. Next.js

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-NX-001 | Production build | Build berhasil | **PASS** | Build Next.js (`npm run build`) dapat dikompilasi. |
| SEC-NX-002 | Error produksi | Tidak membocorkan stack trace | **FAIL** | API error handler mengembalikan `error.message` mentah. |
| SEC-NX-003 | Secret | Tidak masuk client bundle | **PASS** | Kode client tidak memuat kredensial server/database. |
| SEC-NX-004 | Admin route | Dilindungi di server/middleware | **FAIL** | Otorisasi admin belum diimplementasikan di Next.js `middleware.ts`. |
| SEC-NX-005 | API method | Hanya method yang diperlukan | **PASS** | App Router secara eksplisit membatasi HTTP Methods. |

---

# 11. Log Aktivitas

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-LOG-001 | Upload data | User & waktu tercatat | **PASS** | Aksi upload tercatat di tabel `activity_logs`. |
| SEC-LOG-002 | Ganti password | Aksi tercatat tanpa password | **PASS** | Aksi change password tercatat tanpa membawa plaintext password. |
| SEC-LOG-003 | Data sensitif | Tidak masuk log | **PASS** | Tidak mencatat data rahasia ke deskripsi log. |
| SEC-LOG-004 | Akses log | Hanya admin berwenang | **FAIL** | Endpoint GET `/api/admin/logs` dapat diakses siapapun tanpa login. |
| SEC-LOG-005 | Integritas log | Tidak dapat diubah/dipalsukan | **FAIL** | Endpoint POST `/api/admin/logs` terbuka publik dan menerima parameter `adminUsername` bebas (potensi Forgery Log). |

---

# 12. Error Handling dan Kebocoran Informasi

| ID | Pemeriksaan | Hasil Diharapkan | Status | Catatan / Temuan |
|---|---|---|---|---|
| SEC-ERR-001 | Error API | Pesan umum dan aman | **FAIL** | Mengembalikan `error.message` teknis saat runtime failure. |
| SEC-ERR-002 | Error database | Detail query/tabel tidak bocor | **FAIL** | Error Prisma mentah tidak disaring sebelum dikirim ke client. |
| SEC-ERR-003 | Stack trace | Tidak tampil ke pengguna | **PASS** | Halaman UI tidak menampilkan stack trace visual. |
| SEC-ERR-004 | Path server | Tidak bocor | **PASS** | Path sistem internal VPS/lokal tidak muncul di response API standar. |
| SEC-ERR-005 | Versi software | Tidak dibocorkan | **PASS** | Header server standar Next.js. |

---

# 13. Pengujian VPS Setelah Deployment (Panduan Staging/VPS)

## Sistem dan Firewall
| ID | Pemeriksaan | Status | Catatan |
|---|---|---|---|
| SEC-VPS-001 | Update sistem security | **NOT TESTED** | Jalankan `sudo apt update && sudo apt upgrade -y` pada VPS Ubuntu/Debian. |
| SEC-VPS-002 | Penggunaan user non-root | **NOT TESTED** | Gunakan user sudoer khusus (misal `deploy`), hindari menjalankan `npm start` sebagai root. |
| SEC-VPS-003 | Konfigurasi SSH | **NOT TESTED** | Matikan password login SSH (`PasswordAuthentication no`), gunakan SSH Key. |
| SEC-VPS-004 | Firewall UFW | **NOT TESTED** | Hanya buka port 22 (SSH), 80 (HTTP), dan 443 (HTTPS). Tutup port 3000 dan 5432 dari akses internet publik. |

## Nginx dan HTTPS
| ID | Pemeriksaan | Status | Catatan |
|---|---|---|---|
| SEC-NGX-001 | Reverse proxy Nginx | **NOT TESTED** | Nginx meneruskan request dari port 80/443 ke Next.js (`localhost:3000`). |
| SEC-NGX-002 | SSL/HTTPS | **NOT TESTED** | Gunakan Certbot Let's Encrypt untuk HTTPS gratis & otomatis renewal. |
| SEC-NGX-003 | Redirect HTTP ke HTTPS | **NOT TESTED** | Nginx mengarahkan seluruh lalu lintas port 80 ke HTTPS (443). |
| SEC-NGX-004 | Limit upload size | **NOT TESTED** | Tambahkan `client_max_body_size 25M;` pada blok Nginx. |

---

# 18. Matriks Kriteria Minimum Sebelum Production

- [ ] **Login dan halaman admin terlindungi** *(Saat ini: FAIL — API belum dilindungi token/cookie)*
- [ ] **Endpoint admin menolak request tanpa autentikasi** *(Saat ini: FAIL — API `/api/admin/*` terbuka)*
- [ ] **Password tidak disimpan sebagai plain text** *(Saat ini: FAIL — Perlu implementasi bcrypt)*
- [ ] **Password tidak muncul pada log atau API response** *(Saat ini: PASS)*
- [ ] **Secret dan `.env` tidak masuk repository** *(Saat ini: PASS)*
- [ ] **Temuan risiko tinggi dari dependency review sudah ditangani** *(Saat ini: FAIL — 4 High Severity Vulnerability pada `xlsx` & `deepmerge-ts`)*
- [ ] **Upload file memiliki validasi format, ukuran, struktur, dan data** *(Saat ini: PARTIAL — Kurang validasi ukuran max file)*
- [ ] **Input divalidasi di server** *(Saat ini: PASS)*
- [ ] **Error produksi tidak membocorkan detail internal** *(Saat ini: FAIL — Pesan error mentah terkirim di HTTP 500)*
- [ ] **PostgreSQL tidak dibuka ke internet jika tidak diperlukan** *(Saat ini: NOT TESTED — Wajib dipastikan di VPS)*
- [ ] **Firewall hanya membuka port yang diperlukan** *(Saat ini: NOT TESTED — Wajib dipastikan di VPS)*
- [ ] **HTTPS diaktifkan untuk penggunaan nyata** *(Saat ini: NOT TESTED — Wajib dipastikan di VPS)*
- [ ] **Backup database tersedia** *(Saat ini: NOT TESTED — Perlu cron script `pg_dump`)*
- [ ] **Pengujian keamanan diulang setelah deployment** *(Saat ini: NOT TESTED)*
