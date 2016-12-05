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
  selectAndReadFile
} = require('../../controllers/controller.js');


addAsyncOn(ipcRenderer);
ipcRenderer.asyncOn('say-hi-to-front', function *(event, windowId, name) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield task(name);
  } catch(e) {
    content = `${e}`;
  }
  sender.webContents.send('say-hi-from-back', content);
});

ipcRenderer.asyncOn('select-file', function *(event, windowId, name) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield selectAndReadFile(sender);
  } catch(e) {
    content = `${e}`;
  }
  sender.webContents.send('file-selected', content);
});
