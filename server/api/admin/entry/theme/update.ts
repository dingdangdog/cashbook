import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

/**
 * @swagger
 * /api/admin/entry/theme/update:
 *   post:
 *     summary: 管理员更新主题
 *     tags: ["Admin Theme"]
 *     security:
 *       - Admin: []
 */
export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event);
    const id = String(body?.id || "").trim();
    if (!id) return error("Not Find ID");

    const existing = await prisma.theme.findUnique({ where: { id } });
    if (!existing) return error("Not Find ID");

    const data: any = {};
    if (body?.code !== undefined) data.code = String(body.code).trim();
    if (body?.name !== undefined) data.name = String(body.name).trim();
    if (body?.mode !== undefined) data.mode = String(body.mode).trim();
    if (body?.colors !== undefined) {
      data.colors =
        typeof body.colors === "string" ? body.colors : JSON.stringify(body.colors);
    }
    if (body?.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body?.sortBy !== undefined && Number.isFinite(Number(body.sortBy))) {
      data.sortBy = Number(body.sortBy);
    }
    if (body?.isDefault !== undefined) data.isDefault = Boolean(body.isDefault);

    const targetMode =
      (data.mode && ["light", "dark"].includes(data.mode) ? data.mode : existing.mode) as
        | "light"
        | "dark";

    // mode 校验
    if (data.mode !== undefined && !["light", "dark"].includes(String(data.mode))) {
      return error("mode必须为light或dark");
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 若设置为默认，则先取消同模式其他默认
      if (data.isDefault === true) {
        await tx.theme.updateMany({
          where: { mode: targetMode, id: { not: id }, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.theme.update({
        where: { id },
        data,
      });
    });

    return success(updated);
  } catch (e: any) {
    console.error(e);
    return error("更新主题失败", e?.message);
  }
});

