const { readData, addDatas, deleteDatas, updateData } = require("./api.js");

const getFileName = (bookId) => {
  return `plan${bookId}.csv`;
};

// 读取全部数据
const readPlans = async (bookId) => {
  return await readData(getFileName(bookId));
};

// 增加数据
const addPlan = async (bookId, plan) => {
  const arr = [];
  arr.push(plan);
  return await addDatas(getFileName(bookId), arr);
};

// 批量增加数据
const addPlans = async (bookId, plans) => {
  return await addDatas(getFileName(bookId), plans);
};

// 删除数据
const deletePlan = async (bookId, id) => {
  return await deleteDatas(getFileName(bookId), [id]);
};

// 修改数据
const updatePlan = async (bookId, id, data) => {
  return await updateData(getFileName(bookId), id, data);
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
  return result;
};

module.exports = {
  queryPlans,
  addPlan,
  deletePlan,
  updatePlan,
};
