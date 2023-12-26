const { app, BrowserWindow, Menu, shell, globalShortcut  } = require("electron");
const child_process = require("child_process");
const { spawn } = require("child_process");
const path = require("path");

let serverWindowPid;
let timeOut;
let window;

function createWindow() {
  // 创建浏览器窗口
  window = new BrowserWindow({
    width: 1200,
    height: 960,
    //绝对路径
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 最大化窗口
  window.maximize()

  window.loadFile(path.join(__dirname, "dist/index.html"));
  // 打开开发者工具
  // 注册 F12 快捷键
  globalShortcut.register('F12', () => {
    window.webContents.openDevTools();
  });

  // 关闭窗口时
  window.on("close", () => {
    clearTimeout(timeOut);
    if (serverWindowPid) {
      // 根据pid停止关闭后台服务
      console.log("killing cashbook-server " + serverWindowPid);
      process.kill(serverWindowPid);
    }
  });
}

async function startServer() {
  const serverName = "cashbook-server";
  // 启动后台服务
  spawn(path.join(__dirname, serverName + ".exe"), [], {});

  timeOut = setTimeout(() => {
    // 获取服务程序PID
    const getWindowPid =
        `Get-Process -Name "` +
        serverName +
        `" | Select-Object -ExpandProperty Id`;
    const getWindow = spawn("powershell.exe", [getWindowPid]);
    getWindow.stdout.on("data", (data) => {
      console.log(`server-pid: ${data}`);

      // 保存后台服务进程的PID
      serverWindowPid = data;
    });
  }, 2000);
}

// 当 Electron 完成初始化时，创建窗口
app.whenReady().then(async () => {
  await startServer();
  // 等待后台服务启动
  await wait(1500);
  createWindow();

  app.on("activate", () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("before-quit", () => {});
});

// 在所有窗口关闭时退出应用程序。
app.on("window-all-closed", () => {
  // 在 macOS 上，应用程序和它们的菜单栏是常见的
  // 保持活动状态，直到用户使用 Cmd + Q 显式退出。
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 线程等待
function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

// 创建自定义菜单
const customMenu = Menu.buildFromTemplate([
  {
    label: 'Window',
    submenu: [
      { label: 'Minimize', click: () => { window.minimize(); } },
      { label: 'Close', click: () => { window.close(); } },
    ]
  },
  {
    label: 'Help',
    submenu: [
      { label: 'Github', click: () => { shell.openExternal('https://github.com/dingdangdog/cashbook-desktop');} }
    ]
  }
]);

// 设置应用菜单
Menu.setApplicationMenu(customMenu);
