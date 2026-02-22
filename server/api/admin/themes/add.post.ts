import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { code, name, mode, colors, isActive, isDefault, sortBy } = body;

  if (!code?.trim() || !name?.trim() || !mode) {
    return error("code、name、mode 不能为空");
  }

  const themeMode = String(mode).trim();
  const willBeDefault = Boolean(isDefault === true);

  // 如果设置为默认主题，需要处理同模式下的唯一性
  if (willBeDefault) {
    const created = await prisma.$transaction(async (tx) => {
      // 1. 将同模式下的其他主题的 isDefault 设为 false
      await tx.systemTheme.updateMany({
        where: {
          mode: themeMode,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // 2. 创建新主题并设置为默认
      const result = await tx.systemTheme.create({
        data: {
          code: String(code).trim(),
          name: String(name).trim(),
          mode: themeMode,
          colors: String(colors ?? "{}"),
          isActive: Boolean(isActive !== false),
          isDefault: true,
          sortBy: Number(sortBy ?? 0),
        },
      });

      return result;
    });

    return success(created);
  }

  // 如果不是默认主题，直接创建
  const created = await prisma.systemTheme.create({
    data: {
      code: String(code).trim(),
      name: String(name).trim(),
      mode: themeMode,
      colors: String(colors ?? "{}"),
      isActive: Boolean(isActive !== false),
      isDefault: false,
      sortBy: Number(sortBy ?? 0),
    },
  });
  return success(created);
});
