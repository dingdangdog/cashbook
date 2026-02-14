import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/deduplication/autos:
 *   post:
 *     summary: 自动查找重复流水记录
 *     tags: ["Deduplication"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             criteria:
 *               name: boolean 是否检查名称相同
 *               description: boolean 是否检查描述相同
 *               industryType: boolean 是否检查行业类型相同
 *               flowType: boolean 是否检查流水类型相同
 *               payType: boolean 是否检查支付方式相同
 *     responses:
 *       200:
 *         description: 重复记录查找成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d:
 *                   duplicateGroups: [] #[Flow重复记录组数组]
 *                   totalGroups: number #重复组总数,
 *                   totalDuplicates: number #重复记录总数
 *       400:
 *         description: 查找失败
 *         content:
 *           application/json:
 *             schema:
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const criteria = body.criteria || {
    name: true,
    description: true,
    industryType: true,
    flowType: true,
    payType: true,
  };

  const allFlows = await prisma.flow.findMany({
    orderBy: [
      {
        day: "desc",
      },
    ],
  });

  // 用于存储可能的重复组
  const duplicateGroups = [];

  // 创建一个Map来跟踪已处理的记录ID
  const processedIds = new Set();

  // 遍历所有流水记录
  for (let i = 0; i < allFlows.length; i++) {
    const current = allFlows[i];

    // 如果当前记录已经被处理过，则跳过
    if (processedIds.has(current.id)) continue;

    // 查找与当前记录相似的记录
    const similarRecords = allFlows.filter((flow, index) => {
      // 基础条件：不是同一条记录、未被处理过、同一天、金额相同（这些是必选条件）
      let isSimilar =
        index !== i &&
        !processedIds.has(flow.id) &&
        (flow.day instanceof Date && current.day instanceof Date
          ? flow.day.getTime() === current.day.getTime()
          : flow.day === current.day) &&
        flow.money === current.money;

      // 如果基础条件不满足，直接返回false
      if (!isSimilar) return false;

      // 根据用户选择的条件进行动态判断
      if (criteria.name && flow.name !== current.name) {
        return false;
      }

      if (criteria.description && flow.description !== current.description) {
        return false;
      }

      if (criteria.industryType && flow.industryType !== current.industryType) {
        return false;
      }

      if (criteria.flowType && flow.flowType !== current.flowType) {
        return false;
      }

      if (criteria.payType && flow.payType !== current.payType) {
        return false;
      }

      // 所有选中的条件都匹配，则认为是相似记录
      return true;
    });

    // 如果找到相似记录，则创建一个组
    if (similarRecords.length > 0) {
      const group = [current, ...similarRecords];
      duplicateGroups.push(group);

      // 将组内所有记录标记为已处理
      group.forEach((record) => processedIds.add(record.id));
    }
  }

  return success({
    duplicateGroups,
    totalGroups: duplicateGroups.length,
    totalDuplicates: processedIds.size,
  });
});
