# Task: Initialize Prisma Migrations for Admin & Dashboard WIP

Saya sedang menyiapkan deployment production untuk monorepo Next.js ini.

## Project Stack

- Next.js
- TypeScript
- Prisma 6.19.3
- PostgreSQL
- npm Workspaces
- Turborepo
- Monorepo
- Tidak menggunakan Docker

## Struktur Project

```text
apps/
├── admin/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── dashboard-wip/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── dashboard-a/
├── dashboard-b/
├── dashboard-c/
└── portal/
```

Saat ini:

- `apps/admin/prisma/schema.prisma` sudah ada.
- `apps/dashboard-wip/prisma/schema.prisma` sudah ada.
- Keduanya menggunakan PostgreSQL.
- Keduanya menggunakan `env("DATABASE_URL")`.
- Belum ada folder `prisma/migrations/`.
- Data database lokal TIDAK perlu dipertahankan.
- Migration ini akan digunakan nantinya untuk membuat database production di VPS.
- Tidak menggunakan Docker.

---

# TUJUAN

Buat initial Prisma migration untuk:

1. `apps/admin`
2. `apps/dashboard-wip`

Migration harus dibuat berdasarkan schema Prisma yang saat ini sudah ada.

Hasil yang diharapkan:

```text
apps/admin/prisma/
├── schema.prisma
├── seed.ts
└── migrations/
    └── <timestamp>_init/
        └── migration.sql

apps/dashboard-wip/prisma/
├── schema.prisma
├── seed.ts
└── migrations/
    └── <timestamp>_init/
        └── migration.sql
```

---

# ATURAN SANGAT PENTING

Jangan mengubah business logic aplikasi.

Jangan mengubah:

- UI
- API endpoint
- authentication logic
- service logic
- component
- routing
- middleware
- database model/schema Prisma

Kecuali perubahan minimal benar-benar diperlukan agar migration valid. Jika schema ternyata bermasalah, laporkan terlebih dahulu daripada mengubah schema secara sembarangan.

Jangan:

- membuat database production
- melakukan deployment ke VPS
- melakukan `git push`
- mengubah `.env` production
- mengubah dependency/package version
- menjalankan `npm audit fix`
- menghapus data dari repository
- mengubah aplikasi yang tidak berkaitan dengan migration

---

# DATABASE LOKAL

Database lokal boleh di-reset karena seluruh data lokal hanya data development/testing dan tidak perlu dipertahankan.

Jika Prisma meminta reset database saat menjalankan:

```bash
npx prisma migrate dev
```

BOLEH melakukan reset.

---

# LANGKAH KERJA

## 1. Audit Admin

Periksa:

```text
apps/admin/prisma/schema.prisma
apps/admin/prisma/seed.ts
apps/admin/package.json
```

Pastikan datasource menggunakan:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Periksa konfigurasi Prisma lain yang memengaruhi migration.

---

## 2. Audit Dashboard WIP

Periksa:

```text
apps/dashboard-wip/prisma/schema.prisma
apps/dashboard-wip/prisma/seed.ts
apps/dashboard-wip/package.json
```

Pastikan datasource menggunakan:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 3. Pastikan Tidak Ada Migration Sebelumnya

Periksa:

```text
apps/admin/prisma/migrations
apps/dashboard-wip/prisma/migrations
```

Jika belum ada migration, lanjutkan.

Jika ternyata sudah ada migration, JANGAN membuat migration baru secara sembarangan. Laporkan terlebih dahulu.

---

## 4. Buat Migration Admin

Gunakan schema yang sudah ada:

```bash
npx prisma migrate dev \
  --schema=apps/admin/prisma/schema.prisma \
  --name init
```

Jika Prisma meminta reset database lokal, izinkan reset karena data lokal tidak perlu dipertahankan.

Pastikan migration berhasil.

---

## 5. Buat Migration Dashboard WIP

Jalankan:

```bash
npx prisma migrate dev \
  --schema=apps/dashboard-wip/prisma/schema.prisma \
  --name init
```

Jika Prisma meminta reset database lokal, izinkan reset karena data lokal tidak perlu dipertahankan.

Pastikan migration berhasil.

---

## 6. Generate Prisma Client

Pastikan Prisma Client berhasil dibuat untuk kedua aplikasi.

Jika `migrate dev` sudah menjalankan generate secara otomatis, tidak perlu mengulanginya.

Jika diperlukan, gunakan command yang sesuai dengan konfigurasi project.

---

## 7. Verifikasi Migration

Periksa:

```bash
find apps/admin/prisma/migrations -maxdepth 2 -type f -print
```

dan:

```bash
find apps/dashboard-wip/prisma/migrations -maxdepth 2 -type f -print
```

Pastikan masing-masing memiliki:

```text
migration.sql
```

---

## 8. Validasi Schema

Jalankan:

```bash
npx prisma validate \
  --schema=apps/admin/prisma/schema.prisma
```

dan:

```bash
npx prisma validate \
  --schema=apps/dashboard-wip/prisma/schema.prisma
```

Keduanya harus berhasil.

---

# JANGAN DEPLOY

Setelah migration selesai:

- Jangan `git push`.
- Jangan `git pull`.
- Jangan menyentuh VPS.
- Jangan membuat database production.
- Jangan mengubah environment production.

Migration hanya disiapkan di environment development/lokal.

---

# PRODUCTION WORKFLOW NANTINYA

Migration yang dibuat akan di-commit ke GitHub.

Di VPS, migration TIDAK dibuat menggunakan `migrate dev`.

Production nantinya menggunakan:

```bash
npx prisma migrate deploy \
  --schema=apps/admin/prisma/schema.prisma
```

dan:

```bash
npx prisma migrate deploy \
  --schema=apps/dashboard-wip/prisma/schema.prisma
```

Jadi migration yang dibuat sekarang harus valid untuk workflow production tersebut.

---

# OUTPUT YANG HARUS DIBERIKAN

Setelah selesai, berikan laporan dengan format berikut.

## 1. Audit

- Kondisi Prisma Admin
- Kondisi Prisma WIP
- Apakah sebelumnya sudah ada migration

## 2. Migration yang Dibuat

- Lokasi migration Admin
- Lokasi migration WIP
- Nama migration

## 3. Validasi

- Hasil `prisma validate` Admin
- Hasil `prisma validate` WIP
- Hasil migration
- Status Prisma Client generation

## 4. File yang Berubah

Tampilkan hanya file yang benar-benar dibuat/diubah.

## 5. Perubahan yang Tidak Dilakukan

Pastikan laporkan bahwa:

- Business logic tidak diubah.
- UI tidak diubah.
- API tidak diubah.
- Authentication tidak diubah.
- Dependency tidak diubah.
- Production database tidak disentuh.
- VPS tidak disentuh.
- Tidak melakukan `git push`.

Jangan melakukan tindakan di luar scope task ini.
