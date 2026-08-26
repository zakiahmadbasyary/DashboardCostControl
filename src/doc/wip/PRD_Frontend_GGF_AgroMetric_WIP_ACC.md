# PRD Frontend --- GGF AgroMetric WIP ACC

**Project:** GGF AgroMetric --- WIP ACC\
**Document:** Product Requirements Document (PRD) --- Frontend\
**Status:** Frontend development phase\
**Stack:** Next.js + PostgreSQL + Prisma\
**Current data mode:** Dummy data melalui mock API/service layer\
**Primary language:** Bahasa Indonesia\
**Primary user:** Public viewer dan Admin

------------------------------------------------------------------------

## 1. Ringkasan Produk

GGF AgroMetric WIP ACC adalah dashboard Cost Control untuk menampilkan
dan menganalisis data **Work in Process (WIP) ACC**.

Aplikasi terdiri dari tiga area utama:

1.  **Public Dashboard** --- dapat diakses tanpa login.
2.  **Login Admin** --- autentikasi menggunakan username dan password.
3.  **Admin Panel** --- digunakan untuk mengelola data sumber, melihat
    preview data, dan melihat log aktivitas.

Pada tahap frontend, seluruh data menggunakan **dummy data** tetapi
akses datanya dibuat melalui **API/service abstraction** agar nantinya
mudah diganti ke API backend yang terhubung ke PostgreSQL dan Prisma.

------------------------------------------------------------------------

# 2. Tujuan

## 2.1 Tujuan Utama

Membangun frontend dashboard WIP ACC yang:

-   Mudah digunakan untuk analisis Cost Control.
-   Memiliki filter yang saling terhubung.
-   Menampilkan trend cost berdasarkan umur tanaman.
-   Menampilkan data lokasi berdasarkan filter.
-   Memungkinkan user memilih lokasi untuk melihat Group Cost.
-   Memungkinkan user memilih Group Cost untuk melihat aktivitas.
-   Memisahkan akses publik dan administrasi.
-   Memiliki struktur frontend yang siap diintegrasikan dengan backend
    Next.js, PostgreSQL, dan Prisma.

## 2.2 Tujuan Tahap Frontend

Pada tahap awal:

-   UI/UX diselesaikan terlebih dahulu.
-   Data menggunakan dummy data.
-   API dibuat dalam bentuk mock API/service layer.
-   State dan alur interaksi dibuat seperti kondisi sistem sebenarnya.
-   Database PostgreSQL dan Prisma belum menjadi sumber data frontend.
-   Struktur API dibuat agar dapat diganti ke API backend tanpa mengubah
    komponen UI secara besar.

------------------------------------------------------------------------

# 3. Ruang Lingkup

## In Scope

-   Public WIP ACC dashboard.
-   Login admin.
-   Admin panel.
-   Upload data UI.
-   Preview data UI.
-   Activity log UI.
-   Filter dashboard.
-   Trend cost chart.
-   Tabel trend cost.
-   Analisis lokasi.
-   Group Cost.
-   Aktivitas.
-   Mock API.
-   Loading state.
-   Empty state.
-   Error state.
-   Success state.
-   Responsive desktop interface.
-   GGF visual identity.

## Out of Scope pada Tahap Frontend

-   Implementasi database production.
-   Proses parsing Excel production.
-   Validasi file production.
-   JWT/session production.
-   Password hashing production.
-   Role/permission kompleks.
-   Perhitungan cost production dari database.
-   Deployment production.
-   Integrasi PostgreSQL production.

------------------------------------------------------------------------

# 4. Struktur Aplikasi

Struktur navigasi utama:

``` text
Public
│
└── / 
    └── WIP ACC Dashboard

Authentication
│
└── /login
    └── Admin Login

Admin
│
└── /admin
    ├── Dashboard Admin
    ├── /upload
    │   └── Upload Data
    ├── /preview
    │   └── Preview Data
    └── /logs
        └── Log Aktivitas
```

Public user tidak perlu login.

Alur admin:

``` text
Dashboard Public
      │
      ▼
   Masuk
      │
      ▼
   /login
      │
      │ username + password benar
      ▼
 /admin
      │
      ├── Upload Data
      ├── Preview Data
      └── Log Aktivitas
```

------------------------------------------------------------------------

# 5. Role dan Hak Akses

## Public

Public user dapat:

-   Membuka dashboard.
-   Menggunakan filter.
-   Melihat grafik trend.
-   Melihat tabel trend.
-   Memilih umur tanaman dan wilayah.
-   Memilih lokasi.
-   Melihat Group Cost lokasi.
-   Memilih Group Cost.
-   Melihat aktivitas.

Public user tidak dapat:

-   Upload data.
-   Melihat log aktivitas admin.
-   Mengakses halaman admin.

## Admin

Admin dapat:

-   Login.
-   Mengakses Admin Panel.
-   Upload Data Lokasi.
-   Upload Data SBT.
-   Upload Data Aktivitas.
-   Melihat preview data.
-   Melihat log aktivitas.
-   Logout.

------------------------------------------------------------------------

# 6. Design System

## 6.1 Brand

Gunakan Great Giant Foods sebagai referensi visual.

Tone utama:

-   GGF Green.
-   White.
-   Light neutral gray.
-   Dark green.
-   Natural green.
-   Orange.
-   Blue.

Warna utama:

``` text
Primary Green  #16823B
Dark Green     #0B6B32
Light Green    #A8D437
Orange         #F9A91B
Yellow Green   #D7E515
Blue           #29A9D6
Background     #F7F9F7
Card           #FFFFFF
Border         #DDE5DF
Text           #17231B
Secondary Text #5F6B63
Muted Text     #89938D
```

Gunakan hijau sebagai identitas utama, tetapi jangan membuat seluruh
dashboard berwarna hijau.

## 6.2 Prinsip UI

-   Clean.
-   Corporate.
-   Data-oriented.
-   Mudah dibaca.
-   Tidak menggunakan style Excel lama.
-   Tidak menggunakan bevel/3D button.
-   Tidak menggunakan warna berlebihan.
-   Chart menggunakan palette GGF.
-   Table menggunakan background netral.
-   Active state menggunakan GGF Green.
-   Status success menggunakan green.
-   Warning menggunakan orange.
-   Error menggunakan red.
-   Information menggunakan blue.

------------------------------------------------------------------------

# 7. Halaman Public Dashboard

**Route:** `/`

## 7.1 Header

Header berisi:

-   Logo/brand GGF AgroMetric.
-   Nama aplikasi.
-   Status/module WIP ACC.
-   Tombol **Masuk** untuk admin.

Contoh:

``` text
GGF AgroMetric    WIP ACC                              [Masuk]
```

Tombol Masuk mengarah ke `/login`.

------------------------------------------------------------------------

# 8. Filter Utama Dashboard

Filter utama berada di bagian atas dashboard.

Filter:

1.  Status
2.  Jenis Bibit
3.  Kelas Bibit
4.  Group Cost

Contoh nilai:

### Status

-   Semua Status
-   NS
-   Status lainnya

### Jenis Bibit

-   Semua Jenis
-   Bibit A
-   Bibit B
-   Bibit C

### Kelas Bibit

-   Semua Kelas
-   Kelas 1
-   Kelas 2
-   Kelas 3

### Group Cost

-   Total Cost
-   Fertilization
-   Plant Pest Control
-   Road and Drainage
-   Weed Control
-   Planting
-   Land Preparation
-   Maintenance
-   Harvesting

Tombol:

-   Reset
-   Terapkan Filter

## 8.1 Perilaku Filter

Keempat filter utama harus menjadi **global filter dashboard**.

Ketika user mengubah salah satu filter dan menekan **Terapkan Filter**,
data berikut harus ikut berubah:

-   Grafik trend cost.
-   Tabel trend cost.
-   Data analisis lokasi.
-   Group Cost.
-   Aktivitas.

Konsep:

``` text
Filter Utama
     │
     ├── Trend Chart
     ├── Trend Table
     ├── Analisis Lokasi
     ├── Group Cost
     └── Aktivitas
```

Reset mengembalikan seluruh filter ke nilai default.

------------------------------------------------------------------------

# 9. Trend Cost per Umur Tanaman

## 9.1 Chart

Judul:

**Trend Cost per Umur Tanaman**

Chart menampilkan cost berdasarkan umur tanaman.

X-axis:

``` text
Umur Tanaman
1 ... 20
```

Y-axis:

``` text
Cost / Cost per Ha
```

Data dapat dibedakan berdasarkan Wilayah.

Contoh:

-   AW01
-   AW02
-   AW03
-   AW04
-   AW05
-   AW06
-   AW07

## 9.2 Tabel Trend

Chart dan tabel harus menggunakan **dataset trend yang sama**.

Tabel berada di bawah chart.

Struktur:

  Wilayah        1      2      3      4   ...     20
  --------- ------ ------ ------ ------ ----- ------
  AW01        12.5   14.2   15.8   18.1   ...   68.0
  AW02        11.8   13.5   15.2   17.4   ...   67.0

Jika filter utama berubah, chart dan tabel harus berubah secara
konsisten.

## 9.3 Interaksi

Hover chart menampilkan:

-   Wilayah.
-   Umur.
-   Cost.
-   Cost/Ha jika tersedia.

------------------------------------------------------------------------

# 10. Analisis Lokasi

Section:

**Analisis Lokasi**

Memiliki dua filter tambahan:

1.  Umur
2.  Wilayah

Filter ini berbeda dari empat filter utama.

Contoh:

``` text
[Semua Umur] [Semua Wilayah]
```

## 10.1 Fungsi Filter Tambahan

Filter Umur dan Wilayah hanya mengatur data pada konteks analisis lokasi
dan data turunannya.

Namun Group Cost dan Aktivitas tetap mengikuti konteks filter dashboard
utama.

## 10.2 Tabel Lokasi

Kolom:

  Lokasi     Cost/Ha   Luas   Total Cost Jenis Bibit   Kelas
  -------- --------- ------ ------------ ------------- -------

Contoh:

``` text
010A
011B
012F
013C
014D
```

------------------------------------------------------------------------

# 11. Selection Lokasi → Group Cost

Ketika user memilih satu baris lokasi:

``` text
Lokasi 012F
```

maka section Group Cost menampilkan data khusus untuk lokasi tersebut.

Lokasi yang dipilih harus diberi visual state:

-   Background light green.
-   Green indicator/border.
-   Selected state yang jelas.

Contoh:

``` text
Analisis Lokasi
┌─────────────────────────────────────┐
│ 010A                                │
│ 011B                                │
│ 012F   ← SELECTED                  │
│ 013C                                │
│ 014D                                │
└─────────────────────────────────────┘
```

------------------------------------------------------------------------

# 12. Group Cost

Section:

**Group Cost**

Menampilkan Group Cost berdasarkan lokasi yang dipilih.

Contoh:

  Group Cost              Cost/Ha         SBT
  ------------------- ----------- -----------
  Fertilization         4.200.000   4.000.000
  Road and Drainage     1.500.000   1.600.000
  Maintenance           2.100.000   2.100.000
  Harvesting            1.300.000   1.200.000

Group Cost yang dipilih diberi selected state.

Jika belum ada lokasi yang dipilih:

``` text
Pilih lokasi untuk melihat Group Cost.
```

------------------------------------------------------------------------

# 13. Selection Group Cost → Aktivitas

Ketika user memilih satu Group Cost:

``` text
Road and Drainage
```

section Aktivitas harus berubah mengikuti Group Cost tersebut.

Contoh:

  Aktivitas                 Kelas         Biaya
  ------------------------- --------- ---------
  Pembersihan Parit Utama   Kelas A     450.000
  Perbaikan Jalan Panen     Kelas B     850.000
  Rawat Jembatan Kayu       Kelas A     200.000

Jika belum ada Group Cost yang dipilih:

``` text
Pilih Group Cost untuk melihat aktivitas.
```

------------------------------------------------------------------------

# 14. Hierarki Interaksi Dashboard

Hubungan interaksi dashboard:

``` text
GLOBAL FILTER
Status
Jenis Bibit
Kelas Bibit
Group Cost
      │
      ▼
Trend Cost
      │
      ├── Chart
      └── Table
      │
      ▼
Analisis Lokasi
      │
      ├── Filter Umur
      ├── Filter Wilayah
      └── Select Lokasi
              │
              ▼
          Group Cost
              │
              └── Select Group Cost
                      │
                      ▼
                  Aktivitas
```

Ini merupakan alur interaksi utama aplikasi.

------------------------------------------------------------------------

# 15. Login Admin

**Route:** `/login`

Form:

-   Username.
-   Password.
-   Tombol Masuk.
-   Tombol/keterangan kembali ke dashboard.

Validasi frontend:

-   Username wajib diisi.
-   Password wajib diisi.
-   Tampilkan error jika kredensial dummy salah.

Untuk tahap frontend, gunakan dummy account.

Contoh:

``` text
username: admin
password: admin123
```

Kredensial tersebut hanya untuk mock development dan tidak digunakan
pada production.

## 15.1 Login State

State:

-   Idle.
-   Loading.
-   Success.
-   Invalid credential.
-   Error.

Setelah berhasil:

``` text
/login
   ↓
/admin
```

------------------------------------------------------------------------

# 16. Admin Panel

Admin Panel menggunakan sidebar.

Menu:

-   Upload Data.
-   Preview Data.
-   Log Aktivitas.
-   Logout.

Admin panel tidak menampilkan dashboard analitik WIP ACC sebagai halaman
utamanya.

Fokus Admin Panel adalah:

``` text
Data Management
+
Activity Monitoring
```

------------------------------------------------------------------------

# 17. Admin --- Upload Data

**Route:** `/admin/upload`

Terdapat tiga sumber data.

## 17.1 Data Lokasi

Merupakan sumber data untuk tabel **Lokasi/Data Utama** pada ERD.

Deskripsi:

**Data cost per lokasi.**

File:

-   `.xlsx`
-   `.xls`
-   `.csv`

UI:

-   Drag and drop.
-   Pilih file.
-   Nama file.
-   Ukuran file.
-   Progress.
-   Status.
-   Upload.
-   Replace.

Status:

-   Belum dipilih.
-   Uploading.
-   Berhasil.
-   Gagal.
-   Validasi.

## 17.2 Data SBT

Sumber data SBT.

UI upload sama dengan Data Lokasi.

## 17.3 Data Aktivitas

Sumber data aktivitas.

UI upload sama dengan Data Lokasi.

------------------------------------------------------------------------

# 18. Mock Upload API

Frontend tidak perlu langsung terhubung PostgreSQL.

Gunakan service abstraction.

Contoh:

``` text
src/
├── app/
├── components/
├── services/
│   ├── dashboardService.ts
│   ├── authService.ts
│   ├── uploadService.ts
│   ├── previewService.ts
│   └── activityLogService.ts
├── mocks/
│   ├── dashboardData.ts
│   ├── users.ts
│   ├── sourceData.ts
│   └── activityLogs.ts
└── types/
    ├── dashboard.ts
    ├── auth.ts
    ├── sourceData.ts
    └── activityLog.ts
```

Komponen UI tidak boleh langsung mengambil dummy data dari file mock.

Gunakan service:

``` text
Component
   ↓
Service
   ↓
Mock API
   ↓
Mock Data
```

Nantinya:

``` text
Component
   ↓
Service
   ↓
Next.js API
   ↓
Prisma
   ↓
PostgreSQL
```

Dengan pola ini, pergantian dummy API ke backend production lebih mudah.

------------------------------------------------------------------------

# 19. Preview Data

**Route:** `/admin/preview`

Gunakan tab:

-   Data Lokasi.
-   Data SBT.
-   Aktivitas.

## 19.1 Data Lokasi

Preview kolom berdasarkan struktur data sumber/ERD.

Kolom konseptual:

-   ID Lokasi.
-   Lokasi.
-   Wilayah.
-   Status.
-   Luas.
-   Umur.
-   Kelas.
-   Group Cost.
-   Keterangan GC.
-   Cost.
-   Cost/Ha.
-   Pupuk.

## 19.2 Data SBT

Kolom konseptual:

-   Code.
-   Nilai SBT.

## 19.3 Data Aktivitas

Kolom:

-   ID Aktivitas.
-   Aktivitas.
-   Kelas.
-   Biaya.
-   Group Cost.
-   Keterangan GC.

## 19.4 Table Features

-   Search.
-   Filter.
-   Sort.
-   Pagination.
-   Column visibility.
-   Horizontal scroll.
-   Total records.

------------------------------------------------------------------------

# 20. Log Aktivitas Admin

**Route:** `/admin/logs`

Log aktivitas digunakan untuk mencatat aktivitas penting admin.

Contoh aktivitas:

-   LOGIN.
-   LOGOUT.
-   UPLOAD_DATA.
-   REPLACE_DATA.
-   DELETE_DATA jika nantinya tersedia.
-   VALIDATE_DATA.

Tidak perlu mencatat aktivitas UI kecil seperti:

-   Membuka dropdown.
-   Scroll.
-   Klik tabel.
-   Membuka halaman.

## 20.1 Log Table

  Waktu          Admin   Aktivitas     Sumber Data   Keterangan
  -------------- ------- ------------- ------------- -----------------
  17 Aug 08:15   admin   UPLOAD_DATA   Data Lokasi   Upload berhasil
  17 Aug 08:10   admin   UPLOAD_DATA   Data SBT      Upload berhasil
  17 Aug 08:00   admin   LOGIN         \-            Login berhasil

## 20.2 Filter Log

-   Admin.
-   Jenis aktivitas.
-   Sumber data.
-   Tanggal.

------------------------------------------------------------------------

# 21. Struktur Data dan ERD

Database konseptual mengikuti ERD yang diberikan.

Kelompok data utama:

``` text
Data Lokasi
Data SBT
Data Aktivitas
```

Relasi bisnis:

``` text
Data Lokasi
     │
     ▼
   Lokasi
     │
     ▼
 Group Cost
     │
     ▼
 Aktivitas

Data SBT
     │
     ▼
 Group Cost
```

Pada tahap frontend, ERD menjadi acuan struktur object/type dan alur
filtering.

Jangan membuat frontend mengasumsikan seluruh tabel harus mempunyai
relasi langsung.

------------------------------------------------------------------------

# 22. Struktur Database Admin

Untuk kebutuhan autentikasi dan log:

``` text
User
  │
  │ 1:N
  ▼
ActivityLog
```

Konseptual:

## User

``` text
id
username
password
role
createdAt
updatedAt
```

## ActivityLog

``` text
id
userId
action
dataSource
fileName
description
createdAt
```

Implementasi database production dilakukan pada tahap backend.

------------------------------------------------------------------------

# 23. TypeScript Data Contract

Frontend harus menggunakan type/interface.

Contoh:

``` ts
interface DashboardFilter {
  status: string;
  jenisBibit: string;
  kelasBibit: string;
  groupCost: string;
}

interface LocationFilter {
  umur: number | "all";
  wilayah: string | "all";
}

interface LocationData {
  idLokasi: string;
  lokasi: string;
  wilayah: string;
  umur: number;
  kelas: string;
  jenisBibit: string;
  groupCost: string;
  cost: number;
  costHa: number;
  luas: number;
}

interface GroupCostData {
  groupCost: string;
  costHa: number;
  sbt: number;
}

interface ActivityData {
  idAktivitas: string;
  aktivitas: string;
  kelas: string;
  biaya: number;
  groupCost: string;
}
```

Type dapat disesuaikan ketika struktur data final sudah ditetapkan.

------------------------------------------------------------------------

# 24. Mock API Contract

Walaupun backend belum dibuat, frontend menggunakan endpoint konseptual.

## Dashboard

``` text
GET /api/dashboard/trend
GET /api/dashboard/locations
GET /api/dashboard/group-cost
GET /api/dashboard/activities
```

## Authentication

``` text
POST /api/auth/login
POST /api/auth/logout
```

## Upload

``` text
POST /api/admin/upload/location
POST /api/admin/upload/sbt
POST /api/admin/upload/activity
```

## Preview

``` text
GET /api/admin/data/location
GET /api/admin/data/sbt
GET /api/admin/data/activity
```

## Activity Log

``` text
GET /api/admin/activity-logs
```

Pada tahap frontend, endpoint tersebut dapat disimulasikan melalui mock
service.

------------------------------------------------------------------------

# 25. State Management

State minimum yang diperlukan:

## Dashboard

``` text
globalFilters
locationFilters
selectedLocation
selectedGroupCost
trendData
locationData
groupCostData
activityData
loading
error
```

## Login

``` text
username
password
isLoading
error
isAuthenticated
```

## Admin

``` text
uploadState
selectedDataSource
previewData
activityLogs
```

------------------------------------------------------------------------

# 26. Loading State

Semua data yang berasal dari service/API harus memiliki loading state.

Contoh:

-   Skeleton chart.
-   Skeleton table.
-   Loading spinner pada tombol.
-   Upload progress.

Jangan langsung menampilkan empty state ketika data masih loading.

------------------------------------------------------------------------

# 27. Empty State

Contoh:

### Belum memilih lokasi

> Pilih lokasi pada Analisis Lokasi untuk melihat Group Cost.

### Belum memilih Group Cost

> Pilih Group Cost untuk melihat aktivitas.

### Tidak ada hasil filter

> Tidak ada data yang sesuai dengan filter yang dipilih.

### Data belum tersedia

> Data belum tersedia. Silakan upload sumber data melalui Admin Panel.

------------------------------------------------------------------------

# 28. Error State

Error harus ditampilkan secara jelas.

Contoh:

> Gagal mengambil data trend.

Button:

**Coba Lagi**

Upload error:

> File gagal divalidasi. Periksa format dan struktur kolom.

------------------------------------------------------------------------

# 29. Responsive Requirement

Prioritas utama:

-   Desktop.
-   Laptop.

Dashboard harus tetap usable pada tablet.

Untuk layar kecil:

-   Filter menjadi stacked.
-   Tabel dapat horizontal scroll.
-   Group Cost dan Aktivitas menjadi stacked.
-   Sidebar admin menjadi collapsible.
-   Chart responsive.

------------------------------------------------------------------------

# 30. Component Architecture

Contoh struktur:

``` text
src/
├── app/
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── admin/
│       ├── page.tsx
│       ├── upload/
│       │   └── page.tsx
│       ├── preview/
│       │   └── page.tsx
│       └── logs/
│           └── page.tsx
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── GlobalFilters.tsx
│   │   ├── TrendChart.tsx
│   │   ├── TrendTable.tsx
│   │   ├── LocationAnalysis.tsx
│   │   ├── GroupCostTable.tsx
│   │   └── ActivityTable.tsx
│   │
│   ├── auth/
│   │   └── LoginForm.tsx
│   │
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── UploadCard.tsx
│       ├── DataPreviewTable.tsx
│       └── ActivityLogTable.tsx
│
├── services/
├── mocks/
├── types/
└── lib/
```

------------------------------------------------------------------------

# 31. Acceptance Criteria --- Public Dashboard

Dashboard dianggap selesai apabila:

-   [ ] Dashboard dapat dibuka tanpa login.
-   [ ] Empat filter utama tersedia.
-   [ ] Filter utama memengaruhi seluruh data dashboard.
-   [ ] Tombol Reset berfungsi.
-   [ ] Grafik trend tampil.
-   [ ] Tabel trend menggunakan data yang sama dengan grafik.
-   [ ] Filter umur analisis lokasi berfungsi.
-   [ ] Filter wilayah analisis lokasi berfungsi.
-   [ ] User dapat memilih lokasi.
-   [ ] Lokasi terpilih memengaruhi Group Cost.
-   [ ] User dapat memilih Group Cost.
-   [ ] Group Cost terpilih memengaruhi Aktivitas.
-   [ ] Loading state tersedia.
-   [ ] Empty state tersedia.
-   [ ] Error state tersedia.

------------------------------------------------------------------------

# 32. Acceptance Criteria --- Login

-   [ ] Halaman login tersedia di `/login`.
-   [ ] Username dapat diinput.
-   [ ] Password dapat diinput.
-   [ ] Validasi field tersedia.
-   [ ] Dummy credential tersedia.
-   [ ] Loading state tersedia.
-   [ ] Error credential ditampilkan.
-   [ ] Login berhasil mengarah ke `/admin`.
-   [ ] Tombol kembali dapat menuju dashboard publik.

------------------------------------------------------------------------

# 33. Acceptance Criteria --- Admin

-   [ ] Admin Panel hanya dapat diakses setelah login pada implementasi
    final.
-   [ ] Halaman Upload tersedia.
-   [ ] Tiga sumber data tersedia.
-   [ ] File dapat dipilih melalui UI.
-   [ ] Progress upload dapat disimulasikan.
-   [ ] Status upload dapat ditampilkan.
-   [ ] Preview Data tersedia.
-   [ ] Data Lokasi dapat dipreview.
-   [ ] Data SBT dapat dipreview.
-   [ ] Data Aktivitas dapat dipreview.
-   [ ] Log Aktivitas tersedia.
-   [ ] Logout tersedia.

------------------------------------------------------------------------

# 34. Tahapan Implementasi Frontend

## Phase 1 --- Setup

-   [ ] Setup Next.js.
-   [ ] Setup TypeScript.
-   [ ] Setup Tailwind CSS.
-   [ ] Setup component library jika digunakan.
-   [ ] Setup folder architecture.
-   [ ] Setup type definitions.

## Phase 2 --- Mock Data/API

-   [ ] Buat dummy data.
-   [ ] Buat mock service.
-   [ ] Buat API contract.
-   [ ] Buat data types.
-   [ ] Pastikan komponen tidak bergantung langsung pada file mock.

## Phase 3 --- Public Dashboard

-   [ ] Header.
-   [ ] Global filters.
-   [ ] Trend chart.
-   [ ] Trend table.
-   [ ] Location analysis.
-   [ ] Group Cost.
-   [ ] Activity.
-   [ ] Interaction antar section.

## Phase 4 --- Login

-   [ ] Login UI.
-   [ ] Dummy authentication.
-   [ ] Loading.
-   [ ] Error.
-   [ ] Redirect admin.

## Phase 5 --- Admin Panel

-   [ ] Sidebar.
-   [ ] Upload Data.
-   [ ] Preview Data.
-   [ ] Activity Log.
-   [ ] Logout.

## Phase 6 --- UX Refinement

-   [ ] Loading state.
-   [ ] Empty state.
-   [ ] Error state.
-   [ ] Responsive.
-   [ ] Accessibility.
-   [ ] Consistency.
-   [ ] Final GGF branding.

## Phase 7 --- Backend Integration

Setelah frontend stabil:

``` text
Mock Service
     ↓
Next.js API
     ↓
Prisma
     ↓
PostgreSQL
```

Ganti implementasi service tanpa mengubah kontrak data yang digunakan
komponen sebisa mungkin.

------------------------------------------------------------------------

# 35. Prinsip Penting Pengembangan

1.  **Dashboard publik adalah halaman utama aplikasi.**
2.  **Public user tidak perlu login.**
3.  **Login hanya untuk admin.**
4.  **Admin berfokus pada pengelolaan data sumber dan log aktivitas.**
5.  **Empat filter utama bersifat global terhadap dashboard.**
6.  **Dua filter tambahan khusus untuk Analisis Lokasi.**
7.  **Pemilihan lokasi mengontrol Group Cost.**
8.  **Pemilihan Group Cost mengontrol Aktivitas.**
9.  **Chart dan tabel trend harus menggunakan sumber data yang sama.**
10. **Frontend menggunakan dummy data melalui service/mock API.**
11. **Komponen UI tidak mengambil data langsung dari mock file.**
12. **Struktur service dibuat agar mudah diganti ke Next.js API +
    Prisma + PostgreSQL.**
13. **User dan ActivityLog merupakan bagian database admin.**
14. **Tiga sumber data utama adalah Data Lokasi, Data SBT, dan Data
    Aktivitas.**
15. **ERD menjadi acuan struktur data dan relasi bisnis, tetapi frontend
    tidak perlu memvisualisasikan ERD teknis pada dashboard.**
16. **GGF menjadi acuan utama visual branding.**
17. **Prioritaskan keterbacaan data dibanding dekorasi.**

------------------------------------------------------------------------

# 36. Definition of Done --- Frontend

Frontend tahap pertama dinyatakan selesai apabila seluruh alur berikut
dapat dilakukan menggunakan dummy API:

``` text
Buka Website
    ↓
Public WIP ACC Dashboard
    ↓
Pilih Filter Utama
    ↓
Trend Chart + Trend Table berubah
    ↓
Filter Umur/Wilayah
    ↓
Pilih Lokasi
    ↓
Group Cost berubah
    ↓
Pilih Group Cost
    ↓
Aktivitas berubah
```

Dan alur admin:

``` text
Public Dashboard
    ↓
Masuk
    ↓
Login
    ↓
Admin Panel
    ↓
Upload Data
    ↓
Preview Data
    ↓
Log Aktivitas
    ↓
Logout
```

Semua alur harus dapat berjalan menggunakan dummy data dan mock API
sebelum backend PostgreSQL + Prisma diintegrasikan.
