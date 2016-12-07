'use strict';
const {
  app,
  ipcRenderer,
  remote
} = require('electron');

const {
  BrowserWindow,
  dialog
} = remote;

const {
  addAsyncOn
} = require('../../lib/utility.js');

const {
  startGraphServer,
  sendRequest,
  selectAndReadFile
} = require('../../controllers/controller.js');


addAsyncOn(ipcRenderer);

ipcRenderer.asyncOn('graph-request', function *(event, windowId, request) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield sendRequest(request);
  } catch (e) {
    console.error(e);
    dialog.showErrorBox('查询粗错啦', `${e}`);
  }
  sender.webContents.send('graph-response', content);
});

ipcRenderer.asyncOn('import-map-file', function *(event, windowId) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield selectAndReadFile(sender);
    yield startGraphServer(content.mapdatPath);
  } catch (e) {
    console.error(e);
    content = null;
    dialog.showErrorBox('导入粗错啦', `${e}`);
  }
  sender.webContents.send('map-file-imported', content);
});
