-- CreateTable
CREATE TABLE "mastersheet" (
    "lokasi" TEXT NOT NULL,
    "wilayah" TEXT NOT NULL,
    "luas" DOUBLE PRECISION NOT NULL,
    "kode_bibit" TEXT NOT NULL,
    "jenis_bibit" TEXT NOT NULL,
    "kelas_bibit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mastersheet_pkey" PRIMARY KEY ("lokasi")
);

-- CreateTable
CREATE TABLE "sbt" (
    "kode_sbt" TEXT NOT NULL,
    "nilai_sbt" DOUBLE PRECISION NOT NULL,
    "status" TEXT,
    "pupuk" TEXT,
    "jenis" TEXT,
    "kelas" TEXT,
    "group_cost" TEXT,
    "umur" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sbt_pkey" PRIMARY KEY ("kode_sbt")
);

-- CreateTable
CREATE TABLE "lokasi" (
    "id_lokasi" SERIAL NOT NULL,
    "lokasi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '',
    "kode_sbt" TEXT NOT NULL,
    "umur" INTEGER NOT NULL,
    "group_cost" TEXT NOT NULL,
    "keterangan_group_cost" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,
    "pupuk" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lokasi_pkey" PRIMARY KEY ("id_lokasi")
);

-- CreateTable
CREATE TABLE "aktivitas" (
    "id_aktivitas" SERIAL NOT NULL,
    "lokasi" TEXT NOT NULL,
    "aktivitas" TEXT NOT NULL,
    "group_cost" TEXT NOT NULL,
    "keterangan_group_cost" TEXT,
    "biaya" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aktivitas_pkey" PRIMARY KEY ("id_aktivitas")
);

-- AddForeignKey
ALTER TABLE "lokasi" ADD CONSTRAINT "lokasi_lokasi_fkey" FOREIGN KEY ("lokasi") REFERENCES "mastersheet"("lokasi") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lokasi" ADD CONSTRAINT "lokasi_kode_sbt_fkey" FOREIGN KEY ("kode_sbt") REFERENCES "sbt"("kode_sbt") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas" ADD CONSTRAINT "aktivitas_lokasi_fkey" FOREIGN KEY ("lokasi") REFERENCES "mastersheet"("lokasi") ON DELETE CASCADE ON UPDATE CASCADE;
