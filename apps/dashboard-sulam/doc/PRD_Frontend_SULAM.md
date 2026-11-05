# PRD Frontend SULAM --- GGP

**Status:** Acuan final desain dan pengembangan frontend\
**Stack:** Next.js, PostgreSQL, Prisma\
**Sumber data:** `summary_sulam` dan `sulam`

## 1. Latar Belakang dan Tujuan

SULAM merupakan kegiatan penanaman kembali tanaman nanas yang rusak atau
mati sebelum mencapai umur yang seharusnya. Dashboard digunakan untuk
mengevaluasi biaya, resource, luas pekerjaan, serta perbandingan kinerja
antar-Plantation Group (PG) dan antarwilayah.

Frontend memiliki dua sub-menu: 1. **Evaluasi Sulam Antar PG** ---
membandingkan indikator PG1, PG2, dan PG3. 2. **Evaluasi Sulam Antar
Wilayah** --- menganalisis wilayah AW01--AW07 (PG1).

Tujuan: - Membandingkan indikator SULAM antar-PG per bulan. -
Menampilkan rekap biaya, resource, dan luas per PG. - Membandingkan
penggunaan TK dan kapasitas batang/TK antarwilayah PG1. - Menganalisis
biaya, resource, dan detail lokasi pada bulan terpilih. - Menjaga
konsistensi angka antara grafik, tabel, dan database.

## 2. Navigasi dan Ruang Lingkup

Gunakan shell/layout, header, sidebar/navbar, pola navigasi, dan
komponen yang sama dengan dashboard CAPEX. Tambahkan dua sub-menu di
atas. Jangan merombak layout CAPEX atau membuat sistem desain yang
berbeda.

Termasuk: grafik, tabel, filter, tooltip, loading/empty/error state,
format angka, dan responsive layout.

Tidak termasuk: input/edit transaksi manual, manajemen master, dan
upload Excel dari halaman dashboard ini. Diasumsikan data telah masuk ke
database melalui alur upload tersendiri.

## 3. Design System --- Mengikuti CAPEX

### Prinsip visual

-   Clean, modern, profesional, dan berorientasi pada monitoring
    operasional.
-   Hierarki informasi jelas; filter ringkas dan mudah ditemukan.
-   Card dengan surface netral, border tipis, dan radius konsisten.
-   Hindari dekorasi, gradient, shadow, dan aksen warna berlebihan.
-   Grafik mengutamakan keterbacaan; tabel padat tetapi nyaman dibaca.
-   Gunakan komponen bersama dari proyek, bukan membuat versi baru tanpa
    kebutuhan.

### Warna

Gunakan token `theme.ts` CAPEX jika tersedia. Nilai acuan:

  Penggunaan           HEX
  -------------------- -----------
  Background utama     `#FFFFFF`
  Surface sekunder     `#F7F9FC`
  Surface alternatif   `#EEF1F8`
  Teks utama / navy    `#0B1E4B`
  Primary blue         `#2563EB`
  Gold accent          `#C6A84B`
  Border               `#DDE3EF`

Warna seri PG harus konsisten: PG1 biru `#2563EB`, PG2 hijau dari token
success CAPEX, PG3 gold `#C6A84B`. Gunakan warna status dan warna
tambahan dari token proyek yang sudah ada. Untuk grafik tujuh wilayah,
gunakan warna utama/netral dan highlight, jangan memakai tujuh warna
mencolok yang tidak perlu.

### Tipografi

Gunakan **Plus Jakarta Sans** dengan fallback system font, mengikuti
CAPEX.

  Elemen               Panduan
  -------------------- ----------------------------
  Judul halaman        20--28 px, weight 700--800
  Judul section/card   14--18 px, weight 600--700
  Isi dan kontrol      12--14 px
  Label/metadata       11--12 px
  Angka utama          20--28 px, weight 700--800

Ikuti skala, line-height, spacing, radius, dan shadow dari theme CAPEX
jika sudah tersedia.

------------------------------------------------------------------------

## 4. Sub-menu 1 --- Evaluasi Sulam Antar PG

### 4.1 Tujuan

Membandingkan PG1, PG2, dan PG3 untuk setiap bulan Januari--Desember
berdasarkan indikator yang dipilih.

### 4.2 Main filter indikator

Pilihan: 1. Upah/HA 2. Batang/HA 3. Upah/Batang 4. Batang/TK 5. TK/Bulan
6. Cost TK/Bulan

Gunakan dropdown atau segmented control ringkas. Filter ini **hanya
mengubah grafik perbandingan antar-PG**, tidak mengubah tabel summary
dan tidak memengaruhi sub-menu kedua.

### 4.3 Grafik perbandingan antar-PG

Jenis: **grouped/clustered bar chart**.

-   Sumbu X: Januari--Desember.
-   Sumbu Y: nilai indikator.
-   Series: PG1, PG2, PG3.
-   Tiga batang berdampingan untuk setiap bulan.
-   Warna PG konsisten di seluruh halaman.
-   Tooltip menampilkan bulan, PG, indikator, nilai, dan satuan.
-   Data kosong harus dibedakan dari nilai nol.

Rumus per PG dan bulan, dari `summary_sulam`:

  Indikator       Rumus
  --------------- --------------------------------
  Upah/HA         `SUM(upah) / SUM(luas)`
  Batang/HA       `SUM(batang) / SUM(luas)`
  Upah/Batang     `SUM(upah) / SUM(batang)`
  Batang/TK       `SUM(batang) / SUM(jumlah_tk)`
  TK/Bulan        `SUM(jumlah_tk)`
  Cost TK/Bulan   `SUM(upah)`

Rasio dihitung dari total pembilang dibagi total penyebut setelah
agregasi per PG dan bulan, bukan rata-rata rasio per wilayah.

**Definisi Cost TK/Bulan:** sesuai keputusan pengguna, ini adalah total
biaya Upah per bulan per PG, bukan biaya rata-rata per orang/TK.

### 4.4 Tabel summary bulanan per PG

Tabel berada di bawah grafik dan memiliki filter PG tersendiri: PG1,
PG2, PG3. Filter ini **hanya mengubah tabel**, bukan grafik.

Tabel selalu menampilkan 12 baris Januari--Desember dan kolom:

1.  Bulan
2.  Material
3.  Upah
4.  Batang
5.  Jumlah TK
6.  Luas
7.  Upah/HA
8.  Batang/HA
9.  Upah/Batang
10. Batang/TK
11. TK/Bulan
12. Cost TK/Bulan

Sumber: `summary_sulam`, difilter berdasarkan PG pilihan dan
dikelompokkan per bulan. Jika satu PG memiliki beberapa wilayah pada
bulan yang sama, jumlahkan nilai dasar terlebih dahulu lalu hitung
rasio.

Rumus rasio sama dengan grafik. Tabel mendukung horizontal scroll pada
layar kecil dan sticky header jika menggunakan container scroll.

### 4.5 Format nilai

-   Material/Upah: Rupiah.
-   Upah/HA: Rupiah/HA.
-   Batang/HA: batang/HA.
-   Upah/Batang: Rupiah/batang.
-   Batang/TK: batang/TK.
-   TK/Bulan: total resource TK tercatat.
-   Cost TK/Bulan: total biaya Upah.
-   Luas: HA.

------------------------------------------------------------------------

## 5. Sub-menu 2 --- Evaluasi Sulam Antar Wilayah

### 5.1 Tujuan dan cakupan

Khusus PG1, yaitu AW01--AW07. Terdiri dari tiga bagian: 1. Perbandingan
bulanan antarwilayah. 2. Analisis empat indikator per wilayah pada bulan
terpilih. 3. Tabel detail agregat seluruh lokasi pada bulan terpilih.

Sumber Bagian 1 adalah `summary_sulam`. Sumber Bagian 2 dan 3 adalah
`sulam`.

### 5.2 Bagian 1 --- Perbandingan bulanan antarwilayah

Bagian ini **selalu menampilkan Januari--Desember sekaligus** dan tidak
dipengaruhi filter bulan Bagian 2.

Dua panel berdampingan pada desktop:

**Panel kiri --- Penggunaan TK/Bulan** - Grafik menggunakan
`summary_sulam.jumlah_tk`. - Sumbu X: Januari--Desember. - Series:
AW01--AW07. - Di bawah grafik terdapat tabel matriks: baris AW01--AW07,
kolom Januari--Desember. - Nilai matriks adalah total `jumlah_tk` per
wilayah dan bulan.

**Panel kanan --- Kapasitas Batang/TK** - Rumus per wilayah dan bulan:
`SUM(batang) / SUM(jumlah_tk)`. - Sumbu X: Januari--Desember. - Series:
AW01--AW07. - Di bawah grafik terdapat tabel matriks: baris AW01--AW07,
kolom Januari--Desember. - Grafik dan tabel matriks harus menggunakan
hasil agregasi yang sama.

Jika jumlah TK = 0, tampilkan `-` atau `N/A`, bukan Infinity/NaN.
Tooltip menampilkan wilayah, bulan, nilai, dan satuan.

### 5.3 Bagian 2 --- Analisis per wilayah

Satu filter bulan mengendalikan keempat grafik di bagian ini dan tabel
Bagian 3. Filter tidak mengubah Bagian 1.

Pilihan bulan Januari--Desember. Default yang disarankan adalah bulan
terbaru yang memiliki data; jika tidak dapat ditentukan, gunakan Januari
sebagai fallback. Periode aktif harus terlihat.

Susunan grafik: grid 2 kolom × 2 baris pada desktop.

**Grafik 1 --- Cost per Wilayah** - Sumber: `sulam`. - Sumbu X:
AW01--AW07. - Rumus: `SUM(total_realisasi_biaya)` untuk semua transaksi
pada wilayah dan bulan terpilih. - Mencakup Material + Upah. - Reverse
tetap dihitung positif. - Satuan: Rupiah.

**Grafik 2 --- Cost/HA per Wilayah** - Sumber: `sulam`. - Sumbu X:
AW01--AW07. - Pembilang: total `total_realisasi_biaya` seluruh transaksi
Material + Upah. - Penyebut: total `hasil_efektif` dengan
`jenis = 'Upah'`. - Satuan: juta Rupiah/HA.

``` text
Cost/HA (juta) =
SUM(total_realisasi_biaya seluruh jenis)
/
SUM(hasil_efektif untuk jenis = 'Upah')
/
1.000.000
```

Tooltip harus menjelaskan bahwa biaya mencakup Material + Upah,
sedangkan luas menggunakan transaksi Upah. Jika luas = 0, tampilkan
`-`/`N/A`.

**Grafik 3 --- Penggunaan TK Sulam** - Sumber: `sulam`. - Rumus:
`SUM(resource_bahan_alat)` dengan `jenis = 'Upah'`. - Filter wilayah
AW01--AW07 dan bulan terpilih. - Satuan: resource TK tercatat.

**Grafik 4 --- Penggunaan Batang Sulam** - Sumber: `sulam`. - Rumus:
`SUM(resource_bahan_alat)` dengan `jenis = 'Material'`. - Filter wilayah
AW01--AW07 dan bulan terpilih. - Satuan: batang.

### 5.4 Bagian 3 --- Tabel detail seluruh lokasi

Menampilkan seluruh lokasi di AW01--AW07 untuk bulan yang dipilih pada
Bagian 2.

**Grain:** satu baris per kombinasi `wilayah + lokasi`; seluruh
transaksi dalam kombinasi tersebut digabungkan.

Kolom: 1. Wilayah 2. Lokasi 3. TK 4. Batang 5. HA 6. Batang/TK

Rumus:

  Kolom       Rumus
  ----------- ------------------------------------------------------
  TK          `SUM(resource_bahan_alat)` jika `jenis = 'Upah'`
  Batang      `SUM(resource_bahan_alat)` jika `jenis = 'Material'`
  HA          `SUM(hasil_efektif)` jika `jenis = 'Upah'`
  Batang/TK   Total Batang / Total TK

Ketentuan: - Filter bulan sama dengan Bagian 2. - Cakupan hanya
AW01--AW07. - Grouping wajib `wilayah + lokasi`, bukan lokasi saja. -
Tambahkan pencarian lokasi, sorting, dan pagination jika jumlah data
banyak. - Jika menampilkan total, rasio total dihitung dari total batang
dibagi total TK, bukan menjumlahkan rasio lokasi. - Jika TK = 0,
tampilkan `-`/`N/A`.

------------------------------------------------------------------------

## 6. Aturan Filter dan Interaksi

  -----------------------------------------------------------------------
  Filter                  Lokasi                  Dampak
  ----------------------- ----------------------- -----------------------
  Indikator               Antar PG, bagian atas   Hanya grafik
                                                  perbandingan PG

  PG                      Antar PG, tabel bawah   Hanya tabel summary

  Bulan                   Antar Wilayah, Bagian 2 Empat grafik Bagian 2
                                                  dan tabel Bagian 3

  Filter bulan Bagian 1   Tidak ada               Selalu 12 bulan
  -----------------------------------------------------------------------

Filter di satu sub-menu tidak boleh mengubah sub-menu lainnya.
Perpindahan sub-menu tidak boleh membawa state filter yang tidak
relevan.

Interaksi grafik: - Tooltip berisi kategori, periode, nilai, dan
satuan. - Legend dapat menyembunyikan/menampilkan seri jika library
chart mendukung. - Hover/highlight tidak mengubah data. - Grafik dan
tabel memakai definisi agregasi yang sama. - Jangan gunakan data dummy
di production.

------------------------------------------------------------------------

## 7. Sumber Data dan Kontrak Agregasi

### `summary_sulam`

Dipakai untuk: - Grafik indikator antar-PG per bulan. - Tabel summary
per PG per bulan. - Matriks penggunaan TK per wilayah per bulan. -
Matriks kapasitas Batang/TK per wilayah per bulan.

Field utama: `kode`, `pg`, `wilayah`, `year`, `month`, `material`,
`upah`, `batang`, `jumlah_tk`, `luas`.

### `sulam`

Dipakai untuk: - Cost per wilayah. - Cost/HA per wilayah. - Penggunaan
TK dan batang per wilayah. - Tabel detail lokasi.

Field utama: `tanggal_realisasi`, `wilayah`, `lokasi`, `jenis`,
`resource_bahan_alat`, `hasil_efektif`, `total_realisasi_biaya`, `pg`,
`year`, `month`.

### Ketentuan agregasi

-   Agregasikan nilai dasar terlebih dahulu, baru hitung rasio.
-   Jangan menjumlahkan rasio.
-   Jangan merata-ratakan rasio wilayah untuk menghasilkan rasio PG.
-   Cost/HA wilayah: pembilang Material + Upah, penyebut luas transaksi
    Upah.
-   Tabel lokasi: grouping `wilayah + lokasi`.
-   Reverse dipetakan ke jenis induknya dan tetap dihitung positif.
-   Filter tahun secara eksplisit agar data lintas tahun tidak
    tercampur.
-   Bedakan data kosong dari nilai nol jika sumber data memungkinkan.

------------------------------------------------------------------------

## 8. Format Angka

Gunakan locale Indonesia (`id-ID`): - Mata uang: `Rp 1.234.567` -
Desimal: `1.234,56` - Luas: `0,040 HA` - Bulan: Januari--Desember - PG:
PG1, PG2, PG3 - Wilayah: AW01--AW23

Jangan membulatkan nilai sebelum perhitungan rasio. Pembulatan hanya
untuk tampilan. Gunakan presisi yang sesuai data sumber.

------------------------------------------------------------------------

## 9. UI State dan Responsive

### Loading

-   Skeleton untuk grafik dan tabel.
-   Hindari layout shift besar.

### Empty

-   Pesan jelas jika periode/wilayah tidak memiliki data.
-   Jangan menyamakan data kosong dengan nilai nol aktual.

### Error

-   Pesan kegagalan mengambil data.
-   Sediakan aksi coba lagi.
-   Jangan tampilkan detail error database kepada pengguna akhir.

### Responsive

-   Desktop: layout sesuai susunan section dan grid.
-   Tablet: grid menyesuaikan lebar.
-   Mobile: filter full-width, grafik satu kolom, tabel horizontal
    scroll.
-   Sidebar mengikuti mekanisme responsive CAPEX.

------------------------------------------------------------------------

## 10. Performa dan Implementasi

-   Agregasi dilakukan di backend/database, bukan mengambil seluruh
    transaksi ke browser untuk dihitung di client.
-   Gunakan query `GROUP BY` untuk menghindari query berulang per
    wilayah.
-   Terapkan filter periode, PG, wilayah, dan jenis pada query.
-   Gunakan pagination untuk tabel detail jika diperlukan.
-   Pertimbangkan caching untuk agregasi yang jarang berubah dan
    invalidasi setelah upload/update.
-   Pastikan index relevan tersedia pada kolom filter dan relasi.
-   Gunakan satu utility/service rumus bersama agar grafik dan tabel
    tidak berbeda hasil.
-   Pertahankan tipe Decimal Prisma secara aman; konversi untuk
    visualisasi dilakukan pada batas yang terkontrol.
-   Jangan mengubah schema database hanya untuk kebutuhan presentasi.

------------------------------------------------------------------------

## 11. Acceptance Criteria

### Evaluasi Sulam Antar PG

-   [ ] Grafik menampilkan 12 bulan dan tiga seri PG1--PG3.
-   [ ] Main filter menyediakan enam indikator.
-   [ ] Main filter hanya mengubah grafik.
-   [ ] Filter PG hanya mengubah tabel summary.
-   [ ] Tabel summary selalu menampilkan 12 bulan.
-   [ ] Nilai dasar dan rasio sesuai rumus.
-   [ ] Rasio dihitung dari agregat, bukan rata-rata rasio.
-   [ ] Pembagian nol ditampilkan `-`/`N/A`.

### Evaluasi Sulam Antar Wilayah

-   [ ] Cakupan hanya AW01--AW07.
-   [ ] Bagian 1 selalu menampilkan Januari--Desember.
-   [ ] Grafik TK menggunakan `summary_sulam.jumlah_tk`.
-   [ ] Grafik kapasitas menggunakan
    `summary_sulam.batang / summary_sulam.jumlah_tk`.
-   [ ] Kedua grafik memiliki tabel matriks wilayah × bulan.
-   [ ] Filter bulan Bagian 2 mengubah empat grafik dan tabel Bagian 3
    saja.
-   [ ] Cost per wilayah menjumlahkan Material + Upah.
-   [ ] Cost/HA menggunakan biaya Material + Upah dibagi luas jenis
    Upah, dalam juta.
-   [ ] Grafik TK dan batang menggunakan kondisi jenis yang benar.
-   [ ] Tabel lokasi menggabungkan data berdasarkan `wilayah + lokasi`.
-   [ ] TK, Batang, HA, dan Batang/TK mengikuti rumus yang ditentukan.
-   [ ] Pembagian nol ditampilkan `-`/`N/A`.

### Desain dan kualitas

-   [ ] Warna, tipografi, komponen, dan layout konsisten dengan CAPEX.
-   [ ] Tooltip grafik menampilkan nilai dan satuan.
-   [ ] Format angka Indonesia.
-   [ ] Loading, empty, error state tersedia.
-   [ ] Responsive desktop, tablet, dan mobile.
-   [ ] Tidak ada data dummy pada production.

------------------------------------------------------------------------

## 12. Validasi Sebelum Production

1.  Pastikan luas transaksi Upah dan Material konsisten untuk satu
    kegiatan/lokasi.
2.  Pastikan resource Material dapat diperlakukan sebagai batang dan
    resource Upah sebagai TK untuk seluruh data.
3.  Pastikan transaksi Reverse disimpan positif dan tidak ada duplikasi.
4.  Pastikan jumlah TK merupakan total resource tercatat, bukan jumlah
    pekerja unik.
5.  Bedakan nilai kosong, nol, dan data yang belum diinput.
6.  Verifikasi hasil grafik dan tabel terhadap perhitungan Excel/sumber
    operasional.

## 13. Ringkasan Keputusan Final

  Area                    Keputusan
  ----------------------- ----------------------------------------------------------
  Navigasi                Dua sub-menu SULAM
  Desain                  Mengikuti dashboard CAPEX
  Font                    Plus Jakarta Sans
  Palet                   Putih, surface abu-biru, navy, biru, gold
  Antar PG                Grouped bar chart + tabel summary
  Main filter             Enam indikator; hanya mengubah grafik
  Filter PG               Hanya tabel summary
  Antar Wilayah           PG1, AW01--AW07
  Bagian 1                Dua grafik + dua tabel matriks, 12 bulan
  Bagian 2                Empat grafik dengan satu filter bulan
  Bagian 3                Tabel agregat per wilayah + lokasi
  Cost per Wilayah        Biaya Material + Upah
  Cost/HA                 Biaya Material + Upah dibagi luas jenis Upah, dalam juta
  Sumber Bagian 1         `summary_sulam`
  Sumber Bagian 2 dan 3   `sulam`
  Rasio                   Hitung dari agregat dasar
  Reverse                 Tetap dihitung positif
  Pembagian nol           `-` atau `N/A`

**Dokumen ini menjadi acuan implementasi frontend SULAM.** Implementasi
harus mengikuti struktur, cakupan filter, sumber data, dan rumus di atas
serta mempertahankan komponen dan design system dashboard CAPEX.
