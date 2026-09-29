# PRD — Sistem Dashboard HPP PG1

## 1. Informasi Produk
- **Nama:** Dashboard HPP PG1
- **Modul:** Cost Control — HPP (Harga Pokok Produksi)
- **Status:** Prototype / tahap awal
- **Sumber data:** Database dummy
- **Periode:** Januari–Desember
- **Wilayah:** W01–W07
- **Status:** NSSC, NSFC, NS

## 2. Tujuan
Sistem digunakan untuk melihat dan menganalisis HPP pada level:
- periode/bulan;
- wilayah;
- lokasi;
- cost group;
- aktivitas.

Sistem harus mendukung drill-down dari dashboard umum → lokasi → cost group → aktivitas.

## 3. Database
Empat tabel utama:
1. `mastersheet`
2. `lokasiHPP`
3. `aktivitasHPP`
4. `budget`

Relasi:
```text
mastersheet 1:N lokasiHPP
mastersheet 1:N aktivitasHPP
budget 1:N lokasiHPP
```

## 4. Struktur Data

### 4.1 mastersheet

| Field | Tipe | Key | Keterangan |
|---|---|---|---|
| lokasi | VARCHAR(10) | PK | Contoh 001A, 001B |
| wilayah | VARCHAR(10) | - | W01–W07 |
| kode_bibit | VARCHAR(20) | - | Kode bibit |
| jenis_bibit | VARCHAR(20) | - | sucker, crown, nursery |
| kelas_bibit | VARCHAR(20) | - | kecil, sedang, besar |

### 4.2 lokasiHPP

| Field | Tipe | Key | Keterangan |
|---|---|---|---|
| id_lokasi_hpp | VARCHAR(20) | PK | ID unik |
| lokasi | VARCHAR(10) | FK | → mastersheet.lokasi |
| id_budget | VARCHAR(20) | FK | → budget.id_budget |
| periode | INT | - | 1–12 |
| status | VARCHAR(10) | - | NFSC/NSSC |
| qty_panen | DECIMAL(18,2) | - | Jumlah panen |
| luas_panen | DECIMAL(18,2) | - | Luas panen |
| luas_aktif | DECIMAL(18,2) | - | Luas aktif |
| group | VARCHAR(10) | - | Cost group, contoh ZN01 |
| desc_group | VARCHAR(255) | - | Penjelasan group |
| jenis_biaya | VARCHAR(50) | - | Jenis biaya |
| biaya | DECIMAL(18,2) | - | Nilai cost |
| taksasi | DECIMAL(8,2) | - | `(luas_panen / luas_aktif) × 100` |
| yield | DECIMAL(18,4) | - | `qty_panen / luas_panen` |
| rp_kg | DECIMAL(18,2) | - | `biaya / qty_panen` |
| rp_ha | DECIMAL(18,2) | - | `biaya / luas_panen` |

> `taksasi`, `yield`, `rp_kg`, dan `rp_ha` dapat dihitung saat query/view. Pada database dummy, kolom boleh disediakan untuk memudahkan pengujian.

### 4.3 aktivitasHPP

| Field | Tipe | Key | Keterangan |
|---|---|---|---|
| id_aktivitas | VARCHAR(20) | PK | ID aktivitas |
| lokasi | VARCHAR(10) | FK | → mastersheet.lokasi |
| tanggal_mulai_rawat | DATE | - | Tanggal mulai rawat |
| tanggal_mulai_tanam | DATE | - | Tanggal mulai tanam |
| tanggal_forcing_standard | DATE | - | Forcing standard |
| rencana_forcing | DATE | - | Rencana forcing |
| real_forcing | DATE | - | Real forcing |
| rencana_panen | DATE | - | Rencana panen |
| aktivitas | VARCHAR(100) | - | Nama aktivitas |
| biaya | DECIMAL(18,2) | - | Biaya |
| hasil | DECIMAL(18,2) | - | Hasil |
| UoM | VARCHAR(20) | - | Unit of Measurement |
| group | VARCHAR(10) | - | Cost group |

### 4.4 budget

| Field | Tipe | Key | Keterangan |
|---|---|---|---|
| id_budget | VARCHAR(20) | PK | ID budget |
| group | VARCHAR(10) | - | Cost group |
| status | VARCHAR(10) | - | NFSC/NSSC |
| periode | INT | - | 1–12 |
| budget | DECIMAL(18,2) | - | Nilai budget |

## 5. Perhitungan Dasar

### Taksasi
```text
taksasi = (luas_panen / luas_aktif) × 100
```

### Yield
```text
yield = qty_panen / luas_panen
```
Satuan: Ton/Ha.

### Rp/Kg
```text
rp_kg = biaya / qty_panen
```

### Rp/Ha
```text
rp_ha = biaya / luas_panen
```

Semua pembagian harus menggunakan perlindungan terhadap nilai 0/NULL.

## 6. Filter Utama

Layout:
```text
[Taksasi] [Cost Group] [Status] [Bulan] [Report]
```

### Taksasi
Pilihan:
- All Taksasi
- 100% Only

`100% Only` hanya menampilkan data dengan `taksasi = 100%`.

### Cost Group
Mengambil nilai dari:
```text
lokasiHPP.group
```

### Status
Pilihan:
- All
- NSSC
- NSFC
- NS

Status berasal dari data lokasi/master. Untuk filter `NS`, sistem menampilkan gabungan:
```text
NSFC OR NSSC
```

### Bulan
Mengambil `lokasiHPP.periode`:
```text
1 Januari
2 Februari
3 Maret
4 April
5 Mei
6 Juni
7 Juli
8 Agustus
9 September
10 Oktober
11 November
12 Desember
```

### Report
Pilihan:
- Rp/Kg
- Rp/Ha

Rp/Kg:
```text
SUM(cost) / SUM(qty_panen)
```

Rp/Ha:
```text
SUM(cost) / SUM(luas_panen)
```

## 7. Total Cost Lokasi

Satu lokasi dapat memiliki banyak cost group.

Contoh:
```text
001A
  ZN01 = 10.000.000
  ZN02 =  5.000.000
  ZN03 =  3.000.000
  ------------------
  Total = 18.000.000
```

Total cost lokasi dihitung dengan `SUM(biaya)` setelah seluruh filter yang relevan diterapkan.

## 8. Bar Chart Kiri — Trend HPP Pine PG1

Menampilkan:
```text
Jan | Feb | Mar | ... | Dec | YTD
```

Mengikuti filter utama.

### Per bulan — Rp/Kg
```text
SUM(cost seluruh lokasi yang sesuai filter)
-------------------------------------------
SUM(qty seluruh lokasi yang sesuai filter)
```

### Per bulan — Rp/Ha
```text
SUM(cost seluruh lokasi yang sesuai filter)
-------------------------------------------
SUM(luas seluruh lokasi yang sesuai filter)
```

### YTD — Rp/Kg
```text
SUM(cost seluruh bulan dalam YTD)
--------------------------------
SUM(qty seluruh bulan dalam YTD)
```

### YTD — Rp/Ha
```text
SUM(cost seluruh bulan dalam YTD)
--------------------------------
SUM(luas seluruh bulan dalam YTD)
```

YTD harus dihitung dari total cost dan total denominator, bukan rata-rata sederhana HPP bulanan.

## 9. Bar Chart Kanan — HPP Per Wilayah

Wilayah:
```text
W01 W02 W03 W04 W05 W06 W07
```

Mengikuti filter utama, termasuk filter bulan.

### Rp/Kg
```text
SUM(cost lokasi dalam wilayah)
------------------------------
SUM(qty lokasi dalam wilayah)
```

### Rp/Ha
```text
SUM(cost lokasi dalam wilayah)
------------------------------
SUM(luas lokasi dalam wilayah)
```

Wilayah diperoleh dari:
```text
mastersheet.wilayah
```

## 10. Tabel Daftar Lokasi

Berada di bawah dua chart dan tetap terhubung dengan filter utama.

Filter tambahan:
```text
Wilayah: All, W01–W07
```

Kolom:
| Kolom | Sumber |
|---|---|
| Lokasi | `lokasiHPP.lokasi` |
| % Taksasi | `lokasiHPP.taksasi` |
| Yield | `qty_panen / luas_panen` |
| Rp/Kg / Rp/Ha | Mengikuti filter Report |

Karena satu lokasi dapat memiliki banyak cost group, HPP lokasi dihitung:
```text
SUM(cost lokasi) / SUM(qty lokasi)
```
atau:
```text
SUM(cost lokasi) / SUM(luas lokasi)
```

Setiap row lokasi dapat diklik.

## 11. Detail Lokasi

Ketika lokasi dipilih, tampilkan:
- Lokasi
- Jenis
- Kelas
- Luas aktif
- Luas panen
- Rencana forcing
- Rencana panen

Sumber:
- `mastersheet` untuk lokasi, jenis, kelas;
- `lokasiHPP` untuk luas;
- `aktivitasHPP` untuk rencana forcing dan rencana panen.

## 12. Tabel Group Cost Lokasi

Menampilkan seluruh group cost pada lokasi yang dipilih.

Kolom:
| Kolom | Perhitungan |
|---|---|
| Group Cost | `lokasiHPP.group` |
| Cost/Ha | `SUM(cost group lokasi) / luas panen lokasi` |
| Budget | Data `budget` berdasarkan periode + status + group |

Pencarian budget:
```text
lokasiHPP.periode = budget.periode
lokasiHPP.status  = budget.status
lokasiHPP.group   = budget.group
```

Jika tidak ada budget yang cocok:
```text
NULL / kosong
```
Bukan otomatis `0`.

Setiap row group cost dapat diklik.

## 13. Tabel Aktivitas

Ditampilkan setelah user memilih lokasi dan group cost.

Filter:
```text
aktivitasHPP.lokasi = lokasi terpilih
AND
aktivitasHPP.group = group cost terpilih
```

Kolom:
| Kolom | Perhitungan |
|---|---|
| Aktivitas | `aktivitasHPP.aktivitas` |
| Cost/Ha | `aktivitasHPP.biaya / luas_panen lokasi` |

## 14. Alur Drill-Down

```text
FILTER UTAMA
      ↓
TREND HPP + HPP WILAYAH
      ↓
TABEL LOKASI
      ↓ klik lokasi
DETAIL LOKASI
      ↓
GROUP COST
      ↓ klik group
AKTIVITAS
```

Contoh:
```text
Bulan = Maret
Status = NS
Taksasi = 100% Only
Report = Rp/Ha
        ↓
      W03
        ↓
      001A
        ↓
      ZN01
        ↓
   Harvesting
```

## 15. Rancangan UI/UX

### Struktur halaman

```text
┌────────────────────────────────────────────────────────────┐
│ HEADER: Dashboard HPP PG1                                 │
├────────────────────────────────────────────────────────────┤
│ FILTER UTAMA                                               │
│ [Taksasi] [Cost Group] [Status] [Bulan] [Report]          │
├──────────────────────────────┬─────────────────────────────┤
│ TREND HPP PINE PG1           │ HPP PER WILAYAH             │
│ Jan ... Dec | YTD            │ W01 ... W07                │
├──────────────────────────────┴─────────────────────────────┤
│ DAFTAR LOKASI                                               │
│ [Filter Wilayah]                                           │
│ Lokasi | Taksasi | Yield | Rp/Kg/Rp/Ha | Action            │
├────────────────────────────────────────────────────────────┤
│ DETAIL LOKASI                                               │
│ Lokasi | Jenis | Kelas | Luas Aktif | Luas Panen | ...    │
├────────────────────────────────────────────────────────────┤
│ GROUP COST                                                  │
│ Group | Cost/Ha | Budget | Action                          │
├────────────────────────────────────────────────────────────┤
│ AKTIVITAS                                                   │
│ Aktivitas | Cost/Ha                                        │
└────────────────────────────────────────────────────────────┘
```

### Design System
Gunakan gaya Cost Control:
- Primary: `#16823B`
- Dark Green: `#0B6B32`
- Light Green: `#A8D437`
- Yellow: `#FCE27A`
- Orange: `#F9A91B`
- Blue: `#29A9D6`
- Background: `#F7F8FA`

Prinsip:
- clean dan profesional;
- filter mudah terlihat;
- card dengan radius moderat;
- tabel dengan hover state;
- row terpilih memiliki indikator;
- angka Rupiah menggunakan thousand separator;
- chart memiliki tooltip;
- responsive untuk desktop/laptop/tablet.

## 16. State Dashboard

Minimal state:
```text
taksasiFilter
costGroupFilter
statusFilter
periodeFilter
reportFilter
wilayahFilter
selectedLokasi
selectedGroup
```

Flow:
```text
Filter utama
   ↓
Dashboard query
   ↓
Chart + lokasi
   ↓
selectedLokasi
   ↓
Detail + group cost
   ↓
selectedGroup
   ↓
Aktivitas
```

## 17. Dummy Data

Database dummy harus mencakup:
- 7 wilayah;
- beberapa lokasi pada setiap wilayah;
- banyak group cost per lokasi;
- 12 periode;
- status NSFC dan NSSC;
- budget yang tersedia;
- kombinasi tanpa budget;
- taksasi 100%;
- taksasi di bawah 100%;
- nilai qty dan luas yang bervariasi.

Contoh mastersheet:
```text
001A | W01 | B001 | sucker  | kecil
001B | W01 | B002 | crown   | sedang
002A | W02 | B003 | nursery | besar
003A | W03 | B004 | sucker  | sedang
004A | W04 | B005 | crown   | besar
005A | W05 | B006 | nursery | kecil
006A | W06 | B007 | sucker  | besar
007A | W07 | B008 | crown   | sedang
```

Contoh budget:
```text
BUD001 | ZN01 | NSFC | 1 | 50000000
BUD002 | ZN01 | NSSC | 1 | 45000000
BUD003 | ZN02 | NSFC | 1 | 35000000
BUD004 | ZN01 | NSFC | 2 | 52000000
```

## 18. Query Agregasi Konseptual

### Total cost lokasi
```sql
SELECT lokasi, SUM(biaya) AS total_cost
FROM lokasiHPP
GROUP BY lokasi;
```

### HPP Rp/Kg
```sql
SELECT SUM(biaya) / NULLIF(SUM(qty_panen), 0) AS hpp_rp_kg
FROM lokasiHPP;
```

### HPP Rp/Ha
```sql
SELECT SUM(biaya) / NULLIF(SUM(luas_panen), 0) AS hpp_rp_ha
FROM lokasiHPP;
```

### HPP per bulan
```sql
SELECT periode,
       SUM(biaya) / NULLIF(SUM(qty_panen), 0) AS hpp_rp_kg
FROM lokasiHPP
GROUP BY periode
ORDER BY periode;
```

### HPP per wilayah
```sql
SELECT m.wilayah,
       SUM(l.biaya) / NULLIF(SUM(l.qty_panen), 0) AS hpp_rp_kg
FROM lokasiHPP l
JOIN mastersheet m ON l.lokasi = m.lokasi
GROUP BY m.wilayah;
```

Untuk Rp/Ha, denominator diganti menjadi `SUM(luas_panen)`.

## 19. Acceptance Criteria

### Filter
- [ ] Taksasi All dan 100% Only tersedia.
- [ ] Cost Group berasal dari `lokasiHPP.group`.
- [ ] NSSC/NSFC/NS berfungsi.
- [ ] NS = gabungan NSFC + NSSC.
- [ ] Bulan 1–12 tersedia.
- [ ] Report Rp/Kg dan Rp/Ha tersedia.
- [ ] Semua filter utama memengaruhi visualisasi dan tabel terkait.

### Chart
- [ ] Trend menampilkan Jan–Dec + YTD.
- [ ] Trend mengikuti filter.
- [ ] HPP menggunakan `SUM(cost)/SUM(denominator)`.
- [ ] HPP wilayah menampilkan W01–W07.
- [ ] HPP wilayah mengikuti filter bulan.

### Lokasi
- [ ] Lokasi sesuai filter.
- [ ] Filter wilayah tersedia.
- [ ] Taksasi, yield, dan report tampil.
- [ ] Row dapat diklik.

### Detail
- [ ] Detail lokasi tampil.
- [ ] Group cost tampil.
- [ ] Cost/Ha benar.
- [ ] Budget dicari berdasarkan periode, status, group.
- [ ] Budget kosong jika tidak ditemukan.
- [ ] Group cost dapat diklik.
- [ ] Aktivitas sesuai lokasi + group.
- [ ] Cost/Ha aktivitas benar.

## 20. Non-Functional Requirements

### Performance
Index yang disarankan:
```text
lokasiHPP.lokasi
lokasiHPP.periode
lokasiHPP.status
lokasiHPP.group
lokasiHPP.id_budget
aktivitasHPP.lokasi
aktivitasHPP.group
budget.group
budget.status
budget.periode
```

### Error Handling
Jika query gagal:
```text
Data gagal dimuat.
Silakan coba lagi.
```

Jika tidak ada data:
```text
Tidak ada data yang sesuai dengan filter.
```

Jika aktivitas kosong:
```text
Belum ada aktivitas untuk lokasi dan group cost yang dipilih.
```

## 21. Tahapan Pengembangan

### Phase 1 — Database Dummy
- PostgreSQL.
- 4 tabel.
- PK/FK.
- Seed dummy.
- Validasi relasi.

### Phase 2 — Backend/API
Contoh endpoint:
```text
GET /api/hpp/filters
GET /api/hpp/trend
GET /api/hpp/wilayah
GET /api/hpp/lokasi
GET /api/hpp/lokasi/:lokasi
GET /api/hpp/lokasi/:lokasi/group
GET /api/hpp/lokasi/:lokasi/group/:group/aktivitas
```

### Phase 3 — Dashboard
1. Filter.
2. Trend HPP.
3. HPP wilayah.
4. Tabel lokasi.
5. Detail lokasi.
6. Group cost.
7. Aktivitas.

### Phase 4 — Validasi
```text
Excel/kalkulator
      ↕
Database
      ↕
API
      ↕
Dashboard
```

### Phase 5 — Data Aktual
Setelah fungsi dan perhitungan tervalidasi menggunakan dummy database, integrasikan dengan data aktual.

## 22. Prinsip Perhitungan

Semua agregasi harus dilakukan **setelah filter diterapkan**:

```text
Data
 ↓
Taksasi
 ↓
Cost Group
 ↓
Status
 ↓
Bulan
 ↓
Wilayah jika dipilih
 ↓
Agregasi Cost / Qty / Luas
 ↓
HPP
```

Gunakan:
```text
SUM(Cost) / SUM(Denominator)
```

bukan rata-rata sederhana HPP tiap lokasi, kecuali aturan bisnis secara khusus menetapkan metode lain.

## 23. Kesimpulan

Dashboard HPP PG1 menggunakan pendekatan analitik bertingkat:

```text
Dashboard HPP
   ├── Trend HPP
   ├── HPP Wilayah
   └── Daftar Lokasi
          └── Detail Lokasi
                 └── Group Cost
                        └── Aktivitas
```

Prototype menggunakan database dummy terlebih dahulu. Seluruh komponen dibangun dengan prinsip **filter-driven analysis**, sehingga perubahan filter utama konsisten memengaruhi chart, daftar lokasi, detail, cost group, dan aktivitas yang relevan.
