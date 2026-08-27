# Dashboard Platform Monorepo

Repository ini menyimpan seluruh aplikasi platform dashboard (Portal, Admin Pusat, Dashboard WIP, Dashboard A, Dashboard B, dan Dashboard C) dalam struktur **Monorepo**.

## Struktur Workspace

```text
dashboard-platform/
├── apps/
│   ├── portal/            # Portal Halaman Utama (Akses Publik)
│   ├── admin/             # Admin Pusat (Login, Management Admin & Hak Akses)
│   ├── dashboard-wip/     # Dashboard WIP / Cost Control (Publik/Read & Admin Edit)
│   ├── dashboard-a/       # Placeholder Dashboard A
│   ├── dashboard-b/       # Placeholder Dashboard B
│   └── dashboard-c/       # Placeholder Dashboard C
├── packages/
│   └── shared/            # Kode bersama
├── package.json           # Root Workspace
├── turbo.json             # Turbo Orchestration Config
└── doc/                   # Dokumentasi Arsitektur & Migrasi
```

## Memulai Pengembangan

### 1. Install Dependencies
```bash
npm install
```

### 2. Menjalankan Seluruh Aplikasi (Dev)
```bash
npm run dev
```

### 3. Menjalankan Aplikasi Tertentu
- **Dashboard WIP**: `npm run dev:wip` atau `npm run dev --workspace=apps/dashboard-wip`
- **Admin Pusat**: `npm run dev:admin` atau `npm run dev --workspace=apps/admin`
- **Portal**: `npm run dev:portal` atau `npm run dev --workspace=apps/portal`

### 4. Build Seluruh Aplikasi
```bash
npm run build
```
terima kasih
