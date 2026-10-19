# Prompt Analisis dan Perancangan Skema Database Dashboard CAPEX

## Peran AI Agent

Kamu bertindak sebagai **Database Architect dan Business Analyst** yang berpengalaman dalam merancang database relasional untuk aplikasi dashboard CAPEX (Capital Expenditure).

Tugasmu adalah menganalisis kebutuhan dan merancang skema database berdasarkan spesifikasi di bawah ini. **Pada tahap ini jangan menulis kode aplikasi, migration, SQL, Prisma Schema, atau mengubah file proyek.** Hasilkan analisis dan rancangan terlebih dahulu untuk ditinjau pengguna.

## 1. Tujuan Sistem

Dashboard CAPEX digunakan untuk mengelola dan menyajikan data anggaran, pengajuan CAPEX, data purchasing/PO, proses approval, serta status CAPEX. Sistem menggabungkan data dari tabel `Budget` dan `Created` ke dalam tabel/entitas `Total` berdasarkan aturan bisnis.

Database harus mempertahankan data sumber dan tidak menghapus baris sumber hanya karena ada duplikasi atau karena satu baris dipilih sebagai representasi di `Total`.

## 2. Tabel yang Direncanakan

Rancang dan evaluasi tujuh tabel berikut. Nama tabel boleh disesuaikan dengan konvensi proyek, tetapi jelaskan jika ada perubahan nama.

### A. `Purchasing`

Menyimpan master grup purchasing.

- `PGR` — Primary Key.
- `description`
- `telephone`
- `fax_number`

### B. `Kategori`

Menyimpan informasi/master CAPEX.

- `capex_no` — Primary Key.
- `description`
- `cost_center`
- `kategori`
- `komoditi`

Periksa apakah `capex_no` benar-benar cocok menjadi primary key dan apakah semua nilai `Created.capex_no` selalu tersedia di tabel ini. Jangan mengasumsikan integritas referensial selalu terpenuhi tanpa validasi data.

### C. `PO`

Menyimpan data PR/PO sesuai sumber data.

- `nomorPR` — Primary Key sesuai keputusan sementara.
- `keterangan`
- `quantity`
- `unit_of_measure`
- `valuation_price`
- `total` — gunakan nilai dari sumber data; jangan menghitung ulang sebagai `quantity * valuation_price`.
- `request_date`
- `PGR` — kandidat Foreign Key ke `Purchasing.PGR`.
- `no_PO`

Catatan: `nomorPR` diperlakukan sebagai nomor unik berdasarkan keputusan sementara. Validasi apakah satu PR benar-benar hanya memiliki satu baris dan apakah satu PR dapat berhubungan dengan lebih dari satu CAPEX sebelum menetapkan relasi final ke `Total`.

### D. `Created`

Menyimpan data pengajuan/approval CAPEX. Setiap baris harus tetap memiliki identitas tersendiri; `capex_no` boleh berulang.

- `id_created` — Primary Key otomatis.
- `id_total` — kandidat Foreign Key ke `Total.id_total`; dapat nullable selama pemetaan belum dilakukan jika dibutuhkan.
- `capex_no`
- `type` — jenis seperti WBS, order, atau MO.
- `requestor`
- `req_date`
- `budget_type`
- `IO`
- `MO`
- `WBS`
- `cost_center`
- `quantity`
- `amount`
- `description`
- `kode_approver` — kandidat Foreign Key ke `User Approver.kode_approver`.
- `nama`
- `date_approve`
- `no_PR`
- `order_no`
- `notes`
- `budget_status` — nilai yang diperbolehkan: `in process`, `approved`, atau kosong/NULL.
- `kategori`
- `komoditi`

Jangan menghapus atau menggabungkan baris `Created` yang memiliki `capex_no` sama. Aturan pemilihan baris representatif untuk `Total` harus diterapkan terpisah dari data sumber.

### E. `User Approver`

Menyimpan master approver.

- `kode_approver` — Primary Key.
- `nama`
- `pending` — sebaiknya dihitung dari data pengajuan yang belum disetujui melalui query/view, bukan disimpan sebagai nilai statis, kecuali ada kebutuhan bisnis yang jelas.

### F. `Budget`

Menyimpan baris anggaran CAPEX.

- `id_budget` — Primary Key otomatis.
- `id_total` — kandidat Foreign Key ke `Total.id_total`.
- `IO`
- `MO`
- `WBS`
- `description`
- `cost_center`
- `quantity`
- `amount`
- `group_capex`
- `capex_no` — boleh kosong/NULL.
- `kategori`
- `komoditi`
- `budget_status` — hanya jika kolom ini memang ada pada sumber atau secara eksplisit diperlukan; nilainya `in process`, `approved`, atau kosong/NULL.

Setiap baris `Budget` dengan `capex_no` kosong harus tetap diperlakukan sebagai baris terpisah dan tidak boleh digabung hanya karena sama-sama NULL/kosong.

### G. `Total`

Merupakan entitas hasil rekonsiliasi/penggabungan logis data `Budget` dan `Created`, bukan pengganti data sumber.

- `id_total` — Primary Key otomatis.
- `nomorPR` — kandidat Foreign Key ke `PO.nomorPR`; harus unik dan nullable hanya jika relasi satu-ke-satu memang telah dikonfirmasi.
- `capex_no`
- `description`
- `budget_type`
- `budget_status`
- `req_date`
- `quantity`
- `amount`
- `cost_center`
- `IO`
- `MO`
- `WBS`
- `status_capex`
- `tahun`
- `komoditi`

Aturan prioritas nilai pada `Total`:
- `capex_no`: dari `Created`; jika tidak ada, kosong.
- `description`: dari `Created` jika tersedia; jika tidak, dari `Budget`.
- `budget_type`: dari `Created`; jika tidak ada, kosong.
- `budget_status`: dari Created atau sumber yang sudah disepakati; jangan menetapkan sumbernya tanpa menjelaskan asumsi.
- `req_date`: dari `Created`; jika tidak ada, kosong.
- `quantity`: dari `Created`; jika tidak ada, dari `Budget`.
- `amount`: dari `Budget` (yang bernilai > 0); jika tidak ada atau bernilai 0/NULL di `Budget`, ambil dari `Created` (yang bernilai > 0). **Syarat penting:** Baris dari `Budget` maupun `Created` hanya dimasukkan ke tabel `Total` jika memiliki nominal `amount > 0`. Jika nilai akhirnya bernilai 0, <= 0, atau kosong (NULL), maka data ini **tidak dimasukkan** ke dalam tabel `Total`.
- `cost_center`: dari `Created`; jika tidak ada, dari `Budget`.
- `IO`, `MO`, `WBS`: dari `Created`; jika tidak ada, dari `Budget`.
- `nomorPR`: berasal dari pemetaan ke `PO`.
- `status_capex`: ditentukan oleh aturan bisnis pada bagian status.
- `tahun`: diturunkan dari `req_date`; jika `req_date` kosong, gunakan tahun berjalan sesuai keputusan bisnis saat data diproses. Pertimbangkan apakah menyimpan tahun hasil turunan diperlukan.
- `komoditi`: dari `Created`; jika tidak ada, dari `Budget`.

## 3. Aturan Bisnis `budget_status`

Nilai yang diperbolehkan:

- `in process`
- `approved`
- kosong/NULL

Nilai harus konsisten di tabel mana pun kolom `budget_status` disimpan. Jangan membuat nilai status baru tanpa persetujuan pengguna.

## 4. Aturan Bisnis `status_capex`

Nilai status CAPEX:

1. `Belum Created`
2. `Sudah Created`
3. `Final Approve`
4. `Sudah PO`
5. `Sudah Close`

Aturan yang sudah dijelaskan:

- **Belum Created**: `capex_no` belum tersedia di `Total` dan `budget_status` kosong.
- **Sudah Created**: `capex_no` sudah tersedia di `Total` dan `budget_status = 'in process'`.
- **Final Approve**: `budget_status = 'approved'`.
- **Sudah PO**: `nomorPR` sudah terisi, dengan syarat `IO` terisi dan `WBS` serta `MO` keduanya kosong.
- Jika `WBS` terisi, `MO` terisi, atau keduanya terisi, status **tidak boleh** menjadi `Sudah PO`, sekalipun `nomorPR` terisi.
- **Sudah Close**: status ditetapkan secara manual oleh admin melalui fitur edit/tutup CAPEX.

Usulan prioritas yang perlu dikonfirmasi:
1. `Sudah Close` manual harus tetap berlaku dan tidak tertimpa kalkulasi otomatis.
2. `Sudah PO` hanya jika seluruh syaratnya terpenuhi.
3. `Final Approve` jika `budget_status = 'approved'`.
4. `Sudah Created` jika `capex_no` ada dan `budget_status = 'in process'`.
5. `Belum Created` jika `capex_no` tidak ada dan `budget_status` kosong.

Jangan menganggap kondisi lain otomatis memiliki status tertentu. Identifikasi kondisi yang belum didefinisikan, misalnya:
- `capex_no` tersedia tetapi `budget_status` kosong.
- `capex_no` kosong tetapi `budget_status = 'in process'`.
- `budget_status = 'approved'` sementara syarat `Sudah PO` juga terpenuhi.
- `nomorPR` tersedia tetapi `WBS` atau `MO` terisi.
- Data status tidak konsisten antara `Budget`, `Created`, dan `Total`.

Minta konfirmasi untuk kondisi ambigu alih-alih mengarang aturan. Status `Sudah Close` sebaiknya didukung atribut audit seperti `closed_at`, `closed_by`, atau penanda penutupan eksplisit, atau desain setara yang mencegah perhitungan otomatis menimpa status manual.

## 5. Aturan Rekonsiliasi `Budget`, `Created`, dan `Total`

- Jika `capex_no` yang sama ada di `Budget` dan `Created`, gabungkan secara logis ke satu kelompok `Total` sesuai aturan pemilihan baris representatif.
- Jika `Created` mempunyai beberapa baris dengan `capex_no` sama, pertahankan semuanya di `Created`; hanya satu baris representatif yang dipakai untuk membentuk nilai `Total` jika itulah aturan bisnis yang disetujui.
- Jika `Budget.capex_no` kosong/NULL, setiap baris Budget harus menghasilkan baris/kelompok Total tersendiri.
- Jika `Created.capex_no` tidak ditemukan pada Budget, data Created tetap harus bisa muncul di Total.
- Jangan pernah memakai nilai NULL/kosong sebagai kunci untuk menggabungkan baris.
- Tentukan cara menghubungkan satu atau beberapa baris Budget/Created ke `Total`. Evaluasi apakah FK `id_total` di kedua tabel cukup atau apakah tabel penghubung diperlukan untuk menjaga asosiasi banyak-ke-banyak dan menghindari perubahan data sumber.
- Jangan mengasumsikan ada satu baris Budget per `capex_no` sebelum data diperiksa.
- Karena `Total` berisi nilai gabungan, jelaskan apakah sebaiknya berupa tabel fisik, view, atau materialized view, dengan mempertimbangkan kebutuhan admin mengubah status menjadi `Sudah Close`.

## 6. Relasi Kandidat

Relasi yang perlu dianalisis:

- `Purchasing (1) -> (N) PO` melalui `PO.PGR`.
- `PO <-> Total` direncanakan 1:1 opsional melalui `Total.nomorPR`, dengan syarat nomor PR benar-benar unik di kedua sisi yang relevan.
- `Total (1) -> (N) Budget` melalui `Budget.id_total`.
- `Total (1) -> (N) Created` melalui `Created.id_total`.
- `Kategori (1) -> (N) Created` melalui `Created.capex_no`, hanya jika integritas data mendukungnya.
- `User Approver (1) -> (N) Created` melalui `Created.kode_approver`.

Validasi setiap relasi terhadap aturan bisnis dan data sumber. Tandai hubungan yang belum pasti sebagai kandidat, bukan keputusan final.

## 7. Ekspektasi Desain Teknis

Evaluasi dan rekomendasikan:

- Tipe data SQL yang sesuai untuk setiap kolom, terutama angka, tanggal, ID, kode, dan nominal uang.
- PK, FK, unique constraint, index, dan aturan NULL.
- Penamaan tabel/kolom yang konsisten. Pertimbangkan nama kolom `IO`, `MO`, `WBS`, `PGR`, dan `nomorPR` serta potensi kebutuhan normalisasi.
- Strategi import/ETL dari Excel tanpa kehilangan nilai sumber.
- Strategi menjaga data sumber, menangani duplikasi, dan memperbarui data `Total`.
- Apakah `pending` dan `tahun` perlu disimpan atau dihitung.
- Audit trail perubahan manual status `Sudah Close`.
- Risiko duplikasi dan inkonsistensi status.
- Pertimbangan implementasi PostgreSQL dan Prisma bila relevan, tetapi jangan menulis schema/migration pada tahap analisis ini.

## 8. Format Hasil yang Wajib Diberikan AI Agent

Susun hasil analisis dalam bahasa Indonesia dengan bagian:

1. Ringkasan rancangan.
2. Daftar tabel beserta kolom, PK, FK, tipe data yang direkomendasikan, dan nullable.
3. ERD dalam Mermaid `erDiagram`.
4. Kardinalitas relasi dan penjelasannya.
5. Aturan rekonsiliasi Budget–Created–Total dalam bentuk langkah/pseudocode.
6. Matriks keputusan status `status_capex`, termasuk kondisi ambigu yang perlu konfirmasi.
7. Rekomendasi untuk status manual `Sudah Close`.
8. Risiko desain, asumsi, dan pertanyaan yang perlu dijawab pengguna.
9. Rekomendasi tahap implementasi berikutnya.

## 9. Batasan Tahap Ini

- **Jangan coding dahulu.**
- Jangan membuat atau mengubah file aplikasi.
- Jangan membuat SQL, migration, atau Prisma Schema final.
- Jangan menganggap semua asumsi sudah pasti.
- Pisahkan fakta yang sudah dikonfirmasi, rekomendasi teknis, dan pertanyaan terbuka.
- Jika menemukan konflik atau ketidakjelasan pada kebutuhan, tampilkan secara eksplisit dan minta konfirmasi pengguna sebelum melanjutkan ke implementasi.

Tujuan akhir tahap ini adalah memperoleh rancangan database CAPEX yang konsisten dengan data Excel dan aturan bisnis sebelum mulai coding.
