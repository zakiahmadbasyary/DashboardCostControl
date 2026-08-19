# Database Documentation -- Dashboard WIP & Cost

## 1. Overview

Database ini dirancang untuk mengintegrasikan empat **data source
utama**, yaitu:

1.  **MasterSheet**
2.  **Lokasi**
3.  **Aktivitas**
4.  **Data SBT**

Database digunakan sebagai sumber data terstruktur untuk pengolahan
**WIP, cost, cost/ha, SBT, aktivitas pekerjaan, dan analisis berdasarkan
umur tanaman, wilayah, lokasi, serta group cost**.

Arsitektur database menggunakan pendekatan relasional dengan empat tabel
utama:

-   `mastersheet`
-   `lokasi`
-   `aktivitas`
-   `sbt`

Selain tabel utama, terdapat beberapa **data analitik/derived dataset**
untuk kebutuhan dashboard:

-   `trend_cost_umur`
-   `analisis_lokasi`
-   `analisis_group_cost`
-   `aktivitas_pekerjaan`

> **Catatan desain:** tabel analitik sebaiknya dibuat sebagai **VIEW**
> apabila datanya selalu dihitung dari tabel transaksi/master. Jika
> hasil analisis perlu disimpan sebagai snapshot, VIEW dapat diganti
> menjadi tabel fisik.

------------------------------------------------------------------------

# 2. Data Source

## 2.1 Data Source MasterSheet

MasterSheet merupakan data utama yang berisi informasi umum setiap
lokasi.

Kolom sumber:

  Kolom Source      Keterangan
  ----------------- -----------------------
  `lokasi`          Identitas unik lokasi
  `wilayah`         Wilayah lokasi
  `luas`            Luas lokasi
  `status lokasi`   Status lokasi
  `kode bibit`      Kode bibit
  `status`          Status tanaman
  `jenis`           Jenis bibit
  `kelas`           Kelas bibit

Data ini menjadi dasar pembentukan tabel `mastersheet`.

------------------------------------------------------------------------

## 2.2 Data Source Lokasi

Data Lokasi berisi informasi detail kondisi lokasi, umur tanaman, cost,
group cost, pupuk, dan SBT.

Kolom sumber:

  Kolom Source              Keterangan
  ------------------------- ------------------------
  `PG`                      Perusahaan/Pabrik Gula
  `Lokasi`                  Identitas lokasi
  `Status`                  Status tanaman/lokasi
  `Kelas Bibit`             Kelas bibit
  `Umur`                    Umur tanaman
  `luas`                    Luas lokasi
  `TypeCost`                Tipe cost
  `GroupCost`               Kelompok biaya
  `Keterangan_Group_Cost`   Keterangan group cost
  `Pupuk`                   Jenis pupuk
  `Cost`                    Nilai biaya
  `kode_sbt`                Kode SBT

Data ini menjadi sumber utama tabel `lokasi`.

------------------------------------------------------------------------

## 2.3 Data Source Aktivitas

Data Aktivitas berisi informasi aktivitas pekerjaan dan biaya.

Kolom sumber:

  Kolom Source              Keterangan
  ------------------------- -----------------------
  `Lokasi`                  Lokasi pekerjaan
  `status`                  Status
  `wilayah`                 Wilayah
  `luas`                    Luas
  `kelas`                   Kelas
  `aktivitas`               Nama aktivitas
  `biaya`                   Biaya aktivitas
  `UoM`                     Unit of Measurement
  `Group`                   Group aktivitas/cost
  `Keterangan Group Cost`   Keterangan group cost

Data ini menjadi sumber utama tabel `aktivitas`.

------------------------------------------------------------------------

## 2.4 Data Source Data SBT

Data SBT berisi referensi kode SBT dan nilai SBT berdasarkan kombinasi
atribut tanaman.

Kolom sumber:

  Kolom Source   Keterangan
  -------------- --------------
  `Kode`         Kode SBT
  `Status`       Status
  `Pupuk`        Jenis pupuk
  `Jenis`        Jenis bibit
  `Kelas`        Kelas bibit
  `Group Cost`   Group cost
  `umur`         Umur tanaman
  `SBT`          Nilai SBT

Data ini menjadi sumber utama tabel `sbt`.

------------------------------------------------------------------------

# 3. Struktur Relasional Database

## 3.1 ERD Konseptual

Relasi utama database:

``` text
                         ┌──────────────────┐
                         │    MasterSheet    │
                         │──────────────────│
                         │ PK lokasi         │
                         │ wilayah           │
                         │ luas              │
                         │ kode_bibit        │
                         │ jenis_bibit       │
                         │ kelas_bibit       │
                         └────────┬─────────┘
                                  │
                           1      │      N
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌──────────────────┐        ┌──────────────────┐
          │      Lokasi      │        │     Aktivitas    │
          │──────────────────│        │──────────────────│
          │ PK id_lokasi     │        │ PK id_aktivitas  │
          │ FK lokasi        │        │ FK lokasi        │
          │ FK kode_sbt      │        │ aktivitas        │
          │ umur             │        │ group_cost       │
          │ group_cost       │        │ keterangan...    │
          │ keterangan...    │        │ biaya            │
          │ cost             │        └──────────────────┘
          │ pupuk            │
          │ status           │
          └────────┬─────────┘
                   │
             N     │     1
                   │
                   ▼
          ┌──────────────────┐
          │       SBT        │
          │──────────────────│
          │ PK kode_sbt      │
          │ nilai_sbt        │
          └──────────────────┘
```

### Kardinalitas

  ------------------------------------------------------------------------
  Relasi                                Kardinalitas Penjelasan
  --------------------- ---------------------------- ---------------------
  `mastersheet` →                              1 : N Satu lokasi pada
  `lokasi`                                           MasterSheet dapat
                                                     memiliki banyak
                                                     record detail pada
                                                     tabel Lokasi

  `mastersheet` →                              1 : N Satu lokasi dapat
  `aktivitas`                                        memiliki banyak
                                                     aktivitas

  `sbt` → `lokasi`                             1 : N Satu kode SBT dapat
                                                     digunakan oleh banyak
                                                     lokasi
  ------------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Physical Data Model (PDM)

## 4.1 Tabel `mastersheet`

Tabel `mastersheet` merupakan tabel master yang menyimpan informasi
utama lokasi.

### Struktur

  Field           Tipe Data       Key   Null   Sumber
  --------------- --------------- ----- ------ ------------------------
  `lokasi`        VARCHAR(100)    PK    NO     MasterSheet.lokasi
  `wilayah`       VARCHAR(100)    \-    NO     MasterSheet.wilayah
  `luas`          DECIMAL(18,2)   \-    NO     MasterSheet.luas
  `kode_bibit`    VARCHAR(50)     \-    NO     MasterSheet.kode bibit
  `jenis_bibit`   VARCHAR(50)     \-    NO     MasterSheet.jenis
  `kelas_bibit`   VARCHAR(50)     \-    NO     MasterSheet.kelas

### Primary Key

`lokasi` menjadi **Primary Key** karena digunakan sebagai identitas unik
lokasi.

### Aturan Transformasi

``` text
MasterSheet.lokasi
        ↓
mastersheet.lokasi (PK)


MasterSheet.wilayah
        ↓
mastersheet.wilayah

MasterSheet.luas
        ↓
mastersheet.luas

MasterSheet.kode bibit
        ↓
mastersheet.kode_bibit

MasterSheet.jenis
        ↓
mastersheet.jenis_bibit

MasterSheet.kelas
        ↓
mastersheet.kelas_bibit
```

------------------------------------------------------------------------

# 5. Tabel `lokasi`

Tabel `lokasi` menyimpan detail setiap lokasi berdasarkan umur, group
cost, pupuk, cost, dan kode SBT.

### Struktur

  ------------------------------------------------------------------------------------------------------
  Field                     Tipe Data       Key            Null           Sumber / Aturan
  ------------------------- --------------- -------------- -------------- ------------------------------
  `id_lokasi`               INT             PK             NO             Auto Increment

  `lokasi`                  VARCHAR(100)    FK             NO             Data Lokasi.Lokasi

  `kode_sbt`                VARCHAR(50)     FK             NO             Data Lokasi.kode_sbt / hasil
                                                                          generate

  `umur`                    TINYINT         \-             NO             Data Lokasi.Umur

  `group_cost`              VARCHAR(50)     \-             NO             Data Lokasi.GroupCost

  `keterangan_group_cost`   VARCHAR(255)    \-             YES            Data
                                                                          Lokasi.Keterangan_Group_Cost

  `cost`                    DECIMAL(18,2)   \-             NO             Data Lokasi.Cost

  `pupuk`                   VARCHAR(50)     \-             YES            Data Lokasi.Pupuk
  `status`                   VARCHAR(50)     \-             NO            Data Lokasi.status
  ------------------------------------------------------------------------------------------------------

### Primary Key

`id_lokasi` dibuat otomatis oleh sistem menggunakan **AUTO_INCREMENT**.

### Foreign Key

#### FK `lokasi`

``` text
lokasi.lokasi
        ↓
mastersheet.lokasi
```

Foreign key ini digunakan untuk menghubungkan detail lokasi dengan data
utama pada `mastersheet`.

#### FK `kode_sbt`

``` text
lokasi.kode_sbt
        ↓
sbt.kode_sbt
```

Foreign key ini digunakan untuk menghubungkan setiap detail lokasi
dengan nilai SBT.

------------------------------------------------------------------------

# 6. Aturan Pembentukan `kode_sbt`

`kode_sbt` pada tabel `lokasi` digunakan sebagai penghubung dengan tabel
`sbt`.

Kode SBT dapat dibentuk oleh sistem berdasarkan atribut lokasi.

## 6.1 Status NFSC

Jika:

``` text
status = NFSC
```

maka kode SBT dibentuk dari:

``` text
status
+ pupuk
+ jenis
+ kelas
+ group_cost
+ umur
```

Secara konseptual:

``` text
kode_sbt =
    status
    + pupuk
    + jenis
    + kelas
    + group_cost
    + umur
```

Contoh:

``` text
NFSC + KOMPOS + SUCKER + BESAR + GC01 + 10
```

Hasil akhir disesuaikan dengan format kode SBT yang digunakan pada
sistem.

## 6.2 Status NSSC

Jika:

``` text
status = NSSC
```

maka:

``` text
kode_sbt = NSSC
```

Dengan demikian, seluruh lokasi berstatus NSSC menggunakan kode SBT
`NSSC`.

> **Catatan:** proses pembentukan kode sebaiknya dilakukan pada layer
> ETL/backend sehingga format kode konsisten dan tidak bergantung pada
> input manual pengguna.

------------------------------------------------------------------------

# 7. Tabel `aktivitas`

Tabel `aktivitas` menyimpan aktivitas pekerjaan yang dilakukan pada
suatu lokasi.

### Struktur

  ----------------------------------------------------------------------------------------------
  Field                     Tipe Data       Key            Null           Sumber
  ------------------------- --------------- -------------- -------------- ----------------------
  `id_aktivitas`            INT             PK             NO             Auto Increment

  `lokasi`                  VARCHAR(100)    FK             NO             Aktivitas.Lokasi

  `aktivitas`               VARCHAR(255)    \-             NO             Aktivitas.aktivitas

  `group_cost`              VARCHAR(50)     \-             NO             Aktivitas.Group

  `keterangan_group_cost`   VARCHAR(255)    \-             YES            Aktivitas.Keterangan
                                                                          Group Cost

  `biaya`                   DECIMAL(18,2)   \-             NO             Aktivitas.biaya
  ----------------------------------------------------------------------------------------------

### Primary Key

`id_aktivitas` dibuat otomatis oleh sistem menggunakan
**AUTO_INCREMENT**.

### Foreign Key

``` text
aktivitas.lokasi
        ↓
mastersheet.lokasi
```

Dengan relasi:

``` text
MasterSheet (1) ───────── (N) Aktivitas
```

Satu lokasi dapat mempunyai banyak aktivitas.

------------------------------------------------------------------------

# 8. Tabel `sbt`

Tabel `sbt` merupakan tabel referensi yang menyimpan kode SBT dan nilai
SBT.

### Struktur

  Field         Tipe Data       Key   Null   Sumber
  ------------- --------------- ----- ------ ---------------
  `kode_sbt`    VARCHAR(50)     PK    NO     Data SBT.Kode
  `nilai_sbt`   DECIMAL(18,2)   \-    NO     Data SBT.SBT

### Primary Key

`kode_sbt` menjadi **Primary Key**.

### Aturan Transformasi

``` text
Data SBT.Kode
       ↓
sbt.kode_sbt

Data SBT.SBT
       ↓
sbt.nilai_sbt
```

------------------------------------------------------------------------

# 9. Relasi Antar Tabel

## 9.1 MasterSheet dan Lokasi

``` text
mastersheet.lokasi
        1
        │
        │
        N
lokasi.lokasi
```

Satu lokasi pada MasterSheet dapat mempunyai banyak record pada tabel
Lokasi.

------------------------------------------------------------------------

## 9.2 MasterSheet dan Aktivitas

``` text
mastersheet.lokasi
        1
        │
        │
        N
aktivitas.lokasi
```

Satu lokasi dapat memiliki banyak aktivitas pekerjaan.

------------------------------------------------------------------------

## 9.3 SBT dan Lokasi

``` text
sbt.kode_sbt
        1
        │
        │
        N
lokasi.kode_sbt
```

Satu kode SBT dapat digunakan oleh banyak lokasi.

Dengan demikian, **FK `kode_sbt` berada pada tabel `lokasi`**, bukan
pada tabel `sbt`.

------------------------------------------------------------------------

# 10. Data Analitik Dashboard

Data analitik dashboard dibentuk dari hasil penggabungan dan perhitungan
tabel utama.

Data analitik tidak perlu menyimpan ulang seluruh data sumber. Untuk
implementasi database, data analitik dapat dibuat sebagai **VIEW**.

------------------------------------------------------------------------

# 11. View `trend_cost_umur`

View ini digunakan untuk menampilkan grafik **Bar Chart Trend Cost per
Umur Tanaman**.

### Sumber Data

Menggunakan:

-   `mastersheet.wilayah`
-   `lokasi.umur`
-   `lokasi.cost`
-   `mastersheet.luas`

### Perhitungan

Cost per hektar dihitung berdasarkan:

``` text
Cost/Ha =
SUM(cost) / SUM(luas)
```

Agregasi dilakukan berdasarkan:

``` text
wilayah
umur
```

Secara konseptual:

``` text
Trend Cost per Umur =
SUM(lokasi.cost)
/
SUM(mastersheet.luas)
```

### Struktur View

  Field           Keterangan
  --------------- -------------------------
  `wilayah`       Wilayah tanaman
  `umur`          Umur tanaman
  `total_cost`    Total cost
  `total_luas`    Total luas
  `cost_per_ha`   Total cost / total luas

### Contoh SQL

``` sql
CREATE VIEW trend_cost_umur AS
SELECT
    m.wilayah,
    l.umur,
    SUM(l.cost) AS total_cost,
    SUM(m.luas) AS total_luas,
    SUM(l.cost) / NULLIF(SUM(m.luas), 0) AS cost_per_ha
FROM lokasi l
JOIN mastersheet m
    ON l.lokasi = m.lokasi
GROUP BY
    m.wilayah,
    l.umur;
```

> Jika satu lokasi pada `mastersheet` memiliki satu nilai luas,
> penggunaan `SUM(m.luas)` harus disesuaikan dengan struktur detail
> `lokasi` agar luas tidak terduplikasi akibat JOIN. Untuk database
> produksi, lebih aman memastikan grain data sudah jelas atau
> menggunakan agregasi luas pada level lokasi terlebih dahulu.

------------------------------------------------------------------------

# 12. View `trend_cost_umur_table`

View ini merupakan bentuk tabel dari data trend cost per umur yang
digunakan untuk grafik.

### Bentuk Data

Baris:

``` text
wilayah
```

Kolom:

``` text
umur 0
umur 1
umur 2
...
umur 21
```

Contoh:

  Wilayah       Umur 0   Umur 1   Umur 2   ...   Umur 21
  ----------- -------- -------- -------- ----- ---------
  Wilayah A        ...      ...      ...   ...       ...
  Wilayah B        ...      ...      ...   ...       ...
  Wilayah C        ...      ...      ...   ...       ...

Nilai setiap kolom umur merupakan:

``` text
SUM(cost) / SUM(luas)
```

berdasarkan wilayah dan umur.

> Untuk fleksibilitas database, bentuk normal yang direkomendasikan
> tetap `wilayah, umur, cost_per_ha`. Pivot menjadi kolom umur sebaiknya
> dilakukan pada layer dashboard/BI.

------------------------------------------------------------------------

# 13. View `analisis_lokasi`

View ini digunakan untuk tabel analisis setiap lokasi.

### Sumber

Data utama berasal dari:

``` text
lokasi
JOIN
mastersheet
```

### Informasi yang Ditampilkan

View dapat memuat:

  Field           Keterangan
  --------------- -----------------
  `lokasi`        Nama lokasi
  `wilayah`       Wilayah
  `luas`          Luas lokasi
  `umur`          Umur
  `group_cost`    Group cost
  `pupuk`         Pupuk
  `cost`          Total cost
  `cost_per_ha`   Cost per hektar

### Perhitungan

``` text
Cost/Ha = Cost / Luas
```

Contoh:

``` sql
CREATE VIEW analisis_lokasi AS
SELECT
    m.lokasi,
    m.wilayah,
    m.luas,
    l.umur,
    l.group_cost,
    l.pupuk,
    l.cost,
    l.cost / NULLIF(m.luas, 0) AS cost_per_ha
FROM lokasi l
JOIN mastersheet m
    ON l.lokasi = m.lokasi;
```

------------------------------------------------------------------------

# 14. View `analisis_group_cost`

View ini digunakan untuk menganalisis biaya berdasarkan Group Cost dan
SBT.

### Sumber

Data berasal dari:

``` text
lokasi
    ↓
mastersheet
    ↓
sbt
```

### Informasi

  Field           Keterangan
  --------------- ------------
  `group_cost`    Group cost
  `kode_sbt`      Kode SBT
  `nilai_sbt`     Nilai SBT
  `cost`          Total cost
  `luas`          Luas
  `cost_per_ha`   Cost/Ha

### Perhitungan

``` text
Cost/Ha = Cost / Luas
```

Relasi SBT:

``` text
lokasi.kode_sbt
       ↓
sbt.kode_sbt
```

Contoh:

``` sql
CREATE VIEW analisis_group_cost AS
SELECT
    l.group_cost,
    l.kode_sbt,
    s.nilai_sbt,
    SUM(l.cost) AS total_cost,
    SUM(m.luas) AS total_luas,
    SUM(l.cost) / NULLIF(SUM(m.luas), 0) AS cost_per_ha
FROM lokasi l
JOIN mastersheet m
    ON l.lokasi = m.lokasi
JOIN sbt s
    ON l.kode_sbt = s.kode_sbt
GROUP BY
    l.group_cost,
    l.kode_sbt,
    s.nilai_sbt;
```

------------------------------------------------------------------------

# 15. View `aktivitas_pekerjaan`

View ini digunakan untuk tabel analisis aktivitas pekerjaan.

### Sumber

Data utama berasal dari:

``` text
aktivitas
JOIN
mastersheet
```

### Informasi

  Field                     Keterangan
  ------------------------- -----------------------
  `lokasi`                  Lokasi pekerjaan
  `wilayah`                 Wilayah
  `aktivitas`               Aktivitas pekerjaan
  `group_cost`              Group cost
  `keterangan_group_cost`   Keterangan group cost
  `biaya`                   Biaya pekerjaan
  `luas`                    Luas lokasi
  `cost_per_ha`             Biaya per hektar

### Perhitungan

``` text
Cost/Ha = Biaya / Luas
```

Contoh:

``` sql
CREATE VIEW aktivitas_pekerjaan AS
SELECT
    a.lokasi,
    m.wilayah,
    a.aktivitas,
    a.group_cost,
    a.keterangan_group_cost,
    a.biaya,
    m.luas,
    a.biaya / NULLIF(m.luas, 0) AS cost_per_ha
FROM aktivitas a
JOIN mastersheet m
    ON a.lokasi = m.lokasi;
```

------------------------------------------------------------------------

# 16. Ringkasan Struktur Database

  -------------------------------------------------------------------------------------------
  Tabel/View                Jenis              PK               FK             Fungsi
  ------------------------- ------------------ ---------------- -------------- --------------
  `mastersheet`             Master             `lokasi`         \-             Data utama
                                                                               lokasi

  `lokasi`                  Detail/Transaksi   `id_lokasi`      `lokasi`,      Detail umur,
                                                                `kode_sbt`     cost, pupuk,
                                                                               group cost

  `aktivitas`               Transaksi          `id_aktivitas`   `lokasi`       Data aktivitas
                                                                               pekerjaan

  `sbt`                     Reference/Master   `kode_sbt`       \-             Referensi
                                                                               nilai SBT

  `trend_cost_umur`         View               \-               \-             Data grafik
                                                                               trend cost per
                                                                               umur

  `trend_cost_umur_table`   View               \-               \-             Data tabel
                                                                               trend cost

  `analisis_lokasi`         View               \-               \-             Analisis cost
                                                                               per lokasi

  `analisis_group_cost`     View               \-               \-             Analisis group
                                                                               cost dan SBT

  `aktivitas_pekerjaan`     View               \-               \-             Analisis
                                                                               aktivitas
                                                                               pekerjaan
  -------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 17. Struktur Foreign Key

``` text
FK 1
lokasi.lokasi
        →
mastersheet.lokasi


FK 2
lokasi.kode_sbt
        →
sbt.kode_sbt


FK 3
aktivitas.lokasi
        →
mastersheet.lokasi
```

------------------------------------------------------------------------

# 18. Rekomendasi Constraint Database

Untuk menjaga integritas data, database sebaiknya menggunakan constraint
berikut:

``` sql
ALTER TABLE lokasi
ADD CONSTRAINT fk_lokasi_mastersheet
FOREIGN KEY (lokasi)
REFERENCES mastersheet(lokasi);

ALTER TABLE lokasi
ADD CONSTRAINT fk_lokasi_sbt
FOREIGN KEY (kode_sbt)
REFERENCES sbt(kode_sbt);

ALTER TABLE aktivitas
ADD CONSTRAINT fk_aktivitas_mastersheet
FOREIGN KEY (lokasi)
REFERENCES mastersheet(lokasi);
```

Selain itu:

-   `mastersheet.lokasi` harus **UNIQUE/PK**.
-   `sbt.kode_sbt` harus **UNIQUE/PK**.
-   `lokasi.id_lokasi` menggunakan **AUTO_INCREMENT**.
-   `aktivitas.id_aktivitas` menggunakan **AUTO_INCREMENT**.
-   Nilai `cost`, `biaya`, `luas`, dan `nilai_sbt` menggunakan tipe
    numerik.
-   `umur` menggunakan tipe integer kecil karena rentang umur berada
    pada 0--21.
-   Foreign key harus menggunakan tipe data yang konsisten dengan
    primary key/referenced key.

------------------------------------------------------------------------

# 19. Alur Data

``` text
                    DATA SOURCE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   MasterSheet        Lokasi          Aktivitas
        │                │                │
        ▼                ▼                ▼
   mastersheet         lokasi         aktivitas
        │                │                │
        │                │                │
        │                ▼                │
        │              kode_sbt           │
        │                │                │
        │                ▼                │
        │               SBT               │
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                  DATA ANALITIK
                         │
        ┌────────────────┼──────────────────┐
        │                │                  │
        ▼                ▼                  ▼
 trend_cost_umur  analisis_lokasi  analisis_group_cost
        │
        ▼
trend_cost_umur_table

                         │
                         ▼
                aktivitas_pekerjaan
```

------------------------------------------------------------------------

# 20. Kesimpulan

Database terdiri dari empat tabel utama dengan fungsi yang berbeda:

1.  **`mastersheet`** sebagai master data lokasi.
2.  **`lokasi`** sebagai data detail lokasi yang menyimpan umur, group
    cost, cost, pupuk, dan kode SBT.
3.  **`aktivitas`** sebagai data transaksi aktivitas pekerjaan.
4.  **`sbt`** sebagai master/reference data nilai SBT.

Relasi utama database adalah:

``` text
MasterSheet (1) ──── (N) Lokasi
MasterSheet (1) ──── (N) Aktivitas
SBT        (1) ──── (N) Lokasi
```

Struktur tersebut memungkinkan dashboard melakukan analisis berdasarkan
**wilayah, lokasi, umur tanaman, group cost, SBT, dan aktivitas
pekerjaan**, termasuk perhitungan **cost/ha** sebagai salah satu
indikator utama analisis biaya.
