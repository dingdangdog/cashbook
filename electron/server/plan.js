const serverApi = require("./api.js");

const getFileName = (bookId) => {
  return `plan${bookId}.csv`;
};

class Plan {
  constructor(id, bookId, month, limitMoney, usedMoney, createDate) {
    this.id = id;
    this.bookId = bookId;
    this.month = month;
    this.limitMoney = limitMoney;
    this.usedMoney = usedMoney;
    this.createDate = createDate;
  }
}

// 读取全部数据
const readPlans = async (bookId) => {
  return await serverApi.readData(getFileName(bookId));
};

// 增加数据
const addPlan = async (bookId, plan) => {
  const arr = [];
  arr.push(
    new Plan(
      serverApi.getUUID(),
      bookId,
      plan.month,
      plan.limitMoney,
      plan.usedMoney,
      serverApi.getNow()
    )
  );
  return await serverApi.addDatas(getFileName(bookId), arr);
};

// 批量增加数据
const addPlans = async (bookId, plans) => {
  return await serverApi.addDatas(getFileName(bookId), plans);
};

// 删除数据
const deletePlan = async (bookId, id) => {
  return await serverApi.deleteDatas(getFileName(bookId), [id]);
};

// 修改数据
const updatePlan = async (bookId, id, data) => {
  return await userverApi.pdateData(getFileName(bookId), id, data);
};

// 基于查询条件的查询
const queryPlans = async (bookId, query) => {
  const data = await readPlans(bookId);
  let result = data;

  if (query.id) {
    result = result.filter((item) => item.id == query.id);
  }
  if (query.bookId) {
    result = result.filter((item) => item.bookId == query.bookId);
  }
  if (query.month) {
    result = result.filter((item) => item.month == query.month);
  }
  return serverApi.toResult(200, result);
};

const getPlan = async (bookId, month) => {
  const data = await readPlans(bookId);
  if (month) {
    data = data.filter((item) => item.month == query.month);
  }
  return serverApi.toResult(200, data[0]);
};

module.exports = {
  queryPlans,
  addPlan,
  deletePlan,
  updatePlan,
  getPlan,
};
