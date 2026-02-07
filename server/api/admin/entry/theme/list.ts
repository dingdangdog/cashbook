import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

/**
 * @swagger
 * /api/admin/entry/theme/list:
 *   post:
 *     summary: 管理员获取主题列表
 *     tags: ["Admin Theme"]
 *     security:
 *       - Admin: []
 */
export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event);
    const { code, name, mode, isActive, isDefault } = body || {};

    const where: any = {};
    if (code) where.code = { contains: String(code) };
    if (name) where.name = { contains: String(name) };
    if (mode && ["light", "dark"].includes(String(mode))) where.mode = String(mode);
    if (typeof isActive === "boolean") where.isActive = isActive;
    if (typeof isDefault === "boolean") where.isDefault = isDefault;

    const themes = await prisma.theme.findMany({
      where,
      orderBy: [{ sortBy: "asc" }, { createdAt: "desc" }],
    });

    return success(themes);
  } catch (e: any) {
    console.error(e);
    return error("获取主题列表失败", e?.message);
  }
});

