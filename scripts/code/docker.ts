const { execSync } = require("child_process");
const common = require("./common.ts");
const fs = require("fs");
module.exports = {
  build: () => {
    common.log("🥗 start: docker-build 🥗");
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    /* 正式打包 */
    const docker_build_script = `docker build -t dingdangdog/cashbook:${packageJson.version} .`;
    console.log("run: " + docker_build_script);
    execSync(docker_build_script, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("done: " + docker_build_script);
    common.log("----------------");

    /* 正式打包 */
    const docker_build_script2 = `docker build -t dingdangdog/cashbook:latest .`;
    console.log("run: " + docker_build_script2);
    execSync(docker_build_script2, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
    });
    console.log("done: " + docker_build_script2);
    common.log("----------------");

    common.log("🥗 end: docker-build 🥗");
  },

  clean: () => {
    common.log("🧺 start: clean-books 🧺");
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    /* 正式打包 */
    const docker_clean_script = `docker rmi dingdangdog/cashbook:${packageJson.version}`;
    console.log("run: " + docker_clean_script);
    execSync(docker_clean_script, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("done: " + docker_clean_script);
    common.log("----------------");

    common.log("🧺 end: clean-books 🧺");
  },
};
