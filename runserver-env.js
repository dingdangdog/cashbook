require("dotenv").config();
const { exec } = require("child_process");
// 执行Go程序
exec("cd server && go run .", (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
