import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;
  if (!id) return error("缺少 id");

  const deleted = await prisma.systemAIProvider.delete({
    where: { id: String(id) },
  });
  return success(deleted);
});
