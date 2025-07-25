import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/analytics/monthAnalysis:
 *   post:
 *     summary: 获取月度详细分析数据
 *     tags: ["Analytics"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             month: string 月份（YYYY-MM格式）
 *             flowType: string 流水类型（可选）
 *     responses:
 *       200:
 *         description: 月度详细分析数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   month: 月份,
 *                   inSum: 总收入,
 *                   outSum: 总支出,
 *                   zeroSum: 总不计收支,
 *                   maxInType: 最大收入类型,
 *                   maxInTypeSum: 最大收入类型金额,
 *                   maxOutType: 最大支出类型,
 *                   maxOutTypeSum: 最大支出类型金额,
 *                   maxIn: 最大单笔收入记录,
 *                   maxOut: 最大单笔支出记录,
 *                   maxZero: 最大单笔不计收支记录
 *                 }
 *               }
 *       400:
 *         description: 获取失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"请先选择账本" | "Not Find Month" | "暂无数据"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const { bookId, flowType, month } = await readBody(event); // 获取查询参数
  if (!bookId) {
    return error("请先选择账本");
  }
  if (!month) {
    return error("Not Find Month");
  }

  const where: any = {
    bookId,
    day: {
      startsWith: month,
    },
  }; // 条件查询

  if (flowType) {
    where.flowType = {
      equals: flowType,
    };
  }

  const count = await prisma.flow.count({ where });
  if (count <= 0) {
    return error("暂无数据");
  }

  //
  // Month      string `json:"month"`
  // OutSum     string `json:"outSum"`     // 总支出
  // InSum      string `json:"inSum"`      // 总收入
  // ZeroSum    string `json:"zeroSum"`    // 总不计收支
  // MaxType    string `json:"maxType"`    // 最大支出类型
  // MaxTypeSum string `json:"maxTypeSum"` // 最大支出金额
  // MaxOut     Flow   `json:"maxOut"`     // 最大单笔支出
  // MaxIn      Flow   `json:"maxIn"`      // 最大单笔收入
  const res: any = {
    month,
    inSum: 0,
    outSum: 0,
    zeroSum: 0,
    maxInType: "",
    maxInTypeSum: 0,
    maxOutType: "",
    maxOutTypeSum: 0,
    maxIn: {},
    maxOut: {},
    maxZero: {},
  };

  // 1. 按月查询当月总收入、总支出、总不计收支
  const monthSum = await prisma.flow.groupBy({
    by: ["flowType"],
    _sum: {
      money: true,
    },
    where,
  });
  monthSum.forEach((item) => {
    if (item.flowType == "收入") {
      res.inSum = (item._sum.money || 0).toFixed(2);
    } else if (item.flowType == "支出") {
      res.outSum = (item._sum.money || 0).toFixed(2);
    } else if (item.flowType == "不计收支") {
      res.zeroSum = (item._sum.money || 0).toFixed(2);
    }
  });

  // 2. 查询当月最高收入类型
  const maxInType = await prisma.flow.groupBy({
    by: ["industryType"],
    _sum: {
      money: true,
    },
    where: {
      ...where,
      flowType: "收入",
    },
    orderBy: {
      _sum: {
        money: "desc", // 按消费金额降序排列
      },
    },
    take: 1, // 只取第一个结果
  });
  if (maxInType[0]) {
    res.maxInType = maxInType[0].industryType || "";
    res.maxInTypeSum = (maxInType[0]._sum.money || 0).toFixed(2);
  }

  // 3. 查询当月最高支出类型
  const maxOutType = await prisma.flow.groupBy({
    by: ["industryType"],
    _sum: {
      money: true,
    },
    where: {
      ...where,
      flowType: "支出",
    },
    orderBy: {
      _sum: {
        money: "desc", // 按消费金额降序排列
      },
    },
    take: 1, // 只取第一个结果
  });
  if (maxOutType[0]) {
    res.maxOutType = maxOutType[0].industryType || "";
    res.maxOutTypeSum = (maxOutType[0]._sum.money || 0).toFixed(2);
  }

  // 4. 查询当月最高单笔收入
  const maxIn = await prisma.flow.findFirst({
    where: {
      ...where,
      flowType: "收入",
    },
    orderBy: {
      money: "desc",
    },
  });
  res.maxIn = maxIn || {};
  // 5. 查询当月最高单笔支出
  const maxOut = await prisma.flow.findFirst({
    where: {
      ...where,
      flowType: "支出",
    },
    orderBy: {
      money: "desc",
    },
  });
  res.maxOut = maxOut || {};
  // 6. 查询当月最高单笔支出
  const maxZero = await prisma.flow.findFirst({
    where: {
      ...where,
      flowType: "不计收支",
    },
    orderBy: {
      money: "desc",
    },
  });
  res.maxZero = maxZero || {};
  return success(res);
});
