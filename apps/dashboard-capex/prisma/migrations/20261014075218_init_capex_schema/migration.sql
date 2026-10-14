-- CreateEnum
CREATE TYPE "budget_status" AS ENUM ('in process', 'approved');

-- CreateEnum
CREATE TYPE "status_capex" AS ENUM ('Belum Created', 'Sudah Created', 'Final Approve', 'Sudah PO', 'Sudah Close');

-- CreateTable
CREATE TABLE "purchasing" (
    "pgr" TEXT NOT NULL,
    "description" TEXT,
    "telephone" TEXT,
    "fax_number" TEXT,

    CONSTRAINT "purchasing_pkey" PRIMARY KEY ("pgr")
);

-- CreateTable
CREATE TABLE "kategori" (
    "capex_no" TEXT NOT NULL,
    "description" TEXT,
    "cost_center" TEXT,
    "kategori" TEXT,
    "komoditi" TEXT,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("capex_no")
);

-- CreateTable
CREATE TABLE "user_approver" (
    "kode_approver" TEXT NOT NULL,
    "nama" TEXT,

    CONSTRAINT "user_approver_pkey" PRIMARY KEY ("kode_approver")
);

-- CreateTable
CREATE TABLE "po" (
    "nomor_pr" TEXT NOT NULL,
    "keterangan" TEXT,
    "quantity" DECIMAL(15,4),
    "unit_of_measure" TEXT,
    "valuation_price" DECIMAL(18,2),
    "total" DECIMAL(18,2),
    "request_date" DATE,
    "pgr" TEXT,
    "no_po" TEXT,

    CONSTRAINT "po_pkey" PRIMARY KEY ("nomor_pr")
);

-- CreateTable
CREATE TABLE "budget" (
    "id_budget" BIGSERIAL NOT NULL,
    "id_total" BIGINT,
    "io" TEXT,
    "mo" TEXT,
    "wbs" TEXT,
    "description" TEXT,
    "cost_center" TEXT,
    "quantity" DECIMAL(15,4),
    "amount" DECIMAL(18,2),
    "group_capex" TEXT,
    "capex_no" TEXT,
    "kategori" TEXT,
    "komoditi" TEXT,
    "budget_status" "budget_status",

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id_budget")
);

-- CreateTable
CREATE TABLE "created" (
    "id_created" BIGSERIAL NOT NULL,
    "id_total" BIGINT,
    "capex_no" TEXT,
    "type" TEXT,
    "requestor" TEXT,
    "req_date" DATE,
    "budget_type" TEXT,
    "io" TEXT,
    "mo" TEXT,
    "wbs" TEXT,
    "cost_center" TEXT,
    "quantity" DECIMAL(15,4),
    "amount" DECIMAL(18,2),
    "description" TEXT,
    "kode_approver" TEXT,
    "nama" TEXT,
    "date_approve" DATE,
    "no_pr" TEXT,
    "order_no" TEXT,
    "notes" TEXT,
    "budget_status" "budget_status",
    "kategori" TEXT,
    "komoditi" TEXT,

    CONSTRAINT "created_pkey" PRIMARY KEY ("id_created")
);

-- CreateTable
CREATE TABLE "total" (
    "id_total" BIGSERIAL NOT NULL,
    "nomor_pr" TEXT,
    "capex_no" TEXT,
    "description" TEXT,
    "budget_type" TEXT,
    "budget_status" "budget_status",
    "req_date" DATE,
    "quantity" DECIMAL(15,4),
    "amount" DECIMAL(18,2),
    "cost_center" TEXT,
    "io" TEXT,
    "mo" TEXT,
    "wbs" TEXT,
    "status_capex" "status_capex",
    "tahun" SMALLINT,
    "komoditi" TEXT,
    "is_manually_closed" BOOLEAN NOT NULL DEFAULT false,
    "closed_at" TIMESTAMP(3),
    "closed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "total_pkey" PRIMARY KEY ("id_total")
);

-- CreateIndex
CREATE UNIQUE INDEX "total_nomor_pr_key" ON "total"("nomor_pr");

-- AddForeignKey
ALTER TABLE "po" ADD CONSTRAINT "po_pgr_fkey" FOREIGN KEY ("pgr") REFERENCES "purchasing"("pgr") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_id_total_fkey" FOREIGN KEY ("id_total") REFERENCES "total"("id_total") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "created" ADD CONSTRAINT "created_id_total_fkey" FOREIGN KEY ("id_total") REFERENCES "total"("id_total") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "created" ADD CONSTRAINT "created_kode_approver_fkey" FOREIGN KEY ("kode_approver") REFERENCES "user_approver"("kode_approver") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "created" ADD CONSTRAINT "created_capex_no_fkey" FOREIGN KEY ("capex_no") REFERENCES "kategori"("capex_no") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "total" ADD CONSTRAINT "total_nomor_pr_fkey" FOREIGN KEY ("nomor_pr") REFERENCES "po"("nomor_pr") ON DELETE SET NULL ON UPDATE CASCADE;
