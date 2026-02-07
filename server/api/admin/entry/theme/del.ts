import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

/**
 * @swagger
 * /api/admin/entry/theme/del:
 *   post:
 *     summary: 管理员删除主题
 *     tags: ["Admin Theme"]
 *     security:
 *       - Admin: []
 */
export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event);
    const id = String(body?.id || "").trim();
    if (!id) return error("Not Find ID");

    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) return error("Not Find ID");

    const deleted = await prisma.$transaction(async (tx) => {
      const res = await tx.theme.delete({ where: { id } });

      // 若删除的是默认主题，则补一个默认主题（同模式、启用、按 sortBy/createdAt）
      if (theme.isDefault) {
        const next = await tx.theme.findFirst({
          where: { mode: theme.mode, isActive: true },
          orderBy: [{ sortBy: "asc" }, { createdAt: "asc" }],
        });
        if (next) {
          await tx.theme.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }

      return res;
    });

    return success(deleted);
  } catch (e: any) {
    console.error(e);
    return error("删除主题失败", e?.message);
  }
});

