import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    deleteCookie(event, "Authorization");
    return success(false);
  }
  return success(true);
});
