import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to calculate 'nilai' strictly per specification: nilai = price / price_unit
function calculateNilai(price: number | null | undefined, priceUnit: number | null | undefined): number | null {
  if (price === null || price === undefined || isNaN(price)) return null;
  if (priceUnit === null || priceUnit === undefined || isNaN(priceUnit) || priceUnit === 0) return null;
  return Number((price / priceUnit).toFixed(4));
}

// Helper to serialize Prisma Decimal & BigInt types safely for JSON response
function serializeBahanMaterial(item: any) {
  return {
    ...item,
    id: Number(item.id),
    price: item.price !== null ? Number(item.price) : null,
    priceUnit: item.priceUnit !== null ? Number(item.priceUnit) : null,
    nilai: item.nilai !== null ? Number(item.nilai) : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get("material") || "";
    const search = searchParams.get("search") || "";
    const plant = searchParams.get("plant") || "";
    const materialGroup = searchParams.get("materialGroup") || "";
    const purchasingGroup = searchParams.get("purchasingGroup") || "";

    const whereCondition: any = {};

    if (material) {
      whereCondition.material = { equals: material, mode: "insensitive" };
    }

    if (plant) {
      whereCondition.plant = { equals: plant, mode: "insensitive" };
    }

    if (materialGroup) {
      whereCondition.materialGroup = { equals: materialGroup, mode: "insensitive" };
    }

    if (purchasingGroup) {
      whereCondition.purchasingGroup = { equals: purchasingGroup, mode: "insensitive" };
    }

    if (search) {
      whereCondition.OR = [
        { material: { contains: search, mode: "insensitive" } },
        { materialGroup: { contains: search, mode: "insensitive" } },
        { createdBy: { contains: search, mode: "insensitive" } },
        { masterSheet: { materialDescription: { contains: search, mode: "insensitive" } } },
      ];
    }

    const bahanMaterials = await prisma.bahanMaterial.findMany({
      where: whereCondition,
      include: {
        masterSheet: true,
      },
      orderBy: { id: "desc" },
    });

    const serialized = bahanMaterials.map(serializeBahanMaterial);

    return NextResponse.json({
      success: true,
      data: serialized,
      count: serialized.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bahan material" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      material,
      price,
      currency,
      priceUnit,
      materialGroup,
      plant,
      purchasingGroup,
      lastChange,
      createdBy,
      update,
    } = body;

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material code (FK -> mastersheet) is required" },
        { status: 400 }
      );
    }

    // Check if parent MasterSheet exists
    const parentMaster = await prisma.masterSheet.findUnique({
      where: { material },
    });

    if (!parentMaster) {
      return NextResponse.json(
        {
          success: false,
          message: `Material '${material}' does not exist in mastersheet. Please create mastersheet record first.`,
        },
        { status: 400 }
      );
    }

    const numPrice = price !== undefined && price !== null ? Number(price) : null;
    const numPriceUnit = priceUnit !== undefined && priceUnit !== null ? Number(priceUnit) : null;
    const computedNilai = calculateNilai(numPrice, numPriceUnit);

    const created = await prisma.bahanMaterial.create({
      data: {
        material,
        price: numPrice,
        currency: currency || "IDR",
        priceUnit: numPriceUnit,
        materialGroup: materialGroup || null,
        plant: plant || null,
        purchasingGroup: purchasingGroup || null,
        lastChange: lastChange ? new Date(lastChange) : new Date(),
        createdBy: createdBy || "System",
        update: update ? new Date(update) : new Date(),
        nilai: computedNilai,
      },
      include: {
        masterSheet: true,
      },
    });

    return NextResponse.json(
      { success: true, data: serializeBahanMaterial(created) },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create bahan material record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      material,
      price,
      currency,
      priceUnit,
      materialGroup,
      plant,
      purchasingGroup,
      lastChange,
      createdBy,
      update,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required for update" },
        { status: 400 }
      );
    }

    const numPrice = price !== undefined && price !== null ? Number(price) : null;
    const numPriceUnit = priceUnit !== undefined && priceUnit !== null ? Number(priceUnit) : null;
    const computedNilai = calculateNilai(numPrice, numPriceUnit);

    const updated = await prisma.bahanMaterial.update({
      where: { id: BigInt(id) },
      data: {
        material,
        price: numPrice,
        currency,
        priceUnit: numPriceUnit,
        materialGroup,
        plant,
        purchasingGroup,
        lastChange: lastChange ? new Date(lastChange) : undefined,
        createdBy,
        update: update ? new Date(update) : new Date(),
        nilai: computedNilai,
      },
      include: {
        masterSheet: true,
      },
    });

    return NextResponse.json({ success: true, data: serializeBahanMaterial(updated) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update bahan material record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: "ID parameter is required" },
        { status: 400 }
      );
    }

    await prisma.bahanMaterial.delete({
      where: { id: BigInt(idParam) },
    });

    return NextResponse.json({
      success: true,
      message: `Record with ID ${idParam} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete bahan material record" },
      { status: 500 }
    );
  }
}
