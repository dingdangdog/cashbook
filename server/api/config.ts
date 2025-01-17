import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const settings = await prisma.systemSetting.findUnique({
    select: {
      title: true,
      description: true,
      keywords: true,
      version: true,
      openRegister: true,
    },
    where: {
      id: 1,
    },
  });
  return success(settings);
});
