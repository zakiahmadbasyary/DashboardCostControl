# Rencana Perbaikan Performa Dashboard HPP

## 1. Latar Belakang

Berdasarkan hasil inspeksi kode pada aplikasi `apps/dashboard-hpp` (Next.js, Prisma, dan PostgreSQL), ditemukan beberapa area yang berpotensi menyebabkan proses pemuatan dan interaksi Dashboard HPP menjadi lambat. Temuan utama berkaitan dengan pengambilan data dalam jumlah besar, pemrosesan data di browser, indeks database, dan query agregasi yang tidak seluruhnya digunakan oleh frontend.

Dokumen ini menjadi rencana implementasi perbaikan performa secara bertahap. Analisis awal bersifat **read-only code inspection**; dampak dan durasi aktual tetap perlu diverifikasi melalui pengujian di lingkungan aplikasi.

## 2. Temuan Utama

1. **Pengambilan data tanpa filter atau pagination di sisi server**  
   Endpoint `GET /api/hpp/lokasi` dilaporkan mengambil sekitar 50.000 baris dari `lokasiHPP`, termasuk relasi `masterSheet` dan `budgetItem`, tanpa filter awal.

2. **Pemrosesan berat di browser**  
   Frontend melakukan filtering, pengurutan, agregasi tren 12 bulan/YTD, dan agregasi per wilayah pada array besar melalui beberapa `useMemo`.

3. **Indeks database belum didefinisikan pada kolom filter utama**  
   Pada `schema.prisma`, laporan inspeksi tidak menemukan deklarasi indeks untuk kolom seperti `periode`, `status`, `group`, dan `lokasi` pada model terkait.

4. **Query agregasi yang hasilnya tidak digunakan**  
   Endpoint `/api/hpp/summary` menjalankan beberapa query agregasi, sementara frontend dilaporkan hanya menggunakan data `budgets` dari respons tersebut.

5. **Pengambilan kolom relasi berlebihan**  
   Penggunaan `include` tanpa proyeksi kolom yang spesifik dapat mengirimkan data yang tidak diperlukan oleh UI.

6. **Belum ada strategi caching yang jelas**  
   Laporan inspeksi tidak menemukan mekanisme caching khusus pada route terkait.

7. **Mode development dan keterbatasan resource VPS perlu diverifikasi**  
   Laporan menyebut kemungkinan aplikasi berjalan dengan `next dev` dan berbagi resource VPS dengan aplikasi lain. Ini masih berupa hipotesis yang perlu diperiksa.

## 3. Tujuan Perbaikan

- Mengurangi ukuran data yang dikirim dari backend ke browser.
- Mempercepat pemuatan awal dashboard dan perubahan filter.
- Mengurangi pekerjaan komputasi pada main thread browser.
- Membuat query database lebih efisien untuk pola akses yang sering digunakan.
- Menghindari query atau pengambilan kolom yang tidak diperlukan.
- Menjaga agar hasil perhitungan HPP tetap konsisten dengan logika bisnis yang berlaku.
- Mengukur dampak perbaikan menggunakan metrik sebelum dan sesudah perubahan.

## 4. Urutan Implementasi

### Tahap 0 — Ambil baseline dan siapkan pengujian

Sebelum mengubah kode:

- Buka dashboard melalui Chrome DevTools → **Network**.
- Catat ukuran `Size/Transferred` dan durasi request `GET /api/hpp/lokasi`.
- Gunakan tab **Performance** untuk mengamati long task saat halaman dimuat atau filter diubah.
- Catat penggunaan CPU dan RAM VPS saat pengujian, misalnya menggunakan `htop` atau `docker stats` jika aplikasi berjalan di Docker.
- Jalankan pengujian pada kondisi yang sama sebelum dan sesudah perubahan.

**Catatan:** Ambang seperti payload lebih dari 3 MB, transfer lebih dari 1,5 detik, atau long task lebih dari 100 ms dapat digunakan sebagai indikator investigasi awal, bukan sebagai hasil pengukuran yang sudah terbukti.

### Tahap 1 — Tambahkan indeks database yang sesuai

**Lokasi:** `schema.prisma`

Tinjau query yang benar-benar digunakan, lalu pertimbangkan indeks untuk kolom filter dan relasi, misalnya:

- `LokasiHPP`: kombinasi `periode` dan `status`, serta `lokasi` dan/atau `group` sesuai pola query.
- `AktivitasHPP`: `lokasi` dan/atau `group` sesuai pola query.

Contoh deklarasi yang perlu disesuaikan dengan nama model dan kolom sebenarnya:

```prisma
model LokasiHPP {
  // kolom dan relasi yang sudah ada

  @@index([periode, status])
  @@index([lokasi])
  @@index([group])
}

model AktivitasHPP {
  // kolom dan relasi yang sudah ada

  @@index([lokasi])
  @@index([group])
}
```

**Langkah aman:**

1. Pastikan nama model dan kolom sesuai dengan `schema.prisma` yang aktual.
2. Periksa indeks yang sudah ada agar tidak membuat indeks duplikat.
3. Buat migration Prisma di lingkungan pengembangan atau staging terlebih dahulu.
4. Uji query dan validasi hasil dashboard setelah migration.
5. Terapkan ke production hanya setelah backup dan rencana rollback disiapkan.

Indeks dapat mempercepat query tertentu, tetapi dampaknya bergantung pada query, distribusi data, dan rencana eksekusi PostgreSQL. Indeks juga menambah biaya saat insert atau update.

### Tahap 2 — Terapkan filter di backend

**Lokasi:** `app/api/hpp/lokasi/route.ts` dan pemanggilan API di `page.tsx`.

- Tambahkan parameter query untuk periode yang dipilih.
- Validasi parameter di server sebelum digunakan dalam query Prisma.
- Terapkan kondisi `where` di database, bukan mengambil semua data lalu memfilter semuanya di browser.
- Tentukan perilaku untuk pilihan “semua periode” jika memang diperlukan.
- Pastikan grafik tren 12 bulan tetap mendapatkan data lengkap melalui endpoint agregasi terpisah jika dibutuhkan.

Laporan awal memperkirakan filter periode dapat mengurangi data dari sekitar 50.000 menjadi sekitar 4.000 baris untuk contoh periode tertentu. Angka tersebut merupakan estimasi dan harus diverifikasi terhadap data aktual.

### Tahap 3 — Pindahkan agregasi ke backend

Pertimbangkan endpoint khusus, misalnya:

- `/api/hpp/trend` untuk tren bulanan dan YTD.
- `/api/hpp/wilayah` untuk ringkasan per wilayah.

Gunakan agregasi Prisma (`groupBy` jika sesuai) atau SQL yang terukur untuk menghitung nilai seperti total biaya, kuantitas panen, dan luas panen.

**Penting:** Pertahankan rumus dan aturan bisnis yang sudah berlaku, termasuk pembobotan rata-rata, filter status, taksasi, dan definisi periode. Bandingkan hasil perhitungan backend dengan hasil lama menggunakan dataset yang sama sebelum mengganti implementasi frontend.

### Tahap 4 — Sederhanakan endpoint summary

Periksa `GET /api/hpp/summary` dan `page.tsx`.

- Identifikasi properti respons yang benar-benar digunakan.
- Hapus query agregasi yang tidak diperlukan oleh UI, atau pisahkan pengambilan data budget ke endpoint yang lebih sesuai.
- Pastikan tidak ada komponen lain yang masih bergantung pada metrik yang akan dihapus.

### Tahap 5 — Batasi kolom yang diambil

Ganti pengambilan relasi yang terlalu luas dengan `select` kolom yang benar-benar dibutuhkan oleh tampilan, misalnya kolom lokasi, wilayah, jenis bibit, biaya, kuantitas panen, luas panen, status, periode, dan group—setelah nama kolom diverifikasi pada schema aktual.

Tujuannya mengurangi ukuran respons dan pekerjaan serialisasi/deserialisasi tanpa menghilangkan data yang diperlukan UI.

### Tahap 6 — Terapkan caching bila sesuai

Caching dapat diterapkan pada data agregasi atau data yang jarang berubah.

- Tentukan data mana yang aman untuk di-cache.
- Tetapkan masa berlaku atau mekanisme invalidasi yang jelas.
- Setelah admin mengunggah atau memperbarui data, invalidasi cache terkait agar dashboard tidak menampilkan data lama.
- Hindari caching respons yang berisi data berbeda antar pengguna tanpa strategi pemisahan cache yang benar.

Caching merupakan tahap lanjutan setelah alur data dan agregasi diperbaiki.

### Tahap 7 — Verifikasi konfigurasi deployment

Periksa apakah aplikasi production dijalankan menggunakan build production (`next build` lalu `next start` atau mekanisme deployment production yang sesuai), bukan server development. Verifikasi konfigurasi aktual terlebih dahulu; laporan awal hanya mengidentifikasi kemungkinan penggunaan `next dev`.

Pantau penggunaan CPU, RAM, dan I/O VPS karena beberapa aplikasi berbagi resource yang sama.

## 5. Pengujian dan Kriteria Penerimaan

Lakukan perbandingan sebelum dan sesudah untuk:

- Durasi request `/api/hpp/lokasi`.
- Ukuran payload respons.
- Waktu sampai dashboard siap digunakan.
- Respons saat filter periode, status, taksasi, group, atau wilayah diubah.
- Durasi query database dan rencana eksekusi PostgreSQL.
- Penggunaan CPU dan RAM server.
- Konsistensi angka HPP, tren bulanan, YTD, wilayah, dan detail lokasi.

### Checklist pengujian

- [ ] Dashboard berhasil dimuat tanpa error.
- [ ] Filter menghasilkan data sesuai pilihan.
- [ ] Grafik tren 12 bulan dan YTD tetap benar.
- [ ] Agregasi per wilayah tetap konsisten.
- [ ] Detail lokasi dan aktivitas tetap dapat dibuka.
- [ ] Hasil perhitungan baru cocok dengan hasil lama pada dataset pembanding.
- [ ] Tidak ada query atau kolom penting yang terhapus tanpa pemeriksaan dependensi.
- [ ] Tidak ada kebocoran data akibat caching.
- [ ] Hasil pengukuran sebelum dan sesudah terdokumentasi.

## 6. Risiko dan Pengendalian

| Risiko | Pengendalian |
|---|---|
| Angka dashboard berubah setelah agregasi dipindahkan | Bandingkan hasil dengan dataset yang sama dan validasi rumus bisnis |
| Migration berdampak pada database production | Backup, staging, tinjau migration, dan siapkan rollback |
| Grafik tren tidak lengkap setelah filter periode | Pisahkan endpoint data periode dan agregasi tahunan bila diperlukan |
| Cache menampilkan data lama | Terapkan invalidasi setelah upload atau pembaruan data |
| Indeks tidak meningkatkan query tertentu | Periksa `EXPLAIN ANALYZE` dan pola query aktual |
| Perubahan endpoint memengaruhi komponen lain | Cari seluruh pemanggil endpoint dan lakukan regresi |

## 7. Prioritas Rekomendasi

1. **Prioritas 0:** Ukur baseline dan tambahkan filter periode server-side.
2. **Prioritas 1:** Tambahkan indeks yang didukung pola query dan hasil pemeriksaan execution plan.
3. **Prioritas 2:** Pindahkan agregasi grafik dan wilayah ke backend serta sederhanakan endpoint summary.
4. **Prioritas 3:** Batasi kolom dengan `select` dan tambahkan caching terkontrol.
5. **Prioritas 4:** Verifikasi konfigurasi production dan pantau resource VPS.

Urutan ini perlu disesuaikan berdasarkan hasil pengukuran awal. Jangan menganggap peningkatan performa sudah tercapai sebelum pengujian sebelum-sesudah dilakukan.

## 8. Informasi yang Masih Perlu Dikumpulkan

Laporan inspeksi kode belum mengukur secara langsung:

- Ukuran payload dan durasi aktual di Chrome DevTools.
- Durasi query dan execution plan pada database yang digunakan.
- Penggunaan CPU/RAM VPS ketika dashboard diakses.
- Indeks fisik yang sudah ada di database.
- Frekuensi pembaruan data HPP.

Data tersebut dibutuhkan untuk memastikan prioritas optimasi dan mengukur hasil akhirnya.

## 9. Referensi File yang Perlu Ditinjau

- `apps/dashboard-hpp/app/api/hpp/lokasi/route.ts`
- `apps/dashboard-hpp/app/api/hpp/summary/route.ts`
- `apps/dashboard-hpp/app/api/hpp/aktivitas/route.ts`
- `apps/dashboard-hpp/app/page.tsx`
- File `schema.prisma` pada proyek Dashboard HPP
- Konfigurasi deployment dan environment yang relevan

---

**Status dokumen:** Rencana perbaikan berdasarkan inspeksi kode. Belum menunjukkan bahwa perubahan telah diterapkan atau performa telah meningkat.
