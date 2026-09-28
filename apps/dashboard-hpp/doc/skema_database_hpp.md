# Skema Database Sistem HPP

## 1. Deskripsi

Database ini digunakan untuk mendukung sistem **Dashboard HPP (Harga Pokok Produksi)**. Database terdiri dari empat tabel utama:

1. `mastersheet`
2. `lokasiHPP`
3. `aktivitasHPP`
4. `budget`

Relasi utama:

- `mastersheet` 1:N `lokasiHPP`
- `mastersheet` 1:N `aktivitasHPP`
- `budget` 1:N `lokasiHPP`

---

## 2. ERD

```text
                         ┌─────────────────────────┐
                         │       mastersheet       │
                         ├─────────────────────────┤
                         │ PK lokasi               │
                         │    wilayah              │
                         │    kode_bibit           │
                         │    jenis_bibit          │
                         │    kelas_bibit          │
                         └───────────┬─────────────┘
                                     │
                         ┌───────────┴───────────┐
                         │                       │
                        1:N                     1:N
                         │                       │
                         ▼                       ▼
              ┌────────────────────┐   ┌────────────────────┐
              │      lokasiHPP      │   │    aktivitasHPP    │
              ├────────────────────┤   ├────────────────────┤
              │ PK id_lokasi_hpp   │   │ PK id_aktivitas    │
              │ FK lokasi          │   │ FK lokasi          │
              │ FK id_budget       │   │ tanggal_mulai_rawat│
              │ periode            │   │ tanggal_mulai_tanam│
              │ status             │   │ tanggal_forcing_   │
              │ qty_panen          │   │   standard         │
              │ luas_panen         │   │ rencana_forcing    │
              │ luas_aktif         │   │ real_forcing       │
              │ group              │   │ rencana_panen      │
              │ desc_group         │   │ aktivitas          │
              │ jenis_biaya        │   │ biaya              │
              │ biaya              │   │ hasil              │
              └─────────┬──────────┘   │ UoM                │
                        │              │ group              │
                        │ N:1          └────────────────────┘
                        │
                        ▼
              ┌────────────────────┐
              │       budget       │
              ├────────────────────┤
              │ PK id_budget       │
              │ group              │
              │ status             │
              │ periode            │
              │ budget             │
              └────────────────────┘
```

---

# 3. Tabel `mastersheet`

Tabel `mastersheet` menyimpan data master lokasi dan karakteristik bibit.

| Kolom | Tipe Data | Key | Keterangan |
|---|---|---|---|
| `lokasi` | VARCHAR(10) | PK | Kode lokasi, contoh `001A`, `001B` |
| `wilayah` | VARCHAR(10) | - | Wilayah, contoh `W01`–`W07` |
| `kode_bibit` | VARCHAR(20) | - | Kode bibit |
| `jenis_bibit` | VARCHAR(20) | - | Jenis bibit: `sucker`, `crown`, `nursery` |
| `kelas_bibit` | VARCHAR(20) | - | Kelas bibit: `kecil`, `sedang`, `besar` |

### Primary Key

```text
mastersheet.lokasi
```

---

# 4. Tabel `lokasiHPP`

Tabel `lokasiHPP` menyimpan data HPP berdasarkan lokasi dan periode.

| Kolom | Tipe Data | Key | Keterangan |
|---|---|---|---|
| `id_lokasi_hpp` | VARCHAR(20) | PK | ID unik data lokasi HPP |
| `lokasi` | VARCHAR(10) | FK | Referensi ke `mastersheet.lokasi` |
| `id_budget` | VARCHAR(20) | FK | Referensi ke `budget.id_budget` |
| `periode` | INT | - | Periode 1–12 |
| `status` | VARCHAR(10) | - | `NFSC` atau `NSSC` |
| `qty_panen` | DECIMAL(18,2) | - | Jumlah/kuantitas panen |
| `luas_panen` | DECIMAL(18,2) | - | Luas area panen |
| `luas_aktif` | DECIMAL(18,2) | - | Luas area aktif |
| `group` | VARCHAR(10) | - | Kode group, contoh `ZN01` |
| `desc_group` | VARCHAR(255) | - | Penjelasan group |
| `jenis_biaya` | VARCHAR(50) | - | Jenis biaya |
| `biaya` | DECIMAL(18,2) | - | Nilai biaya |

### Primary Key

```text
lokasiHPP.id_lokasi_hpp
```

### Foreign Key

```text
lokasiHPP.lokasi
    → mastersheet.lokasi

lokasiHPP.id_budget
    → budget.id_budget
```

---

# 5. Tabel `aktivitasHPP`

Tabel `aktivitasHPP` menyimpan aktivitas produksi/perawatan yang berkaitan dengan lokasi.

| Kolom | Tipe Data | Key | Keterangan |
|---|---|---|---|
| `id_aktivitas` | VARCHAR(20) | PK | ID unik aktivitas |
| `lokasi` | VARCHAR(10) | FK | Referensi ke `mastersheet.lokasi` |
| `tanggal_mulai_rawat` | DATE | - | Tanggal mulai perawatan |
| `tanggal_mulai_tanam` | DATE | - | Tanggal mulai tanam |
| `tanggal_forcing_standard` | DATE | - | Tanggal forcing standar |
| `rencana_forcing` | DATE | - | Rencana tanggal forcing |
| `real_forcing` | DATE | - | Realisasi forcing |
| `rencana_panen` | DATE | - | Rencana tanggal panen |
| `aktivitas` | VARCHAR(100) | - | Nama aktivitas |
| `biaya` | DECIMAL(18,2) | - | Biaya aktivitas |
| `hasil` | DECIMAL(18,2) | - | Hasil aktivitas |
| `UoM` | VARCHAR(20) | - | Unit of Measurement |
| `group` | VARCHAR(10) | - | Kode group, contoh `ZN01` |

### Primary Key

```text
aktivitasHPP.id_aktivitas
```

### Foreign Key

```text
aktivitasHPP.lokasi
    → mastersheet.lokasi
```

---

# 6. Tabel `budget`

Tabel `budget` menyimpan data anggaran berdasarkan group, status, dan periode.

| Kolom | Tipe Data | Key | Keterangan |
|---|---|---|---|
| `id_budget` | VARCHAR(20) | PK | ID unik budget |
| `group` | VARCHAR(10) | - | Kode group, contoh `ZN01` |
| `status` | VARCHAR(10) | - | Status, contoh `NFSC`, `NSSC` |
| `periode` | INT | - | Periode 1–12 |
| `budget` | DECIMAL(18,2) | - | Nilai budget |

### Primary Key

```text
budget.id_budget
```

---

# 7. Relasi Antar Tabel

## 7.1 `mastersheet` → `lokasiHPP`

**Kardinalitas: 1:N**

Satu lokasi pada `mastersheet` dapat memiliki banyak data HPP pada `lokasiHPP`.

```text
mastersheet.lokasi
        │
        │ 1
        │
        └────────── N lokasiHPP.lokasi
```

Contoh:

```text
001A
 ├── periode 1
 ├── periode 2
 ├── periode 3
 └── periode 4
```

---

## 7.2 `mastersheet` → `aktivitasHPP`

**Kardinalitas: 1:N**

Satu lokasi dapat memiliki banyak aktivitas HPP.

```text
mastersheet.lokasi
        │
        │ 1
        │
        └────────── N aktivitasHPP.lokasi
```

Contoh:

```text
001A
 ├── Pemupukan
 ├── Weed Control
 ├── Plant Selection
 └── Harvesting
```

---

## 7.3 `budget` → `lokasiHPP`

**Kardinalitas: 1:N**

Satu data budget dapat digunakan oleh banyak data `lokasiHPP`.

```text
budget.id_budget
        │
        │ 1
        │
        └────────── N lokasiHPP.id_budget
```

Contoh:

```text
BUD001
 ├── lokasi 001A
 ├── lokasi 001B
 └── lokasi 002A
```

---

# 8. Ringkasan Foreign Key

| Tabel | Kolom FK | Referensi |
|---|---|---|
| `lokasiHPP` | `lokasi` | `mastersheet.lokasi` |
| `lokasiHPP` | `id_budget` | `budget.id_budget` |
| `aktivitasHPP` | `lokasi` | `mastersheet.lokasi` |

---

# 9. Catatan Desain

### `id_lokasi_hpp` berbeda dengan `lokasi`

`lokasi` digunakan sebagai kode lokasi yang berasal dari tabel master, sedangkan `id_lokasi_hpp` digunakan sebagai identitas unik setiap record pada tabel `lokasiHPP`.

Contoh:

```text
mastersheet
lokasi = 001A

lokasiHPP
id_lokasi_hpp = LH001
lokasi = 001A
periode = 1

id_lokasi_hpp = LH002
lokasi = 001A
periode = 2
```

Dengan desain ini, satu lokasi dapat memiliki banyak record HPP tanpa menjadikan `lokasi` sebagai primary key di `lokasiHPP`.

---

# 10. Ringkasan Struktur

```text
mastersheet
    │
    ├────────────── 1:N ──────────────> lokasiHPP
    │                                    │
    │                                    └──── N:1 ────> budget
    │
    └────────────── 1:N ──────────────> aktivitasHPP
```

Struktur ini menjadi dasar untuk implementasi database PostgreSQL dan selanjutnya dapat diterjemahkan ke dalam **Prisma Schema**.
