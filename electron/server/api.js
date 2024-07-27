const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const csvParser = require("csv-parser");

// 通用数据保存函数
const saveData = (data, fileName) => {
  const dirPath = path.join(__dirname, "data");
  const filePath = path.join(dirPath, fileName);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }

  const csv = parse(data, { header: true });
  fs.writeFileSync(filePath, csv);
};

// 通用数据读取函数
const readData = (fileName) => {
  const dirPath = path.join(__dirname, "data");
  const filePath = path.join(dirPath, fileName);

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

const findById = async (fileName, id) => {
  const data = await readData(fileName);
  data.forEach((item) => {
    if (item.id == id) {
      return item;
    }
  });
  return null;
};

// 数据操作函数示例
// 增加数据
const addDatas = async (fileName, newDatas) => {
  const data = await readData(fileName);
  data.concat(newDatas);
  saveData(data, fileName);
};

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

const updateDatas = async (fileName, ds) => {
  let data = await readData(fileName);
  data = data.map((item) => {
    for (let d of ds) {
      return item.id == d.id ? { ...item, ...d } : item;
    }
  });
  saveData(data, fileName);
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
};
