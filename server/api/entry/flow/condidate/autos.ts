import prisma from "~/lib/prisma";

// 此处的相似性判断示例：金额完全相等（你可根据业务需要添加金额误差、日期范围等条件）
export default defineEventHandler(async (event) => {
  // 获取所有未平账的支出数据
  const expenditures = await prisma.flow.findMany({
    where: { flowType: "支出", eliminate: 0 },
    orderBy: [
      {
        day: "desc",
      },
    ],
  });

  const candidatePairs = [];

  // 对每笔支出查找候选记录
  for (const expense of expenditures) {
    const candidate = await prisma.flow.findFirst({
      where: {
        flowType: { in: ["收入", "不计收支"] },
        // 例如这里以金额完全相等为条件，实际可修改为近似匹配：
        money: expense.money,
        // 如有需要，可增加日期、描述等其它条件
      },
    });
    if (candidate) {
      candidatePairs.push({
        out: expense,
        in: candidate,
      });
    }
  }

  return success(candidatePairs);
});
