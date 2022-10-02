// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path');
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './source/preload.js')
    }
  })

  ipcMain.on('reload', (event) => {
      loadConfigFile(mainWindow)
  })

  var menu = Menu.buildFromTemplate([
    {
        label: 'Menu',
        submenu: [
            {label:'DevTools', click() {mainWindow.webContents.openDevTools()}},
            {label:'ReloadConfig', click() {loadConfigFile(mainWindow)} }
        ]
    }
  ])
  Menu.setApplicationMenu(menu); 

  // and load the index.html of the app.
  mainWindow.loadFile('index.html').then(() => {
    loadConfigFile(mainWindow);
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  return mainWindow;
}

const loadConfigFile = (mainWindow) => {
  filepath = path.join(__dirname, 'config.cfg')
    fs.readFile(filepath, 'utf-8', (err, data) => {
        if(err){
            console.log("An error ocurred reading the file :" + err.message);
            return;
        }
  
        // Change how to handle the file content
        console.log("Loaded cfg successfully");
        mainWindow.webContents.send('config-loaded', data);
        var jsonData = JSON.parse(data);
        for (var i in jsonData.csvFiles)
        {
          var csv = jsonData.csvFiles[i];
          console.log("Loading csv file: " + csv);
          loadCSVFile(mainWindow, csv[1]);
        }
    });
}

const loadCSVFile = (mainWindow, filePath) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if(err){
          console.log("An error ocurred reading the file :" + err.message);
            return;
        }
  
        // Change how to handle the file content
        console.log("Loaded csv file " + filePath + " successfully");
        mainWindow.webContents.send('csv-loaded', data);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  let mainWindow = createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.