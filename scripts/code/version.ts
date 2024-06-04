const { execSync } = require("child_process");
const common = require("./common.ts");
const fs = require("fs");

const filesToUpdate = [
  "./webui/package.json",
  "./server/resources/app/config/server.json",
  "./electron/package.json",
  "Dockerfile",
];

module.exports = {
  upgrade: () => {
    common.log("🥗 start: upgrade version 🥗");

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    // 获取当前版本号
    const currentVersion = packageJson.version;
    // 将版本号拆分成数组
    const versionParts = currentVersion.split(".");
    let major = parseInt(versionParts[0]);
    let minor = parseInt(versionParts[1]);
    let patch = parseInt(versionParts[2]);
    // 修改版本号
    patch++; // 将 patch 版本号加一

    const nextVersion = `${major}.${minor}.${patch}`;
    // 更新 package.json 中的版本号
    packageJson.version = nextVersion;

    // 将更新后的 package.json 写回文件
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2), {
      encoding: "utf-8",
    });
    filesToUpdate.forEach((file) => {
      common.replaceInFile(file, `"${currentVersion}"`, `"${nextVersion}"`);
      console.log(`done: upgrade ${file} from "${currentVersion}" to "${nextVersion}"`);
    });
    common.log("----------------");

    common.log("🥗 end: upgrade all version 🥗");
  },

  reduce: () => {
    common.log("🧺 start: reduce version 🧺");

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    const currentVersion = packageJson.version;
    const versionParts = currentVersion.split(".");
    let major = parseInt(versionParts[0]);
    let minor = parseInt(versionParts[1]);
    let patch = parseInt(versionParts[2]);
    patch--; // 将 patch 版本号减一

    const preVersion = `${major}.${minor}.${patch}`;
    packageJson.version = preVersion;
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2), {
      encoding: "utf-8",
    });
    filesToUpdate.forEach((file) => {
      common.replaceInFile(file, `"${currentVersion}"`, `"${preVersion}"`);
      console.log(
        `done: reduce ${file} from "${currentVersion}" to "${preVersion}"`
      );
    });
    common.log("----------------");

    common.log("🧺 end: reduce version 🧺");
  },
};
