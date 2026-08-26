# Rencana Migrasi Dashboard Platform ke Monorepo dengan Admin Pusat

## 1. Tujuan

Dokumen ini menjadi panduan teknis untuk mengubah proyek Dashboard WIP yang saat ini sudah berjalan menjadi arsitektur **monorepo**. Arsitektur baru disiapkan untuk menampung beberapa dashboard dengan database berbeda, sementara seluruh pengelolaan administrator menggunakan **satu aplikasi Admin Pusat**.

Pada tahap awal, fokus implementasi adalah:

- Dashboard WIP tetap dapat diakses publik tanpa login.
- Fitur admin WIP dipindahkan secara bertahap ke konsep Admin Pusat.
- Admin Pusat menjadi tempat login administrator.
- Struktur proyek sudah disiapkan untuk Dashboard A, Dashboard B, dan Dashboard C.
- Setiap dashboard tetap dapat menggunakan database masing-masing.
- Semua aplikasi tetap berada dalam satu repository Git agar pengembangan dan deployment VPS lebih terorganisasi.

---

## 2. Prinsip Arsitektur

Sistem dibagi menjadi dua jenis akses.

### 2.1 Akses Publik

Pengunjung tidak perlu melakukan login untuk melihat dashboard.

Contoh:

```text
Portal Utama
├── Dashboard WIP
├── Dashboard A
├── Dashboard B
└── Dashboard C
```

Seluruh dashboard publik hanya memiliki akses baca terhadap data yang ditampilkan. Pengunjung tidak memiliki akses untuk mengubah data sumber, mengunggah file, atau membuka halaman administrasi.

### 2.2 Akses Administrator

Administrator wajib melakukan login melalui Admin Pusat.

```text
Admin
  ↓
Admin Pusat
  ↓
Login
  ↓
Pilih Dashboard yang Dikelola
  ├── Kelola WIP
  ├── Kelola Dashboard A
  ├── Kelola Dashboard B
  └── Kelola Dashboard C
```

Admin Pusat menjadi sumber utama untuk identitas administrator, hak akses, dan autentikasi.

---

## 3. Arsitektur Target

```text
                         ┌─────────────────────┐
                         │     PORTAL UTAMA    │
                         │   Akses Tanpa Login │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      Dashboard WIP          Dashboard A            Dashboard B
       Publik/Read            Publik/Read            Publik/Read
             │                      │                      │
             ▼                      ▼                      ▼
          DB WIP                  DB A                    DB B


                         ┌─────────────────────┐
                         │     ADMIN PUSAT     │
                         │       Login         │
                         │ User & Access Admin │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
          Admin WIP              Admin A                Admin B
```

Pada tahap selanjutnya Dashboard C ditambahkan dengan pola yang sama.

---

## 4. Struktur Monorepo

Struktur repository target:

```text
dashboard-platform/
│
├── apps/
│   │
│   ├── portal/
│   │   └── Aplikasi halaman utama/pemilih dashboard
│   │
│   ├── admin/
│   │   └── Aplikasi Admin Pusat
│   │
│   ├── dashboard-wip/
│   │   └── Aplikasi Dashboard WIP
│   │
│   ├── dashboard-a/
│   │   └── Placeholder Dashboard A
│   │
│   ├── dashboard-b/
│   │   └── Placeholder Dashboard B
│   │
│   └── dashboard-c/
│       └── Placeholder Dashboard C
│
├── packages/
│   └── shared/
│       └── Kode bersama jika nanti benar-benar diperlukan
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
└── README.md
```

Pada tahap awal, folder `packages/shared` dapat tetap kosong atau belum digunakan. Jangan memindahkan kode ke package bersama sebelum memang terdapat kode yang benar-benar digunakan oleh lebih dari satu aplikasi.

---

## 5. Pembagian Tanggung Jawab Aplikasi

### 5.1 Portal

Aplikasi `apps/portal` bertugas sebagai halaman awal sistem.

Tanggung jawab:

- Menampilkan daftar dashboard.
- Mengarahkan pengunjung ke dashboard publik.
- Tidak menyimpan data bisnis setiap dashboard.
- Tidak digunakan sebagai tempat pengelolaan data.

Contoh:

```text
domain.com
├── Dashboard WIP
├── Dashboard A
├── Dashboard B
└── Dashboard C
```

### 5.2 Admin Pusat

Aplikasi `apps/admin` menjadi pusat administrasi.

Tanggung jawab utama:

- Login administrator.
- Logout.
- Manajemen akun administrator.
- Role dan hak akses administrator.
- Menentukan dashboard yang dapat dikelola setiap admin.
- Menjadi pintu masuk ke fitur administrasi setiap dashboard.
- Menyimpan atau mengelola log autentikasi dan aktivitas administrasi sesuai kebutuhan.

Admin Pusat tidak harus langsung memindahkan seluruh logika bisnis WIP. Pada tahap migrasi, prioritas pertama adalah memusatkan autentikasi dan pengelolaan administrator.

### 5.3 Dashboard WIP

Aplikasi `apps/dashboard-wip` adalah hasil migrasi proyek WIP yang sudah ada.

Tanggung jawab:

- Menampilkan dashboard WIP kepada publik tanpa login.
- Menyediakan endpoint dan logika data WIP.
- Memiliki fitur pengelolaan data yang hanya dapat diakses administrator yang telah diverifikasi.
- Menggunakan Database WIP.

### 5.4 Dashboard A, B, dan C

Aplikasi ini mengikuti pola Dashboard WIP:

- Dashboard publik tanpa login.
- Fitur administrasi hanya untuk admin.
- Database terpisah.
- Identitas administrator berasal dari Admin Pusat.

---

## 6. Struktur Database

Repository digabung dalam satu monorepo, tetapi database tidak harus digabung.

Target:

```text
Database Admin
├── administrators/users
├── roles
├── permissions
├── admin_dashboard_access
├── sessions atau token
└── audit/auth logs

Database WIP
├── seluruh tabel bisnis WIP
├── data hasil upload WIP
└── tabel khusus WIP

Database A
├── tabel khusus Dashboard A
└── data Dashboard A

Database B
├── tabel khusus Dashboard B
└── data Dashboard B

Database C
├── tabel khusus Dashboard C
└── data Dashboard C
```

Prinsip utama:

> Data identitas administrator dipusatkan, sedangkan data bisnis setiap dashboard tetap terpisah.

Jangan membuat tabel administrator terpisah untuk setiap dashboard apabila seluruh admin nantinya dikelola oleh sistem pusat.

---

## 7. Hak Akses Admin

Struktur akses sebaiknya tidak hanya menggunakan status `admin` biasa. Admin Pusat perlu mengetahui dashboard mana yang dapat dikelola oleh setiap akun.

Contoh:

```text
Admin A
├── WIP = dapat mengelola
├── Dashboard A = dapat mengelola
├── Dashboard B = tidak dapat mengelola
└── Dashboard C = tidak dapat mengelola

Admin B
├── WIP = tidak dapat mengelola
├── Dashboard A = tidak dapat mengelola
├── Dashboard B = dapat mengelola
└── Dashboard C = dapat mengelola
```

Secara konsep, hak akses dapat dibentuk seperti:

```text
users
roles
permissions
user_roles
role_permissions
dashboard_access
```

Implementasi detail tabel dapat disesuaikan dengan sistem autentikasi dan ORM yang sudah digunakan pada proyek.

---

## 8. Alur Autentikasi Target

### 8.1 Pengunjung Publik

```text
Pengunjung
   ↓
Portal atau URL Dashboard
   ↓
Dashboard WIP/A/B/C
   ↓
Data ditampilkan
```

Tidak ada proses login.

### 8.2 Administrator

```text
Administrator
   ↓
Admin Pusat
   ↓
Login
   ↓
Identitas diverifikasi
   ↓
Session/Token aman dibuat
   ↓
Cek hak akses dashboard
   ↓
Akses fitur administrasi yang diizinkan
```

Identitas administrator tidak boleh ditentukan dari parameter URL.

Contoh yang tidak boleh dipercaya:

```text
/admin?userId=5
/admin/wip?userId=5
```

Walaupun pengguna mengganti `userId`, server tetap harus menentukan identitas dari session atau token yang telah diverifikasi.

---

## 9. Strategi Migrasi WIP yang Sudah Ada

Migrasi dilakukan tanpa mengubah logika bisnis secara besar-besaran pada awal proses.

### Tahap 1 — Amankan Kondisi Saat Ini

Sebelum refactor:

1. Pastikan seluruh perubahan WIP sudah di-commit.
2. Push branch utama ke remote Git.
3. Pastikan aplikasi dapat dijalankan dengan normal.
4. Catat konfigurasi environment dan database yang digunakan.
5. Jangan menghapus repository atau history Git.

Contoh:

```bash
git status
git add .
git commit -m "chore: backup stable WIP before monorepo migration"
git push
```

### Tahap 2 — Buat Branch Migrasi

Jangan langsung melakukan refactor besar di branch utama.

```bash
git checkout -b refactor/monorepo-admin-central
```

Seluruh migrasi dilakukan pada branch tersebut terlebih dahulu.

### Tahap 3 — Ubah Root Menjadi Monorepo

Kode proyek WIP yang saat ini berada di root dipindahkan menjadi:

```text
apps/dashboard-wip/
```

Target:

```text
dashboard-platform/
├── apps/
│   └── dashboard-wip/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       ├── package.json
│       └── ...
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

History Git tetap berada pada repository yang sama. Refactor struktur folder tidak menghapus riwayat commit.

### Tahap 4 — Pastikan WIP Tetap Berjalan

Setelah dipindahkan:

- Install dependency workspace.
- Jalankan Dashboard WIP dari folder/root monorepo.
- Uji dashboard publik.
- Uji koneksi database.
- Uji halaman admin yang sudah ada.
- Uji upload atau perubahan data.
- Uji API yang digunakan.
- Pastikan environment variable terbaca dengan benar.

Jangan lanjut ke migrasi autentikasi sebelum WIP pada struktur monorepo sudah stabil.

### Tahap 5 — Buat Aplikasi Admin Pusat

Buat aplikasi baru:

```text
apps/admin/
```

Fokus awal:

```text
/admin/login
/admin/dashboard
/admin/users
/admin/access
```

Pada tahap pertama Admin Pusat dapat digunakan untuk login dan pengelolaan admin. Integrasi penuh dengan Dashboard WIP dilakukan setelah fondasi autentikasi stabil.

### Tahap 6 — Siapkan Placeholder Dashboard Lain

Buat aplikasi:

```text
apps/portal/
apps/dashboard-a/
apps/dashboard-b/
apps/dashboard-c/
```

Aplikasi tersebut dapat masih berupa placeholder. Tujuannya agar struktur monorepo dan pipeline deployment sudah konsisten sejak awal.

---

## 10. Environment Variable

Jangan membuat satu file `.env` global yang berisi seluruh rahasia seluruh aplikasi apabila tidak diperlukan.

Sebaiknya setiap aplikasi memiliki konfigurasi sendiri.

Contoh:

```text
apps/admin/.env
apps/dashboard-wip/.env
apps/dashboard-a/.env
apps/dashboard-b/.env
apps/dashboard-c/.env
```

Contoh konsep:

```text
apps/admin/.env
DATABASE_URL=...
AUTH_SECRET=...
```

```text
apps/dashboard-wip/.env
DATABASE_URL=...
AUTH_PROVIDER_URL=...
```

Dengan cara ini, kredensial Database WIP tidak harus tersedia untuk Dashboard A atau aplikasi lain.

File `.env` tidak boleh di-commit apabila berisi credential asli.

---

## 11. Integrasi Admin Pusat dengan Dashboard WIP

Target akhirnya:

```text
Admin
  ↓
Admin Pusat
  ↓
Login
  ↓
Session/Token terverifikasi
  ↓
Pilih Kelola WIP
  ↓
Dashboard WIP memverifikasi identitas
  ↓
Cek izin WIP
  ↓
Diizinkan → fitur edit/upload tersedia
Tidak diizinkan → akses ditolak
```

Dashboard WIP harus tetap melakukan pemeriksaan akses pada sisi server/API.

Menyembunyikan tombol Edit pada frontend saja tidak cukup.

Contoh:

```text
Frontend:
Tombol Upload disembunyikan
        ↓
Bukan berarti API aman
        ↓
API Upload tetap wajib:
1. Verifikasi session/token
2. Identifikasi admin
3. Cek hak akses WIP
4. Baru proses upload
```

---

## 12. Model Pengembangan Admin Pusat

Untuk menghindari refactor besar, pengembangan dilakukan bertahap.

### Fase 1

```text
Admin Pusat
├── Login
├── Logout
└── Manajemen Admin
```

Dashboard WIP masih dapat mempertahankan struktur admin yang sudah ada selama masa transisi.

### Fase 2

```text
Admin Pusat
├── Login
├── User Admin
├── Hak Akses
└── Akses Dashboard WIP
```

Dashboard WIP mulai menggunakan identitas dari Admin Pusat.

### Fase 3

```text
Admin Pusat
├── WIP
├── Dashboard A
├── Dashboard B
└── Dashboard C
```

Setiap dashboard baru langsung menggunakan sistem autentikasi pusat.

---

## 13. Konsep Hosting VPS

Monorepo berada dalam satu repository, tetapi setiap aplikasi dapat berjalan sebagai aplikasi terpisah.

Contoh:

```text
VPS
│
├── Portal              → port internal sendiri
├── Admin Pusat         → port internal sendiri
├── Dashboard WIP       → port internal sendiri
├── Dashboard A         → port internal sendiri
├── Dashboard B         → port internal sendiri
└── Dashboard C         → port internal sendiri
```

Reverse proxy mengarahkan request ke aplikasi yang sesuai.

Contoh konsep domain:

```text
domain.com         → Portal
admin.domain.com   → Admin Pusat
wip.domain.com     → Dashboard WIP
a.domain.com       → Dashboard A
b.domain.com       → Dashboard B
c.domain.com       → Dashboard C
```

Alternatifnya dapat menggunakan path:

```text
domain.com/        → Portal
domain.com/admin   → Admin
domain.com/wip     → WIP
domain.com/a       → Dashboard A
```

Untuk awal, keputusan domain/path belum harus diterapkan saat migrasi kode. Yang penting setiap aplikasi sudah dapat dibangun dan dijalankan secara independen.

---

## 14. Deployment yang Disarankan

Karena setiap aplikasi adalah aplikasi Next.js terpisah, deployment sebaiknya memperhatikan perubahan per aplikasi.

Target konsep:

```text
Repository Git
      ↓
Pull/CI/CD
      ↓
Deteksi aplikasi yang berubah
      ↓
Build aplikasi terkait
      ↓
Restart/deploy aplikasi terkait
```

Contoh:

```text
Perubahan hanya di apps/dashboard-wip
        ↓
Build Dashboard WIP
        ↓
Deploy/restart Dashboard WIP
        ↓
Admin dan dashboard lain tidak perlu diubah
```

Detail implementasi dapat menggunakan process manager atau container sesuai keputusan deployment nantinya.

---

## 15. Urutan Implementasi yang Disarankan

Urutan kerja:

1. Backup kondisi WIP yang stabil ke Git.
2. Buat branch `refactor/monorepo-admin-central`.
3. Siapkan workspace monorepo.
4. Pindahkan WIP ke `apps/dashboard-wip`.
5. Perbaiki konfigurasi dependency dan environment.
6. Pastikan WIP publik dan admin lama tetap berjalan.
7. Buat `apps/admin`.
8. Implementasikan Database Admin.
9. Implementasikan login Admin Pusat.
10. Buat model hak akses dashboard.
11. Integrasikan autentikasi Admin Pusat dengan WIP.
12. Pastikan seluruh API edit/upload WIP memverifikasi akses.
13. Buat `apps/portal`.
14. Buat placeholder Dashboard A, B, dan C.
15. Siapkan strategi deployment VPS.
16. Setelah semua stabil, merge branch migrasi ke `main`.

---

## 16. Kriteria Keberhasilan Migrasi

Migrasi dianggap berhasil apabila:

- [ ] Repository telah menggunakan struktur monorepo.
- [ ] Dashboard WIP dapat dijalankan dari `apps/dashboard-wip`.
- [ ] Dashboard WIP publik tetap dapat diakses tanpa login.
- [ ] Data WIP tetap menggunakan database yang benar.
- [ ] Admin Pusat dapat dijalankan secara terpisah.
- [ ] Administrator memiliki mekanisme login terpusat.
- [ ] Hak akses admin dapat dibatasi berdasarkan dashboard.
- [ ] Endpoint/API yang mengubah data tidak dapat diakses tanpa autentikasi dan otorisasi.
- [ ] Dashboard A, B, dan C memiliki struktur awal untuk pengembangan berikutnya.
- [ ] Setiap aplikasi dapat dikonfigurasi dan dideploy secara terpisah.
- [ ] Tidak ada credential asli yang tersimpan di Git.
- [ ] Branch utama tetap dapat digunakan sebagai titik pemulihan apabila migrasi gagal.

---

## 17. Kesimpulan

Arsitektur yang digunakan adalah **satu repository monorepo dengan beberapa aplikasi Next.js yang terpisah secara fungsional**. Dashboard WIP tetap menjadi aplikasi tersendiri dan database bisnisnya tidak digabung dengan dashboard lain. Sementara itu, autentikasi administrator dan pengelolaan hak akses dipusatkan pada aplikasi Admin Pusat.

Migrasi dilakukan dengan memindahkan proyek WIP yang sudah ada ke `apps/dashboard-wip`, bukan membangun ulang dashboard dari nol. Setelah WIP stabil dalam monorepo, Admin Pusat dibangun dan diintegrasikan secara bertahap. Struktur untuk Portal, Dashboard A, Dashboard B, dan Dashboard C dapat disiapkan sejak awal meskipun masih kosong, sehingga pengembangan berikutnya dan deployment ke VPS memiliki pola yang konsisten.
