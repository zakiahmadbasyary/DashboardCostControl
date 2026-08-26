import { PrismaClient } from "@prisma/client-admin";

const globalForPrisma = global as unknown as { prismaAdmin: PrismaClient };

export const prismaAdmin =
  globalForPrisma.prismaAdmin ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaAdmin = prismaAdmin;
