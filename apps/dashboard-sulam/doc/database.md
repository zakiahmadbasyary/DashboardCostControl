# Database SULAM --- GGP

## 1. Tujuan

Dokumen ini menjelaskan rancangan database untuk sistem SULAM dalam
konteks operasional perkebunan GGP. Sistem digunakan untuk mencatat
transaksi kegiatan penyulaman melalui upload Excel dan menyajikan
rekapitulasi berdasarkan Plantation Group, wilayah, tahun, dan bulan.

Rancangan menggunakan dua tabel utama:

1.  `sulam` --- menyimpan data transaksi hasil upload Excel.
2.  `summary_sulam` --- menyimpan hasil agregasi transaksi untuk
    kebutuhan dashboard.

Database yang digunakan adalah PostgreSQL dengan Prisma sebagai ORM.

------------------------------------------------------------------------

## 2. Ketentuan bisnis

### 2.1 Klasifikasi jenis transaksi

Kolom `jenis` dibentuk otomatis dari `jenis_data`.

  `jenis_data`         `jenis`
  -------------------- ----------
  Upah                 Upah
  Upah (Reverse)       Upah
  Material             Material
  Material (Reverse)   Material

Transaksi Reverse tetap dihitung sebagai nilai positif sesuai ketentuan
bisnis yang diberikan.

### 2.2 Pemetaan Plantation Group (PG)

Nilai `pg` dibentuk otomatis berdasarkan `wilayah`.

  Wilayah      PG
  ------------ -----
  AW01--AW07   PG1
  AW08--AW15   PG2
  AW16--AW23   PG3

Kolom `plantation_group` dari Excel tetap disimpan terpisah. Contohnya,
`plantation_group = AGP` tidak sama dengan `pg = PG1`.

### 2.3 Periode dan kode

-   `year` diambil dari `tanggal_realisasi`.
-   `month` diambil dari bulan `tanggal_realisasi` dalam angka 1--12.
-   `kode` dibentuk dari PG, wilayah, tahun, dan bulan.

Format kode:

``` text
{pg}-{wilayah}-{year}-{month}
```

Contoh:

``` text
PG1-AW01-2026-1
PG2-AW08-2026-1
PG3-AW16-2026-2
```

Tahun tetap dimasukkan ke dalam kode meskipun data awal hanya mencakup
satu tahun, agar data dari tahun berbeda tidak tercampur.

### 2.4 Perhitungan resource

Sesuai keputusan rancangan:

-   Resource dengan `jenis = Material` dijumlahkan ke kolom `batang`.
-   Resource dengan `jenis = Upah` dijumlahkan ke kolom `jumlah_tk`.
-   Tidak dibuat kolom `satuan_resource`.
-   Nama kolom summary tetap `batang`, walaupun contoh deskripsi
    material menunjukkan Pineapple Seedling.
-   Pengelompokan ini mengasumsikan resource Material menggunakan satuan
    batang dan resource Upah menggunakan satuan tenaga kerja (TK),
    sesuai contoh Excel yang diberikan.

### 2.5 Perhitungan luas

`hasil_efektif` dijumlahkan untuk setiap baris dengan
`jenis = Material`.

Karena luas dicatat pada setiap baris material, hasil agregasi adalah
total luas yang tercatat pada seluruh baris material. Jika satu
kegiatan/lokasi memiliki beberapa baris material dengan luas yang sama,
nilai luas dapat terhitung berulang. Hal ini perlu diperhatikan saat
validasi data dan interpretasi KPI dashboard.

------------------------------------------------------------------------

## 3. ERD

Relasi yang digunakan adalah one-to-many:

-   Satu baris `summary_sulam` dapat berelasi dengan banyak baris
    `sulam`.
-   `summary_sulam.kode` merupakan primary key.
-   `sulam.kode` merupakan foreign key yang mengacu ke
    `summary_sulam.kode`.
-   Nilai `kode` pada tabel `sulam` tidak unik.

``` mermaid
erDiagram
    SUMMARY_SULAM ||--o{ SULAM : "memiliki"

    SUMMARY_SULAM {
        varchar kode PK
        varchar pg
        varchar wilayah
        smallint year
        smallint month
        numeric material
        numeric upah
        numeric batang
        numeric jumlah_tk
        numeric luas
    }

    SULAM {
        bigint id_sulam PK
        date tanggal_realisasi
        varchar spk_id
        varchar plantation_group
        varchar wilayah
        varchar lokasi
        varchar status_tanaman
        date tanggal_spk
        varchar kode_aktivitas
        text deskripsi
        varchar jenis_data
        varchar group_bahan_alat
        varchar kode_bahan_alat_lainlain
        text deskripsi_bahan_alat_lainlain
        numeric resource_bahan_alat
        numeric hasil_efektif
        varchar satuan_hasil
        numeric total_realisasi_biaya
        varchar referensi_lokasi
        varchar cost_center_name
        numeric cost_working_hour
        numeric indeks_biaya
        varchar mandor
        varchar pas_document
        varchar order_no
        varchar act_cost_group
        varchar jenis
        varchar pg
        smallint year
        smallint month
        varchar kode FK
        varchar key_mandor FK
    }

    DATA_MANDOR {
        varchar key_mandor PK
        date tanggal_realisasi
        varchar mandor
        varchar pg
        varchar wilayah
        smallint year
        smallint month
        numeric tk
        numeric batang
        numeric batang_per_tk
    }
```

------------------------------------------------------------------------

## 4. Struktur tabel `sulam`

Tabel `sulam` merupakan tabel transaksi utama. Setiap baris data Excel
yang berhasil divalidasi disimpan sebagai satu record.

  ----------------------------------------------------------------------------------------------
                    No. Kolom database                    Tipe PostgreSQL  Sumber / aturan
  --------------------- --------------------------------- ---------------- ---------------------
                      1 `id_sulam`                        BIGINT           Primary key, identity

                      2 `tanggal_realisasi`               DATE             Excel: Tanggal
                                                                           Realisasi

                      3 `spk_id`                          VARCHAR(50)      Excel: SPK ID; tidak
                                                                           unik

                      4 `plantation_group`                VARCHAR(50)      Excel: Plantation
                                                                           Group

                      5 `wilayah`                         VARCHAR(4)       Excel: Wilayah;
                                                                           AW01--AW23

                      6 `lokasi`                          VARCHAR(50)      Excel: Lokasi; tidak
                                                                           unik

                      7 `status_tanaman`                  VARCHAR(50)      Excel: Status tanaman

                      8 `tanggal_spk`                     DATE             Excel: Tanggal SPK

                      9 `kode_aktivitas`                  VARCHAR(50)      Excel: Kode
                                                                           Aktifitas; tidak unik

                     10 `deskripsi`                       TEXT             Excel: Deskripsi

                     11 `jenis_data`                      VARCHAR(30)      Upah, Upah (Reverse),
                                                                           Material, Material
                                                                           (Reverse)

                     12 `group_bahan_alat`                VARCHAR(100)     Excel: Group
                                                                           Bahan/Alat

                     13 `kode_bahan_alat_lainlain`        VARCHAR(150)     Excel: Kode
                                                                           Bahan/Alat/Lainlain

                     14 `deskripsi_bahan_alat_lainlain`   TEXT             Excel: Deskripsi
                                                                           Bahan/Alat/Lainlain

                     15 `resource_bahan_alat`             NUMERIC(18,4)    Excel: Resource
                                                                           Bahan/Alat

                     16 `hasil_efektif`                   NUMERIC(18,4)    Excel: Hasil Efektif

                     17 `satuan_hasil`                    VARCHAR(30)      Excel: Satuan Hasil,
                                                                           contoh HA

                     18 `total_realisasi_biaya`           NUMERIC(18,2)    Excel: Total
                                                                           Realisasi Biaya

                     19 `referensi_lokasi`                VARCHAR(150)     Excel: Referensi
                                                                           Lokasi

                     20 `cost_center_name`                VARCHAR(150)     Excel: Cost Center
                                                                           Name

                     21 `cost_working_hour`               NUMERIC(18,4)    Excel: Cost/Working
                                                                           Hour

                     22 `indeks_biaya`                    NUMERIC(18,4)    Excel: Index
                                                                           Biaya/Hasil Effectif

                     23 `mandor`                          VARCHAR(100)     Excel: Mandor / Foreman

                     24 `pas_document`                    VARCHAR(100)     Excel: PAS Document

                     25 `order_no`                        VARCHAR(100)     Excel: Order; nama
                                                                           diubah agar tidak
                                                                           memakai reserved word
                                                                           SQL

                     26 `act_cost_group`                  VARCHAR(100)     Excel: Act Cost Group

                     27 `jenis`                           VARCHAR(20)      Hasil klasifikasi
                                                                           otomatis dari
                                                                           `jenis_data`

                     28 `pg`                              VARCHAR(3)       Hasil pemetaan
                                                                           otomatis dari
                                                                           `wilayah`

                     29 `year`                            SMALLINT         Tahun dari
                                                                           `tanggal_realisasi`

                     30 `month`                           SMALLINT         Bulan dari
                                                                           `tanggal_realisasi`

                     31 `kode`                            VARCHAR(40)      Gabungan PG, wilayah,
                                                                           tahun, dan bulan;
                                                                           foreign key
  ----------------------------------------------------------------------------------------------

Kolom audit yang disarankan:

  Kolom          Tipe PostgreSQL   Keterangan
  -------------- ----------------- ----------------------------------
  `created_at`   TIMESTAMPTZ       Waktu record dibuat
  `updated_at`   TIMESTAMPTZ       Waktu record terakhir diperbarui

`created_by` dan `updated_by` dapat ditambahkan jika sistem sudah
memiliki identitas pengguna yang akan dicatat.

------------------------------------------------------------------------

## 5. Struktur tabel `summary_sulam`

Tabel ini menyimpan rekapitulasi transaksi berdasarkan `kode`.

    No. Kolom         Tipe PostgreSQL   Keterangan
  ----- ------------- ----------------- ----------------------------------------
      1 `kode`        VARCHAR(40)       Primary key
      2 `pg`          VARCHAR(3)        PG1--PG3
      3 `wilayah`     VARCHAR(4)        AW01--AW23
      4 `year`        SMALLINT          Tahun realisasi
      5 `month`       SMALLINT          Bulan 1--12
      6 `material`    NUMERIC(18,2)     Total biaya transaksi Material
      7 `upah`        NUMERIC(18,2)     Total biaya transaksi Upah
      8 `batang`      NUMERIC(18,4)     Total resource transaksi Material
      9 `jumlah_tk`   NUMERIC(18,4)     Total resource transaksi Upah
     10 `luas`        NUMERIC(18,4)     Total hasil efektif transaksi Material

Kolom nilai agregasi sebaiknya menggunakan default `0` dan tidak
menyimpan NULL.

------------------------------------------------------------------------

## 6. Aturan perhitungan summary

Seluruh perhitungan dikelompokkan berdasarkan `kode`.

  Kolom summary   Sumber                          Kondisi
  --------------- ------------------------------- ----------------------
  `material`      `sulam.total_realisasi_biaya`   `jenis = 'Material'`
  `upah`          `sulam.total_realisasi_biaya`   `jenis = 'Upah'`
  `batang`        `sulam.resource_bahan_alat`     `jenis = 'Material'`
  `jumlah_tk`     `sulam.resource_bahan_alat`     `jenis = 'Upah'`
  `luas`          `sulam.hasil_efektif`           `jenis = 'Material'`

Contoh query agregasi:

``` sql
SELECT
    kode,
    MAX(pg) AS pg,
    MAX(wilayah) AS wilayah,
    MAX(year) AS year,
    MAX(month) AS month,

    SUM(CASE
        WHEN jenis = 'Material'
        THEN COALESCE(total_realisasi_biaya, 0)
        ELSE 0
    END) AS material,

    SUM(CASE
        WHEN jenis = 'Upah'
        THEN COALESCE(total_realisasi_biaya, 0)
        ELSE 0
    END) AS upah,

    SUM(CASE
        WHEN jenis = 'Material'
        THEN COALESCE(resource_bahan_alat, 0)
        ELSE 0
    END) AS batang,

    SUM(CASE
        WHEN jenis = 'Upah'
        THEN COALESCE(resource_bahan_alat, 0)
        ELSE 0
    END) AS jumlah_tk,

    SUM(CASE
        WHEN jenis = 'Material'
        THEN COALESCE(hasil_efektif, 0)
        ELSE 0
    END) AS luas

FROM sulam
GROUP BY kode;
```

Reverse otomatis ikut dihitung karena sudah dikelompokkan ke `jenis`
induknya. Nilai Reverse tidak dikalikan minus dan tidak dikurangkan.

------------------------------------------------------------------------

## 7. DDL PostgreSQL

DDL berikut merupakan dasar pembuatan dua tabel. Jalankan pada database
yang sudah disiapkan.

``` sql
CREATE TABLE summary_sulam (
    kode VARCHAR(40) PRIMARY KEY,
    pg VARCHAR(3) NOT NULL,
    wilayah VARCHAR(4) NOT NULL,
    year SMALLINT NOT NULL,
    month SMALLINT NOT NULL,

    material NUMERIC(18,2) NOT NULL DEFAULT 0,
    upah NUMERIC(18,2) NOT NULL DEFAULT 0,
    batang NUMERIC(18,4) NOT NULL DEFAULT 0,
    jumlah_tk NUMERIC(18,4) NOT NULL DEFAULT 0,
    luas NUMERIC(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT chk_summary_pg
        CHECK (pg IN ('PG1', 'PG2', 'PG3')),

    CONSTRAINT chk_summary_wilayah
        CHECK (wilayah ~ '^AW(0[1-9]|1[0-9]|2[0-3])$'),

    CONSTRAINT chk_summary_month
        CHECK (month BETWEEN 1 AND 12)
);

CREATE TABLE sulam (
    id_sulam BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    tanggal_realisasi DATE NOT NULL,
    spk_id VARCHAR(50),
    plantation_group VARCHAR(50),
    wilayah VARCHAR(4) NOT NULL,
    lokasi VARCHAR(50),
    status_tanaman VARCHAR(50),
    tanggal_spk DATE,
    kode_aktivitas VARCHAR(50),
    deskripsi TEXT,

    jenis_data VARCHAR(30) NOT NULL,
    group_bahan_alat VARCHAR(100),
    kode_bahan_alat_lainlain VARCHAR(150),
    deskripsi_bahan_alat_lainlain TEXT,

    resource_bahan_alat NUMERIC(18,4),
    hasil_efektif NUMERIC(18,4),
    satuan_hasil VARCHAR(30),
    total_realisasi_biaya NUMERIC(18,2),

    referensi_lokasi VARCHAR(150),
    cost_center_name VARCHAR(150),
    cost_working_hour NUMERIC(18,4),
    indeks_biaya NUMERIC(18,4),
    mandor VARCHAR(100),

    pas_document VARCHAR(100),
    order_no VARCHAR(100),
    act_cost_group VARCHAR(100),

    jenis VARCHAR(20) NOT NULL,
    pg VARCHAR(3) NOT NULL,
    year SMALLINT NOT NULL,
    month SMALLINT NOT NULL,
    kode VARCHAR(40) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sulam_jenis_data
        CHECK (jenis_data IN (
            'Upah',
            'Upah (Reverse)',
            'Material',
            'Material (Reverse)'
        )),

    CONSTRAINT chk_sulam_jenis
        CHECK (jenis IN ('Upah', 'Material')),

    CONSTRAINT chk_sulam_pg
        CHECK (pg IN ('PG1', 'PG2', 'PG3')),

    CONSTRAINT chk_sulam_wilayah
        CHECK (wilayah ~ '^AW(0[1-9]|1[0-9]|2[0-3])$'),

    CONSTRAINT chk_sulam_month
        CHECK (month BETWEEN 1 AND 12),

    CONSTRAINT fk_sulam_summary
        FOREIGN KEY (kode)
        REFERENCES summary_sulam(kode)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_sulam_kode ON sulam(kode);
CREATE INDEX idx_sulam_tanggal_realisasi ON sulam(tanggal_realisasi);
CREATE INDEX idx_sulam_wilayah ON sulam(wilayah);
CREATE INDEX idx_sulam_jenis ON sulam(jenis);
CREATE INDEX idx_sulam_spk_id ON sulam(spk_id);
```

Catatan DDL:

-   Pembuatan summary dilakukan sebelum penyimpanan transaksi karena
    `sulam.kode` memiliki foreign key ke `summary_sulam.kode`.
-   Backend wajib memastikan `jenis`, `pg`, `year`, `month`, dan `kode`
    sesuai dengan kolom sumbernya. CHECK constraint di atas belum
    memvalidasi seluruh hubungan logis antarkolom.
-   `updated_at` perlu diperbarui oleh aplikasi ketika record berubah.
-   Jangan mengisi summary dengan nilai yang dibuat-buat. Summary harus
    dihitung dari transaksi yang tersimpan.

------------------------------------------------------------------------

## 8. Proses upload Excel

Alur yang direkomendasikan:

1.  Pengguna memilih dan mengunggah file Excel.
2.  Backend membaca sheet dan memvalidasi header.
3.  Backend memvalidasi tanggal, wilayah, jenis data, serta nilai
    numerik.
4.  Backend melakukan normalisasi angka Excel, termasuk format desimal
    dan pemisah ribuan.
5.  Backend membentuk kolom turunan `jenis`, `pg`, `year`, `month`, dan
    `kode`.
6.  Backend memeriksa kemungkinan data duplikat.
7.  Backend membuat atau memperbarui record `summary_sulam`.
8.  Backend menyimpan transaksi ke `sulam`.
9.  Backend menghitung ulang summary dari data transaksi.
10. Backend menyelesaikan seluruh proses dalam satu database
    transaction.
11. Aplikasi menampilkan jumlah baris berhasil dan gagal beserta alasan
    kegagalan.

### Pencegahan upload ganda

Perlu ditentukan kebijakan upload:

-   **Append:** menambahkan transaksi baru.
-   **Replace:** mengganti data untuk periode atau cakupan yang dipilih.
-   **Update:** memperbarui transaksi yang sudah ada berdasarkan
    identitas transaksi yang disepakati.

Jangan menggunakan `spk_id`, `lokasi`, atau `kode_aktivitas` sendirian
sebagai identitas unik karena nilainya tidak unik. Sebelum implementasi,
tentukan kombinasi kolom atau mekanisme identifikasi transaksi yang
benar-benar stabil.

------------------------------------------------------------------------

## 9. Validasi data Excel

Validasi minimal yang perlu diterapkan:

  Kolom                     Validasi
  ------------------------- ------------------------------------------------------
  `tanggal_realisasi`       Format tanggal valid
  `tanggal_spk`             Format tanggal valid jika diisi
  `wilayah`                 AW01 sampai AW23
  `jenis_data`              Salah satu dari empat kategori yang ditentukan
  `resource_bahan_alat`     Numerik
  `hasil_efektif`           Numerik
  `total_realisasi_biaya`   Numerik
  `jenis`                   Harus sesuai pemetaan `jenis_data`
  `pg`                      Harus sesuai pemetaan wilayah
  `year` dan `month`        Harus sesuai tanggal realisasi
  `kode`                    Harus sesuai kombinasi PG, wilayah, tahun, dan bulan

Contoh normalisasi:

  Nilai Excel      Nilai numerik yang disimpan
  -------------- -----------------------------
  `1.800`                                 1800
  `2.400`                                 2400
  `0,040`                                0.040
  `12.237.000`                        12237000

Parsing harus mengikuti format angka Indonesia pada file sumber, bukan
menghapus seluruh tanda titik dan koma secara sembarangan.

------------------------------------------------------------------------

## 10. Catatan implementasi Prisma

Jika menggunakan Prisma:

-   Model `Sulam` menggunakan `idSulam` sebagai primary key.
-   Model `SummarySulam` menggunakan `kode` sebagai primary key.
-   Relasi dibuat melalui `kode`.
-   Field uang menggunakan `Decimal`.
-   Field kuantitas dan luas menggunakan `Decimal`.
-   `tanggal_realisasi` dan `tanggal_spk` menggunakan `DateTime` dengan
    tipe database `Date` melalui `@db.Date`.
-   `year` menggunakan `Int` dengan tipe database `SmallInt` melalui
    `@db.SmallInt`.
-   `month` menggunakan `Int` dengan tipe database `SmallInt` melalui
    `@db.SmallInt`.

Contoh deklarasi relasi Prisma:

``` prisma
model SummarySulam {
  kode       String  @id @db.VarChar(40)
  pg         String  @db.VarChar(3)
  wilayah    String  @db.VarChar(4)
  year       Int     @db.SmallInt
  month      Int     @db.SmallInt

  material   Decimal @default(0) @db.Decimal(18, 2)
  upah       Decimal @default(0) @db.Decimal(18, 2)
  batang     Decimal @default(0) @db.Decimal(18, 4)
  jumlahTk   Decimal @default(0) @map("jumlah_tk") @db.Decimal(18, 4)
  luas       Decimal @default(0) @db.Decimal(18, 4)

  sulam      Sulam[]

  @@map("summary_sulam")
}

model Sulam {
  idSulam    BigInt   @id @default(autoincrement()) @map("id_sulam")
  kode       String   @db.VarChar(40)
  summary    SummarySulam @relation(fields: [kode], references: [kode], onDelete: Restrict, onUpdate: Cascade)

  // Tambahkan seluruh field transaksi sesuai struktur tabel sulam.

  @@index([kode])
  @@map("sulam")
}
```

Contoh di atas hanya memperlihatkan model relasi dan beberapa field
utama. Seluruh kolom transaksi harus dilengkapi sesuai tabel pada bagian
4 sebelum migration dijalankan.

------------------------------------------------------------------------

## 11. Checklist sebelum development

-   [ ] Memastikan header Excel final.
-   [ ] Memastikan variasi `jenis_data`, termasuk Reverse.
-   [ ] Memastikan pemetaan wilayah ke PG.
-   [ ] Memastikan format angka dan tanggal Excel.
-   [ ] Memastikan kebijakan upload ulang dan identitas transaksi.
-   [ ] Memastikan aturan penghitungan luas tidak menyebabkan double
    counting yang tidak diinginkan.
-   [ ] Membuat database PostgreSQL.
-   [ ] Membuat schema Prisma lengkap.
-   [ ] Membuat migration.
-   [ ] Menguji upload Excel dengan sampel data.
-   [ ] Membandingkan hasil summary dengan perhitungan Excel.

## 12. Ringkasan keputusan

  Komponen             Keputusan
  -------------------- ----------------------------------------------------
  Database             PostgreSQL
  ORM                  Prisma
  Tabel transaksi      `sulam`
  Tabel rekapitulasi   `summary_sulam`
  Relasi               One-to-Many
  PK transaksi         `id_sulam`
  PK summary           `kode`
  FK transaksi         `sulam.kode`
  Input data           Upload Excel
  Jenis transaksi      Upah, Upah (Reverse), Material, Material (Reverse)
  Reverse              Tetap dihitung positif
  PG                   Otomatis dari wilayah
  Periode              Tahun dan bulan dari tanggal realisasi
  Resource Material    Masuk ke `batang`
  Resource Upah        Masuk ke `jumlah_tk`
  Luas                 SUM `hasil_efektif` untuk Material
  Satuan resource      Tidak disimpan sebagai kolom
  Summary              Agregasi berdasarkan kode

**Status:** rancangan konseptual database SULAM telah disusun
berdasarkan struktur dan contoh Excel yang diberikan. Sebelum
production, validasi format file lengkap, variasi transaksi, kebijakan
upload ulang, dan aturan penghitungan luas tetap diperlukan.
