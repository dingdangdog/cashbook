import prisma from "~~/server/lib/prisma";
import { success } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const where: any = {};

  if (body.code) where.code = { contains: body.code };
  if (body.name) where.name = { contains: body.name };
  if (body.mode) where.mode = body.mode;
  if (body.isActive !== undefined && body.isActive !== "")
    where.isActive = body.isActive === "true" || body.isActive === true;
  if (body.isDefault !== undefined && body.isDefault !== "")
    where.isDefault = body.isDefault === "true" || body.isDefault === true;

  const pageNum = Number(body.pageNum ?? 1);
  const pageSize = Number(body.pageSize ?? 15);
  const skip = (pageNum - 1) * pageSize;
  const orderBy = [{ sortBy: "asc" as const }, { createdAt: "asc" as const }];

  if (pageSize === -1) {
    const data = await prisma.systemTheme.findMany({ where, orderBy });
    return success({ total: data.length, data });
  }

  const [data, total] = await Promise.all([
    prisma.systemTheme.findMany({ where, orderBy, skip, take: pageSize }),
    prisma.systemTheme.count({ where }),
  ]);
  return success({ total, data });
});
