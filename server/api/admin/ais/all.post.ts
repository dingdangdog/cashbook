import prisma from "~~/server/lib/prisma";
import { success } from "~~/server/utils/common";

export default defineEventHandler(async () => {
  const data = await prisma.systemAIProvider.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return success(data);
});
