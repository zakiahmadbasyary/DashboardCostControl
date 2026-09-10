# Plantation Group 1 — Cost Control Multi-Dashboard Monorepo Platform

Repository ini menyimpan seluruh aplikasi platform **Cost Control Portal** (Portal Utama, Admin Pusat, dan **9 Modul Dashboard Cost Control**) dalam arsitektur **Turborepo Monorepo**.

---

## 🏛️ Struktur Workspace & Port Mapping

| No | Modul Dashboard | Folder Workspace (`apps/`) | Role & Deskripsi Modul | Port Dev | Perintah Shortcut |
|----|-----------------|--------------------------|------------------------|----------|-------------------|
| 1 | **Portal Utama** | `apps/portal` | Landing page terpusat 9 menu cost control | `3000` | `npm run dev:portal` |
| 2 | **WIP** | `apps/dashboard-wip` | Monitoring Work In Process ACC | `3001` | `npm run dev:wip` |
| 3 | **HPP** | `apps/dashboard-hpp` | Analisis Harga Pokok Produksi | `3002` | `npm run dev:hpp` |
| 4 | **Capex** | `apps/dashboard-capex` | Pengawasan Capital Expenditure (Belanja Modal) | `3003` | `npm run dev:capex` |
| 5 | **Opex** | `apps/dashboard-opex` | Monitoring Operational Expenditure (Biaya Operasional) | `3004` | `npm run dev:opex` |
| 6 | **Admin Pusat** | `apps/admin` | Pusat Administrasi, Single Sign-On (SSO) & Akses User | `3005` | `npm run dev:admin` |
| 7 | **Irigasi** | `apps/dashboard-irigasi` | Pengawasan Biaya Pengairan & Infrastruktur Irigasi | `3006` | `npm run dev:irigasi` |
| 8 | **Sulam** | `apps/dashboard-sulam` | Monitoring Biaya Pemeliharaan & Penyulaman Tanaman | `3007` | `npm run dev:sulam` |
| 9 | **Selesai Bongkar** | `apps/dashboard-selesai-bongkar` | Evaluasi Pasca Selesai Bongkar & Land Prep | `3008` | `npm run dev:selesai-bongkar` |
| 10 | **Harga Material** | `apps/dashboard-harga-material` | Master Data Logistik & Fluktuasi Harga Material | `3009` | `npm run dev:harga-material` |
| 11 | **Poll PG 1** | `apps/dashboard-poll-pg1` | Pengendalian Biaya Pool Armada & Transportasi PG1 | `3010` | `npm run dev:poll-pg1` |

---

## 📂 Pohon Direktori Monorepo

```text
dashboard-platform/
├── apps/
│   ├── portal/                    # Portal Halaman Utama (Port 3000)
│   ├── dashboard-wip/             # Dashboard WIP ACC (Port 3001)
│   ├── dashboard-hpp/             # Dashboard HPP (Port 3002)
│   ├── dashboard-capex/           # Dashboard Capex (Port 3003)
│   ├── dashboard-opex/            # Dashboard Opex (Port 3004)
│   ├── admin/                     # Admin Pusat & Single Sign-On (Port 3005)
│   ├── dashboard-irigasi/         # Dashboard Irigasi (Port 3006)
│   ├── dashboard-sulam/           # Dashboard Sulam (Port 3007)
│   ├── dashboard-selesai-bongkar/ # Dashboard Selesai Bongkar (Port 3008)
│   ├── dashboard-harga-material/  # Dashboard Harga Material (Port 3009)
│   └── dashboard-poll-pg1/        # Dashboard Poll PG 1 (Port 3010)
├── packages/
│   └── shared-ui/                 # Paket Komponen & Konfigurasi Navigasi Bersama
├── package.json                   # Root Workspace & Dev Commands Shortcut
├── turbo.json                     # Konfigurasi Orkestrasi Turborepo
└── README.md                      # Dokumentasi Proyek
```

---

## 🚀 Memulai Pengembangan

### 1. Install Dependencies
```bash
npm install
```

### 2. Menjalankan Seluruh Aplikasi Secara Simultan (Dev Mode)
```bash
npm run dev
```
*(Perintah ini akan menjalankan Turborepo dev server dengan concurrency 20 untuk memuat ke-11 aplikasi sekaligus).*

### 3. Menjalankan Modul Tertentu
- **Portal Utama**: `npm run dev:portal`
- **Dashboard WIP**: `npm run dev:wip`
- **Dashboard HPP**: `npm run dev:hpp`
- **Dashboard Capex**: `npm run dev:capex`
- **Dashboard Opex**: `npm run dev:opex`
- **Admin Pusat**: `npm run dev:admin`
- **Dashboard Irigasi**: `npm run dev:irigasi`
- **Dashboard Sulam**: `npm run dev:sulam`
- **Dashboard Selesai Bongkar**: `npm run dev:selesai-bongkar`
- **Dashboard Harga Material**: `npm run dev:harga-material`
- **Dashboard Poll PG 1**: `npm run dev:poll-pg1`

### 4. Build Seluruh Aplikasi (Production Bundle)
```bash
npm run build
```

---

## 💻 Arsitektur Navigasi Shared UI

Seluruh aplikasi mengonsumsi paket `@dashboard/shared-ui` yang mengelola:
- **`PublicNavbar`**: Komponen header navigasi terpadu dengan dukungan horizontal scroll pada desktop dan drawer responsif pada mobile.
- **`getDashboardNavConfig`**: Pusat konfigurasi tautan dan metadata 9 modul cost control.
- **Single Sign-On (SSO)**: Integrasi administrasi terpusat dari Admin Pusat ke masing-masing dashboard.

---
*© 2026 GGF AgroMetric Platform — Enterprise Cost Control Portal.*

