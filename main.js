const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const handler = require("./handler.js"); // 假设你的函数封装在handler.js中
require("dotenv").config(); // Load environment variables from .env file

let win;

if (process.env.NODE_ENV === "development") {
  handler.SetUserPath(__dirname);
} else {
  console.log(app.getPath("userData"));
  handler.SetUserPath(app.getPath("userData"));
}
function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1660,
    height: 960,
    //绝对路径加载图标
    icon: path.join(__dirname, "icon/icon.ico"),
    webPreferences: {
      nodeIntegration: false, // 关闭 Node.js 集成以增强安全性
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, "preload.js"), // 预加载脚本
    },
    frame: false, // 无边框窗口
    transparent: true, // 透明窗口
    // resizable: false, // 禁止拖拽放大缩小
    maximizable: true, // 允许最大化
  });
  // 默认最大化窗口
  // win.maximize();

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:9090/");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "ui/index.html"));
  }

  // 关闭窗口时
  win.on("close", () => {
    console.log("exit docash");
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

// 当 Electron 完成初始化时，创建窗口
app.whenReady().then(async () => {
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
    case "restore-window":
      win.restore();
      break;
  }
});
ipcMain.handle("is-maximized", () => {
  return win.isMaximized();
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
  if (process.env.NODE_ENV === "development") {
    console.log("server", functionName);
  }
  if (handler[functionName]) {
    // console.log("handler");
    return await handler[functionName](...argarr); // 调用 handler.js 中的函数
  } else {
    return { c: 500, m: `Function ${functionName} not found` };
  }
});
