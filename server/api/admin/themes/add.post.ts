import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    code,
    name,
    mode,
    colors,
    isActive,
    isDefault,
    sortBy,
  } = body;

  if (!code?.trim() || !name?.trim() || !mode) {
    return error("code、name、mode 不能为空");
  }

  const created = await prisma.systemTheme.create({
    data: {
      code: String(code).trim(),
      name: String(name).trim(),
      mode: String(mode).trim(),
      colors: String(colors ?? "{}"),
      isActive: Boolean(isActive !== false),
      isDefault: Boolean(isDefault === true),
      sortBy: Number(sortBy ?? 0),
    },
  });
  return success(created);
});
