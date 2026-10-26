# PRD Frontend Dashboard OPEX GGP

## 1. Tujuan

Membangun tampilan frontend Dashboard OPEX GGP dengan mengikuti desain dan pola UI yang sudah digunakan pada Dashboard WIP. Gunakan skema database OPEX yang dilampirkan sebagai referensi sumber data.

Stack proyek yang diasumsikan adalah Next.js, PostgreSQL, dan Prisma ORM. Fokus dokumen ini adalah kebutuhan frontend, interaksi pengguna, komponen visual, dan aturan pengambilan data.

**Instruksi untuk AI coding agent:**
- Analisis struktur proyek dan implementasi Dashboard WIP terlebih dahulu.
- Periksa komponen, sistem warna, tipografi, navbar, layout, chart, filter, tabel, serta pola responsif yang sudah tersedia.
- Gunakan kembali komponen yang sesuai agar desain konsisten dan menghindari duplikasi.
- Verifikasi nama model, field, dan endpoint berdasarkan kode serta skema database yang benar-benar ada.
- Jangan mengubah skema database atau membuat migration hanya demi menyesuaikan tampilan tanpa analisis dan persetujuan.
- Jika terdapat perbedaan antara dokumen kebutuhan dengan implementasi database, laporkan perbedaannya dan gunakan nama field aktual dari skema.
- Jangan menggunakan data dummy sebagai data produksi.

## 2. Acuan Database

Gunakan tabel dalam schema `opex`:
- `summary`: sumber utama ringkasan Actual, Budget, dan variance.
- `mastersheet_costcenter`: master Cost Center dan deskripsinya.
- `mastersheet_ce2`: master CE2 dan deskripsinya.
- `data_actual`: sumber transaksi Actual dan aktivitas melalui `notes`.

Field yang relevan berdasarkan dokumen skema:
- `summary.periode`, `summary.costcenter`, `summary.deskripsi_costcenter`, `summary.ce2`, `summary.deskripsi_ce2`, `summary.pg`, `summary.nilai_actual`, `summary.nilai_budget`, `summary.variance`.
- `mastersheet_ce2.ce2`, `mastersheet_ce2.deskripsi_ce2`, `mastersheet_ce2.isview`.
- `data_actual.period`, `data_actual.pg`, `data_actual.costcenter`, `data_actual.ce2`, `data_actual.notes`, `data_actual.idr_act`.

Catatan: skema mendefinisikan CE2 sebagai kode Cost Element yang digunakan pada summary. Untuk tampilan aktivitas, gunakan `data_actual.notes` sebagai label aktivitas dan `data_actual.idr_act` sebagai biaya. Pastikan query aktivitas ikut difilter dengan periode, PG1, Cost Center, dan CE2 terpilih agar tidak mencampur transaksi dari konteks lain.

**Penting mengenai Budget:** `data_budget` tidak memiliki kolom PG; Budget berlaku untuk semua PG. Pada tabel `summary`, nilai Budget dapat direferensikan pada baris tiap PG. Karena itu, gunakan `summary` sesuai filter PG untuk menampilkan Budget pada konteks PG1, tetapi jangan menjumlahkan Budget berulang lintas PG. Semua bagian dashboard yang membandingkan Actual dan Budget harus konsisten dengan aturan tersebut.

## 3. Tata Letak Halaman

Halaman memiliki empat bagian utama:
1. Main Filter
2. Summary Overhead PG1
3. Detail Cost Element
4. Trend Cost Element Antar PG

Gunakan tata letak, jarak antar elemen, card, border, shadow, ukuran judul, dan gaya navigasi yang konsisten dengan Dashboard WIP. Atur lebar dan tinggi komponen supaya tabel serta grafik tetap terbaca pada desktop maupun layar lebih kecil.

---

## 4. Main Filter

### Elemen
- Satu filter **Periode/Bulan**.
- Pilihan berasal dari nilai unik `summary.periode` yang tersedia.
- Tampilkan label bulan dalam Bahasa Indonesia (Januari–Desember), sedangkan nilai filter yang digunakan dalam query adalah angka 1–12.

### Interaksi
- Perubahan periode memperbarui:
  - Summary Overhead PG1;
  - daftar Cost Center pada Summary Overhead PG1;
  - Detail Cost Element berdasarkan pilihan Cost Center dan CE2 yang masih valid;
  - tabel Trend Cost Element Antar PG.
- Jika periode berubah dan Cost Center/CE2 yang terpilih tidak lagi tersedia, reset pilihan terkait secara aman dan tampilkan empty state sampai pengguna memilih data yang tersedia.
- Filter Cost Element khusus Trend Cost Element Antar PG tidak boleh mengubah pilihan atau hasil pada bagian lain.
- Tentukan periode awal berdasarkan pola Dashboard WIP atau periode terbaru yang memang tersedia di database; jangan mengasumsikan bahwa seluruh bulan memiliki data.

---

## 5. Summary Overhead PG1

### Sumber data
Gunakan tabel `summary` dengan filter `pg = 'PG1'` dan periode sesuai Main Filter.

Bagian ini terdiri dari dua tingkat: grafik ringkasan bulanan dan dua tabel Cost Center yang disusun berdampingan.

### 5.1 Card atas — Grafik Actual vs Budget per Bulan

Buat grafik batang berkelompok (*grouped bar chart*) untuk membandingkan Actual dan Budget per bulan.

#### Data dan tampilan
- Sumbu X: bulan 1–12.
- Seri batang: `nilai_actual` dan `nilai_budget`.
- Tampilkan variance per bulan sebagai label, tooltip, atau informasi tambahan yang tidak membuat grafik terlalu padat.
- Tampilkan total Actual, total Budget, dan total variance dalam ringkasan yang jelas pada card yang sama.
- Total dihitung berdasarkan data PG1 dan periode/tahun data yang tersedia.
- Total variance **tidak boleh dihitung dengan menjumlahkan persentase variance bulanan**. Hitung dari total Actual dan total Budget:
  `((total_actual - total_budget) / total_budget) * 100`
- Jika total Budget bernilai NULL atau 0, tampilkan variance total sebagai `-`.
- Jika nilai bulan tidak tersedia, bedakan nilai NULL dari nilai 0 dan tampilkan sesuai aturan UI.

#### Perilaku Main Filter
- Grafik selalu menampilkan semua bulan yang relevan (1–12 atau bulan yang tersedia).
- Saat pengguna memilih satu bulan pada Main Filter, bulan tersebut diberi highlight yang jelas.
- Highlight tidak boleh menyembunyikan batang atau bulan lainnya.
- Perubahan Main Filter juga memperbarui bagian Cost Center sesuai bulan yang dipilih.
- Jika sesuai dengan pola Dashboard WIP, klik batang bulan dapat menyelaraskan pilihan Main Filter ke bulan tersebut.

### 5.2 Bagian bawah — Dua Tabel Cost Center

Bagi area menjadi dua card/tabel berdampingan, dengan gaya yang konsisten dan responsif.

#### Kolom
- `costcenter`
- `deskripsi_costcenter`
- `actual`
- `budget`
- `variance`

#### Aturan data
- Ambil data dari `summary` untuk PG1 dan periode yang dipilih di Main Filter.
- Agregasikan per Cost Center dengan menjumlahkan nilai Actual dan Budget pada seluruh CE2 dalam Cost Center tersebut, dengan tetap menghindari duplikasi Budget.
- Hitung variance Cost Center dari nilai agregat:
  `((total_actual_costcenter - total_budget_costcenter) / total_budget_costcenter) * 100`
- Jangan menghitung variance Cost Center dengan menjumlahkan variance pada setiap CE2.
- Jika terdapat lebih banyak Cost Center daripada yang nyaman ditampilkan dalam satu tabel, bagi daftar secara seimbang ke tabel kiri dan kanan. Jangan membagi berdasarkan nilai secara acak atau menghilangkan baris.
- Tambahkan pencarian/pagination hanya jika sesuai dengan pola Dashboard WIP dan diperlukan untuk keterbacaan.
- Cost Center yang tidak memiliki nilai pada periode terpilih ditampilkan sesuai ketersediaan data dan aturan NULL pada skema.

#### Interaksi
- Setiap baris Cost Center dapat diklik.
- Cost Center yang dipilih diberi penanda visual.
- Klik Cost Center mengatur konteks bagian Detail Cost Element di bawahnya.
- Jangan mengubah filter CE2 pada bagian Trend Cost Element Antar PG ketika Cost Center dipilih.

---

## 6. Detail Cost Element

Bagian ini berisi dua card berdampingan: tabel Cost Element di kiri dan daftar aktivitas di kanan.

Bagian ini terhubung ke Main Filter dan Cost Center yang dipilih dari Summary Overhead PG1.

### 6.1 Card kiri — Tabel Cost Element

#### Sumber dan kolom
- Kode Cost Element: `ce2` dari master `mastersheet_ce2`.
- Deskripsi: `deskripsi_ce2`.
- Actual.
- Budget.
- Variance.

#### Aturan data
- Filter berdasarkan periode terpilih, `pg = 'PG1'`, dan Cost Center yang dipilih.
- Tampilkan Cost Element yang relevan dari data Summary. Gunakan `mastersheet_ce2.isview` untuk visibilitas jika pola dashboard lain juga menerapkan flag tersebut.
- Agregasikan Actual dan Budget untuk setiap CE2 pada Cost Center terpilih.
- Hitung variance per CE2 dari agregat Actual dan Budget, bukan dari penjumlahan persentase variance.
- Jika Cost Center belum dipilih, tampilkan empty state yang meminta pengguna memilih Cost Center.
- Jika tidak ada Cost Element yang cocok, tampilkan empty state yang informatif.

#### Interaksi
- Setiap baris CE2 dapat diklik dan diberi penanda visual ketika aktif.
- Klik CE2 memperbarui daftar aktivitas pada card kanan.
- Pilihan CE2 hanya berlaku untuk bagian Detail Cost Element dan tidak mengubah filter CE2 di bagian Trend Cost Element Antar PG.

### 6.2 Card kanan — Aktivitas Cost Element

#### Sumber data
Gunakan tabel `data_actual` dengan field:
- `notes` sebagai aktivitas;
- `idr_act` sebagai biaya.

#### Filter wajib
- `period` sama dengan Main Filter;
- `pg = 'PG1'`;
- `costcenter` sama dengan Cost Center yang dipilih;
- `ce2` sama dengan Cost Element yang dipilih.

#### Kolom tabel
- **Aktivitas** — dari `data_actual.notes`.
- **Biaya** — dari `data_actual.idr_act`.

#### Perilaku
- Tampilkan aktivitas dari transaksi yang sesuai konteks pilihan.
- Jangan menggabungkan aktivitas dari PG, bulan, Cost Center, atau CE2 lain.
- Jika beberapa transaksi memiliki `notes` yang sama, periksa pola bisnis yang diinginkan. Pengelompokan berdasarkan `notes` dengan penjumlahan `idr_act` dapat digunakan untuk tampilan ringkas, tetapi pertahankan konsistensi dengan kebutuhan bisnis.
- Tangani `notes` kosong dengan label yang sesuai, misalnya `Tanpa keterangan`, tanpa mengubah data sumber.
- Jika Cost Element belum dipilih, tampilkan instruksi untuk memilih Cost Element.
- Jika tidak ada aktivitas, tampilkan empty state.
- Gunakan format mata uang IDR yang konsisten.

---

## 7. Trend Cost Element Antar PG

Bagian ini membandingkan Actual antar-PG dan **tidak bergantung pada Cost Center atau CE2 yang dipilih pada bagian Detail Cost Element**.

Bagian ini memiliki filter CE2 khusus, grafik batang di card atas, dan tabel Cost Center antar-PG di card bawah.

### 7.1 Filter khusus Cost Element

- Sediakan filter CE2 menggunakan kode dan/atau deskripsi dari `mastersheet_ce2`.
- Pilihan dapat dibatasi pada CE2 dengan `isview = true` jika sesuai dengan kebijakan visibilitas dashboard.
- Filter CE2 ini hanya memengaruhi dua card pada bagian Trend Cost Element Antar PG.
- Perubahan Cost Center atau CE2 pada bagian Detail Cost Element tidak boleh mengubah filter ini.
- Perubahan Main Filter periode tetap memperbarui data bagian Trend Cost Element Antar PG.

### 7.2 Card atas — Grafik Actual per Bulan Antar PG

Buat grafik batang untuk membandingkan nilai Actual PG1, PG2, dan PG3 per bulan.

#### Data dan tampilan
- Sumber utama: tabel `summary`.
- Metrik: `nilai_actual` saja; jangan tampilkan Budget pada grafik ini.
- Sumbu X: bulan 1–12 atau seluruh bulan relevan yang tersedia.
- Seri: PG1, PG2, dan PG3.
- Filter berdasarkan CE2 khusus yang dipilih.
- Gunakan agregasi `SUM(nilai_actual)` per bulan dan PG untuk CE2 terpilih.
- Grafik mengikuti periode Main Filter untuk highlight bulan aktif, tetapi tetap menampilkan bulan lainnya.
- Jika CE2 terpilih memiliki beberapa Cost Center, agregasikan seluruh Cost Center untuk mendapatkan total Actual per PG dan bulan.
- Tangani nilai NULL tanpa otomatis mengubahnya menjadi angka nol jika makna datanya adalah tidak tersedia.

### 7.3 Card bawah — Dua Tabel Cost Center Antar-PG

Buat dua tabel/card yang disusun berdampingan dan menampilkan daftar Cost Center. Keduanya harus mencakup seluruh hasil, bukan membuang data jika jumlah baris banyak.

#### Kolom
- `costcenter`
- `PG1`
- `PG2`
- `PG3`

#### Aturan data
- Sumber: `summary`.
- Metrik: `nilai_actual` saja.
- Filter CE2 sesuai filter khusus pada bagian Trend Cost Element Antar PG.
- Filter periode menggunakan Main Filter.
- Agregasikan `nilai_actual` per Cost Center dan PG untuk CE2 yang dipilih.
- Pastikan nilai untuk PG1, PG2, dan PG3 berada pada baris Cost Center yang sama agar mudah dibandingkan.
- Jika Cost Center tidak memiliki Actual untuk suatu PG, tampilkan `-` bila nilainya tidak tersedia; jangan otomatis mengubahnya menjadi 0 kecuali aturan data menetapkan bahwa tidak ada transaksi berarti nol.
- Bagi seluruh daftar Cost Center ke tabel kiri dan kanan secara seimbang dan deterministik, atau gunakan pola pembagian tabel yang sudah dipakai Dashboard WIP.
- Tabel ini tidak menampilkan Budget atau variance.

---

## 8. Aturan Perhitungan dan Konsistensi Data

1. Gunakan `summary.nilai_actual`, `summary.nilai_budget`, dan `summary.variance` sebagai sumber dasar untuk bagian yang sesuai, tetapi hitung ulang variance pada tingkat agregasi tampilan jika nilai yang ditampilkan merupakan agregat beberapa baris.
2. Jangan menjumlahkan persentase variance. Hitung variance dari total Actual dan total Budget pada tingkat yang sedang ditampilkan.
3. Budget tidak memiliki PG pada sumbernya dan berlaku sama untuk semua PG. Jangan menjumlahkan salinan Budget dari beberapa PG.
4. Untuk seluruh bagian PG1, filter PG harus konsisten menggunakan nilai `PG1` sesuai nilai aktual di database.
5. Normalisasikan label bulan untuk tampilan, tetapi gunakan angka periode yang sesuai skema saat mengambil data.
6. Jangan mengasumsikan data untuk semua bulan, semua Cost Center, atau semua CE2 selalu tersedia.
7. Periksa kemungkinan `summary` berisi baris per `(periode, costcenter, ce2, pg)`. Jangan mengasumsikan satu baris per Cost Center saja.
8. Gunakan nilai IDR (`nilai_actual`, `nilai_budget`, `idr_act`) untuk semua visualisasi biaya yang dijelaskan dalam dokumen ini.
9. Pastikan pengelompokan dan query tidak menyebabkan duplikasi akibat join ke tabel master atau tabel transaksi.
10. Bila ada konflik antara nilai `variance` tersimpan dan hasil agregasi tampilan, gunakan hasil perhitungan berdasarkan agregat Actual dan Budget untuk agregat tersebut.

---

## 9. Status UI yang Wajib Ditangani

Untuk setiap grafik, tabel, dan filter:
- Loading state yang konsisten dengan Dashboard WIP.
- Empty state saat data tidak tersedia atau pilihan belum dibuat.
- Error state dengan pesan yang mudah dipahami.
- Penanganan nilai `NULL`.
- Format angka dan mata uang yang konsisten.
- Highlight pilihan aktif.
- Responsivitas pada layar kecil.
- Hindari layout bergeser berlebihan ketika data sedang dimuat.

## 10. Kriteria Penerimaan

- [ ] Desain visual mengikuti Dashboard WIP.
- [ ] Main Filter menggunakan periode bulan dari `summary.periode`.
- [ ] Main Filter memperbarui Summary Overhead PG1, detail sesuai konteks pilihan, dan Trend Antar PG.
- [ ] Grafik Summary Overhead PG1 menampilkan Actual dan Budget per bulan serta highlight bulan terpilih tanpa menyembunyikan bulan lain.
- [ ] Total Actual, total Budget, dan variance total dihitung dengan benar.
- [ ] Dua tabel Cost Center menampilkan Actual, Budget, dan variance untuk bulan terpilih.
- [ ] Klik Cost Center memperbarui tabel Cost Element.
- [ ] Klik CE2 memperbarui aktivitas di card kanan.
- [ ] Aktivitas mengambil `notes` dan `idr_act` dari `data_actual` dengan seluruh filter konteks yang tepat.
- [ ] Filter CE2 Trend Antar PG terisolasi dari pilihan Cost Center/CE2 pada Detail Cost Element.
- [ ] Grafik Trend Antar PG hanya menampilkan Actual per bulan untuk PG1, PG2, dan PG3.
- [ ] Tabel Trend Antar PG menampilkan Actual per Cost Center dengan kolom Cost Center, PG1, PG2, dan PG3.
- [ ] Nilai Budget tidak dijumlahkan berulang lintas PG.
- [ ] Variance agregat dihitung dari total Actual dan total Budget, bukan dari penjumlahan variance baris.
- [ ] Loading, empty, error, dan NULL state ditangani dengan baik.
- [ ] Tidak ada perubahan skema database tanpa analisis dan persetujuan.

## 11. Urutan Pengerjaan yang Diminta

1. Analisis struktur proyek dan desain Dashboard WIP.
2. Identifikasi komponen yang dapat digunakan kembali serta cara pengambilan data saat ini.
3. Petakan setiap bagian dashboard ke tabel dan field database.
4. Sampaikan ringkasan rencana implementasi dan setiap ketidaksesuaian yang ditemukan.
5. Setelah rencana jelas, implementasikan frontend dengan perubahan yang terfokus.
6. Jalankan lint, pemeriksaan tipe, build, atau tes yang sudah tersedia di proyek.
7. Laporkan file yang diubah, komponen yang digunakan kembali, cara kerja filter dan interaksi, hasil pemeriksaan, serta masalah yang masih tersisa.
