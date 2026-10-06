import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const group = searchParams.get("group") || "";

    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        { material: { contains: search, mode: "insensitive" } },
        { materialDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (group) {
      whereCondition.group = { equals: group, mode: "insensitive" };
    }

    const masterSheets = await prisma.masterSheet.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: { bahanMaterialList: true },
        },
      },
      orderBy: { material: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: masterSheets,
      count: masterSheets.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch master sheets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { material, abcIndicator, materialDescription, baseUnitOfMeasure, group } = body;

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material code is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.masterSheet.findUnique({
      where: { material },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Material with code '${material}' already exists` },
        { status: 400 }
      );
    }

    const created = await prisma.masterSheet.create({
      data: {
        material,
        abcIndicator: abcIndicator || null,
        materialDescription: materialDescription || null,
        baseUnitOfMeasure: baseUnitOfMeasure || null,
        group: group || null,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create master sheet" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { material, abcIndicator, materialDescription, baseUnitOfMeasure, group } = body;

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material code is required for update" },
        { status: 400 }
      );
    }

    const updated = await prisma.masterSheet.update({
      where: { material },
      data: {
        abcIndicator,
        materialDescription,
        baseUnitOfMeasure,
        group,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update master sheet" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get("material");

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material code parameter is required" },
        { status: 400 }
      );
    }

    // Check if there are foreign key constraints (bahan_material referencing this material)
    const bahanCount = await prisma.bahanMaterial.count({
      where: { material },
    });

    if (bahanCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete material '${material}' because it has ${bahanCount} related price records in bahan_material (ON DELETE RESTRICT constraint)`,
        },
        { status: 400 }
      );
    }

    await prisma.masterSheet.delete({
      where: { material },
    });

    return NextResponse.json({
      success: true,
      message: `Material '${material}' deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete master sheet" },
      { status: 500 }
    );
  }
}
