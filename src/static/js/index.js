'use strict';
const path = require('path');
const url = require('url');

const app = require('electron').app;
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

const {
  BrowserWindow
} = remote;

const {
  addAsyncOn
} = require('../../lib/utility.js');  // the path is relative to index.html

const bgUrl = url.format({
  pathname: path.join(__dirname, '../html/bg.html'),
  protocol: 'file:',
  slashes: true
});

let $ = null;

let bgWindow = null;

const debug = true;
if (debug) {
  bgWindow = new BrowserWindow({
    "show": true,
    "width": 600,
    "height": 600
  });
  bgWindow.webContents.openDevTools();
} else {
  bgWindow = new BrowserWindow({
    "show": false,
    "width": 100,
    "height": 100
  });
}
bgWindow.on('closed', (e) => {
  bgWindow = null;
});

bgWindow.loadURL(bgUrl);
bgWindow.webContents.on('did-finish-load', function() {
  init();
});

function init() {
  $ = require('jquery');
  $('.hi').on('click', sayHi);
}

function sayHi() {
  bgWindow.webContents.send('say-hi-to-front', BrowserWindow.getFocusedWindow().id, 'Front');
}

addAsyncOn(ipcRenderer);
ipcRenderer.asyncOn('say-hi-from-back', function *(event, msg) {
  $('.output').text(msg);
});
