import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { ids, bookId, flowType, industryType, payType } = await readBody(
    event
  ); // 从请求体获取 ID
  // const userId = await getUserId(event);

  if (!ids || !bookId) {
    return error("Not Find ID");
  }

  const updateInfo: any = {};
  if (flowType) {
    updateInfo.flowType = String(flowType);
  }
  if (industryType) {
    updateInfo.industryType = String(industryType);
  }
  if (payType) {
    updateInfo.payType = String(payType);
  }

  const updated = await prisma.flow.updateMany({
    data: updateInfo,
    where: {
      id: {
        in: ids,
      },
    },
  });
  return success(updated);
});
