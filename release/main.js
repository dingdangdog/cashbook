const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  shell,
} = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let serverWindowPid;
let timeOut;
let win;

// 设置应用程序的默认语言为中文
// app.locale = 'zh-CN';
// app.commandLine.appendSwitch('--lang', 'zh-CN')

function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    // resizable: false, // 设置为 false 禁止缩小
    //绝对路径
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // 最大化窗口
  // win.maximize()

  win.loadFile(path.join(__dirname, "dist/index.html"));

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
  win.webContents.on('before-input-event', (event, input) => {
    // 判断是否按下了 Ctrl 键和鼠标滚轮事件
    if (input.type === 'keyDown' && input.key === 'F12') {
      event.preventDefault();
      // f12 键按下
      win.webContents.openDevTools({ mode: 'detach' })
    }
  });
  win.webContents.on('zoom-changed', (event, input) => {
    event.preventDefault();
    if (event.deltaY > 0) {
      console.log('CTRL + 鼠标滚轮向下滚动');
      // 在这里执行缩小操作或其他你想要的操作
      win.webContents.setZoomFactor(win.webContents.getZoomFactor() - 0.1);
    } else if (event.deltaY < 0) {
      console.log('CTRL + 鼠标滚轮向上滚动');
      // 在这里执行放大操作或其他你想要的操作
      win.webContents.setZoomFactor(win.webContents.getZoomFactor() + 0.1);
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
  }, 1500);
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

// 获取当前菜单
  const currentMenu = Menu.getApplicationMenu();

// 新增一个菜单项到 "Help" 菜单下
  currentMenu.items
      .find(item => item.label === 'Help')
      .submenu
      .append(new MenuItem({
            label: 'Github',
            click: () => { shell.openExternal('https://github.com/dingdangdog/cashbook-desktop'); }
          }
      ));

// 设置应用菜单
  Menu.setApplicationMenu(currentMenu);
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
// const customMenu = Menu.buildFromTemplate([
//   {
//     label: 'Window',
//     submenu: [
//       { label: 'Minimize', click: () => { win.minimize(); } },
//       { label: 'Close', click: () => { win.close(); } },
//     ]
//   },
//   {
//     label: 'View',
//     submenu: [
//       { role: 'zoomIn' },
//       { role: 'zoomOut' },
//       { type: 'separator' },
//       { role: 'toggleDevTools' },
//       { type: 'separator' },
//       { label: 'Close', click: () => { win.close(); } },
//     ]
//   },
//   {
//     label: 'Help',
//     submenu: [
//       { label: 'Github', click: () => { shell.openExternal('https://github.com/dingdangdog/cashbook-desktop');} }
//     ]
//   }
// ]);

