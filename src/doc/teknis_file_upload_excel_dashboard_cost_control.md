# Teknis File Upload Excel – Dashboard WIP & Cost Control

## 1. Tujuan

Dokumen ini merupakan penyesuaian teknis fitur **upload/import Excel melalui halaman Admin** berdasarkan struktur database Dashboard WIP & Cost Control.

Database utama menggunakan empat data source:

1. `MasterSheet`
2. `Lokasi`
3. `Aktivitas`
4. `Data SBT`

Keempat sumber tersebut dipetakan ke tabel database:

```text
MasterSheet  → mastersheet
Lokasi       → lokasi
Aktivitas    → aktivitas
Data SBT     → sbt
```

Dashboard kemudian menggunakan tabel utama tersebut untuk membentuk data analitik seperti:

```text
trend_cost_umur
trend_cost_umur_table
analisis_lokasi
analisis_group_cost
aktivitas_pekerjaan
```

> **Batasan:** Fitur ini ditambahkan pada sistem yang sudah berjalan. API dashboard, autentikasi, halaman publik, data user, dan log yang sudah ada tidak diubah. Dokumen ini hanya menjelaskan mekanisme upload/import Excel dan pemetaan datanya.

---

# 2. Prinsip Arsitektur

Excel digunakan sebagai **sumber input/import**, sedangkan database menjadi **sumber utama dashboard**.

```text
                    ADMIN
                      │
                      │ Upload Excel
                      ▼
              ┌─────────────────┐
              │ Proses Import   │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
          Simpan    Validasi   Parse
          File      Struktur   Excel
             │         │         │
             └─────────┼─────────┘
                       ▼
                 Database
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
  mastersheet       lokasi          aktivitas
                       │
                       ▼
                      sbt
                       │
                       ▼
                Dashboard Publik
```

**Dashboard tidak membaca file Excel secara langsung.**

Setelah import berhasil, dashboard tetap menggunakan database yang sudah terhubung dengan aplikasi.

---

# 3. Struktur Data Source

## 3.1 MasterSheet

`MasterSheet` merupakan sumber data master lokasi.

Kolom sumber:

| Kolom Excel | Kolom Database | Keterangan |
|---|---|---|
| `lokasi` | `mastersheet.lokasi` | Identitas unik lokasi |
| `wilayah` | `mastersheet.wilayah` | Wilayah lokasi |
| `luas` | `mastersheet.luas` | Luas lokasi |
| `status lokasi` | `mastersheet.status_lokasi` | Status lokasi |
| `kode bibit` | `mastersheet.kode_bibit` | Kode bibit |
| `status` | `mastersheet.status` | Status tanaman |
| `jenis` | `mastersheet.jenis_bibit` | Jenis bibit |
| `kelas` | `mastersheet.kelas_bibit` | Kelas bibit |

### Target tabel

```text
mastersheet
├── lokasi              PK
├── wilayah
├── luas
├── status_lokasi
├── kode_bibit
├── status
├── jenis_bibit
└── kelas_bibit
```

### Aturan import

- `lokasi` harus tersedia.
- `lokasi` harus unik karena digunakan sebagai Primary Key.
- `luas` harus berupa nilai numerik.
- Kolom wajib harus tersedia sebelum import dijalankan.
- `id_mastersheet` tidak berasal dari Excel jika tabel menggunakan `lokasi` sebagai PK seperti pada dokumentasi database saat ini.

---

# 4. Data Source Lokasi

Data `Lokasi` merupakan sumber detail kondisi lokasi berdasarkan umur, group cost, pupuk, cost, dan kode SBT.

Kolom sumber:

| Kolom Excel | Kolom Database | Keterangan |
|---|---|---|
| `PG` | - | Data sumber PG |
| `Lokasi` | `lokasi.lokasi` | Lokasi |
| `Status` | `lokasi.status` | Status |
| `Kelas Bibit` | `lokasi.kelas_bibit` | Kelas bibit |
| `Umur` | `lokasi.umur` | Umur tanaman |
| `luas` | - / referensi MasterSheet | Luas |
| `TypeCost` | - | Tipe cost |
| `GroupCost` | `lokasi.group_cost` | Kelompok biaya |
| `Keterangan_Group_Cost` | `lokasi.keterangan_group_cost` | Keterangan group cost |
| `Pupuk` | `lokasi.pupuk` | Jenis pupuk |
| `Cost` | `lokasi.cost` | Nilai cost |
| `kode_sbt` | `lokasi.kode_sbt` | Kode SBT |

### Target tabel

```text
lokasi
├── id_lokasi                 PK
├── lokasi                    FK → mastersheet.lokasi
├── kode_sbt                  FK → sbt.kode_sbt
├── umur
├── group_cost
├── keterangan_group_cost
├── cost
├── pupuk
└── status
```

> **Catatan:** `PG`, `Kelas Bibit`, `luas`, dan `TypeCost` tersedia pada data source Lokasi, tetapi struktur tabel `lokasi` pada dokumentasi database saat ini tidak seluruhnya menyimpan kolom tersebut. Karena itu proses import harus mengikuti struktur database aktual, bukan otomatis memasukkan semua kolom Excel.

---

# 5. Data Source Aktivitas

Data `Aktivitas` berisi aktivitas pekerjaan dan biaya.

Kolom sumber:

| Kolom Excel | Kolom Database | Keterangan |
|---|---|---|
| `Lokasi` | `aktivitas.lokasi` | Lokasi pekerjaan |
| `status` | - | Status |
| `wilayah` | - / referensi MasterSheet | Wilayah |
| `luas` | - / referensi MasterSheet | Luas |
| `kelas` | - | Kelas |
| `aktivitas` | `aktivitas.aktivitas` | Nama aktivitas |
| `biaya` | `aktivitas.biaya` | Biaya aktivitas |
| `UoM` | - | Unit of Measurement |
| `Group` | `aktivitas.group_cost` | Group aktivitas/cost |
| `Keterangan Group Cost` | `aktivitas.keterangan_group_cost` | Keterangan group cost |

### Target tabel

```text
aktivitas
├── id_aktivitas              PK
├── lokasi                    FK → mastersheet.lokasi
├── aktivitas
├── group_cost
├── keterangan_group_cost
└── biaya
```

### Relasi penting

```text
mastersheet (1)
       │
       │
       N
       │
aktivitas
```

**Aktivitas tidak berelasi langsung dengan tabel `lokasi`.**

Kolom `aktivitas.lokasi` menjadi FK ke:

```text
mastersheet.lokasi
```

Hal ini mengikuti struktur database yang telah ditetapkan.

---

# 6. Data Source SBT

Data SBT merupakan data referensi nilai SBT.

Kolom sumber:

| Kolom Excel | Kolom Database | Keterangan |
|---|---|---|
| `Kode` | `sbt.kode_sbt` | Kode SBT |
| `Status` | - | Status |
| `Pupuk` | - | Jenis pupuk |
| `Jenis` | - | Jenis bibit |
| `Kelas` | - | Kelas bibit |
| `Group Cost` | - | Group cost |
| `umur` | - | Umur |
| `SBT` | `sbt.nilai_sbt` | Nilai SBT |

### Target tabel

```text
sbt
├── kode_sbt       PK
└── nilai_sbt
```

> Kolom kombinasi `Status`, `Pupuk`, `Jenis`, `Kelas`, `Group Cost`, dan `umur` merupakan bagian dari source SBT, tetapi tabel `sbt` pada dokumentasi database saat ini hanya menyimpan `kode_sbt` dan `nilai_sbt`. Karena itu mapping import harus mengikuti struktur tabel aktual.

---

# 7. Empat Jenis Import

Halaman Admin dapat menyediakan pilihan:

```text
Jenis Data
[ MasterSheet ▼ ]
```

Pilihan:

```text
├── MasterSheet
├── Lokasi
├── Aktivitas
└── SBT
```

Masing-masing pilihan menggunakan template/validasi kolom yang berbeda.

---

# 8. Struktur Halaman Admin

Contoh:

```text
+------------------------------------------------+
|                  IMPORT DATA                   |
+------------------------------------------------+
|                                                |
| Jenis Data                                     |
| [ MasterSheet                           ▼ ]    |
|                                                |
| File Excel                                     |
| [ Choose File ]  MasterSheet.xlsx              |
|                                                |
|                [ Upload & Import ]             |
|                                                |
+------------------------------------------------+
```

Setelah Admin memilih jenis data, sistem menampilkan persyaratan kolom yang sesuai.

Contoh:

```text
Jenis Data: MasterSheet

Kolom wajib:
✓ lokasi
✓ wilayah
✓ luas
✓ status lokasi
✓ kode bibit
✓ status
✓ jenis
✓ kelas
```

---

# 9. Alur Import

## 9.1 Alur umum

```text
Admin
  ↓
Pilih jenis data
  ↓
Pilih file Excel
  ↓
Upload
  ↓
Validasi ekstensi & ukuran
  ↓
Baca workbook Excel
  ↓
Validasi sheet
  ↓
Validasi header
  ↓
Validasi isi
  ↓
Transformasi kolom
  ↓
Validasi FK / referensi
  ↓
Import ke database
  ↓
Simpan history
  ↓
Catat log Admin
  ↓
Tampilkan hasil
```

---

# 10. Validasi Berdasarkan Data Source

## 10.1 MasterSheet

Validasi minimal:

```text
lokasi
wilayah
luas
status lokasi
kode bibit
status
jenis
kelas
```

Validasi khusus:

```text
lokasi tidak boleh kosong
lokasi tidak boleh duplikat
luas harus numerik
```

---

## 10.2 Lokasi

Validasi minimal:

```text
Lokasi
Status
Kelas Bibit
Umur
GroupCost
Keterangan_Group_Cost
Pupuk
Cost
kode_sbt
```

Validasi khusus:

```text
Lokasi harus sudah tersedia di mastersheet
Umur harus numerik
Cost harus numerik
kode_sbt harus tersedia di tabel sbt
```

Jika `kode_sbt` belum tersedia:

```text
Import gagal / ditandai error:

Kode SBT XXXXX tidak ditemukan pada tabel sbt.
```

---

## 10.3 Aktivitas

Validasi minimal:

```text
Lokasi
aktivitas
biaya
Group
Keterangan Group Cost
```

Validasi khusus:

```text
Lokasi harus tersedia pada mastersheet
biaya harus numerik
aktivitas tidak boleh kosong
```

---

## 10.4 SBT

Validasi minimal:

```text
Kode
SBT
```

Validasi khusus:

```text
Kode SBT tidak boleh kosong
Kode SBT tidak boleh duplikat
Nilai SBT harus numerik
```

---

# 11. Urutan Import yang Direkomendasikan

Karena terdapat Foreign Key, urutan import perlu diperhatikan.

Urutan:

```text
1. MasterSheet
       ↓
2. SBT
       ↓
3. Lokasi
       ↓
4. Aktivitas
```

Alasannya:

### MasterSheet terlebih dahulu

Karena:

```text
lokasi.lokasi
       ↓
mastersheet.lokasi
```

dan:

```text
aktivitas.lokasi
       ↓
mastersheet.lokasi
```

### SBT sebelum Lokasi

Karena:

```text
lokasi.kode_sbt
       ↓
sbt.kode_sbt
```

### Aktivitas terakhir

Karena:

```text
aktivitas.lokasi
       ↓
mastersheet.lokasi
```

Dengan urutan tersebut, risiko Foreign Key gagal dapat dikurangi.

---

# 12. Penyimpanan File Asli

File Excel yang di-upload tetap disimpan sebagai arsip.

Contoh:

```text
storage/
└── excel/
    ├── mastersheet/
    │   ├── 2026-08-19_MasterSheet.xlsx
    │   └── ...
    │
    ├── lokasi/
    │   ├── 2026-08-19_Lokasi.xlsx
    │   └── ...
    │
    ├── aktivitas/
    │   ├── 2026-08-19_Aktivitas.xlsx
    │   └── ...
    │
    └── sbt/
        ├── 2026-08-19_SBT.xlsx
        └── ...
```

File tidak disimpan di:

```text
public/
```

karena file sumber tidak perlu dapat diakses langsung oleh publik.

---

# 13. Import History

Untuk setiap proses upload, sistem sebaiknya menyimpan riwayat.

Contoh tabel:

```text
import_history
```

| Field | Fungsi |
|---|---|
| `id` | ID import |
| `file_name` | Nama file |
| `file_path` | Lokasi file arsip |
| `data_type` | MasterSheet / Lokasi / Aktivitas / SBT |
| `uploaded_by` | Admin yang melakukan upload |
| `uploaded_at` | Waktu upload |
| `status` | SUCCESS / FAILED |
| `total_rows` | Jumlah baris |
| `success_rows` | Jumlah berhasil |
| `failed_rows` | Jumlah gagal |
| `error_message` | Detail error |

Contoh:

| id | file_name | data_type | status | total_rows |
|---:|---|---|---|---:|
| 1 | MasterSheet.xlsx | MasterSheet | SUCCESS | 1.250 |
| 2 | SBT.xlsx | SBT | SUCCESS | 2.100 |
| 3 | Lokasi.xlsx | Lokasi | SUCCESS | 8.400 |
| 4 | Aktivitas.xlsx | Aktivitas | FAILED | 5.200 |

---

# 14. Hubungan dengan Log Admin

Fitur import menggunakan log Admin yang sudah tersedia.

Contoh:

```text
User       : Admin01
Action     : IMPORT_DATA
Data Type  : Lokasi
File       : Lokasi_2026-08.xlsx
Status     : SUCCESS
Timestamp  : 2026-08-19 13:45:00
```

`import_history` digunakan untuk detail proses import, sedangkan log digunakan untuk mencatat aktivitas Admin.

Tidak perlu mengubah mekanisme log yang sudah ada.

---

# 15. Staging Data

Untuk file dengan jumlah data besar, proses import sebaiknya menggunakan staging.

Contoh:

```text
Excel Lokasi
     ↓
staging_lokasi
     ↓
validasi
     ↓
lokasi
```

Untuk setiap source dapat dibuat staging terpisah:

```text
staging_mastersheet
staging_lokasi
staging_aktivitas
staging_sbt
```

Staging tidak harus menjadi tabel permanen jika implementasi menggunakan proses sementara/transaksi database.

Tujuan staging:

- Memastikan struktur Excel benar.
- Memastikan data valid.
- Memeriksa FK.
- Menghindari data setengah masuk.
- Memungkinkan rollback jika import gagal.

---

# 16. Mapping dan Transformasi

Proses import tidak hanya melakukan copy Excel → database.

Sistem melakukan mapping:

```text
Excel Header
     ↓
Normalisasi nama kolom
     ↓
Mapping ke field database
     ↓
Validasi
     ↓
Insert / Update
```

Contoh:

```text
"Kelas Bibit"
      ↓
"kelas_bibit"
      ↓
lokasi.kelas_bibit
```

Contoh:

```text
"Keterangan Group Cost"
      ↓
"keterangan_group_cost"
      ↓
aktivitas.keterangan_group_cost
```

---

# 17. Data yang Tidak Masuk Tabel Secara Langsung

Berdasarkan struktur database saat ini, tidak semua kolom source disimpan sebagai kolom tabel.

Contoh:

### Source Aktivitas

```text
Lokasi
status
wilayah
luas
kelas
aktivitas
biaya
UoM
Group
Keterangan Group Cost
```

Tetapi tabel `aktivitas` saat ini menyimpan:

```text
id_aktivitas
lokasi
aktivitas
group_cost
keterangan_group_cost
biaya
```

Maka:

```text
status
wilayah
luas
kelas
UoM
```

tidak boleh otomatis dibuat sebagai kolom baru hanya karena ada di Excel.

Jika data tersebut diperlukan untuk dashboard, keputusan penambahan kolom harus dilakukan pada desain database terlebih dahulu.

Hal yang sama berlaku pada source `Lokasi` dan `SBT`.

---

# 18. Data Analitik Tidak Di-upload Langsung

Data berikut:

```text
trend_cost_umur
trend_cost_umur_table
analisis_lokasi
analisis_group_cost
aktivitas_pekerjaan
```

bukan file input utama.

Data tersebut merupakan **derived/analytic dataset** yang dibentuk dari tabel:

```text
mastersheet
lokasi
aktivitas
sbt
```

Contoh:

```text
lokasi + mastersheet
        ↓
trend_cost_umur
```

atau:

```text
lokasi + mastersheet + sbt
        ↓
analisis_group_cost
```

Karena itu Admin tidak perlu meng-upload Excel khusus untuk `trend_cost_umur`.

---

# 19. Perhitungan Trend Cost per Umur

Sumber:

```text
mastersheet.wilayah
lokasi.umur
lokasi.cost
mastersheet.luas
```

Perhitungan:

```text
Cost/Ha =
SUM(cost) / SUM(luas)
```

Kelompok:

```text
wilayah
umur
```

Hasil:

```text
wilayah | umur | total_cost | total_luas | cost_per_ha
```

Dashboard kemudian menggunakan hasil tersebut untuk grafik trend.

---

# 20. Analisis Lokasi

Sumber:

```text
mastersheet
+
lokasi
```

Informasi:

```text
lokasi
wilayah
luas
umur
group_cost
pupuk
cost
cost_per_ha
```

Perhitungan:

```text
Cost/Ha = Cost / Luas
```

---

# 21. Analisis Group Cost dan SBT

Sumber:

```text
lokasi
   │
   └── kode_sbt
          ↓
         sbt
```

Informasi:

```text
group_cost
kode_sbt
nilai_sbt
cost
luas
cost_per_ha
```

Perhitungan:

```text
Cost/Ha = Cost / Luas
```

---

# 22. Analisis Aktivitas

Sumber:

```text
aktivitas
     +
mastersheet
```

Informasi:

```text
lokasi
wilayah
aktivitas
group_cost
keterangan_group_cost
biaya
luas
cost_per_ha
```

Perhitungan:

```text
Cost/Ha = Biaya / Luas
```

---

# 23. Replace, Append, atau Upsert

Metode import replace saja

### Replace

```text
Upload Excel
     ↓
Data lama source tersebut diganti
     ↓
Data Excel terbaru
```

Cocok apabila file merupakan snapshot kondisi terbaru.



# 24. Error Handling

Jika struktur Excel salah:

```text
❌ Import gagal

Data Type:
Lokasi

Error:
Kolom "Umur" tidak ditemukan.
```

Jika FK tidak ditemukan:

```text
❌ Import gagal

Data Type:
Lokasi

Error:
Kode SBT "ABC123" tidak ditemukan pada tabel sbt.
```

Jika duplikat MasterSheet:

```text
❌ Import gagal

Data Type:
MasterSheet

Error:
Lokasi "011C1" ditemukan lebih dari satu kali.
```

Jika berhasil:

```text
✓ Import berhasil

Data Type:
Lokasi

Total:
8.400 baris

Berhasil:
8.400 baris

Gagal:
0 baris
```

---

# 25. Transaksi Database

Import sebaiknya dilakukan dalam transaksi.

Konsep:

```text
BEGIN TRANSACTION
        ↓
Validasi
        ↓
Insert / Update
        ↓
Berhasil?
   ┌────┴────┐
  YES        NO
   │          │
 COMMIT     ROLLBACK
```

Dengan demikian, jika proses gagal di tengah jalan, data utama dapat dikembalikan ke kondisi sebelumnya.

---

# 26. Urutan Proses Import Secara Lengkap

```text
                ADMIN
                  │
                  ▼
          Pilih Data Source
                  │
       ┌──────────┼───────────┐
       │          │           │
       ▼          ▼           ▼
 MasterSheet    Lokasi     Aktivitas
       │          │           │
       └──────────┼───────────┘
                  │
                 SBT
                  │
                  ▼
            Upload Excel
                  │
                  ▼
          Validasi File
                  │
                  ▼
          Baca Excel
                  │
                  ▼
       Validasi Header
                  │
                  ▼
        Validasi Isi Data
                  │
                  ▼
       Validasi Relasi/FK
                  │
                  ▼
            Transaction
                  │
                  ▼
             Database
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
 mastersheet    lokasi   aktivitas
                  │
                  ▼
                 sbt
                  │
                  ▼
             Dashboard
```

---

# 27. Rekomendasi Struktur Folder File

Contoh untuk deployment:

```text
project/
│
├── app/
├── components/
├── lib/
├── prisma/
│
├── storage/
│   └── excelWIP/
│       ├── mastersheet/
│       ├── lokasi/
│       ├── aktivitas/
│       └── sbt/
│
└── ...
```

`storage/excel` digunakan sebagai penyimpanan file sumber asli.

Jika nantinya aplikasi dipindahkan ke VPS/cloud, lokasi storage dapat dipindahkan ke object storage tanpa mengubah konsep database.

---

# 28. Library Pemrosesan Excel

Pada sisi server dapat digunakan library seperti:

```text
xlsx / SheetJS
```

Alur:

```text
Excel
  ↓
Excel Parser
  ↓
Rows / JSON
  ↓
Mapping
  ↓
Validation
  ↓
Database
```

Library ini hanya digunakan untuk proses import Excel.

**API dashboard yang sudah ada tidak perlu diubah hanya karena proses upload ditambahkan.**

---

# 29. Dampak terhadap API yang Sudah Ada

Fitur import merupakan proses tambahan pada sisi Admin.

Struktur konseptual:

```text
                     DATABASE
                         ▲
                         │
             ┌───────────┴───────────┐
             │                       │
        Dashboard API          Import Process
             │                       ▲
             │                       │
             ▼                    Excel
       Dashboard Publik             ▲
                                    │
                                  Admin
```

API dashboard tetap membaca database seperti sebelumnya.

Proses import hanya bertugas memperbarui/memasukkan data ke database.

Dengan demikian:

> **Tidak perlu mengubah API dashboard yang sudah ada.**

Jika diperlukan endpoint baru khusus import, endpoint tersebut dibuat sebagai modul Admin terpisah dan tidak mengubah kontrak endpoint dashboard yang sudah berjalan.

---

# 30. Kesimpulan

Berdasarkan struktur database saat ini, fitur upload Excel sebaiknya menggunakan empat jenis import:

```text
1. MasterSheet
2. Lokasi
3. Aktivitas
4. SBT
```

Mapping utamanya:

```text
MasterSheet.xlsx
       ↓
mastersheet

Lokasi.xlsx
       ↓
lokasi

Aktivitas.xlsx
       ↓
aktivitas

SBT.xlsx
       ↓
sbt
```

Relasi database:

```text
mastersheet (1) ───── (N) lokasi
mastersheet (1) ───── (N) aktivitas
sbt        (1) ───── (N) lokasi
```

Data analitik:

```text
mastersheet + lokasi
        ↓
trend_cost_umur
analisis_lokasi

mastersheet + lokasi + sbt
        ↓
analisis_group_cost

mastersheet + aktivitas
        ↓
aktivitas_pekerjaan
```

Sehingga arsitektur akhirnya:

```text
Excel Source
     │
     ▼
Admin Upload
     │
     ▼
Validasi + Mapping
     │
     ▼
Database
 ┌───┼────────┬─────────┐
 ▼   ▼        ▼         ▼
MS  Lokasi  Aktivitas  SBT
 └───┬────────┬─────────┘
     ▼        ▼
 Derived / Analytic Views
     │
     ▼
Dashboard Publik
```

**Excel menjadi media input dan arsip, database menjadi sumber utama dashboard, sedangkan dataset analitik dibentuk dari tabel database.**

> Struktur tabel dan mapping di atas mengikuti dokumentasi database yang diberikan. Jika terdapat kolom Excel baru yang belum tercantum pada tabel database, kolom tersebut tidak otomatis ditambahkan ke database; perubahan schema harus diputuskan terlebih dahulu.
