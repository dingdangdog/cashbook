import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const settings = await prisma.systemSetting.findUnique({
    where: {
      id: 1,
    },
  });

  return success(settings);
});
