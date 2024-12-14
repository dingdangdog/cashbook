const { getServerInfo, saveServerInfo } = require("./electron/server.js");
const { SetDataDir } = require("./electron/api.js");

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
  uploadInvoice,
  showInvoice,
  deleteInvoice,
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
  getAll,
  updateType,
  arrayContains,
  getTypeConvertConfig,
  saveTypeConvertConfig,
} = require("./electron/type.js");

module.exports = {
  SetDataDir,
  getServerInfo,
  saveServerInfo,

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
  uploadInvoice,
  showInvoice,
  deleteInvoice,

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
  getAll,
  updateType,
  arrayContains,
  getTypeRelation: getTypeConvertConfig,
  saveTypeConvertConfig,
};
