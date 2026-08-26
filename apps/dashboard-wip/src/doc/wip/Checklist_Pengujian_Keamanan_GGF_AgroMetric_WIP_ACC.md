# Checklist Pengujian Keamanan — GGF AgroMetric WIP ACC

## Tujuan
Checklist ini digunakan untuk memeriksa keamanan aplikasi Next.js + Prisma + PostgreSQL sebelum dan setelah deployment ke VPS.

> Gunakan hanya pada aplikasi, server, dan environment yang kamu miliki atau memiliki izin untuk diuji.

## Status
- PASS: aman sesuai pemeriksaan
- FAIL: ditemukan masalah
- NOT TESTED: belum diuji
- N/A: tidak berlaku

# 1. Autentikasi

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-AUTH-001 | Login dengan akun valid | Login berhasil | ☐ |
| SEC-AUTH-002 | Username salah | Login ditolak | ☐ |
| SEC-AUTH-003 | Password salah | Login ditolak | ☐ |
| SEC-AUTH-004 | Form kosong | Validasi ditampilkan | ☐ |
| SEC-AUTH-005 | Pesan error login | Tidak membocorkan apakah username atau password yang salah secara detail | ☐ |
| SEC-AUTH-006 | Login berulang gagal | Ada perlindungan pembatasan percobaan sesuai kebutuhan | ☐ |
| SEC-AUTH-007 | Password pada UI | Tidak terlihat sebagai plain text | ☐ |

# 2. Otorisasi Admin

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-ADMIN-001 | Buka `/admin` tanpa login | Dialihkan atau ditolak | ☐ |
| SEC-ADMIN-002 | Buka halaman upload tanpa login | Ditolak | ☐ |
| SEC-ADMIN-003 | Buka preview tanpa login | Ditolak | ☐ |
| SEC-ADMIN-004 | Buka log aktivitas tanpa login | Ditolak | ☐ |
| SEC-ADMIN-005 | Buka halaman ganti password tanpa login | Ditolak | ☐ |
| SEC-ADMIN-006 | Request API admin tanpa autentikasi | 401/403 sesuai desain | ☐ |
| SEC-ADMIN-007 | Logout lalu membuka URL admin kembali | Tetap tidak dapat diakses | ☐ |

# 3. Session dan Cookie

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-SESS-001 | Session setelah login | Admin dapat mengakses fitur yang diizinkan | ☐ |
| SEC-SESS-002 | Logout | Session tidak dapat digunakan kembali | ☐ |
| SEC-SESS-003 | Cookie autentikasi | Menggunakan `HttpOnly` jika sesuai arsitektur | ☐ |
| SEC-SESS-004 | Cookie produksi | Menggunakan `Secure` saat HTTPS | ☐ |
| SEC-SESS-005 | SameSite | Dikonfigurasi sesuai kebutuhan keamanan | ☐ |
| SEC-SESS-006 | Masa berlaku session | Session kedaluwarsa sesuai konfigurasi | ☐ |

# 4. Password

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-PW-001 | Database | Password tidak disimpan plain text | ☐ |
| SEC-PW-002 | Hash | Menggunakan algoritma hash password yang kuat | ☐ |
| SEC-PW-003 | API response | Password tidak pernah dikirim ke frontend | ☐ |
| SEC-PW-004 | Log aktivitas | Password tidak pernah dicatat | ☐ |
| SEC-PW-005 | Error | Password tidak muncul dalam error | ☐ |
| SEC-PW-006 | Ganti password | Password lama diverifikasi sesuai desain | ☐ |
| SEC-PW-007 | Setelah perubahan | Password lama tidak dapat digunakan | ☐ |
| SEC-PW-008 | Password baru | Password baru dapat digunakan | ☐ |

# 5. API dan Validasi Input

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-API-001 | Parameter kosong | Ditangani tanpa error internal bocor | ☐ |
| SEC-API-002 | Tipe data salah | Ditolak/divalidasi | ☐ |
| SEC-API-003 | Parameter diubah manual | Server tetap melakukan validasi | ☐ |
| SEC-API-004 | HTTP method salah | Ditolak | ☐ |
| SEC-API-005 | Endpoint admin tanpa login | Ditolak | ☐ |
| SEC-API-006 | Error API | Tidak menampilkan stack trace produksi | ☐ |
| SEC-API-007 | Response publik | Tidak mengandung data sensitif | ☐ |

# 6. Upload File

Prioritas tinggi karena sistem mengunggah Data Lokasi, Data SBT, dan Data Aktivitas.

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-UP-001 | Upload tanpa login | Ditolak | ☐ |
| SEC-UP-002 | Format tidak didukung | Ditolak | ☐ |
| SEC-UP-003 | File kosong | Ditolak | ☐ |
| SEC-UP-004 | File terlalu besar | Ditolak sesuai batas | ☐ |
| SEC-UP-005 | Struktur kolom salah | Ditolak sebelum diproses | ☐ |
| SEC-UP-006 | Tipe data salah | Ditolak/divalidasi | ☐ |
| SEC-UP-007 | Nama file tidak biasa | Tidak memengaruhi path penyimpanan | ☐ |
| SEC-UP-008 | Upload gagal | Tidak menghasilkan data parsial tidak konsisten | ☐ |
| SEC-UP-009 | File tersimpan | Tidak dapat dieksekusi sebagai program server | ☐ |
| SEC-UP-010 | Error parser | Tidak membocorkan detail internal | ☐ |

# 7. Database dan Prisma

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-DB-001 | `DATABASE_URL` | Menggunakan environment variable | ☐ |
| SEC-DB-002 | `.env` | Tidak masuk repository | ☐ |
| SEC-DB-003 | Database user | Hak akses minimum | ☐ |
| SEC-DB-004 | PostgreSQL publik | Tidak dibuka ke internet jika tidak diperlukan | ☐ |
| SEC-DB-005 | Input query | Tetap divalidasi sebelum diproses | ☐ |
| SEC-DB-006 | Error database | Detail query/kredensial tidak bocor | ☐ |
| SEC-DB-007 | Backup | Backup tersedia | ☐ |

# 8. Secret dan Environment Variable

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-ENV-001 | `.env` | Masuk `.gitignore` | ☐ |
| SEC-ENV-002 | Repository | Tidak berisi password/token/database URL | ☐ |
| SEC-ENV-003 | `NEXT_PUBLIC_` | Tidak digunakan untuk secret server | ☐ |
| SEC-ENV-004 | Database URL | Tidak terlihat di browser | ☐ |
| SEC-ENV-005 | Auth secret | Tidak ditulis langsung di source code | ☐ |

# 9. Dependency

Jalankan:

```bash
npm audit
```

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-DEP-001 | Audit dependency | Tidak ada temuan Critical/High yang diabaikan | ☐ |
| SEC-DEP-002 | Next.js | Menggunakan versi yang mendapatkan pembaruan keamanan | ☐ |
| SEC-DEP-003 | Prisma | Versi diperiksa dan diperbarui sesuai kebutuhan | ☐ |
| SEC-DEP-004 | Package tidak digunakan | Dipertimbangkan untuk dihapus | ☐ |
| SEC-DEP-005 | Lock file | Tersedia dan digunakan | ☐ |

# 10. Next.js

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-NX-001 | Production build | Build berhasil | ☐ |
| SEC-NX-002 | Error produksi | Tidak membocorkan stack trace sensitif | ☐ |
| SEC-NX-003 | Secret | Tidak masuk client bundle | ☐ |
| SEC-NX-004 | Admin route | Dilindungi di server/middleware sesuai desain | ☐ |
| SEC-NX-005 | API method | Hanya method yang diperlukan diterima | ☐ |

# 11. Log Aktivitas

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-LOG-001 | Upload data | User dan waktu tercatat sesuai desain | ☐ |
| SEC-LOG-002 | Ganti password | Aksi tercatat tanpa password | ☐ |
| SEC-LOG-003 | Data sensitif | Tidak masuk log | ☐ |
| SEC-LOG-004 | Akses log | Hanya admin berwenang yang dapat melihat | ☐ |
| SEC-LOG-005 | Integritas log | Tidak dapat diubah pengguna melalui aplikasi | ☐ |

# 12. Error Handling dan Kebocoran Informasi

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-ERR-001 | Error API | Pesan umum dan aman | ☐ |
| SEC-ERR-002 | Error database | Nama tabel/query/kredensial tidak bocor | ☐ |
| SEC-ERR-003 | Stack trace | Tidak tampil ke pengguna produksi | ☐ |
| SEC-ERR-004 | Path server | Tidak bocor | ☐ |
| SEC-ERR-005 | Versi software | Tidak dibocorkan jika tidak diperlukan | ☐ |

# 13. Pengujian VPS Setelah Deployment

## Sistem dan Firewall

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-VPS-001 | Update sistem | Security update diterapkan | ☐ |
| SEC-VPS-002 | Root | Tidak digunakan untuk aktivitas rutin | ☐ |
| SEC-VPS-003 | SSH | Dikonfigurasi aman sesuai kebutuhan | ☐ |
| SEC-VPS-004 | Firewall | Hanya port yang diperlukan dibuka | ☐ |

## Port yang Umumnya Diperiksa

| Port | Kebutuhan Umum |
|---|---|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3000 | Sebaiknya tidak diekspos langsung jika menggunakan Nginx |
| 5432 | Sebaiknya tidak dibuka publik jika PostgreSQL hanya dipakai aplikasi lokal |

## Nginx dan HTTPS

| ID | Pemeriksaan | Hasil Diharapkan | Status |
|---|---|---|---|
| SEC-NGX-001 | Reverse proxy | Port aplikasi internal tidak perlu diekspos langsung | ☐ |
| SEC-NGX-002 | HTTPS | Diaktifkan sebelum penggunaan nyata | ☐ |
| SEC-NGX-003 | HTTP | Dialihkan ke HTTPS sesuai konfigurasi | ☐ |
| SEC-NGX-004 | Upload limit | Dikonfigurasi sesuai kebutuhan | ☐ |

# 14. Tools Pengujian

## Dependency
```bash
npm audit
```

## Database
Gunakan Prisma Studio untuk memeriksa apakah data user, log, dan data aplikasi tersimpan sesuai desain:

```bash
npx prisma studio
```

## API
Gunakan Postman atau Bruno untuk memeriksa:

- endpoint tanpa login,
- request tidak valid,
- response error,
- akses endpoint admin.

## Browser
Gunakan Chrome DevTools untuk memeriksa:

- Network request,
- response API,
- cookie,
- console,
- data sensitif yang mungkin terlihat.

## Automated Scanner
Untuk aplikasi sendiri atau yang memiliki izin pengujian, OWASP ZAP dapat digunakan sebagai pemeriksaan awal. Mulai dari passive/baseline scan pada environment testing.

# 15. Urutan Pengujian

```text
1. Review .env dan secret
        ↓
2. Jalankan npm audit
        ↓
3. Test login
        ↓
4. Test akses admin tanpa login
        ↓
5. Test endpoint API
        ↓
6. Test upload file
        ↓
7. Test password dan session
        ↓
8. Periksa database dan log
        ↓
9. Deploy ke VPS
        ↓
10. Periksa firewall, port, Nginx, HTTPS, PostgreSQL
        ↓
11. Retest aplikasi online
```

# 16. Rekap Temuan

| ID | Area | Temuan | Risiko | Rekomendasi | Status |
|---|---|---|---|---|---|
| SEC-F-001 |  |  |  |  | Open |
| SEC-F-002 |  |  |  |  | Open |
| SEC-F-003 |  |  |  |  | Open |

Risiko:

- Critical
- High
- Medium
- Low

# 17. Template Laporan Temuan

```text
ID Temuan:
Area:
Tanggal:

Deskripsi:

Langkah Reproduksi:
1.
2.
3.

Expected Result:

Actual Result:

Dampak:

Risiko:
Critical / High / Medium / Low

Rekomendasi:

Status:
Open / In Progress / Fixed / Retest / Closed
```

# 18. Kriteria Minimum Sebelum Production

- [ ] Login dan halaman admin terlindungi.
- [ ] Endpoint admin menolak request tanpa autentikasi.
- [ ] Password tidak disimpan sebagai plain text.
- [ ] Password tidak muncul pada log atau API response.
- [ ] Secret dan `.env` tidak masuk repository.
- [ ] Temuan risiko tinggi dari dependency review sudah ditangani.
- [ ] Upload file memiliki validasi format, ukuran, struktur, dan data.
- [ ] Input divalidasi di server.
- [ ] Error produksi tidak membocorkan detail internal.
- [ ] PostgreSQL tidak dibuka ke internet jika tidak diperlukan.
- [ ] Firewall hanya membuka port yang diperlukan.
- [ ] HTTPS diaktifkan untuk penggunaan nyata.
- [ ] Backup database tersedia.
- [ ] Pengujian keamanan diulang setelah deployment.

# 19. Kesimpulan

Checklist ini membantu melakukan pemeriksaan keamanan secara terstruktur, tetapi tidak dapat menjamin aplikasi bebas dari seluruh kerentanan. Untuk sistem WIP ACC, prioritas utama adalah:

```text
Authentication & Authorization
        ↓
Upload File Security
        ↓
API Validation
        ↓
Password & Session
        ↓
Database & Secret Protection
        ↓
Dependency Review
        ↓
VPS / Nginx / PostgreSQL
        ↓
Retest Setelah Perbaikan
```

Temuan dengan risiko Critical atau High sebaiknya diperbaiki dan diuji ulang sebelum sistem digunakan di production.
