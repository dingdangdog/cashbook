const path = require("path");
const fs = require("fs");

const copyPath = (sourcePath, targetPath) => {
  
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath);
  }
  // 读取源文件夹中的所有文件和子文件夹
  const files = fs.readdirSync(sourcePath);

  // 遍历文件和子文件夹
  files.forEach((file) => {
    const currentSource = path.join(sourcePath, file);
    const currentTarget = path.join(targetPath, file);

    // 如果是文件夹，则递归复制文件夹
    if (fs.statSync(currentSource).isDirectory()) {
      copyPath(currentSource, currentTarget);
    } else {
      // 如果是文件，则复制文件
      copyFile(currentSource, currentTarget);
    }
  });
}
const copyFile = (sourceFile, targetFile) => {
  // 如果目标文件夹不存在，则创建目标文件夹
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  console.log(`copy ${sourceFile} to ${targetFile}`);
  fs.copyFileSync(sourceFile, targetFile);
}

module.exports = {
  log: (str) => {
    console.log("---- " + str + " ----\n");
  },
  copyPath,
  copyFile,
  replaceInFile: (filePath, searchValue, replaceValue) => {
    // search  and replace value in file
    const data = fs.readFileSync(filePath, 'utf8');
    const result = data.replace(searchValue, replaceValue);
    fs.writeFileSync(filePath, result, { encoding: "utf-8" });
  }
};
