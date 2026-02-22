import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    return error("缺少 id");
  }

  // 查找主题
  const theme = await prisma.systemTheme.findUnique({
    where: { id: String(id) },
  });

  if (!theme) {
    return error("主题不存在");
  }

  // 如果已经是默认主题，直接返回
  if (theme.isDefault) {
    return success(theme);
  }

  // 使用事务确保数据一致性
  const result = await prisma.$transaction(async (tx) => {
    // 1. 将同模式下的其他主题的 isDefault 设为 false
    await tx.systemTheme.updateMany({
      where: {
        mode: theme.mode,
        isDefault: true,
        id: { not: theme.id },
      },
      data: {
        isDefault: false,
      },
    });

    // 2. 将当前主题设为默认，并自动启用
    const updated = await tx.systemTheme.update({
      where: { id: theme.id },
      data: {
        isDefault: true,
        isActive: true,
      },
    });

    return updated;
  });

  return success(result);
});
