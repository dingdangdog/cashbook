const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const handler = require("./handler.js"); // 假设你的函数封装在handler.js中

let serverWindowPid;
let timeOut;
let win;
let mode = "pro";

// 设置应用程序的默认语言为中文
// app.locale = 'zh-CN';
// app.commandLine.appendSwitch('--lang', 'zh-CN')

function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1440,
    height: 960,
    // resizable: false, // 设置为 false 禁止缩小
    //绝对路径
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      nodeIntegration: false, // 关闭 Node.js 集成以增强安全性
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, "preload.js"), // 预加载脚本
    },
    frame: false, // 无边框窗口
    transparent: true, // 透明窗口
  });
  // 最大化窗口
  // win.maximize()

  let indexPath = path.join(__dirname, "dist/index.html");
  if (mode === "dev") {
    indexPath = "./resources/dist/index.html";
  }
  // win.loadFile(indexPath);
  win.loadURL("http://127.0.0.1:9090/");

  // 关闭窗口时
  win.on("close", () => {
    clearTimeout(timeOut);
    if (serverWindowPid) {
      // 根据pid停止关闭后台服务
      console.log("killing cashbook-server " + serverWindowPid);
      process.kill(serverWindowPid);
    }
  });
  // 监听窗口的键盘事件
  win.webContents.on("before-input-event", (event, input) => {
    // 判断是否按下了 Ctrl 键和鼠标滚轮事件
    if (input.type === "keyDown" && input.key === "F12") {
      event.preventDefault();
      // f12 键按下
      win.webContents.openDevTools({ mode: "detach" });
    }
  });
  win.webContents.on("zoom-changed", (event, input) => {
    event.preventDefault();
    if (event.deltaY > 0) {
      console.log("CTRL + 鼠标滚轮向下滚动");
      // 在这里执行缩小操作或其他你想要的操作
      win.webContents.setZoomFactor(win.webContents.getZoomFactor() - 0.1);
    } else if (event.deltaY < 0) {
      console.log("CTRL + 鼠标滚轮向上滚动");
      // 在这里执行放大操作或其他你想要的操作
      win.webContents.setZoomFactor(win.webContents.getZoomFactor() + 0.1);
    }
  });
}

async function startServer() {}

// 当 Electron 完成初始化时，创建窗口
app.whenReady().then(async () => {
  // await startServer();
  // 等待后台服务启动
  // await wait(1500);
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

ipcMain.on("window-control", (event, action) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  switch (action) {
    case "minimize":
      win.minimize();
      break;
    case "maximize":
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      break;
    case "close":
      win.close();
      break;
  }
});

// 处理从渲染进程发来的请求
ipcMain.handle("invoke-handler", async (event, functionName, args) => {
  let argarr = [];
  // console.log("1--", functionName, args);
  if (args) {
    argarr = args.map((item) => {
      try {
        return JSON.parse(item);
      } catch (error) {
        return item;
      }
    });
  }
  console.log("2--", functionName, ...argarr);
  if (handler[functionName]) {
    // console.log("handler");
    return await handler[functionName](...argarr); // 调用 handler.js 中的函数
  } else {
    return { c: 500, m: `Function ${functionName} not found` };
  }
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
