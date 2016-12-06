'use strict';
const isDebugging = (process.env.NODE_ENV == 'development');
const path = require('path');
const url = require('url');
const {
  co
} = require('../../lib/utility.js');
const {
  ipcRenderer,
  remote
} = require('electron');

const {
  BrowserWindow
} = remote;

const {
  addAsyncOn
} = require('../../lib/utility.js');  // the path is relative to index.html
addAsyncOn(ipcRenderer);

const bgUrl = url.format({
  pathname: path.join(__dirname, '../html/bg.html'),
  protocol: 'file:',
  slashes: true
});

let $ = null;
let bgWindow = null;
if (isDebugging) {
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
bgWindow.loadURL(bgUrl);
bgWindow.webContents.on('did-finish-load', function() {
  return init();
});

function init() {
  $ = require('jquery');
  $('.input-btn').on('click', inputOnClick);
  $('.readfile-btn').on('click', readOnClick);
  $(window).on('beforeunload', function() {
    bgWindow.close();
    bgWindow = null;
  });
}

function trigger(gen) {
  return co(gen).catch((e) => {
    if (isDebugging && -1 != e.message.indexOf('Object has been destroyed')) {
      console.error('关掉bg窗口后，窗口实体已经被毁灭，就不要再点击这个按钮了啦。可以刷新');
    }
    console.error(e);
  });
}

function sendToBg(eventName) {
  bgWindow.webContents.send
    .apply(bgWindow.webContents, [ eventName,
                                   BrowserWindow.getFocusedWindow().id ]
                                    .concat(Array.prototype.slice.call(arguments, 1)));
}

// click on input

function inputOnClick() {
  let self = this;
  let input = $('.input-text').val();
  $('.input-text').val('');
  trigger(function *sendInput() {
    sendToBg('input-come', input);
  });
}

ipcRenderer.asyncOn('output-generated', function *(event, msg) {
  if (!msg) return;
  $('.output-content').text($('.output-content').text() + msg);
});

// click on read a file
function readOnClick() {
  trigger(function *readfile() {
    sendToBg('select-file');
  });
}

ipcRenderer.asyncOn('file-selected', function *(event, msg) {
  if (!msg) return;
  $('.readfile-content').text(JSON.stringify(msg));
});
