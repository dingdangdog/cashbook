const { GetFilePath, GetDataDir, SetDataDir, toResult } = require("./api.js");
const { readJsonFile, saveJsonFile } = require("./json.js");
const path = require("path");
const fs = require("fs");

// 读取JSON文件
const defalut_config_file = `server_info.json`;
// 读取可修改的config文件
const server_config_file = `server_config.json`;

// 读取默认配置
const getDefalutConfigFileName = () => {
  return path.join(__dirname, "config", defalut_config_file);
};
// 读取当前系统配置
const getConfigFileName = () => {
  return GetFilePath(server_config_file);
};

// 保存修改后的内容到JSON文件
const getServer = () => {
  return readJsonFile(getDefalutConfigFileName());
};

const getConfig = () => {
  const configPath = getConfigFileName();
  // console.log(configPath);
  if (!fs.existsSync(configPath)) {
    // 文件不存在，读取默认配置并创建
    const server = getServer();
    // console.log(publicConfig);
    if (!server.public.dataPath) {
      server.public.dataPath = GetDataDir();
    }
    fs.writeFileSync(configPath, JSON.stringify(server));
    return server;
  }
  return readJsonFile(configPath);
};

const getPublicConfig = () => {
  const config = getConfig();
  return config.public;
};

const getServerInfo = () => {
  const publicConfig = getPublicConfig();
  return {
    c: 200,
    m: "",
    d: publicConfig,
  };
};

const saveServerInfo = (publicConfig) => {
  const config = getConfig();
  
  if (config.public.dataPath !== publicConfig.dataPath) {
    // console.log(config.public.dataPath, publicConfig.dataPath);
    // 原文件夹文件迁移到目标文件夹
    moveFiles(config.public.dataPath, publicConfig.dataPath, [
      server_config_file,
    ]);
    SetDataDir(publicConfig.dataPath);
  }
  config.public = publicConfig;
  saveJsonFile(getConfigFileName(), config);
  return toResult(200, true, "保存成功");
};

// Helper function to move files from one folder to another, excluding specific files
const moveFiles = (srcDir, destDir, excludedFiles = []) => {
  // Check if destination folder exists, if not create it
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Read the contents of the source directory
  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    // Skip excluded files like 'server_config.json'
    if (excludedFiles.includes(file)) {
      return;
    }

    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    // Check if it's a file or directory
    if (fs.statSync(srcFile).isFile()) {
      // Copy the file to the destination directory
      fs.copyFileSync(srcFile, destFile);
      // Delete the original file after copying
      fs.unlinkSync(srcFile);
    } else {
      // If it's a directory, move recursively
      moveFiles(srcFile, path.join(destDir, file), excludedFiles);
      // Optionally, remove the empty directory after moving its contents
      fs.rmdirSync(srcFile);
    }
  });
};

module.exports = {
  getConfig,
  getServerInfo,
  saveServerInfo,
};
