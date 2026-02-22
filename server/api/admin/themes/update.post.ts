import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, code, name, mode, colors, isActive, isDefault, sortBy } = body;
  if (!id) return error("缺少 id");

  // 如果设置了 isDefault 为 true，需要处理同模式下的唯一性
  if (isDefault === true) {
    // 先获取当前主题信息
    const currentTheme = await prisma.systemTheme.findUnique({
      where: { id: String(id) },
      select: { mode: true },
    });

    if (!currentTheme) {
      return error("主题不存在");
    }

    // 使用事务确保数据一致性
    const updated = await prisma.$transaction(async (tx) => {
      // 1. 将同模式下的其他主题的 isDefault 设为 false
      await tx.systemTheme.updateMany({
        where: {
          mode: mode !== undefined ? String(mode).trim() : currentTheme.mode,
          isDefault: true,
          id: { not: String(id) },
        },
        data: {
          isDefault: false,
        },
      });

      // 2. 更新当前主题
      const result = await tx.systemTheme.update({
        where: { id: String(id) },
        data: {
          ...(code !== undefined && { code: String(code).trim() }),
          ...(name !== undefined && { name: String(name).trim() }),
          ...(mode !== undefined && { mode: String(mode).trim() }),
          ...(colors !== undefined && { colors: String(colors) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
          isDefault: true,
          ...(sortBy !== undefined && { sortBy: Number(sortBy) }),
        },
      });

      return result;
    });

    return success(updated);
  }

  // 如果 isDefault 为 false 或未设置，直接更新
  const updated = await prisma.systemTheme.update({
    where: { id: String(id) },
    data: {
      ...(code !== undefined && { code: String(code).trim() }),
      ...(name !== undefined && { name: String(name).trim() }),
      ...(mode !== undefined && { mode: String(mode).trim() }),
      ...(colors !== undefined && { colors: String(colors) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      ...(sortBy !== undefined && { sortBy: Number(sortBy) }),
    },
  });
  return success(updated);
});
