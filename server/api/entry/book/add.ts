import prisma from "~/lib/prisma";
import { getUUID } from "~/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookName } = body;

  const userId = await getUserId(event);

  const bookId = userId + "-" + getUUID(8);
  // 在数据库中添加新数据
  const created = await prisma.book.create({
    data: {
      bookId,
      userId,
      bookName,
    },
  });

  // 初始化 book 的 TypeRelation 数据
  const dTypes = await prisma.typeRelation.findMany({
    where: {
      bookId: "0",
      userId: 0,
    },
  });

  const newTypes: any = [];
  dTypes.forEach((t) => {
    newTypes.push({
      bookId,
      userId,
      source: t.source,
      target: t.target,
    });
  });
  await prisma.typeRelation.createMany({
    data: newTypes,
  });

  return success(created);
});
