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
  task,
  dealWithInput,
  selectAndReadFile
} = require('../../controllers/controller.js');


addAsyncOn(ipcRenderer);

ipcRenderer.asyncOn('input-come', function *(event, windowId, input) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield dealWithInput(input);
  } catch (e) {
    console.error(e);
    content = `${e}`;
  }
  sender.webContents.send('output-generated', content);
});

ipcRenderer.asyncOn('import-map-file', function *(event, windowId) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield selectAndReadFile(sender);
    yield dealWithInput();
  } catch (e) {
    console.error(e);
    content = null;
    dialog.showErrorBox('粗错啦', `${e}`);
  }
  sender.webContents.send('map-file-imported', content);
});
