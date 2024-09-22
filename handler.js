const { getVersion } = require("./electron/server.js");
const { SetUserPath } = require("./electron/api.js");

const {
  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
  checkUser,
  resetPassword,
} = require("./electron/user.js");

const {
  queryBooks,
  addBook,
  deleteBook,
  updateBook,
  checkBook,
} = require("./electron/book.js");

const {
  queryFlows,
  importFlows,
  addFlow,
  deleteFlows,
  updateFlow,
  queryFlowPage,
  getFlowList,
} = require("./electron/flow.js");

const {
  getDailyLine,
  getTypePie,
  getPayTypeBar,
  monthBar,
  monthAnalysis,
} = require("./electron/analysis.js");

const {
  queryPlans,
  addPlan,
  deletePlan,
  updatePlan,
  getPlan,
} = require("./electron/plan.js");

const {
  getFlowType,
  getExpenseType,
  getPaymentType,
  updateType,
  arrayContains,
  getTypeConvertConfig,
  saveTypeConvertConfig,
} = require("./electron/type.js");

module.exports = {
  SetUserPath,
  getVersion,

  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
  checkUser,
  resetPassword,

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
  getFlowList,

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
