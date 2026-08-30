# Prompt Implementasi SSO Aman — Admin Pusat ke Dashboard Admin

Saya ingin mengimplementasikan SSO yang aman antara Admin Pusat dan masing-masing Dashboard Admin pada project monorepo Next.js.

## Aturan Awal

**JANGAN LANGSUNG MENGUBAH KODE.**

Pertama analisis struktur authentication yang sudah ada, lalu implementasikan perubahan. Jangan membuat sistem authentication baru jika mekanisme existing masih dapat digunakan.

## Konteks Project

- `apps/admin` — Admin Pusat
- `apps/dashboard-wip` — Dashboard WIP ACC
- `apps/dashboard-a` — Dashboard WIP PG1
- `apps/dashboard-b` — Dashboard HPP PG1
- `apps/dashboard-c` — Dashboard HPP M3
- `packages/shared-ui` — shared UI/config

Admin Pusat memiliki:
- `adminUser`
- `adminSession`
- `adminActivityLog`
- `dashboard`
- `userDashboardAccess`

Login:
`apps/admin/src/app/api/auth/login/route.ts`

Verify:
`apps/admin/src/app/api/auth/verify/route.ts`

Cookie Admin Pusat:
`admin_central_session`

Dashboard WIP memiliki:
`apps/dashboard-wip/src/middleware.ts`

dan:
`apps/dashboard-wip/src/lib/auth.ts`

Cookie session lokal WIP:
`admin_session`

## Masalah

Routing tombol **Kelola Dashboard** sudah menggunakan `dash.adminUrl`, tetapi ketika user berpindah dari Admin Pusat ke dashboard admin, user diminta login lagi.

Penyebabnya: cookie Admin Pusat berada pada domain Admin Pusat dan tidak otomatis tersedia pada subdomain dashboard.

Tujuan:

> User yang sudah login di Admin Pusat dapat membuka Admin Dashboard yang memang menjadi hak aksesnya tanpa login ulang.

## Arsitektur SSO yang Diinginkan

Jangan mengirim session token utama Admin Pusat melalui URL.

**DILARANG:**

```text
/admin?sso_token=<ADMIN_SESSION_TOKEN>
```

Gunakan **one-time SSO handoff token**.

Flow:

```text
Admin Pusat
    |
    | user sudah login
    |
    | klik "Kelola Dashboard"
    v
Admin Pusat membuat one-time SSO handoff token
    |
    v
redirect ke:
https://wipcoscontrol.estatepg1.online/admin?sso=<ONE_TIME_TOKEN>
    |
    v
Dashboard middleware membaca token sementara
    |
    v
token ditukar ke Admin Pusat
    |
    v
Dashboard membuat session lokal
    |
    v
redirect ke /admin
    |
    v
URL bersih tanpa query token
```

## Keamanan Wajib

### Token

1. Handoff token harus berbeda dari Admin Session.
2. Gunakan cryptographically secure random token seperti `crypto.randomBytes` atau mekanisme setara.
3. Token hanya boleh digunakan satu kali.
4. Token berlaku singkat, rekomendasi 60 detik.
5. Simpan token server-side.
6. Sebaiknya simpan **hash token**, bukan raw token.
7. Raw token hanya dikirim sekali ke browser.
8. Jangan simpan token di `localStorage` atau `sessionStorage`.
9. Jangan menggunakan session token utama sebagai handoff token.
10. Setelah berhasil digunakan, token harus langsung ditandai `usedAt` atau dihapus.

### Binding dan Authorization

Token harus terikat dengan:
- `userId`
- dashboard tujuan
- expiry

Saat exchange:
- token harus valid;
- belum digunakan;
- belum expired;
- dashboard tujuan harus cocok;
- user harus masih `ACTIVE`;
- user harus masih memiliki akses dashboard;
- `SUPER_ADMIN` boleh mengakses semua dashboard.

Validasi authorization harus dilakukan kembali saat exchange.

Jika akses user dicabut setelah token dibuat tetapi sebelum exchange, exchange harus gagal.

Jika session Admin Pusat sudah expired/revoked, SSO harus gagal.

### Jangan Bocorkan Token

Jangan pernah:
- log raw SSO token;
- log admin session token;
- memasukkan token ke audit log;
- memasukkan token ke error response;
- menyimpan token di localStorage/sessionStorage.

Gunakan pesan umum seperti:

```text
SSO token tidak valid atau telah kedaluwarsa.
```

## Cookie

Session lokal dashboard tetap menggunakan mekanisme existing.

Jika sesuai, gunakan:
- `createSessionToken()`
- `attachSessionCookie()`

Cookie production harus:
- `HttpOnly`
- `Secure`
- `SameSite=Lax` atau konfigurasi yang sesuai
- `Path=/`

Jangan memperluas cookie authentication menjadi:

```text
Domain=.estatepg1.online
```

kecuali setelah analisis keamanan yang jelas. Jangan membuat cookie authentication global untuk seluruh subdomain.

## Database

Periksa Prisma schema terlebih dahulu.

Jika diperlukan, tambahkan model khusus, misalnya:

```text
AdminSsoToken
```

dengan konsep:

```text
id
tokenHash
userId
dashboardId
expiresAt
usedAt
createdAt
```

Nama model/field boleh mengikuti konvensi project.

Jangan menyimpan raw token.

Jangan mengubah `adminSession` secara tidak perlu.

Jika membuat migration:
1. Update schema.
2. Generate Prisma client.
3. Buat migration.
4. Pastikan aman untuk production.
5. Jangan destructive migration.
6. Jangan menghapus data existing.
7. Jangan menjalankan `prisma migrate reset`.
8. Jangan menggunakan `db push` sebagai pengganti migration production jika project menggunakan migration.

## Endpoint Admin Pusat — Create SSO

Buat endpoint khusus, misalnya:

```text
POST /api/auth/sso/create
```

Endpoint harus:
1. Memastikan user sudah authenticated.
2. Mengambil session Admin Pusat dari `admin_central_session`.
3. Memvalidasi session di database.
4. Memastikan user `ACTIVE`.
5. Menerima `dashboardCode`.
6. Memastikan user memiliki akses dashboard.
7. `SUPER_ADMIN` boleh mengakses semua dashboard.
8. Generate cryptographically secure one-time token.
9. Hash token dan simpan hash.
10. Set expiry sekitar 60 detik.
11. Simpan `userId`.
12. Simpan dashboard tujuan.
13. Return raw token hanya sekali.
14. Jangan log token.

Request:

```json
{
  "dashboardCode": "wip"
}
```

Response sukses dapat berupa:

```json
{
  "success": true,
  "token": "ONE_TIME_TOKEN",
  "expiresIn": 60
}
```

Jika tidak authenticated: `401`.

Jika tidak memiliki akses: `403`.

## Tombol Kelola Dashboard

Saat user klik **Kelola Dashboard**:

1. Ambil `dashboardCode`.
2. Request:

```text
POST /api/auth/sso/create
```

Body:

```json
{
  "dashboardCode": "wip"
}
```

3. Terima one-time token.
4. Redirect ke:

```text
dash.adminUrl + "?sso=" + token
```

Token ini harus one-time handoff token, **bukan Admin Session token**.

Jangan kirim Admin Session token utama melalui URL.

## Endpoint Exchange

Buat endpoint Admin Pusat:

```text
POST /api/auth/sso/exchange
```

Request:

```json
{
  "token": "ONE_TIME_TOKEN",
  "dashboardCode": "wip"
}
```

Validasi:
1. Token tersedia.
2. Hash token cocok.
3. Belum digunakan.
4. Belum expired.
5. Dashboard code cocok.
6. User masih ACTIVE.
7. User masih memiliki akses dashboard.
8. SUPER_ADMIN diperbolehkan.
9. Token hanya dapat digunakan sekali.
10. Authority/session yang mendasari handoff masih valid.

Jangan mengembalikan Admin Session token utama.

## Dashboard Middleware

File:

```text
apps/dashboard-wip/src/middleware.ts
```

Saat request:

```text
/admin?sso=<token>
```

middleware harus mendeteksi `sso`.

Jika ada:
1. Ambil token.
2. Jangan log token.
3. Tukarkan ke Admin Pusat melalui endpoint exchange.
4. Setelah valid, buat session lokal dashboard.
5. Redirect ke `/admin`.

Jangan menggunakan Admin Session token utama sebagai query parameter.

## Edge Runtime

Perhatikan bahwa middleware Next.js berjalan pada runtime yang mungkin Edge.

Jangan menggunakan API Node.js yang tidak kompatibel dengan Edge Runtime.

Jika diperlukan:
- gunakan endpoint/server route yang kompatibel;
- atau mekanisme exchange yang sesuai runtime.

Production build harus tetap berhasil.

## Open Redirect Prevention

Jangan menerima arbitrary redirect URL dari client.

Dilarang:

```text
/api/auth/sso/create?redirect=https://...
```

Gunakan hanya `dashboardCode`.

Server menentukan dashboard berdasarkan data/configuration yang sudah terdaftar.

Contoh:

```text
wip
dashboard_a
dashboard_b
dashboard_c
```

Jangan menerima URL arbitrary dari browser.

## CSRF dan Request Security

Periksa apakah project sudah memiliki:
- CSRF protection
- rate limiting
- request validation
- origin checking
- security middleware

Gunakan mekanisme existing jika tersedia.

Endpoint SSO tidak boleh digunakan untuk:
- membuat token dashboard yang tidak boleh diakses;
- privilege escalation;
- brute-force token.

Jika rate limiting belum ada, gunakan pendekatan yang sesuai arsitektur project atau jelaskan kebutuhan penambahannya.

## Audit Log

Jika sesuai, gunakan `adminActivityLog`.

Contoh:

```text
SSO_HANDOFF_CREATED
```

Description:

```text
User membuat akses SSO ke Dashboard WIP.
```

Jangan mencatat:
- raw token;
- Admin Session token;
- password.

## Session Revocation

SSO tidak boleh melewati revocation.

Jika user:
- dinonaktifkan;
- akses dashboard dicabut;
- session pusat expired;
- session pusat invalid;

maka SSO exchange harus gagal.

## Dashboard yang Didukung

Implementasikan reusable:

```text
WIP ACC
dashboardCode = "wip"

WIP PG1
dashboardCode = "dashboard_a"

HPP PG1
dashboardCode = "dashboard_b"

HPP M3
dashboardCode = "dashboard_c"
```

## Public URL vs Admin URL

Pertahankan:

```text
dash.url
    =
public dashboard URL
```

dan:

```text
dash.adminUrl
    =
admin dashboard URL
```

Jangan mengubah public URL menjadi admin URL.

Tombol **Kelola Dashboard** menggunakan `dash.adminUrl`.

## Existing Shared Config

Project sudah memiliki:

```text
packages/shared-ui/src/config.ts
```

dengan:

```text
wipAccAdminUrl
wipPg1AdminUrl
hppPg1AdminUrl
hppM3AdminUrl
```

Pertahankan konfigurasi tersebut.

Jangan hardcode production URL di JSX.

## Compatibility

Jangan merusak:
- Admin Pusat login;
- Admin Pusat logout;
- Admin Pusat verify;
- Dashboard authentication;
- Dashboard logout;
- permission/access control;
- public dashboard;
- existing API;
- login manual.

Login manual harus tetap berfungsi sebagai fallback.

## Security Testing

Setelah implementasi, test:

### Login dan SSO

1. Login Admin Pusat.
2. User dengan akses WIP klik Kelola Dashboard.
3. User masuk WIP tanpa login ulang.
4. URL akhir menjadi:

```text
https://wipcoscontrol.estatepg1.online/admin
```

tanpa `?sso=`.
5. Refresh halaman.
6. Session lokal tetap valid.
7. Logout bekerja.
8. Login manual tetap bekerja.

### Authorization

9. User tanpa akses WIP tidak dapat membuat SSO token WIP.
10. User dengan akses dashboard A tidak dapat menggunakan token untuk WIP.
11. SUPER_ADMIN dapat mengakses dashboard yang diizinkan.
12. User inactive ditolak.
13. Akses yang dicabut sebelum exchange ditolak.

### Token

14. Token expired ditolak.
15. Token yang sudah digunakan kedua kalinya ditolak.
16. Token yang dimodifikasi ditolak.
17. Token random ditolak.
18. Token WIP tidak dapat digunakan untuk dashboard lain.
19. Token tidak dapat digunakan setelah expiry.
20. Session pusat expired/revoked tidak dapat membuat atau exchange SSO.

### Security

21. Raw token tidak muncul di server logs.
22. Raw token tidak disimpan di database.
23. Raw token tidak masuk audit log.
24. Admin Session token tidak pernah masuk URL.
25. Tidak ada authentication token di localStorage/sessionStorage.
26. Tidak ada arbitrary redirect/open redirect.
27. Cookie session tetap HttpOnly.
28. Cookie production tetap Secure.
29. Cookie tidak diperluas ke seluruh `.estatepg1.online`.
30. Endpoint tidak membocorkan detail internal.

## Development dan Production Environment

Gunakan:

```text
NEXT_PUBLIC_ADMIN_URL
```

untuk alamat Admin Pusat.

Jangan hardcode production URL jika tidak diperlukan.

Local development harus tetap bekerja dengan localhost.

## Code Quality

Gunakan TypeScript strict typing.

Hindari `any` jika tidak diperlukan.

Tangani error dengan benar.

Jangan:
- menonaktifkan TypeScript;
- menonaktifkan ESLint agar build berhasil;
- menggunakan `@ts-ignore` untuk menutupi masalah;
- membuat authentication bypass.

## Scope

Perubahan boleh mencakup:
- `apps/admin`
- `apps/dashboard-wip`
- `apps/dashboard-a`
- `apps/dashboard-b`
- `apps/dashboard-c` jika diperlukan
- `packages/shared-ui`
- Prisma schema/migration

Tetapi jangan melakukan refactor besar yang tidak berkaitan.

## Sebelum Coding

Cari terlebih dahulu:
1. Prisma schema.
2. `AdminUser`.
3. `AdminSession`.
4. `Dashboard`.
5. `UserDashboardAccess`.
6. Login Admin.
7. Logout Admin.
8. Verify Admin.
9. Middleware dashboard.
10. `createSessionToken`.
11. `attachSessionCookie`.
12. Semua penggunaan `admin_central_session`.
13. Semua penggunaan `admin_session`.
14. CSRF protection.
15. Rate limiting jika ada.

Gunakan implementasi existing sebanyak mungkin.

## Hasil Setelah Coding

Setelah selesai:

1. Tampilkan daftar file yang diubah.
2. Jelaskan arsitektur SSO.
3. Jelaskan flow token Admin Pusat → Dashboard.
4. Jelaskan bagaimana token dilindungi.
5. Jelaskan bagaimana token dibuat one-time.
6. Jelaskan expiry token.
7. Jelaskan authorization dashboard.
8. Jelaskan replay attack prevention.
9. Jelaskan open redirect prevention.
10. Jelaskan pembuatan session lokal.
11. Jelaskan perubahan database jika ada.
12. Tampilkan diff penting.
13. Jalankan TypeScript check.
14. Jalankan production build aplikasi yang terdampak.
15. Pastikan tidak ada TypeScript error.
16. Pastikan migration valid.
17. Jangan commit.
18. Jangan push.

Jika menemukan desain existing yang bertentangan dengan requirement keamanan, jangan memilih solusi yang lebih lemah secara diam-diam. Jelaskan konflik tersebut dan pilih solusi paling aman dengan tetap menjaga kompatibilitas.

Jangan menghapus authentication existing.
Jangan mematikan middleware.
Jangan membuat authentication bypass.
Jangan membuat session token utama dapat diakses dashboard lain.
