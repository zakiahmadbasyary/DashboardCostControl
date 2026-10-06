# PRD — Dashboard Harga Material

## 1. Informasi Umum

**Nama Proyek:** Dashboard Harga Material  
**Modul:** Harga Material  
**Tujuan:** Menampilkan informasi perkembangan harga material berdasarkan data master material dan data harga material secara ringkas, interaktif, dan mudah dianalisis.

Dashboard mengikuti **warna, font, gaya komponen, spacing, dan pola visual dari dashboard Cost Control yang sudah ada**.

> **Catatan:** Navbar yang sudah tersedia dianggap sudah benar dan **tidak perlu diubah**. Pengembangan difokuskan pada area konten dashboard Harga Material.

---

# 2. Tujuan Dashboard

Dashboard Harga Material digunakan untuk:

1. Melihat perkembangan harga suatu material dari bulan 1 sampai bulan 12.
2. Melihat nilai/harga terbaru dari material yang dipilih.
3. Melihat informasi dasar material.
4. Membandingkan nilai harga material antarbulan.
5. Melihat detail harga berbagai material dalam bentuk tabel.
6. Memudahkan pengguna melakukan filter berdasarkan `group` dan `material`.

---

# 3. Sumber Data

Dashboard menggunakan dua tabel database:

### `mastersheet`

Digunakan sebagai sumber data master material.

Kolom yang digunakan:

- `material`
- `abc_indicator`
- `material_description`
- `base_unit_of_measure`
- `group`

### `bahan_material`

Digunakan sebagai sumber data harga material.

Kolom yang digunakan:

- `id`
- `material`
- `price`
- `currency`
- `price_unit`
- `material_group`
- `plant`
- `purchasing_group`
- `last_change`
- `created_by`
- `update`
- `nilai`

---

# 4. Struktur Halaman

Area konten utama dashboard terdiri dari **2 card utama**:

```text
┌──────────────────────────────────────────────────────────────┐
│                         NAVBAR                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ CARD 1 — ANALISIS HARGA MATERIAL                     │  │
│  │                                                        │  │
│  │ Group [▼]       Material [▼]                          │  │
│  │                                                        │  │
│  │ ┌──────────────────────────┐ ┌──────────────────────┐ │  │
│  │ │                          │ │ Informasi Material   │ │  │
│  │ │       BAR CHART          │ │                      │ │  │
│  │ │      Bulan 1–12          │ │ Material             │ │  │
│  │ │                          │ │ Group                │ │  │
│  │ │                          │ │ Nilai Terbaru        │ │  │
│  │ └──────────────────────────┘ └──────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ CARD 2 — DETAIL HARGA MATERIAL                       │  │
│  │                                                        │  │
│  │ Material | Deskripsi | Group | UoM | 1 | 2 | ... | 12│  │
│  │                                                        │  │
│  │ ...                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 5. CARD 1 — Analisis Harga Material

Card pertama digunakan untuk menampilkan grafik perkembangan harga serta informasi material yang sedang dipilih.

Card terdiri dari:

1. Filter `Group`
2. Filter `Material`
3. Grafik batang
4. Card informasi material

---

## 5.1 Filter Group

### Tujuan

Filter `Group` digunakan untuk menentukan kelompok material yang ingin ditampilkan.

### Sumber Data

Nilai filter berasal dari:

```text
mastersheet.group
```

### Ketentuan

- Menampilkan daftar `group` yang tersedia.
- Tidak boleh menampilkan duplikasi nilai.
- Menyediakan opsi **All Group** sebagai pilihan awal.
- Ketika pengguna memilih suatu group, pilihan material harus mengikuti group tersebut.

Contoh:

```text
Group
┌────────────────────┐
│ All Group        ▼ │
├────────────────────┤
│ Pupuk              │
│ Pestisida          │
│ Maintenance        │
└────────────────────┘
```

---

# 6. Filter Material

### Tujuan

Filter `Material` digunakan untuk memilih material yang akan dianalisis pada grafik dan card informasi.

### Sumber Data

Nilai material berasal dari:

```text
mastersheet.material
```

### Filter Dependent

Filter material bersifat **dependent terhadap filter group**.

Artinya:

```text
Group
  │
  ▼
Filter Material
```

Jika pengguna memilih:

```text
Group = Pupuk
```

maka filter Material hanya menampilkan material yang memiliki:

```text
mastersheet.group = "Pupuk"
```

Contoh:

```text
Group = Pupuk

Material
┌────────────────────┐
│ MAT001           ▼ │
├────────────────────┤
│ MAT001              │
│ MAT004              │
│ MAT008              │
└────────────────────┘
```

Jika `Group = All Group`, maka filter Material menampilkan seluruh material.

---

# 7. Perilaku Filter

Filter `Group` dan `Material` memengaruhi:

- Grafik batang
- Card informasi

Untuk Card 2, tabel detail harga mengikuti data material yang tersedia sesuai konteks dashboard/filter yang diterapkan.

### Urutan interaksi

```text
Pilih Group
     │
     ▼
Daftar Material diperbarui
     │
     ▼
Pilih Material
     │
     ├───────────────┐
     ▼               ▼
Bar Chart      Card Informasi
```

### Ketika Group berubah

Jika pengguna mengganti `Group`, maka:

1. Daftar material diperbarui.
2. Material yang sebelumnya dipilih harus divalidasi.
3. Jika material sebelumnya tidak termasuk dalam group baru, material harus di-reset ke pilihan yang tersedia.
4. Grafik diperbarui.
5. Card informasi diperbarui.

---

# 8. Grafik Batang

## Tujuan

Grafik batang digunakan untuk menampilkan **perkembangan nilai/harga material dari bulan 1 sampai bulan 12**.

### Jenis

**Bar Chart / Column Chart**

### Sumbu X

Bulan:

```text
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
```

### Sumbu Y

Menggunakan:

```text
bahan_material.nilai
```

### Sumber Bulan

Bulan ditentukan berdasarkan kolom:

```text
bahan_material.update
```

Bulan diambil dari tanggal pada kolom `update`.

Contoh:

```text
update = 2026-01-15
        ↓
bulan = 1
```

```text
update = 2026-08-20
        ↓
bulan = 8
```

### Data Grafik

Grafik menampilkan:

```text
Bulan → nilai
```

berdasarkan material yang sedang dipilih.

Contoh:

| Bulan | Nilai |
|---:|---:|
| 1 | 5.000 |
| 2 | 5.100 |
| 3 | 5.150 |
| 4 | 5.200 |
| ... | ... |
| 12 | 5.500 |

### Ketentuan

- Selalu menyediakan kategori bulan 1–12.
- Jika suatu bulan tidak memiliki data, nilai dapat ditampilkan sebagai `0`, `-`, atau kosong sesuai standar visual dashboard yang sudah ada.
- Data harus diurutkan berdasarkan nomor bulan.
- Grafik mengikuti material yang dipilih.
- Jika material berubah, grafik diperbarui secara dinamis.
- Jika terdapat lebih dari satu data untuk material yang sama pada bulan yang sama, perlu ditentukan aturan agregasi berdasarkan data aktual. Default yang disarankan adalah menggunakan **data dengan `update` paling terbaru pada bulan tersebut**.

---

# 9. Card Informasi Material

Card informasi berada di samping grafik batang.

Card digunakan untuk menampilkan ringkasan material yang sedang dipilih.

Informasi yang ditampilkan:

### 1. Nama Material

Sumber:

```text
mastersheet.material
```

### 2. Group

Sumber:

```text
mastersheet.group
```

### 3. Nilai Terbaru

Sumber:

```text
bahan_material.nilai
```

Nilai terbaru ditentukan berdasarkan data dengan tanggal `update` paling baru untuk material yang dipilih.

### Contoh

```text
┌─────────────────────────────┐
│ INFORMASI MATERIAL          │
│                             │
│ Material                    │
│ MAT001                      │
│                             │
│ Group                       │
│ Pupuk                       │
│                             │
│ Nilai Terbaru               │
│ Rp5.500                     │
└─────────────────────────────┘
```

### Aturan Nilai Terbaru

Nilai terbaru **tidak berdasarkan nilai terbesar**, tetapi berdasarkan:

```text
MAX(update)
```

untuk material yang dipilih.

Contoh:

| Material | Update | Nilai |
|---|---|---:|
| MAT001 | 2026-01-10 | 5.000 |
| MAT001 | 2026-05-12 | 5.250 |
| MAT001 | 2026-09-20 | 5.500 |

Maka:

```text
Nilai Terbaru = 5.500
```

karena tanggal `2026-09-20` merupakan `update` paling baru.

---

# 10. CARD 2 — Detail Harga Material

Card kedua digunakan untuk menampilkan tabel detail harga material.

Tabel menampilkan informasi dasar material dan nilai harga dari bulan 1 sampai bulan 12.

---

# 11. Struktur Tabel Detail

Kolom tabel:

| No | Kolom | Sumber |
|---:|---|---|
| 1 | Material | `mastersheet.material` |
| 2 | Deskripsi | `mastersheet.material_description` |
| 3 | Group | `mastersheet.group` |
| 4 | UoM | `mastersheet.base_unit_of_measure` |
| 5 | 1 | `bahan_material.nilai` |
| 6 | 2 | `bahan_material.nilai` |
| 7 | 3 | `bahan_material.nilai` |
| 8 | 4 | `bahan_material.nilai` |
| 9 | 5 | `bahan_material.nilai` |
| 10 | 6 | `bahan_material.nilai` |
| 11 | 7 | `bahan_material.nilai` |
| 12 | 8 | `bahan_material.nilai` |
| 13 | 9 | `bahan_material.nilai` |
| 14 | 10 | `bahan_material.nilai` |
| 15 | 11 | `bahan_material.nilai` |
| 16 | 12 | `bahan_material.nilai` |

### Tampilan

```text
┌────────┬────────────┬────────┬─────┬────┬────┬────┬─────┐
│Material│ Deskripsi  │ Group  │ UoM │ 1  │ 2  │ 3  │ ... │
├────────┼────────────┼────────┼─────┼────┼────┼────┼─────┤
│MAT001  │ Pupuk NPK  │ Pupuk  │ KG  │5000│5100│5150│ ... │
│MAT002  │ Herbisida  │ Pestis│ L   │8500│8600│8700│ ... │
└────────┴────────────┴────────┴─────┴────┴────┴────┴─────┘
```

Kolom bulan:

```text
1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
```

---

# 12. Penentuan Bulan pada Tabel

Bulan tidak berasal dari kolom khusus bulan.

Bulan ditentukan berdasarkan:

```text
bahan_material.update
```

Contoh:

```text
update = 2026-03-15
```

maka data:

```text
nilai = 5.150
```

dimasukkan ke kolom:

```text
3
```

---

# 13. Jika Terdapat Beberapa Data pada Bulan yang Sama

Jika satu material memiliki lebih dari satu data `bahan_material` pada bulan yang sama, gunakan data dengan `update` paling baru pada bulan tersebut.

Contoh:

| Material | Update | Nilai |
|---|---|---:|
| MAT001 | 2026-03-01 | 5.100 |
| MAT001 | 2026-03-15 | 5.150 |
| MAT001 | 2026-03-28 | 5.200 |

Maka kolom bulan `3` menampilkan:

```text
5.200
```

karena `2026-03-28` merupakan tanggal `update` terbaru pada bulan tersebut.

---

# 14. Format Nilai

Nilai pada grafik, card informasi, dan tabel harus mengikuti format harga yang konsisten dengan dashboard lain.

Contoh:

```text
5.000
5.250
5.500
```

Jika currency diperlukan pada tampilan, dapat menggunakan format:

```text
Rp5.000
Rp5.250
Rp5.500
```

Format final mengikuti standar format angka yang telah digunakan pada dashboard Cost Control.

---

# 15. Empty State

Dashboard harus menangani kondisi ketika data tidak tersedia.

### Grafik

Jika tidak ada data:

```text
Belum ada data harga material
```

### Card informasi

Jika material belum dipilih:

```text
Pilih material untuk melihat informasi
```

### Tabel

Jika tidak ada data:

```text
Tidak ada data material
```

---

# 16. Loading State

Saat data sedang diambil dari backend:

- Tampilkan skeleton/loading pada grafik.
- Tampilkan skeleton/loading pada card informasi.
- Tampilkan skeleton/loading pada tabel.
- Jangan menampilkan data lama seolah-olah merupakan hasil filter terbaru.

---

# 17. Error State

Jika terjadi kesalahan saat mengambil data:

```text
Gagal memuat data harga material.
Silakan coba lagi.
```

Sediakan tombol atau mekanisme:

```text
Coba Lagi
```

---

# 18. Responsive Design

Dashboard harus tetap dapat digunakan pada:

- Desktop
- Laptop
- Tablet

### Desktop

Card 1:

```text
┌──────────────────────────────┬─────────────────┐
│          Bar Chart           │ Card Informasi  │
└──────────────────────────────┴─────────────────┘
```

### Tablet / ukuran lebih kecil

Komponen dapat berubah menjadi:

```text
┌──────────────────────────────┐
│          Bar Chart           │
├──────────────────────────────┤
│      Card Informasi          │
└──────────────────────────────┘
```

Card 2 menggunakan horizontal scrolling jika tabel memiliki banyak kolom.

---

# 19. Visual Design

Dashboard harus menggunakan **design system yang sama dengan dashboard Cost Control yang sudah ada**.

### Wajib dipertahankan

- Font yang sudah digunakan dashboard sebelumnya.
- Warna primary.
- Warna secondary.
- Warna background.
- Border radius.
- Shadow.
- Style dropdown/filter.
- Style card.
- Style tabel.
- Style heading.
- Style typography.
- Spacing dan padding.

### Prinsip

Jangan membuat tema warna baru.

Dashboard Harga Material harus terlihat sebagai bagian dari satu ekosistem dashboard Cost Control.

---

# 20. Backend Data Logic

## Query Master Material

Filter Group:

```text
SELECT DISTINCT group
FROM mastersheet
ORDER BY group
```

Filter Material berdasarkan Group:

```text
SELECT material
FROM mastersheet
WHERE group = selectedGroup
ORDER BY material
```

Jika `selectedGroup = ALL`, tampilkan seluruh material.

---

# 21. Query Harga Material

Data harga diambil berdasarkan:

```text
bahan_material.material
```

dan bulan dari:

```text
MONTH(bahan_material.update)
```

Nilai yang ditampilkan:

```text
bahan_material.nilai
```

---

# 22. Logika Nilai Terbaru

Untuk material terpilih:

```text
ORDER BY update DESC
LIMIT 1
```

Kemudian ambil:

```text
nilai
```

dan tampilkan pada Card Informasi.

---

# 23. Logika Grafik

Data grafik:

```text
material = selectedMaterial
```

Kemudian:

```text
bulan = MONTH(update)
nilai = nilai
```

Urutkan:

```text
ORDER BY bulan ASC
```

Jika ada lebih dari satu record pada bulan yang sama:

```text
ORDER BY update DESC
```

dan gunakan record terbaru pada bulan tersebut.

---

# 24. Logika Tabel

Tabel melakukan pivot data harga menjadi:

```text
Material | Deskripsi | Group | UoM | 1 | 2 | ... | 12
```

Data bulan diperoleh dari:

```text
MONTH(update)
```

Data harga diperoleh dari:

```text
nilai
```

Untuk setiap:

```text
material + bulan
```

gunakan record dengan `update` terbaru.

---

# 25. Acceptance Criteria

### Filter Group

- [ ] Filter menampilkan group dari `mastersheet`.
- [ ] Tidak ada group duplikat.
- [ ] Tersedia pilihan All Group.
- [ ] Perubahan group memperbarui pilihan material.

### Filter Material

- [ ] Material berasal dari `mastersheet`.
- [ ] Material mengikuti group yang dipilih.
- [ ] Material dapat dipilih untuk analisis.

### Grafik

- [ ] Grafik berbentuk bar chart.
- [ ] Menampilkan bulan 1–12.
- [ ] Data menggunakan `bahan_material.nilai`.
- [ ] Bulan ditentukan dari `bahan_material.update`.
- [ ] Grafik berubah ketika material berubah.
- [ ] Jika terdapat beberapa data dalam bulan yang sama, digunakan `update` terbaru.

### Card Informasi

- [ ] Menampilkan nama material.
- [ ] Menampilkan group.
- [ ] Menampilkan nilai terbaru.
- [ ] Nilai terbaru berdasarkan `update` paling baru.

### Tabel

- [ ] Menampilkan material.
- [ ] Menampilkan deskripsi.
- [ ] Menampilkan group.
- [ ] Menampilkan UoM.
- [ ] Menampilkan bulan 1–12.
- [ ] Nilai bulan berasal dari `bahan_material.nilai`.
- [ ] Bulan ditentukan dari `bahan_material.update`.
- [ ] Jika terdapat beberapa data pada bulan yang sama, digunakan data dengan `update` terbaru.

### UI/UX

- [ ] Navbar tidak diubah.
- [ ] Warna mengikuti dashboard Cost Control.
- [ ] Font mengikuti dashboard Cost Control.
- [ ] Card menggunakan style yang konsisten.
- [ ] Tabel responsive.
- [ ] Tersedia loading state.
- [ ] Tersedia empty state.
- [ ] Tersedia error state.
