import prisma from "~/lib/prisma";
import { getUUID } from "~/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const { id } = body;
  if (!id) {
    return error("Not Find ID");
  }

  // 生成共享密钥
  const key = getUUID(8);
  const shareKey = `${userId}${id}${key}`;

  const updated = await prisma.book.update({
    where: { id, userId },
    data: {
      shareKey,
    },
  });
  return success(updated);
});
