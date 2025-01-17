import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  if (!body.bookId) {
    return error("Not Find BookID");
  }
  const types: any[] = body.types;
  const updates: any[] = [];
  const creates: any[] = [];
  const ids: number[] = [];
  // console.log(types);
  types.forEach((t) => {
    if (t.id) {
      ids.push(t.id);
      updates.push(t);
    } else {
      t.userId = userId;
      creates.push(t);
    }
  });
  // console.log(updates);
  // console.log(creates);
  if (ids.length > 0) {
    // 删除原有但是现在没有的类型配置（删除了）
    await prisma.typeRelation.deleteMany({
      where: {
        id: {
          notIn: ids,
        },
        bookId: body.bookId,
      },
    });
    // 更新有ID的原有配置
    for (let t of updates) {
      const updated = await prisma.typeRelation.updateMany({
        data: t,
        where: {
          id: t.id,
        },
      });
    }
  }
  // 创建没有ID的新配置
  const created = await prisma.typeRelation.createMany({
    data: creates,
  });

  return success("更新成功");
});
