const { app, BrowserWindow } = require('electron');
const child_process = require('child_process');
const { spawn} = require('child_process');
const path = require('path')

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
  win.on('closed', () => {
    stopNginx()
  })
}

async function startServer(){
  const script = 'cd server && start /B cashbook-server.exe /c';
  await child_process.exec(script, { windowsHide: true })
  // const child = spawn('cashbook-server.exe', [], {
  //   cwd: path.join(__dirname, '/server'),
  //   detached: true,
  // });
  
}

function stopServer(){
  // TODO 以下方式无法停止，需要思考其他方式
  child_process.exec("taskkill /IM cashbook-server.exe /F")
  // 设置需要运行的命令和参数
  // const command = 'runas';
  // const args = ['/user:Administrator', 'taskkill', '/IM', 'cashbook-server.exe', '/F'];

  // // 以管理员权限运行命令
  // const stopServer = spawn(command, args, {
  //   shell: true,
  //   stdio: 'inherit'
  // });
}

function startNginx(){
  child_process.exec("cd nginx && nginx -c conf/nginx.conf")
}

function stopNginx(){
  child_process.exec("cd nginx && nginx -s stop")
}

// 当 Electron 完成初始化时，创建窗口
app.whenReady().then(() => {
  startServer()
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
    stopServer()
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


