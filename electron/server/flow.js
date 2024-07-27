const {
  readData,
  addDatas,
  deleteAll,
  updateData,
  updateDatas,
} = require("./api.js");

const getFileName = (bookId) => {
  return `flow${bookId}.csv`;
};

// 读取全部流水数据
const readFlows = (bookId) => {
  return readData(getFileName(bookId));
};

// 增加数据
const addFlow = (bookId, flow) => {
  const arr = [];
  arr.push(flow);
  return addDatas(getFileName(bookId), arr);
};

// 批量增加数据
const addFlows = (bookId, flows) => {
  return addDatas(getFileName(bookId), flows);
};

// 删除全部数据
const deleteAllFlow = (bookId) => {
  return deleteAll(getFileName(bookId));
};

// 批量删除数据
const deleteFlows = (bookId, ids) => {
  return deleteDatas(getFileName(bookId), ids);
};

// 修改数据
const updateFlow = (bookId, data) => {
  return updateData(getFileName(bookId), data);
};

const updateFlows = (bookId, flows) => {
  return updateDatas(getFileName(bookId), flows);
};

// 基于查询条件的查询
const queryFlows = async (bookId, query) => {
  const data = await readFlows(bookId);
  let result = data;

  if (query.id) {
    result = result.filter((item) => item.id == query.id);
  }
  if (query.startDay) {
    result = result.filter(
      (item) => new Date(item.day) >= new Date(query.startDay)
    );
  }
  if (query.endDay) {
    result = result.filter(
      (item) => new Date(item.day) <= new Date(query.endDay)
    );
  }
  if (query.flowType) {
    result = result.filter((item) => item.flowType === query.flowType);
  }
  if (query.type) {
    result = result.filter((item) => item.type === query.type);
  }
  if (query.payType) {
    result = result.filter((item) => item.payType === query.payType);
  }
  if (query.name) {
    result = result.filter((item) => item.name.includes(query.name));
  }
  if (query.description) {
    result = result.filter((item) =>
      item.description.includes(query.description)
    );
  }

  // 排序
  if (query.moneySort) {
    result = result.sort((a, b) =>
      query.moneySort === "asc" ? a.money - b.money : b.money - a.money
    );
  }

  // 分页
  const start = (query.pageNum - 1) * query.pageSize;
  const end = start + query.pageSize;

  totalIn = 0;
  totalOut = 0;
  notInOut = 0;
  result.forEach((item) => {
    if (item.flowType == "支出") {
      totalOut += Number(item.money);
    } else if (item.flowType == "收入") {
      totalIn += Number(item.money);
    } else {
      notInOut += Number(item.money);
    }
  });

  pageNum = query.pageNum;
  pageSize = query.pageSize;
  pageData = result.slice(start, end);
  totalCount = result.length;

  return {
    pageNum,
    pageSize,
    pageData,
    totalCount,
    totalIn,
    totalOut,
    notInOut,
  };
};

const importFlows = async (bookId, flag, flows) => {
  if (flag == "overwrite") {
    deleteAllFlow(bookId);
  }
  return addFlows(bookId, flows);
};

module.exports = {
  readFlows,
  queryFlows,
  importFlows,
  addFlow,
  deleteFlows,
  updateFlow,
  updateFlows,
};

// console.log(queryFlows(101, {pageNum:1, pageSize: 10}))
