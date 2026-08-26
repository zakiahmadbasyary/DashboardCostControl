import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { prismaAdmin: PrismaClient };

export const prismaAdmin =
  globalForPrisma.prismaAdmin ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaAdmin = prismaAdmin;
