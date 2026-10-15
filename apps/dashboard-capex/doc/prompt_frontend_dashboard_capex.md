# Prompt AI Agent — Frontend Dashboard CAPEX

## Peran dan tujuan
Kamu bertindak sebagai **Senior Frontend Engineer dan UI/UX Engineer**. Lanjutkan pengembangan halaman frontend untuk **Dashboard Proyek CAPEX** pada repository yang sedang terbuka.

Tujuannya membuat dashboard CAPEX yang interaktif, terhubung ke database/API proyek, dan konsisten dengan dashboard **WIP, HPP, dan Harga Material** yang sudah ada.

## Instruksi kerja utama
1. **Analisis proyek sebelum mengubah kode.** Periksa struktur folder, framework, komponen UI, library grafik, style, navbar, pola filter, tabel, dan card di dashboard WIP, HPP, dan Harga Material.
2. Periksa halaman CAPEX saat ini, schema PostgreSQL/Prisma, tipe data, relasi, dan endpoint/API yang tersedia.
3. Sebelum implementasi, ringkas komponen yang dapat digunakan kembali dan file yang akan diubah.
4. **Jangan mengubah navbar** atau layout global yang tidak diperlukan.
5. Gunakan data backend jika tersedia. Jangan menyamarkan data dummy sebagai data nyata.
6. Hindari refactor besar atau mengubah halaman WIP, HPP, dan Harga Material. Jadikan halaman tersebut referensi visual.
7. **Jangan mengubah skema database atau menjalankan migration tanpa persetujuan eksplisit.**
8. Setelah selesai, laporkan file yang diubah, sumber data, interaksi yang dibuat, dan kekurangan yang ditemukan.

## 1. Gaya visual
Ikuti style yang benar-benar digunakan dashboard WIP, HPP, dan Harga Material: font, warna, spacing, radius, border, shadow, background, card, tabel, filter, dropdown, badge status, loading, empty state, error state, serta perilaku responsif. Gunakan kembali komponen dan library yang sudah ada. Jangan membuat design system baru jika tidak diperlukan.

## 2. Main Filter
Buat area Main Filter di atas halaman dengan tiga filter:
- **Kategori**: nilai unik dari `Total.kategori`.
- **Cost Center**: nilai unik dari `Total.cost_center`.
- **Status CAPEX**: nilai unik dari `Total.status_capex`.

Ketentuan:
- Filter dapat digunakan bersamaan dan memiliki opsi “Semua”.
- Filter memengaruhi seluruh area CAPEX, termasuk daftar CAPEX, detail, tracking, dan grafik/komponen CAPEX terkait.
- **Filter tidak boleh memengaruhi bagian User Approver**, baik tabel approver maupun daftar pending.
- Tangani `NULL`, string kosong, dan duplikasi secara konsisten.
- Ketika filter berubah, perbarui data CAPEX. Jika pilihan CAPEX aktif tidak lagi termasuk hasil filter, pilih baris pertama yang tersedia atau tampilkan empty state.
- Ambil opsi filter dari database, bukan hardcode, jika data backend tersedia.

## 3. Area CAPEX: dua card kiri dan kanan
Pada desktop, tampilkan dua card berdampingan. Pada layar kecil, susun secara responsif.

### 3.1 Card kiri — Tabel Daftar CAPEX
Tabel ini mengikuti Main Filter dan berisi:
1. **IO - WBS - MO**: tampilkan `WBS` jika terisi; jika tidak, tampilkan `MO` jika terisi; jika keduanya kosong, tampilkan `IO`; jika semuanya kosong, tampilkan `—`.
2. **Deskripsi**: `Total.description`.
3. **Status**: `Total.status_capex`.
4. **Price**: `Total.amount`.

Interaksi:
- Setiap baris dapat diklik.
- Berikan selected state yang konsisten dengan dashboard lain.
- Klik baris akan memperbarui seluruh informasi pada card kanan sesuai CAPEX terpilih.
- Format angka/mata uang harus konsisten dengan proyek; jangan mengubah nilai sumber atau menghitung ulang `amount`.
- Sediakan loading, error, dan empty state.
- Gunakan pagination atau pola pembatasan tabel yang sudah digunakan dashboard lain jika data besar.

### 3.2 Card kanan — Informasi CAPEX Terpilih
Konten mengikuti baris yang dipilih di tabel kiri dan terdiri dari dua bagian.

#### A. Detail CAPEX
Tampilkan:
- **IO - WBS - MO**: prioritas `WBS` → `MO` → `IO`.
- **Deskripsi**: `Total.description`.
- **No CAPEX**: `Total.capex_no`.
- **Unit Price**: `Total.amount / Total.quantity`.
- **Qty**: `Total.quantity`.
- **Total Price**: `Total.amount`.

Unit Price harus dihitung dengan aman. Jika quantity kosong, nol, atau tidak valid, tampilkan `—`; jangan tampilkan `Infinity`, `NaN`, atau error. Perhitungan ini hanya untuk tampilan dan tidak mengubah database.

#### B. Tracking CAPEX
Tampilkan dua tabel/subbagian.

**Tabel 1 — Informasi PR/PO/Purchasing**
- **Cost Center**: `Total.cost_center`.
- **No PR**: gunakan field nomor PR yang benar-benar ada di schema `Total`. Periksa apakah nama aktualnya `nomorPR`, `no_PR`, atau lainnya.
- **No PO**: ambil dari relasi PO yang benar, misalnya `PO.no_PO` jika sesuai schema.
- **Purchasing**: `Purchasing.description` melalui relasi yang benar dari PO berdasarkan `PGR`.

Jangan mengarang relasi. Periksa rantai `Total` → `PO` → `Purchasing`. Jika relasi tersebut belum tersedia atau tidak jelas, jelaskan kebutuhan backend/konfirmasi yang diperlukan.

**Tabel 2 — Tracking Approver**
- **Approver**: `Created.nama`.
- **Tanggal**: `Created.date_approve`.
- **Notes**: `Created.notes`.

Ketentuan:
- Tampilkan hanya data approval yang terkait dengan CAPEX terpilih.
- Gunakan relasi aktual pada schema, misalnya `id_total`, `capex_no`, atau relasi lain yang telah ditetapkan.
- Jika terdapat beberapa baris Created untuk CAPEX yang sama, jangan menghilangkan baris sumber secara diam-diam.
- Tampilkan tanggal dengan format yang konsisten; data tanpa tanggal tetap ditangani dengan jelas.
- Sediakan empty state bila tidak ada tracking.

## 4. Area User Approver
Buat bagian User Approver yang terdiri dari dua card. **Bagian ini sepenuhnya independen dari Main Filter.**

### 4.1 Card kiri — Daftar User Approver
Tabel berisi:
1. **Index**: `User Approver.kode_approver`.
2. **User Approver**: `User Approver.nama`.
3. **Pending**: `User Approver.pending` jika tersedia dan akurat, atau dihitung dari data Created yang belum disetujui.

Interaksi:
- Baris approver dapat diklik dan menampilkan selected state.
- Klik approver memperbarui daftar CAPEX pending pada card kanan.
- Jika pending dihitung, jelaskan definisinya. `Created.date_approve` kosong/NULL dapat dipakai sebagai indikator pending hanya jika sesuai aturan proses approval yang sebenarnya.
- Jangan menganggap nilai pending tersimpan selalu akurat tanpa memeriksa implementasi.

### 4.2 Card kanan — Daftar CAPEX Pending
Tampilkan CAPEX yang belum di-approve oleh approver terpilih dengan kolom:
1. **No CAPEX**: `Created.capex_no`.
2. **Deskripsi**: `Created.description`.
3. **Price**: `Created.amount`.
4. **IO - WBS - MO**: prioritas `WBS` → `MO` → `IO`, atau `—` jika semuanya kosong.

Ketentuan:
- Filter berdasarkan `Created.kode_approver` yang cocok dengan `User Approver.kode_approver`.
- Definisi pending harus sesuai proses approval aktual; gunakan `date_approve` kosong/NULL hanya jika itu memang indikator yang benar.
- **Jangan menerapkan Main Filter di sini.**
- Pilih approver pertama secara default jika tersedia atau tampilkan instruksi untuk memilih approver.
- Tampilkan empty state bila tidak ada pending.
- Jangan melakukan deduplikasi yang menghilangkan baris approval tanpa aturan bisnis yang jelas.

## 5. Sumber data dan backend
- Baca schema database dan kode API aktual terlebih dahulu.
- Pastikan nama tabel, kolom, relasi, dan tipe data cocok dengan implementasi aktual. Spesifikasi ini adalah kebutuhan bisnis, bukan izin untuk mengarang field.
- Gunakan endpoint yang tersedia jika sesuai. Jika endpoint belum tersedia, jelaskan endpoint/query yang dibutuhkan dan ikuti arsitektur proyek.
- Hindari mengambil seluruh data besar ke browser jika filtering/pagination bisa dilakukan di backend.
- Pastikan filter, tabel CAPEX, detail, tracking, dan pending konsisten.
- Jangan mengekspos kredensial atau akses database di client.
- Tangani error jaringan, data kosong, field nullable, dan data tidak lengkap.
- Jangan mengubah schema/migration tanpa persetujuan.

## 6. Aksesibilitas dan UX
- Beri label yang jelas pada filter dan dukung interaksi keyboard jika pola komponen memungkinkan.
- Status CAPEX harus dapat dibedakan melalui teks, bukan warna saja.
- Gunakan loading indicator, empty state, dan pesan error yang konsisten.
- Pastikan tabel tetap terbaca di layar kecil dan tidak merusak layout.
- Hindari perubahan global yang tidak diperlukan.

## 7. Kriteria penerimaan
- [ ] Visual konsisten dengan dashboard WIP, HPP, dan Harga Material.
- [ ] Navbar tidak berubah.
- [ ] Main Filter menggunakan data `Total.kategori`, `Total.cost_center`, dan `Total.status_capex`.
- [ ] Main Filter hanya memengaruhi area CAPEX, bukan User Approver.
- [ ] Tabel CAPEX menampilkan IO/WBS/MO dengan prioritas WBS → MO → IO.
- [ ] Klik CAPEX memperbarui detail dan tracking.
- [ ] Detail menampilkan No CAPEX, Unit Price, Qty, dan Total Price dengan aman.
- [ ] Tracking PR/PO/Purchasing memakai relasi yang benar.
- [ ] Tracking approver hanya menampilkan data Created terkait CAPEX terpilih.
- [ ] Tabel User Approver menampilkan kode, nama, dan pending.
- [ ] Klik approver memperbarui daftar CAPEX pending.
- [ ] Daftar pending hanya memuat pengajuan yang belum disetujui oleh approver terpilih.
- [ ] Loading, error, dan empty state tersedia.
- [ ] Tidak ada dummy yang disamarkan sebagai data nyata.
- [ ] Tidak ada perubahan schema atau navbar tanpa persetujuan.
- [ ] Jalankan build/lint/test yang tersedia dan laporkan hasil sebenarnya.

## 8. Laporan akhir
Setelah implementasi, laporkan:
1. File yang diperiksa dan diubah.
2. Komponen/style yang digunakan kembali dari dashboard WIP, HPP, dan Harga Material.
3. Cara kerja Main Filter dan pemilihan CAPEX.
4. Cara kerja pemilihan approver dan daftar pending.
5. Endpoint/query yang digunakan atau ditambahkan.
6. Asumsi dan kekurangan relasi/data yang ditemukan.
7. Hasil build/lint/test yang benar-benar dijalankan.
8. Hal yang masih perlu dikonfirmasi.

**Mulai dengan analisis schema dan kode aktual, lalu implementasikan halaman CAPEX secara terukur. Pertahankan navbar dan konsistensi visual proyek.**
