# Skema Database Harga Material

## 1. Gambaran Umum

Database **Harga Material** terdiri dari 2 tabel:

1. `mastersheet` — menyimpan data master/identitas material.
2. `bahan_material` — menyimpan data harga dan informasi terkait material.

Kedua tabel terhubung melalui kolom `material`.

### Relasi

```text
mastersheet
    │
    │ material (PK)
    │
    │ 1
    │
    │ N
    ▼
bahan_material
    │
    └── material (FK)
```

Artinya, **satu material pada `mastersheet` dapat memiliki banyak data pada `bahan_material`**.

---

# 2. Tabel `mastersheet`

## Fungsi

Tabel `mastersheet` digunakan untuk menyimpan informasi dasar atau identitas setiap material.

## Struktur

| No | Nama Kolom | Tipe Data | Key | Sumber | Keterangan |
|---:|---|---|---|---|---|
| 1 | `material` | VARCHAR(100) | PK | Excel | Kode unik material |
| 2 | `abc_indicator` | VARCHAR(20) | - | Excel | Indikator ABC material |
| 3 | `material_description` | TEXT | - | Excel | Deskripsi/nama material |
| 4 | `base_unit_of_measure` | VARCHAR(20) | - | Excel | Satuan dasar material |
| 5 | `group` | VARCHAR(100) | - | Excel | Kelompok/group material |

### Primary Key

Kolom:

```text
material
```

digunakan sebagai **Primary Key (PK)** karena menjadi identitas unik untuk setiap material.

Contoh:

| material | abc_indicator | material_description | base_unit_of_measure | group |
|---|---|---|---|---|
| MAT001 | A | Pupuk NPK | KG | Pupuk |
| MAT002 | B | Herbisida A | L | Pestisida |
| MAT003 | C | Oli Mesin | L | Maintenance |

---

# 3. Tabel `bahan_material`

## Fungsi

Tabel `bahan_material` digunakan untuk menyimpan informasi harga material dan informasi pendukung yang berasal dari data Excel.

Tabel ini terhubung ke `mastersheet` melalui kolom `material`.

## Struktur

| No | Nama Kolom | Tipe Data | Key | Sumber | Keterangan |
|---:|---|---|---|---|---|
| 1 | `id` | BIGINT / INT | PK | Sistem | ID unik data bahan material |
| 2 | `material` | VARCHAR(100) | FK | Relasi | Kode material yang mengacu ke `mastersheet.material` |
| 3 | `price` | DECIMAL(18,2) | - | Excel | Harga material |
| 4 | `currency` | VARCHAR(10) | - | Excel | Mata uang harga |
| 5 | `price_unit` | DECIMAL(18,2) | - | Excel | Jumlah unit yang menjadi dasar harga |
| 6 | `material_group` | VARCHAR(100) | - | Excel | Kelompok material |
| 7 | `plant` | VARCHAR(100) | - | Excel | Plant/lokasi material |
| 8 | `purchasing_group` | VARCHAR(100) | - | Excel | Kelompok pembelian |
| 9 | `last_change` | DATE / DATETIME | - | Excel | Tanggal perubahan terakhir |
| 10 | `created_by` | VARCHAR(100) | - | Excel | Pengguna yang membuat data |
| 11 | `update` | DATE / DATETIME | - | Excel | Informasi/tanggal update |
| 12 | `nilai` | DECIMAL(18,4) | - | Perhitungan | Hasil `price / price_unit` |

> **Catatan:** Kolom `material` pada `bahan_material` perlu ditambahkan karena merupakan penghubung ke tabel `mastersheet`.

---

# 4. Relasi Antar Tabel

Relasi database menggunakan:

```text
mastersheet.material
        │
        │ 1
        │
        │ N
        ▼
bahan_material.material
```

### Detail

- `mastersheet.material` → **Primary Key**
- `bahan_material.material` → **Foreign Key**
- `bahan_material.id` → **Primary Key**

Dengan demikian:

```text
mastersheet
┌─────────────────────────────┐
│ material (PK)               │
│ abc_indicator               │
│ material_description        │
│ base_unit_of_measure        │
│ group                       │
└──────────────┬──────────────┘
               │
               │ 1 : N
               │
┌──────────────▼──────────────┐
│ bahan_material              │
├─────────────────────────────┤
│ id (PK)                     │
│ material (FK)               │
│ price                       │
│ currency                    │
│ price_unit                  │
│ material_group              │
│ plant                       │
│ purchasing_group            │
│ last_change                 │
│ created_by                  │
│ update                      │
│ nilai                       │
└─────────────────────────────┘
```

---

# 5. Perhitungan `nilai`

Kolom `nilai` pada `bahan_material` merupakan **hasil perhitungan**, bukan data yang diinput langsung.

Rumus:

```text
nilai = price / price_unit
```

Contoh:

```text
price      = 500.000
price_unit = 100

nilai = 500.000 / 100
      = 5.000
```

Sehingga nilai material tersebut adalah **5.000 per unit**.

### Ketentuan

- `price` harus berupa angka.
- `price_unit` harus berupa angka.
- `price_unit` tidak boleh `0`.
- Jika `price_unit` kosong atau `0`, `nilai` tidak dapat dihitung dan dapat disimpan sebagai `NULL`.

---

# 6. Sumber Data

## `mastersheet`

Data berasal dari Excel:

- `material`
- `abc_indicator`
- `material_description`
- `base_unit_of_measure`
- `group`

## `bahan_material`

Data berasal dari Excel:

- `price`
- `currency`
- `price_unit`
- `material_group`
- `plant`
- `purchasing_group`
- `last_change`
- `created_by`
- `update`

Data hasil perhitungan:

- `nilai`

Data relasi:

- `material`

---

# 7. Contoh Data

## `mastersheet`

| material | abc_indicator | material_description | base_unit_of_measure | group |
|---|---|---|---|---|
| MAT001 | A | Pupuk NPK | KG | Pupuk |
| MAT002 | B | Herbisida A | L | Pestisida |

## `bahan_material`

| id | material | price | currency | price_unit | material_group | plant | purchasing_group | last_change | created_by | update | nilai |
|---:|---|---:|---|---:|---|---|---|---|---|---|---:|
| 1 | MAT001 | 500000 | IDR | 100 | Pupuk | PG01 | PG01 | 2026-09-01 | Admin | 2026-09-01 | 5000 |
| 2 | MAT001 | 525000 | IDR | 100 | Pupuk | PG01 | PG01 | 2026-10-01 | Admin | 2026-10-01 | 5250 |
| 3 | MAT002 | 850000 | IDR | 10 | Pestisida | PG01 | PG02 | 2026-09-15 | Admin | 2026-09-15 | 85000 |

Pada contoh tersebut, `MAT001` memiliki **dua data harga**, sehingga terlihat bahwa relasinya adalah **1:N**.

---

# 8. SQL Schema PostgreSQL

```sql
CREATE TABLE mastersheet (
    material VARCHAR(100) PRIMARY KEY,
    abc_indicator VARCHAR(20),
    material_description TEXT,
    base_unit_of_measure VARCHAR(20),
    "group" VARCHAR(100)
);

CREATE TABLE bahan_material (
    id BIGSERIAL PRIMARY KEY,
    material VARCHAR(100) NOT NULL,
    price DECIMAL(18,2),
    currency VARCHAR(10),
    price_unit DECIMAL(18,2),
    material_group VARCHAR(100),
    plant VARCHAR(100),
    purchasing_group VARCHAR(100),
    last_change DATE,
    created_by VARCHAR(100),
    "update" DATE,
    nilai DECIMAL(18,4),

    CONSTRAINT fk_bahan_material_material
        FOREIGN KEY (material)
        REFERENCES mastersheet(material)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
```

> Kolom `group` dan `update` menggunakan tanda kutip pada PostgreSQL karena nama tersebut berpotensi memiliki konflik dengan keyword SQL.

---

# 9. Alur Data

```text
                    EXCEL
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
      Data Master          Data Harga
            │                   │
            ▼                   ▼
      mastersheet         bahan_material
            │                   │
            │   material        │
            └──────────┬────────┘
                       │
                    RELASI
                       │
                       ▼
                 Dashboard
              Harga Material
```

---

# 10. Struktur Akhir

```text
DATABASE HARGA MATERIAL
│
├── mastersheet
│   ├── material (PK)
│   ├── abc_indicator
│   ├── material_description
│   ├── base_unit_of_measure
│   └── group
│
└── bahan_material
    ├── id (PK)
    ├── material (FK → mastersheet.material)
    ├── price
    ├── currency
    ├── price_unit
    ├── material_group
    ├── plant
    ├── purchasing_group
    ├── last_change
    ├── created_by
    ├── update
    └── nilai
```
