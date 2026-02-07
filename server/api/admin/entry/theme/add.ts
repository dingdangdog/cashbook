import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

/**
 * @swagger
 * /api/admin/entry/theme/add:
 *   post:
 *     summary: 管理员新增主题
 *     tags: ["Admin Theme"]
 *     security:
 *       - Admin: []
 */
export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event);
    const code = String(body?.code || "").trim();
    const name = String(body?.name || "").trim();
    const mode = String(body?.mode || "").trim();
    const colors = body?.colors ?? "";

    if (!code) return error("code不能为空");
    if (!name) return error("name不能为空");
    if (!["light", "dark"].includes(mode)) return error("mode必须为light或dark");

    const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;
    const isDefault =
      typeof body?.isDefault === "boolean" ? body.isDefault : false;
    const sortBy = Number.isFinite(Number(body?.sortBy))
      ? Number(body.sortBy)
      : 0;

    const colorsStr =
      typeof colors === "string" ? colors : JSON.stringify(colors);

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.theme.updateMany({
          where: { mode, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.theme.create({
        data: {
          code,
          name,
          mode,
          colors: colorsStr,
          isActive,
          isDefault,
          sortBy,
        },
      });
    });

    return success(created);
  } catch (e: any) {
    console.error(e);
    return error("新增主题失败", e?.message);
  }
});

