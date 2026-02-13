import prisma from "~~/server/lib/prisma";
import { success } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {};
  const where: any = {};
  if (body.mode) where.mode = body.mode;
  if (body.isActive !== undefined && body.isActive !== "")
    where.isActive = body.isActive === "true" || body.isActive === true;

  const data = await prisma.systemTheme.findMany({
    where,
    orderBy: [{ sortBy: "asc" }, { createdAt: "asc" }],
  });
  return success(data);
});
