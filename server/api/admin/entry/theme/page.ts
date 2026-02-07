import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

/**
 * @swagger
 * /api/admin/entry/theme/page:
 *   post:
 *     summary: 管理员分页获取主题列表
 *     tags: ["Admin Theme"]
 *     security:
 *       - Admin: []
 */
export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event);
    const { code, name, mode, isActive, isDefault } = body || {};

    const where: any = {};
    if (code) {
      where.code = { contains: String(code) };
    }
    if (name) {
      where.name = { contains: String(name) };
    }
    if (mode && ["light", "dark"].includes(String(mode))) {
      where.mode = String(mode);
    }
    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    } else if (isActive === "true" || isActive === "false") {
      where.isActive = isActive === "true";
    }
    if (typeof isDefault === "boolean") {
      where.isDefault = isDefault;
    } else if (isDefault === "true" || isDefault === "false") {
      where.isDefault = isDefault === "true";
    }

    const pageNum = Number(body?.pageNum ? body.pageNum : 1);
    const pageSize = Number(body?.pageSize ? body.pageSize : 15);
    const skip = (pageNum - 1) * pageSize;

    const orderBy: any = [{ sortBy: "asc" }, { createdAt: "desc" }];

    if (pageSize === -1) {
      const datas = await prisma.theme.findMany({ where, orderBy });
      return success({ total: datas.length, data: datas, pages: 1 });
    }

    const data = await prisma.theme.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    });

    const total = await prisma.theme.count({ where });
    const pages = Math.ceil(total / pageSize);

    return success({ total, data, pages });
  } catch (e: any) {
    console.error(e);
    return error("分页获取主题失败", e?.message);
  }
});

