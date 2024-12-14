const { readFlows, queryFlows } = require("./flow.js");
class DailyLine {
  constructor(day, daySum, inSum, zeroSum) {
    this.day = day;
    this.daySum = daySum; // 总支出
    this.inSum = inSum; // 总收入
    this.zeroSum = zeroSum; // 总不计收支
  }
}
class TypePie {
  constructor(type, typeSum, inSum, zeroSum) {
    this.type = type;
    this.typeSum = typeSum; // 总支出
    this.inSum = inSum; // 总收入
    this.zeroSum = zeroSum; // 总不计收支
  }
}

// 获取每日流水折线图数据
const getDailyLine = async (bookId, param) => {
  const flowList = await queryFlows(bookId, param);
  const sumMap = {};
  const inSumMap = {};
  const zeroSumMap = {};

  if (flowList.length <= 0) {
    return { c: 200, d: [], m: "暂无数据" };
  }
  for (let flow of flowList) {
    const day = flow.day;
    const money = Number(flow.money);
    if (flow.flowType === "支出") {
      sumMap[day] = (sumMap[day] || 0) + money;
    } else if (flow.flowType === "收入") {
      inSumMap[day] = (inSumMap[day] || 0) + money;
    } else {
      zeroSumMap[day] = (zeroSumMap[day] || 0) + money;
    }
  }

  // 使用 Set 来保存所有的天数，统一同步横轴
  const allDays =
    new Set() <
    String >
    [
      ...Object.keys(sumMap),
      ...Object.keys(inSumMap),
      ...Object.keys(zeroSumMap),
    ];

  // 遍历所有的天数，确保 sumMap、inSumMap 和 zeroSumMap 中都有相应的值
  for (const day in allDays) {
    sumMap[day] = sumMap[day] || 0;
    inSumMap[day] = inSumMap[day] || 0;
    zeroSumMap[day] = zeroSumMap[day] || 0;
  }

  const lines = Object.keys(sumMap).map(
    (day) =>
      new DailyLine(
        day,
        sumMap[day].toFixed(2),
        (inSumMap[day] || 0).toFixed(2),
        (zeroSumMap[day] || 0).toFixed(2)
      )
  );

  lines.sort((a, b) => a.day.localeCompare(b.day));

  return { c: 200, d: lines };
};

// 获取消费类型饼图数据
const getTypePie = async (bookId, param) => {
  const flowList = await queryFlows(bookId, param);
  const sumMap = {};

  if (flowList.length <= 0) {
    return { c: 200, d: [], m: "暂无数据" };
  }
  for (let flow of flowList) {
    sumMap[flow.type] = (sumMap[flow.type] || 0) + Number(flow.money);
  }

  const datas = Object.keys(sumMap).map(
    (type) => new TypePie(type, sumMap[type])
  );

  datas.sort((a, b) => b.typeSum - a.typeSum);

  const result = datas.map(
    (data) => new TypePie(data.type, data.typeSum.toFixed(2))
  );
  return { c: 200, d: result };
};

// 获取支付类型饼图数据
const getPayTypeBar = async (bookId, param) => {
  const flowList = await queryFlows(bookId, param);
  const sumMap = {};

  if (flowList.length <= 0) {
    return { c: 200, d: [], m: "暂无数据" };
  }
  for (let flow of flowList) {
    sumMap[flow.payType] = (sumMap[flow.payType] || 0) + Number(flow.money);
  }

  const datas = Object.keys(sumMap).map(
    (payType) => new TypePie(payType, sumMap[payType])
  );

  datas.sort((a, b) => b.typeSum - a.typeSum);
  const result = datas.map(
    (data) => new TypePie(data.type, data.typeSum.toFixed(2))
  );
  return { c: 200, d: result };
};

// 获取月度统计数据
const monthBar = async (bookId) => {
  const flowList = await readFlows(bookId);
  const sumMap = {};
  const inSumMap = {};
  const zeroSumMap = {};

  if (flowList.length <= 0) {
    return { c: 200, d: [], m: "暂无数据" };
  }
  for (let flow of flowList) {
    const month = flow.day.slice(0, 7);
    const money = Number(flow.money);
    if (flow.flowType === "支出") {
      sumMap[month] = (sumMap[month] || 0) + money;
    } else if (flow.flowType === "收入") {
      inSumMap[month] = (inSumMap[month] || 0) + money;
    } else {
      zeroSumMap[month] = (zeroSumMap[month] || 0) + money;
    }
  }

  // 使用 Set 来保存所有的天数，统一同步横轴
  const allMonths =
    new Set() <
    String >
    [
      ...Object.keys(sumMap),
      ...Object.keys(inSumMap),
      ...Object.keys(zeroSumMap),
    ];

  // 遍历所有的天数，确保 sumMap、inSumMap 和 zeroSumMap 中都有相应的值
  for (const month in allMonths) {
    sumMap[month] = sumMap[month] || 0;
    inSumMap[month] = inSumMap[month] || 0;
    zeroSumMap[month] = zeroSumMap[month] || 0;
  }

  const months = Object.keys(sumMap).map(
    (month) =>
      new TypePie(
        month,
        sumMap[month].toFixed(2),
        inSumMap[month]?.toFixed(2) || "",
        zeroSumMap[month]?.toFixed(2) || ""
      )
  );

  const result = months.sort((a, b) => a.type.localeCompare(b.type));

  return { c: 200, d: result };
};

// 按月统计分析
const monthAnalysis = async (bookId, month) => {
  const monthBarData = await monthBar(bookId);
  console.log("monthBarData", monthBarData);
  if (monthBarData.c != 200) {
    return { c: 500, m: "查询出错" };
  }
  const analysis = { month };
  for (let data of monthBarData.d) {
    if (data.type == month) {
      analysis.outSum = data.typeSum;
      analysis.inSum = data.inSum;
      analysis.zeroSum = data.zeroSum;
    }
  }
  console.log("analysis", analysis);
  if (!analysis.outSum && !analysis.inSum) {
    return analysis;
  }

  const flowParam = {
    bookId,
    startDay: `${month}-01`,
    endDay: `${month}-31`,
    flowType: "支出",
  };
  const typeSum = await getTypePie(bookId, flowParam);
  console.log("typeSum", typeSum);
  analysis.maxType = typeSum[0]?.type || "无";
  analysis.maxTypeSum = typeSum[0]?.typeSum || "0";

  const flowList = await queryFlows(bookId, {
    bookId,
    startDay: `${month}-01`,
    endDay: `${month}-31`,
  });
  console.log("flowList", flowList);
  let maxOutFlow = {};
  let maxInFlow = {};

  for (let flow of flowList) {
    if (
      flow.flowType == "支出" &&
      (!maxOutFlow.money || Number(flow.money) > Number(maxOutFlow.money))
    ) {
      maxOutFlow = flow;
    } else if (
      flow.flowType == "收入" &&
      (!maxInFlow.money || Number(flow.money) > Number(maxInFlow.money))
    ) {
      maxInFlow = flow;
    }
  }

  analysis.maxOut = maxOutFlow;
  analysis.maxIn = maxInFlow;

  // return analysis;
  return { c: 200, d: analysis };
};

module.exports = {
  getDailyLine,
  getTypePie,
  getPayTypeBar,
  monthBar,
  monthAnalysis,
};
