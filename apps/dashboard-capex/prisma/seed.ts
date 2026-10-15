import { PrismaClient, BudgetStatus, StatusCapex } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database CAPEX...");

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.created.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.total.deleteMany();
  await prisma.po.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.userApprover.deleteMany();
  await prisma.purchasing.deleteMany();

  // 2. Master Purchasing (PGR)
  const purchasingData = [
    { pgr: "P01", description: "Purchasing Divisi Infrastruktur & Sipil", telephone: "021-5550101", faxNumber: "021-5550102" },
    { pgr: "P02", description: "Purchasing Divisi Mesin & Alat Berat", telephone: "021-5550201", faxNumber: "021-5550202" },
    { pgr: "P03", description: "Purchasing Divisi IT & Telekomunikasi", telephone: "021-5550301", faxNumber: "021-5550302" },
    { pgr: "P04", description: "Purchasing Perlengkapan Umum & Pertanian", telephone: "021-5550401", faxNumber: "021-5550402" },
  ];
  for (const item of purchasingData) {
    await prisma.purchasing.create({ data: item });
  }

  // 3. Master User Approver
  const approversData = [
    { kodeApprover: "APP-MGR-01", nama: "Budi Santoso (Dept Head Civil)" },
    { kodeApprover: "APP-MGR-02", nama: "Hendro Wijaya (Engineering Manager)" },
    { kodeApprover: "APP-DIR-01", nama: "Siti Rahmawati (Operations Director)" },
    { kodeApprover: "APP-CFO-01", nama: "Agus Pratama (Chief Financial Officer)" },
  ];
  for (const item of approversData) {
    await prisma.userApprover.create({ data: item });
  }

  // 4. Master Kategori CAPEX
  const kategoriData = [
    { capexNo: "CAP-2025-001", description: "Pembangunan Gudang Penyimpanan TBS – Blok A3", costCenter: "CC-PG1-INF", kategori: "Infrastruktur", komoditi: "Bangunan" },
    { capexNo: "CAP-2025-002", description: "Pengadaan Excavator Komatsu PC200-8", costCenter: "CC-MEKA", kategori: "Alat Berat", komoditi: "Alat Berat" },
    { capexNo: "CAP-2025-003", description: "Pemasangan Sistem Irigasi Sprinkler Otomatis Blok D1-D4", costCenter: "CC-IRG", kategori: "Irigasi", komoditi: "Irigasi" },
    { capexNo: "CAP-2025-004", description: "Upgrade Server & Jaringan Fiber Optic Kantor Pusat", costCenter: "CC-IT", kategori: "Teknologi Informasi", komoditi: "IT & Network" },
    { capexNo: "CAP-2025-005", description: "Pembangunan Rumah Karyawan Afdeling F – 20 Unit", costCenter: "CC-HRD", kategori: "Fasilitas Karyawan", komoditi: "Bangunan" },
    { capexNo: "CAP-2025-006", description: "Pengadaan Mesin Pengemasan Pupuk Otomatis – Unit Pupuk", costCenter: "CC-PUPUK", kategori: "Peralatan Pabrik", komoditi: "Mesin & Peralatan" },
  ];
  for (const item of kategoriData) {
    await prisma.kategori.create({ data: item });
  }

  // 5. PO Data
  const poData = [
    {
      nomorPr: "PR-2025-001",
      keterangan: "Pengadaan Material Sipil & Jasa Konstruksi Gudang TBS",
      quantity: 1,
      unitOfMeasure: "LOT",
      valuationPrice: 3500000000,
      total: 3500000000,
      requestDate: new Date("2025-01-10"),
      pgr: "P01",
      noPo: "PO-4500018901",
    },
    {
      nomorPr: "PR-2025-002",
      keterangan: "1 Unit Excavator Komatsu PC200-8 Baru",
      quantity: 1,
      unitOfMeasure: "UNIT",
      valuationPrice: 2800000000,
      total: 2800000000,
      requestDate: new Date("2025-01-15"),
      pgr: "P02",
      noPo: "PO-4500018925",
    },
    {
      nomorPr: "PR-2025-006",
      keterangan: "2 Unit Mesin Pengemasan Pupuk",
      quantity: 2,
      unitOfMeasure: "UNIT",
      valuationPrice: 460000000,
      total: 920000000,
      requestDate: new Date("2025-03-10"),
      pgr: "P02",
      noPo: "PO-4500019010",
    },
  ];
  for (const item of poData) {
    await prisma.po.create({ data: item });
  }

  // 6. Total (Reconciliation) Data
  // Conditions matching status_capex rules:
  // - Sudah Close: is_manually_closed = true
  // - Sudah PO: nomor_pr != null && io != null && wbs == null && mo == null
  // - Final Approve: budget_status = 'approved'
  // - Sudah Created: capex_no != null && budget_status = 'in process'
  // - Belum Created: capex_no == null && budget_status == null
  const totalItems = [
    {
      nomorPr: "PR-2025-001",
      capexNo: "CAP-2025-001",
      description: "Pembangunan Gudang Penyimpanan TBS – Blok A3",
      budgetType: "INVESTASI",
      budgetStatus: BudgetStatus.approved,
      reqDate: new Date("2025-01-10"),
      quantity: 1,
      amount: 3500000000,
      costCenter: "CC-PG1-INF",
      io: "IO-2025-001",
      mo: null,
      wbs: null,
      statusCapex: StatusCapex.Sudah_PO,
      tahun: 2025,
      komoditi: "Bangunan",
      isManuallyClose: false,
    },
    {
      nomorPr: "PR-2025-002",
      capexNo: "CAP-2025-002",
      description: "Pengadaan Excavator Komatsu PC200-8",
      budgetType: "INVESTASI",
      budgetStatus: BudgetStatus.approved,
      reqDate: new Date("2025-01-15"),
      quantity: 1,
      amount: 2800000000,
      costCenter: "CC-MEKA",
      io: "IO-2025-002",
      mo: null,
      wbs: null,
      statusCapex: StatusCapex.Sudah_Close,
      tahun: 2025,
      komoditi: "Alat Berat",
      isManuallyClose: true,
      closedAt: new Date("2025-06-30"),
      closedBy: "Admin CAPEX (Zaki)",
    },
    {
      nomorPr: null,
      capexNo: "CAP-2025-003",
      description: "Pemasangan Sistem Irigasi Sprinkler Otomatis Blok D1-D4",
      budgetType: "INVESTASI",
      budgetStatus: BudgetStatus.approved,
      reqDate: new Date("2025-02-01"),
      quantity: 4,
      amount: 1950000000,
      costCenter: "CC-IRG",
      io: null,
      mo: null,
      wbs: "WBS-2025-003",
      statusCapex: StatusCapex.Final_Approve,
      tahun: 2025,
      komoditi: "Irigasi",
      isManuallyClose: false,
    },
    {
      nomorPr: null,
      capexNo: "CAP-2025-004",
      description: "Upgrade Server & Jaringan Fiber Optic Kantor Pusat",
      budgetType: "INVESTASI",
      budgetStatus: BudgetStatus.in_process,
      reqDate: new Date("2025-02-15"),
      quantity: 1,
      amount: 1200000000,
      costCenter: "CC-IT",
      io: null,
      mo: null,
      wbs: "WBS-2025-004",
      statusCapex: StatusCapex.Sudah_Created,
      tahun: 2025,
      komoditi: "IT & Network",
      isManuallyClose: false,
    },
    {
      nomorPr: null,
      capexNo: "CAP-2025-005",
      description: "Pembangunan Rumah Karyawan Afdeling F – 20 Unit",
      budgetType: "INVESTASI",
      budgetStatus: BudgetStatus.in_process,
      reqDate: new Date("2025-03-01"),
      quantity: 20,
      amount: 4200000000,
      costCenter: "CC-HRD",
      io: null,
      mo: "MO-2025-005",
      wbs: null,
      statusCapex: StatusCapex.Sudah_Created,
      tahun: 2025,
      komoditi: "Bangunan",
      isManuallyClose: false,
    },
    {
      nomorPr: "PR-2025-006",
      capexNo: "CAP-2025-006",
      description: "Pengadaan Mesin Pengemasan Pupuk Otomatis – Unit Pupuk",
      budgetType: "INVESTASI",
      budgetStatus: BudgetStatus.approved,
      reqDate: new Date("2025-03-10"),
      quantity: 2,
      amount: 920000000,
      costCenter: "CC-PUPUK",
      io: "IO-2025-006",
      mo: null,
      wbs: null,
      statusCapex: StatusCapex.Sudah_PO,
      tahun: 2025,
      komoditi: "Mesin & Peralatan",
      isManuallyClose: false,
    },
    {
      nomorPr: null,
      capexNo: null,
      description: "Pengadaan Drone Survey Pemetaan Lahan Perkebunan",
      budgetType: "INVESTASI",
      budgetStatus: null,
      reqDate: null,
      quantity: 3,
      amount: 480000000,
      costCenter: "CC-SURVEY",
      io: null,
      mo: null,
      wbs: null,
      statusCapex: StatusCapex.Belum_Created,
      tahun: 2025,
      komoditi: "Peralatan Survey",
      isManuallyClose: false,
    },
    {
      nomorPr: null,
      capexNo: null,
      description: "Pengadaan Truk Angkut TBS 10-Ton – 3 Unit",
      budgetType: "PENGGANTIAN",
      budgetStatus: null,
      reqDate: null,
      quantity: 3,
      amount: 1650000000,
      costCenter: "CC-ARMADA",
      io: null,
      mo: null,
      wbs: null,
      statusCapex: StatusCapex.Belum_Created,
      tahun: 2025,
      komoditi: "Kendaraan",
      isManuallyClose: false,
    },
  ];

  const createdTotalRecords = [];
  for (const item of totalItems) {
    const record = await prisma.total.create({ data: item });
    createdTotalRecords.push(record);
  }

  // 7. Budget Records (linked to Total)
  for (const rec of createdTotalRecords) {
    await prisma.budget.create({
      data: {
        idTotal: rec.idTotal,
        io: rec.io,
        mo: rec.mo,
        wbs: rec.wbs,
        description: rec.description,
        costCenter: rec.costCenter,
        quantity: rec.quantity,
        amount: rec.amount,
        groupCapex: "PROJECT-2025",
        capexNo: rec.capexNo,
        kategori: rec.capexNo ? kategoriData.find((k) => k.capexNo === rec.capexNo)?.kategori || "Umum" : "Umum",
        komoditi: rec.komoditi,
        budgetStatus: rec.budgetStatus,
      },
    });
  }

  // 8. Created Records (Tracking Approver & Pending Items)
  // Total 1 (Sudah PO): Fully approved by APP-MGR-01 and APP-DIR-01
  const t1 = createdTotalRecords[0];
  await prisma.created.create({
    data: {
      idTotal: t1.idTotal,
      capexNo: t1.capexNo,
      type: "order",
      requestor: "Agus S (Civil Supervisor)",
      reqDate: new Date("2025-01-10"),
      budgetType: "INVESTASI",
      io: t1.io,
      costCenter: t1.costCenter,
      quantity: t1.quantity,
      amount: t1.amount,
      description: t1.description,
      kodeApprover: "APP-MGR-01",
      nama: "Budi Santoso",
      dateApprove: new Date("2025-01-12"),
      noPr: t1.nomorPr,
      notes: "Disetujui untuk tender kontraktor utama",
      budgetStatus: BudgetStatus.approved,
      kategori: "Infrastruktur",
      komoditi: t1.komoditi,
    },
  });
  await prisma.created.create({
    data: {
      idTotal: t1.idTotal,
      capexNo: t1.capexNo,
      type: "order",
      requestor: "Agus S (Civil Supervisor)",
      reqDate: new Date("2025-01-10"),
      budgetType: "INVESTASI",
      io: t1.io,
      costCenter: t1.costCenter,
      quantity: t1.quantity,
      amount: t1.amount,
      description: t1.description,
      kodeApprover: "APP-DIR-01",
      nama: "Siti Rahmawati",
      dateApprove: new Date("2025-01-15"),
      noPr: t1.nomorPr,
      notes: "Approved Final Direksi, lanjutkan proses PO",
      budgetStatus: BudgetStatus.approved,
      kategori: "Infrastruktur",
      komoditi: t1.komoditi,
    },
  });

  // Total 2 (Sudah Close): Approved by APP-MGR-02 and APP-CFO-01
  const t2 = createdTotalRecords[1];
  await prisma.created.create({
    data: {
      idTotal: t2.idTotal,
      capexNo: t2.capexNo,
      type: "order",
      requestor: "Deni (Mekanik Head)",
      reqDate: new Date("2025-01-15"),
      budgetType: "INVESTASI",
      io: t2.io,
      costCenter: t2.costCenter,
      quantity: t2.quantity,
      amount: t2.amount,
      description: t2.description,
      kodeApprover: "APP-MGR-02",
      nama: "Hendro Wijaya",
      dateApprove: new Date("2025-01-18"),
      noPr: t2.nomorPr,
      notes: "Sesuai spesifikasi alat berat 2025",
      budgetStatus: BudgetStatus.approved,
      kategori: "Alat Berat",
      komoditi: t2.komoditi,
    },
  });
  await prisma.created.create({
    data: {
      idTotal: t2.idTotal,
      capexNo: t2.capexNo,
      type: "order",
      requestor: "Deni (Mekanik Head)",
      reqDate: new Date("2025-01-15"),
      budgetType: "INVESTASI",
      io: t2.io,
      costCenter: t2.costCenter,
      quantity: t2.quantity,
      amount: t2.amount,
      description: t2.description,
      kodeApprover: "APP-CFO-01",
      nama: "Agus Pratama",
      dateApprove: new Date("2025-01-22"),
      noPr: t2.nomorPr,
      notes: "Anggaran disetujui penuh",
      budgetStatus: BudgetStatus.approved,
      kategori: "Alat Berat",
      komoditi: t2.komoditi,
    },
  });

  // Total 3 (Final Approve): Approved by APP-MGR-01 and APP-DIR-01
  const t3 = createdTotalRecords[2];
  await prisma.created.create({
    data: {
      idTotal: t3.idTotal,
      capexNo: t3.capexNo,
      type: "WBS",
      requestor: "Iwan (Irigasi Head)",
      reqDate: new Date("2025-02-01"),
      budgetType: "INVESTASI",
      wbs: t3.wbs,
      costCenter: t3.costCenter,
      quantity: t3.quantity,
      amount: t3.amount,
      description: t3.description,
      kodeApprover: "APP-MGR-01",
      nama: "Budi Santoso",
      dateApprove: new Date("2025-02-05"),
      notes: "Disetujui untuk uji kelayakan debit air",
      budgetStatus: BudgetStatus.approved,
      kategori: "Irigasi",
      komoditi: t3.komoditi,
    },
  });
  await prisma.created.create({
    data: {
      idTotal: t3.idTotal,
      capexNo: t3.capexNo,
      type: "WBS",
      requestor: "Iwan (Irigasi Head)",
      reqDate: new Date("2025-02-01"),
      budgetType: "INVESTASI",
      wbs: t3.wbs,
      costCenter: t3.costCenter,
      quantity: t3.quantity,
      amount: t3.amount,
      description: t3.description,
      kodeApprover: "APP-DIR-01",
      nama: "Siti Rahmawati",
      dateApprove: new Date("2025-02-10"),
      notes: "Final approve Direksi",
      budgetStatus: BudgetStatus.approved,
      kategori: "Irigasi",
      komoditi: t3.komoditi,
    },
  });

  // Total 4 (Sudah Created - IN PROCESS):
  // 1st approver approved, 2nd approver PENDING!
  const t4 = createdTotalRecords[3];
  await prisma.created.create({
    data: {
      idTotal: t4.idTotal,
      capexNo: t4.capexNo,
      type: "WBS",
      requestor: "Rian (IT Lead)",
      reqDate: new Date("2025-02-15"),
      budgetType: "INVESTASI",
      wbs: t4.wbs,
      costCenter: t4.costCenter,
      quantity: t4.quantity,
      amount: t4.amount,
      description: t4.description,
      kodeApprover: "APP-MGR-02",
      nama: "Hendro Wijaya",
      dateApprove: new Date("2025-02-18"),
      notes: "Verifikasi teknis infrastruktur IT selesai",
      budgetStatus: BudgetStatus.approved,
      kategori: "Teknologi Informasi",
      komoditi: t4.komoditi,
    },
  });
  await prisma.created.create({
    data: {
      idTotal: t4.idTotal,
      capexNo: t4.capexNo,
      type: "WBS",
      requestor: "Rian (IT Lead)",
      reqDate: new Date("2025-02-15"),
      budgetType: "INVESTASI",
      wbs: t4.wbs,
      costCenter: t4.costCenter,
      quantity: t4.quantity,
      amount: t4.amount,
      description: t4.description,
      kodeApprover: "APP-CFO-01",
      nama: "Agus Pratama",
      dateApprove: null, // PENDING!
      notes: "Menunggu telaah alokasi CAPEX Q1",
      budgetStatus: BudgetStatus.in_process,
      kategori: "Teknologi Informasi",
      komoditi: t4.komoditi,
    },
  });

  // Total 5 (Sudah Created - IN PROCESS):
  // PENDING for APP-MGR-01 and APP-DIR-01!
  const t5 = createdTotalRecords[4];
  await prisma.created.create({
    data: {
      idTotal: t5.idTotal,
      capexNo: t5.capexNo,
      type: "MO",
      requestor: "Hadi (HR Estate)",
      reqDate: new Date("2025-03-01"),
      budgetType: "INVESTASI",
      mo: t5.mo,
      costCenter: t5.costCenter,
      quantity: t5.quantity,
      amount: t5.amount,
      description: t5.description,
      kodeApprover: "APP-MGR-01",
      nama: "Budi Santoso",
      dateApprove: null, // PENDING!
      notes: "Menunggu persetujuan layout afdeling",
      budgetStatus: BudgetStatus.in_process,
      kategori: "Fasilitas Karyawan",
      komoditi: t5.komoditi,
    },
  });
  await prisma.created.create({
    data: {
      idTotal: t5.idTotal,
      capexNo: t5.capexNo,
      type: "MO",
      requestor: "Hadi (HR Estate)",
      reqDate: new Date("2025-03-01"),
      budgetType: "INVESTASI",
      mo: t5.mo,
      costCenter: t5.costCenter,
      quantity: t5.quantity,
      amount: t5.amount,
      description: t5.description,
      kodeApprover: "APP-DIR-01",
      nama: "Siti Rahmawati",
      dateApprove: null, // PENDING!
      notes: "Menunggu telaah anggaran direksi",
      budgetStatus: BudgetStatus.in_process,
      kategori: "Fasilitas Karyawan",
      komoditi: t5.komoditi,
    },
  });

  // Total 6 (Sudah PO): Approved by APP-MGR-02
  const t6 = createdTotalRecords[5];
  await prisma.created.create({
    data: {
      idTotal: t6.idTotal,
      capexNo: t6.capexNo,
      type: "order",
      requestor: "Yusuf (Pabrik Pupuk)",
      reqDate: new Date("2025-03-10"),
      budgetType: "INVESTASI",
      io: t6.io,
      costCenter: t6.costCenter,
      quantity: t6.quantity,
      amount: t6.amount,
      description: t6.description,
      kodeApprover: "APP-MGR-02",
      nama: "Hendro Wijaya",
      dateApprove: new Date("2025-03-14"),
      noPr: t6.nomorPr,
      notes: "Disetujui, siap pengadaan pabrik",
      budgetStatus: BudgetStatus.approved,
      kategori: "Peralatan Pabrik",
      komoditi: t6.komoditi,
    },
  });

  console.log("Seeding CAPEX successfully completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
