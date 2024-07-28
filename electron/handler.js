const { getVersion } = require("./server/server.js");

const {
  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
  checkUser,
} = require("./server/user.js");

const {
  queryBooks,
  addBook,
  deleteBook,
  updateBook,
  checkBook,
} = require("./server/book.js");

const {
  queryFlows,
  importFlows,
  addFlow,
  deleteFlows,
  updateFlow,
  queryFlowPage,
} = require("./server/flow.js");

const {
  getDailyLine,
  getTypePie,
  getPayTypeBar,
  monthBar,
  monthAnalysis,
} = require("./server/analysis.js");

const {
  queryPlans,
  addPlan,
  deletePlan,
  updatePlan,
  getPlan,
} = require("./server/plan.js");

const {
  getFlowType,
  getExpenseType,
  getPaymentType,
  updateType,
  arrayContains,
  getTypeConvertConfig,
  saveTypeConvertConfig,
} = require("./server/type.js");

module.exports = {
  getVersion,

  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
  checkUser,

  queryBooks,
  addBook,
  deleteBook,
  updateBook,
  checkBook,

  queryFlows,
  importFlows,
  addFlow,
  deleteFlows,
  updateFlow,
  queryFlowPage,

  dailyLine: getDailyLine,
  typePie: getTypePie,
  payTypeBar: getPayTypeBar,
  monthBar,
  monthAnalysis,

  queryPlans,
  addPlan,
  deletePlan,
  updatePlan,
  getPlan,

  getFlowType,
  getExpenseType,
  getPaymentType,
  updateType,
  arrayContains,
  getTypeRelation: getTypeConvertConfig,
  saveTypeConvertConfig,
};
