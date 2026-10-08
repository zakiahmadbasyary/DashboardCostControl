import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database harga material...");

  // 1. Seed mastersheet
  const masterSheetData = [
    {
      material: "MAT001",
      abcIndicator: "A",
      materialDescription: "Pupuk NPK 15-15-15",
      baseUnitOfMeasure: "KG",
      group: "Pupuk",
    },
    {
      material: "MAT002",
      abcIndicator: "B",
      materialDescription: "Herbisida Sistemik A",
      baseUnitOfMeasure: "L",
      group: "Pestisida",
    },
    {
      material: "MAT003",
      abcIndicator: "C",
      materialDescription: "Oli Mesin Diesel SAE 40",
      baseUnitOfMeasure: "L",
      group: "Maintenance",
    },
    {
      material: "MAT004",
      abcIndicator: "A",
      materialDescription: "Pupuk Urea Granul",
      baseUnitOfMeasure: "KG",
      group: "Pupuk",
    },
    {
      material: "MAT005",
      abcIndicator: "B",
      materialDescription: "Fungisida Kontak B",
      baseUnitOfMeasure: "KG",
      group: "Pestisida",
    },
  ];

  for (const master of masterSheetData) {
    await prisma.masterSheet.upsert({
      where: { material: master.material },
      update: master,
      create: master,
    });
  }

  console.log(`Seeded ${masterSheetData.length} records into mastersheet.`);

  // 2. Clear existing bahan_material sample data for idempotency
  await prisma.bahanMaterial.deleteMany({});

  // 3. Seed monthly prices for months 1 to 12
  const materialsMonthlyConfig = [
    {
      material: "MAT001",
      materialGroup: "Pupuk",
      basePrice: 500000,
      priceUnit: 100,
      monthlyFactors: [5000, 5050, 5100, 5150, 5200, 5250, 5300, 5350, 5400, 5450, 5500, 5550],
    },
    {
      material: "MAT002",
      materialGroup: "Pestisida",
      basePrice: 850000,
      priceUnit: 10,
      monthlyFactors: [85000, 85500, 86000, 85800, 86500, 87000, 87500, 88000, 87800, 88500, 89000, 89500],
    },
    {
      material: "MAT003",
      materialGroup: "Maintenance",
      basePrice: 1200000,
      priceUnit: 20,
      monthlyFactors: [60000, 60200, 60500, 61000, 61200, 61500, 62000, 62200, 62500, 63000, 63500, 64000],
    },
    {
      material: "MAT004",
      materialGroup: "Pupuk",
      basePrice: 450000,
      priceUnit: 100,
      monthlyFactors: [4500, 4520, 4550, 4580, 4600, 4620, 4650, 4680, 4700, 4720, 4750, 4780],
    },
    {
      material: "MAT005",
      materialGroup: "Pestisida",
      basePrice: 920000,
      priceUnit: 10,
      monthlyFactors: [92000, 92500, 93000, 92800, 93500, 94000, 94200, 94500, 95000, 95200, 95500, 96000],
    },
  ];

  const bahanMaterialData: any[] = [];

  for (const item of materialsMonthlyConfig) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const calcNilai = item.monthlyFactors[month - 1];
      const totalPrice = calcNilai * item.priceUnit;

      bahanMaterialData.push({
        material: item.material,
        price: totalPrice,
        currency: "IDR",
        priceUnit: item.priceUnit,
        materialGroup: item.materialGroup,
        plant: "PG01",
        purchasingGroup: item.materialGroup === "Pupuk" ? "PG01" : item.materialGroup === "Pestisida" ? "PG02" : "PG03",
        lastChange: new Date(`2026-${monthStr}-15`),
        createdBy: "Admin Logistik",
        update: new Date(`2026-${monthStr}-15`),
        nilai: calcNilai,
      });

      // Add a second update in month 3 for MAT001 to test MAX(update) rule in Section 13 of PRD
      if (item.material === "MAT001" && month === 3) {
        bahanMaterialData.push({
          material: "MAT001",
          price: 520000, // 520000 / 100 = 5200
          currency: "IDR",
          priceUnit: 100,
          materialGroup: "Pupuk",
          plant: "PG01",
          purchasingGroup: "PG01",
          lastChange: new Date("2026-03-28"),
          createdBy: "Admin Logistik",
          update: new Date("2026-03-28"),
          nilai: 5200,
        });
      }
    }
  }

  for (const b of bahanMaterialData) {
    await prisma.bahanMaterial.create({
      data: b,
    });
  }

  console.log(`Seeded ${bahanMaterialData.length} records into bahan_material across 12 months.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
