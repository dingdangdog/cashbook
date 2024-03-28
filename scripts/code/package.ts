const { execSync } = require("child_process");
const common = require("./common.ts");
const fs = require("fs");
module.exports = {
  package: () => {
    common.log("🥗 start: package exe 🥗");

    /* Electron 打包 */
    const build_electron_script = `cd ./release && npm run package`;
    console.log("run: " + build_electron_script);
    execSync(build_electron_script, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("done: " + build_electron_script);

    
    /* 正式打包x64 */
    const build_inno_script_64 = `ISCC release/cashbook-x64.iss`;
    console.log("run: " + build_inno_script_64);
    execSync(build_inno_script_64, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("done: " + build_inno_script_64);
    common.log("----------------");
    /* 正式打包x86 */
    const build_inno_script_86 = `ISCC release/cashbook-x86.iss`;
    console.log("run: " + build_inno_script_86);
    execSync(build_inno_script_86, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("done: " + build_inno_script_86);

    /* 打包完成，配置该回去 */
    common.log("🥗 end: package exe 🥗");
  },

  clean: () => {
    common.log("🧺 start: clean-release-files 🧺");
    /* 清理 release/resources文件夹 */
    const packageResources = "./release/resources";
    if (fs.existsSync(packageResources)) {
      console.log("find " + packageResources + ", start clean release-files");
      const clean_resources_script = `cd ./release && rd/s/q resources`;
      console.log("run: " + clean_resources_script);
      execSync(clean_resources_script, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
      console.log("done: " + clean_resources_script);
    } else {
      console.log("not found " + packageResources);
    }
    common.log("----------------");

    /* 清理 release/resources文件夹 */
    const electronBuild = "./release/build";
    if (fs.existsSync(electronBuild)) {
      console.log("find " + electronBuild + ", start clean release-files");
      const clean_resources_script = `cd ./release && rd/s/q build`;
      console.log("run: " + clean_resources_script);
      execSync(clean_resources_script, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
      console.log("done: " + clean_resources_script);
    } else {
      console.log("not found " + electronBuild);
    }
    common.log("----------------");

    common.log("🧺 end: clean-release-files 🧺");
  },
  copyFiles: () => {
    common.log("🥗 start: copy-files 🥗");
    /* 修改 api/index.ts 中的配置为打包配置 */
    const books_path = "./source/books/dist";
    const server_configs = "./source/server/resources/app/config";
    const server = "./source/server/cashbook-server.exe";

    const package_path = "./release/resources";

    if (!fs.existsSync(package_path)) {
      fs.mkdirSync(package_path);
    }
    // 如果目标文件夹不存在，则创建目标文件夹
    common.copyPath(books_path, package_path + "/dist");
    console.log("done copy " + books_path + " to " + package_path);
    common.copyPath(server_configs, package_path + "/config");
    console.log("done copy " + server_configs + " to " + package_path);
    common.copyFile(server, package_path + "/cashbook-server.exe");
    console.log("done copy " + server + " to " + package_path);

    console.log("done copy all build files");

    /* 打包完成，配置该回去 */
    common.log("🥗 end: copy-files 🥗");
  }
};
