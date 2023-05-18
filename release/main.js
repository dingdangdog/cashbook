const { app, BrowserWindow } = require('electron');
const child_process = require('child_process');
const { spawn} = require('child_process');
const path = require('path')

let serverWindowPid;
let timeOut;

function createWindow () {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    //绝对路径
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  win.loadURL('http://localhost:8088')

  // 关闭窗口时
  win.on('close', (code) => {
    stopNginx()
    clearTimeout(timeOut);
    if (serverWindowPid) {
      // 根据pid停止关闭后台服务
      console.log('killing cashbook-server ' + serverWindowPid);
      process.kill(serverWindowPid);
    }
  })
}

async function startServer(){
  // 设置为生产模式
  // child_process.exec("set GIN_MODE=release")

  const serverName = "cashbook-server";
  // const serverPath = path.join(__dirname, ('/server/' + serverName + '.exe'));
  // 启动后台服务
  spawn('./server/' + serverName, [] , {})
  
  timeOut = setTimeout(() => {
    // 获取服务程序PID
    const getWindowPid = `Get-Process -Name "` + serverName + `" | Select-Object -ExpandProperty Id`;
    const getWindow = spawn('powershell.exe', [getWindowPid]);
    getWindow.stdout.on('data', (data) => {
      console.log(`server-pid: ${data}`);
      
    // 保存后台服务进程的PID
      serverWindowPid = data;
    })
  }, 2000);
}

function startNginx(){
  child_process.exec("cd nginx && nginx -c conf/nginx.conf")
}

function stopNginx(){
  child_process.exec("cd nginx && nginx -s stop")
}

// 当 Electron 完成初始化时，创建窗口
app.whenReady().then(async () => {
  await startServer()
  // 等待后台服务启动
  await wait(1500);
  startNginx()
  createWindow()

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.on('before-quit', ()=> {
    stopNginx()
  })
})


// 在所有窗口关闭时退出应用程序。
app.on('window-all-closed', () => {
  // 在 macOS 上，应用程序和它们的菜单栏是常见的
  // 保持活动状态，直到用户使用 Cmd + Q 显式退出。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 线程等待
function wait(ms) {
  return new Promise(resolve =>setTimeout(() => resolve(), ms));
};

