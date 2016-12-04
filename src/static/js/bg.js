const app = require('electron').app;
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

const {
  BrowserWindow
} = remote;

const {
  addAsyncOn
} = require('./utility.js');

const {
  task
} = require('./controller.js');


addAsyncOn(ipcRenderer);
ipcRenderer.asyncOn('say-hi-to-front', function *(event, windowId, name) {
  let sender = BrowserWindow.fromId(windowId);
  let content = null;
  try {
    content = yield task(name);
  } catch(e) {
    content = toString(e);
  }
  sender.webContents.send('say-hi-from-back', content);
});
