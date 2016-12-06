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
    content = `${e}`;
  }
  sender.webContents.send('output-generated', content);
});

ipcRenderer.asyncOn('select-file', function *(event, windowId) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield selectAndReadFile(sender);
  } catch (e) {
    content = `${e}`;
  }
  if (content instanceof Error) {
    dialog.showErrorBox('粗错啦', content.message);
    content = null;
  }
  sender.webContents.send('file-selected', content);
});
