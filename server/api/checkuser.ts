import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      username: true,
      createDate: true,
    },
    where: {
      id: userId,
    },
  });
  
  if (!user) {
    deleteCookie(event, "Authorization");
    return success(null);
  }
  
  return success(user);
});
