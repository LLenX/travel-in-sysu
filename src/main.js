// Based on [electron-quick-start](https://github.com/electron/electron-quick-start)
'use strict';
const isDebugging = (process.env.NODE_ENV == 'development');
const path = require('path');
const url = require('url');
const {
  app,
  BrowserWindow
} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
const mainUrl = url.format({
  pathname: path.join(__dirname, 'views/html/index.html'),
  protocol: 'file:',
  slashes: true
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    "width": 1024,
    "height": 768
  });

  // and load the index.html of the app.
  mainWindow.loadURL(mainUrl);

  if (isDebugging) {
    mainWindow.webContents.toggleDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
