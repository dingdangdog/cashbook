const { readFlows, queryFlows, updateFlows } = require("./flow.js");
const { readJsonFile, saveJsonFile } = require("./json.js");
const { GetFilePath } = require("./api.js");
const fs = require("fs");
const path = require("path");

const getTypeConvertConfig = (bookId) => {
  const fileName = `type_convert${bookId}.json`;
  const filePath = GetFilePath(fileName);
  let config;
  if (!fs.existsSync(filePath)) {
    // 账本类型配置不存在，则读取原始配置数据，创建一个本账本专属的类型配置
    config = readJsonFile(path.join(__dirname, "config/type_convert.json"));
    saveJsonFile(filePath, config);
  } else {
    config = readJsonFile(filePath);
  }
  return { c: 200, d: config };
};

const saveTypeConvertConfig = (bookId, config) => {
  const fileName = `type_convert${bookId}.json`;
  const filePath = GetFilePath(fileName);
  // saveJsonFile(filePath, JSON.parse(config));
  saveJsonFile(filePath, config);
  return { c: 200, d: true };
};

// 获取所有流水类型
const getFlowType = async (bookId) => {
  const flows = await readFlows(bookId);
  const types = new Set();

  flows.forEach((flow) => {
    types.add(flow.flowType);
  });

  return { c: 200, d: Array.from(types) };
};

// 获取所有消费类型
const getExpenseType = async (bookId, flowType) => {
  const flows = await readFlows(bookId);
  const results = [];
  // 提取type属性并去重
  const uniqueTypes = Array.from(
    new Set(
      flows.filter((flow) => flow.flowType == flowType).map((flow) => flow.type)
    )
  );
  for (let type of uniqueTypes) {
    results.push({
      type: "消费类型",
      value: type,
      flowType: flowType,
    });
  }

  results.sort((a, b) => a.flowType.localeCompare(b.flowType));
  return { c: 200, d: results };
};

// 获取所有支付方式
const getPaymentType = async (bookId, flowType) => {
  const flows = await readFlows(bookId);
  const results = [];
  // 提取payType属性并去重
  const uniqueTypes = Array.from(
    new Set(
      flows
        .filter((flow) => flow.flowType == flowType)
        .map((flow) => flow.payType)
    )
  );
  for (let type of uniqueTypes) {
    results.push({
      type: "支付方式",
      value: type,
      flowType: flowType,
    });
  }

  results.sort((a, b) => a.flowType.localeCompare(b.flowType));
  return { c: 200, d: results };
};

// 更新类型
const updateType = async (typer, bookId) => {
  const flowParam = { flowType: typer.flowType };
  if (typer.type === "消费类型") {
    flowParam.type = typer.oldValue;
  } else if (typer.type === "支付方式") {
    flowParam.payType = typer.oldValue;
  }

  const flows = await queryFlows(bookId, flowParam);

  flows.forEach((flow) => {
    if (typer.type === "消费类型") {
      flow.type = typer.value;
    } else if (typer.type === "支付方式") {
      flow.payType = typer.value;
    }
  });

  // 这里需要实现对flows的批量更新
  updateFlows(bookId, flows);

  return { c: 200, d: flows.length };
};

// 示例的 ArrayContains 实现
const arrayContains = (array, value) => {
  return array.includes(value);
};

module.exports = {
  getFlowType,
  getExpenseType,
  getPaymentType,
  updateType,
  arrayContains,
  getTypeConvertConfig,
  saveTypeConvertConfig,
};
