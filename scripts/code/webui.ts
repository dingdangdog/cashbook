const { execSync } = require("child_process");
const common = require("./common.ts");
const fs = require("fs");
module.exports = {
  build: (docker = false) => {
    common.log("🥗 start: build-books 🥗");
    const axiosPath = "./webui/src/api/index.ts";
    const axiosInfo = fs.readFileSync(axiosPath, { encoding: "utf-8" });
    const viteConfigPath = "./webui/vite.config.ts";
    const viteConfig = fs.readFileSync(viteConfigPath, { encoding: "utf-8" });
    if (!docker){
      /* 不是docker版本构建修改 api/index.ts 中的配置为打包配置 */
      const buildAxiosInfo = axiosInfo.replace("'/api',", "'http://127.0.0.1:13303/api',");
      console.log(`replace ${axiosPath} '/api', to 'http://127.0.0.1:13303/api',`);
      fs.writeFileSync(axiosPath, buildAxiosInfo, { encoding: "utf-8" });
      
      // docker 需要'/', electron本地访问需要'./',
      const buildViteConfig = viteConfig.replace("'/',", "'./',");
      console.log(`replace ${viteConfigPath} '/', to './',`);
      fs.writeFileSync(viteConfigPath, buildViteConfig, { encoding: "utf-8" });
      common.log("----------------");
    }

    /* 正式打包 */
    const build_books_script = `cd ./webui && npm run build-only`;
    console.log("run: " + build_books_script);
    execSync(build_books_script, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("done: " + build_books_script);
    common.log("----------------");

    /* 打包完成，配置该回去 */
    fs.writeFileSync(axiosPath, axiosInfo, { encoding: "utf-8" });
    fs.writeFileSync(viteConfigPath, viteConfig, { encoding: "utf-8" });
    common.log("🥗 end: build-books 🥗");
  },

  clean: () => {
    common.log("🧺 start: clean-books 🧺");
    const booksDistPath = "./webui/dist";
    if (fs.existsSync(booksDistPath)) {
      console.log("find " + booksDistPath + ", start clean books");
      const clean_books_script = `cd ./webui && rd/s/q dist`;
      console.log("run: " + clean_books_script);
      execSync(clean_books_script, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
      console.log("done: " + clean_books_script);
    } else {
      console.log("not found " + booksDistPath);
    }
    common.log("----------------");

    common.log("🧺 end: clean-books 🧺");
  },
};
