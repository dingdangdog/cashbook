import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, code, name, mode, colors, isActive, isDefault, sortBy } = body;
  if (!id) return error("缺少 id");

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
