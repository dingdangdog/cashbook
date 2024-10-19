const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const csvParser = require("csv-parser");
const { v4: uuidv4 } = require("uuid");

// 系统用户数据文件夹
let DATA_DIR = "";

// 设置数据文件夹
const SetDataDir = (dir) => {
  console.log("SetDataDir", dir);
  // 检查 dir 是否为有效字符串
  if (typeof dir !== "string" || dir.trim() === "") {
    throw new Error("Invalid directory path");
  }

  // D:\\Data
  dir = dir.replace(/\\/g, "/");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // console.log(dir);
  DATA_DIR = dir;
};
const GetDataDir = () => {
  return DATA_DIR;
};
// 获取数据文件路径
const GetFilePath = (fileName) => {
  return path.join(DATA_DIR, fileName);
};

// 通用数据保存函数
const saveData = (data, fileName) => {
  const filePath = GetFilePath(fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
  // console.log(data, fileName);
  // Json to csv
  if (data && data.length > 0) {
    const csv = parse(data, { header: true });
    fs.writeFileSync(filePath, csv);
  } else {
    fs.writeFileSync(filePath, "");
  }
};

// 通用数据读取函数
const readData = (fileName) => {
  const filePath = GetFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};
// 根据ID获取单条数据
const findById = async (fileName, id) => {
  const data = await readData(fileName);
  for (let item of data) {
    if (item.id == id) {
      return item;
    }
  }
  return null;
};

// 数据操作函数示例
// 增加数据
const addDatas = async (fileName, newDatas) => {
  let data = await readData(fileName);
  data = data.concat(newDatas);
  saveData(data, fileName);
};
// 清空数据
const deleteAll = (fileName) => {
  saveData([], fileName);
};

// 批量删除数据
const deleteDatas = async (fileName, ids) => {
  let data = await readData(fileName);
  data = data.filter((item) => !ids.includes(item.id));
  saveData(data, fileName);
};

// 修改数据
const updateData = async (fileName, d) => {
  let data = await readData(fileName);
  data = data.map((item) => (item.id == d.id ? { ...item, ...d } : item));
  saveData(data, fileName);
};
// 批量更新数据
const updateDatas = async (fileName, ds) => {
  let data = await readData(fileName);
  data = data.map((item) => {
    for (let d of ds) {
      return item.id == d.id ? { ...item, ...d } : item;
    }
  });
  saveData(data, fileName);
};
// 生成UUID
const getUUID = () => {
  return uuidv4();
};
// 通用返回数据封装
const toResult = (code, data, msg) => {
  return { c: code, m: msg, d: data };
};
// 获取当前时间
const getNow = () => {
  let fmt = "YYYY-mm-dd HH:MM:SS";
  const date = new Date(); // 默认预先转译一次
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
};

module.exports = {
  saveData,
  readData,
  findById,
  addDatas,
  deleteAll,
  deleteDatas,
  updateData,
  updateDatas,
  getUUID,
  toResult,
  getNow,
  SetDataDir,
  GetDataDir,
  GetFilePath,
};
