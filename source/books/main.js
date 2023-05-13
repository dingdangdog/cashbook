const { app, BrowserWindow } = require('electron');

function createWindow () {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // const distPath = path.join(__dirname, 'dist')
  // 加载应用的 index.html
  // win.loadFile('E:/codes/dingdangdog/cashbook/source/books/dist/index.html')
  win.loadURL('http://localhost:8088')

  // 关闭窗口时
  win.on('closed', () => {
  })
}

// 当 Electron 完成初始化时，创建窗口
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
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