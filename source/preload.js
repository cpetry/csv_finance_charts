// preload.js

const { contextBridge, ipcRenderer } = require('electron')

const exposedAPI = {
  onConfigLoaded: (callback) => {
    ipcRenderer.on('config-loaded', (event, data) => callback(data));
  },
  onCSVLoaded: (callback) => {
    ipcRenderer.on('csv-loaded', (event, data) => callback(data));
  }
};

contextBridge.exposeInMainWorld("electron", exposedAPI);

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })