-- =========================================================================
-- DDL PostgreSQL: Weed Control GGP (Schema: weed_control)
-- Berdasarkan dokumen rancangan: doc/prompt_skema_database_weed_control_ggp.md
-- =========================================================================

-- 0. Buat skema jika belum ada
CREATE SCHEMA IF NOT EXISTS weed_control;

-- 1. Tabel: mastersheet (Satu baris per lokasi unik)
CREATE TABLE IF NOT EXISTS weed_control.mastersheet (
    lokasi VARCHAR(50) PRIMARY KEY,
    status VARCHAR(50),
    wilayah VARCHAR(50),
    luas DECIMAL(12,2),
    jenis VARCHAR(50),
    kelas VARCHAR(50),
    mulai_rawat DATE,
    mulai_tanam DATE,
    forcing_standar DATE,
    real_forcing DATE,
    selesai_panen DATE,
    umur_forcing INTEGER,
    umur INTEGER,
    total_cost DECIMAL(18,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mastersheet_wilayah_status 
    ON weed_control.mastersheet(wilayah, status);

-- 2. Tabel: cost_umur (Wide-to-Long dari kolom Umur 1-20 Data Lokasi)
CREATE TABLE IF NOT EXISTS weed_control.cost_umur (
    id BIGSERIAL PRIMARY KEY,
    lokasi VARCHAR(50) NOT NULL REFERENCES weed_control.mastersheet(lokasi) ON DELETE RESTRICT ON UPDATE CASCADE,
    umur INTEGER NOT NULL,
    cost DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cost_umur_lokasi_umur UNIQUE (lokasi, umur)
);

CREATE INDEX IF NOT EXISTS idx_cost_umur_umur 
    ON weed_control.cost_umur(umur);

-- 3. Tabel: data_timeline (Setiap baris transaksi timeline per lokasi)
CREATE TABLE IF NOT EXISTS weed_control.data_timeline (
    id BIGSERIAL PRIMARY KEY,
    lokasi VARCHAR(50) NOT NULL REFERENCES weed_control.mastersheet(lokasi) ON DELETE RESTRICT ON UPDATE CASCADE,
    awal_rawat DATE,
    aktivitas VARCHAR(255),
    tanggal_realisasi DATE,
    umur INTEGER, -- Mendukung umur negatif (misal -6)
    hasil DECIMAL(18,4),
    uom VARCHAR(30),
    tk DECIMAL(18,4),
    kapasitas_per_tk DECIMAL(18,4),
    total_cost DECIMAL(18,2),
    upah DECIMAL(18,2),
    charge DECIMAL(18,2),
    material DECIMAL(18,2), -- Total biaya material
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_timeline_lokasi 
    ON weed_control.data_timeline(lokasi);
CREATE INDEX IF NOT EXISTS idx_data_timeline_tanggal 
    ON weed_control.data_timeline(tanggal_realisasi);
CREATE INDEX IF NOT EXISTS idx_data_timeline_aktivitas 
    ON weed_control.data_timeline(aktivitas);
CREATE INDEX IF NOT EXISTS idx_data_timeline_umur 
    ON weed_control.data_timeline(umur);

-- 4. Tabel: data_material (Rincian kuantitas kolom-kolom material dinamis)
CREATE TABLE IF NOT EXISTS weed_control.data_material (
    id BIGSERIAL PRIMARY KEY,
    timeline_id BIGINT NOT NULL REFERENCES weed_control.data_timeline(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nama_material VARCHAR(100) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL, -- Kuantitas material
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_data_material_timeline_material UNIQUE (timeline_id, nama_material)
);

CREATE INDEX IF NOT EXISTS idx_data_material_nama 
    ON weed_control.data_material(nama_material);

-- 5. Tabel: data_aktivitas (Setiap baris transaksi aktivitas dengan denormalisasi)
CREATE TABLE IF NOT EXISTS weed_control.data_aktivitas (
    id BIGSERIAL PRIMARY KEY,
    lokasi VARCHAR(50) NOT NULL REFERENCES weed_control.mastersheet(lokasi) ON DELETE RESTRICT ON UPDATE CASCADE,
    status VARCHAR(50),
    wilayah VARCHAR(50),
    luas DECIMAL(12,2),
    kelas VARCHAR(50),
    kode VARCHAR(50),
    aktivitas VARCHAR(255),
    biaya DECIMAL(18,2),
    biaya_per_ha DECIMAL(18,2),
    upah DECIMAL(18,2),
    charge DECIMAL(18,2),
    material DECIMAL(18,2),
    bibit DECIMAL(18,2),
    hasil DECIMAL(18,4),
    uom VARCHAR(30),
    activity_group VARCHAR(50), -- Menggunakan activity_group untuk menghindari reserved keyword
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_aktivitas_lokasi 
    ON weed_control.data_aktivitas(lokasi);
CREATE INDEX IF NOT EXISTS idx_data_aktivitas_wilayah_status 
    ON weed_control.data_aktivitas(wilayah, status);
CREATE INDEX IF NOT EXISTS idx_data_aktivitas_group_kode 
    ON weed_control.data_aktivitas(activity_group, kode);

