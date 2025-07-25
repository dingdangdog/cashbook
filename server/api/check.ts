import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      return success(0);
    }
    return success(userCount);
  } catch (error) {
    return success(-1);
  }
});
