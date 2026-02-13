import prisma from "~~/server/lib/prisma";
import { success } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const where: any = {};
  if (body.provider) where.provider = { contains: body.provider };
  if (body.name) where.name = { contains: body.name };
  if (body.isActive !== undefined && body.isActive !== "")
    where.isActive = body.isActive === "true" || body.isActive === true;

  const pageNum = Number(body.pageNum ?? 1);
  const pageSize = Number(body.pageSize ?? 15);
  const skip = (pageNum - 1) * pageSize;
  const orderBy = [{ createdAt: "desc" as const }];

  if (pageSize === -1) {
    const data = await prisma.systemAIProvider.findMany({ where, orderBy });
    return success({ total: data.length, data });
  }

  const [data, total] = await Promise.all([
    prisma.systemAIProvider.findMany({ where, orderBy, skip, take: pageSize }),
    prisma.systemAIProvider.count({ where }),
  ]);
  return success({ total, data });
});
