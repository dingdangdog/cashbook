import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async () => {
  const row = await prisma.systemConfig.findUnique({
    where: { id: 1 },
  });
  if (!row) {
    return success({
      id: 1,
      title: null,
      description: null,
      keywords: null,
      version: null,
      openRegister: false,
      createAt: null,
      updateAt: null,
    });
  }
  return success(row);
});
