const { readJsonFile, saveJsonFile } = require("./json.js");
const path = require("path");

// 读取JSON文件
const server_info_file = `server_info.json`;

const getConfigFileName = () => {
  return path.join(__dirname, "config", server_info_file);
};

// 保存修改后的内容到JSON文件
const getServer = () => {
  return readJsonFile(getConfigFileName());
};

const getServerInfo = () => {
  const server = getServer();
  return {
    c: 200,
    m: "",
    d: {
      version: server.version,
      mod: server.mod,
      environment: server.environment,
      openRegister: server.openRegister,
    },
  };
};

const saveServerInfo = (server) => {
  let serverInfo = getServer();
  serverInfo.version = server.version;
  serverInfo.environment = server.environment;
  serverInfo.openRegister = server.openRegister;
  saveJsonFile(getConfigFileName(), serverInfo);
};

module.exports = {
  getServer,
  getServerInfo,
  saveServerInfo,
};
