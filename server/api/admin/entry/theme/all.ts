import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

/**
 * @swagger
 * /api/admin/entry/theme/all:
 *   post:
 *     summary: 管理员获取全部主题
 *     tags: ["Admin Theme"]
 *     security:
 *       - Admin: []
 */
export default defineEventHandler(async () => {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: [{ sortBy: "asc" }, { createdAt: "desc" }],
    });
    return success(themes);
  } catch (e: any) {
    console.error(e);
    return error("获取全部主题失败", e?.message);
  }
});

