# Database Specification --- GGF AgroMetric WIP ACC

**Project:** GGF AgroMetric --- WIP ACC\
**Database:** PostgreSQL\
**ORM:** Prisma\
**Backend:** Next.js Fullstack\
**Status:** Initial database design

## 1. Tujuan

Database WIP ACC menyimpan tiga sumber data utama:

1.  Data Lokasi
2.  Data Aktivitas
3.  Data SBT

Selain itu, database menyimpan kebutuhan administrasi:

4.  User
5.  Activity Log

Data sumber digunakan untuk menghasilkan dataset dashboard: - Grafik
Trend Cost per Umur Tanaman - Tabel Trend Cost - Tabel Analisis Lokasi -
Tabel Group Cost - Tabel Aktivitas Pekerjaan

------------------------------------------------------------------------

# 2. Data Source

## 2.1 Data Lokasi

Data Lokasi adalah sumber utama informasi lokasi dan cost.

  Kolom         Tipe Konseptual   Keterangan
  ------------- ----------------- ------------------------
  lokasi        String            Identitas/kode lokasi
  status        String            Status data/lokasi
  kelas_bibit   String/Enum       Besar, Sedang, Kecil
  jenis_bibit   String/Enum       Sucker, Crown, Nursery
  umur          Integer           Umur tanaman, 0--21
  luas          Decimal           Luas lokasi
  group_cost    String            Kelompok biaya
  cost          Decimal           Total biaya
  code_sbt      String            Kode standar biaya
  pupuk         String/Enum       Kompos, Tanpa Kompos

### Nilai Referensi

**Kelas Bibit** - Besar - Sedang - Kecil

**Jenis Bibit** - Sucker - Crown - Nursery

**Pupuk** - Kompos - Tanpa Kompos

**Umur** - 0 sampai 21

### Pembentukan `code_sbt`

`code_sbt` merupakan kode gabungan dari:

``` text
status + pupuk + kelas_bibit + jenis_bibit + group_cost + umur
```

Contoh konseptual:

``` text
NS + Kompos + Besar + Sucker + Fertilization + 5
        ↓
    code_sbt
```

Format pemisah dan aturan encoding final ditetapkan saat implementasi
backend.

------------------------------------------------------------------------

# 3. Data Aktivitas

Data Aktivitas menyimpan pekerjaan/aktivitas yang berkaitan dengan
lokasi dan Group Cost.

  Kolom         Tipe Konseptual   Keterangan
  ------------- ----------------- ------------------
  lokasi        String            Lokasi pekerjaan
  status        String            Status
  wilayah       String            Wilayah lokasi
  luas          Decimal           Luas
  kelas_bibit   String            Kelas bibit
  aktivitas     String            Nama aktivitas
  biaya         Decimal           Biaya aktivitas
  group_cost    String            Kelompok biaya

Data ini menjadi sumber utama untuk tabel Aktivitas Pekerjaan dan sumber
`wilayah` untuk kebutuhan trend dashboard.

------------------------------------------------------------------------

# 4. Data SBT

Data SBT merupakan sumber standar biaya.

  Kolom        Tipe Konseptual   Keterangan
  ------------ ----------------- -----------------------
  code_sbt     String            Kode standar biaya
  status       String            Status
  pupuk        String            Kompos / Tanpa Kompos
  jenis        String            Jenis bibit
  kelas        String            Kelas bibit
  group_cost   String            Kelompok biaya
  umur         Integer           Umur tanaman
  nilai_sbt    Decimal           Nilai standar biaya

Relasi utama:

``` text
DataLokasi.code_sbt
        ↓
DataSBT.code_sbt
        ↓
DataSBT.nilai_sbt
```

------------------------------------------------------------------------

# 5. Relasi Konseptual

``` text
Data Lokasi
    │
    │ code_sbt
    ▼
Data SBT

Data Lokasi ────── Data Aktivitas
   │                   │
   │                   └── Wilayah
   │
   ├── Lokasi
   ├── Umur
   ├── Luas
   ├── Cost
   └── Group Cost
```

Data Lokasi dan Data Aktivitas merupakan dua source data berbeda. Key
bisnis untuk menghubungkan lokasi dengan wilayah perlu ditentukan
berdasarkan struktur file final.

------------------------------------------------------------------------

# 6. Dataset Grafik Trend Cost per Umur Tanaman

## 6.1 Sumber Data

Grafik menggunakan:

-   **Wilayah:** Data Aktivitas
-   **Umur tanaman:** Data Lokasi
-   **Cost dan luas:** Data Lokasi

`wilayah` diperoleh dari `DataAktivitas.wilayah`, sedangkan `umur`,
`cost`, dan `luas` berasal dari Data Lokasi.

Karena wilayah dan umur berasal dari source berbeda, implementasi final
membutuhkan key bisnis untuk menghubungkan lokasi dengan wilayah.

## 6.2 Perhitungan

Untuk setiap kombinasi:

``` text
Wilayah + Umur
```

nilai trend dihitung:

``` text
Trend Cost/Ha =
SUM(cost pada wilayah dan umur)
/
SUM(luas seluruh lokasi pada wilayah)
```

Sesuai definisi saat ini, denominator menggunakan **total luas seluruh
lokasi pada wilayah tersebut**, bukan hanya luas lokasi pada umur
tertentu.

Contoh konseptual:

``` text
Wilayah = AW01
Umur    = 5

SUM(cost Data Lokasi untuk AW01 + umur 5)
                 /
SUM(luas seluruh lokasi AW01)
```

Hasilnya menjadi nilai bar chart.

------------------------------------------------------------------------

# 7. Tabel Trend Cost

Tabel Trend Cost menggunakan **dataset yang sama persis dengan Bar Chart
Trend Cost per Umur Tanaman**.

Jadi tidak dibuat perhitungan berbeda untuk chart dan tabel.

Bentuk tabel:

-   Kolom/baris pertama: Wilayah
-   Kolom berikutnya: Umur 0--21
-   Setiap cell: nilai Trend Cost/Ha

Contoh:

  Wilayah     0      1      2      3   ...     21
  --------- --- ------ ------ ------ ----- ------
  AW01        0   12.5   14.2   15.8   ...   70.1
  AW02        0   11.8   13.5   15.2   ...   69.4
  AW03        0   13.2   14.9   16.5   ...   71.2

Alur:

``` text
Query Trend Cost
      │
      ├── Bar Chart
      │
      └── Trend Table
```

------------------------------------------------------------------------

# 8. Tabel Analisis Lokasi

## 8.1 Sumber

Tabel Analisis Lokasi mengambil data dari **Data Lokasi**.

Data yang ditampilkan dapat mencakup:

-   Lokasi
-   Cost/Ha
-   Luas
-   Total Cost
-   Jenis Bibit
-   Kelas
-   Umur
-   Group Cost
-   Status

## 8.2 Cost/Ha

Perhitungan:

``` text
Cost/Ha = SUM(cost) / SUM(luas)
```

Pada level satu lokasi:

``` text
Cost/Ha Lokasi =
Total Cost Lokasi
/
Total Luas Lokasi
```

Contoh:

``` text
Lokasi 012F
Cost = Rp 163.800.000
Luas = 18 Ha

Cost/Ha = Rp 163.800.000 / 18
        = Rp 9.100.000
```

## 8.3 Filter

Analisis Lokasi memiliki dua filter tambahan:

-   Umur
-   Wilayah

Filter tersebut digunakan untuk menyaring lokasi yang ditampilkan pada
tabel.

------------------------------------------------------------------------

# 9. Tabel Group Cost

## 9.1 Sumber

Group Cost mengambil data utama dari **Data Lokasi**.

Data yang digunakan:

-   Lokasi terpilih
-   Group Cost
-   Cost
-   Luas
-   Code SBT

Ketika user memilih satu lokasi pada Analisis Lokasi:

``` text
Selected Lokasi
      ↓
Data Lokasi
      ↓
Group Cost
```

## 9.2 Cost/Ha

Perhitungan:

``` text
Cost/Ha Group Cost =
SUM(cost berdasarkan lokasi + group_cost)
/
SUM(luas berdasarkan lokasi + group_cost)
```

## 9.3 SBT

Nilai SBT berasal dari **Data SBT** melalui `code_sbt`.

``` text
Data Lokasi
    │
    └── code_sbt
          ↓
       Data SBT
          ↓
      nilai_sbt
```

Jika satu Group Cost memiliki beberapa `code_sbt`, query harus
menentukan record SBT yang sesuai berdasarkan kombinasi data terkait.

------------------------------------------------------------------------

# 10. Tabel Aktivitas Pekerjaan

## 10.1 Sumber

Tabel Aktivitas Pekerjaan mengambil data dari **Data Aktivitas**.

Kolom:

-   Lokasi
-   Status
-   Wilayah
-   Luas
-   Kelas Bibit
-   Aktivitas
-   Biaya
-   Group Cost

## 10.2 Cost/Ha

Tambahkan hasil perhitungan:

``` text
Cost/Ha = Biaya / Luas
```

Jika data ditampilkan sebagai agregasi beberapa record:

``` text
Cost/Ha =
SUM(biaya)
/
SUM(luas)
```

Perhitungan mengikuti level agregasi yang sedang ditampilkan.

## 10.3 Filter Group Cost

Aktivitas ditampilkan berdasarkan Group Cost yang dipilih:

``` text
Pilih Lokasi
    ↓
Group Cost
    ↓
Pilih Group Cost
    ↓
Data Aktivitas
```

------------------------------------------------------------------------

# 11. Alur Data Dashboard

``` text
                    GLOBAL FILTER
          ┌─────────────┼─────────────┐
          │             │             │
       Status      Jenis Bibit   Kelas Bibit
          │             │             │
          └─────────────┼─────────────┘
                        │
                   Group Cost
                        │
                        ▼
              ┌──────────────────┐
              │   Trend Cost     │
              │ Chart + Table    │
              └──────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Analisis Lokasi  │
              │ Umur + Wilayah   │
              └──────────────────┘
                        │
                 Pilih Lokasi
                        │
                        ▼
              ┌──────────────────┐
              │    Group Cost    │
              └──────────────────┘
                        │
              Pilih Group Cost
                        │
                        ▼
              ┌──────────────────┐
              │    Aktivitas     │
              └──────────────────┘
```

------------------------------------------------------------------------

# 12. Global Filter

Empat filter utama dashboard:

1.  Status
2.  Jenis Bibit
3.  Kelas Bibit
4.  Group Cost

Filter tersebut menjadi filter global dan memengaruhi:

-   Grafik Trend Cost
-   Tabel Trend Cost
-   Analisis Lokasi
-   Group Cost
-   Aktivitas

Tombol:

-   Terapkan Filter
-   Reset

------------------------------------------------------------------------

# 13. Filter Analisis Lokasi

Selain global filter, terdapat:

1.  Umur
2.  Wilayah

Filter ini digunakan pada bagian Analisis Lokasi.

Alur:

``` text
Global Filter
     ↓
Analisis Lokasi
     ↑
Umur + Wilayah
     ↓
Pilih Lokasi
```

------------------------------------------------------------------------

# 14. Data Admin

## 14.1 User

  -----------------------------------------------------------------------
  Kolom                   Tipe Konseptual         Keterangan
  ----------------------- ----------------------- -----------------------
  id                      UUID/Integer            Primary key

  username                String                  Username admin

  password                String                  Password yang disimpan
                                                  secara aman/hashed pada
                                                  production

  role                    String/Enum             Role admin

  created_at              DateTime                Waktu dibuat

  updated_at              DateTime                Waktu diperbarui
  -----------------------------------------------------------------------

## 14.2 Activity Log

Activity Log menyimpan aktivitas penting admin.

Contoh:

-   LOGIN
-   LOGOUT
-   UPLOAD_DATA
-   REPLACE_DATA
-   VALIDATE_DATA

  Kolom         Tipe Konseptual   Keterangan
  ------------- ----------------- -----------------------------------------
  id            UUID/Integer      Primary key
  user_id       UUID/Integer      FK ke User
  action        String/Enum       Jenis aktivitas
  data_source   String            Data Lokasi / Data SBT / Data Aktivitas
  file_name     String            Nama file jika terkait upload
  description   String            Keterangan aktivitas
  created_at    DateTime          Waktu aktivitas

Relasi:

``` text
User 1 ───────── N ActivityLog
```

------------------------------------------------------------------------

# 15. Source Data vs Derived Data

## Source Data

Data yang disimpan sebagai sumber:

``` text
Data Lokasi
Data Aktivitas
Data SBT
```

## Derived Data

Data hasil perhitungan dashboard:

``` text
Trend Cost/Ha
Trend Table
Cost/Ha Lokasi
Cost/Ha Group Cost
Cost/Ha Aktivitas
```

Derived data tidak harus disimpan sebagai tabel permanen. Data dapat
dihitung melalui query/aggregation ketika dashboard meminta data.

Alur:

``` text
Source Data
     ↓
Query + Aggregation
     ↓
Dashboard Dataset
```

Pendekatan ini menjaga agar hasil dashboard mengikuti source data
terbaru.

------------------------------------------------------------------------

# 16. Struktur Tabel Konseptual

``` text
User
 └── ActivityLog

DataLokasi
 └── code_sbt ──── DataSBT

DataAktivitas
```

Kemudian dashboard melakukan aggregation:

``` text
DataLokasi
     ├── Trend Cost
     ├── Trend Table
     ├── Analisis Lokasi
     └── Group Cost

DataAktivitas
     ├── Wilayah untuk Trend
     └── Aktivitas Pekerjaan

DataSBT
     └── Nilai SBT untuk Group Cost
```

------------------------------------------------------------------------

# 17. Rencana Model Prisma

Konseptual:

``` prisma
model User {
  id           String         @id @default(uuid())
  username     String         @unique
  password     String
  role         String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  activityLogs ActivityLog[]
}

model ActivityLog {
  id          String   @id @default(uuid())
  userId      String
  action      String
  dataSource  String?
  fileName    String?
  description String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model DataLokasi {
  // kolom Data Lokasi
}

model DataAktivitas {
  // kolom Data Aktivitas
}

model DataSBT {
  // kolom Data SBT
}
```

Detail primary key, unique constraint, foreign key, tipe decimal, dan
index ditentukan setelah format file sumber final dipastikan.

------------------------------------------------------------------------

# 18. Index yang Dipertimbangkan

Untuk mendukung filter dan query dashboard:

## Data Lokasi

Pertimbangkan index pada:

``` text
lokasi
status
kelas_bibit
jenis_bibit
umur
group_cost
code_sbt
```

## Data Aktivitas

``` text
lokasi
status
wilayah
group_cost
aktivitas
```

## Data SBT

``` text
code_sbt
group_cost
umur
```

Index final harus disesuaikan dengan query aktual.

------------------------------------------------------------------------

# 19. Catatan Penting untuk Implementasi

Beberapa hal perlu dipastikan sebelum migration Prisma final:

1.  Format final `code_sbt`.
2.  Apakah `code_sbt` unique pada Data SBT.
3.  Key yang menghubungkan lokasi dengan wilayah karena wilayah saat ini
    disebut berasal dari Data Aktivitas sedangkan lokasi dan umur
    berasal dari Data Lokasi.
4.  Apakah satu lokasi dapat memiliki banyak Group Cost.
5.  Apakah satu lokasi dapat memiliki banyak record berdasarkan
    umur/status/jenis bibit.
6.  Apakah `luas` pada Data Aktivitas merupakan luas lokasi atau luas
    aktivitas.
7.  Apakah denominator Trend Cost benar-benar menggunakan seluruh luas
    lokasi dalam wilayah.
8.  Apakah filter global Group Cost diterapkan sebelum aggregation
    trend.
9.  Apakah `nilai_sbt` selalu satu nilai untuk satu `code_sbt`.
10. Format satuan dan tipe numerik `cost`, `biaya`, `luas`, dan
    `nilai_sbt`.

Hal-hal tersebut jangan diasumsikan saat membuat migration final jika
belum dipastikan dari file sumber.

------------------------------------------------------------------------

# 20. Ringkasan Rumus

  -------------------------------------------------------------------------------------------------------------
  Dataset                 Sumber                  Perhitungan
  ----------------------- ----------------------- -------------------------------------------------------------
  Trend Cost              Lokasi + Aktivitas      `SUM(cost wilayah+umur) / SUM(luas seluruh lokasi wilayah)`

  Trend Table             Dataset Trend           Dataset sama dengan chart

  Analisis Lokasi         Data Lokasi             `SUM(cost lokasi) / SUM(luas lokasi)`

  Group Cost              Data Lokasi + SBT       `SUM(cost group cost) / SUM(luas group cost)` + `nilai_sbt`

  Aktivitas               Data Aktivitas          `SUM(biaya) / SUM(luas)`
  -------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 21. Kesimpulan

Struktur database WIP ACC terdiri dari:

``` text
SOURCE DATA
│
├── Data Lokasi
│   ├── Lokasi
│   ├── Status
│   ├── Kelas Bibit
│   ├── Jenis Bibit
│   ├── Umur
│   ├── Luas
│   ├── Group Cost
│   ├── Cost
│   ├── Pupuk
│   └── Code SBT
│
├── Data Aktivitas
│   ├── Lokasi
│   ├── Status
│   ├── Wilayah
│   ├── Luas
│   ├── Kelas Bibit
│   ├── Aktivitas
│   ├── Biaya
│   └── Group Cost
│
└── Data SBT
    ├── Code SBT
    ├── Status
    ├── Pupuk
    ├── Jenis
    ├── Kelas
    ├── Group Cost
    ├── Umur
    └── Nilai SBT

ADMIN DATA
│
├── User
└── Activity Log

DASHBOARD DATA
│
├── Trend Cost + Trend Table
├── Analisis Lokasi
├── Group Cost
└── Aktivitas
```

Prinsip utamanya adalah **source data disimpan sebagai data dasar,
sedangkan nilai dashboard seperti Cost/Ha dan Trend Cost dihitung
melalui query/aggregation**. Dengan demikian, struktur database dapat
digunakan sebagai fondasi untuk implementasi Next.js Fullstack +
Prisma + PostgreSQL.
