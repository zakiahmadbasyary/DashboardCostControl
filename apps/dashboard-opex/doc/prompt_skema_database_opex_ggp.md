# Prompt Perancangan Skema Database OPEX GGP

## 1. Konteks Proyek

Saya sedang mengembangkan dashboard OPEX (*Operating Expenditure*) untuk GGP menggunakan Next.js, PostgreSQL, dan Prisma ORM.

Buatkan rancangan skema database berdasarkan kebutuhan berikut. Fokus pada struktur database, relasi antartabel, primary key, foreign key, tipe data, constraint, serta aturan pengolahan data.

**Jangan langsung membuat implementasi frontend atau coding dashboard.** Prioritaskan analisis dan rancangan database terlebih dahulu.

## 2. Tabel Database

Database terdiri dari lima tabel utama berikut.

### A. `mastersheet_costcenter`

Tabel master untuk menyimpan daftar Cost Center unik yang diambil dari kolom Summary pada file Excel sumber.

Kolom:
- `costcenter`: primary key, kode Cost Center unik.
- `deskripsi_costcenter`: deskripsi Cost Center.
- `isview`: boolean untuk menentukan apakah Cost Center ditampilkan pada dashboard.

Aturan:
- Data Cost Center diambil tanpa duplikasi.
- `costcenter` harus unik dan tidak boleh NULL.
- `isview` digunakan untuk mengatur visibilitas data pada dashboard, bukan untuk menghapus data sumber.

### B. `mastersheet_ce2`

Tabel master untuk menyimpan daftar Cost Element 2 (CE2) unik dari kolom Summary pada file Excel sumber.

Kolom:
- `ce2`: primary key, kode CE2 unik.
- `deskripsi_ce2`: deskripsi CE2.
- `isview`: boolean untuk menentukan apakah CE2 ditampilkan pada dashboard.

Aturan:
- Data CE2 diambil tanpa duplikasi.
- `ce2` harus unik dan tidak boleh NULL.
- `isview` hanya mengatur visibilitas pada dashboard.

### C. `data_actual`

Tabel untuk menyimpan data aktual atau realisasi biaya OPEX dari file Excel sumber.

Kolom yang diperlukan:
- `id_actual`: primary key.
- `kode`: kode gabungan periode, Cost Control, dan CE2.
- `costcenter`.
- `deskripsi_costcenter`.
- `cost_element`.
- `cost_description`.
- `IDR-Act`.
- `object_currency`.
- `USD-Act`.
- `notes`.
- `ce2`.
- `deskripsi_ce2`.
- `total_quantity`.
- `posted_unit_of_meas`.
- `document_number`.
- `document_date`.
- `posting_date`.
- `period`.
- `PG`.
- `grouping_departement`.
- `subgrup`.
- `grup_exp`.
- `jenis_biaya`.
- `ce_grup`.
- `grup_aktivitas`.
- `mapping_biaya`.

Aturan:
- Satu kode dapat muncul pada banyak baris transaksi Actual.
- Setiap transaksi tetap disimpan sebagai baris tersendiri.
- Kolom `period` dinormalisasi menjadi angka bulan 1–12 untuk keperluan pembentukan kode dan summary.
- Data transaksi tidak boleh dihapus hanya karena Cost Center atau CE2 memiliki `isview = false`.
- Tentukan tipe data yang sesuai untuk setiap kolom berdasarkan fungsinya.

### D. `data_budget`

Tabel untuk menyimpan data anggaran OPEX dari file Excel sumber.

Kolom:
- `id_budget`: primary key.
- `kode`: kode gabungan periode, Cost Control, dan CE2.
- `costcenter`.
- `deskripsi_costcenter`.
- `ce2`.
- `deskripsi_ce2`.
- `amount_idr`: nilai anggaran IDR.
- `amount_usd`: nilai anggaran USD.
- `month`: periode sumber dalam format tanggal bulan tahun.
- `BBP`.
- `group_exp`.

Aturan:
- Satu kode dapat muncul pada beberapa baris Budget.
- Kolom `month` pada sumber dikonversi menjadi angka bulan 1–12 untuk pembentukan kode dan agregasi.
- Nama tahun tidak dimasukkan ke dalam kode karena data tahunan akan di-replace setiap tahun.
- Nilai anggaran menggunakan tipe numerik yang sesuai untuk nominal uang, seperti `DECIMAL` atau `NUMERIC`, bukan floating-point.

### E. `summary`

Tabel untuk menyajikan ringkasan data Actual dan Budget berdasarkan kode unik.

Kolom:
- `kode`: primary key.
- `periode`: angka bulan 1–12.
- `costcenter`: foreign key ke `mastersheet_costcenter.costcenter`.
- `deskripsi_costcenter`.
- `cost_control`.
- `ce2`: foreign key ke `mastersheet_ce2.ce2`.
- `deskripsi_ce2`.
- `nilai_actual`.
- `nilai_budget`.

Aturan pembentukan kode:

`kode = periode + cost_control + ce2`

Contoh format ilustratif:
- Periode 1, Cost Control CC100, CE2 CE01 → `1CC100CE01`.
- Periode 2, Cost Control CC100, CE2 CE01 → `2CC100CE01`.

Simpan kode sebagai string, bukan angka, karena kode merupakan gabungan nilai angka dan teks.

Pastikan aturan penggabungan kode konsisten dan tidak menimbulkan benturan kode.

## 3. Relasi Antartabel

Rancang relasi berikut:

1. `mastersheet_costcenter` ke `summary`: one-to-many (1:N), melalui kolom `costcenter`.
2. `mastersheet_ce2` ke `summary`: one-to-many (1:N), melalui kolom `ce2`.
3. `mastersheet_costcenter` ke `data_actual`: one-to-many (1:N), melalui kolom `costcenter`.
4. `mastersheet_costcenter` ke `data_budget`: one-to-many (1:N), melalui kolom `costcenter`.
5. `mastersheet_ce2` ke `data_actual`: one-to-many (1:N), melalui kolom `ce2`.
6. `mastersheet_ce2` ke `data_budget`: one-to-many (1:N), melalui kolom `ce2`.

Evaluasi apakah kolom `kode` pada `data_actual` dan `data_budget` perlu menjadi foreign key fisik ke `summary.kode`, mengingat `summary` merupakan hasil agregasi dari kedua tabel tersebut.

Jika penggunaan foreign key tersebut menimbulkan masalah urutan impor data atau pembentukan kode baru, berikan rekomendasi desain yang lebih tepat tanpa mengubah kebutuhan bisnis.

## 4. Aturan Agregasi Summary

Tabel summary harus dibentuk berdasarkan seluruh kode unik yang ditemukan pada `data_actual` dan `data_budget`.

Proses yang wajib diterapkan:

1. Bentuk kode berdasarkan kombinasi periode, Cost Control, dan CE2.
2. Ambil seluruh kode unik dari kedua sumber.
3. Kelompokkan data Actual berdasarkan kode dan jumlahkan nilai `IDR-Act` untuk memperoleh `nilai_actual`.
4. Kelompokkan data Budget berdasarkan kode dan jumlahkan `amount_idr` untuk memperoleh `nilai_budget`.
5. Gabungkan hasil agregasi Actual dan Budget berdasarkan kode.
6. Pastikan setiap kode hanya menghasilkan satu baris di summary.
7. Kode yang hanya ditemukan di Actual atau hanya di Budget tetap harus masuk ke summary.
8. Hindari penggabungan langsung data transaksi Actual dan Budget sebelum agregasi karena dapat menggandakan nilai akibat perbedaan jumlah baris.
9. Pastikan `periode`, `cost_control`, `ce2`, `costcenter`, dan deskripsi yang disimpan pada summary konsisten dengan data sumber.

## 5. Aturan NULL dan Nilai Nol

Terapkan aturan berikut:

- Nilai yang tidak tersedia disimpan sebagai `NULL`.
- Nilai `NULL` ditampilkan sebagai tanda `-` pada dashboard.
- Nilai numerik `0` tetap ditampilkan sebagai `0`.
- Jangan otomatis mengubah `NULL` menjadi `0` saat membentuk summary.
- Jika seluruh nilai dalam satu kelompok tidak tersedia, hasil agregasi tetap `NULL`.
- Jika suatu kode tidak memiliki data Actual, `nilai_actual` menjadi `NULL`.
- Jika suatu kode tidak memiliki data Budget, `nilai_budget` menjadi `NULL`.

Bedakan dengan jelas antara data yang tidak tersedia dan data yang memang bernilai nol.

## 6. Pengelolaan Periode dan Pembaruan Tahunan

- Periode yang digunakan dalam kode dan summary adalah angka bulan 1–12.
- Data tahun sebelumnya akan di-replace dengan data tahun terbaru.
- Tahun tidak dimasukkan ke dalam kode.
- Tetapkan tipe data periode yang konsisten pada seluruh proses impor dan agregasi.
- Berikan rekomendasi mekanisme penggantian data tahunan yang aman, termasuk urutan impor, validasi, dan pembaruan summary.
- Pastikan proses pembaruan tidak menghasilkan duplikasi atau kehilangan data akibat kegagalan impor.

## 7. Tugas yang Harus Dihasilkan

Berdasarkan seluruh ketentuan di atas, buatkan hasil berikut:

1. Analisis struktur database dan kebutuhan bisnis OPEX.
2. Skema seluruh tabel beserta nama kolom, tipe data, primary key, foreign key, nullable, dan constraint.
3. ERD dalam format Mermaid.
4. Penjelasan relasi dan kardinalitas setiap tabel.
5. Rekomendasi apakah `summary` lebih tepat menjadi tabel fisik atau database view, disertai alasan.
6. Aturan pembentukan kode yang aman dan konsisten.
7. Contoh proses agregasi Actual dan Budget yang benar.
8. Strategi impor Excel dan pembaruan data tahunan.
9. Rekomendasi indeks PostgreSQL untuk mendukung query dashboard.
10. Jika menggunakan Prisma ORM, tampilkan rancangan `schema.prisma` yang sesuai dengan hasil analisis.

## 8. Batasan

- Jangan mengubah aturan bisnis yang sudah ditentukan.
- Jangan menambahkan tabel baru tanpa menjelaskan kebutuhan dan manfaatnya.
- Jika ada struktur yang berpotensi menimbulkan inkonsistensi, jelaskan dampak dan berikan solusi.
- Jangan mengasumsikan kolom yang tidak tersedia pada sumber Excel.
- Bedakan rekomendasi desain dari keputusan bisnis yang sudah ditetapkan.
- Jika terdapat informasi yang belum cukup jelas, identifikasi sebagai pertanyaan terbuka dan jelaskan pengaruhnya terhadap desain database.

Prioritas utama adalah menghasilkan skema database OPEX yang konsisten, dapat menangani data Actual dan Budget yang memiliki jumlah baris berbeda, serta mendukung agregasi berdasarkan kode unik tanpa menggandakan nilai.
