const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  minimize: () => ipcRenderer.send("window-control", "minimize"),
  maximize: () => ipcRenderer.send("window-control", "maximize"),
  close: () => ipcRenderer.send("window-control", "close"),
});

contextBridge.exposeInMainWorld("api", {
  invokeHandler: (functionName, ...args) => {
    ipcRenderer.invoke("invoke-handler", functionName, ...args);
  },
});
