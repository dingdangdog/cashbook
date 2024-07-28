const { readFlows, queryFlows } = require("./flow.js");

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
    if (flow.FlowType === "支出") {
      sumMap[flow.Day] = (sumMap[flow.Day] || 0) + flow.Money;
    } else if (flow.FlowType === "收入") {
      inSumMap[flow.Day] = (inSumMap[flow.Day] || 0) + flow.Money;
    } else {
      zeroSumMap[flow.Day] = (zeroSumMap[flow.Day] || 0) + flow.Money;
    }
  }

  for (let day of Object.keys(inSumMap)) {
    if (!sumMap[day]) sumMap[day] = 0;
    if (!zeroSumMap[day]) zeroSumMap[day] = 0;
  }

  const lines = Object.keys(sumMap).map(
    (day) =>
      new types.DailyLine(
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
    sumMap[flow.Type] = (sumMap[flow.Type] || 0) + flow.Money;
  }

  const datas = Object.keys(sumMap).map(
    (type) => new types.TypeData(type, sumMap[type])
  );

  datas.sort((a, b) => b.typeSum - a.typeSum);

  return datas.map(
    (data) => new types.TypePie(data.type, data.typeSum.toFixed(2))
  );
};

// 获取支付类型饼图数据
const getPayTypeBar = async (bookId, param) => {
  const flowList = await queryFlows(bookId, param);
  const sumMap = {};

  if (flowList.length <= 0) {
    return { c: 200, d: [], m: "暂无数据" };
  }
  for (let flow of flowList) {
    sumMap[flow.PayType] = (sumMap[flow.PayType] || 0) + flow.Money;
  }

  const datas = Object.keys(sumMap).map(
    (payType) => new types.TypeData(payType, sumMap[payType])
  );

  datas.sort((a, b) => b.typeSum - a.typeSum);

  return datas.map(
    (data) => new types.TypePie(data.type, data.typeSum.toFixed(2))
  );
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
    const month = flow.Day.slice(0, 7);
    if (flow.FlowType === "支出") {
      sumMap[month] = (sumMap[month] || 0) + flow.Money;
    } else if (flow.FlowType === "收入") {
      inSumMap[month] = (inSumMap[month] || 0) + flow.Money;
    } else {
      zeroSumMap[month] = (zeroSumMap[month] || 0) + flow.Money;
    }
  }

  for (let month of Object.keys(inSumMap)) {
    if (!sumMap[month]) sumMap[month] = 0;
    if (!zeroSumMap[month]) zeroSumMap[month] = 0;
  }

  const months = Object.keys(sumMap).map(
    (month) =>
      new types.TypePie(
        month,
        sumMap[month].toFixed(2),
        inSumMap[month]?.toFixed(2) || "",
        zeroSumMap[month]?.toFixed(2) || ""
      )
  );

  months.sort((a, b) => a.type.localeCompare(b.type));

  return months;
};

// 按月统计分析
const monthAnalysis = async (bookId, month) => {
  const monthBarData = await monthBar(bookId);
  const analysis = { month };

  for (let data of monthBarData) {
    if (data.type === month) {
      analysis.outSum = data.typeSum;
      analysis.inSum = data.inSum;
      analysis.zeroSum = data.zeroSum;
    }
  }

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
  analysis.maxType = typeSum[0].type;
  analysis.maxTypeSum = typeSum[0].typeSum;

  const flowList = await queryFlows(bookId, {
    bookId,
    startDay: `${month}-01`,
    endDay: `${month}-31`,
  });
  let maxOutFlow = {};
  let maxInFlow = {};

  for (let flow of flowList) {
    if (
      flow.FlowType === "支出" &&
      (!maxOutFlow.Money || flow.Money > maxOutFlow.Money)
    ) {
      maxOutFlow = flow;
    } else if (
      flow.FlowType === "收入" &&
      (!maxInFlow.Money || flow.Money > maxInFlow.Money)
    ) {
      maxInFlow = flow;
    }
  }

  analysis.maxOut = maxOutFlow;
  analysis.maxIn = maxInFlow;

  return analysis;
};

module.exports = {
  getDailyLine,
  getTypePie,
  getPayTypeBar,
  monthBar,
  monthAnalysis,
};
