import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event); // 从请求体获取 ID
  if (!id) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.user.delete({
    where: { id: Number(id) },
  });

  return success(deleted);
});
