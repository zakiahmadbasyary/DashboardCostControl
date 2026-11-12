# PRD Frontend — Weed Control GGP

## 1. Tujuan

Membangun dashboard Weed Control GGP untuk memantau Cost/HA berdasarkan aktivitas, status, wilayah, umur tanaman, dan lokasi. Dashboard menggunakan data dari lima tabel PostgreSQL: `mastersheet`, `cost_umur`, `data_timeline`, `data_material`, dan `data_aktivitas`.

**Prinsip utama:** semua nilai dasar berasal dari Excel/database. Perhitungan Cost/HA dan trend hanya dilakukan untuk penyajian dashboard, tidak disimpan kembali sebagai nilai baru. Jangan menghitung ulang atau mengoreksi nilai sumber.

## 2. Struktur halaman

Urutan bagian:
1. Main Filter.
2. Card Trend Cost Weed Control.
3. Card List Lokasi per Wilayah.
4. Card Detail Lokasi.
5. Card Aktivitas dan Cost.
6. Card Timeline Aktivitas.
7. Popup Bahan Material (dibuka dari Timeline).

Alur interaksi:

```text
Main Filter
  ├── Trend Cost Weed Control
  └── List Lokasi per Wilayah
        └── Klik lokasi
             ├── Detail Lokasi
             ├── Aktivitas dan Cost
             └── Timeline Aktivitas
                    └── Klik nilai material
                          └── Popup Bahan Material
```

## 3. Main Filter

### 3.1 Filter Aktivitas

Sumber pilihan: nilai unik kolom `aktivitas` dari `data_aktivitas`.

Pilihan:
- `Total Aktivitas` (default).
- Daftar aktivitas yang tersedia di database, diambil secara dinamis.

Hindari opsi NULL/kosong. Perubahan filter aktivitas memperbarui Card Trend Cost dan Card List Lokasi per Wilayah.

### 3.2 Filter Status

Pilihan:
- `NSFC`: hanya data NSFC.
- `NSSC`: hanya data NSSC.
- `NS`: gabungan NSSC dan NSFC.

Untuk pilihan `NS`, gabungkan kedua status sebelum agregasi. Hasil tetap dikelompokkan berdasarkan wilayah dan umur sebagai satu kelompok NS, bukan dua seri terpisah.

### 3.3 Cakupan filter

Main Filter mengendalikan:
- Trend Cost Weed Control.
- List Lokasi per Wilayah.

Filter umur di List Lokasi hanya mengendalikan tabel pada card tersebut. Klik lokasi pada List Lokasi akan mengisi Detail Lokasi, Aktivitas dan Cost, serta Timeline Aktivitas.

Jika perubahan filter membuat lokasi terpilih tidak lagi termasuk hasil, kosongkan pilihan lokasi dan minta pengguna memilih lokasi dari hasil terbaru.

## 4. Card Trend Cost Weed Control

### Tampilan

Grafik batang per wilayah:
- Sumbu X: umur.
- Sumbu Y: Cost/HA (Rupiah per hektare).
- Seri/kelompok: wilayah.
- Tooltip: wilayah, umur, Cost/HA, dan informasi nilai pembilang/penyebut bila relevan.

Grafik mengikuti Main Filter Aktivitas dan Status.

### 4.1 Jika Aktivitas = Total Aktivitas

Sumber: `mastersheet.total_cost`, `mastersheet.luas`, `mastersheet.umur`, `mastersheet.wilayah`, `mastersheet.status`.

Umur yang dipakai adalah umur saat ini dari `mastersheet.umur`. **Jangan gunakan `cost_umur` untuk card ini.**

Rumus untuk setiap kelompok wilayah, status, dan umur:

```text
Cost/HA = SUM(mastersheet.total_cost) / SUM(mastersheet.luas)
```

Untuk status NS, gabungkan baris NSSC dan NSFC lalu hitung satu nilai per wilayah dan umur.

### 4.2 Jika Aktivitas tertentu dipilih

Sumber:
- `data_aktivitas.biaya`, `data_aktivitas.lokasi`, `data_aktivitas.aktivitas`.
- `mastersheet.luas`, `mastersheet.umur`, `mastersheet.wilayah`, `mastersheet.status`.

Umur, wilayah, status, dan luas didapat dengan menghubungkan `data_aktivitas.lokasi` ke `mastersheet.lokasi`.

Rumus:

```text
Cost/HA =
SUM(data_aktivitas.biaya untuk aktivitas terpilih)
/
SUM(luas lokasi unik yang memenuhi filter)
```

Filter aktivitas, wilayah, status, dan umur diterapkan. Luas setiap lokasi hanya dihitung satu kali walaupun lokasi tersebut memiliki beberapa transaksi. Seluruh biaya transaksi yang sesuai tetap dijumlahkan. Hindari JOIN mentah yang menggandakan luas.

### 4.3 Perilaku

- Perubahan aktivitas atau status memperbarui grafik.
- Kelompokkan data berdasarkan wilayah dan umur.
- Jangan menganggap umur tanpa data sebagai nol.
- Jika tidak ada data, tampilkan empty state.
- Format nilai sebagai Rupiah/HA.

## 5. Card List Lokasi per Wilayah

### Tampilan dan filter

Tampilkan tabel-tabel yang dikelompokkan berdasarkan wilayah. Sediakan filter umur yang hanya memengaruhi card ini.

Kolom minimal:
- Lokasi
- Cost/HA

Wilayah dapat ditampilkan sebagai judul/header kelompok.

Pilihan umur berasal dari `mastersheet.umur` yang tersedia dan relevan dengan Main Filter. Sediakan opsi `Semua Umur` bila sesuai kebutuhan.

### 5.1 Jika Total Aktivitas

Sumber: tabel `mastersheet`.

Untuk setiap lokasi:

```text
Cost/HA lokasi = mastersheet.total_cost / mastersheet.luas
```

Lokasi harus memenuhi filter status dan umur serta ditampilkan di kelompok wilayahnya.

### 5.2 Jika aktivitas tertentu

Sumber: `data_aktivitas` yang dihubungkan dengan `mastersheet`.

Untuk setiap lokasi:

```text
Cost/HA lokasi =
SUM(data_aktivitas.biaya untuk aktivitas terpilih pada lokasi)
/
mastersheet.luas lokasi
```

Jumlahkan seluruh transaksi aktivitas yang cocok, tetapi ambil luas lokasi satu kali. Tampilkan lokasi yang memiliki transaksi sesuai filter.

### 5.3 Klik lokasi

Setiap baris lokasi dapat diklik dan memiliki penanda visual ketika terpilih. Klik lokasi memperbarui:
- Detail Lokasi.
- Aktivitas dan Cost.
- Timeline Aktivitas.

Jika lokasi terpilih tidak lagi cocok dengan filter, reset pilihan tersebut.

## 6. Card Detail Lokasi

Sumber: `mastersheet` berdasarkan lokasi yang dipilih.

Tampilkan:
- Lokasi
- Status
- Wilayah
- Luas
- Jenis
- Kelas
- Umur

Nilai ditampilkan apa adanya dari master. Jika belum ada lokasi yang dipilih, tampilkan pesan seperti `Pilih lokasi untuk melihat detail`.

## 7. Card Aktivitas dan Cost

### Layout

Pada desktop:
- Bagian kiri: 35%.
- Bagian kanan: 65%.

Pada layar kecil, susun kedua bagian secara vertikal.

### 7.1 Bagian kiri — tabel list aktivitas

Sumber: `data_aktivitas` untuk lokasi terpilih.

Kolom minimal:
- Aktivitas
- Cost/HA

Kelompokkan transaksi berdasarkan aktivitas. Rumus per aktivitas:

```text
Cost/HA aktivitas =
SUM(data_aktivitas.biaya untuk aktivitas tersebut pada lokasi terpilih)
/
mastersheet.luas lokasi terpilih
```

Jumlahkan biaya seluruh transaksi untuk aktivitas yang sama, lalu bagi dengan luas lokasi satu kali. Jangan membagi tiap transaksi secara terpisah lalu menjumlahkan hasilnya.

### 7.2 Bagian kanan — grafik kombinasi Bar + Line

Sumber:
- `cost_umur.cost`
- `cost_umur.umur`
- `cost_umur.lokasi`
- `mastersheet.luas`

Batang menampilkan Cost/HA pada masing-masing umur:

```text
Cost/HA per umur = cost_umur.cost / mastersheet.luas
```

Garis menampilkan akumulasi Cost/HA dari umur 1 sampai umur yang sedang ditampilkan:

```text
Trend kumulatif umur n =
SUM(Cost/HA umur 1 sampai umur n)
```

Ketentuan:
- Sumbu X: umur.
- Bar: Cost/HA pada umur tersebut saja.
- Line: trend kumulatif Cost/HA.
- Grafik mengikuti lokasi terpilih.
- Tooltip menampilkan umur, Cost/HA per umur, dan trend kumulatif.
- Umur tanpa data tidak otomatis dianggap nol.
- Jika luas NULL atau 0, jangan melakukan pembagian; tampilkan `-` atau `Tidak tersedia`.
- Grafik ini bukan grafik transaksi bulanan dan bukan akumulasi jumlah aktivitas.

## 8. Card Timeline Aktivitas

Sumber: `data_timeline`, difilter berdasarkan `lokasi` terpilih.

Tampilkan kolom:
1. Aktivitas (`aktivitas`)
2. Tanggal Realisasi (`tanggal_realisasi`)
3. Umur (`umur`)
4. Hasil (`hasil`)
5. UoM (`uom`)
6. TK (`tk`)
7. Kapasitas/TK (`kapasitas_per_tk`)
8. Total Cost (`total_cost`)
9. Upah (`upah`)
10. Charge (`charge`)
11. Material (`material`)

Ketentuan:
- Tampilkan transaksi sesuai sumber.
- Urutan default dapat menggunakan tanggal realisasi terbaru ke terlama.
- Umur negatif tetap ditampilkan.
- Jangan menghitung ulang hasil, kapasitas/TK, atau biaya.
- Format tanggal, angka, dan Rupiah secara konsisten.
- Gunakan horizontal scroll jika kolom tidak muat.

Kolom `material` pada `data_timeline` adalah total biaya material. Jika transaksi memiliki rincian pada `data_material`, nilai material dapat diklik dan membuka popup. Jika tidak ada rincian, jangan membuka popup kosong.

## 9. Popup Bahan Material

Sumber: `data_material`, berdasarkan `timeline_id` dari transaksi timeline yang diklik.

Kolom:
- Nama Material (`nama_material`)
- Quantity (`quantity`)

Ketentuan:
- Hanya tampilkan material milik transaksi yang dipilih.
- Quantity 0 tetap ditampilkan jika tersimpan.
- Nilai kosong, NULL, dan `-` tidak memiliki baris hasil import.
- Popup memiliki tombol close.
- Jika tidak ada detail material, tampilkan keterangan yang sesuai atau nonaktifkan aksi klik.

## 10. Aturan query dan agregasi

### Status NS

Kondisi filter:

```sql
status IN ('NSSC', 'NSFC')
```

Keduanya diagregasikan menjadi satu hasil per wilayah dan umur.

### Hindari luas terhitung berulang

Saat `data_aktivitas` di-join ke `mastersheet`, satu lokasi bisa mempunyai banyak transaksi. Jumlahkan biaya seluruh transaksi yang cocok, tetapi hitung luas dari lokasi unik satu kali.

### Sumber umur

Untuk Trend Cost dan List Lokasi saat aktivitas tertentu dipilih, umur berasal dari `mastersheet.umur`, bukan `data_timeline.umur`. Ini adalah umur master saat ini, bukan umur historis pada tanggal transaksi.

### Pembagian dengan luas

Jika luas NULL atau 0, jangan membagi. Tampilkan `-` atau `Tidak tersedia`; jangan membuat nilai pengganti.

### Nilai kosong dan nol

- Jangan mengubah nilai kosong menjadi 0 tanpa aturan.
- Nilai angka 0 dari Excel tetap valid.
- Pada `data_material`, angka 0 disimpan dan ditampilkan; tanda `-`, kosong, dan NULL dilewati saat import.

## 11. State dan interaksi frontend

Minimal state:
- `selectedActivity`
- `selectedStatus`
- `selectedAge` (filter umur List Lokasi)
- `selectedLocation`
- `selectedTimelineId` (popup material)

Perilaku:
1. Perubahan aktivitas/status memuat ulang Trend Cost dan List Lokasi.
2. Perubahan umur hanya memuat ulang List Lokasi.
3. Klik lokasi memperbarui Detail Lokasi, Aktivitas dan Cost, serta Timeline.
4. Klik nilai material mengisi `selectedTimelineId` dan membuka popup.
5. Tutup popup mengosongkan `selectedTimelineId`.
6. Tampilkan loading per card.
7. Tangani error per bagian dan sediakan aksi coba lagi.

## 12. Performa dan UX

- Lakukan agregasi di backend/database; jangan mengambil seluruh transaksi ke browser untuk dihitung di frontend.
- Gunakan query yang mencegah luas terduplikasi.
- Gunakan pagination jika data lokasi atau transaksi banyak.
- Ambil detail `data_material` hanya ketika popup dibuka.
- Jangan memuat ulang semua card jika hanya filter umur lokal berubah.
- Pertimbangkan index pada:
  - `mastersheet.wilayah`
  - `mastersheet.status`
  - `mastersheet.umur`
  - `data_aktivitas.lokasi`
  - `data_aktivitas.aktivitas`
  - `data_timeline.lokasi`
  - `data_timeline.tanggal_realisasi`
  - `data_material.timeline_id`
- Jangan membuat unique constraint transaksi hanya untuk alasan performa.
- Pastikan responsif untuk desktop/tablet; tabel dapat horizontal scroll pada layar sempit.

## 13. Acceptance Criteria

Frontend dinyatakan sesuai jika:
1. Main Filter menyediakan Total Aktivitas, daftar aktivitas dari database, NSFC, NSSC, dan NS.
2. Status NS menggabungkan NSSC + NSFC sebagai satu kelompok.
3. Trend Cost menampilkan Cost/HA per wilayah dan umur.
4. Total Aktivitas menggunakan `SUM(mastersheet.total_cost) / SUM(mastersheet.luas)` pada kelompok wilayah-status-umur.
5. Aktivitas tertentu menggunakan `SUM(data_aktivitas.biaya) / luas lokasi unik` yang cocok.
6. Filter umur List Lokasi hanya memengaruhi tabel tersebut.
7. Baris lokasi dapat diklik.
8. Detail Lokasi mengambil data dari `mastersheet`.
9. Layout Aktivitas dan Cost adalah 35% kiri dan 65% kanan pada desktop.
10. Tabel aktivitas menampilkan Cost/HA per aktivitas pada lokasi terpilih.
11. Grafik detail menggunakan bar Cost/HA per umur dan line akumulasi Cost/HA.
12. Timeline menampilkan semua kolom yang ditentukan dari `data_timeline`.
13. Klik nilai material membuka popup berdasarkan `timeline_id`.
14. Quantity 0 pada material tetap ditampilkan.
15. Tidak ada hasil perhitungan dashboard yang disimpan kembali ke database.
16. Loading, empty state, dan error ditangani.

## 14. Hal teknis yang dapat ditetapkan saat implementasi

Jika belum ditentukan, dokumentasikan keputusan untuk:
- Status default saat halaman dibuka.
- Opsi `Semua Umur` pada filter umur.
- Pagination tabel lokasi dan timeline.
- Rentang umur yang ditampilkan pada grafik.
- Aturan pembulatan Cost/HA.

Jangan mengubah keputusan bisnis yang sudah disepakati.

## 15. Ringkasan sumber data dan rumus

| Bagian | Sumber | Aturan |
|---|---|---|
| Filter Aktivitas | `data_aktivitas.aktivitas` | Total Aktivitas atau aktivitas tertentu |
| Filter Status | Status pada master/transaksi sesuai relasi | NS = NSSC + NSFC |
| Trend Cost — Total Aktivitas | `mastersheet` | SUM(total_cost) / SUM(luas), kelompok wilayah-status-umur |
| Trend Cost — Aktivitas tertentu | `data_aktivitas` + `mastersheet` | SUM(biaya) / luas lokasi unik |
| List Lokasi — Total Aktivitas | `mastersheet` | total_cost / luas per lokasi |
| List Lokasi — Aktivitas tertentu | `data_aktivitas` + `mastersheet` | SUM(biaya aktivitas per lokasi) / luas |
| Detail Lokasi | `mastersheet` | Informasi master lokasi |
| Tabel Aktivitas | `data_aktivitas` + `mastersheet` | SUM(biaya per aktivitas) / luas lokasi |
| Grafik Aktivitas dan Cost | `cost_umur` + `mastersheet` | Bar = cost umur / luas; line = akumulasi Cost/HA |
| Timeline Aktivitas | `data_timeline` | Riwayat transaksi lokasi |
| Popup Material | `data_material` | Rincian berdasarkan `timeline_id` |

## 16. Instruksi akhir

Bangun frontend berdasarkan PRD ini. Pertahankan sumber data, rumus, filter, dan interaksi yang telah ditetapkan. Jangan mengarang kolom database, jangan menghitung ulang nilai sumber, dan jangan mengubah definisi bisnis tanpa meminta konfirmasi.
