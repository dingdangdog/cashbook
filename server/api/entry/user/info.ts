import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);

  const where: any = {
    id: userId,
  };

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      username: true,
      createDate: true,
    },
    where, // 使用条件查询
  });

  return success(user);
});
