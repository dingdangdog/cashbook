const fs = require("fs");

// 读取JSON文件
const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
};

// 保存修改后的内容到JSON文件
const saveJsonFile = (filePath, jsonContent) => {
  try {
    const data = JSON.stringify(jsonContent, null, 2); // 格式化JSON，便于阅读
    fs.writeFileSync(filePath, data, "utf8");
    // console.log("JSON file has been saved.");
  } catch (err) {
    console.error("Error saving JSON file:", err);
  }
};

module.exports = {
  readJsonFile,
  saveJsonFile,
};
