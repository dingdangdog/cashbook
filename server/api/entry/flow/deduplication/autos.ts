import prisma from "~/lib/prisma";

// 查找疑似重复的数据：同一天+金额相同+支出类型相同的数据
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  if (!body.bookId) {
    return error("No Find bookid");
  }

  // 获取检测条件，如果未提供则使用默认值（全部条件）
  const criteria = body.criteria || {
    name: true,
    description: true,
    industryType: true,
    flowType: true,
    payType: true,
  };

  // 获取所有流水数据
  const allFlows = await prisma.flow.findMany({
    where: {
      bookId: String(body.bookId),
      // 可以根据需要添加其他过滤条件，如时间范围等
    },
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
        flow.day === current.day &&
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
