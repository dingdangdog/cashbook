import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);

  const allowedFlowTypes = ["支出", "收入", "不计收支"];
  if (!body.defaultFlowType || !allowedFlowTypes.includes(body.defaultFlowType)) {
    return error("Invalid defaultFlowType");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      defaultFlowType: body.defaultFlowType,
    },
  });

  return success(true);
});
