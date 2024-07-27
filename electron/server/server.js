const { readJsonFile, saveJsonFile } = require("./json.js");
const path = require("path");

// 读取JSON文件
const server_info_file = `server_info.json`;

const getConfigFileName = () => {
  return path.join(__dirname, "config", server_info_file);
};

// 保存修改后的内容到JSON文件
const getServerInfo = () => {
  return readJsonFile(getConfigFileName());
};

module.exports = {
  getServerInfo,
};
