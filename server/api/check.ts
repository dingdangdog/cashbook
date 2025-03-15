import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    return success(false);
  }
  return success(true);
});
