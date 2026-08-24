# Laporan Temuan Keamanan dan Rekomendasi Perbaikan

**Aplikasi:** GGF AgroMetric WIP ACC  
**Tanggal:** 24 Agustus 2026  
**Dokumen Pendamping:** [`src/testing/Hasil_Pengujian_Keamanan_GGF_AgroMetric_WIP_ACC.md`](file:///e:/Maganghub/cost%20control/code/src/testing/Hasil_Pengujian_Keamanan_GGF_AgroMetric_WIP_ACC.md)

---

## 1. Rekapitulasi Daftar Temuan (Security Finding Log)

| ID Temuan | Area | Deskripsi Temuan | Tingkat Risiko | Status |
|---|---|---|---|---|
| **SEC-F-001** | Password & Database | Password admin disimpan sebagai **Plain Text** tanpa Hashing di database PostgreSQL | **CRITICAL** | Open |
| **SEC-F-002** | Otorisasi & API | Endpoint API Admin (`/api/admin/*`, `/api/auth/change-password`) tidak memverifikasi Session/Cookie server-side | **HIGH** | Open |
| **SEC-F-003** | Session & Auth | Sesi admin menggunakan `localStorage` tanpa cookie `HttpOnly` / `Secure` dan tanpa Expiration | **HIGH** | Open |
| **SEC-F-004** | Log & Integritas | Endpoint Log Aktivitas (`POST /api/admin/logs`) terbuka publik dan mengizinkan pemalsuan log (`Log Forgery`) | **HIGH** | Open |
| **SEC-F-005** | Dependency Vulnerability | Ditemukan 4 High Severity Vulnerabilities pada `xlsx` (Prototype Pollution & ReDoS) dan `deepmerge-ts` | **HIGH** | Open |
| **SEC-F-006** | Autentikasi | Tidak ada perlindungan pembatasan percobaan login (**Rate Limiting / Brute-Force Throttling**) | **MEDIUM** | Open |
| **SEC-F-007** | Upload File | Tidak ada batas ukuran file upload (**File Size Limit**) sebelum diproses ke memori buffer | **MEDIUM** | Open |
| **SEC-F-008** | Error Handling | Error API/Prisma mengembalikan pesan exception teknis mentah pada response HTTP 500 | **MEDIUM** | Open |

---

## 2. Rincian Laporan Temuan dan Panduan Remediasi

---

### ID Temuan: SEC-F-001
- **Area:** Password & Database Security  
- **Tingkat Risiko:** **CRITICAL**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Password user admin disimpan dalam bentuk *Plain Text* di tabel `users` database PostgreSQL. Di kode `/api/auth/login` dan `/api/auth/change-password`, pencocokan password dilakukan dengan pembandingan langsung `password === inputPassword`. Jika database berhasil diakses peretas (via leak atau backup file), seluruh kata sandi admin akan langsung terekspos tanpa hambatan.

#### Langkah Reproduksi:
1. Jalankan `npx prisma studio` atau buka database PostgreSQL.
2. Buka tabel `users`.
3. Perhatikan kolom `password` yang menampilkan teks biasa (misal: `admin123`).

#### Dampak:
Kebocoran database berujung pada kompromi total akun admin tanpa perlu melakukan brute force atau cracking hash.

#### Rekomendasi Perbaikan:
1. Install package hashing password standar seperti `bcryptjs` atau `argon2`:
   ```bash
   npm install bcryptjs
   npm install --save-dev @types/bcryptjs
   ```
2. Saat membuat user atau mengubah password (`/api/auth/change-password`), hash password terlebih dahulu:
   ```ts
   import bcrypt from "bcryptjs";
   const hashedPassword = await bcrypt.hash(newPassword, 10);
   await prisma.user.update({
     where: { id: user.id },
     data: { password: hashedPassword },
   });
   ```
3. Saat login (`/api/auth/login`), gunakan `bcrypt.compare`:
   ```ts
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
     return NextResponse.json({ success: false, message: "Username atau password salah." }, { status: 401 });
   }
   ```

---

### ID Temuan: SEC-F-002
- **Area:** Otorisasi & Server-Side API Security  
- **Tingkat Risiko:** **HIGH**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Perlindungan halaman admin saat ini hanya berbasis React Client-Side di `src/app/admin/layout.tsx` yang mengecek `authService.isAuthenticated()` dari `localStorage`. Seluruh route backend seperti `/api/admin/upload`, `/api/admin/reset`, `/api/admin/preview`, `/api/admin/logs`, dan `/api/auth/change-password` **TIDAK MEMILIKI VERIFIKASI TOKEN / SESSION DI SERVER**. Penyerang dapat langsung mengirim request HTTP (via curl/Postman) ke `/api/admin/reset` atau `/api/admin/upload` untuk menghapus atau mengganti data tanpa perlu login.

#### Langkah Reproduksi:
1. Tanpa melakukan login di browser, buka terminal atau Postman.
2. Kirim request HTTP POST ke `http://localhost:3000/api/admin/reset` dengan body `{"category": "lokasi"}`.
3. API mengembalikan HTTP 200 OK dan mengosongkan tabel `lokasi` di database PostgreSQL.

#### Dampak:
Penyerang tanpa hak akses dapat menghapus seluruh data produksi (*Data Wipeout*) atau melakukan pengunggahan data palsu (*Unauthorized Data Override*).

#### Rekomendasi Perbaikan:
1. Buat sistem session berbasis **Encrypted HTTP-Only Cookie** (atau JWT Cookie) yang diset oleh server saat login.
2. Buat Next.js Middleware (`src/middleware.ts`) atau Helper `verifyAdminSession(request)` untuk memeriksa validitas cookie token di setiap endpoint `/api/admin/*`:
   ```ts
   // src/middleware.ts
   import { NextResponse } from "next/server";
   import type { NextRequest } from "next/server";

   export function middleware(request: NextRequest) {
     const token = request.cookies.get("admin_session")?.value;
     if (!token && request.nextUrl.pathname.startsWith("/api/admin")) {
       return NextResponse.json({ success: false, message: "Akses ditolak: Autentikasi diperlukan." }, { status: 401 });
     }
     return NextResponse.next();
   }

   export const config = {
     matcher: ["/admin/:path*", "/api/admin/:path*"],
   };
   ```

---

### ID Temuan: SEC-F-003
- **Area:** Session & Storage Management  
- **Tingkat Risiko:** **HIGH**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Session admin disimpan dalam `localStorage` browser dengan nama key `ggf_agrometric_session`. `localStorage` dapat dibaca oleh skrip JavaScript pihak ketiga jika terjadi celah Cross-Site Scripting (XSS). Selain itu, data sesi tidak memiliki waktu kadaluwarsa (Expiration), sehingga sesi akan aktif selamanya di komputer pengguna sampai di-logout secara manual.

#### Langkah Reproduksi:
1. Login sebagai admin.
2. Buka DevTools -> Application -> Local Storage.
3. Perhatikan objek `ggf_agrometric_session` tersimpan sebagai JSON string biasa yang dapat dibaca oleh `document.cookie` / JS snippet.

#### Dampak:
Peretasan sesi (*Session Hijacking*) melalui skrip XSS atau pencurian token dari browser cache.

#### Rekomendasi Perbaikan:
1. Pindahkan penyimpanan sesi dari `localStorage` ke **Cookie Server-Side** bertipe `HttpOnly`, `Secure` (pada HTTPS), dan `SameSite=Lax`.
2. Saat login berhasil di `/api/auth/login`, tambahkan header `Set-Cookie`:
   ```ts
   response.cookies.set("admin_session", sessionToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     maxAge: 60 * 60 * 8, // 8 jam
     path: "/",
   });
   ```

---

### ID Temuan: SEC-F-004
- **Area:** Log Integrity & Activity Auditing  
- **Tingkat Risiko:** **HIGH**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Endpoint `POST /api/admin/logs` terbuka publik dan menerima parameter body seperti `{ action, dataSource, fileName, description, adminUsername }`. Pengguna mana pun dapat mengirimkan payload palsu untuk memanipulasi riwayat log aktivitas (*Log Forgery*) atau menyamar sebagai pengguna lain.

#### Langkah Reproduksi:
1. Kirim request HTTP POST ke `http://localhost:3000/api/admin/logs` dengan JSON:
   ```json
   {
     "adminUsername": "admin",
     "action": "DELETE_ALL_DATA",
     "description": "Log palsu dari penyerang"
   }
   ```
2. API menerima dan menambahkan entri palsu tersebut ke dalam database audit log.

#### Dampak:
Kehilangan integritas bukti audit (Non-repudiation & Audit Trail Failure). Penyerang dapat menutupi jejak kejahatan dengan memasukkan log palsu.

#### Rekomendasi Perbaikan:
1. Batasi penulisan log hanya dari fungsi internal server (misal saat aksi upload/reset terjadi di route handler).
2. Jika `POST /api/admin/logs` tetap dibutuhkan, lindungi dengan middleware autentikasi ketat dan ambil `adminUsername` dari sesi server yang terverifikasi, bukan dari body JSON client.

---

### ID Temuan: SEC-F-005
- **Area:** Dependency Vulnerabilities  
- **Tingkat Risiko:** **HIGH**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Hasil pengujian otomatis `npm audit` menunjukkan 4 kerentanan tingkat **High**:
1. **`deepmerge-ts` (< 8.0.0)**: Stack exhaustion saat penggabungan grafik objek rekursif (GHSA-ggr8-5vv4-36mx) via `@prisma/config`.
2. **`xlsx` (semua versi)**: Ditemukan celah *Prototype Pollution* (GHSA-4r6h-8v6p-xvw6) dan *ReDoS* (GHSA-5pgg-2g8v-p4x9).

#### Langkah Reproduksi:
1. Jalankan perintah `npm audit` pada terminal project.
2. Amati 4 temuan High Severity pada modul `xlsx` dan `deepmerge-ts`.

#### Dampak:
Potensi serangan *Denial of Service (DoS)* saat memproses file Excel yang sengaja dibuat jahat (*Malicious Excel Payload*) atau pencemaran prototype JavaScript (*Prototype Pollution*).

#### Rekomendasi Perbaikan:
1. Perbarui Prisma ke versi stabil yang memperbaiki `deepmerge-ts`:
   ```bash
   npm audit fix
   ```
2. Untuk paket `xlsx` (SheetJS), batasi atau validasi file input sebelum diproses, atau pertimbangkan migrasi ke library parsing Excel yang lebih aman dan terawat aktif seperti `exceljs` atau `read-excel-file`.

---

### ID Temuan: SEC-F-006
- **Area:** Authentication Rate-Limiting  
- **Tingkat Risiko:** **MEDIUM**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Endpoint `/api/auth/login` tidak dilengkapi mekanis pembatasan percobaan percobaan kata sandi (*Rate Limiting*). Penyerang dapat melakukan percobaan login ribuan kali per menit menggunakan teknik *Brute-Force Attack* atau *Credential Stuffing*.

#### Dampak:
Potensi pengambilan alih akun admin melalui tebakan kata sandi berulang.

#### Rekomendasi Perbaikan:
Gunakan pustaka rate limiter seperti `upstash/ratelimit`, `express-rate-limit`, atau implementasikan middleware pembatas IP sederhana di Next.js middleware (misal maksimal 5 percobaan login gagal per 15 menit per IP).

---

### ID Temuan: SEC-F-007
- **Area:** File Upload Validation & Resource Exhaustion  
- **Tingkat Risiko:** **MEDIUM**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Pada `/api/admin/upload`, file dibaca sepenuhnya ke dalam memori RAM menggunakan `await file.arrayBuffer()` sebelum diperiksa ukurannya. Jika pengguna mengunggah file spreadsheet berukuran ratusan Megabyte, server Node.js dapat mengalami *Memory Exhaustion* (Out of Memory Crash / DoS).

#### Rekomendasi Perbaikan:
Tambahkan pengecekan ukuran maksimal file di awal handler:
```ts
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json({ success: false, message: "Ukuran file melebihi batas maksimal (15MB)." }, { status: 400 });
}
```

---

### ID Temuan: SEC-F-008
- **Area:** Information Disclosure & Error Handling  
- **Tingkat Risiko:** **MEDIUM**  
- **Tanggal:** 24 Agustus 2026  

#### Deskripsi:
Dalam blok `catch (error)` di beberapa route API (`/api/admin/upload`, `/api/admin/reset`, `/api/admin/preview`, `/api/auth/login`), error message teknis langsung dikembalikan ke client: `message = error.message`. Jika terjadi error database Prisma, pesan tersebut dapat membocorkan nama tabel, kolom, atau struktur internal database.

#### Rekomendasi Perbaikan:
1. Log error teknis secara internal ke server console (`console.error`).
2. Kembalikan pesan yang aman dan umum ke pengguna pada mode produksi:
```ts
console.error("Internal Server Error:", error);
return NextResponse.json(
  { success: false, message: "Terjadi kesalahan internal pada server. Silakan coba lagi nanti." },
  { status: 500 }
);
```
