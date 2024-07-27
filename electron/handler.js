const { getServerInfo } = require("./server/server.js");

const {
  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
} = require("./server/user.js");

const {
  queryBooks,
  addBook,
  deleteBook,
  updateBook,
} = require("./server/book.js");

const {
  queryFlows,
  importFlows,
  addFlow,
  deleteFlows,
  updateFlow,
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
  getServerInfo,

  register,
  login,
  changePassword,
  readUsers,
  deleteUser,

  queryBooks,
  addBook,
  deleteBook,
  updateBook,

  queryFlows,
  importFlows,
  addFlow,
  deleteFlows,
  updateFlow,

  getDailyLine,
  getTypePie,
  getPayTypeBar,
  monthBar,
  monthAnalysis,

  queryPlans,
  addPlan,
  deletePlan,
  updatePlan,

  getFlowType,
  getExpenseType,
  getPaymentType,
  updateType,
  arrayContains,
  getTypeConvertConfig,
  saveTypeConvertConfig,
};
