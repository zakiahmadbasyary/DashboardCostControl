# Arsitektur Admin Pusat dan Hak Akses Multi-Dashboard

## 1. Tujuan

Dokumen ini menjadi rancangan teknis sistem administrasi untuk platform yang terdiri dari beberapa dashboard dengan database dan fungsi bisnis yang berbeda.

Konsep yang digunakan:

> **Satu Admin Pusat + Satu Sistem Login + Role dan Hak Akses Terpusat + Halaman Administrasi di Setiap Dashboard.**

Setiap dashboard tetap memiliki tampilan administrasi sendiri untuk:

- review data;
- upload data;
- melihat informasi atau riwayat data;
- menjalankan fitur administrasi khusus dashboard.

Namun, setiap dashboard **tidak memiliki akun, user management, atau halaman login sendiri**. Seluruh identitas administrator dikelola oleh Admin Pusat.

---

# 2. Arsitektur Utama

```text
                         ADMIN PUSAT
                              │
                    ┌─────────┴─────────┐
                    │                   │
              SUPER ADMIN          ADMIN BIASA
                    │                   │
                    │                   ├── Dashboard sesuai akses
                    │                   └── Log
                    │
                    ├── Kelola User
                    ├── Atur Role
                    ├── Atur Akses Dashboard
                    ├── Melihat Log
                    └── Akses Semua Dashboard
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    Admin Dashboard WIP  Admin Dashboard A  Admin Dashboard B
          │                   │                   │
          ├── Review Data     ├── Review Data     ├── Review Data
          ├── Upload Data     ├── Upload Data     ├── Upload Data
          └── Fitur Khusus    └── Fitur Khusus    └── Fitur Khusus
```

Prinsip utamanya:

> **Admin Pusat mengatur siapa yang dapat masuk dan dashboard mana yang boleh diakses. Halaman admin setiap dashboard hanya menjadi area kerja untuk mengelola data dashboard tersebut.**

---

# 3. Struktur Monorepo

```text
dashboard-platform/
│
├── apps/
│   ├── portal/
│   │   └── Halaman utama publik
│   │
│   ├── admin/
│   │   └── Admin Pusat
│   │
│   ├── dashboard-wip/
│   │   ├── Halaman publik
│   │   └── Halaman admin WIP
│   │
│   ├── dashboard-a/
│   │   ├── Halaman publik
│   │   └── Halaman admin Dashboard A
│   │
│   ├── dashboard-b/
│   │   ├── Halaman publik
│   │   └── Halaman admin Dashboard B
│   │
│   └── dashboard-c/
│       ├── Halaman publik
│       └── Halaman admin Dashboard C
│
├── packages/
│   ├── auth/
│   └── shared/
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

Setiap dashboard dapat tetap memakai database bisnis masing-masing. Database user dan hak akses berada di sistem pusat.

---

# 4. Role Administrator

Untuk tahap awal digunakan dua role.

## 4.1 SUPER_ADMIN

Super Admin memiliki akses penuh.

Hak akses:

- membuat Admin baru;
- melihat daftar Admin;
- mengubah data Admin;
- menentukan role;
- menentukan dashboard yang dapat diakses Admin biasa;
- menonaktifkan akses jika diperlukan;
- melihat log;
- mengakses semua halaman administrasi seluruh dashboard.

Contoh:

```text
SUPER ADMIN
│
├── Dashboard Saya
│   ├── Admin WIP
│   ├── Admin Dashboard A
│   ├── Admin Dashboard B
│   └── Admin Dashboard C
│
├── Manajemen User
│   ├── Tambah User
│   ├── Daftar User
│   └── Atur Akses Dashboard
│
└── Log Aktivitas
```

Satu akun Super Admin berlaku untuk seluruh platform.

---

## 4.2 ADMIN

Admin biasa tidak dapat mengelola user atau memberikan akses kepada administrator lain.

Admin hanya dapat:

- melihat log yang diizinkan;
- melihat dashboard yang diberikan kepadanya;
- membuka halaman admin dashboard sesuai akses;
- review data;
- upload data;
- menggunakan fitur administrasi dashboard yang diizinkan.

Contoh:

```text
ADMIN 1
├── WIP           ✓
├── Dashboard A   ✓
├── Dashboard B   ✗
└── Dashboard C   ✗
```

Setelah login, Admin 1 hanya melihat:

```text
ADMIN PUSAT
├── Dashboard Saya
│   ├── Admin WIP
│   └── Admin Dashboard A
│
└── Log
```

Admin biasa tidak melihat menu:

```text
✗ Tambah User
✗ Kelola User
✗ Mengubah Role
✗ Memberikan Akses Dashboard
```

---

# 5. Model Hak Akses

Gunakan dua lapisan:

```text
ROLE
  +
DASHBOARD ACCESS
```

Contoh:

| User | Role | WIP | Dashboard A | Dashboard B | Dashboard C |
|---|---|---|---|---|---|
| Super Admin | SUPER_ADMIN | ✓ | ✓ | ✓ | ✓ |
| Admin 1 | ADMIN | ✓ | ✓ | ✗ | ✗ |
| Admin 2 | ADMIN | ✗ | ✓ | ✓ | ✗ |
| Admin 3 | ADMIN | ✓ | ✗ | ✗ | ✗ |

Super Admin dapat menentukan dashboard mana yang dapat dikelola oleh setiap Admin biasa.

---

# 6. Database Admin Pusat

Database Admin Pusat dipisahkan dari database bisnis dashboard.

Struktur konseptual:

```text
DATABASE_ADMIN
│
├── users
├── roles
├── user_roles
├── dashboards
├── user_dashboard_access
├── sessions
└── activity_logs
```

## 6.1 `users`

Menyimpan akun administrator.

Contoh:

```text
id
name
email
password_hash
status
created_at
updated_at
```

Password tidak boleh disimpan sebagai teks biasa.

## 6.2 `roles`

Contoh:

```text
SUPER_ADMIN
ADMIN
```

## 6.3 `user_roles`

Menghubungkan user dengan role:

```text
user_id
role_id
```

## 6.4 `dashboards`

Daftar dashboard dalam platform:

```text
id
code
name
admin_url
status
```

Contoh:

```text
WIP
DASHBOARD_A
DASHBOARD_B
DASHBOARD_C
```

## 6.5 `user_dashboard_access`

Menentukan dashboard yang boleh diakses Admin biasa:

```text
id
user_id
dashboard_id
```

Contoh:

```text
Admin 1
├── WIP
└── Dashboard A
```

Super Admin dapat memperoleh akses seluruh dashboard berdasarkan role tanpa perlu didaftarkan satu per satu.

## 6.6 `activity_logs`

Mencatat aktivitas penting.

Contoh:

```text
LOGIN
LOGOUT
CREATE_USER
UPDATE_USER
CHANGE_ACCESS
UPLOAD_DATA
UPDATE_DATA
DELETE_DATA
```

Contoh kolom:

```text
id
user_id
action
dashboard_id
description
ip_address
created_at
```

Jangan menyimpan password, token, atau credential rahasia di log.

---

# 7. Satu Halaman Login

Seluruh administrator login melalui:

```text
admin.domain.com/login
```

Tidak dibuat login terpisah seperti:

```text
wip.domain.com/admin/login
a.domain.com/admin/login
b.domain.com/admin/login
```

Alurnya:

```text
SATU LOGIN
    ↓
Identitas Diverifikasi
    ↓
Role dan Hak Akses Dibaca
    ↓
Masuk Admin Pusat
```

---

# 8. Tampilan Setelah Login

## 8.1 Super Admin

```text
ADMIN PUSAT
│
├── Dashboard Saya
│   ├── Admin WIP
│   ├── Admin Dashboard A
│   ├── Admin Dashboard B
│   └── Admin Dashboard C
│
├── Manajemen User
│   ├── Tambah User
│   ├── Daftar User
│   └── Atur Akses Dashboard
│
└── Log Aktivitas
```

Super Admin dapat langsung masuk ke halaman admin dashboard mana pun.

## 8.2 Admin Biasa

```text
ADMIN PUSAT
│
├── Dashboard Saya
│   ├── Dashboard yang Diizinkan
│   └── Dashboard yang Diizinkan
│
└── Log Aktivitas
```

Admin biasa tidak memiliki akses ke manajemen user.

---

# 9. Halaman Admin di Setiap Dashboard

Setiap dashboard tetap memiliki halaman administrasi sendiri:

```text
wip.domain.com/admin
a.domain.com/admin
b.domain.com/admin
c.domain.com/admin
```

Halaman tersebut **bukan sistem login atau user management terpisah**.

Contoh Admin WIP:

```text
ADMIN WIP
├── Review Data
├── Upload Data
├── Riwayat Data
└── Fitur khusus WIP
```

Contoh Admin Dashboard A:

```text
ADMIN DASHBOARD A
├── Review Data
├── Upload Data
└── Fitur khusus Dashboard A
```

Jadi pembagiannya:

```text
ADMIN PUSAT
Mengatur SIAPA yang dapat masuk
        │
        ▼
ADMIN DASHBOARD
Mengatur PEKERJAAN apa yang dilakukan pada dashboard
```

---

# 10. Alur Login dan Akses

```text
Administrator
      ↓
Admin Pusat
      ↓
Login
      ↓
Identitas Diverifikasi
      ↓
Session dibuat
      ↓
Role dan Dashboard Access dibaca
      ↓
Halaman Admin Pusat
      ↓
Pilih Dashboard
      ↓
Dashboard memverifikasi Session
      ↓
Dashboard memverifikasi Hak Akses
      ↓
Diizinkan → Masuk
Ditolak → 403 Forbidden
```

Contoh Admin tanpa akses membuka:

```text
b.domain.com/admin
```

Hasil:

```text
Session valid?
    ↓ Ya
Punya akses Dashboard B?
    ↓ Tidak
403 Forbidden
```

Menyembunyikan menu tidak cukup. Server/API tetap harus melakukan pemeriksaan.

---

# 11. Single Sign-On

Target sistem adalah login sekali.

```text
Login sekali
     ↓
Admin WIP
     ↓
Pindah ke Admin Dashboard A
     ↓
Tidak perlu login ulang
```

Contoh:

```text
1. Login di admin.domain.com/login
2. Login berhasil
3. Membuka wip.domain.com/admin
4. Membuka a.domain.com/admin
5. Selama session valid, tidak perlu memasukkan password lagi
```

Teknis session/SSO harus disesuaikan dengan arsitektur domain dan provider autentikasi yang dipilih.

---

# 12. Keamanan Wajib

Setiap halaman admin dan API yang mengubah data wajib memeriksa:

```text
1. Apakah user sudah login?
2. Siapa user tersebut?
3. Apa role user?
4. Dashboard mana yang boleh diakses?
5. Apakah aksi tersebut diizinkan?
```

Contoh upload:

```text
Request Upload
      ↓
Verifikasi Session
      ↓
Identifikasi User
      ↓
Cek Role
      ↓
Cek Akses Dashboard
      ↓
Valid → Proses Upload
Tidak valid → Tolak Request
```

Jangan mempercayai `userId` dari URL atau request sebagai sumber identitas.

Identitas harus berasal dari session atau token yang sudah diverifikasi.

---

# 13. Urutan Implementasi

## Tahap 1 — Fondasi Admin Pusat

Buat:

- login;
- logout;
- database user;
- role `SUPER_ADMIN`;
- role `ADMIN`;
- session/authentication.

## Tahap 2 — Manajemen User

Khusus Super Admin:

- tambah Admin;
- daftar Admin;
- edit Admin;
- ubah role;
- atur akses dashboard.

## Tahap 3 — Dashboard Saya

Setelah login:

- Super Admin melihat seluruh dashboard;
- Admin biasa hanya melihat dashboard sesuai akses.

## Tahap 4 — Integrasi Dashboard WIP

Lindungi halaman admin WIP:

```text
/admin
```

Pastikan:

```text
Belum login → diarahkan ke login pusat
Login tapi tanpa akses → 403
Login dan punya akses → masuk
```

## Tahap 5 — Lindungi API

Endpoint seperti:

- upload;
- edit;
- delete;

harus memverifikasi autentikasi dan hak akses pada sisi server.

## Tahap 6 — Tambahkan Dashboard Baru

Ketika Dashboard A/B/C selesai:

1. daftarkan dashboard pada Admin Pusat;
2. buat halaman admin khusus dashboard;
3. hubungkan dengan autentikasi pusat;
4. tambahkan pengaturan akses untuk Admin biasa;
5. Super Admin dapat mengakses sesuai role.

---

# 14. Arsitektur Akhir

```text
                         PLATFORM
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
    DASHBOARD PUBLIK                       ADMIN PUSAT
    Tanpa Login                             Satu Login
          │                                     │
    ┌─────┼─────┐                     ┌─────────┴─────────┐
    ▼     ▼     ▼                     ▼                   ▼
   WIP    A     B               SUPER ADMIN          ADMIN BIASA
                                    │                   │
                                    │                   │
                              Semua Dashboard     Sesuai Hak Akses
                                    │                   │
                                    └─────────┬─────────┘
                                              ▼
                            HALAMAN ADMIN MASING-MASING DASHBOARD
                                              │
                                  ┌───────────┼───────────┐
                                  ▼           ▼           ▼
                               Review       Upload    Kelola Data
```

---

# 15. Kesimpulan

Arsitektur yang digunakan adalah:

> **Satu Login → Satu Database User → Super Admin Mengelola User dan Akses → Admin Biasa Mengakses Dashboard Sesuai Izin → Setiap Dashboard Memiliki Halaman Admin Sendiri untuk Review dan Upload Data.**

Super Admin dapat membuat Admin baru dan menentukan dashboard yang dapat dikelola oleh setiap Admin. Super Admin juga dapat melihat log dan membuka seluruh halaman administrasi dashboard.

Admin biasa hanya dapat melihat log serta membuka halaman administrasi dashboard sesuai akses yang diberikan. Halaman admin pada setiap dashboard tetap berdiri secara terpisah secara fungsional, tetapi tidak memiliki login, akun, atau manajemen user sendiri.

Dengan desain ini, pengelolaan identitas tetap terpusat, sedangkan pengelolaan data tetap berada dekat dengan dashboard dan database masing-masing.
