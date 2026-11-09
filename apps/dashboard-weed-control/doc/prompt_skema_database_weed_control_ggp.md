# Prompt Perancangan Skema Database Weed Control GGP

## Peran

Bertindak sebagai Senior Database Engineer yang berpengalaman dalam PostgreSQL, Prisma ORM, perancangan ERD, dan sistem import data Excel.

Buat rancangan skema database untuk aplikasi **Weed Control GGP** berdasarkan ketentuan dan struktur data di bawah ini. Fokus pekerjaan adalah perancangan database, relasi, constraint, serta kesiapan skema untuk proses import Excel. Jangan membuat asumsi bisnis yang tidak disebutkan.

## 1. Teknologi

- Database: PostgreSQL.
- ORM: Prisma.
- Primary key: `BIGSERIAL` pada PostgreSQL, disesuaikan dengan tipe `BigInt` Prisma.
- Waktu pencatatan: `TIMESTAMPTZ`.
- Tipe data biaya: `DECIMAL(18,2)`.
- Tipe data kuantitas/hasil: `DECIMAL(18,4)` kecuali disebutkan lain.
- Tanggal bisnis: `DATE`.

## 2. Ketentuan umum

1. Terdapat **5 tabel utama**: `mastersheet`, `cost_umur`, `data_timeline`, `data_material`, dan `data_aktivitas`.
2. Semua nilai bisnis diambil langsung dari Excel. **Jangan membuat perhitungan otomatis** untuk `total_cost`, `biaya`, `biaya_per_ha`, `kapasitas_per_tk`, `hasil`, atau nilai lainnya.
3. Sistem hanya boleh melakukan parsing, validasi, dan transformasi bentuk data (wide-to-long) yang dijelaskan pada bagian import.
4. Data yang berulang tetap disimpan. Khusus `data_aktivitas`, kolom `status`, `wilayah`, `luas`, dan `kelas` harus tetap tersedia meskipun juga ada di `mastersheet`.
5. Jangan membuat unique constraint pada kombinasi lokasi dan aktivitas/kode/tanggal transaksi. Baris transaksi yang berulang tetap diperbolehkan.
6. Gunakan nama `activity_group`, bukan `group`, karena `GROUP` merupakan keyword SQL.
7. Gunakan relasi foreign key yang jelas dan aturan penghapusan yang aman.
8. Tambahkan `created_at` dan `updated_at` pada setiap tabel.
9. Jangan menambahkan tabel utama lain di luar lima tabel tersebut. Tabel log import boleh diusulkan sebagai opsi terpisah, bukan bagian dari rancangan inti.

## 3. Sumber data dan rancangan tabel

### A. `mastersheet` — sumber: Data Lokasi Excel

Satu baris untuk setiap lokasi. Kolom `lokasi` harus unik.

| Kolom | Tipe PostgreSQL | Ketentuan |
|---|---|---|
| `lokasi` | VARCHAR(50) | Primary key, NOT NULL |
| `status` | VARCHAR(50) | Nullable |
| `wilayah` | VARCHAR(50) | Nullable |
| `luas` | DECIMAL(12,2) | Nullable |
| `jenis` | VARCHAR(50) | Nullable |
| `kelas` | VARCHAR(50) | Nullable |
| `mulai_rawat` | DATE | Nullable |
| `mulai_tanam` | DATE | Nullable |
| `forcing_standar` | DATE | Nullable |
| `real_forcing` | DATE | Nullable |
| `selesai_panen` | DATE | Nullable |
| `umur_forcing` | INTEGER | Nullable |
| `umur` | INTEGER | Nullable |
| `total_cost` | DECIMAL(18,2) | Nullable; ambil langsung dari Excel |
| `created_at` | TIMESTAMPTZ | Timestamp pencatatan |
| `updated_at` | TIMESTAMPTZ | Timestamp pembaruan |

### B. `cost_umur` — sumber: kolom Umur 1 sampai Umur 20 pada Data Lokasi Excel

Di Excel, biaya umur disajikan dalam kolom melebar. Ubah menjadi beberapa baris untuk setiap lokasi.

| Kolom | Tipe PostgreSQL | Ketentuan |
|---|---|---|
| `id` | BIGSERIAL | Primary key |
| `lokasi` | VARCHAR(50) | NOT NULL, FK ke `mastersheet.lokasi` (Primary Key) |
| `umur` | INTEGER | Nomor umur dari kolom Umur 1–20 |
| `cost` | DECIMAL(18,2) | Nilai biaya langsung dari Excel |
| `created_at` | TIMESTAMPTZ | Timestamp pencatatan |
| `updated_at` | TIMESTAMPTZ | Timestamp pembaruan |

Constraint:
- UNIQUE (`lokasi`, `umur`).
- Nilai sel kosong atau `-` tidak dibuat menjadi baris.
- Nilai angka `0` tetap disimpan.
- Jangan menjumlahkan biaya umur untuk mengisi atau mengoreksi `mastersheet.total_cost`.

### C. `data_timeline` — sumber: Data Timeline Excel

Setiap baris transaksi pada Excel menjadi satu baris timeline. Satu lokasi dapat memiliki banyak transaksi dan aktivitas yang sama dapat berulang.

| Kolom | Tipe PostgreSQL | Ketentuan |
|---|---|---|
| `id` | BIGSERIAL | Primary key |
| `lokasi` | VARCHAR(50) | NOT NULL, FK ke `mastersheet.lokasi` (Primary Key) |
| `awal_rawat` | DATE | Nullable |
| `aktivitas` | VARCHAR(255) | Nullable |
| `tanggal_realisasi` | DATE | Nullable |
| `umur` | INTEGER | Nullable; nilai negatif tetap diperbolehkan |
| `hasil` | DECIMAL(18,4) | Nullable |
| `uom` | VARCHAR(30) | Nullable |
| `tk` | DECIMAL(18,4) | Nullable |
| `kapasitas_per_tk` | DECIMAL(18,4) | Nullable; nilai langsung dari Excel |
| `total_cost` | DECIMAL(18,2) | Nullable; nilai langsung dari Excel |
| `upah` | DECIMAL(18,2) | Nullable |
| `charge` | DECIMAL(18,2) | Nullable |
| `material` | DECIMAL(18,2) | Nullable; total biaya material, bukan rincian kuantitas material |
| `created_at` | TIMESTAMPTZ | Timestamp pencatatan |
| `updated_at` | TIMESTAMPTZ | Timestamp pembaruan |

Constraint dan ketentuan:
- Jangan membuat UNIQUE berdasarkan `lokasi`, `aktivitas`, dan/atau `tanggal_realisasi`.
- Umur negatif seperti `-6` harus disimpan apa adanya.
- Jangan menghitung ulang `kapasitas_per_tk`, `total_cost`, atau nilai lain.

### D. `data_material` — sumber: kolom-kolom material pada Data Timeline Excel

Pada Data Timeline Excel, setelah kolom `Material` (yang berisi total biaya material), terdapat kolom-kolom nama material, misalnya Haloksifop, Ametryn, Indostick, Glyphosate, Bromacyl, Metalaxyl, Diuron, Bifenthrin, Kaolin, Quizalofop, Urea, ZA, Borax, Fosetyl, Biopestisida, Diazinon, Oksifluorfen, MgSO4, Kuproxat, K2SO4, dan Glufosinate.

Kolom-kolom tersebut berisi **kuantitas material**, bukan biaya masing-masing material. Simpan secara dinamis sebagai baris.

| Kolom | Tipe PostgreSQL | Ketentuan |
|---|---|---|
| `id` | BIGSERIAL | Primary key |
| `timeline_id` | BIGINT | NOT NULL, FK ke `data_timeline.id` |
| `nama_material` | VARCHAR(100) | NOT NULL |
| `quantity` | DECIMAL(18,4) | Nilai kuantitas dari Excel |
| `created_at` | TIMESTAMPTZ | Timestamp pencatatan |
| `updated_at` | TIMESTAMPTZ | Timestamp pembaruan |

Constraint dan ketentuan:
- UNIQUE (`timeline_id`, `nama_material`).
- Kolom material harus dibaca secara dinamis berdasarkan header Excel setelah kolom `Material`, agar material baru dapat ditangani tanpa migrasi database.
- Jika nilai material berupa angka lebih besar dari 0, simpan.
- Jika nilai material berupa angka `0`, **tetap simpan**.
- Jika nilai berupa tanda `-`, sel kosong, atau NULL, **jangan buat baris `data_material`**.
- Jika semua kolom material pada suatu transaksi berisi `-` atau kosong, transaksi tetap disimpan di `data_timeline`, tetapi tidak memiliki baris terkait di `data_material`.
- Jangan membuat kolom biaya per material. Total biaya material tetap berada pada `data_timeline.material`.

### E. `data_aktivitas` — sumber: Data Aktivitas Excel

Setiap baris transaksi Excel disimpan. Lokasi dan kode aktivitas dapat muncul berulang.

| Kolom | Tipe PostgreSQL | Ketentuan |
|---|---|---|
| `id` | BIGSERIAL | Primary key |
| `lokasi` | VARCHAR(50) | NOT NULL, FK ke `mastersheet.lokasi` (Primary Key) |
| `status` | VARCHAR(50) | Nullable; tetap disimpan |
| `wilayah` | VARCHAR(50) | Nullable; tetap disimpan |
| `luas` | DECIMAL(12,2) | Nullable; tetap disimpan |
| `kelas` | VARCHAR(50) | Nullable; tetap disimpan |
| `kode` | VARCHAR(50) | Nullable |
| `aktivitas` | VARCHAR(255) | Nullable |
| `biaya` | DECIMAL(18,2) | Nullable; nilai langsung dari Excel |
| `biaya_per_ha` | DECIMAL(18,2) | Nullable; nilai langsung dari Excel |
| `upah` | DECIMAL(18,2) | Nullable |
| `charge` | DECIMAL(18,2) | Nullable |
| `material` | DECIMAL(18,2) | Nullable |
| `bibit` | DECIMAL(18,2) | Nullable |
| `hasil` | DECIMAL(18,4) | Nullable |
| `uom` | VARCHAR(30) | Nullable |
| `activity_group` | VARCHAR(50) | Nullable |
| `created_at` | TIMESTAMPTZ | Timestamp pencatatan |
| `updated_at` | TIMESTAMPTZ | Timestamp pembaruan |

Constraint dan ketentuan:
- Jangan membuat UNIQUE pada `lokasi`, `kode`, `aktivitas`, atau kombinasi transaksi tersebut.
- Kolom `status`, `wilayah`, `luas`, dan `kelas` wajib tetap ada di tabel ini.
- Baris header yang berulang di dalam file Excel harus dilewati saat import.
- Jangan menghitung ulang biaya, biaya per hektare, hasil, atau nilai lainnya.

## 4. Relasi antar tabel

Buat relasi berikut:

1. `mastersheet.lokasi` (PRIMARY KEY) → `cost_umur.lokasi` (1:N).
2. `mastersheet.lokasi` (PRIMARY KEY) → `data_timeline.lokasi` (1:N).
3. `mastersheet.lokasi` (PRIMARY KEY) → `data_aktivitas.lokasi` (1:N).
4. `data_timeline.id` → `data_material.timeline_id` (1:N).

Pastikan tipe data kolom FK sama dengan tipe kolom yang direferensikan. Gunakan nama relasi Prisma yang jelas. Pertimbangkan `onDelete: Restrict` untuk relasi lokasi agar master lokasi tidak dapat dihapus ketika masih direferensikan. Untuk rincian material, `onDelete: Cascade` dapat digunakan agar detail material ikut terhapus ketika transaksi timeline dihapus.

## 5. Aturan import Excel dan Replace

Sediakan rancangan yang mendukung tiga card upload terpisah. Pengguna boleh memperbarui salah satu file tanpa mengunggah dua file lainnya.

### A. Upload Data Lokasi

Mengganti dua tabel:
- `mastersheet` (Primary Key: `lokasi`; tidak memiliki kolom `id` terpisah)
- `cost_umur`

Sebelum Replace:
- Validasi seluruh file.
- Pastikan `lokasi` tidak kosong dan tidak duplikat dalam file karena merupakan Primary Key.
- Pastikan tidak ada lokasi yang akan hilang dari mastersheet baru tetapi masih direferensikan oleh `data_timeline` atau `data_aktivitas`.
- Jika ada referensi yang akan terputus, tolak import dan tampilkan daftar lokasi bermasalah.
- Jangan menghapus atau mengubah data jika validasi gagal.

Jika validasi berhasil, lakukan penggantian kedua tabel dalam satu transaksi database.

### B. Upload Data Timeline

Mengganti dua tabel:
- `data_timeline`
- `data_material`

Urutan proses:
1. Validasi file dan semua referensi `lokasi` terhadap `mastersheet` yang saat ini tersimpan.
2. Transformasikan baris transaksi ke `data_timeline`.
3. Transformasikan kolom material dinamis ke `data_material`.
4. Dalam satu transaksi, hapus data `data_material` lama, kemudian `data_timeline` lama.
5. Masukkan `data_timeline` baru, lalu `data_material` baru menggunakan ID timeline yang benar.
6. Commit jika semua berhasil; rollback jika terjadi kesalahan.

### C. Upload Data Aktivitas

Mengganti satu tabel:
- `data_aktivitas`

Sebelum Replace:
- Validasi struktur dan isi file.
- Pastikan seluruh `lokasi` tersedia di `mastersheet` saat ini.
- Lewati baris header yang berulang.
- Jika validasi berhasil, hapus dan masukkan ulang `data_aktivitas` dalam satu transaksi.

### D. Tombol Replace Semua Data

Sediakan opsi tambahan untuk mengganti seluruh lima tabel dari ketiga file sekaligus.

Urutan:
1. Wajib menerima ketiga file.
2. Validasi ketiganya terlebih dahulu tanpa mengubah database.
3. Pastikan seluruh referensi lokasi pada Data Timeline dan Data Aktivitas terdapat pada Data Lokasi terbaru.
4. Transformasikan data umur dan material.
5. Mulai satu transaksi database.
6. Hapus data dengan urutan: `data_material`, `data_timeline`, `data_aktivitas`, `cost_umur`, `mastersheet`.
7. Masukkan data dengan urutan: `mastersheet`, `cost_umur`, `data_timeline`, `data_material`, `data_aktivitas`.
8. Commit hanya jika semua proses berhasil.
9. Jika ada error pada tahap penyimpanan, rollback seluruh transaksi agar data lama tetap utuh.

**Penting:** validasi dilakukan sebelum penghapusan. Semua operasi penghapusan dan penyimpanan dalam satu paket Replace harus berada dalam satu transaksi database, bukan transaksi terpisah per tabel.

## 6. Validasi dan parsing data

Rancang validasi tanpa mengubah nilai bisnis:
- Dukung angka Excel yang tersimpan sebagai numeric maupun string.
- Tangani format angka Indonesia, misalnya `12,14`, `1,20`, dan `32.430.176`.
- Tangani tanggal `DD/MM/YYYY` dan tanggal teks seperti `19 May 2025`.
- Bedakan angka `0`, tanda `-`, dan sel kosong.
- Untuk kolom numerik biasa, jangan mengubah nilai `0` menjadi NULL.
- Untuk `data_material`, simpan angka `0`, tetapi abaikan `-`, kosong, dan NULL.
- Pertahankan umur negatif.
- Lewati baris header berulang pada Data Aktivitas.
- Laporkan nama file, nomor baris, nama kolom, dan alasan jika data tidak valid.
- Jangan melakukan perhitungan atau koreksi nilai otomatis.

## 7. Output yang diminta

Buat hasil rancangan dengan urutan:

1. Penjelasan singkat arsitektur database.
2. ERD dalam Mermaid `erDiagram`.
3. Daftar tabel, kolom, tipe data, PK, FK, UNIQUE, dan nullable.
4. Prisma Schema lengkap untuk kelima model, termasuk relasi, `@map`/`@@map` bila diperlukan, `@default(now())`, dan `@updatedAt`.
5. SQL PostgreSQL DDL yang ekuivalen dengan Prisma Schema.
6. Penjelasan strategi index yang relevan, tanpa membuat unique constraint transaksi yang tidak diminta.
7. Penjelasan alur import Replace untuk masing-masing card dan Replace Semua Data.
8. Pseudocode transaksi dan rollback.
9. Daftar validasi dan contoh pesan error.
10. Asumsi yang masih perlu dikonfirmasi, jika ada.

## 8. Batasan penting

- Jangan menambah tabel bisnis di luar lima tabel utama.
- Jangan menghilangkan kolom yang sudah disepakati.
- Pada tabel `mastersheet`, gunakan `lokasi` sebagai Primary Key dan jangan menambahkan kolom `id`.
- Jangan mengubah keputusan bahwa data berulang tetap disimpan.
- Jangan menghitung nilai yang sudah tersedia di Excel.
- Jangan menyimpan tanda `-` sebagai angka atau teks pada kolom numerik.
- Jangan membuat baris `data_material` untuk nilai kosong atau `-`.
- Tetap buat baris `data_material` untuk nilai angka `0`.
- Jangan membuat unique constraint untuk transaksi `data_timeline` atau `data_aktivitas`.
- Jangan menjalankan perubahan database atau migration sebelum rancangan ditinjau dan disetujui.

**Mulailah dengan memeriksa konsistensi rancangan, lalu tampilkan hasil lengkap. Jika ada konflik teknis, jelaskan konflik dan berikan solusi yang tetap mempertahankan keputusan bisnis di atas.**
