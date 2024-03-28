const { execSync } = require("child_process");
const common = require('./common.ts');
const fs = require("fs");
module.exports = {
  build: () => {
    common.log("🥗 start: build-server 🥗");
    const pre_build_server_script = `cd ./source/server && set GOOS=windows && set GOARCH=amd64`
    console.log("run: " + pre_build_server_script);
    execSync(pre_build_server_script,
      (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }
    );
    console.log("done: " + pre_build_server_script);
    common.log("----------------");

    const build_server_script = `cd ./source/server && go build -ldflags="-H windowsgui" -o cashbook-server.exe`
    console.log("run: " + build_server_script);
    execSync(build_server_script,
      (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }
    );
    console.log("done: " + build_server_script);
    common.log("----------------");

    common.log("🥗 end: build-server 🥗");
  },

  clean: () => {
    common.log("🧺 start: clean-server 🧺");
    const serverBuildFile = "./source/server/cashbook-server.exe";
    if (fs.existsSync(serverBuildFile)) {
      console.log("find " + serverBuildFile + ", start clean server");
      const clean_server_script = `cd ./source/server && del cashbook-server.exe`
      console.log("run: " + clean_server_script);
      execSync(clean_server_script,
        (err, stdout, stderr) => {
          if (err) {
            common.log(err);
            return;
          }
          console.log(`stdout: ${stdout}`);
        }
      );
      console.log("done: " + clean_server_script);
    } else {
      console.log("not found " + serverBuildFile);
    }
    common.log("----------------");
    
    common.log("🧺 end: clean-server 🧺");
  }
}