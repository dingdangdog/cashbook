import prisma from "~~/server/lib/prisma";
import { success } from "~~/server/utils/common";

export default defineEventHandler(async () => {
  const data = await prisma.systemTheme.findMany({
    orderBy: [{ sortBy: "asc" }, { createdAt: "asc" }],
  });
  return success(data);
});
